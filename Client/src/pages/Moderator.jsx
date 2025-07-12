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
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import ModeratorReports from '../components/ModeratorReports';

const ModeratorDashboard = () => {
    const performanceChartRef = useRef(null);
    const [activeSection, setActiveSection] = useState('blogs');
    const [blogFilter, setBlogFilter] = useState('all');
    const [reportFilter, setReportFilter] = useState('all');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, api } = useAuth();
    const { darkMode, primaryColor } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [showProfilePanel, setShowProfilePanel] = useState(false);
    const [blogs, setBlogs] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Fetch all blogs
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

    // Fetch all comments
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

    // Fetch reviewed blogs
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

    useEffect(() => {
        if (activeSection === 'blogs') {
            fetchBlogs();
        } else if (activeSection === 'reviewed') {
            fetchReviewedBlogs();
        } else if (activeSection === 'comments') {
            fetchComments();
        }
    }, [activeSection]);

    // Approve blog handler
    // In your handleApproveBlog function
    const handleApproveBlog = async (blogId) => {
        confirmAlert({
            title: 'Approve Blog',
            message: 'Are you sure you want to approve this blog?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        try {
                            // Optimistically update the UI first
                            setBlogs(prevBlogs =>
                                prevBlogs.map(blog =>
                                    blog.id === blogId
                                        ? { ...blog, is_reviewed: true, reviewed_by: user.username }
                                        : blog
                                )
                                    .sort((a, b) => {
                                        // Move approved blogs to bottom
                                        if (a.is_reviewed && !b.is_reviewed) return 1;
                                        if (!a.is_reviewed && b.is_reviewed) return -1;
                                        return 0;
                                    })
                            );

                            // Then make the API call
                            await api.post(`/blogs/review/${blogId}/`, {
                                reviewer: user.username
                            });

                            // Refresh data to ensure consistency
                            fetchBlogs();
                        } catch (error) {
                            console.error('Error approving blog:', error);
                            alert('Failed to approve blog');
                            // Revert UI if API call fails
                            fetchBlogs();
                        }
                    }
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        });
    };


    // Reject blog handler
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
                    onClick: () => { }
                }
            ]
        });
    };

    // Approve comment handler
    const handleApproveComment = async (commentId) => {
        confirmAlert({
            title: 'Approve Comment',
            message: 'Are you sure you want to approve this comment?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        try {
                            await api.post(`/comments/${commentId}/review/`, {
                                reviewer: user.username
                            });
                            fetchComments();
                            alert('Comment approved successfully');
                        } catch (error) {
                            console.error('Error approving comment:', error);
                            alert('Failed to approve comment');
                        }
                    }
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        });
    };

    // Reject comment handler
    const handleRejectComment = async (commentId) => {
        confirmAlert({
            title: 'Reject Comment',
            message: 'Are you sure you want to delete this comment?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        try {
                            await api.delete(`/comments/${commentId}/delete`);
                            fetchComments();
                            alert('Comment deleted successfully');
                        } catch (error) {
                            console.error('Error deleting comment:', error);
                            alert('Failed to delete comment');
                        }
                    }
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        });
    };

    // Function to handle blog clicks
    const handleBlogClick = (blogId) => {
        navigate(`/blog/${blogId}`);
    };

    // Function to handle profile icon/name clicks
    const handleProfileClick = (userId) => {
        navigate(`/dashboard/${userId}`);
    };

    useEffect(() => {
        // Initialize chart when profile section is active
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
                            label: 'Blog Reviews',
                            data: [12, 19, 15, 22, 18, 25],
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

    const toggleNotifications = () => {
        setNotificationsEnabled(!notificationsEnabled);
        alert(`Notifications ${!notificationsEnabled ? 'enabled' : 'disabled'}`);
    };

    const toggleProfilePanel = (e) => {
        e.stopPropagation();
        setShowProfilePanel(!showProfilePanel);
    };

    const closeProfilePanel = () => {
        setShowProfilePanel(false);
    };

    // Close profile panel when clicking outside
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

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        document.body.style.overflow = isMenuOpen ? '' : 'hidden';
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        document.body.style.overflow = '';
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
            {/* Navbar */}
            <Navbar activePage="dashboard" onProfileClick={toggleProfilePanel} />

            {/* Dashboard Content */}
            <div className="pt-20 min-h-screen">
                <div className="flex flex-col md:flex-row">
                    {/* Sidebar */}
                    <div className={`w-full md:w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r border-gray-200`}>
                        <ul className="space-y-1">
                            <li>
                                <button
                                    onClick={() => setActiveSection('profile')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === 'profile' ? 'bg-teal-50 text-teal-600 border-l-4 border-teal-500' : 'hover:bg-gray-100'}`}
                                >
                                    <i className="fas fa-user mr-3 text-teal-500"></i>
                                    My Profile
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection('blogs')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === 'blogs' ? 'bg-teal-50 text-teal-600 border-l-4 border-teal-500' : 'hover:bg-gray-100'}`}
                                >
                                    <i className="fas fa-newspaper mr-3 text-teal-500"></i>
                                    All Blogs
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection('reviewed')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === 'reviewed' ? 'bg-teal-50 text-teal-600 border-l-4 border-teal-500' : 'hover:bg-gray-100'}`}
                                >
                                    <i className="fas fa-check-circle mr-3 text-teal-500"></i>
                                    Reviewed Blogs
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection('comments')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === 'comments' ? 'bg-teal-50 text-teal-600 border-l-4 border-teal-500' : 'hover:bg-gray-100'}`}
                                >
                                    <i className="fas fa-comments mr-3 text-teal-500"></i>
                                    All Comments
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection('reports')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === 'reports' ? 'bg-teal-50 text-teal-600 border-l-4 border-teal-500' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    <i className="fas fa-flag mr-3 text-teal-500"></i>
                                    Content Reports
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Main Content */}
                    <div className={`flex-1 p-6 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                            </div>
                        )}

                        {/* All Blogs Section */}
                        {activeSection === 'blogs' && !loading && (
                            <div>
                                <h1 className={`text-2xl font-bold mb-6 pb-2 border-b-2 border-teal-500 inline-block ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    All Blogs
                                </h1>

                                {/* Blog List */}
                                <div className="space-y-6">
                                    {blogs.length === 0 ? (
                                        <div className={`text-center py-10 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <i className="fas fa-newspaper text-3xl mb-4"></i>
                                            <p>No blogs found</p>
                                        </div>
                                    ) : (
                                        blogs.map(blog => (
                                            <div key={blog.id} className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-5 items-center pb-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                                                <div
                                                    className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center cursor-pointer"
                                                    style={{ backgroundImage: `url('${blog.thumbnail_url}')` }}
                                                    onClick={() => handleBlogClick(blog.id)}
                                                ></div>
                                                <div>
                                                    <h3
                                                        className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} cursor-pointer hover:text-teal-500`}
                                                        onClick={() => handleBlogClick(blog.id)}
                                                    >
                                                        {blog.title}
                                                    </h3>
                                                    <div className={`flex justify-between text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        <span>{formatDate(blog.published_at)}</span>
                                                        <span>{blog.read_time}</span>
                                                    </div>
                                                    <div className="flex space-x-4 mt-3">
                                                        {blog.is_reviewed ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                <i className="fas fa-check mr-1"></i> Approved
                                                            </span>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    className="text-green-500 text-sm flex items-center hover:opacity-80"
                                                                    onClick={() => handleApproveBlog(blog.id)}
                                                                >
                                                                    <i className="fas fa-check mr-1"></i> Approve
                                                                </button>
                                                                <button
                                                                    className="text-red-500 text-sm flex items-center hover:opacity-80"
                                                                    onClick={() => handleRejectBlog(blog.id)}
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

                        {/* Reviewed Blogs Section */}
                        {activeSection === 'reviewed' && !loading && (
                            <div>
                                <h1 className={`text-2xl font-bold mb-6 pb-2 border-b-2 border-teal-500 inline-block ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    Reviewed Blogs
                                </h1>

                                {/* Blog List */}
                                <div className="space-y-6">
                                    {blogs.length === 0 ? (
                                        <div className={`text-center py-10 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <i className="fas fa-check-circle text-3xl mb-4"></i>
                                            <p>No reviewed blogs found</p>
                                        </div>
                                    ) : (
                                        blogs.map(blog => (
                                            <div key={blog.id} className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-5 items-center pb-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                                                <div
                                                    className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center cursor-pointer"
                                                    style={{ backgroundImage: `url('${blog.thumbnail_url}')` }}
                                                    onClick={() => handleBlogClick(blog.id)}
                                                ></div>
                                                <div>
                                                    <h3
                                                        className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} cursor-pointer hover:text-teal-500`}
                                                        onClick={() => handleBlogClick(blog.id)}
                                                    >
                                                        {blog.title}
                                                        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold ml-2 bg-green-50 text-green-500">
                                                            Approved
                                                        </span>
                                                    </h3>
                                                    <div className={`flex justify-between text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        <span>{formatDate(blog.published_at)}</span>
                                                        <span>{blog.read_time}</span>
                                                    </div>
                                                    <div className="flex space-x-4 mt-3">
                                                        <button
                                                            className={`flex items-center text-sm ${darkMode ? 'text-gray-400 hover:text-teal-500' : 'text-gray-500 hover:text-teal-500'}`}
                                                        >
                                                            <i className="fas fa-eye mr-1"></i> {blog.stats?.upvotes || 0}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        {activeSection === 'comments' && !loading && (
                            <div>
                                <h1 className={`text-2xl font-bold mb-6 pb-2 border-b-2 border-teal-500 inline-block ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    All Comments
                                </h1>

                                {/* Comments List */}
                                <div className="space-y-6">
                                    {comments.length === 0 ? (
                                        <div className={`text-center py-10 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <i className="fas fa-comments text-3xl mb-4"></i>
                                            <p>No comments found</p>
                                        </div>
                                    ) : (
                                        comments.map(comment => (
                                            <div key={comment.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} mb-4`}>
                                                <div className="flex items-start mb-3">
                                                    <img
                                                        src={comment.author.avatar_url || "https://randomuser.me/api/portraits/men/32.jpg"}
                                                        alt={comment.author.username}
                                                        className="w-10 h-10 rounded-full mr-3"
                                                    />
                                                    <div>
                                                        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                            {comment.author.username}
                                                            {comment.is_reviewed && (
                                                                <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold ml-2 bg-green-50 text-green-500">
                                                                    Approved
                                                                </span>
                                                            )}
                                                        </h4>
                                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {formatDate(comment.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className={`mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {comment.content}
                                                </p>
                                                <div className="flex space-x-4">
                                                    {!comment.is_reviewed && (
                                                        <>
                                                            <button
                                                                className="text-green-500 text-sm flex items-center hover:opacity-80"
                                                                onClick={() => handleApproveComment(comment.id)}
                                                            >
                                                                <i className="fas fa-check mr-1"></i> Approve
                                                            </button>
                                                            <button
                                                                className="text-red-500 text-sm flex items-center hover:opacity-80"
                                                                onClick={() => handleRejectComment(comment.id)}
                                                            >
                                                                <i className="fas fa-trash mr-1"></i> Delete
                                                            </button>
                                                        </>
                                                    )}
                                                    {comment.is_reviewed && (
                                                        <button
                                                            className="text-red-500 text-sm flex items-center hover:opacity-80"
                                                            onClick={() => handleRejectComment(comment.id)}
                                                        >
                                                            <i className="fas fa-trash mr-1"></i> Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeSection === 'reports' && <ModeratorReports />}

                        {/* Profile Section */}
                        {activeSection === 'profile' && (
                            <div>
                                <h1 className={`text-2xl font-bold mb-6 pb-2 border-b-2 border-teal-500 inline-block ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    My Profile
                                </h1>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* User Info Card */}
                                    <div className={`rounded-lg p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                        <div className="flex flex-col md:flex-row items-center mb-6">
                                            <img
                                                src={user?.avatar_url || "https://randomuser.me/api/portraits/women/44.jpg"}
                                                alt="Profile"
                                                className="w-20 h-20 rounded-full border-4 border-teal-500 object-cover mr-0 md:mr-6 mb-4 md:mb-0"
                                            />
                                            <div className="text-center md:text-left">
                                                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user?.username || 'Moderator'}</h2>
                                                <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{user?.job_title || 'Moderator'}</p>
                                                <div className="flex justify-center md:justify-start space-x-2">
                                                    <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-xs">
                                                        {user?.university || 'TechSage'} {user?.role || 'Moderator'}
                                                    </span>
                                                    {user?.is_verified && (
                                                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
                                                            Verified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className={`text-lg font-semibold mb-3 pb-2 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>About</h3>
                                            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {user?.bio || 'No bio provided yet.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className={`rounded-lg p-4 shadow-sm text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            <div className="text-3xl font-bold text-teal-500 mb-1">{blogs.length}</div>
                                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Blogs Reviewed</div>
                                        </div>
                                        <div className={`rounded-lg p-4 shadow-sm text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            <div className="text-3xl font-bold text-teal-500 mb-1">{comments.filter(c => c.is_reviewed).length}</div>
                                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Comments Approved</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Chart */}
                                <div className={`rounded-lg p-4 mb-6 h-80 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                    <canvas id="performanceChart"></canvas>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ModeratorDashboard;