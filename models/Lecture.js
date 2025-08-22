const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
  slideNumber: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  aiScript: {
    type: String,
    default: ''
  },
  audioUrl: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 0 // in seconds
  }
});

const lectureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalFile: {
    fileName: String,
    fileUrl: String,
    fileType: {
      type: String,
      enum: ['pptx', 'pdf'],
      required: true
    },
    fileSize: Number
  },
  language: {
    type: String,
    enum: ['english', 'russian', 'spanish', 'french', 'german'],
    required: true
  },
  slides: [slideSchema],
  status: {
    type: String,
    enum: ['uploading', 'processing', 'generating', 'ready', 'error'],
    default: 'uploading'
  },
  processingProgress: {
    type: Number,
    default: 0, // 0-100
    min: 0,
    max: 100
  },
  aiPrompt: {
    type: String,
    default: ''
  },
  totalDuration: {
    type: Number,
    default: 0 // total lecture duration in seconds
  },
  metadata: {
    slideCount: {
      type: Number,
      default: 0
    },
    processingTime: Number, // in milliseconds
    aiModel: String,
    ttsModel: String
  },
  errorMessage: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
lectureSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for slide count
lectureSchema.virtual('slideCount').get(function() {
  return this.slides.length;
});

// Index for better query performance
lectureSchema.index({ owner: 1, status: 1 });
lectureSchema.index({ createdAt: -1 });
lectureSchema.index({ language: 1 });

module.exports = mongoose.model('Lecture', lectureSchema);
