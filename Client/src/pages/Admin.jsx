import { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { formatDate } from '../utils/blogUtils';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BadgesSection from '../components/BadgesSection.jsx';
import PopupModal from '../components/PopupModal';
import avatar from '../../src/assets/user.jpg';

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
  // New state for chart data
  const [chartData, setChartData] = useState({
    labels: [],
    userData: [],
    blogData: [],
    badgeData: []
  });
  
  // New states for recent activity and trending blogs
  const [recentActivity, setRecentActivity] = useState([]);
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({ message: '', onConfirm: null });

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

  // New function to fetch recent activity from backend
  const fetchRecentActivity = async () => {
    try {
      // Fetch recent blog activities
      const blogsResponse = await api.get('/published-blogs/?limit=10');
      const recentBlogs = blogsResponse.data.blogs || [];
      
      // Fetch recent comments
      const commentsResponse = await api.get('/comments/all/?limit=10');
      const recentComments = commentsResponse.data.comments || [];
      
      // Fetch recent reports
      const reportsResponse = await api.get('/reports/?limit=10');
      const recentReports = reportsResponse.data.reports || [];
      
      // Fetch recent user activities (signups/logins)
      const usersResponse = await api.get('/all-users/');
      const recentUsers = usersResponse.data.users || [];
      
      // Combine all activities with timestamps
      const allActivities = [
        ...recentBlogs.map(blog => ({
          id: blog.id,
          type: 'publish',
          user: Array.isArray(blog.authors) ? blog.authors[0]?.username : 
                typeof blog.author === 'object' ? blog.author.username : blog.author,
          timestamp: blog.published_at || blog.created_at,
          description: `Published blog: ${blog.title.substring(0, 30)}${blog.title.length > 30 ? '...' : ''}`
        })),
        ...recentComments.map(comment => ({
          id: comment.id,
          type: 'comment',
          user: typeof comment.author === 'object' ? comment.author.username : comment.author,
          timestamp: comment.created_at,
          description: `Commented: ${comment.content.substring(0, 30)}${comment.content.length > 30 ? '...' : ''}`
        })),
        ...recentReports.map(report => ({
          id: report.id,
          type: 'report',
          user: typeof report.reporter === 'object' ? report.reporter.username : report.reporter,
          timestamp: report.created_at,
          description: `Reported: ${report.reason.substring(0, 30)}${report.reason.length > 30 ? '...' : ''}`
        })),
        ...recentUsers.map(user => ({
          id: user.id,
          type: 'signup',
          user: user.username,
          timestamp: user.created_at,
          description: `New user registered`
        }))
      ];
      
      // Sort by timestamp (most recent first) and take first 10
      const sortedActivities = allActivities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);
      
      setRecentActivity(sortedActivities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // Fallback to mock data if backend requests fail
      const mockActivity = [
        { id: 1, type: 'login', user: 'john_doe', timestamp: new Date(Date.now() - 3600000), description: 'User logged in' },
        { id: 2, type: 'signup', user: 'new_user', timestamp: new Date(Date.now() - 7200000), description: 'New user registered' },
        { id: 3, type: 'publish', user: 'author1', timestamp: new Date(Date.now() - 10800000), description: 'Blog published' },
        { id: 4, type: 'comment', user: 'reader1', timestamp: new Date(Date.now() - 14400000), description: 'New comment added' },
        { id: 5, type: 'login', user: 'moderator1', timestamp: new Date(Date.now() - 18000000), description: 'Moderator logged in' },
      ];
      setRecentActivity(mockActivity);
    }
  };

  // New function to fetch trending blogs
  const fetchTrendingBlogs = async () => {
    try {
      const response = await api.get('/published-blogs/');
      if (response.data && response.data.blogs) {
        // Sort blogs by upvotes to get trending ones
        const sortedBlogs = [...response.data.blogs].sort((a, b) => {
          const aUpvotes = a.upvotes?.length || a.upvote_count || 0;
          const bUpvotes = b.upvotes?.length || b.upvote_count || 0;
          return bUpvotes - aUpvotes;
        });
        // Get top 5 trending blogs as per requirement
        setTrendingBlogs(sortedBlogs.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching trending blogs:', error);
    }
  };

  const handleDeleteUser = async (username) => {
    setPopupData({
      message: 'Are you sure you want to permanently delete this user account and all associated data? This action cannot be undone.',
      onConfirm: () => {
        setShowPopup(false);
        performDeleteUser(username);
      }
    });
    setShowPopup(true);
  };

  const performDeleteUser = async (username) => {
    try {
      // First check if current user is admin
      if (user?.role !== 'admin') {
        toast.error('Only admins can delete users');
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
      toast.success('User and all associated data deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user: ${error.response?.data?.error || error.message}`);
    }
    
    try {
      // First check if current user is admin
      if (user?.role !== 'admin') {
        toast.error('Only admins can delete users');
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
      toast.success('User and all associated data deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleApproveBlog = async (blogId) => {
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
      toast.success('Blog approved successfully');
    } catch (error) {
      console.error('Error approving blog:', error);
      toast.error('Failed to approve blog');
      fetchBlogs();
    }
  };

  const handleRejectBlog = async (blogId) => {
    setPopupData({
      message: 'Are you sure you want to permanently delete this blog? This action cannot be undone.',
      onConfirm: () => {
        setShowPopup(false);
        performRejectBlog(blogId);
      }
    });
    setShowPopup(true);
  };

  const performRejectBlog = async (blogId) => {
    try {
      await api.delete(`/blogs/mod/delete/${blogId}/`);
      fetchBlogs();
      toast.success('Blog deleted successfully');
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
    
    try {
      await api.delete(`/blogs/mod/delete/${blogId}/`);
      fetchBlogs();
      toast.success('Blog deleted successfully');
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
  };

  // Fetch dynamic chart data
  const fetchChartData = async () => {
    try {
      // Fetch users for the last 6 months
      const userResponse = await api.get('/all-users/');
      const allUsers = userResponse.data.users;
      
      // Generate last 6 months
      const months = [];
      const userData = [];
      const blogData = [];
      const badgeData = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthLabel = date.toLocaleString('default', { month: 'short' });
        months.push(monthLabel);
        
        // Count users created in this month
        const userCount = allUsers.filter(user => {
          const createdDate = new Date(user.created_at);
          return createdDate.getMonth() === date.getMonth() && 
                 createdDate.getFullYear() === date.getFullYear();
        }).length;
        userData.push(userCount);
        
        // For now, we'll use placeholder data for blogs and badges
        // In a real implementation, you would fetch actual data
        blogData.push(Math.floor(Math.random() * 20) + 5);
        badgeData.push(Math.floor(Math.random() * 10) + 1);
      }
      
      setChartData({
        labels: months,
        userData: userData,
        blogData: blogData,
        badgeData: badgeData
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
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
        } else if (activeSection === 'profile') {
          await fetchChartData();
          // Fetch recent activity and trending blogs for profile section
          await fetchRecentActivity();
          await fetchTrendingBlogs();
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
            labels: chartData.labels,
            datasets: [
              {
                label: 'New Users',
                data: chartData.userData,
                borderColor: primaryColor,
                backgroundColor: darkMode ? `${primaryColor}20` : `${primaryColor}10`,
                tension: 0.3,
                fill: true
              },
              {
                label: 'Published Blogs',
                data: chartData.blogData,
                borderColor: primaryDark,
                backgroundColor: darkMode ? `${primaryDark}20` : `${primaryDark}10`,
                tension: 0.3,
                fill: true
              },
              {
                label: 'Badges Awarded',
                data: chartData.badgeData,
                borderColor: primaryLight,
                backgroundColor: darkMode ? `${primaryLight}20` : `${primaryLight}10`,
                tension: 0.3,
                fill: true
              }
            ]
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
  }, [activeSection, darkMode, primaryColor, chartData]);

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
          <div className={`w-full md:w-64 transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
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
                        <div key={user.username} className={`p-4 rounded-xl transition-all duration-300 hover:shadow-md ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} mb-4 flex items-center justify-between`}>
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
                        <div key={blog.id} className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-md ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'}`}>
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
                        {/* User Info - Plain design instead of card */}
                        <div className="lg:col-span-2">
                            <div className="flex flex-col md:flex-row items-center mb-6">
                                <div className="relative">
                                    <img
                                        src={user?.avatar_url || avatar}
                                        alt="Profile"
                                        className="w-24 h-24 rounded-full object-cover mr-0 md:mr-6 mb-4 md:mb-0 border-4"
                                        style={{ borderColor: primaryColor }}
                                    />
                                    {user?.is_verified && (
                                        <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1">
                                            <i className="fas fa-check text-white text-xs"></i>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center md:text-left md:ml-6">
                                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.username || 'Admin'}</h2>
                                    <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{user?.job_title || 'System Administrator'}</p>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                        <span 
                                            className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            {user?.university || 'TechSage'} {user?.role || 'Admin'}
                                        </span>
                                        {user?.is_verified && (
                                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className={`text-lg font-semibold mb-3 pb-2 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>About</h3>
                                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {user?.bio || 'Responsible for maintaining the integrity and security of the TechSage platform.'}
                                </p>
                            </div>
                        </div>
                        {/* Statistics - Plain design instead of cards */}
                        <div className="space-y-4">
                            <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
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
                                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Users Managed</div>
                                    </div>
                                </div>
                            </div>
                            <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
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
                                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Blogs Reviewed</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Platform Activity Chart - Plain design instead of card */}
                    <div className={`p-6 mb-6 h-80 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            <i className="fas fa-chart-line mr-2" style={{ color: primaryColor }}></i>Platform Activity
                        </h3>
                        <canvas id="performanceChart"></canvas>
                    </div>
                    
                    {/* Recent Activity Section - Plain design instead of card */}
                    <div className={`p-6 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            <i className="fas fa-history mr-2" style={{ color: primaryColor }}></i>Recent Activity
                        </h3>
                        {recentActivity.length > 0 ? (
                            <div className="space-y-3">
                                {recentActivity.map(activity => (
                                    <div key={`activity-${activity.id}`} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                                    activity.type === 'login' ? 'bg-blue-500/20 text-blue-500' :
                                                    activity.type === 'signup' ? 'bg-green-500/20 text-green-500' :
                                                    activity.type === 'publish' ? 'bg-purple-500/20 text-purple-500' :
                                                    activity.type === 'comment' ? 'bg-yellow-500/20 text-yellow-500' :
                                                    activity.type === 'report' ? 'bg-orange-500/20 text-orange-500' : 'bg-gray-500/20 text-gray-500'
                                                }`}>
                                                    <i className={`fas ${
                                                        activity.type === 'login' ? 'fa-sign-in-alt' :
                                                        activity.type === 'signup' ? 'fa-user-plus' :
                                                        activity.type === 'publish' ? 'fa-book' :
                                                        activity.type === 'comment' ? 'fa-comment' :
                                                        activity.type === 'report' ? 'fa-flag' : 'fa-info-circle'
                                                    }`}></i>
                                                </div>
                                                <div>
                                                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                        {activity.description}
                                                    </p>
                                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        by {typeof activity.user === 'object' ? activity.user.username : activity.user}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {formatDate(activity.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={`text-center py-6 rounded-xl ${darkMode ? 'bg-gray-750 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                                <i className="fas fa-history text-2xl mb-2"></i>
                                <p>No recent activity found</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Trending Blogs Section - Plain design instead of card */}
                    <div className={`p-6 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            <i className="fas fa-fire mr-2" style={{ color: primaryColor }}></i>Trending Blogs
                        </h3>
                        {trendingBlogs.length > 0 ? (
                            <div className="space-y-4">
                                {trendingBlogs.map(blog => (
                                    <div 
                                        key={`trending-${blog.id}`} 
                                        className={`p-4 rounded-xl ${darkMode ? 'bg-gray-750 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}
                                        onClick={() => navigate(`/blog/${blog.id}`)}
                                    >
                                        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{blog.title}</h4>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="flex items-center">
                                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    by {Array.isArray(blog.authors) ? blog.authors[0]?.username : 
                                                       typeof blog.author === 'object' ? blog.author.username : blog.author}
                                                </span>
                                            </div>
                                            <div className="flex items-center" title={`${blog.upvotes?.length || blog.upvote_count || 0} upvotes`}>
                                                <i className="fas fa-arrow-up mr-1 text-green-500"></i>
                                                <span className="text-sm font-medium">{blog.upvotes?.length || blog.upvote_count || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={`text-center py-6 rounded-xl ${darkMode ? 'bg-gray-750 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                                <i className="fas fa-book-open text-2xl mb-2"></i>
                                <p>No trending blogs found</p>
                            </div>
                        )}
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <PopupModal
        show={showPopup}
        message={popupData.message}
        type="confirm"
        onConfirm={popupData.onConfirm}
        onCancel={() => setShowPopup(false)}
        primaryColor={primaryColor}
        darkMode={darkMode}
        title="Confirm Action"
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
};

export default AdminDashboard;