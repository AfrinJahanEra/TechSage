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
import ModeratorReports from '../components/ModeratorReports';
import avatar from '../../src/assets/user.jpg';
import 'react-confirm-alert/src/react-confirm-alert.css';

const ModeratorDashboard = () => {
    const performanceChartRef = useRef(null);
    const [activeSection, setActiveSection] = useState('blogs');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, api } = useAuth();
    const { darkMode, primaryColor, shadeColor } = useTheme();
    
    const primaryDark = shadeColor(primaryColor, -20);
    const primaryLight = shadeColor(primaryColor, 20);

    const themeStyles = {
      '--primary-color': primaryColor,
      '--primary-dark': primaryDark,
      '--primary-light': primaryLight,
    };
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [showProfilePanel, setShowProfilePanel] = useState(false);
    const [blogs, setBlogs] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();


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

    useEffect(() => {
        if (activeSection === 'blogs') {
            fetchBlogs();
        } else if (activeSection === 'reviewed') {
            fetchReviewedBlogs();
        } else if (activeSection === 'comments') {
            fetchComments();
        }
    }, [activeSection]);


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
                        } catch (error) {
                            console.error('Error approving blog:', error);
                            alert('Failed to approve blog');

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




    const handleRejectComment = async (commentId) => {
        confirmAlert({
            title: 'Reject Comment',
            message: 'Are you sure you want to delete this comment?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
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
                            alert('Comment deleted successfully');

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
                            alert(errorMsg);
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
                                        All Comments
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
                                        <i className="fas fa-flag mr-3"></i>
                                        Content Reports
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className={`flex-1 p-6 transition-colors duration-300 ${darkMode ? 'bg-transparent' : 'bg-transparent'}`}>
                        <div className="max-w-7xl mx-auto">
                            {/* Loading State */}
                            {loading && (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
                                </div>
                            )}

                            {/* All Blogs Section */}
                            {activeSection === 'blogs' && !loading && (
                                <div>
                                    <h1 
                                      className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                                      style={{ borderColor: primaryColor }}
                                    >
                                        <i className="fas fa-book-open mr-2"></i>All Blogs
                                    </h1>

                                    {/* Blog List */}
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

                            {/* Reviewed Blogs Section */}
                            {activeSection === 'reviewed' && !loading && (
                                <div>
                                    <h1 
                                      className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                                      style={{ borderColor: primaryColor }}
                                    >
                                        <i className="fas fa-check-circle mr-2"></i>Reviewed Blogs
                                    </h1>

                                    {/* Blog List */}
                                    <div className="space-y-4">
                                        {blogs.length === 0 ? (
                                            <div className={`text-center py-10 rounded-xl ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                                                <i className="fas fa-check-circle text-3xl mb-4"></i>
                                                <p>No reviewed blogs found</p>
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
                                                            <span 
                                                              className="inline-block px-3 py-1 rounded-full text-sm font-semibold ml-2"
                                                              style={{ 
                                                                backgroundColor: darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                                                                color: '#22c55e'
                                                              }}
                                                            >
                                                                Approved
                                                            </span>
                                                        </h3>
                                                        <div className={`flex justify-between text-sm mt-1 transition-colors duration-200 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            <span>{formatDate(blog.published_at)}</span>
                                                            <span>{blog.read_time}</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            <button
                                                                className={`flex items-center text-sm transition-all duration-200 px-3 py-1 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                                                style={{ color: primaryColor }}
                                                            >
                                                                <i className="fas fa-heart mr-1"></i> {blog.stats?.upvotes || 0} upvotes
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
                                    <h1 
                                      className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                                      style={{ borderColor: primaryColor }}
                                    >
                                        <i className="fas fa-comments mr-2"></i>All Comments
                                    </h1>

                                    {/* Comments List */}
                                    <div className="space-y-4">
                                        {comments.length === 0 ? (
                                            <div className={`text-center py-10 rounded-xl ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                                                <i className="fas fa-comments text-3xl mb-4"></i>
                                                <p>No comments found</p>
                                            </div>
                                        ) : (
                                            comments.map(comment => (
                                                <div key={comment.id} className={`p-4 rounded-xl transition-all duration-300 hover:shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'} mb-4 border border-gray-200 dark:border-gray-700`}>
                                                    <div className="flex items-start mb-3">
                                                        <img
                                                            src={comment.author.avatar_url || avatar}
                                                            alt={comment.author.username}
                                                            className="w-12 h-12 rounded-full mr-4 object-cover shadow"
                                                        />
                                                        <div>
                                                            <h4 className={`font-semibold transition-colors duration-200 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                                {comment.author.username}
                                                                {comment.is_reviewed && (
                                                                    <span 
                                                                      className="inline-block px-3 py-1 rounded-full text-sm font-semibold ml-2"
                                                                      style={{ 
                                                                        backgroundColor: darkMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                                                                        color: '#22c55e'
                                                                      }}
                                                                    >
                                                                        Approved
                                                                    </span>
                                                                )}
                                                            </h4>
                                                            <p className={`text-xs transition-colors duration-200 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                {formatDate(comment.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className={`mb-3 transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {comment.content}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {!comment.is_reviewed && (
                                                            <>
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
                                                                    <i className="fas fa-trash mr-1"></i> Delete
                                                                </button>
                                                            </>
                                                        )}
                                                        {comment.is_reviewed && (
                                                            <button
                                                                className="text-red-500 text-sm flex items-center hover:opacity-80 transition-all duration-200 px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                onClick={() => handleRejectComment(comment.id)}
                                                                style={{ color: darkMode ? '#ef4444' : '#ef4444' }}
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
                                    <h1 
                                      className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                                      style={{ borderColor: primaryColor }}
                                    >
                                        My Profile
                                    </h1>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                        {/* User Info Card */}
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
                                                    {user?.bio || 'Responsible for maintaining content quality and community standards on TechSage.'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Stats Cards */}
                                        <div className="space-y-4">
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
                                                            {comments.filter(c => c.is_reviewed).length}
                                                        </div>
                                                        <div className={`text-sm transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Comments Approved</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Performance Chart */}
                                    <div className={`rounded-2xl p-6 mb-6 h-80 transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                                        <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                            <i className="fas fa-chart-line mr-2" style={{ color: primaryColor }}></i>Moderation Activity
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

export default ModeratorDashboard;