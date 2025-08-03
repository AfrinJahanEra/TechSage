import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const BadgesSection = ({ username }) => {
  const { api } = useAuth();
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newBadge, setNewBadge] = useState({
    name: '',
    description: '',
    points_required: 100,
    image: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [badgesRes, userBadgesRes] = await Promise.all([
          api.get('/badges/'),
          api.get(`/badges/user/${username}/`)
        ]);
        setBadges(badgesRes.data);
        setUserBadges(userBadgesRes.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch badges');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api, username]);

  const handleCreateBadge = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', newBadge.name);
      formData.append('description', newBadge.description);
      formData.append('points_required', newBadge.points_required);
      formData.append('image', newBadge.image);

      const response = await api.post('/badges/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setBadges([...badges, response.data.badge]);
      setNewBadge({
        name: '',
        description: '',
        points_required: 100,
        image: null
      });
      alert('Badge created successfully!');
    } catch (err) {
      alert(`Failed to create badge: ${err.response?.data?.error || 'Unknown error'}`);
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
              setUserBadges(userBadges.filter(ub => ub.badge.id !== badgeId));
              alert('Badge deleted successfully');
            } catch (err) {
              alert(`Failed to delete badge: ${err.response?.data?.error || 'Unknown error'}`);
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  const handleAssignBadge = async (badgeId) => {
    confirmAlert({
      title: 'Assign Badge',
      message: `Assign this badge to ${username}?`,
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              const response = await api.post('/badges/assign/', {
                username,
                badge_id: badgeId
              });
              setUserBadges([...userBadges, {
                id: Date.now().toString(), // Temporary ID
                badge: badges.find(b => b.id === badgeId),
                awarded_at: new Date().toISOString()
              }]);
              alert(response.data.message);
            } catch (err) {
              alert(`Failed to assign badge: ${err.response?.data?.error || 'Unknown error'}`);
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading badges...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Badge Management (Admin Only) */}
      {user?.role === 'admin' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Create New Badge</h3>
          <form onSubmit={handleCreateBadge} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Badge Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={newBadge.name}
                onChange={(e) => setNewBadge({...newBadge, name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full p-2 border rounded"
                value={newBadge.description}
                onChange={(e) => setNewBadge({...newBadge, description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Points Required</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={newBadge.points_required}
                onChange={(e) => setNewBadge({...newBadge, points_required: parseInt(e.target.value) || 0})}
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Badge Image</label>
              <input
                type="file"
                className="w-full p-2 border rounded"
                accept="image/*"
                onChange={(e) => setNewBadge({...newBadge, image: e.target.files[0]})}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Create Badge
            </button>
          </form>
        </div>
      )}

      {/* User's Badges */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Your Badges</h3>
        {userBadges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {userBadges.map(userBadge => (
              <div key={userBadge.id} className="text-center p-4 border rounded-lg">
                <img 
                  src={userBadge.badge.image_url} 
                  alt={userBadge.badge.name} 
                  className="w-16 h-16 mx-auto mb-2"
                />
                <h4 className="font-medium capitalize">{userBadge.badge.name}</h4>
                <p className="text-sm text-gray-500">{userBadge.badge.points_required} pts</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No badges earned yet</p>
        )}
      </div>

      {/* All Available Badges */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Available Badges</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {badges.map(badge => {
            const hasBadge = userBadges.some(ub => ub.badge.id === badge.id);
            return (
              <div key={badge.id} className={`text-center p-4 border rounded-lg ${
                hasBadge ? 'bg-green-50 dark:bg-green-900' : ''
              }`}>
                <img 
                  src={badge.image_url} 
                  alt={badge.name} 
                  className="w-16 h-16 mx-auto mb-2"
                />
                <h4 className="font-medium capitalize">{badge.name}</h4>
                <p className="text-sm text-gray-500">{badge.points_required} pts</p>
                {user?.role === 'admin' && (
                  <div className="mt-2 flex justify-center space-x-2">
                    <button
                      onClick={() => handleAssignBadge(badge.id)}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => handleDeleteBadge(badge.id)}
                      className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
                {hasBadge && (
                  <span className="text-xs text-green-600 dark:text-green-300">✓ Earned</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BadgesSection;