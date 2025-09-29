import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ContributorCard from './ContributorCard';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import avatar from '../../src/assets/user.jpg';

const TopContributor = () => {
  const { primaryColor, darkMode } = useTheme();
  const { api } = useAuth();
  const [topContributors, setTopContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopContributors = async () => {
      try {
        setLoading(true);
        // Fetch users sorted by points in descending order from the backend
        const response = await api.get('/all-users/?page=1&page_size=3');
        
        if (response.data?.users) {
          const mapped = response.data.users.map(user => ({
            id: user._id || user.id,
            image: user.avatar_url || avatar,
            name: user.username,
            blogs: `${user.published_blogs || 0} research blogs`,
            points: user.points || 0
          }));
          
          setTopContributors(mapped);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch top contributors');
        console.error('Error fetching top contributors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopContributors();
  }, [api]);

  if (loading) {
    return (
      <aside className="w-full md:max-w-xs space-y-8">
        <div className="space-y-4">
          <h3 className="uppercase text-sm font-semibold tracking-wider border-b pb-2" 
              style={{ color: primaryColor, borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
            Top Contributors
          </h3>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" 
                 style={{ borderColor: primaryColor }}></div>
          </div>
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="w-full md:max-w-xs space-y-8">
        <div className="space-y-4">
          <h3 className="uppercase text-sm font-semibold tracking-wider border-b pb-2" 
              style={{ color: primaryColor, borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
            Top Contributors
          </h3>
          <div className="text-red-500 text-sm">{error}</div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full md:max-w-xs space-y-8">
      <div className="space-y-4">
        <h3 className="uppercase text-sm font-semibold tracking-wider border-b pb-2" 
            style={{ color: primaryColor, borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
          Top Contributors
        </h3>
        <div className="space-y-4">
          {topContributors.map(contributor => (
            <ContributorCard 
              key={contributor.id} 
              {...contributor} 
              points={contributor.points}
            />
          ))}
        </div>
        <div className="text-center">
          <Link 
            to="/top-contributors" 
            className="font-semibold hover:underline"
            style={{ color: primaryColor }}
          >
            See All Contributors →
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default TopContributor;