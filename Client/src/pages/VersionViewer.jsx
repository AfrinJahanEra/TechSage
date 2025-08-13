
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
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
  const popupTimerRef = useRef(null);

  const showPopup = (message, type = 'success', duration = 3000) => {
    clearTimeout(popupTimerRef.current);
    setPopup({ show: true, message, type });
    
    popupTimerRef.current = setTimeout(() => {
      setPopup(prev => ({ ...prev, show: false }));
    }, duration);
  };

  useEffect(() => {
    setLoading(true);
    api.get(`/blogs/versions/${blogId}`)
      .then(response => {
        const selectedVersion = response.data.versions.find(v => v.version === parseInt(versionNumber));
        if (selectedVersion) {
          setVersion(selectedVersion);
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
    if (window.confirm(`Are you sure you want to revert to version ${versionNumber}? This will save the current state as a new version.`)) {
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
      }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      <Navbar />
      <PopupModal
        show={popup.show}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ ...popup, show: false })}
      />
      <main className="flex-1 p-6">
        <div className={`max-w-5xl mx-auto rounded-xl shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`px-8 py-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Version {version?.version}: {version?.title || 'Loading...'}
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Updated by {version?.updated_by || 'N/A'} on {version?.updated_at ? new Date(version.updated_at).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  onClick={() => navigate(`/blogs/${blogId}/history`)}
                  title="Back to History"
                >
                  <FiArrowLeft />
                </button>
                <button
                  className="p-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
                  onClick={revertVersion}
                  title="Revert to Version"
                >
                  <FiRotateCcw />
                </button>
              </div>
            </div>
          </div>
          <div className="p-8">
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
              </div>
            ) : version ? (
              <Tiptap
                content={version.content}
                setContent={() => {}} // No-op for read-only
                primaryColor={primaryColor}
                darkMode={darkMode}
                readOnly
              />
            ) : (
              <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Version not found.
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VersionViewer;
