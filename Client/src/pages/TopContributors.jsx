import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import SearchForm from '../components/SearchForm';
import avatar from '../../src/assets/user.jpg';
import { useAuth } from '../context/AuthContext';

const TopContributors = () => {
  const { primaryColor, darkMode, shadeColor } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const { api } = useAuth();

  const primaryDark = shadeColor(primaryColor, -20);
  const primaryLight = shadeColor(primaryColor, 20);

  // Color mappings for badge titles
  const badgeColors = {
    Master: { start: '#B9F2FF', end: '#80D0C7' }, // Diamond-like
    Specialist: { start: '#A9A9A9', end: '#D3D3D3' }, // Ash-like
    Expert: { start: '#DC143C', end: '#FF4040' }, // Ruby-like
    Grandmaster: { start: '#C0C0C0', end: '#E8E8E8' }, // Silver-like
    Visionary: { start: '#FFD700', end: '#FFA500' }, // Gold-like
    None: { start: '#D3D3D3', end: '#E0E0E0' }, // Neutral
  };

  const themeStyles = {
    '--primary-color': primaryColor,
    '--primary-dark': primaryDark,
    '--primary-light': primaryLight,
  };

  useEffect(() => {
    const fetchTopContributors = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/all-users/?page=${currentPage}&page_size=10`);
        const badgesResponse = await api.get('/badges/');

        const sortedUsers = response.data.users
          .map((user, index) => {
            const earnedBadges = badgesResponse.data
              .filter(badge => user.points >= badge.points_required)
              .map(badge => ({
                id: badge.id,
                name: badge.name,
                title: badge.title,
                image_url: badge.image_url,
                points_required: badge.points_required
              }));

            const highestBadge = earnedBadges.length > 0
              ? earnedBadges.reduce((max, badge) => max.points_required > badge.points_required ? max : badge)
              : null;

            // Calculate global rank (accounting for pagination)
            const globalRank = (currentPage - 1) * 10 + index + 1;

            return {
              ...user,
              rank: globalRank,
              name: user.username,
              image: user.avatar_url || avatar,
              field: user.job_title || 'Researcher',
              publications: user.published_blogs || 0,
              badges: earnedBadges,
              highestTitle: highestBadge ? highestBadge.title : 'None'
            };
          });

        setContributors(sortedUsers);
        setTotalPages(response.data.total_pages);
        setTotalUsers(response.data.total_users);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch contributors');
      } finally {
        setLoading(false);
      }
    };

    fetchTopContributors();
  }, [api, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className={`px-3 py-2 rounded-md ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
      );
    }
    
    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-4 py-2 border rounded-md ${currentPage === 1
            ? 'text-white border-[var(--primary-color)]'
            : darkMode
              ? 'border-gray-700 hover:bg-gray-700'
              : 'border-gray-300 hover:bg-gray-100'
            }`}
          style={{
            backgroundColor: currentPage === 1 ? primaryColor : 'transparent',
            borderColor: currentPage === 1 ? primaryColor : (darkMode ? 'rgb(55, 65, 81)' : 'rgb(209, 213, 219)')
          }}
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        pages.push(<span key="start-ellipsis" className="px-2 py-2">...</span>);
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last as they're handled separately
      
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 border rounded-md ${currentPage === i
            ? 'text-white border-[var(--primary-color)]'
            : darkMode
              ? 'border-gray-700 hover:bg-gray-700'
              : 'border-gray-300 hover:bg-gray-100'
            }`}
          style={{
            backgroundColor: currentPage === i ? primaryColor : 'transparent',
            borderColor: currentPage === i ? primaryColor : (darkMode ? 'rgb(55, 65, 81)' : 'rgb(209, 213, 219)')
          }}
        >
          {i}
        </button>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="end-ellipsis" className="px-2 py-2">...</span>);
      }
      
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-4 py-2 border rounded-md ${currentPage === totalPages
            ? 'text-white border-[var(--primary-color)]'
            : darkMode
              ? 'border-gray-700 hover:bg-gray-700'
              : 'border-gray-300 hover:bg-gray-100'
            }`}
          style={{
            backgroundColor: currentPage === totalPages ? primaryColor : 'transparent',
            borderColor: currentPage === totalPages ? primaryColor : (darkMode ? 'rgb(55, 65, 81)' : 'rgb(209, 213, 219)')
          }}
        >
          {totalPages}
        </button>
      );
    }
    
    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className={`px-3 py-2 rounded-md ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      );
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}>
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
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}>
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
      className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}
      style={themeStyles}
    >
      <Navbar activePage="top-contributors" />
      <main className="container mx-auto px-4 sm:px-6 lg:px-16 py-6 pt-24">
        <div className="flex flex-col lg:flex-row gap-6">
          <article className="flex-1">
            <header className={`border-b pb-5 mb-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h1 className={`text-3xl md:text-4xl font-bold leading-tight mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Top Researchers
              </h1>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Ranked by their total contribution points ({totalUsers} total researchers)
              </p>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-white" style={{ backgroundColor: primaryColor }}>
                  <tr>
                    <th className="px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">Researcher</th>
                    <th className="px-4 py-3 text-left">Field</th>
                    <th className="px-4 py-3 text-left">Publications</th>
                    <th className="px-4 py-3 text-left">Points</th>
                    <th className="px-4 py-3 text-left">Badges</th>
                  </tr>
                </thead>
                <tbody>
                  {contributors.map(contributor => {
                    const badgeColor = badgeColors[contributor.highestTitle] || badgeColors.None;
                    const textColor = darkMode ? '#ffffff' : '#000000'; // Ensure contrast

                    return (
                      <tr key={contributor.username} className={`border-b transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-[var(--primary-light)]'}`}>
                        <td className="px-4 py-3">{contributor.rank}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <Link to={`/user/${contributor.name}`} className="flex items-center hover:underline">
                              <img src={contributor.image} alt={contributor.name} className="w-10 h-10 rounded-full mr-3 object-cover" />
                              <span className="flex items-center">
                                {contributor.name}
                                {contributor.highestTitle !== 'None' && (
                                  <span
                                    className="ml-2 px-2 py-1 rounded-full text-sm font-semibold"
                                    style={{
                                      background: `linear-gradient(90deg, ${badgeColor.start}, ${badgeColor.end})`,
                                      color: textColor,
                                      border: `1px solid ${shadeColor(badgeColor.start, -20)}`,
                                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                    }}
                                  >
                                    {contributor.highestTitle}
                                  </span>
                                )}
                              </span>
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-3">{contributor.field}</td>
                        <td className="px-4 py-3">{contributor.publications}</td>
                        <td className="px-4 py-3 font-semibold">{contributor.points}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {contributor.highestTitle !== 'None' && contributor.badges?.length > 0 && (
                              (() => {
                                // Find the highest badge based on points_required
                                const highestBadge = contributor.badges.reduce((max, badge) => 
                                  max.points_required > badge.points_required ? max : badge
                                );
                                
                                return (
                                  <img
                                    src={highestBadge.image_url}
                                    alt={highestBadge.name}
                                    className="w-6 h-6"
                                    title={`${highestBadge.title} (${highestBadge.name})`}
                                  />
                                );
                              })()
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                {renderPagination()}
              </div>
            </div>
          </article>
          <div className="lg:w-96 space-y-6">
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