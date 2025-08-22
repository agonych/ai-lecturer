import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  ArrowLeft,
  Clock,
  User,
  Globe,
  Calendar,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

const LectureViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const audioRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    fetchLecture();
  }, [id]);

  useEffect(() => {
    if (lecture && lecture.slides && lecture.slides[currentSlide]) {
      const slide = lecture.slides[currentSlide];
      if (slide.audioUrl && audioRef.current) {
        audioRef.current.src = slide.audioUrl;
        audioRef.current.load();
      }
    }
  }, [currentSlide, lecture]);

  useEffect(() => {
    if (isPlaying) {
      startProgressTracking();
    } else {
      stopProgressTracking();
    }
  }, [isPlaying]);

  const fetchLecture = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/lectures/${id}`);
      setLecture(response.data.lecture);
      
      if (response.data.lecture.slides && response.data.lecture.slides.length > 0) {
        setDuration(response.data.lecture.totalDuration || 0);
      }
    } catch (error) {
      console.error('Error fetching lecture:', error);
      toast.error('Failed to fetch lecture');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const startProgressTracking = () => {
    progressIntervalRef.current = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handlePlayPause = () => {
    if (!lecture || !lecture.slides || lecture.slides.length === 0) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleSlideChange = (newSlideIndex) => {
    if (newSlideIndex >= 0 && newSlideIndex < lecture.slides.length) {
      setCurrentSlide(newSlideIndex);
      setCurrentTime(0);
      
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleNextSlide = () => {
    handleSlideChange(currentSlide + 1);
  };

  const handlePrevSlide = () => {
    handleSlideChange(currentSlide - 1);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
    } else {
      setIsMuted(true);
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLanguageFlag = (language) => {
    const flags = {
      english: '🇺🇸',
      russian: '🇷🇺',
      spanish: '🇪🇸',
      french: '🇫🇷',
      german: '🇩🇪',
    };
    return flags[language] || '🌐';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Lecture not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentSlideData = lecture.slides?.[currentSlide];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-outline inline-flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
              
              <div className="border-l border-gray-200 h-8"></div>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">{lecture.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{lecture.owner?.username}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Globe className="h-4 w-4" />
                    <span>{getLanguageFlag(lecture.language)} {lecture.language}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(lecture.createdAt)}</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="btn-outline"
            >
              {showTranscript ? 'Hide' : 'Show'} Transcript
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Slide Display */}
            <div className="card mb-6">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                {currentSlideData?.imageUrl ? (
                  <img
                    src={currentSlideData.imageUrl}
                    alt={`Slide ${currentSlide + 1}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <BookOpen className="mx-auto h-16 w-16 mb-4" />
                    <p>Slide {currentSlide + 1}</p>
                  </div>
                )}
              </div>
              
              {/* Slide Navigation */}
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={handlePrevSlide}
                  disabled={currentSlide === 0}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SkipBack className="h-4 w-4 mr-2" />
                  Previous
                </button>
                
                <span className="text-sm text-gray-600">
                  Slide {currentSlide + 1} of {lecture.slides?.length || 0}
                </span>
                
                <button
                  onClick={handleNextSlide}
                  disabled={currentSlide === (lecture.slides?.length || 0) - 1}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <SkipForward className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>

            {/* Audio Controls */}
            <div className="card">
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={handlePlayPause}
                  disabled={!currentSlideData?.audioUrl}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Play
                    </>
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleMuteToggle}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20"
                  />
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Slide List */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Slides</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {lecture.slides?.map((slide, index) => (
                  <button
                    key={index}
                    onClick={() => handleSlideChange(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentSlide === index
                        ? 'bg-primary-100 border border-primary-300'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-8 bg-gray-200 rounded overflow-hidden">
                        {slide.imageUrl ? (
                          <img
                            src={slide.imageUrl}
                            alt={`Slide ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Slide {index + 1}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {slide.content?.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Transcript */}
            {showTranscript && currentSlideData?.aiScript && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transcript</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {currentSlideData.aiScript}
                  </p>
                </div>
              </div>
            )}

            {/* Lecture Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lecture Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Duration:</span>
                  <span className="font-medium">{formatTime(duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Slides:</span>
                  <span className="font-medium">{lecture.slides?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{getLanguageFlag(lecture.language)} {lecture.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{formatDate(lecture.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => {
          if (currentSlide < (lecture.slides?.length || 0) - 1) {
            handleNextSlide();
          } else {
            setIsPlaying(false);
          }
        }}
        onError={(e) => {
          console.error('Audio error:', e);
          toast.error('Error playing audio');
        }}
      />
    </div>
  );
};

export default LectureViewer;
