import { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { formatDate } from '../utils/blogUtils';
import { confirmAlert } from 'react-confirm-alert';
import BadgesSection from '../components/BadgesSection.jsx';
import avatar from '../../src/assets/user.jpg';
import 'react-confirm-alert/src/react-confirm-alert.css';

const AdminDashboard = () => {
  const performanceChartRef = useRef(null);
  const [activeSection, setActiveSection] = useState('users');
  const { user, api } = useAuth();
  const { darkMode, primaryColor, shadeColor } = useTheme();
  
  const primaryDark = shadeColor(primaryColor, -20);
  const primaryLight = shadeColor(primaryColor, 20);

  const themeStyles = {
    '--primary-color': primaryColor,
    '--primary-dark': primaryDark,
    '--primary-light': primaryLight,
  };
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [badges, setBadges] = useState([]); // New state for badges
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/all-users/');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/published-blogs/');
      setBlogs(response.data.blogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const response = await api.get('/badges/');
      setBadges(response.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
      alert('Failed to fetch badges');
    } finally {
      setLoading(false);
    }
  };

const handleDeleteUser = async (username) => {
  confirmAlert({
    title: 'Delete User',
    message: 'Are you sure you want to permanently delete this user account and all associated data?',
    buttons: [
      {
        label: 'Yes',
        onClick: async () => {
          try {
            // First check if current user is admin
            if (user?.role !== 'admin') {
              alert('Only admins can delete users');
              return;
            }

            // Make the delete request
            await api.delete(`/users/${username}/delete/`, {
              data: {
                username: user.username, // Send admin's username for verification
                password: prompt('Please enter your admin password to confirm:') // Ask for password confirmation
              }
            });
            
            fetchUsers(); // Refresh the user list
            alert('User and all associated data deleted successfully');
          } catch (error) {
            console.error('Error deleting user:', error);
            alert(`Failed to delete user: ${error.response?.data?.error || error.message}`);
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

  const handleApproveBlog = async (blogId) => {
    confirmAlert({
      title: 'Approve Blog',
      message: 'Are you sure you want to approve this blog?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              setBlogs(prevBlogs =>
                prevBlogs.map(blog =>
                  blog.id === blogId
                    ? { ...blog, is_reviewed: true, reviewed_by: user.username }
                    : blog
                ).sort((a, b) => {
                  if (a.is_reviewed && !b.is_reviewed) return 1;
                  if (!a.is_reviewed && b.is_reviewed) return -1;
                  return 0;
                })
              );
              await api.post(`/blogs/review/${blogId}/`, {
                reviewer: user.username
              });
              fetchBlogs();
            } catch (error) {
              console.error('Error approving blog:', error);
              alert('Failed to approve blog');
              fetchBlogs();
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

  const handleRejectBlog = async (blogId) => {
    confirmAlert({
      title: 'Reject Blog',
      message: 'Are you sure you want to permanently delete this blog?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await api.delete(`/blogs/mod/delete/${blogId}/`);
              fetchBlogs();
              alert('Blog deleted successfully');
            } catch (error) {
              console.error('Error deleting blog:', error);
              alert('Failed to delete blog');
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeSection === 'users') {
          await fetchUsers();
        } else if (activeSection === 'blogs') {
          await fetchBlogs();
        } else if (activeSection === 'badges') {
          await fetchBadges();
        }
      } catch (error) {
        console.error(`Error fetching ${activeSection} data:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === 'profile') {
      const ctx = document.getElementById('performanceChart');
      if (ctx) {
        if (performanceChartRef.current) {
          performanceChartRef.current.destroy();
        }

        performanceChartRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Admin Actions',
              data: [15, 22, 18, 25, 20, 30],
              borderColor: primaryColor,
              backgroundColor: darkMode ? `${primaryColor}20` : `${primaryColor}10`,
              tension: 0.3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
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
      }
    }
  }, [activeSection, darkMode, primaryColor]);

  const toggleProfilePanel = (e) => {
    e.stopPropagation();
    setShowProfilePanel(!showProfilePanel);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (showProfilePanel) {
        setShowProfilePanel(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showProfilePanel]);

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  const handleProfileClick = (username) => {
    navigate(`/dashboard/${username}`);
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100' : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800'}`}
      style={themeStyles}
    >
      <Navbar activePage="admin" onProfileClick={toggleProfilePanel} />
      <div className="pt-20 min-h-screen">
        <div className="flex flex-col md:flex-row">
          <div className={`w-full md:w-64 transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r`}>
            <div className="p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveSection('profile')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center transition-all duration-300 ${
                      activeSection === 'profile' 
                        ? 'font-semibold shadow-md'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: activeSection === 'profile' 
                        ? darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'
                        : 'transparent',
                      color: activeSection === 'profile'
                        ? primaryColor
                        : darkMode ? '#e2e8f0' : '#4a5568',
                    }}
                  >
                    <i className="fas fa-user-graduate mr-2"></i>My Profile
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('users')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center transition-all duration-300 ${
                      activeSection === 'users' 
                        ? 'font-semibold shadow-md'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: activeSection === 'users' 
                        ? darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'
                        : 'transparent',
                      color: activeSection === 'users'
                        ? primaryColor
                        : darkMode ? '#e2e8f0' : '#4a5568',
                    }}
                  >
                    <i className="fas fa-users mr-3"></i>
                    All Users
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('blogs')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center transition-all duration-300 ${
                      activeSection === 'blogs' 
                        ? 'font-semibold shadow-md'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: activeSection === 'blogs' 
                        ? darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'
                        : 'transparent',
                      color: activeSection === 'blogs'
                        ? primaryColor
                        : darkMode ? '#e2e8f0' : '#4a5568',
                    }}
                  >
                    <i className="fas fa-book-open mr-3"></i>
                    All Blogs
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('badges')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center transition-all duration-300 ${
                      activeSection === 'badges' 
                        ? 'font-semibold shadow-md'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: activeSection === 'badges' 
                        ? darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'
                        : 'transparent',
                      color: activeSection === 'badges'
                        ? primaryColor
                        : darkMode ? '#e2e8f0' : '#4a5568',
                    }}
                  >
                    <i className="fas fa-award mr-3"></i>
                    Badges
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className={`flex-1 p-6 transition-colors duration-300 ${darkMode ? 'bg-transparent' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto">
              {loading && (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
                </div>
              )}
              {activeSection === 'users' && !loading && (
                <div>
                  <h1 
                    className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                    style={{ borderColor: primaryColor }}
                  >
                    <i className="fas fa-users mr-2"></i>All Users
                  </h1>
                  <div className="space-y-4">
                    {users.length === 0 ? (
                      <div className={`text-center py-10 rounded-xl ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                        <i className="fas fa-users text-3xl mb-4"></i>
                        <p>No users found</p>
                      </div>
                    ) : (
                      users.map(user => (
                        <div key={user.username} className={`p-4 rounded-xl transition-all duration-300 hover:shadow-md ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} mb-4 flex items-center justify-between border border-gray-200 dark:border-gray-700`}>
                          <div className="flex items-center">
                            <img
                              src={user.avatar_url || avatar}
                              alt={user.username}
                              className="w-12 h-12 rounded-full mr-4 object-cover shadow"
                            />
                            <div>
                              <h4
                                className={`font-semibold cursor-pointer transition-colors duration-200 ${darkMode ? 'text-white' : 'text-gray-800'} hover:text-[var(--primary-color)]`}
                                onClick={() => handleProfileClick(user.username)}
                                style={{ color: darkMode ? 'inherit' : 'inherit' }}
                              >
                                {user.username}
                                <span 
                                  className="ml-2 px-3 py-1 rounded-full text-sm font-semibold"
                                  style={{ 
                                    backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                                    color: '#3b82f6'
                                  }}
                                >
                                  {user.role}
                                </span>
                              </h4>
                              <p className={`text-xs transition-colors duration-200 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {user.email} | Joined: {formatDate(user.created_at)}
                              </p>
                            </div>
                          </div>
                          <button
                            className="text-red-500 text-sm flex items-center hover:opacity-80 transition-all duration-200 px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleDeleteUser(user.username)}
                            style={{ color: darkMode ? '#ef4444' : '#ef4444' }}
                          >
                            <i className="fas fa-trash mr-1"></i> Delete
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              {activeSection === 'blogs' && !loading && (
                <div>
                  <h1 
                    className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                    style={{ borderColor: primaryColor }}
                  >
                    All Blogs
                  </h1>
                  <div className="space-y-4">
                    {blogs.length === 0 ? (
                      <div className={`text-center py-10 rounded-xl ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                        <i className="fas fa-book-open text-3xl mb-4"></i>
                        <p>No blogs found</p>
                      </div>
                    ) : (
                      blogs.map(blog => (
                        <div key={blog.id} className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-md ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} border border-gray-200 dark:border-gray-700`}>
                          <div
                            className="h-24 md:h-full rounded-lg bg-cover bg-center cursor-pointer transition-transform duration-300 hover:scale-105"
                            style={{ backgroundImage: `url('${blog.thumbnail_url}')`, backgroundColor: darkMode ? '#374151' : '#e5e7eb' }}
                            onClick={() => handleBlogClick(blog.id)}
                          ></div>
                          <div>
                            <h3
                              className={`text-lg font-semibold transition-colors duration-200 ${darkMode ? 'text-white' : 'text-gray-800'} cursor-pointer hover:text-[var(--primary-color)]`}
                              onClick={() => handleBlogClick(blog.id)}
                            >
                              {blog.title}
                            </h3>
                            <div className={`flex justify-between text-sm mt-1 transition-colors duration-200 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <span>{formatDate(blog.published_at)}</span>
                              <span>{blog.read_time}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {blog.is_reviewed ? (
                                <span 
                                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                  style={{ 
                                    backgroundColor: darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                                    color: '#22c55e'
                                  }}
                                >
                                  <i className="fas fa-check mr-1"></i> Approved
                                </span>
                              ) : (
                                <>
                                  <button
                                    className="text-green-500 text-sm flex items-center hover:opacity-80 transition-all duration-200 px-3 py-1 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                                    onClick={() => handleApproveBlog(blog.id)}
                                    style={{ color: darkMode ? '#22c55e' : '#22c55e' }}
                                  >
                                    <i className="fas fa-check mr-1"></i> Approve
                                  </button>
                                  <button
                                    className="text-red-500 text-sm flex items-center hover:opacity-80 transition-all duration-200 px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={() => handleRejectBlog(blog.id)}
                                    style={{ color: darkMode ? '#ef4444' : '#ef4444' }}
                                  >
                                    <i className="fas fa-trash mr-1"></i> Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              {activeSection === 'badges' && !loading && (
                <BadgesSection badges={badges} fetchBadges={fetchBadges} />
              )}
              {activeSection === 'profile' && (
                <div>
                  <h1 
                    className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                    style={{ borderColor: primaryColor }}
                  >
                    My Profile
                  </h1>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className={`lg:col-span-2 rounded-2xl p-6 shadow-lg transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="flex flex-col md:flex-row items-center mb-6">
                        <div className="relative">
                          <img
                            src={user?.avatar_url || avatar}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover mr-0 md:mr-6 mb-4 md:mb-0 shadow-lg border-4"
                            style={{ borderColor: primaryColor }}
                          />
                          {user?.is_verified && (
                            <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1 shadow-md">
                              <i className="fas fa-check text-white text-xs"></i>
                            </div>
                          )}
                        </div>
                        <div className="text-center md:text-left md:ml-6">
                          <h2 className={`text-2xl font-bold transition-colors duration-200 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.username || 'Admin'}</h2>
                          <p className={`mb-2 transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{user?.job_title || 'System Administrator'}</p>
                          <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <span 
                              className="px-3 py-1 rounded-full text-xs font-semibold text-white shadow"
                              style={{ backgroundColor: primaryColor }}
                            >
                              {user?.university || 'TechSage'} {user?.role || 'Admin'}
                            </span>
                            {user?.is_verified && (
                              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold mb-3 pb-2 border-b transition-colors duration-200 ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>About</h3>
                        <p className={`mb-4 transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {user?.bio || 'Responsible for maintaining the integrity and security of the TechSage platform.'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className={`rounded-2xl p-4 shadow-md transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex items-center">
                          <div className="flex justify-center mr-3">
                            <i className="fas fa-users text-xl" style={{ color: primaryColor }}></i>
                          </div>
                          <div>
                            <div 
                              className="text-xl font-bold"
                              style={{ color: primaryColor }}
                            >
                              {users.length}
                            </div>
                            <div className={`text-sm transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Users Managed</div>
                          </div>
                        </div>
                      </div>
                      <div className={`rounded-2xl p-4 shadow-md transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex items-center">
                          <div className="flex justify-center mr-3">
                            <i className="fas fa-newspaper text-xl" style={{ color: primaryColor }}></i>
                          </div>
                          <div>
                            <div 
                              className="text-xl font-bold"
                              style={{ color: primaryColor }}
                            >
                              {blogs.length}
                            </div>
                            <div className={`text-sm transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Blogs Reviewed</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`rounded-2xl p-6 mb-6 h-80 transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      <i className="fas fa-chart-line mr-2" style={{ color: primaryColor }}></i>Admin Performance
                    </h3>
                    <canvas id="performanceChart"></canvas>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;