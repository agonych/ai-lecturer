import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { 
  Upload, 
  FileText, 
  FilePresentation, 
  Globe, 
  MessageSquare,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const CreateLecture = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lectureId, setLectureId] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const selectedLanguage = watch('language');

  const languages = [
    { value: 'english', label: 'English', flag: '🇺🇸' },
    { value: 'russian', label: 'Русский', flag: '🇷🇺' },
    { value: 'spanish', label: 'Español', flag: '🇪🇸' },
    { value: 'french', label: 'Français', flag: '🇫🇷' },
    { value: 'german', label: 'Deutsch', flag: '🇩🇪' },
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const fileType = file.name.split('.').pop().toLowerCase();
      if (!['pptx', 'pdf'].includes(fileType)) {
        toast.error('Please select a PPTX or PDF file');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create lecture first
      const lectureResponse = await axios.post('/api/lectures', {
        name: data.name,
        language: data.language,
        aiPrompt: data.aiPrompt,
      });

      const newLecture = lectureResponse.data.lecture;
      setLectureId(newLecture._id);

      // Upload file
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('language', data.language);
      formData.append('aiPrompt', data.aiPrompt);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      await axios.post(`/api/upload/lecture/${newLecture._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('Lecture created successfully!');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error creating lecture:', error);
      const message = error.response?.data?.error || 'Failed to create lecture';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FileText className="h-8 w-8 text-gray-400" />;
    
    const extension = fileName.split('.').pop().toLowerCase();
    if (extension === 'pptx') {
      return <FilePresentation className="h-8 w-8 text-blue-500" />;
    } else if (extension === 'pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <FileText className="h-8 w-8 text-gray-400" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-outline inline-flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Create New Lecture
        </h1>
        <p className="mt-2 text-gray-600">
          Upload your presentation and let AI generate an engaging lecture
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Lecture Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Lecture Name
              </label>
              <input
                id="name"
                type="text"
                className={`input ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="Enter lecture name"
                {...register('name', {
                  required: 'Lecture name is required',
                  maxLength: {
                    value: 200,
                    message: 'Lecture name must be less than 200 characters',
                  },
                })}
              />
              {errors.name && (
                <p className="form-error">{errors.name.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="language" className="form-label">
                Lecture Language
              </label>
              <select
                id="language"
                className={`input ${errors.language ? 'border-red-300 focus:ring-red-500' : ''}`}
                {...register('language', {
                  required: 'Language is required',
                })}
              >
                <option value="">Select language</option>
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
              {errors.language && (
                <p className="form-error">{errors.language.message}</p>
              )}
            </div>
          </div>

          <div className="form-group mt-6">
            <label htmlFor="aiPrompt" className="form-label">
              AI Instructions (Optional)
            </label>
            <textarea
              id="aiPrompt"
              rows={4}
              className={`input ${errors.aiPrompt ? 'border-red-300 focus:ring-red-500' : ''}`}
              placeholder="Provide additional context or instructions for the AI lecturer..."
              {...register('aiPrompt', {
                maxLength: {
                  value: 1000,
                  message: 'AI instructions must be less than 1000 characters',
                },
              })}
            />
            {errors.aiPrompt && (
              <p className="form-error">{errors.aiPrompt.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              This will help the AI understand the context and style of your lecture.
            </p>
          </div>
        </div>

        {/* File Upload */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Upload Presentation
          </h2>

          <div className="space-y-6">
            {/* File Selection */}
            <div className="form-group">
              <label className="form-label">Select File</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                <div className="space-y-1 text-center">
                  {selectedFile ? (
                    <div className="flex flex-col items-center space-y-2">
                      {getFileIcon(selectedFile.name)}
                      <div className="text-sm text-gray-900 font-medium">
                        {selectedFile.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(selectedFile.size)}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".pptx,.pdf"
                            onChange={handleFileSelect}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PPTX or PDF up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* File Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                File Requirements
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Supported formats: PPTX, PDF</li>
                <li>• Maximum file size: 10MB</li>
                <li>• The AI will extract content from each slide</li>
                <li>• Processing time depends on the number of slides</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Processing Lecture
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-gray-900">{uploadProgress}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {uploadProgress < 100 ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    <span>Processing your lecture...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Lecture created successfully!</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-outline"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedFile || isUploading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Lecture...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Create Lecture
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateLecture;
