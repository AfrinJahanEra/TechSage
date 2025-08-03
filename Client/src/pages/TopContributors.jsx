import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import SearchForm from '../components/SearchForm';
import avatar from '../../src/assets/default-avatar.png';
import { useAuth } from '../context/AuthContext';

const TopContributors = () => {
  const { primaryColor, darkMode, shadeColor } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);

  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { api } = useAuth();

  const primaryDark = shadeColor(primaryColor, -20);
  const primaryLight = shadeColor(primaryColor, 20);


  const themeStyles = {
    '--primary-color': primaryColor,
    '--primary-dark': primaryDark,
    '--primary-light': primaryLight,
  };

  useEffect(() => {
    const fetchTopContributors = async () => {
      try {
        setLoading(true);
        const response = await api.get('/all-users/');
        
        if (response.data?.users) {
          const sortedUsers = response.data.users
            .sort((a, b) => b.points - a.points || b.published_blogs - a.published_blogs)
            .map((user, index) => ({
              id: index + 1,
              rank: index + 1,
              image: user.avatar_url || avatar,
              name: user.username,
              field: user.job_title || 'Researcher',
              publications: user.published_blogs || 0,
              points: user.points || 0,
              badge: getBadgeType(index + 1)
            }));
          
          setContributors(sortedUsers);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch contributors');
        console.error('Error fetching contributors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopContributors();
  }, [api]);

  const getBadgeType = (rank) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
  };

  const getBadgeClass = (badge) => {
    switch (badge) {
      case 'gold': return 'bg-yellow-300 text-yellow-800';
      case 'silver': return 'bg-gray-300 text-gray-800';
      case 'bronze': return 'bg-amber-600 text-amber-100';
      default: return '';
    }
  };

  const getBadgeText = (badge) => {
    switch (badge) {
      case 'gold': return 'Top';
      case 'silver': return 'Senior';
      case 'bronze': return 'Rising';
      default: return '';
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'
      }`}>
        <Navbar activePage="top-contributors" />
        <main className="container mx-auto px-4 py-8 pt-28">
          <div className="flex justify-center items-center h-64">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" 
              style={{ borderColor: primaryColor }}
            ></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'
      }`}>
        <Navbar activePage="top-contributors" />
        <main className="container mx-auto px-4 py-8 pt-28">
          <div className="text-center text-red-500">{error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'
      }`}
      style={themeStyles}
    >
      <Navbar activePage="top-contributors" />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-20 py-8 pt-28">
        <div className="flex flex-col lg:flex-row gap-8">
          <article className="flex-1">
            <header className={`border-b pb-6 mb-8 ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h1 className={`text-3xl md:text-4xl font-bold leading-tight mb-3 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Top Researchers
              </h1>
              <p className={`text-lg ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Ranked by their total contribution points
              </p>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead 
                  className="text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <tr>
                    <th className="px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">Researcher</th>
                    <th className="px-4 py-3 text-left">Field</th>
                    <th className="px-4 py-3 text-left">Publications</th>
                    <th className="px-4 py-3 text-left">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {contributors.map(contributor => (
                    <tr 
                      key={contributor.id} 
                      className={`border-b transition-colors ${
                        darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-[var(--primary-light)]'
                      }`}
                    >
                      <td className="px-4 py-3">{contributor.rank}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Link 
                            to={`/user/${contributor.name}`} 
                            className="flex items-center hover:underline"
                          >
                            <img 
                              src={contributor.image} 
                              alt={contributor.name} 
                              className="w-10 h-10 rounded-full mr-3 object-cover"
                            />
                            <span>{contributor.name}</span>
                          </Link>
                          {contributor.badge && (
                            <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded ${
                              getBadgeClass(contributor.badge)
                            }`}>
                              {getBadgeText(contributor.badge)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{contributor.field}</td>
                      <td className="px-4 py-3">{contributor.publications}</td>
                      <td className="px-4 py-3 font-semibold">
                        {contributor.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border rounded-md ${
                      currentPage === page 
                        ? 'text-white border-[var(--primary-color)]' 
                        : darkMode 
                          ? 'border-gray-700 hover:bg-gray-700' 
                          : 'border-gray-300 hover:bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: currentPage === page ? primaryColor : 'transparent',
                      borderColor: currentPage === page ? primaryColor : (darkMode ? 'rgb(55, 65, 81)' : 'rgb(209, 213, 219)')
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  className={`px-4 py-2 border rounded-md ${
                    darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                  }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </article>

          <div className="lg:w-80 space-y-8">
            <Sidebar />
            <SearchForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TopContributors;