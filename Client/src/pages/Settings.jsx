import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from 'react-hot-toast';
import avatar from '../../src/assets/user.jpg';

const Settings = () => {
  const { user, api, logout, updateUser } = useAuth();
  const { primaryColor, darkMode, changeThemeColor, toggleDarkMode, shadeColor } = useTheme();

  const [activeSection, setActiveSection] = useState('edit-profile');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [collaborationRequests, setCollaborationRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    university: '',
    job_title: '',
    bio: '',
    avatar_url: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Generate color variants
  const primaryDark = shadeColor(primaryColor, -20);
  const primaryLight = shadeColor(primaryColor, 20);

  // Dynamic style variables for theme colors
  const themeStyles = {
    '--primary-color': primaryColor,
    '--primary-dark': primaryDark,
    '--primary-light': primaryLight,
  };

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username,
        email: user.email,
        university: user.university || '',
        job_title: user.job_title || 'User',
        bio: user.bio || '',
        avatar_url: user.avatar_url || ''
      });
      setAvatarPreview(user.avatar_url || null);
    }
  }, [user]);

  // Fetch collaboration requests
  useEffect(() => {
    if (activeSection === 'collaboration-request') {
      fetchCollaborationRequests();
    }
  }, [activeSection]);

  // Update the fetchCollaborationRequests function
  const fetchCollaborationRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await api.get(`/collaboration-request/author-requests/${user.username}/`);
      setCollaborationRequests(response.data.requests || response.data); // Handle both response formats
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      toast.error('Failed to load collaboration requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  // Update the respondToRequest function
  const respondToRequest = async (requestId, accept) => {
    try {
      const response = await api.post(`/collaboration-request/respond-to-request/${requestId}/`, {
        username: user.username,
        response: accept ? 'accept' : 'reject'
      });

      fetchCollaborationRequests(); // Refresh the list
      toast.success(`Request ${accept ? 'accepted' : 'rejected'}`);

      // If accepted, update the user's blogs list or other relevant state
      if (accept && response.data.blog) {
        // You might want to update your global state or navigation here
      }
    } catch (error) {
      console.error('Failed to respond:', error);
      toast.error(error.response?.data?.error || 'Failed to respond');
    }
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (password.match(/[a-z]/)) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
    setPasswordStrength(strength);
  };

  // Handle avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview image
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.put(`/user/${user.username}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const updatedUser = response.data;
      setProfileData(prev => ({
        ...prev,
        avatar_url: updatedUser.avatar_url
      }));

      updateUser(updatedUser);
    } catch (error) {
      console.error('Avatar upload failed:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/user/${user.username}/`, {
        job_title: profileData.job_title,
        bio: profileData.bio
      });

      const updatedUser = response.data;
      setProfileData(updatedUser);
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error('Failed to update profile');
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    try {
      await api.put(`/user/${user.username}/change-password/`, {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });

      toast.success('Password changed successfully!');
      setPasswordModalOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password change failed:', error);
      toast.error(error.response?.data?.error || 'Failed to change password');
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      await api.delete(`/users/${user.username}/delete/`);
      logout();
      toast.success('Account deleted successfully');
      window.location.href = '/';
    } catch (error) {
      console.error('Account deletion failed:', error);
      toast.error('Failed to delete account');
    }
  };

  // Render password strength indicator
  const renderPasswordStrength = () => {
    const strengthText = passwordStrength >= 6 ? 'Strong' : passwordStrength >= 4 ? 'Medium' : 'Weak';
    const strengthColor = passwordStrength >= 6 ? 'bg-green-500' : passwordStrength >= 4 ? 'bg-yellow-500' : 'bg-red-500';

    return (
      <div className="mt-1">
        <div className={`h-1 rounded-full overflow-hidden ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
          <div
            className={`h-full ${strengthColor}`}
            style={{ width: `${Math.min(100, passwordStrength * 20)}%` }}
          ></div>
        </div>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Password strength: {strengthText}
        </p>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}
      style={themeStyles}
    >
      <Navbar activePage="settings" />

      {/* Dashboard Layout */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] py-20">
        {/* Sidebar */}
        <div className={`w-full md:w-64 border-r p-4 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveSection('edit-profile')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors duration-200 ${activeSection === 'edit-profile'
                    ? `${darkMode ? 'bg-gray-700' : 'bg-[var(--primary-light)]'} border-l-4`
                    : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                  }`}
                style={{
                  borderColor: activeSection === 'edit-profile' ? primaryColor : 'transparent',
                  color: activeSection === 'edit-profile' ? primaryColor : 'inherit'
                }}
              >
                <i className="fas fa-user-edit mr-3"></i>
                Edit Profile
              </button>
            </li>

            {user?.role === 'user' && (
              <li>
                <button
                  onClick={() => setActiveSection('collaboration-request')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors duration-200 ${activeSection === 'collaboration-request'
                      ? `${darkMode ? 'bg-gray-700' : 'bg-[var(--primary-light)]'} border-l-4`
                      : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                    }`}
                  style={{
                    borderColor: activeSection === 'collaboration-request' ? primaryColor : 'transparent',
                    color: activeSection === 'collaboration-request' ? primaryColor : 'inherit'
                  }}
                >
                  <i className="fas fa-handshake mr-3"></i>
                  Collaboration
                </button>
              </li>
            )}

            <li>
              <button
                onClick={() => setActiveSection('settings')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors duration-200 ${activeSection === 'settings'
                    ? `${darkMode ? 'bg-gray-700' : 'bg-[var(--primary-light)]'} border-l-4`
                    : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                  }`}
                style={{
                  borderColor: activeSection === 'settings' ? primaryColor : 'transparent',
                  color: activeSection === 'settings' ? primaryColor : 'inherit'
                }}
              >
                <i className="fas fa-cog mr-3"></i>
                Settings
              </button>
            </li>

            <li>
              <button
                onClick={() => setLogoutModalOpen(true)}
                className={`w-full px-4 py-3 text-left flex items-center rounded-lg transition-colors duration-200 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <i className="fas fa-sign-out-alt mr-3"></i>
                Logout
              </button>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Edit Profile Section */}
          {activeSection === 'edit-profile' && (
            <div>
              <h1 className={`text-2xl font-bold mb-6 pb-2 border-b-2 inline-block ${darkMode ? 'text-gray-100' : 'text-gray-800'}`} style={{ borderColor: primaryColor }}>
                Edit Profile
              </h1>

              <form onSubmit={handleProfileSubmit} className="max-w-3xl">
                {/* Avatar Upload */}
                <div className="mb-6 flex items-center">
                  <div className="relative mr-6">
                    <img
                      src={avatarPreview || profileData.avatar_url || avatar}
                      alt="Profile"
                      className={`w-24 h-24 rounded-full object-cover border-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                      style={{ borderColor: primaryColor }}
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <i className="fas fa-spinner fa-spin text-white"></i>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2">
                      <span
                        className="px-4 py-2 rounded-md cursor-pointer hover:opacity-90 transition-colors duration-200 text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Change Avatar
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </span>
                    </label>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      JPG, PNG max 5MB
                    </p>
                  </div>
                </div>

                {/* Username (read-only) */}
                <div className="mb-6">
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Username</label>
                  <input
                    type="text"
                    value={profileData.username}
                    readOnly
                    className={`w-full px-4 py-2 border rounded-md cursor-not-allowed ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}`}
                  />
                </div>

                {/* Email (read-only) */}
                <div className="mb-6">
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    readOnly
                    className={`w-full px-4 py-2 border rounded-md cursor-not-allowed ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}`}
                  />
                </div>

                {/* University (read-only) */}
                <div className="mb-6">
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>University</label>
                  <input
                    type="text"
                    value={profileData.university}
                    readOnly
                    className={`w-full px-4 py-2 border rounded-md cursor-not-allowed ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}`}
                  />
                </div>

                {/* Role (read-only) */}
                <div className="mb-6">
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Role</label>
                  <input
                    type="text"
                    value={user?.role || 'user'}
                    readOnly
                    className={`w-full px-4 py-2 border rounded-md cursor-not-allowed capitalize ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}`}
                  />
                </div>

                {/* Job Title */}
                <div className="mb-6">
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Job Title</label>
                  <input
                    type="text"
                    value={profileData.job_title}
                    onChange={(e) => setProfileData({ ...profileData, job_title: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                    style={{ '--tw-ring-color': primaryColor }}
                  />
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows="4"
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}
                    style={{ '--tw-ring-color': primaryColor }}
                  ></textarea>
                </div>

                {/* Password Change Button */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setPasswordModalOpen(true)}
                    className={`px-4 py-2 rounded-md transition-colors duration-200 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                  >
                    <i className="fas fa-lock mr-2"></i>
                    Change Password
                  </button>
                </div>

                {/* Form Actions */}
                <div className={`flex justify-end space-x-4 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    type="button"
                    className={`px-6 py-2 rounded-md transition-colors duration-200 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-white rounded-md hover:opacity-90 transition-colors duration-200"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Collaboration Request Section */}
          {activeSection === 'collaboration-request' && user?.role === 'user' && (
            <div>
              <h1 className={`text-2xl font-bold mb-6 pb-2 border-b-2 inline-block ${darkMode ? 'text-gray-100' : 'text-gray-800'}`} style={{ borderColor: primaryColor }}>
                Collaboration Requests
              </h1>

              {loadingRequests ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
                    style={{ borderColor: primaryColor }}></div>
                </div>
              ) : collaborationRequests.length === 0 ? (
                <div className="p-8 text-center">
                  <i className={`fas fa-handshake text-5xl mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}></i>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    No collaboration requests yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {collaborationRequests.map((request) => (
                    <div
                      key={request.request_id || request.id} // Handle both field names
                      className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {request.blog_title || request.blog?.title}
                          </h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Requested by {request.requesting_author || request.requesting_author?.username}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => respondToRequest(request.request_id || request.id, true)}
                          className="flex-1 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => respondToRequest(request.request_id || request.id, false)}
                          className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div>
              <h1 className={`text-2xl font-bold mb-6 pb-2 border-b-2 inline-block ${darkMode ? 'text-gray-100' : 'text-gray-800'}`} style={{ borderColor: primaryColor }}>
                Settings
              </h1>

              <div className="max-w-3xl space-y-8">
                {/* Appearance Settings */}
                <div>
                  <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Appearance</h3>

                  <div className={`p-4 border rounded-md mb-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Dark Mode</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Switch between light and dark theme
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={darkMode}
                          onChange={toggleDarkMode}
                          className="sr-only peer"
                        />
                        <div
                          className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600"
                          style={{ backgroundColor: darkMode ? primaryColor : 'rgb(229, 231, 235)' }}
                        ></div>
                      </label>
                    </div>
                  </div>

                  <div className={`p-4 border rounded-md ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="mb-4">
                      <div className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Theme Color</div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Choose your preferred color scheme
                      </div>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                      {['#1abc9c', '#3498db', '#9b59b6', '#e74c3c', '#e67e22', '#f1c40f'].map((color) => (
                        <button
                          key={color}
                          onClick={() => changeThemeColor(color)}
                          className={`flex flex-col items-center p-2 rounded-md transition-colors duration-200 ${primaryColor === color
                              ? 'ring-2'
                              : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
                            }`}
                          style={{
                            ringColor: primaryColor,
                            backgroundColor: primaryColor === color ? (darkMode ? 'rgba(156, 163, 175, 0.3)' : 'rgba(243, 244, 246, 1)') : 'transparent'
                          }}
                        >
                          <div
                            className="w-12 h-12 rounded-full mb-1"
                            style={{ backgroundColor: color }}
                          ></div>
                          <span className={`text-sm capitalize ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {color === '#1abc9c' ? 'Teal' :
                              color === '#3498db' ? 'Blue' :
                                color === '#9b59b6' ? 'Purple' :
                                  color === '#e74c3c' ? 'Red' :
                                    color === '#e67e22' ? 'Orange' : 'Yellow'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Account Settings */}
                <div>
                  <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Account</h3>

                  <div className={`p-4 border rounded-md ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Delete Account</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Permanently remove your account and all data
                        </div>
                      </div>
                      <button
                        onClick={() => setDeleteModalOpen(true)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-full max-w-md ${darkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-800 border-gray-200'} border`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Change Password</h3>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-[var(--primary-color)]' : 'bg-white border-gray-300 text-gray-700 focus:border-[var(--primary-color)]'}`}
                  required
                  style={{ '--tw-ring-color': primaryColor }}
                />
              </div>

              <div className="mb-4">
                <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, newPassword: e.target.value });
                    checkPasswordStrength(e.target.value);
                  }}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-[var(--primary-color)]' : 'bg-white border-gray-300 text-gray-700 focus:border-[var(--primary-color)]'}`}
                  required
                  style={{ '--tw-ring-color': primaryColor }}
                />
                {renderPasswordStrength()}
              </div>

              <div className="mb-6">
                <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-[var(--primary-color)]' : 'bg-white border-gray-300 text-gray-700 focus:border-[var(--primary-color)]'}`}
                  required
                  style={{ '--tw-ring-color': primaryColor }}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-colors duration-200"
                  style={{ backgroundColor: primaryColor }}
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-full max-w-md text-center ${darkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-800 border-gray-200'} border`}>
            <div className="flex justify-end">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <h3 className="text-xl font-bold mb-4">Delete Account Confirmation</h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Are you sure you want to delete your account? This action cannot be undone.</p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className={`px-6 py-2 rounded-md transition-colors duration-200 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-full max-w-md text-center ${darkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-800 border-gray-200'} border`}>
            <div className="flex justify-end">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <h3 className="text-xl font-bold mb-4">Logout Confirmation</h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Are you sure you want to logout?</p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className={`px-6 py-2 rounded-md transition-colors duration-200 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
              >
                Cancel
              </button>
              <button
                onClick={logout}
                className="px-6 py-2 text-white rounded-md hover:opacity-90 transition-colors duration-200"
                style={{ backgroundColor: primaryColor }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Settings;