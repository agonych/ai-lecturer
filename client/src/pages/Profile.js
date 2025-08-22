import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Globe, 
  Lock, 
  Save, 
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      preferredLanguage: user?.preferredLanguage || 'english',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    watch,
    reset: resetPassword,
  } = useForm();

  const newPassword = watch('newPassword');

  const languages = [
    { value: 'english', label: 'English', flag: '🇺🇸' },
    { value: 'russian', label: 'Русский', flag: '🇷🇺' },
    { value: 'spanish', label: 'Español', flag: '🇪🇸' },
    { value: 'french', label: 'Français', flag: '🇫🇷' },
    { value: 'german', label: 'Deutsch', flag: '🇩🇪' },
  ];

  const onProfileSubmit = async (data) => {
    try {
      const result = await updateProfile(data);
      if (result.success) {
        setIsEditing(false);
        resetProfile(data);
      }
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      const result = await changePassword(data.currentPassword, data.newPassword);
      if (result.success) {
        setIsChangingPassword(false);
        resetPassword();
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }
    } catch (error) {
      console.error('Password change error:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    resetProfile({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      preferredLanguage: user?.preferredLanguage || 'english',
    });
  };

  const handleCancelPassword = () => {
    setIsChangingPassword(false);
    resetPassword();
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Profile Information
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-outline inline-flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className={`input ${profileErrors.firstName ? 'border-red-300 focus:ring-red-500' : ''}`}
                    {...registerProfile('firstName', {
                      required: 'First name is required',
                      maxLength: {
                        value: 50,
                        message: 'First name must be less than 50 characters',
                      },
                    })}
                  />
                  {profileErrors.firstName && (
                    <p className="form-error">{profileErrors.firstName.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className={`input ${profileErrors.lastName ? 'border-red-300 focus:ring-red-500' : ''}`}
                    {...registerProfile('lastName', {
                      required: 'Last name is required',
                      maxLength: {
                        value: 50,
                        message: 'Last name must be less than 50 characters',
                      },
                    })}
                  />
                  {profileErrors.lastName && (
                    <p className="form-error">{profileErrors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="preferredLanguage" className="form-label">
                  Preferred Language
                </label>
                <select
                  id="preferredLanguage"
                  className={`input ${profileErrors.preferredLanguage ? 'border-red-300 focus:ring-red-500' : ''}`}
                  {...registerProfile('preferredLanguage', {
                    required: 'Preferred language is required',
                  })}
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.flag} {lang.label}
                    </option>
                  ))}
                </select>
                {profileErrors.preferredLanguage && (
                  <p className="form-error">{profileErrors.preferredLanguage.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">First Name</label>
                  <p className="text-gray-900">{user?.firstName || 'Not set'}</p>
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <p className="text-gray-900">{user?.lastName || 'Not set'}</p>
                </div>
              </div>

              <div>
                <label className="form-label">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>

              <div>
                <label className="form-label">Preferred Language</label>
                <p className="text-gray-900">
                  {languages.find(l => l.value === user?.preferredLanguage)?.flag} {' '}
                  {languages.find(l => l.value === user?.preferredLanguage)?.label}
                </p>
              </div>

              <div>
                <label className="form-label">Member Since</label>
                <p className="text-gray-900">
                  {new Date(user?.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Account Security */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Account Security
            </h2>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="btn-outline inline-flex items-center space-x-2"
              >
                <Key className="h-4 w-4" />
                <span>Change Password</span>
              </button>
            )}
          </div>

          {isChangingPassword ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="form-group">
                <label htmlFor="currentPassword" className="form-label">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    className={`input pr-10 ${passwordErrors.currentPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
                    {...registerPassword('currentPassword', {
                      required: 'Current password is required',
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="form-error">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    className={`input pr-10 ${passwordErrors.newPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="form-error">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`input pr-10 ${passwordErrors.confirmPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
                    {...registerPassword('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === newPassword || 'Passwords do not match',
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="form-error">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancelPassword}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Key className="h-4 w-4 mr-2" />
                  Update Password
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Lock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Password</p>
                  <p className="text-sm text-gray-500">Last changed recently</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Security Tips
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use a strong, unique password</li>
                  <li>• Enable two-factor authentication if available</li>
                  <li>• Never share your password with others</li>
                  <li>• Regularly update your password</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
