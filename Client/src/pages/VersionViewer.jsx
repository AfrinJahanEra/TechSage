import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FiArrowLeft, FiRotateCcw } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PopupModal from '../components/PopupModal';
import Tiptap from '../components/CreateBlogComponents/Tiptap';

const VersionViewer = () => {
  const { blogId, versionNumber } = useParams();
  const { api, user } = useAuth();
  const navigate = useNavigate();
  const { darkMode, primaryColor } = useTheme();
  const [version, setVersion] = useState(null);
  const [blogStatus, setBlogStatus] = useState(null); // New state for blog status
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', versionNumber: null });
  const popupTimerRef = useRef(null);

  const showPopup = (message, type = 'success', duration = 3000) => {
    clearTimeout(popupTimerRef.current);
    setPopup({ show: true, message, type });
    
    popupTimerRef.current = setTimeout(() => {
      setPopup(prev => ({ ...prev, show: false }));
    }, duration);
  };

  const showConfirmModal = (versionNumber) => {
    setConfirmModal({
      show: true,
      message: `Are you sure you want to revert to version ${versionNumber}? This will save the current state as a new version.`,
      versionNumber,
    });
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/blogs/versions/${blogId}`),
      api.get(`/blogs/${blogId}`) // Fetch blog details to get status
    ])
      .then(([versionsResponse, blogResponse]) => {
        console.log('API Response (Versions):', versionsResponse.data);
        console.log('API Response (Blog):', blogResponse.data);
        const selectedVersion = versionsResponse.data.versions.find(v => v.version === parseInt(versionNumber));
        if (selectedVersion) {
          console.log('Selected Version:', selectedVersion);
          setVersion({
            ...selectedVersion,
            categories: Array.isArray(selectedVersion.categories) ? selectedVersion.categories : selectedVersion.categories ? [selectedVersion.categories] : [],
            tags: Array.isArray(selectedVersion.tags) ? selectedVersion.tags : selectedVersion.tags ? [selectedVersion.tags] : [],
            thumbnail_url: selectedVersion.thumbnail_url || null
          });
          setBlogStatus(blogResponse.data.status); // Set blog status
        } else {
          showPopup('Version not found', 'error');
        }
      })
      .catch(error => {
        console.error('Error fetching version:', error);
        showPopup(error.response?.data?.error || 'Failed to load version', 'error');
      })
      .finally(() => setLoading(false));

    return () => clearTimeout(popupTimerRef.current);
  }, [blogId, versionNumber, api]);

  const revertVersion = async () => {
    try {
      const response = await api.post(`/blogs/revert/${blogId}/${versionNumber}/`, {
        username: user.username,
      });
      showPopup(`Reverted to version ${versionNumber} (New Version ${response.data.new_version})`, 'success');
      const blogResponse = await api.get(`/blogs/${blogId}`);
      navigate(`/blogs/${blogId}/edit`, { state: { draftData: blogResponse.data } });
    } catch (error) {
      console.error('Error reverting version:', error);
      showPopup(error.response?.data?.error || 'Failed to revert version', 'error');
    } finally {
      setConfirmModal({ show: false, message: '', versionNumber: null });
    }
  };

  // Format timestamp in +06 timezone
  const formatTimestamp = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'} transition-colors duration-500`}>
      <Navbar />
      <PopupModal
        show={popup.show}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ ...popup, show: false })}
        primaryColor={primaryColor}
        darkMode={darkMode}
        className="transition-opacity duration-500"
      />
      <PopupModal
        show={confirmModal.show}
        message={confirmModal.message}
        type="confirm"
        onConfirm={() => revertVersion(confirmModal.versionNumber)}
        onCancel={() => setConfirmModal({ show: false, message: '', versionNumber: null })}
        primaryColor={primaryColor}
        darkMode={darkMode}
        confirmText="Revert"
        cancelText="Cancel"
        title="Revert Version Confirmation"
        className="transition-opacity duration-500"
      />
      <div className="flex flex-1 pt-20">
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          <div className={`max-w-5xl mx-auto rounded-xl shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-shadow duration-500`}>
            <div className={`px-8 py-6 border-b mb-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Version {version?.version}: {version?.title || 'Loading...'}
                  </h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                    Updated by {version?.updated_by || 'N/A'} on {formatTimestamp(version?.updated_at)}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    Categories: {version?.categories.length > 0 ? version.categories.join(', ') : 'None'}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    Tags: {version?.tags.length > 0 ? version.tags.join(', ') : 'None'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-500"
                    onClick={() => navigate(`/blogs/${blogId}/history`)}
                    title="Back to History"
                  >
                    <FiArrowLeft className="text-lg" />
                  </button>
                  {blogStatus !== 'published' && (
                    <button
                      className="px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-500"
                      onClick={() => showConfirmModal(versionNumber)}
                      title="Revert to Version"
                    >
                      <FiRotateCcw className="text-lg" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="px-8 py-6">
              {version?.thumbnail_url && (
                <div className="mb-6">
                  <label className={`block text-sm font-bold mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Thumbnail
                  </label>
                  <img
                    src={version.thumbnail_url}
                    alt="Version Thumbnail"
                    className="max-h-60 rounded-md object-cover my-6 shadow-sm transition-shadow duration-500 hover:shadow-md"
                  />
                </div>
              )}
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
                </div>
              ) : version ? (
                <div className={`border rounded-lg p-4 shadow-sm transition-shadow duration-500 hover:shadow-md ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                  <Tiptap
                    content={version.content}
                    setContent={() => {}} // No-op for read-only
                    primaryColor={primaryColor}
                    darkMode={darkMode}
                    readOnly
                  />
                </div>
              ) : (
                <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} py-8`}>
                  Version not found.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default VersionViewer;