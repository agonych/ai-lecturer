const express = require('express');
const Lecture = require('../models/Lecture');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create new lecture
router.post('/', auth, async (req, res) => {
  try {
    const { name, language, aiPrompt } = req.body;

    const lecture = new Lecture({
      name,
      language,
      aiPrompt,
      owner: req.user._id,
      status: 'uploading'
    });

    await lecture.save();

    res.status(201).json({
      message: 'Lecture created successfully',
      lecture
    });
  } catch (error) {
    console.error('Lecture creation error:', error);
    res.status(500).json({
      error: 'Failed to create lecture',
      message: error.message
    });
  }
});

// Get all lectures for current user
router.get('/', auth, async (req, res) => {
  try {
    const { status, language, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { owner: req.user._id };
    if (status) filter.status = status;
    if (language) filter.language = language;

    const lectures = await Lecture.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('owner', 'username firstName lastName');

    const total = await Lecture.countDocuments(filter);

    res.json({
      lectures,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Lecture fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch lectures',
      message: error.message
    });
  }
});

// Get public lectures
router.get('/public', async (req, res) => {
  try {
    const { language, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { isPublic: true, status: 'ready' };
    if (language) filter.language = language;

    const lectures = await Lecture.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('owner', 'username firstName lastName');

    const total = await Lecture.countDocuments(filter);

    res.json({
      lectures,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Public lecture fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch public lectures',
      message: error.message
    });
  }
});

// Get single lecture by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id)
      .populate('owner', 'username firstName lastName');

    if (!lecture) {
      return res.status(404).json({
        error: 'Lecture not found'
      });
    }

    // Check if user can access this lecture
    if (!lecture.owner._id.equals(req.user._id) && !lecture.isPublic) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    res.json({ lecture });
  } catch (error) {
    console.error('Lecture fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch lecture',
      message: error.message
    });
  }
});

// Update lecture
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, language, aiPrompt, isPublic, tags } = req.body;

    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({
        error: 'Lecture not found'
      });
    }

    // Check ownership
    if (!lecture.owner.equals(req.user._id)) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Only allow updates for certain statuses
    if (lecture.status === 'ready') {
      return res.status(400).json({
        error: 'Cannot update completed lecture'
      });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (language !== undefined) updates.language = language;
    if (aiPrompt !== undefined) updates.aiPrompt = aiPrompt;
    if (isPublic !== undefined) updates.isPublic = isPublic;
    if (tags !== undefined) updates.tags = tags;

    const updatedLecture = await Lecture.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('owner', 'username firstName lastName');

    res.json({
      message: 'Lecture updated successfully',
      lecture: updatedLecture
    });
  } catch (error) {
    console.error('Lecture update error:', error);
    res.status(500).json({
      error: 'Failed to update lecture',
      message: error.message
    });
  }
});

// Update lecture status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, processingProgress, errorMessage } = req.body;

    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({
        error: 'Lecture not found'
      });
    }

    // Check ownership
    if (!lecture.owner.equals(req.user._id)) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (processingProgress !== undefined) updates.processingProgress = processingProgress;
    if (errorMessage !== undefined) updates.errorMessage = errorMessage;

    const updatedLecture = await Lecture.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Lecture status updated successfully',
      lecture: updatedLecture
    });
  } catch (error) {
    console.error('Lecture status update error:', error);
    res.status(500).json({
      error: 'Failed to update lecture status',
      message: error.message
    });
  }
});

// Update lecture slides
router.patch('/:id/slides', auth, async (req, res) => {
  try {
    const { slides, totalDuration } = req.body;

    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({
        error: 'Lecture not found'
      });
    }

    // Check ownership
    if (!lecture.owner.equals(req.user._id)) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    const updates = {};
    if (slides !== undefined) updates.slides = slides;
    if (totalDuration !== undefined) updates.totalDuration = totalDuration;

    const updatedLecture = await Lecture.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Lecture slides updated successfully',
      lecture: updatedLecture
    });
  } catch (error) {
    console.error('Lecture slides update error:', error);
    res.status(500).json({
      error: 'Failed to update lecture slides',
      message: error.message
    });
  }
});

// Delete lecture
router.delete('/:id', auth, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({
        error: 'Lecture not found'
      });
    }

    // Check ownership
    if (!lecture.owner.equals(req.user._id)) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    await Lecture.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Lecture deleted successfully'
    });
  } catch (error) {
    console.error('Lecture deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete lecture',
      message: error.message
    });
  }
});

module.exports = router;
