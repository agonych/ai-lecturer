import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  BookOpen, 
  User, 
  Globe, 
  Calendar,
  Play,
  Eye,
  Search,
  Filter,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const PublicLectures = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPublicLectures();
  }, [filter, currentPage, searchTerm]);

  const fetchPublicLectures = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
      });

      if (filter !== 'all') {
        params.append('language', filter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axios.get(`/api/lectures/public?${params}`);
      setLectures(response.data.lectures);
      setTotalPages(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching public lectures:', error);
      toast.error('Failed to fetch public lectures');
    } finally {
      setLoading(false);
    }
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
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const languages = [
    { value: 'all', label: 'All Languages', flag: '🌐' },
    { value: 'english', label: 'English', flag: '🇺🇸' },
    { value: 'russian', label: 'Русский', flag: '🇷🇺' },
    { value: 'spanish', label: 'Español', flag: '🇪🇸' },
    { value: 'french', label: 'Français', flag: '🇫🇷' },
    { value: 'german', label: 'Deutsch', flag: '🇩🇪' },
  ];

  const filteredLectures = lectures.filter(lecture =>
    lecture.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecture.owner?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Public Lectures
        </h1>
        <p className="mt-2 text-gray-600">
          Discover amazing lectures created by the AI Lecturer community
        </p>
      </div>

      {/* Filters and Search */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input w-auto"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search lectures or creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Lectures Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredLectures.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No lectures found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No public lectures available at the moment.'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLectures.map((lecture) => (
              <div key={lecture._id} className="card hover:shadow-lg transition-shadow duration-200">
                {/* Lecture Image */}
                <div className="relative mb-4">
                  {lecture.slides && lecture.slides[0]?.imageUrl ? (
                    <img
                      src={lecture.slides[0].imageUrl}
                      alt={`Slide 1 of ${lecture.name}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Language Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white shadow-sm">
                      {getLanguageFlag(lecture.language)} {lecture.language}
                    </span>
                  </div>
                </div>

                {/* Lecture Info */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {lecture.name}
                  </h3>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <User className="h-4 w-4" />
                    <span>{lecture.owner?.username || 'Unknown'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(lecture.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(lecture.totalDuration)}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {lecture.slides?.length || 0} slides
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex space-x-2">
                  <Link
                    to={`/lecture/${lecture._id}`}
                    className="flex-1 btn-outline text-center py-2"
                  >
                    <Eye className="h-4 w-4 mr-2 inline" />
                    View
                  </Link>
                  <Link
                    to={`/lecture/${lecture._id}`}
                    className="flex-1 btn-primary text-center py-2"
                  >
                    <Play className="h-4 w-4 mr-2 inline" />
                    Play
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Call to Action */}
      {!loading && filteredLectures.length > 0 && (
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to create your own lecture?
            </h2>
            <p className="text-gray-600 mb-6">
              Join the AI Lecturer community and start creating engaging content with AI assistance.
            </p>
            <Link
              to="/register"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <BookOpen className="h-5 w-5" />
              <span>Get Started</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicLectures;
