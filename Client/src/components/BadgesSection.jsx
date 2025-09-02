import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PopupModal from '../components/PopupModal';

const BadgesSection = ({ badges, fetchBadges }) => {
  const { api, user } = useAuth();
  const { darkMode, primaryColor } = useTheme();
  const [activeSection, setActiveSection] = useState('list');
  const [newBadge, setNewBadge] = useState({
    name: '',
    title: '',
    points_required: 100,
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({ message: '', onConfirm: null });

  const handleCreateBadge = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'admin') {
      alert('Only admins can create badges');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', newBadge.name);
      formData.append('title', newBadge.title);
      formData.append('points_required', newBadge.points_required);
      formData.append('image', newBadge.image);

      const response = await api.post('/badges/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      fetchBadges();
      setNewBadge({
        name: '',
        title: '',
        points_required: 100,
        image: null
      });
      setActiveSection('list');
      alert('Badge created successfully!');
    } catch (error) {
      console.error('Error creating badge:', error);
      alert(`Failed to create badge: ${error.response?.data?.error || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBadge = async (badgeId) => {
    if (!user || user.role !== 'admin') {
      toast.error('Only admins can delete badges');
      return;
    }

    setPopupData({
      message: 'Are you sure you want to delete this badge? This action cannot be undone.',
      onConfirm: () => {
        setShowPopup(false);
        performDeleteBadge(badgeId);
      }
    });
    setShowPopup(true);
  };

  const performDeleteBadge = async (badgeId) => {
    try {
      await api.delete(`/badges/${badgeId}/`);
      fetchBadges();
      toast.success('Badge deleted successfully');
    } catch (error) {
      console.error('Error deleting badge:', error);
      toast.error('Failed to delete badge');
    }
    
    try {
      await api.delete(`/badges/${badgeId}/`);
      fetchBadges();
      toast.success('Badge deleted successfully');
    } catch (error) {
      console.error('Error deleting badge:', error);
      toast.error('Failed to delete badge');
    }
  };

  const handleImageChange = (e) => {
    setNewBadge({ ...newBadge, image: e.target.files[0] });
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {activeSection === 'list' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Badges Management
            </h1>
            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveSection('create')}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-500 hover:bg-teal-600'} text-white`}
              >
                <i className="fas fa-plus mr-2"></i> Create New Badge
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.length === 0 ? (
              <div className={`col-span-3 text-center py-10 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <i className="fas fa-award text-3xl mb-4"></i>
                <p>No badges found</p>
              </div>
            ) : (
              badges.map(badge => (
                <div key={badge.id} className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center mb-3">
                    <img 
                      src={badge.image_url} 
                      alt={badge.name} 
                      className="w-16 h-16 object-contain mr-4"
                    />
                    <div>
                      <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {badge.title}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {badge.name} | {badge.points_required} points
                      </p>
                    </div>
                  </div>
                  {user?.role === 'admin' && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDeleteBadge(badge.id)}
                        className={`px-3 py-1 rounded ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white text-sm`}
                      >
                        <i className="fas fa-trash mr-1"></i> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
      {activeSection === 'create' && (
        <div>
          <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Create New Badge
          </h1>
          <div className={`p-6 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <form onSubmit={handleCreateBadge}>
              <div className="mb-4">
                <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Badge Level
                </label>
                <select
                  className={`w-full px-3 py-2 rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                  value={newBadge.name}
                  onChange={(e) => setNewBadge({...newBadge, name: e.target.value})}
                  required
                >
                  <option value="">Select badge level</option>
                  <option value="ruby">Ruby</option>
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="diamond">Diamond</option>
                </select>
              </div>
              <div className="mb-4">
                <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title (e.g., "Specialist")
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                  value={newBadge.title}
                  onChange={(e) => setNewBadge({...newBadge, title: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Points Required
                </label>
                <input
                  type="number"
                  min="0"
                  className={`w-full px-3 py-2 rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                  value={newBadge.points_required}
                  onChange={(e) => setNewBadge({...newBadge, points_required: parseInt(e.target.value) || 0})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Badge Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className={`w-full px-3 py-2 rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
 Białó type="button"
                  onClick={() => setActiveSection('list')}
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-500 hover:bg-teal-600'} text-white ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Create Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <PopupModal
        show={showPopup}
        message={popupData.message}
        type="confirm"
        onConfirm={popupData.onConfirm}
        onCancel={() => setShowPopup(false)}
        primaryColor="#3b82f6"
        darkMode={false}
        title="Confirm Action"
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
};

export default BadgesSection;