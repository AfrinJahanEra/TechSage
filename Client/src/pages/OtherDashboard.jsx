import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import BlogCardDash from '../components/BlogCardDash';
import { Chart } from 'chart.js/auto';
import 'chartjs-plugin-annotation';
import { normalizeBlog } from '../utils/blogUtils';
import avatar from '../../src/assets/default-avatar.png';
import 'react-toastify/dist/ReactToastify.css';
import TopContributor from '../components/TopContributor';

const OtherDashboard = () => {
  const { username } = useParams();
  const { primaryColor, darkMode, shadeColor } = useTheme();
  const { api } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [sortOption, setSortOption] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publishedCount, setPublishedCount] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [highestBadge, setHighestBadge] = useState('No Badge');
  const [allBadges, setAllBadges] = useState([]);
  const [activityData, setActivityData] = useState({
    labels: [],
    posts: [],
    comments: [],
    likes: [],
    reports: []
  });
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);

  const primaryDark = shadeColor(primaryColor, -20);
  const primaryLight = shadeColor(primaryColor, 20);

  const themeStyles = {
    '--primary-color': primaryColor,
    '--primary-dark': primaryDark,
    '--primary-light': primaryLight,
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/user/${username}/`);
        setUserData(response.data);
        setError(null);
      } catch (err) {
        console.error('Fetch user error:', err);
        setError(err.response?.data?.error || 'User not found');
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchAllBadges = async () => {
      try {
        const response = await api.get('/badges/');
        const sortedBadges = response.data.sort((a, b) => a.points_required - b.points_required);
        setAllBadges(sortedBadges);
      } catch (err) {
        console.error('Fetch badges error:', err);
      }
    };

    if (username) {
      fetchUserData();
      fetchAllBadges();
    }
  }, [username, api]);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await api.get('/all-users/');
        if (response.data?.users && username) {
          const currentUser = response.data.users.find(u => u.username === username);
          if (currentUser) {
            setUserPoints(currentUser.points || 0);
            setPublishedCount(currentUser.published_blogs || 0);
          }
        }
      } catch (err) {
        console.error('Fetch user stats error:', err);
      }
    };

    if (username) {
      fetchUserStats();
    }
  }, [username, api]);

  useEffect(() => {
    if (allBadges.length > 0 && userPoints >= 0) {
      const earnedBadges = allBadges.filter(badge => userPoints >= badge.points_required);
      const highest = earnedBadges[earnedBadges.length - 1];
      setHighestBadge(highest ? highest.title : 'No Badge');
    }
  }, [allBadges, userPoints]);

  useEffect(() => {
    const fetchBlogs = async () => {
      if (!username) return;
      setLoading(true);
      setError(null);
      try {
        let response;
        if (activeSection === 'profile') {
          response = await api.get(`/published-blogs/?author=${username}&limit=2`);
          const fetchedBlogs = (response.data.blogs || []).map(normalizeBlog);
          setBlogs(fetchedBlogs);
          if (fetchedBlogs.length < 2 && response.data.count > fetchedBlogs.length) {
            const additionalResponse = await api.get(`/published-blogs/?author=${username}&limit=${2 - fetchedBlogs.length}&offset=${fetchedBlogs.length}`);
            const additionalBlogs = (additionalResponse.data.blogs || []).map(normalizeBlog);
            setBlogs([...fetchedBlogs, ...additionalBlogs]);
          }
        } else if (activeSection === 'blogs') {
          response = await api.get(`/blogs/?author=${username}&status=published`);
          setBlogs((response.data.results || []).map(normalizeBlog));
        }
      } catch (err) {
        console.error('Fetch blogs error:', err);
        setError(err.response?.data?.error || 'Failed to fetch blogs');
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchBlogs();
    }
  }, [activeSection, username, api]);

  useEffect(() => {
    const fetchUserActivity = async () => {
      if (!username) return;
      try {
        const response = await api.get('/all-users/');
        const userData = response.data.users.find(u => u.username === username);
        if (userData) {
          const months = [];
          const postsData = [];
          const commentsData = [];
          const likesData = [];
          const reportsData = [];
          const today = new Date();
          for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push(date.toLocaleString('default', { month: 'short' }));
            postsData.push(0);
            commentsData.push(0);
            likesData.push(0);
            reportsData.push(0);
          }

          const blogsResponse = await api.get(`/blogs/?author=${username}&status=published`);
          blogsResponse.data.results.forEach(blog => {
            const date = new Date(blog.created_at);
            const monthIndex = months.findIndex(month => {
              const monthDate = new Date(today.getFullYear(), today.getMonth() - (5 - months.indexOf(month)), 1);
              return date.getMonth() === monthDate.getMonth() && date.getFullYear() === monthDate.getFullYear();
            });
            if (monthIndex !== -1) {
              postsData[monthIndex]++;
            }
          });

          commentsData[5] = userData.comments || 0;
          likesData[5] = userData.likes || 0;
          reportsData[5] = userData.reports || 0;

          setActivityData({
            labels: months,
            posts: postsData,
            comments: commentsData,
            likes: likesData,
            reports: reportsData
          });
        }
      } catch (err) {
        console.error('Fetch user activity error:', err);
      }
    };

    if (username) {
      fetchUserActivity();
    }
  }, [username, api]);

  useEffect(() => {
    const barCtx = document.getElementById('performanceBarChart');
    let barChart = null;
    if (barCtx) {
      barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: activityData.labels,
          datasets: [
            {
              label: 'Blog Posts',
              data: activityData.posts,
              backgroundColor: `${primaryColor}80`,
              borderColor: primaryColor,
              borderWidth: 1,
              borderRadius: 4,
            },
            {
              label: 'Comments',
              data: activityData.comments,
              backgroundColor: `${primaryDark}80`,
              borderColor: primaryDark,
              borderWidth: 1,
              borderRadius: 4,
            },
            {
              label: 'Likes Received',
              data: activityData.likes,
              backgroundColor: `${primaryLight}80`,
              borderColor: primaryLight,
              borderWidth: 1,
              borderRadius: 4,
            },
            {
              label: 'Reports',
              data: activityData.reports,
              backgroundColor: `${darkMode ? '#ef4444' : '#f87171'}80`,
              borderColor: darkMode ? '#ef4444' : '#f87171',
              borderWidth: 1,
              borderRadius: 4,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Activity Count',
                color: darkMode ? '#e2e8f0' : '#4a5568',
              },
              grid: {
                color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              },
              ticks: {
                color: darkMode ? '#e2e8f0' : '#4a5568',
                stepSize: 1,
              },
            },
            x: {
              title: {
                display: true,
                text: 'Month',
                color: darkMode ? '#e2e8f0' : '#4a5568',
              },
              grid: {
                display: false,
              },
              ticks: {
                color: darkMode ? '#e2e8f0' : '#4a5568',
              },
            },
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: darkMode ? '#e2e8f0' : '#4a5568',
                boxWidth: 20,
                padding: 20,
              },
            },
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false,
              backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              titleColor: darkMode ? '#ffffff' : '#000000',
              bodyColor: darkMode ? '#e2e8f0' : '#4a5568',
              borderColor: primaryColor,
              borderWidth: 1,
              padding: 12,
              cornerRadius: 4,
            },
            annotation: {
              annotations: []
            }
          },
          interaction: {
            mode: 'index',
            intersect: false,
          },
          animation: {
            duration: 1000,
            easing: 'easeOutQuart',
          }
        },
      });
    }

    const pieCtx = document.getElementById('performancePieChart');
    let pieChart = null;
    if (pieCtx) {
      const totalPosts = activityData.posts.reduce((sum, val) => sum + val, 0);
      const totalComments = activityData.comments.reduce((sum, val) => sum + val, 0);
      const totalLikes = activityData.likes.reduce((sum, val) => sum + val, 0);
      const totalReports = activityData.reports.reduce((sum, val) => sum + val, 0);

      pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: ['Blog Posts', 'Comments', 'Likes Received', 'Reports'],
          datasets: [{
            data: [totalPosts, totalComments, totalLikes, totalReports],
            backgroundColor: [
              `${primaryColor}80`,
              `${primaryDark}80`,
              `${primaryLight}80`,
              `${darkMode ? '#ef4444' : '#f87171'}80`
            ],
            borderColor: [
              primaryColor,
              primaryDark,
              primaryLight,
              darkMode ? '#ef4444' : '#f87171'
            ],
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: darkMode ? '#e2e8f0' : '#4a5568',
                boxWidth: 20,
                padding: 20,
              },
            },
            tooltip: {
              enabled: true,
              backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              titleColor: darkMode ? '#ffffff' : '#000000',
              bodyColor: darkMode ? '#e2e8f0' : '#4a5568',
              borderColor: primaryColor,
              borderWidth: 1,
              padding: 12,
              cornerRadius: 4,
            },
          },
          animation: {
            duration: 1000,
            easing: 'easeOutQuart',
          }
        },
      });
    }

    return () => {
      if (barChart) {
        barChart.destroy();
      }
      if (pieChart) {
        pieChart.destroy();
      }
    };
  }, [activityData, darkMode, primaryColor, primaryDark, primaryLight]);

  const sortedBlogs = () => {
    if (!blogs || blogs.length === 0) return [];
    return [...blogs].sort((a, b) => {
      switch (sortOption) {
        case 'popular':
          return (b.upvotes || 0) - (a.upvotes || 0);
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        default:
          return 0;
      }
    });
  };

  const renderSectionTitle = (title) => (
    <h1
      className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
      style={{ borderColor: primaryColor }}
    >
      {title}
    </h1>
  );

  const renderEmptyMessage = () => (
    <p className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
      {loading ? 'Loading...' : 'No published blogs yet.'}
    </p>
  );

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`} style={themeStyles}>
        <Navbar activePage="dashboard" />
        <div className="container mx-auto px-4 py-8 pt-28 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: primaryColor }}></div>
          <p className="mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`} style={themeStyles}>
        <Navbar activePage="dashboard" />
        <div className="container mx-auto px-4 py-8 pt-28 text-center">
          <p className="text-red-500">{error}</p>
          <Link to="/" className="text-blue-500 hover:underline">Return to home</Link>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}
      style={themeStyles}
    >
      <Navbar activePage="dashboard" />

      <div className="pt-20 min-h-screen">
        <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="container mx-auto px-4">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveSection('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeSection === 'profile'
                  ? `${darkMode ? 'text-white' : 'text-gray-900'}`
                  : `${darkMode ? 'text-gray-400 hover:text-white hover:border-gray-400' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'} border-transparent`}`}
                style={{ borderColor: activeSection === 'profile' ? primaryColor : 'transparent' }}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveSection('blogs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeSection === 'blogs'
                  ? `${darkMode ? 'text-white' : 'text-gray-900'}`
                  : `${darkMode ? 'text-gray-400 hover:text-white hover:border-gray-400' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'} border-transparent`}`}
                style={{ borderColor: activeSection === 'blogs' ? primaryColor : 'transparent' }}
              >
                Publications
              </button>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              {error && (
                <div className={`p-4 mb-4 rounded-lg ${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'}`}>
                  {error}
                </div>
              )}

              {loading && (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
                </div>
              )}

              {!loading && activeSection === 'profile' && (
                <div>
                  {renderSectionTitle(`${userData.username}'s Profile`)}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className={`rounded-lg p-6 shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className="flex flex-col md:flex-row items-center mb-6">
                        <img
                          src={userData.avatar_url || avatar}
                          alt="Profile"
                          className="w-20 h-20 rounded-full border-4 object-cover mr-0 md:mr-6 mb-4 md:mb-0"
                          style={{ borderColor: primaryColor }}
                        />
                        <div className="text-center md:text-left">
                          <h2 className="text-xl font-bold">{userData.username}</h2>
                          <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{userData.job_title || 'Member'}</p>
                          <div className="flex justify-center md:justify-start space-x-2">
                            <span
                              className="px-3 py-1 rounded-full text-xs text-white"
                              style={{ backgroundColor: primaryColor }}
                            >
                              {userData.university || 'TechSage'} {userData.role || 'User'}
                            </span>
                            {userData.is_verified && (
                              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className={`text-lg font-semibold mb-3 pb-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          About
                        </h3>
                        <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {userData.bio || 'No bio provided yet.'}
                        </p>
                        <div className="flex space-x-4">
                          <button
                            className="flex items-center"
                            style={{ color: primaryColor }}
                          >
                            <i className="fas fa-envelope mr-1"></i> Contact
                          </button>
                          <button
                            className="flex items-center"
                            style={{ color: primaryColor }}
                          >
                            <i className="fas fa-share-alt mr-1"></i> Share Profile
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { value: publishedCount, label: 'Total Publications' },
                        { value: userPoints, label: 'Points' },
                        { value: highestBadge, label: 'Highest Badge' }
                      ].map((item, index) => (
                        <div key={index} className={`rounded-lg p-4 shadow-sm text-center transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <div
                            className="text-3xl font-bold mb-1"
                            style={{ color: primaryColor }}
                          >
                            {item.value}
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`rounded-lg p-6 shadow-sm mb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      User Activity
                    </h3>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 h-96">
                        <canvas id="performanceBarChart"></canvas>
                      </div>
                      <div className="flex-1 h-96">
                        <canvas id="performancePieChart"></canvas>
                      </div>
                    </div>
                  </div>

                  {/* <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2
                        className="text-xl font-bold pb-2 border-b-2 inline-block"
                        style={{ borderColor: primaryColor }}
                      >
                        Recent Blogs
                      </h2>
                      <button
                        onClick={() => setActiveSection('blogs')}
                        className="px-4 py-2 rounded-md"
                        style={{ backgroundColor: primaryColor, color: 'white' }}
                      >
                        View All Blogs
                      </button>
                    </div>
                    {blogs && blogs.length > 0 ? (
                      <div className="space-y-6">
                        {blogs.map((blog, index) => (
                          <BlogCardDash
                            key={index}
                            blog={blog}
                            darkMode={darkMode}
                            primaryColor={primaryColor}
                            primaryDark={primaryDark}
                            showUpvotes={true}
                          />
                        ))}
                      </div>
                    ) : renderEmptyMessage()}
                  </div> */}
                </div>
              )}

              {!loading && activeSection === 'blogs' && (
                <div>
                  {renderSectionTitle(`${userData.username}'s Blogs`)}

                  <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <select
                      className={`border rounded px-3 py-2 w-full md:w-64 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-800'}`}
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>

                  {sortedBlogs().length > 0 ? (
                    <div className="space-y-6">
                      {sortedBlogs().map((blog, index) => (
                        <BlogCardDash
                          key={index}
                          blog={blog}
                          darkMode={darkMode}
                          primaryColor={primaryColor}
                          primaryDark={primaryDark}
                          showUpvotes={true}
                        />
                      ))}
                    </div>
                  ) : renderEmptyMessage()}
                </div>
              )}
            </div>

            <div className="lg:w-80">
              <Sidebar />
              <TopContributor/>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default OtherDashboard;