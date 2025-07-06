import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Chart } from 'chart.js/auto';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import BlogCard from '../components/BlogCardDash.jsx';
import { 
  normalizeBlog, 
  getBadge 
} from '../utils/blogUtils.js';

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

    const primaryDark = shadeColor(primaryColor, -20);
    const primaryLight = shadeColor(primaryColor, 20);

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            setError(null);
            try {
                let response;
                switch (activeSection) {
                    case 'blogs':
                        response = await api.get(`/blogs/?author=${user.username}&status=published`);
                        setBlogs((response.data.results || []).map(normalizeBlog));
                        break;
                    case 'drafts':
                        response = await api.get(`/blogs/?author=${user.username}&status=draft`);
                        setDrafts((response.data.results || []).map(normalizeBlog));
                        break;
                    case 'trash':
                        response = await api.get(`/blogs/?author=${user.username}&status=trash`);
                        setTrash((response.data.results || []).map(normalizeBlog));
                        break;
                    case 'saved':
                        response = await api.get(`/user/${user.username}/saved-blogs/`);
                        setSavedBlogs((response.data || []).map(normalizeBlog));
                        break;
                    case 'profile':
                        response = await api.get(`/published-blogs/?author=${user.username}&limit=2`);
                        setBlogs((response.data.blogs || []).map(normalizeBlog));
                        break;
                    default:
                        break;
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.response?.data?.error || 'Failed to fetch data');
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

    const sortedBlogs = () => {
        if (!blogs || blogs.length === 0) return [];
        
        return [...blogs].sort((a, b) => {
            switch (sortOption) {
                case 'popular':
                    return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
                case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                default:
                    return 0;
            }
        });
    };

    const handlePublish = async (blogId) => {
        try {
            await api.post(`/blogs/publish/${blogId}/`, { username: user.username });
            setDrafts(drafts.filter(blog => blog.id !== blogId));
            const response = await api.get(`/blogs/?author=${user.username}&status=published`);
            setBlogs((response.data.results || []).map(normalizeBlog));
        } catch (err) {
            console.error('Publish error:', err);
            setError(err.response?.data?.error || 'Failed to publish blog');
        }
    };

    const handleDelete = async (blogId) => {
        try {
            await api.delete(`/blogs/delete/${blogId}/`, { data: { username: user.username } });
            setBlogs(blogs.filter(blog => blog.id !== blogId));
            setDrafts(drafts.filter(blog => blog.id !== blogId));
            const response = await api.get(`/blogs/?author=${user.username}&status=trash`);
            setTrash((response.data.results || []).map(normalizeBlog));
        } catch (err) {
            console.error('Delete error:', err);
            setError(err.response?.data?.error || 'Failed to delete blog');
        }
    };

    const handleRestore = async (blogId) => {
        try {
            await api.post(`/blogs/restore/${blogId}/`, { username: user.username });
            setTrash(trash.filter(blog => blog.id !== blogId));
            const response = await api.get(`/blogs/?author=${user.username}&status=published`);
            setBlogs((response.data.results || []).map(normalizeBlog));
        } catch (err) {
            console.error('Restore error:', err);
            setError(err.response?.data?.error || 'Failed to restore blog');
        }
    };

    const handlePermanentDelete = async (blogId) => {
        try {
            await api.delete(`/blogs/mod/delete/${blogId}/`);
            setTrash(trash.filter(blog => blog.id !== blogId));
        } catch (err) {
            console.error('Permanent delete error:', err);
            setError(err.response?.data?.error || 'Failed to permanently delete blog');
        }
    };

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

    const themeStyles = {
        '--primary-color': primaryColor,
        '--primary-dark': primaryDark,
        '--primary-light': primaryLight,
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
            {loading ? 'Loading...' : `No ${activeSection === 'trash' ? 'items in trash' : activeSection === 'drafts' ? 'draft blogs found' : activeSection === 'saved' ? 'saved blogs found' : 'published blogs yet'}.`}
        </p>
    );

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
                            {['profile', 'blogs', 'drafts', 'trash', 'saved'].map((section) => (
                                <li key={section}>
                                    <button
                                        onClick={() => setActiveSection(section)}
                                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors duration-200 ${
                                            activeSection === section 
                                                ? `${darkMode ? 'bg-gray-700 border-[var(--primary-color)]' : 'bg-[var(--primary-light)] border-[var(--primary-color)]'}`
                                                : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
                                        } border-l-4`}
                                        style={{ 
                                            color: activeSection === section 
                                                ? darkMode 
                                                    ? primaryColor 
                                                    : primaryDark 
                                                : 'inherit',
                                            borderColor: activeSection === section ? primaryColor : 'transparent'
                                        }}
                                    >
                                        <i 
                                            className={`fas fa-${
                                                section === 'profile' ? 'user' :
                                                section === 'blogs' ? 'newspaper' :
                                                section === 'drafts' ? 'file-alt' :
                                                section === 'trash' ? 'trash' : 'bookmark'
                                            } mr-3`}
                                            style={{ color: activeSection === section ? primaryColor : primaryColor }}
                                        ></i>
                                        {section === 'profile' ? 'My Profile' :
                                         section === 'blogs' ? 'My Blogs' :
                                         section === 'drafts' ? 'Draft Blogs' :
                                         section === 'trash' ? 'Trash' : 'Saved Blogs'}
                                    </button>
                                </li>
                            ))}
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
                                {renderSectionTitle('My Profile')}

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
                                            { value: getBadge(user?.points), label: 'Badge' }
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
                                                <BlogCard
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
                            </div>
                        )}

                        {!loading && activeSection === 'blogs' && (
                            <div>
                                {renderSectionTitle('My Blogs')}

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
                                            <BlogCard
                                                key={index}
                                                blog={blog}
                                                darkMode={darkMode}
                                                primaryColor={primaryColor}
                                                primaryDark={primaryDark}
                                                onDelete={handleDelete}
                                                showDelete={true}
                                                showUpvotes={true}
                                            />
                                        ))}
                                    </div>
                                ) : renderEmptyMessage()}
                            </div>
                        )}

                        {!loading && activeSection === 'drafts' && (
                            <div>
                                {renderSectionTitle('Draft Blogs')}

                                {drafts && drafts.length > 0 ? (
                                    <div className="space-y-6">
                                        {drafts.map((draft, index) => (
                                            <BlogCard
                                                key={index}
                                                blog={draft}
                                                darkMode={darkMode}
                                                primaryColor={primaryColor}
                                                primaryDark={primaryDark}
                                                onDelete={handleDelete}
                                                onPublish={handlePublish}
                                                showDelete={true}
                                                showPublish={true}
                                            />
                                        ))}
                                    </div>
                                ) : renderEmptyMessage()}
                            </div>
                        )}

                        {!loading && activeSection === 'trash' && (
                            <div>
                                {renderSectionTitle('Trash')}

                                {trash && trash.length > 0 ? (
                                    <div className="space-y-6">
                                        {trash.map((blog, index) => (
                                            <BlogCard
                                                key={index}
                                                blog={blog}
                                                darkMode={darkMode}
                                                primaryColor={primaryColor}
                                                primaryDark={primaryDark}
                                                onRestore={handleRestore}
                                                onPermanentDelete={handlePermanentDelete}
                                                showRestore={true}
                                                showPermanentDelete={true}
                                            />
                                        ))}
                                    </div>
                                ) : renderEmptyMessage()}
                            </div>
                        )}

                        {!loading && activeSection === 'saved' && (
                            <div>
                                {renderSectionTitle('Saved Blogs')}

                                {savedBlogs && savedBlogs.length > 0 ? (
                                    <div className="space-y-6">
                                        {savedBlogs.map((saved, index) => (
                                            <BlogCard
                                                key={index}
                                                blog={saved}
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
                </div>
            </div>
            <div>
                <Footer />
            </div>
        </div>
    );
};

export default Dashboard;