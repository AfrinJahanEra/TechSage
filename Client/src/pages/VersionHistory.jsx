import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiRotateCcw } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PopupModal from '../components/PopupModal';

const VersionHistory = () => {
  const { blogId } = useParams();
  const { api, user } = useAuth();
  const navigate = useNavigate();
  const { darkMode, primaryColor } = useTheme();
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
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
        const versionsData = versionsResponse.data.versions || [];
        const sortedVersions = versionsData.sort((a, b) => {
          const dateA = a.updated_at ? new Date(a.updated_at) : new Date(0);
          const dateB = b.updated_at ? new Date(b.updated_at) : new Date(0);
          return dateB - dateA; // Descending order
        });
        setVersions(sortedVersions);
        setCurrentVersion(versionsResponse.data.current_version);
        setBlogStatus(blogResponse.data.status); // Set blog status
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        showPopup(error.response?.data?.error || 'Failed to load version history', 'error');
      })
      .finally(() => setLoading(false));

    return () => clearTimeout(popupTimerRef.current);
  }, [blogId, api]);

  const revertVersion = async (versionNumber) => {
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
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      <Navbar />
      <PopupModal
        show={popup.show}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ ...popup, show: false })}
        primaryColor={primaryColor}
        darkMode={darkMode}
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
      />
      <div className="flex flex-1 pt-16">
        <main className="flex-1 p-6 overflow-auto">
          <div className={`max-w-5xl mx-auto rounded-xl shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-8 py-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Version History
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Current Version: {currentVersion || 'N/A'}
              </p>
            </div>
            <div className="p-8">
              {loading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
                </div>
              ) : versions.length === 0 ? (
                <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No versions found for this blog.
                </p>
              ) : (
                <table className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
                  <thead>
                    <tr className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                      <th className="p-4 text-left text-sm font-semibold">Version</th>
                      <th className="p-4 text-left text-sm font-semibold">Title</th>
                      <th className="p-4 text-left text-sm font-semibold">Updated By</th>
                      <th className="p-4 text-left text-sm font-semibold">Updated At</th>
                      <th className="p-4 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {versions.map(version => (
                      <tr key={version.version} className={`border-t ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <td className="p-4">{version.version}</td>
                        <td className="p-4">{version.title}</td>
                        <td className="p-4">{version.updated_by}</td>
                        <td className="p-4">{formatTimestamp(version.updated_at)}</td>
                        <td className="p-4 flex gap-2">
                          <button
                            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            onClick={() => navigate(`/blogs/${blogId}/versions/${version.version}`)}
                            title="View Version"
                          >
                            <FiEye />
                          </button>
                          {blogStatus !== 'published' && (
                            <button
                              className="p-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
                              onClick={() => showConfirmModal(version.version)}
                              title="Revert to Version"
                            >
                              <FiRotateCcw />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default VersionHistory;