const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const { auth } = require('../middleware/auth');
const Lecture = require('../models/Lecture');
const { processPPTX, processPDF } = require('../services/fileProcessor');
const { generateLectureContent } = require('../services/aiService');
const { generateSpeech } = require('../services/ttsService');

const router = express.Router();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pptx,pdf').split(',');
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${allowedTypes.join(', ')} files are allowed`));
    }
  }
});

// Upload file and process lecture
router.post('/lecture/:lectureId', auth, upload.single('file'), async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { language, aiPrompt } = req.body;

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    // Find and verify lecture ownership
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        error: 'Lecture not found'
      });
    }

    if (!lecture.owner.equals(req.user._id)) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Update lecture with file info and set status to processing
    const fileType = req.file.originalname.split('.').pop().toLowerCase();
    const fileName = `${Date.now()}-${req.file.originalname}`;
    
    await Lecture.findByIdAndUpdate(lectureId, {
      'originalFile.fileName': req.file.originalname,
      'originalFile.fileType': fileType,
      'originalFile.fileSize': req.file.size,
      status: 'processing',
      processingProgress: 10
    });

    // Upload file to S3
    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `lectures/${lectureId}/${fileName}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'private'
    };

    const s3Result = await s3.upload(s3Params).promise();

    // Update lecture with S3 URL
    await Lecture.findByIdAndUpdate(lectureId, {
      'originalFile.fileUrl': s3Result.Location,
      processingProgress: 20
    });

    // Process file based on type
    let slides = [];
    if (fileType === 'pptx') {
      slides = await processPPTX(req.file.buffer);
    } else if (fileType === 'pdf') {
      slides = await processPDF(req.file.buffer);
    }

    // Update lecture with slides
    await Lecture.findByIdAndUpdate(lectureId, {
      slides: slides.map((slide, index) => ({
        slideNumber: index + 1,
        imageUrl: slide.imageUrl,
        content: slide.content
      })),
      processingProgress: 40
    });

    // Generate AI content for each slide
    const basePrompt = process.env.BASE_LECTURE_PROMPT;
    const customPrompt = aiPrompt || '';
    const fullPrompt = `${basePrompt}\n\n${customPrompt}`;

    const processedSlides = [];
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      
      // Generate AI script for the slide
      const aiScript = await generateLectureContent(
        slide.content,
        fullPrompt,
        language
      );

      // Generate speech for the script
      const audioUrl = await generateSpeech(aiScript, language);

      processedSlides.push({
        slideNumber: i + 1,
        imageUrl: slide.imageUrl,
        content: slide.content,
        aiScript,
        audioUrl,
        duration: 0 // Will be calculated based on audio length
      });

      // Update progress
      const progress = 40 + ((i + 1) / slides.length) * 40;
      await Lecture.findByIdAndUpdate(lectureId, {
        processingProgress: Math.round(progress)
      });
    }

    // Calculate total duration and finalize lecture
    const totalDuration = processedSlides.reduce((sum, slide) => sum + slide.duration, 0);
    
    await Lecture.findByIdAndUpdate(lectureId, {
      slides: processedSlides,
      totalDuration,
      status: 'ready',
      processingProgress: 100,
      'metadata.slideCount': processedSlides.length,
      'metadata.processingTime': Date.now() - lecture.createdAt
    });

    res.json({
      message: 'Lecture processed successfully',
      lectureId,
      slides: processedSlides
    });

  } catch (error) {
    console.error('File upload error:', error);
    
    // Update lecture status to error if lectureId exists
    if (req.params.lectureId) {
      await Lecture.findByIdAndUpdate(req.params.lectureId, {
        status: 'error',
        errorMessage: error.message
      });
    }

    res.status(500).json({
      error: 'File upload failed',
      message: error.message
    });
  }
});

// Get upload progress
router.get('/progress/:lectureId', auth, async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        error: 'Lecture not found'
      });
    }

    if (!lecture.owner.equals(req.user._id)) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    res.json({
      status: lecture.status,
      progress: lecture.processingProgress,
      errorMessage: lecture.errorMessage
    });
  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch progress',
      message: error.message
    });
  }
});

// Delete uploaded file
router.delete('/lecture/:lectureId', auth, async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        error: 'Lecture not found'
      });
    }

    if (!lecture.owner.equals(req.user._id)) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Delete file from S3 if it exists
    if (lecture.originalFile.fileUrl) {
      const key = lecture.originalFile.fileUrl.split('/').slice(-2).join('/');
      await s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `lectures/${key}`
      }).promise();
    }

    // Delete lecture from database
    await Lecture.findByIdAndDelete(lectureId);

    res.json({
      message: 'Lecture and file deleted successfully'
    });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete file',
      message: error.message
    });
  }
});

module.exports = router;
