import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import { Chart } from 'chart.js/auto';
import { toast } from 'react-toastify';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import BlogCardDash from '../components/BlogCardDash.jsx';
import 'chartjs-plugin-annotation';
import {
    normalizeBlog,
    getBadge
} from '../utils/blogUtils.js';
import avatar from '../../src/assets/default-avatar.png';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
    const { user, api } = useAuth();
    const navigate = useNavigate();
    const { username: paramUsername } = useParams();
    const { darkMode, primaryColor, shadeColor } = useTheme();
    const [activeSection, setActiveSection] = useState('profile');
    const [blogs, setBlogs] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [trash, setTrash] = useState([]);
    const [savedBlogs, setSavedBlogs] = useState([]);
    const [sortOption, setSortOption] = useState('newest');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [publishedCount, setPublishedCount] = useState(0);
    const [draftCount, setDraftCount] = useState(0);
    const [savedCount, setSavedCount] = useState(0);
    const [userPoints, setUserPoints] = useState(0);
    const [highestBadge, setHighestBadge] = useState('No Badge');
    const [viewedUser, setViewedUser] = useState(null);
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

    useEffect(() => {
        const fetchViewedUser = async () => {
            setLoading(true);
            setError(null);
            try {
                if (paramUsername) {
                    const response = await api.get(`/user/${paramUsername}/`);
                    setViewedUser(response.data);
                } else {
                    setViewedUser(user);
                }
            } catch (err) {
                console.error('Fetch user error:', err);
                setError(err.response?.data?.error || 'User not found');
                if (err.response?.status === 404) {
                    setError('User not found');
                }
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchViewedUser();
        }
    }, [paramUsername, user, api]);

    const viewUsername = viewedUser?.username;
    const isOwn = viewedUser?.id === user?.id;

    useEffect(() => {
        const fetchAllBadges = async () => {
            try {
                const response = await api.get('/badges/');
                const sortedBadges = response.data.sort((a, b) => a.points_required - b.points_required);
                setAllBadges(sortedBadges);
            } catch (err) {
                console.error('Fetch badges error:', err);
            }
        };

        fetchAllBadges();
    }, [api]);

    useEffect(() => {
        const fetchUserStats = async () => {
            try {
                const response = await api.get('/all-users/');
                if (response.data?.users && viewUsername) {
                    const currentUser = response.data.users.find(u => u.username === viewUsername);
                    if (currentUser) {
                        setUserPoints(currentUser.points || 0);
                        setPublishedCount(currentUser.published_blogs || 0);
                    }
                }
            } catch (err) {
                console.error('Fetch user stats error:', err);
            }
        };

        if (viewedUser) {
            fetchUserStats();
        }
    }, [viewedUser, viewUsername, api]);

    useEffect(() => {
        if (allBadges.length > 0 && userPoints >= 0) {
            const earnedBadges = allBadges.filter(badge => userPoints >= badge.points_required);
            const highest = earnedBadges[earnedBadges.length - 1];
            setHighestBadge(highest ? highest.title : 'No Badge');
        }
    }, [allBadges, userPoints]);

    useEffect(() => {
        const fetchCounts = async () => {
            if (isOwn && viewUsername) {
                try {
                    const draftRes = await api.get(`/blogs/?author=${viewUsername}&status=draft`);
                    setDraftCount(draftRes.data.count || 0);
                    const savedRes = await api.get(`/user/${viewUsername}/saved-blogs/`);
                    setSavedCount(savedRes.data.length || 0);
                } catch (err) {
                    console.error('Fetch counts error:', err);
                }
            } else {
                setDraftCount(0);
                setSavedCount(0);
            }
        };

        if (viewedUser) {
            fetchCounts();
        }
    }, [isOwn, viewUsername, api]);

    useEffect(() => {
        if (!isOwn && ['drafts', 'trash', 'saved'].includes(activeSection)) {
            setActiveSection('profile');
        }
    }, [isOwn, activeSection]);

    useEffect(() => {
        const fetchBlogs = async () => {
            if (!viewUsername) return;
            setLoading(true);
            setError(null);
            try {
                let response;
                switch (activeSection) {
                    case 'blogs':
                        response = await api.get(`/blogs/?author=${viewUsername}&status=published`);
                        setBlogs((response.data.results || []).map(normalizeBlog));
                        break;
                    case 'drafts':
                        if (isOwn) {
                            response = await api.get(`/blogs/?author=${viewUsername}&status=draft`);
                            setDrafts((response.data.results || []).map(normalizeBlog));
                        }
                        break;
                    case 'trash':
                        if (isOwn) {
                            response = await api.get(`/blogs/?author=${viewUsername}&status=trash`);
                            setTrash((response.data.results || []).map(normalizeBlog));
                        }
                        break;
                    case 'saved':
                        if (isOwn) {
                            response = await api.get(`/user/${viewUsername}/saved-blogs/`);
                            setSavedBlogs((response.data || []).map(normalizeBlog));
                        }
                        break;
                    case 'profile':
                        response = await api.get(`/published-blogs/?author=${viewUsername}&limit=2`);
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

        if (viewedUser) {
            fetchBlogs();
        }
    }, [activeSection, viewUsername, isOwn, api]);

    useEffect(() => {
        const fetchUserActivity = async () => {
            if (!viewUsername) return;
            try {
                const response = await api.get('/all-users/');
                const userData = response.data.users.find(u => u.username === viewUsername);
                if (userData) {
                    // Aggregate activity data by month for the last 6 months
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

                    // Fetch blogs to get creation dates
                    const blogsResponse = await api.get(`/blogs/?author=${viewUsername}&status=published`);
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

                    // Update with comments, likes, and reports from userData
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

        if (viewedUser) {
            fetchUserActivity();
        }
    }, [viewedUser, viewUsername, api]);

    useEffect(() => {
        // Bar Chart
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

        // Pie Chart
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
        const blogList = activeSection === 'saved' ? savedBlogs : blogs;
        if (!blogList || blogList.length === 0) return [];

        return [...blogList].sort((a, b) => {
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

    const handlePublish = async (blogId) => {
        try {
            await api.post(`/blogs/publish/${blogId}/`, { username: user.username });
            setDrafts(drafts.filter(blog => blog.id !== blogId));
            const response = await api.get(`/blogs/?author=${viewUsername}&status=published`);
            setBlogs((response.data.results || []).map(normalizeBlog));
            setPublishedCount(prev => prev + 1);
            setDraftCount(prev => prev - 1);
            toast.success('Blog published successfully!', {
                position: 'top-right',
                autoClose: 3000,
                theme: darkMode ? 'dark' : 'light'
            });
        } catch (err) {
            console.error('Publish error:', err);
            setError(err.response?.data?.error || 'Failed to publish blog');
            toast.error(err.response?.data?.error || 'Failed to publish blog', {
                position: 'top-right',
                autoClose: 3000,
                theme: darkMode ? 'dark' : 'light'
            });
        }
    };

    const handleDelete = async (blogId) => {
        try {
            await api.delete(`/blogs/delete/${blogId}/`, { data: { username: user.username } });
            setBlogs(blogs.filter(blog => blog.id !== blogId));
            setDrafts(drafts.filter(blog => blog.id !== blogId));
            const response = await api.get(`/blogs/?author=${viewUsername}&status=trash`);
            setTrash((response.data.results || []).map(normalizeBlog));
            if (activeSection === 'blogs') setPublishedCount(prev => prev - 1);
            if (activeSection === 'drafts') setDraftCount(prev => prev - 1);
            toast.success('Blog moved to trash!', {
                position: 'top-right',
                autoClose: 3000,
                theme: darkMode ? 'dark' : 'light'
            });
        } catch (err) {
            console.error('Delete error:', err);
            setError(err.response?.data?.error || 'Failed to delete blog');
            toast.error(err.response?.data?.error || 'Failed to delete blog', {
                position: 'top-right',
                autoClose: 3000,
                theme: darkMode ? 'dark' : 'light'
            });
        }
    };

    const handleRestore = async (blogId) => {
        try {
            await api.post(`/blogs/restore/${blogId}/`, { username: user.username });
            setTrash(trash.filter(blog => blog.id !== blogId));
            const response = await api.get(`/blogs/?author=${viewUsername}&status=published`);
            setBlogs((response.data.results || []).map(normalizeBlog));
            setPublishedCount(prev => prev + 1);
            toast.success('Blog restored successfully!', {
                position: 'top-right',
                autoClose: 3000,
                theme: darkMode ? 'dark' : 'light'
            });
        } catch (err) {
            console.error('Restore error:', err);
            setError(err.response?.data?.error || 'Failed to restore blog');
            toast.error(err.response?.data?.error || 'Failed to restore blog', {
                position: 'top-right',
                autoClose: 3000,
                theme: darkMode ? 'dark' : 'light'
            });
        }
    };

    const handlePermanentDelete = async (blogId) => {
        try {
            await api.delete(`/blogs/mod/delete/${blogId}/`);
            setTrash(trash.filter(blog => blog.id !== blogId));
            toast.success('Blog permanently deleted!', {
                position: 'top-right',
                autoClose: 3000,
                theme: darkMode ? 'dark' : 'light'
            });
        } catch (err) {
            console.error('Permanent delete error:', err);
            setError(err.response?.data?.error || 'Failed to permanently delete blog');
            toast.error(err.response?.data?.error || 'Failed to permanently delete blog', {
                position: 'top-right',
                autoClose: 3000,
                theme: darkMode ? 'dark' : 'light'
            });
        }
    };

    const handleUnsave = async (blogId) => {
        try {
            await api.delete(`/user/${user.username}/saved-blogs/`, {
                data: { blog_id: blogId }
            });
            setSavedBlogs(savedBlogs.filter(blog => blog.id !== blogId));
            setSavedCount(prev => prev - 1);
            toast.success('Blog removed from saved list!', {
                position: 'top-right',
                autoClose: 3000,
                theme: darkMode ? 'dark' : 'light'
            });
        } catch (err) {
            console.error('Unsave error:', err);
            setError(err.response?.data?.error || 'Failed to unsave blog');
            toast.error(err.response?.data?.error || 'Failed to unsave blog', {
                position: 'top-right',
                autoClose: 3000,
                theme: darkMode ? 'dark' : 'light'
            });
        }
    };

    const handleEditDraft = (draft) => {
        navigate('/create-blog', {
            state: {
                draftData: draft,
                isEditing: true
            }
        });
    };

    const themeStyles = {
        '--primary-color': primaryColor,
        '--primary-dark': primaryDark,
        '--primary-light': primaryLight,
    };

    const sections = isOwn ? ['profile', 'blogs', 'drafts', 'trash', 'saved'] : ['profile', 'blogs'];

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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`p-4 mb-4 rounded-lg ${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'}`}>
                {error}
            </div>
        );
    }

    if (!viewedUser) {
        return null;
    }

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
                            {sections.map((section) => (
                                <li key={section}>
                                    <button
                                        onClick={() => setActiveSection(section)}
                                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors duration-200 ${activeSection === section
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
                                            className={`fas fa-${section === 'profile' ? 'user' :
                                                section === 'blogs' ? 'newspaper' :
                                                    section === 'drafts' ? 'file-alt' :
                                                        section === 'trash' ? 'trash' : 'bookmark'
                                            } mr-3`}
                                            style={{ color: activeSection === section ? primaryColor : primaryColor }}
                                        ></i>
                                        {section === 'profile' ? (isOwn ? 'My Profile' : `${viewedUser.username}'s Profile`) :
                                            section === 'blogs' ? (isOwn ? 'My Blogs' : `${viewedUser.username}'s Blogs`) :
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
                                {renderSectionTitle(isOwn ? 'My Profile' : `${viewedUser.username}'s Profile`)}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className={`rounded-lg p-6 shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                        <div className="flex flex-col md:flex-row items-center mb-6">
                                            <img
                                                src={viewedUser?.avatar_url || avatar}
                                                alt="Profile"
                                                className="w-20 h-20 rounded-full border-4 object-cover mr-0 md:mr-6 mb-4 md:mb-0"
                                                style={{ borderColor: primaryColor }}
                                            />
                                            <div className="text-center md:text-left">
                                                <h2 className="text-xl font-bold">{viewedUser?.username || 'User'}</h2>
                                                <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{viewedUser?.job_title || 'Member'}</p>
                                                <div className="flex justify-center md:justify-start space-x-2">
                                                    <span
                                                        className="px-3 py-1 rounded-full text-xs text-white"
                                                        style={{ backgroundColor: primaryColor }}
                                                    >
                                                        {viewedUser?.university || 'TechSage'} {viewedUser?.role || 'User'}
                                                    </span>
                                                    {viewedUser?.is_verified && (
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
                                                {viewedUser?.bio || 'No bio provided yet.'}
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
                                            ...(isOwn ? [
                                                { value: draftCount, label: 'Draft Blogs' },
                                                // { value: savedCount, label: 'Saved Blogs' }
                                            ] : []),
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
                            </div>
                        )}

                        {!loading && activeSection === 'blogs' && (
                            <div>
                                {renderSectionTitle(isOwn ? 'My Blogs' : `${viewedUser.username}'s Blogs`)}

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
                                                onDelete={isOwn ? handleDelete : null}
                                                showDelete={isOwn}
                                                showUpvotes={true}
                                                showHistory={isOwn} // Pass showHistory only for "My Blogs"
                                            />
                                        ))}
                                    </div>
                                ) : renderEmptyMessage()}
                            </div>
                        )}

                        {!loading && activeSection === 'drafts' && isOwn && (
                            <div>
                                {renderSectionTitle('Draft Blogs')}

                                {drafts && drafts.length > 0 ? (
                                    <div className="space-y-6">
                                        {drafts.map((draft, index) => (
                                            <BlogCardDash
                                                key={index}
                                                blog={draft}
                                                darkMode={darkMode}
                                                primaryColor={primaryColor}
                                                primaryDark={primaryDark}
                                                onDelete={handleDelete}
                                                onPublish={handlePublish}
                                                onEdit={handleEditDraft}
                                                showDelete={true}
                                                showPublish={true}
                                                showEdit={true}
                                            />
                                        ))}
                                    </div>
                                ) : renderEmptyMessage()}
                            </div>
                        )}

                        {!loading && activeSection === 'trash' && isOwn && (
                            <div>
                                {renderSectionTitle('Trash')}

                                {trash && trash.length > 0 ? (
                                    <div className="space-y-6">
                                        {trash.map((blog, index) => (
                                            <BlogCardDash
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

                        {!loading && activeSection === 'saved' && isOwn && (
                            <div>
                                {renderSectionTitle('Saved Blogs')}

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
                                        {sortedBlogs().map((saved, index) => (
                                            <BlogCardDash
                                                key={index}
                                                blog={saved}
                                                darkMode={darkMode}
                                                primaryColor={primaryColor}
                                                primaryDark={primaryDark}
                                                onUnsave={handleUnsave}
                                                showUnsave={true}
                                                showUpvotes={false}
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