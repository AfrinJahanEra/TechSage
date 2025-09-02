import { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import BlogCardDash from '../components/BlogCardDash';
import { formatDate } from '../utils/blogUtils';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModeratorReports from '../components/ModeratorReports';
import PopupModal from '../components/PopupModal';
import avatar from '../../src/assets/user.jpg';

const ModeratorDashboard = () => {
    const performanceChartRef = useRef(null);
    const [activeSection, setActiveSection] = useState('blogs');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, api } = useAuth();
    const { darkMode, primaryColor, shadeColor } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [showProfilePanel, setShowProfilePanel] = useState(false);
    const [blogs, setBlogs] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    // New state for chart data
    const [chartData, setChartData] = useState({
        labels: [],
        blogReviews: [],
        commentReviews: [],
        reportsHandled: []
    });
    
    // New states for recent activity and trending blogs
    const [recentActivity, setRecentActivity] = useState([]);
    const [trendingBlogs, setTrendingBlogs] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [popupData, setPopupData] = useState({ message: '', onConfirm: null });

    const navigate = useNavigate();

    const primaryDark = shadeColor(primaryColor, -20);
    const primaryLight = shadeColor(primaryColor, 20);

    const themeStyles = {
        '--primary-color': primaryColor,
        '--primary-dark': primaryDark,
        '--primary-light': primaryLight,
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

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/comments/all/');
            setComments(response.data.comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviewedBlogs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/published-blogs/?reviewed=true');
            setBlogs(response.data.blogs);
        } catch (error) {
            console.error('Error fetching reviewed blogs:', error);
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
                { id: 1, type: 'login', user: 'moderator1', timestamp: new Date(Date.now() - 3600000), description: 'Moderator logged in' },
                { id: 2, type: 'approve', user: 'moderator1', timestamp: new Date(Date.now() - 7200000), description: 'Blog approved' },
                { id: 3, type: 'reject', user: 'moderator1', timestamp: new Date(Date.now() - 10800000), description: 'Comment rejected' },
                { id: 4, type: 'review', user: 'moderator2', timestamp: new Date(Date.now() - 14400000), description: 'Report reviewed' },
                { id: 5, type: 'comment', user: 'reader1', timestamp: new Date(Date.now() - 18000000), description: 'New comment added' },
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

    // Fetch dynamic chart data
    const fetchChartData = async () => {
        try {
            // Generate last 6 months
            const months = [];
            const blogReviews = [];
            const commentReviews = [];
            const reportsHandled = [];
            
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthLabel = date.toLocaleString('default', { month: 'short' });
                months.push(monthLabel);
                
                // For now, we'll use placeholder data
                // In a real implementation, you would fetch actual data from your API
                blogReviews.push(Math.floor(Math.random() * 30) + 10);
                commentReviews.push(Math.floor(Math.random() * 50) + 20);
                reportsHandled.push(Math.floor(Math.random() * 15) + 5);
            }
            
            setChartData({
                labels: months,
                blogReviews: blogReviews,
                commentReviews: commentReviews,
                reportsHandled: reportsHandled
            });
        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
    };

    useEffect(() => {
        if (activeSection === 'blogs') {
            fetchBlogs();
        } else if (activeSection === 'reviewed') {
            fetchReviewedBlogs();
        } else if (activeSection === 'comments') {
            fetchComments();
        } else if (activeSection === 'reports') {
            // Reports data would be fetched here
        } else if (activeSection === 'profile') {
            fetchChartData();
            // Fetch recent activity and trending blogs for profile section
            fetchRecentActivity();
            fetchTrendingBlogs();
        }
    }, [activeSection]);

    const handleApproveBlog = async (blogId) => {
        try {
            setBlogs(prevBlogs =>
                prevBlogs.map(blog =>
                    blog.id === blogId
                        ? { ...blog, is_reviewed: true, reviewed_by: user.username }
                        : blog
                )
                    .sort((a, b) => {
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

    const handleApproveComment = async (commentId) => {
        try {
            await api.post(`/comments/${commentId}/review/`, {
                reviewer: user.username
            });
            fetchComments();
            toast.success('Comment approved successfully');
        } catch (error) {
            console.error('Error approving comment:', error);
            toast.error('Failed to approve comment');
        }
    };

    const handleRejectComment = async (commentId) => {
        setPopupData({
            message: 'Are you sure you want to delete this comment? This action cannot be undone.',
            onConfirm: () => {
                setShowPopup(false);
                performRejectComment(commentId);
            }
        });
        setShowPopup(true);
    };

    const performRejectComment = async (commentId) => {
        try {
            // Optimistic update
            setComments(prevComments =>
                prevComments.filter(comment => comment.id !== commentId)
            );

            // Send delete request with username in body
            await api.delete(`/comments/${commentId}/delete/`, {
                data: { username: user.username }
            });

            // Show success message
            toast.success('Comment deleted successfully');

            // Optional: Refresh comments list
            fetchComments();
        } catch (error) {
            console.error('Error deleting comment:', error);

            // Revert optimistic update on error
            fetchComments();

            // Show error message
            const errorMsg = error.response?.data?.error ||
                error.message ||
                'Failed to delete comment';
            toast.error(errorMsg);
        }
        
        try {
            // Optimistic update
            setComments(prevComments =>
                prevComments.filter(comment => comment.id !== commentId)
            );

            // Send delete request with username in body
            await api.delete(`/comments/${commentId}/delete/`, {
                data: { username: user.username }
            });

            // Show success message
            toast.success('Comment deleted successfully');

            // Optional: Refresh comments list
            fetchComments();
        } catch (error) {
            console.error('Error deleting comment:', error);

            // Revert optimistic update on error
            fetchComments();

            // Show error message
            const errorMsg = error.response?.data?.error ||
                error.message ||
                'Failed to delete comment';
            toast.error(errorMsg);
        }
    };

    const handleBlogClick = (blogId) => {
        navigate(`/blog/${blogId}`);
    };

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
                                label: 'Blog Reviews',
                                data: chartData.blogReviews,
                                borderColor: primaryColor,
                                backgroundColor: darkMode ? `${primaryColor}20` : `${primaryColor}10`,
                                tension: 0.3,
                                fill: true
                            },
                            {
                                label: 'Comment Reviews',
                                data: chartData.commentReviews,
                                borderColor: primaryDark,
                                backgroundColor: darkMode ? `${primaryDark}20` : `${primaryDark}10`,
                                tension: 0.3,
                                fill: true
                            },
                            {
                                label: 'Reports Handled',
                                data: chartData.reportsHandled,
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

    return (
        <div 
            className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100' : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800'}`}
            style={themeStyles}
        >
            {/* Navbar */}
            <Navbar activePage="dashboard" onProfileClick={toggleProfilePanel} />

            {/* Dashboard Content */}
            <div className="pt-20 min-h-screen">
                <div className="flex flex-col md:flex-row">
                    {/* Sidebar */}
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
                                        <i className="fas fa-user mr-2"></i>My Profile
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
                                        Blogs to Review
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveSection('reviewed')}
                                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center transition-all duration-300 ${
                                            activeSection === 'reviewed' 
                                                ? 'font-semibold shadow-md'
                                                : 'opacity-80 hover:opacity-100'
                                        }`}
                                        style={{
                                            backgroundColor: activeSection === 'reviewed' 
                                                ? darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'
                                                : 'transparent',
                                            color: activeSection === 'reviewed'
                                                ? primaryColor
                                                : darkMode ? '#e2e8f0' : '#4a5568',
                                        }}
                                    >
                                        <i className="fas fa-check-circle mr-3"></i>
                                        Reviewed Blogs
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveSection('comments')}
                                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center transition-all duration-300 ${
                                            activeSection === 'comments' 
                                                ? 'font-semibold shadow-md'
                                                : 'opacity-80 hover:opacity-100'
                                        }`}
                                        style={{
                                            backgroundColor: activeSection === 'comments' 
                                                ? darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'
                                                : 'transparent',
                                            color: activeSection === 'comments'
                                                ? primaryColor
                                                : darkMode ? '#e2e8f0' : '#4a5568',
                                        }}
                                    >
                                        <i className="fas fa-comments mr-3"></i>
                                        Comments to Review
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveSection('reports')}
                                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center transition-all duration-300 ${
                                            activeSection === 'reports' 
                                                ? 'font-semibold shadow-md'
                                                : 'opacity-80 hover:opacity-100'
                                        }`}
                                        style={{
                                            backgroundColor: activeSection === 'reports' 
                                                ? darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'
                                                : 'transparent',
                                            color: activeSection === 'reports'
                                                ? primaryColor
                                                : darkMode ? '#e2e8f0' : '#4a5568',
                                        }}
                                    >
                                        <i className="fas fa-exclamation-triangle mr-3"></i>
                                        Reports
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className={`flex-1 p-6 transition-colors duration-300 ${darkMode ? 'bg-transparent' : 'bg-transparent'}`}>
                        <div className="max-w-7xl mx-auto">
                            {loading && (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
                                </div>
                            )}

                            {/* Profile Section */}
                            {activeSection === 'profile' && !loading && (
                                <div>
                                    <h1 
                                        className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                                        style={{ borderColor: primaryColor }}
                                    >
                                        <i className="fas fa-user mr-2"></i>Moderator Profile
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
                                                    <h2 className={`text-2xl font-bold transition-colors duration-200 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.username || 'Moderator'}</h2>
                                                    <p className={`mb-2 transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{user?.job_title || 'Content Moderator'}</p>
                                                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                                        <span 
                                                            className="px-3 py-1 rounded-full text-xs font-semibold text-white shadow"
                                                            style={{ backgroundColor: primaryColor }}
                                                        >
                                                            {user?.university || 'TechSage'} {user?.role || 'Moderator'}
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
                                                    {user?.bio || 'Responsible for maintaining the quality and integrity of content on the TechSage platform.'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className={`rounded-2xl p-4 shadow-md transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                                <div className="flex items-center">
                                                    <div className="flex justify-center mr-3">
                                                        <i className="fas fa-book-open text-xl" style={{ color: primaryColor }}></i>
                                                    </div>
                                                    <div>
                                                        <div 
                                                            className="text-xl font-bold"
                                                            style={{ color: primaryColor }}
                                                        >
                                                            {blogs.filter(blog => blog.is_reviewed).length}
                                                        </div>
                                                        <div className={`text-sm transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Blogs Reviewed</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`rounded-2xl p-4 shadow-md transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                                <div className="flex items-center">
                                                    <div className="flex justify-center mr-3">
                                                        <i className="fas fa-comments text-xl" style={{ color: primaryColor }}></i>
                                                    </div>
                                                    <div>
                                                        <div 
                                                            className="text-xl font-bold"
                                                            style={{ color: primaryColor }}
                                                        >
                                                            {comments.filter(comment => comment.is_reviewed).length}
                                                        </div>
                                                        <div className={`text-sm transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Comments Reviewed</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Moderation Activity Chart */}
                                    <div className={`rounded-2xl p-6 mb-6 h-80 transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                                        <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                            <i className="fas fa-chart-line mr-2" style={{ color: primaryColor }}></i>Moderation Activity
                                        </h3>
                                        <canvas id="performanceChart"></canvas>
                                    </div>
                                    
                                    {/* Recent Activity Section */}
                                    <div className={`rounded-2xl p-6 mb-6 transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
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
                                                                    activity.type === 'approve' ? 'bg-green-500/20 text-green-500' :
                                                                    activity.type === 'reject' ? 'bg-orange-500/20 text-orange-500' :
                                                                    activity.type === 'review' ? 'bg-purple-500/20 text-purple-500' :
                                                                    activity.type === 'publish' ? 'bg-indigo-500/20 text-indigo-500' :
                                                                    activity.type === 'comment' ? 'bg-yellow-500/20 text-yellow-500' :
                                                                    activity.type === 'report' ? 'bg-teal-500/20 text-teal-500' : 'bg-gray-500/20 text-gray-500'
                                                                }`}>
                                                                    <i className={`fas ${
                                                                        activity.type === 'login' ? 'fa-sign-in-alt' :
                                                                        activity.type === 'approve' ? 'fa-check-circle' :
                                                                        activity.type === 'reject' ? 'fa-times-circle' :
                                                                        activity.type === 'review' ? 'fa-eye' :
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
                                    
                                    {/* Trending Blogs Section */}
                                    <div className={`rounded-2xl p-6 mb-6 transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                                        <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                            <i className="fas fa-fire mr-2" style={{ color: primaryColor }}></i>Trending Blogs
                                        </h3>
                                        {trendingBlogs.length > 0 ? (
                                            <div className="space-y-4">
                                                {trendingBlogs.map(blog => (
                                                    <div 
                                                        key={`trending-${blog.id}`} 
                                                        className={`p-4 rounded-xl transition-all duration-300 hover:shadow-md cursor-pointer ${darkMode ? 'bg-gray-750 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}
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

                            {/* Blogs to Review Section */}
                            {activeSection === 'blogs' && !loading && (
                                <div>
                                    <h1 
                                        className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                                        style={{ borderColor: primaryColor }}
                                    >
                                        <i className="fas fa-book-open mr-2"></i>Blogs to Review
                                    </h1>
                                    <div className="space-y-4">
                                        {blogs.filter(blog => !blog.is_reviewed).length === 0 ? (
                                            <div className={`text-center py-10 rounded-xl ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                                                <i className="fas fa-book-open text-3xl mb-4"></i>
                                                <p>No blogs to review</p>
                                            </div>
                                        ) : (
                                            blogs.filter(blog => !blog.is_reviewed).map(blog => (
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
                                                            <span>By: {blog.author}</span>
                                                            <span>{formatDate(blog.published_at)}</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-3">
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
                                                                <i className="fas fa-trash mr-1"></i> Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Reviewed Blogs Section */}
                            {activeSection === 'reviewed' && !loading && (
                                <div>
                                    <h1 
                                        className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                                        style={{ borderColor: primaryColor }}
                                    >
                                        <i className="fas fa-check-circle mr-2"></i>Reviewed Blogs
                                    </h1>
                                    <div className="space-y-4">
                                        {blogs.filter(blog => blog.is_reviewed).length === 0 ? (
                                            <div className={`text-center py-10 rounded-xl ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                                                <i className="fas fa-book-open text-3xl mb-4"></i>
                                                <p>No reviewed blogs yet</p>
                                            </div>
                                        ) : (
                                            blogs.filter(blog => blog.is_reviewed).map(blog => (
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
                                                            <span>By: {blog.author}</span>
                                                            <span>{formatDate(blog.published_at)}</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            <span 
                                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                                                style={{ 
                                                                    backgroundColor: darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                                                                    color: '#22c55e'
                                                                }}
                                                            >
                                                                <i className="fas fa-check mr-1"></i> Approved
                                                            </span>
                                                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                Reviewed by: {blog.reviewed_by}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Comments to Review Section */}
                            {activeSection === 'comments' && !loading && (
                                <div>
                                    <h1 
                                        className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                                        style={{ borderColor: primaryColor }}
                                    >
                                        <i className="fas fa-comments mr-2"></i>Comments to Review
                                    </h1>
                                    <div className="space-y-4">
                                        {comments.filter(comment => !comment.is_reviewed).length === 0 ? (
                                            <div className={`text-center py-10 rounded-xl ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                                                <i className="fas fa-comments text-3xl mb-4"></i>
                                                <p>No comments to review</p>
                                            </div>
                                        ) : (
                                            comments.filter(comment => !comment.is_reviewed).map(comment => (
                                                <div key={comment.id} className={`p-4 rounded-xl transition-all duration-300 hover:shadow-md ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} mb-4`}>
                                                    <div className="flex items-center mb-2">
                                                        <img
                                                            src={comment.author_avatar || avatar}
                                                            alt={comment.author}
                                                            className="w-8 h-8 rounded-full mr-2 object-cover"
                                                        />
                                                        <div>
                                                            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{comment.author}</h4>
                                                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatDate(comment.created_at)}</p>
                                                        </div>
                                                    </div>
                                                    <p className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{comment.content}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            className="text-green-500 text-sm flex items-center hover:opacity-80 transition-all duration-200 px-3 py-1 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                                                            onClick={() => handleApproveComment(comment.id)}
                                                            style={{ color: darkMode ? '#22c55e' : '#22c55e' }}
                                                        >
                                                            <i className="fas fa-check mr-1"></i> Approve
                                                        </button>
                                                        <button
                                                            className="text-red-500 text-sm flex items-center hover:opacity-80 transition-all duration-200 px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            onClick={() => handleRejectComment(comment.id)}
                                                            style={{ color: darkMode ? '#ef4444' : '#ef4444' }}
                                                        >
                                                            <i className="fas fa-trash mr-1"></i> Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Reports Section */}
                            {activeSection === 'reports' && !loading && (
                                <div>
                                    <h1 
                                        className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                                        style={{ borderColor: primaryColor }}
                                    >
                                        <i className="fas fa-exclamation-triangle mr-2"></i>Reports
                                    </h1>
                                    <ModeratorReports darkMode={darkMode} primaryColor={primaryColor} />
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

export default ModeratorDashboard;