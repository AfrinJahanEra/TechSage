import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Chart } from 'chart.js/auto';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
    const { user, api } = useAuth();
    const { darkMode, primaryColor, shadeColor } = useTheme();
    const [activeSection, setActiveSection] = useState('profile');
    const [blogs, setBlogs] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [trash, setTrash] = useState([]);
    const [savedBlogs, setSavedBlogs] = useState([]);
    const [sortOption, setSortOption] = useState('newest');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Generate color variants based on primary color
    const primaryDark = shadeColor(primaryColor, -20);
    const primaryLight = shadeColor(primaryColor, 20);

    // Fetch blogs based on active section
    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            setError(null);
            try {
                let response;
                switch (activeSection) {
                    case 'blogs':
                        response = await api.get(`/blogs/?author=${user.username}&status=published`);
                        setBlogs(response.data || []);
                        break;
                    case 'drafts':
                        response = await api.get(`/blogs/?author=${user.username}&status=draft`);
                        setDrafts(response.data || []);
                        break;
                    case 'trash':
                        response = await api.get(`/blogs/?author=${user.username}&status=trash`);
                        setTrash(response.data || []);
                        break;
                    case 'saved':
                        response = await api.get(`/user/${user.username}/saved-blogs/`);
                        setSavedBlogs(response.data || []);
                        break;
                    case 'profile':
                        // Fetch recent published blogs for profile
                        response = await api.get(`/blogs/?author=${user.username}&status=published&limit=2`);
                        setBlogs(response.data || []);
                        break;
                    default:
                        break;
                }
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to fetch data');
                // Reset relevant state
                if (activeSection === 'blogs' || activeSection === 'profile') {
                    setBlogs([]);
                } else if (activeSection === 'drafts') {
                    setDrafts([]);
                } else if (activeSection === 'trash') {
                    setTrash([]);
                } else if (activeSection === 'saved') {
                    setSavedBlogs([]);
                }
            } finally {
                setLoading(false);
            }
        };

        if (user?.username) {
            fetchBlogs();
        }
    }, [activeSection, user?.username, api]);

    // Sort blogs based on selected option
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

    // Handle blog actions
    const handlePublish = async (blogId) => {
        try {
            await api.post(`/blogs/publish/${blogId}/`, { username: user.username });
            setDrafts(drafts.filter(blog => blog.id !== blogId));
            const response = await api.get(`/blogs/?author=${user.username}&status=published`);
            setBlogs(response.data || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to publish blog');
        }
    };

    const handleDelete = async (blogId) => {
        try {
            await api.delete(`/blogs/delete/${blogId}/`, { data: { username: user.username } });
            if (activeSection === 'blogs') {
                setBlogs(blogs.filter(blog => blog.id !== blogId));
            } else if (activeSection === 'drafts') {
                setDrafts(drafts.filter(blog => blog.id !== blogId));
            }
            const response = await api.get(`/blogs/?author=${user.username}&status=trash`);
            setTrash(response.data || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete blog');
        }
    };

    const handleRestore = async (blogId) => {
        try {
            await api.post(`/blogs/restore/${blogId}/`, { username: user.username });
            setTrash(trash.filter(blog => blog.id !== blogId));
            const response = await api.get(`/blogs/?author=${user.username}&status=published`);
            setBlogs(response.data || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to restore blog');
        }
    };

    const handlePermanentDelete = async (blogId) => {
        try {
            await api.delete(`/blogs/mod/delete/${blogId}/`);
            setTrash(trash.filter(blog => blog.id !== blogId));
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to permanently delete blog');
        }
    };

    // Initialize chart
    useEffect(() => {
        const ctx = document.getElementById('performanceChart');
        if (ctx) {
            const performanceChart = new Chart(ctx, {
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

            return () => {
                performanceChart.destroy();
            };
        }
    }, [darkMode, primaryColor, primaryDark]);

    // Dynamic style variables for theme colors
    const themeStyles = {
        '--primary-color': primaryColor,
        '--primary-dark': primaryDark,
        '--primary-light': primaryLight,
    };

    // Get badge based on points
    const getBadge = () => {
        if (!user?.points) return 'Newbie';
        if (user.points < 100) return 'Beginner';
        if (user.points < 500) return 'Contributor';
        if (user.points < 1000) return 'Expert';
        return 'Master';
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Calculate read time
    const calculateReadTime = (content) => {
        if (!content) return '0 min read';
        const words = content.split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return `${minutes} min read`;
    };

    return (
        <div 
            className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}
            style={themeStyles}
        >
            <Navbar activePage="dashboard" />

            <div className="pt-20 min-h-screen">
                <div className="flex flex-col md:flex-row">
                    {/* Sidebar */}
                    <div className={`w-full md:w-64 border-r p-4 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <ul className="space-y-1">
                            <li>
                                <button
                                    onClick={() => setActiveSection('profile')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors duration-200 ${
                                        activeSection === 'profile' 
                                            ? `${darkMode ? 'bg-gray-700 border-[var(--primary-color)]' : 'bg-[var(--primary-light)] border-[var(--primary-color)]'}`
                                            : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
                                    } border-l-4`}
                                    style={{ 
                                        color: activeSection === 'profile' 
                                            ? darkMode 
                                                ? primaryColor 
                                                : primaryDark 
                                            : 'inherit',
                                        borderColor: activeSection === 'profile' ? primaryColor : 'transparent'
                                    }}
                                >
                                    <i 
                                        className="fas fa-user mr-3"
                                        style={{ color: activeSection === 'profile' ? primaryColor : primaryColor }}
                                    ></i>
                                    My Profile
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection('blogs')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors duration-200 ${
                                        activeSection === 'blogs' 
                                            ? `${darkMode ? 'bg-gray-700 border-[var(--primary-color)]' : 'bg-[var(--primary-light)] border-[var(--primary-color)]'}`
                                            : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
                                    } border-l-4`}
                                    style={{ 
                                        color: activeSection === 'blogs' 
                                            ? darkMode 
                                                ? primaryColor 
                                                : primaryDark 
                                            : 'inherit',
                                        borderColor: activeSection === 'blogs' ? primaryColor : 'transparent'
                                    }}
                                >
                                    <i 
                                        className="fas fa-newspaper mr-3"
                                        style={{ color: activeSection === 'blogs' ? primaryColor : primaryColor }}
                                    ></i>
                                    My Blogs
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection('drafts')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors duration-200 ${
                                        activeSection === 'drafts' 
                                            ? `${darkMode ? 'bg-gray-700 border-[var(--primary-color)]' : 'bg-[var(--primary-light)] border-[var(--primary-color)]'}`
                                            : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
                                    } border-l-4`}
                                    style={{ 
                                        color: activeSection === 'drafts' 
                                            ? darkMode 
                                                ? primaryColor 
                                                : primaryDark 
                                            : 'inherit',
                                        borderColor: activeSection === 'drafts' ? primaryColor : 'transparent'
                                    }}
                                >
                                    <i 
                                        className="fas fa-file-alt mr-3"
                                        style={{ color: activeSection === 'drafts' ? primaryColor : primaryColor }}
                                    ></i>
                                    Draft Blogs
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection('trash')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors duration-200 ${
                                        activeSection === 'trash' 
                                            ? `${darkMode ? 'bg-gray-700 border-[var(--primary-color)]' : 'bg-[var(--primary-light)] border-[var(--primary-color)]'}`
                                            : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
                                    } border-l-4`}
                                    style={{ 
                                        color: activeSection === 'trash' 
                                            ? darkMode 
                                                ? primaryColor 
                                                : primaryDark 
                                            : 'inherit',
                                        borderColor: activeSection === 'trash' ? primaryColor : 'transparent'
                                    }}
                                >
                                    <i 
                                        className="fas fa-trash mr-3"
                                        style={{ color: activeSection === 'trash' ? primaryColor : primaryColor }}
                                    ></i>
                                    Trash
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection('saved')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors duration-200 ${
                                        activeSection === 'saved' 
                                            ? `${darkMode ? 'bg-gray-700 border-[var(--primary-color)]' : 'bg-[var(--primary-light)] border-[var(--primary-color)]'}`
                                            : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
                                    } border-l-4`}
                                    style={{ 
                                        color: activeSection === 'saved' 
                                            ? darkMode 
                                                ? primaryColor 
                                                : primaryDark 
                                            : 'inherit',
                                        borderColor: activeSection === 'saved' ? primaryColor : 'transparent'
                                    }}
                                >
                                    <i 
                                        className="fas fa-bookmark mr-3"
                                        style={{ color: activeSection === 'saved' ? primaryColor : primaryColor }}
                                    ></i>
                                    Saved Blogs
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-6">
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
                                <h1 
                                    className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                                    style={{ borderColor: primaryColor }}
                                >
                                    My Profile
                                </h1>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className={`rounded-lg p-6 shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                        <div className="flex flex-col md:flex-row items-center mb-6">
                                            <img
                                                src={user?.avatar_url || "https://randomuser.me/api/portraits/women/44.jpg"}
                                                alt="Profile"
                                                className="w-20 h-20 rounded-full border-4 object-cover mr-0 md:mr-6 mb-4 md:mb-0"
                                                style={{ borderColor: primaryColor }}
                                            />
                                            <div className="text-center md:text-left">
                                                <h2 className="text-xl font-bold">{user?.username || 'User'}</h2>
                                                <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{user?.job_title || 'Member'}</p>
                                                <div className="flex justify-center md:justify-start space-x-2">
                                                    <span 
                                                        className="px-3 py-1 rounded-full text-xs text-white"
                                                        style={{ backgroundColor: primaryColor }}
                                                    >
                                                        {user?.university || 'TechSage'} {user?.role || 'User'}
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
                                            <h3 className={`text-lg font-semibold mb-3 pb-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                About
                                            </h3>
                                            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {user?.bio || 'No bio provided yet.'}
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
                                            { value: blogs?.length || 0, label: 'Total Publications' },
                                            { value: user?.followers || 0, label: 'Followers' },
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
                                            {blogs.slice(0, 2).map((blog, index) => (
                                                <div key={index} className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                    <div
                                                        className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                                        style={{ backgroundImage: `url('${blog.thumbnail_url || 'https://via.placeholder.com/150'}')` }}
                                                    ></div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold">{blog.title}</h3>
                                                        <div className={`flex justify-between text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            <span>{formatDate(blog.created_at)}</span>
                                                            <span>{calculateReadTime(blog.content)}</span>
                                                        </div>
                                                        <div className="flex space-x-4 mt-2">
                                                            <button 
                                                                className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                                                style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                                                            >
                                                                <i className="fas fa-eye mr-1"></i> {blog.views || '0'}
                                                            </button>
                                                            <button 
                                                                className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                                                style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                                                            >
                                                                <i className="fas fa-heart mr-1"></i> {blog.upvotes || '0'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {loading ? 'Loading...' : 'No published blogs yet.'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {!loading && activeSection === 'blogs' && (
                            <div>
                                <h1 
                                    className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                                    style={{ borderColor: primaryColor }}
                                >
                                    My Blogs
                                </h1>

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
                                            <div key={index} className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                <div
                                                    className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                                    style={{ backgroundImage: `url('${blog.thumbnail_url || 'https://via.placeholder.com/150'}')` }}
                                                ></div>
                                                <div>
                                                    <h3 className="text-lg font-semibold">{blog.title}</h3>
                                                    <div className={`flex justify-between text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        <span>{formatDate(blog.created_at)}</span>
                                                        <span>{calculateReadTime(blog.content)}</span>
                                                    </div>
                                                    <div className="flex space-x-4 mt-2">
                                                        <button 
                                                            className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                                            style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                                                        >
                                                            <i className="fas fa-eye mr-1"></i> {blog.views || '0'}
                                                        </button>
                                                        <button 
                                                            className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                                            style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                                                        >
                                                            <i className="fas fa-heart mr-1"></i> {blog.upvotes || '0'}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(blog.id)}
                                                            className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                                            style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                                                        >
                                                            <i className="fas fa-trash mr-1"></i> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {loading ? 'Loading...' : 'No published blogs yet.'}
                                    </p>
                                )}
                            </div>
                        )}

                        {!loading && activeSection === 'drafts' && (
                            <div>
                                <h1 
                                    className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                                    style={{ borderColor: primaryColor }}
                                >
                                    Draft Blogs
                                </h1>

                                {drafts && drafts.length > 0 ? (
                                    drafts.map((draft, index) => (
                                        <div key={index} className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <div
                                                className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                                style={{ backgroundImage: `url('${draft.thumbnail_url || 'https://via.placeholder.com/150'}')` }}
                                            ></div>
                                            <div>
                                                <h3 className="text-lg font-semibold">{draft.title}</h3>
                                                <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Last edited: {formatDate(draft.updated_at)}
                                                </div>
                                                <div className="flex space-x-4 mt-2">
                                                    <button 
                                                        className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                                        style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                                                    >
                                                        <i className="fas fa-edit mr-1"></i> Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(draft.id)}
                                                        className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                                        style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                                                    >
                                                        <i className="fas fa-trash mr-1"></i> Delete
                                                    </button>
                                                    <button 
                                                        onClick={() => handlePublish(draft.id)}
                                                        className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                                        style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                                                    >
                                                        <i className="fas fa-share mr-1"></i> Publish
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {loading ? 'Loading...' : 'No draft blogs found.'}
                                    </p>
                                )}
                            </div>
                        )}

                        {!loading && activeSection === 'trash' && (
                            <div>
                                <h1 
                                    className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                                    style={{ borderColor: primaryColor }}
                                >
                                    Trash
                                </h1>

                                {trash && trash.length > 0 ? (
                                    <div className="space-y-6">
                                        {trash.map((blog, index) => (
                                            <div key={index} className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                <div
                                                    className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                                    style={{ backgroundImage: `url('${blog.thumbnail_url || 'https://via.placeholder.com/150'}')` }}
                                                ></div>
                                                <div>
                                                    <h3 className="text-lg font-semibold">{blog.title}</h3>
                                                    <div className={`flex justify-between text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        <span>Deleted on: {formatDate(blog.deleted_at)}</span>
                                                        <span>{calculateReadTime(blog.content)}</span>
                                                    </div>
                                                    <div className="flex space-x-4 mt-2">
                                                        <button 
                                                            onClick={() => handleRestore(blog.id)}
                                                            className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                                            style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                                                        >
                                                            <i className="fas fa-undo mr-1"></i> Restore
                                                        </button>
                                                        <button 
                                                            onClick={() => handlePermanentDelete(blog.id)}
                                                            className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                                            style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                                                        >
                                                            <i className="fas fa-trash-alt mr-1"></i> Delete Permanently
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {loading ? 'Loading...' : 'Trash is empty.'}
                                    </p>
                                )}
                            </div>
                        )}

                        {!loading && activeSection === 'saved' && (
                            <div>
                                <h1 
                                    className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                                    style={{ borderColor: primaryColor }}
                                >
                                    Saved Blogs
                                </h1>

                                {savedBlogs && savedBlogs.length > 0 ? (
                                    <div className="space-y-6">
                                        {savedBlogs.map((saved, index) => (
                                            <div key={index} className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                <div
                                                    className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                                    style={{ backgroundImage: `url('${saved.thumbnail_url || 'https://via.placeholder.com/150'}')` }}
                                                ></div>
                                                <div>
                                                    <h3 className="text-lg font-semibold">{saved.title}</h3>
                                                    <div className={`flex justify-between text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        <span>By {saved.authors?.[0]?.username || 'Unknown'}</span>
                                                        <span>{formatDate(saved.created_at)}</span>
                                                    </div>
                                                    <div className="flex space-x-4 mt-2">
                                                        <button 
                                                            className="flex items-center text-sm"
                                                            style={{ color: primaryColor }}
                                                        >
                                                            <i className="fas fa-bookmark mr-1"></i> Saved
                                                        </button>
                                                        <button 
                                                            className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                                            style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                                                        >
                                                            <i className="fas fa-share-alt mr-1"></i> Share
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {loading ? 'Loading...' : 'No saved blogs found.'}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div>
                <Footer />
            </div>
        </div>
    );
};

export default Dashboard;