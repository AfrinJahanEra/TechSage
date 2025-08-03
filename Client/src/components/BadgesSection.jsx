import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const BadgesSection = ({ userId }) => {
  const { api } = useAuth();
  const { darkMode } = useTheme();
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [newBadge, setNewBadge] = useState({
    name: '',
    points_required: 100,
    description: '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const response = await api.get('/badges/');
      setBadges(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch badges');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBadges = async () => {
    try {
      const response = await api.get(`/badges/user/${userId}/`);
      setUserBadges(response.data);
    } catch (err) {
      console.error('Error fetching user badges:', err);
    }
  };

  const handleCreateBadge = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append('name', newBadge.name);
    formData.append('points_required', newBadge.points_required);
    formData.append('description', newBadge.description);
    if (newBadge.image) {
      formData.append('image', newBadge.image);
    }

    try {
      const response = await api.post('/badges/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setBadges([...badges, response.data]);
      setNewBadge({
        name: '',
        points_required: 100,
        description: '',
        image: null
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create badge');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBadge = async (badgeId) => {
    confirmAlert({
      title: 'Delete Badge',
      message: 'Are you sure you want to delete this badge?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await api.delete(`/badges/${badgeId}/`);
              setBadges(badges.filter(b => b.id !== badgeId));
            } catch (err) {
              setError(err.response?.data?.error || 'Failed to delete badge');
            }
          }
        },
        { label: 'No' }
      ]
    });
  };

  const handleAssignBadge = async () => {
    try {
      await api.post('/badges/assign/', { username: userId });
      fetchUserBadges();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign badge');
    }
  };

  useEffect(() => {
    fetchBadges();
    if (userId) {
      fetchUserBadges();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white shadow'}`}>
      <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Badges
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Your Badges
        </h3>
        {userBadges.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {userBadges.map(badge => (
              <div key={badge.id} className="flex flex-col items-center">
                <img 
                  src={badge.badge.image_url} 
                  alt={badge.badge.name} 
                  className="w-16 h-16 object-contain"
                />
                <span className="text-sm mt-1 capitalize">{badge.badge.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No badges earned yet
          </p>
        )}
        <button
          onClick={handleAssignBadge}
          className={`mt-3 px-4 py-2 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white text-sm`}
        >
          Check for New Badges
        </button>
      </div>

      <div>
        <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Available Badges
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {badges.map(badge => (
            <div key={badge.id} className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} flex flex-col items-center`}>
              <img 
                src={badge.image_url} 
                alt={badge.name} 
                className="w-16 h-16 object-contain mb-2"
              />
              <h4 className="font-medium capitalize text-center">{badge.name}</h4>
              <p className="text-sm text-gray-500 text-center">{badge.points_required}+ points</p>
              {userBadges.some(ub => ub.badge.name === badge.name) && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mt-2">
                  Earned
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={`mt-8 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Create New Badge
        </h3>
        <form onSubmit={handleCreateBadge}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={`block mb-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
              <input
                type="text"
                value={newBadge.name}
                onChange={(e) => setNewBadge({...newBadge, name: e.target.value})}
                className={`w-full px-3 py-2 rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                required
              />
            </div>
            <div>
              <label className={`block mb-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Points Required</label>
              <input
                type="number"
                min="0"
                value={newBadge.points_required}
                onChange={(e) => setNewBadge({...newBadge, points_required: parseInt(e.target.value) || 0})}
                className={`w-full px-3 py-2 rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className={`block mb-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
              <textarea
                value={newBadge.description}
                onChange={(e) => setNewBadge({...newBadge, description: e.target.value})}
                className={`w-full px-3 py-2 rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                rows="2"
              />
            </div>
            <div className="md:col-span-2">
              <label className={`block mb-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Badge Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewBadge({...newBadge, image: e.target.files[0]})}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
          >
            {loading ? 'Creating...' : 'Create Badge'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BadgesSection;