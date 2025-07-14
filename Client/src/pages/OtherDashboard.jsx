import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { Chart } from 'chart.js/auto';

const OtherDashboard = () => {
  const { username } = useParams();
  const { primaryColor, darkMode, shadeColor } = useTheme();
  const { api } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [performanceChart, setPerformanceChart] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate color variants
  const primaryDark = shadeColor(primaryColor, -20);
  const primaryLight = shadeColor(primaryColor, 20);

  // Dynamic style variables for theme colors
  const themeStyles = {
    '--primary-color': primaryColor,
    '--primary-dark': primaryDark,
    '--primary-light': primaryLight,
  };

  const getBadge = () => {
    if (!userData?.points) return 'Newbie';
    if (userData.points < 100) return 'Beginner';
    if (userData.points < 500) return 'Contributor';
    if (userData.points < 1000) return 'Expert';
    return 'Master';
  };

  // Fetch user data when component mounts or username changes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/user/${username}`);
        setUserData(response.data);
        setError(null);
      } catch (err) {
        setError('User not found');
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username, api]);

  // Initialize chart when component mounts
  useEffect(() => {
    if (!userData) return;

    const ctx = document.getElementById('performanceChart');
    if (ctx && !performanceChart) {
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Blog Views',
            data: [1200, 1900, 1500, 2200, 1800, 2500],
            borderColor: primaryColor,
            backgroundColor: darkMode
              ? `${primaryColor}20`
              : `${primaryColor}10`,
            tension: 0.3,
            fill: true
          }, {
            label: 'Engagement Rate',
            data: [65, 59, 70, 72, 75, 78],
            borderColor: primaryDark,
            backgroundColor: darkMode
              ? `${primaryDark}20`
              : `${primaryDark}10`,
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                color: darkMode ? '#e2e8f0' : '#4a5568'
              }
            },
            x: {
              grid: {
                color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                color: darkMode ? '#e2e8f0' : '#4a5568'
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: darkMode ? '#e2e8f0' : '#4a5568'
              }
            }
          }
        }
      });

      setPerformanceChart(chart);

      return () => {
        if (chart) {
          chart.destroy();
        }
      };
    }
  }, [darkMode, primaryColor, primaryDark, userData, performanceChart]);

  const publications = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      title: 'Quantum Computing Breakthroughs in Error Correction',
      date: 'May 15, 2025',
      readTime: '5 min read',
      views: 1200,
      likes: 124
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      title: 'New Algorithm Revolutionizes Complex Quantum Calculations',
      date: 'June 10, 2025',
      readTime: '4 min read',
      views: 980,
      likes: 85
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      title: 'Global Quantum Research Scholarship Program Expands',
      date: 'June 8, 2025',
      readTime: '6 min read',
      views: 1500,
      likes: 210
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      title: 'Community Outreach Programs Show Impact on STEM Education',
      date: 'June 5, 2025',
      readTime: '7 min read',
      views: 890,
      likes: 76
    }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}>
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
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}>
        <Navbar activePage="dashboard" />
        <div className="container mx-auto px-4 py-8 pt-28 text-center">
          <p className="text-red-500">{error}</p>
          <Link to="/" className="text-blue-500 hover:underline">Return to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}
      style={themeStyles}
    >
      <Navbar activePage="dashboard" />

      <div className="pt-20 min-h-screen">
        {/* Top Navigation Tabs */}
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
            {/* Main Content */}
            <div className="flex-1 max-w-300">
              {activeSection === 'profile' && userData && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className={`rounded-lg p-6 shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className="flex flex-col md:flex-row items-center mb-6">
                        <img
                          src={userData.avatar_url || "https://randomuser.me/api/portraits/women/44.jpg"}
                          alt="Profile"
                          className="w-20 h-20 rounded-full border-4 object-cover mr-0 md:mr-6 mb-4 md:mb-0"
                          style={{ borderColor: primaryColor }}
                        />
                        <div className="text-center md:text-left">
                          <h2 className="text-xl font-bold">{userData.username}</h2>
                          <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{userData.job_title || 'Researcher'}</p>
                          <div className="flex justify-center md:justify-start space-x-2">
                            <span
                              className="px-3 py-1 rounded-full text-xs text-white"
                              style={{ backgroundColor: primaryColor }}
                            >
                              {userData.university || 'University'} {userData.role || 'Member'}
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
                        { value: userData.total_publications || '0', label: 'Total Publications' },
                        { value: userData.followers || '0', label: 'Followers' },
                        { value: '4.7', label: 'Avg. Reading Time (min)' },
                        { value: getBadge(), label: 'Badge' }
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

                  <div className={`rounded-lg p-4 shadow-sm mb-6 h-80 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <canvas id="performanceChart"></canvas>
                  </div>

                  <div>
                    <h2
                      className="text-xl font-bold mb-4 pb-2 border-b-2 inline-block"
                      style={{ borderColor: primaryColor }}
                    >
                      Recent Publications
                    </h2>
                    <div className="space-y-6">
                      {publications.slice(0, 2).map((pub, index) => (
                        <div key={index} className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <div
                            className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                            style={{ backgroundImage: `url('${pub.image}')` }}
                          ></div>
                          <div>
                            <h3 className="text-lg font-semibold">{pub.title}</h3>
                            <div className={`flex justify-between text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <span>{pub.date}</span>
                              <span>{pub.readTime}</span>
                            </div>
                            <div className="flex space-x-4 mt-2">
                              <button
                                className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                              >
                                <i className="fas fa-eye mr-1"></i> {pub.views}
                              </button>
                              <button
                                className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                              >
                                <i className="fas fa-heart mr-1"></i> {pub.likes}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'blogs' && (
                <div>
                  <h1
                    className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                    style={{ borderColor: primaryColor }}
                  >
                    Publications
                  </h1>

                  <div className="mb-6">
                    <select className={`border rounded px-3 py-2 w-full md:w-64 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-800'}`}>
                      <option value="all">All Publications</option>
                      <option value="popular">Most Popular</option>
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>

                  <div className="space-y-6">
                    {publications.map((pub, index) => (
                      <div key={index} className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div
                          className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                          style={{ backgroundImage: `url('${pub.image}')` }}
                        ></div>
                        <div>
                          <h3 className="text-lg font-semibold">{pub.title}</h3>
                          <div className={`flex justify-between text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span>{pub.date}</span>
                            <span>{pub.readTime}</span>
                          </div>
                          <div className="flex space-x-4 mt-2">
                            <button
                              className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                              style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                            >
                              <i className="fas fa-eye mr-1"></i> {pub.views}
                            </button>
                            <button
                              className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                              style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                            >
                              <i className="fas fa-heart mr-1"></i> {pub.likes}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:w-100">
              <Sidebar />
            </div>
          </div>

          {/* Latest Research Section */}
          <section className={`py-16 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="container mx-auto px-4">
              <h2 className={`text-3xl font-bold mb-4 relative pb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Latest Research
                <span className="absolute bottom-0 left-0 w-16 h-1" style={{ backgroundColor: primaryColor }}></span>
              </h2>
              <p className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Explore the latest academic publications from our community
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
                    title: 'Quantum Computing Breakthroughs'
                  },
                  {
                    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
                    title: 'Sustainable Energy Solutions'
                  },
                  {
                    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
                    title: 'AI in Healthcare Innovations'
                  },
                  {
                    image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
                    title: 'Advanced Robotics Systems'
                  }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="relative h-48 rounded-lg overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <h3 className="absolute bottom-0 left-0 w-full p-4 text-white text-lg font-semibold translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      {item.title}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default OtherDashboard;