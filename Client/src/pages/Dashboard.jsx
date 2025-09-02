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
    getBadge,
    formatDate
} from '../utils/blogUtils.js';
import avatar from '../../src/assets/user.jpg';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
    const { user, api } = useAuth();
    const navigate = useNavigate();
    const { username: paramUsername } = useParams();
    const { darkMode, primaryColor, shadeColor } = useTheme();
    const [activeSection, setActiveSection] = useState('profile');
    const [viewedUser, setViewedUser] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [trash, setTrash] = useState([]);
    const [savedBlogs, setSavedBlogs] = useState([]);
    const [upvotedBlogs, setUpvotedBlogs] = useState([]);
    const [downvotedBlogs, setDownvotedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOption, setSortOption] = useState('popular');
    const [allBadges, setAllBadges] = useState([]);
    const [userPoints, setUserPoints] = useState(0);
    const [highestBadge, setHighestBadge] = useState('No Badge');
    const [publishedCount, setPublishedCount] = useState(0);
    const [draftCount, setDraftCount] = useState(0);
    const [savedCount, setSavedCount] = useState(0);
    const [activityData, setActivityData] = useState({
        labels: [],
        posts: [],
        comments: [],
        likes: [],
        reports: []
    });
    // New state variables for favorite category and recommendations
    const [favoriteCategory, setFavoriteCategory] = useState('');
    const [recommendedBlogs, setRecommendedBlogs] = useState([]);
    const [recommendationsLoading, setRecommendationsLoading] = useState(false);
    
    const barChartRef = useRef(null);
    const pieChartRef = useRef(null);
    const performanceChartRef = useRef(null);

    const primaryDark = shadeColor(primaryColor, -20);
    const primaryLight = shadeColor(primaryColor, 20);

    const themeStyles = {
        '--primary-color': primaryColor,
        '--primary-dark': primaryDark,
        '--primary-light': primaryLight,
    };

    // Function to determine favorite category based on saved blogs
    const determineFavoriteCategory = (savedBlogs) => {
        if (!savedBlogs || savedBlogs.length === 0) return '';
        
        // Count categories from saved blogs
        const categoryCount = {};
        savedBlogs.forEach(blog => {
            if (blog.categories && Array.isArray(blog.categories)) {
                blog.categories.forEach(category => {
                    categoryCount[category] = (categoryCount[category] || 0) + 1;
                });
            }
        });
        
        // Find the category with the highest count
        let favorite = '';
        let maxCount = 0;
        for (const [category, count] of Object.entries(categoryCount)) {
            if (count > maxCount) {
                maxCount = count;
                favorite = category;
            }
        }
        
        return favorite;
    };

    // Function to fetch recommended blogs based on category
    const fetchRecommendedBlogs = async (category) => {
        if (!category) return;
        
        setRecommendationsLoading(true);
        try {
            const response = await api.get(`/published-blogs/?category=${category}&limit=3`);
            setRecommendedBlogs((response.data.blogs || []).map(normalizeBlog));
        } catch (err) {
            console.error('Error fetching recommended blogs:', err);
        } finally {
            setRecommendationsLoading(false);
        }
    };

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
                            const normalizedSavedBlogs = (response.data || []).map(normalizeBlog);
                            setSavedBlogs(normalizedSavedBlogs);
                            // Update favorite category when saved blogs are fetched
                            if (normalizedSavedBlogs.length > 0) {
                                const favCategory = determineFavoriteCategory(normalizedSavedBlogs);
                                setFavoriteCategory(favCategory);
                                fetchRecommendedBlogs(favCategory);
                            } else {
                                setFavoriteCategory('');
                                setRecommendedBlogs([]);
                            }
                        }
                        break;
                    case 'voted':
                        if (isOwn) {
                            response = await api.get(`/user/${viewUsername}/voted-blogs/`);
                            if (response.data) {
                                setUpvotedBlogs((response.data.upvoted || []).map(normalizeBlog));
                                setDownvotedBlogs((response.data.downvoted || []).map(normalizeBlog));
                            }
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
                    // Reset favorite category and recommendations on error
                    setFavoriteCategory('');
                    setRecommendedBlogs([]);
                } else if (activeSection === 'voted') {
                    setUpvotedBlogs([]);
                    setDownvotedBlogs([]);
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

    // Effect to fetch saved blogs when profile section is active for own profile
    useEffect(() => {
        const fetchSavedBlogsForProfile = async () => {
            if (activeSection === 'profile' && isOwn && viewUsername) {
                try {
                    const response = await api.get(`/user/${viewUsername}/saved-blogs/`);
                    const normalizedSavedBlogs = (response.data || []).map(normalizeBlog);
                    setSavedBlogs(normalizedSavedBlogs);
                    
                    // Update favorite category when saved blogs are fetched
                    if (normalizedSavedBlogs.length > 0) {
                        const favCategory = determineFavoriteCategory(normalizedSavedBlogs);
                        setFavoriteCategory(favCategory);
                        fetchRecommendedBlogs(favCategory);
                    } else {
                        setFavoriteCategory('');
                        setRecommendedBlogs([]);
                    }
                } catch (err) {
                    console.error('Error fetching saved blogs for profile:', err);
                    setSavedBlogs([]);
                    setFavoriteCategory('');
                    setRecommendedBlogs([]);
                }
            }
        };

        fetchSavedBlogsForProfile();
    }, [activeSection, isOwn, viewUsername, api]);

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
                    return (b.upvotes?.length || b.upvote_count || 0) - (a.upvotes?.length || a.upvote_count || 0);
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

    const handleProfileClick = (username) => {
        navigate(`/dashboard/${username}`);
    };

    const sections = isOwn ? ['profile', 'blogs', 'drafts', 'trash', 'saved', 'voted'] : ['profile', 'blogs'];

    const renderSectionTitle = (title) => (
        <h1
            className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
            style={{ borderColor: primaryColor }}
        >
            {title}
        </h1>
    );

    const renderEmptyMessage = (message) => (
        <div className={`text-center py-10 rounded-xl ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
            <i className="fas fa-newspaper text-3xl mb-4"></i>
            <p>{message || `No ${activeSection === 'trash' ? 'items in trash' : activeSection === 'drafts' ? 'draft blogs found' : activeSection === 'saved' ? 'saved blogs found' : activeSection === 'voted' ? 'voted blogs found' : 'published blogs yet'}.`}</p>
        </div>
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
            className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100' : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800'}`}
            style={themeStyles}
        >
            <Navbar activePage="dashboard" />

            <div className="pt-20 min-h-screen">
                <div className="flex flex-col md:flex-row">
                    {/* Sidebar */}
                    <div className={`w-full md:w-64 transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r`}>
                        <div className="p-4">
                            <ul className="space-y-2">
                                {sections.map((section) => (
                                    <li key={section}>
                                        <button
                                            onClick={() => setActiveSection(section)}
                                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center transition-all duration-300 ${
                                                activeSection === section 
                                                    ? 'font-semibold shadow-md'
                                                    : 'opacity-80 hover:opacity-100'
                                            }`}
                                            style={{
                                                backgroundColor: activeSection === section 
                                                    ? darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'
                                                    : 'transparent',
                                                color: activeSection === section
                                                    ? primaryColor
                                                    : darkMode ? '#e2e8f0' : '#4a5568',
                                            }}
                                        >
                                            <i
                                                className={`fas fa-${section === 'profile' ? 'user' :
                                                    section === 'blogs' ? 'newspaper' :
                                                        section === 'drafts' ? 'file-alt' :
                                                            section === 'trash' ? 'trash' : 
                                                                section === 'voted' ? 'vote-yea' : 'bookmark'
                                                } mr-3`}
                                            ></i>
                                            {section === 'profile' ? (isOwn ? 'My Profile' : `${viewedUser.username}'s Profile`) :
                                                section === 'blogs' ? (isOwn ? 'My Blogs' : `${viewedUser.username}'s Blogs`) :
                                                    section === 'drafts' ? 'Draft Blogs' :
                                                        section === 'trash' ? 'Trash' : 
                                                            section === 'saved' ? 'Saved Blogs' : 'Voted Blogs'}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className={`flex-1 p-6 transition-colors duration-300 ${darkMode ? 'bg-transparent' : 'bg-transparent'}`}>
                        <div className="max-w-7xl mx-auto">
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

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                        <div className={`lg:col-span-2 rounded-2xl p-6 shadow-lg transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
                                            <div className="flex flex-col md:flex-row items-center mb-6">
                                                <div className="relative">
                                                    <img
                                                        src={viewedUser?.avatar_url || avatar}
                                                        alt="Profile"
                                                        className="w-24 h-24 rounded-full object-cover mr-0 md:mr-6 mb-4 md:mb-0 shadow-lg border-4"
                                                        style={{ borderColor: primaryColor }}
                                                    />
                                                    {viewedUser?.is_verified && (
                                                        <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1 shadow-md">
                                                            <i className="fas fa-check text-white text-xs"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-center md:text-left md:ml-6">
                                                    <h2 className={`text-2xl font-bold transition-colors duration-200 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{viewedUser?.username || 'User'}</h2>
                                                    <p className={`mb-2 transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{viewedUser?.job_title || 'Member'}</p>
                                                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                                        <span
                                                            className="px-3 py-1 rounded-full text-xs font-semibold text-white shadow"
                                                            style={{ backgroundColor: primaryColor }}
                                                        >
                                                            {viewedUser?.university || 'TechSage'} {viewedUser?.role || 'User'}
                                                        </span>
                                                        {viewedUser?.is_verified && (
                                                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                                                                Verified
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className={`text-lg font-semibold mb-3 pb-2 border-b transition-colors duration-200 ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>
                                                    About
                                                </h3>
                                                <p className={`mb-4 transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {viewedUser?.bio || 'No bio provided yet.'}
                                                </p>
                                                {/* Replace Share and Contact buttons with profile links */}
                                                <div className="flex flex-wrap gap-3 mt-4">
                                                    {viewedUser?.github && (
                                                        <a 
                                                            href={viewedUser.github} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center px-3 py-2 rounded-lg transition-all duration-300"
                                                            style={{ 
                                                                backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                                                                color: '#333'
                                                            }}
                                                        >
                                                            <i className="fab fa-github mr-2"></i> GitHub
                                                        </a>
                                                    )}
                                                    {viewedUser?.linkedin && (
                                                        <a 
                                                            href={viewedUser.linkedin} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center px-3 py-2 rounded-lg transition-all duration-300"
                                                            style={{ 
                                                                backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                                                                color: '#0077b5'
                                                            }}
                                                        >
                                                            <i className="fab fa-linkedin mr-2"></i> LinkedIn
                                                        </a>
                                                    )}
                                                    {viewedUser?.twitter && (
                                                        <a 
                                                            href={viewedUser.twitter} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center px-3 py-2 rounded-lg transition-all duration-300"
                                                            style={{ 
                                                                backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                                                                color: '#1DA1F2'
                                                            }}
                                                        >
                                                            <i className="fab fa-twitter mr-2"></i> Twitter
                                                        </a>
                                                    )}
                                                    {viewedUser?.website && (
                                                        <a 
                                                            href={viewedUser.website} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center px-3 py-2 rounded-lg transition-all duration-300"
                                                            style={{ 
                                                                backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                                                                color: primaryColor
                                                            }}
                                                        >
                                                            <i className="fas fa-globe mr-2"></i> Website
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className={`rounded-2xl p-4 shadow-md transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
                                                <div className="flex items-center">
                                                    <div className="flex justify-center mr-3">
                                                        <i className="fas fa-newspaper text-xl" style={{ color: primaryColor }}></i>
                                                    </div>
                                                    <div>
                                                        <div 
                                                            className="text-xl font-bold"
                                                            style={{ color: primaryColor }}
                                                        >
                                                            {publishedCount}
                                                        </div>
                                                        <div className={`text-sm transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Publications</div>
                                                    </div>
                                                </div>
                                            </div>
                                            {isOwn && (
                                                <>
                                                    <div className={`rounded-2xl p-4 shadow-md transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
                                                        <div className="flex items-center">
                                                            <div className="flex justify-center mr-3">
                                                                <i className="fas fa-file-alt text-xl" style={{ color: primaryColor }}></i>
                                                            </div>
                                                            <div>
                                                                <div 
                                                                    className="text-xl font-bold"
                                                                    style={{ color: primaryColor }}
                                                                >
                                                                    {draftCount}
                                                                </div>
                                                                <div className={`text-sm transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Draft Blogs</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`rounded-2xl p-4 shadow-md transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
                                                        <div className="flex items-center">
                                                            <div className="flex justify-center mr-3">
                                                                <i className="fas fa-star text-xl" style={{ color: primaryColor }}></i>
                                                            </div>
                                                            <div>
                                                                <div 
                                                                    className="text-xl font-bold"
                                                                    style={{ color: primaryColor }}
                                                                >
                                                                    {userPoints}
                                                                </div>
                                                                <div className={`text-sm transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Points</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`rounded-2xl p-4 shadow-md transition-all duration-300 hover:shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
                                                        <div className="flex items-center">
                                                            <div className="flex justify-center mr-3">
                                                                <i className="fas fa-award text-xl" style={{ color: primaryColor }}></i>
                                                            </div>
                                                            <div>
                                                                <div 
                                                                    className="text-xl font-bold"
                                                                    style={{ color: primaryColor }}
                                                                >
                                                                    {highestBadge}
                                                                </div>
                                                                <div className={`text-sm transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Highest Badge</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* User Activity Charts */}
                                    <div className={`rounded-2xl p-6 mb-6 h-80 transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border border-gray-200 dark:border-gray-700`}>
                                        <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                            <i className="fas fa-chart-line mr-2" style={{ color: primaryColor }}></i>User Activity
                                        </h3>
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex-1 h-64">
                                                <canvas id="performanceBarChart"></canvas>
                                            </div>
                                            <div className="flex-1 h-64">
                                                <canvas id="performancePieChart"></canvas>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Favorite Category and Recommendations Section */}
                                    {isOwn && favoriteCategory && (
                                        <div className={`rounded-2xl p-6 mb-6 transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border border-gray-200 dark:border-gray-700`}>
                                            <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                <i className="fas fa-heart mr-2" style={{ color: primaryColor }}></i>Based on Your Interest
                                            </h3>
                                            <div className="mb-4">
                                                <span className="text-lg font-medium">Your favorite category:</span>
                                                <span 
                                                    className="ml-2 px-3 py-1 rounded-full text-sm font-semibold text-white"
                                                    style={{ backgroundColor: primaryColor }}
                                                >
                                                    {favoriteCategory}
                                                </span>
                                            </div>
                                            
                                            <div className="mt-6">
                                                <h4 className={`text-lg font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    Recommended for you
                                                </h4>
                                                {recommendationsLoading ? (
                                                    <div className="flex justify-center items-center h-32">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
                                                    </div>
                                                ) : recommendedBlogs.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {recommendedBlogs.map((blog) => (
                                                            <div 
                                                                key={blog.id} 
                                                                className={`p-4 rounded-xl transition-all duration-300 hover:shadow-md cursor-pointer ${darkMode ? 'bg-gray-750 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}
                                                                onClick={() => navigate(`/blog/${blog.id}`)}
                                                            >
                                                                <h5 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{blog.title}</h5>
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {blog.categories && blog.categories.map((category, index) => (
                                                                        <span 
                                                                            key={index}
                                                                            className="px-2 py-1 rounded-full text-xs"
                                                                            style={{ 
                                                                                backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                                                                                color: '#3b82f6'
                                                                            }}
                                                                        >
                                                                            {category}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className={`text-center py-6 rounded-xl ${darkMode ? 'bg-gray-750 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                                                        <i className="fas fa-book-open text-2xl mb-2"></i>
                                                        <p>No recommendations found for this category</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

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
                                        <div className="space-y-4">
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
                                                    showHistory={isOwn}
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
                                        <div className="space-y-4">
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
                                    ) : renderEmptyMessage('No draft blogs found.')}
                                </div>
                            )}

                            {!loading && activeSection === 'trash' && isOwn && (
                                <div>
                                    {renderSectionTitle('Trash')}

                                    {trash && trash.length > 0 ? (
                                        <div className="space-y-4">
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
                                    ) : renderEmptyMessage('No items in trash.')}
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
                                            <option value="popular">Most Popular</option>
                                            <option value="newest">Newest First</option>
                                            <option value="oldest">Oldest First</option>
                                        </select>
                                    </div>

                                    {savedBlogs.length > 0 ? (
                                        <div className="space-y-4">
                                            {sortedBlogs().map((blog) => (
                                                <BlogCardDash
                                                    key={blog.id}
                                                    blog={blog}
                                                    darkMode={darkMode}
                                                    onUnsave={handleUnsave}
                                                    showUpvotes={true}
                                                    showUnsave={true}
                                                />
                                            ))}
                                        </div>
                                    ) : renderEmptyMessage('No saved blogs found.')}
                                </div>
                            )}

                            {!loading && activeSection === 'voted' && isOwn && (
                                <div>
                                    {renderSectionTitle('Voted Blogs')}

                                    <div className="mb-6">
                                        <h2 className="text-xl font-semibold mb-4">Upvoted Blogs</h2>
                                        {upvotedBlogs.length > 0 ? (
                                            <div className="space-y-4">
                                                {upvotedBlogs.map((blog) => (
                                                    <BlogCardDash
                                                        key={blog.id}
                                                        blog={blog}
                                                        darkMode={darkMode}
                                                        showUpvotes={true}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            renderEmptyMessage('No upvoted blogs yet.')
                                        )}
                                    </div>

                                    <div className="mb-6">
                                        <h2 className="text-xl font-semibold mb-4">Downvoted Blogs</h2>
                                        {downvotedBlogs.length > 0 ? (
                                            <div className="space-y-4">
                                                {downvotedBlogs.map((blog) => (
                                                    <BlogCardDash
                                                        key={blog.id}
                                                        blog={blog}
                                                        darkMode={darkMode}
                                                        showUpvotes={true}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            renderEmptyMessage('No downvoted blogs yet.')
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
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