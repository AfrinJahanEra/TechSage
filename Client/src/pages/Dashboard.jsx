import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Chart } from 'chart.js/auto';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const Dashboard = () => {
    const { user } = useAuth();
    const { darkMode, primaryColor, shadeColor } = useTheme();
    const [activeSection, setActiveSection] = useState('profile');
    const [profileData, setProfileData] = useState({
        username: '',
        name: '',
        email: '',
        university: '',
        job_title: 'User',
        bio: '',
        avatar_url: '',
        role: 'user',
        is_verified: false,
        total_publications: 0,
        followers: 0,
        points: 0
    });
    const [loading, setLoading] = useState(true);

    // Generate color variants based on primary color
    const primaryDark = shadeColor(primaryColor, -20);
    const primaryLight = shadeColor(primaryColor, 20);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`/api/user/${user.username}`);
                setProfileData({
                    username: response.data.username || '',
                    name: response.data.name || response.data.username || '',
                    email: response.data.email || '',
                    university: response.data.university || '',
                    job_title: response.data.job_title || 'User',
                    bio: response.data.bio || '',
                    avatar_url: response.data.avatar_url || '',
                    role: response.data.role || 'user',
                    is_verified: response.data.is_verified || false,
                    total_publications: response.data.total_publications || 0,
                    followers: response.data.followers || 0,
                    points: response.data.points || 0
                });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setLoading(false);
            }
        };

        if (user && user.username) {
            fetchUserData();
        }
    }, [user]);

    useEffect(() => {
        const ctx = document.getElementById('performanceChart');
        if (ctx && !loading) {
            const performanceChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Blog Views',
                        data: [1200, 1900, 1500, 2200, 1800, 2500],
                        borderColor: primaryColor,
                        backgroundColor: darkMode 
                            ? `${primaryColor}20` // 20% opacity
                            : `${primaryColor}10`, // 10% opacity
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
    }, [darkMode, primaryColor, primaryDark, loading]);

    // Dynamic style variables for theme colors
    const themeStyles = {
        '--primary-color': primaryColor,
        '--primary-dark': primaryDark,
        '--primary-light': primaryLight,
    };

    const getBadgeColor = (points) => {
        if (points >= 1000) return 'from-purple-600 to-pink-600';
        if (points >= 500) return 'from-blue-600 to-teal-600';
        if (points >= 200) return 'from-green-600 to-emerald-600';
        return 'from-yellow-600 to-orange-600';
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
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
                        {activeSection === 'profile' && (
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
                                                src={profileData.avatar_url || "https://randomuser.me/api/portraits/women/44.jpg"}
                                                alt="Profile"
                                                className="w-20 h-20 rounded-full border-4 object-cover mr-0 md:mr-6 mb-4 md:mb-0"
                                                style={{ borderColor: primaryColor }}
                                            />
                                            <div className="text-center md:text-left">
                                                <h2 className="text-xl font-bold">{profileData.name || profileData.username}</h2>
                                                <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{profileData.job_title}</p>
                                                <div className="flex justify-center md:justify-start space-x-2">
                                                    {profileData.role && (
                                                        <span 
                                                            className="px-3 py-1 rounded-full text-xs text-white"
                                                            style={{ backgroundColor: primaryColor }}
                                                        >
                                                            {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                                                        </span>
                                                    )}
                                                    {profileData.is_verified && (
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
                                                {profileData.bio || 'No bio provided'}
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
                                        <div className={`rounded-lg p-4 shadow-sm text-center transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            <div 
                                                className="text-3xl font-bold mb-1"
                                                style={{ color: primaryColor }}
                                            >
                                                {profileData.total_publications}
                                            </div>
                                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                Total Publications
                                            </div>
                                        </div>
                                        <div className={`rounded-lg p-4 shadow-sm text-center transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            <div 
                                                className="text-3xl font-bold mb-1"
                                                style={{ color: primaryColor }}
                                            >
                                                {profileData.followers}
                                            </div>
                                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                Followers
                                            </div>
                                        </div>
                                        <div className={`rounded-lg p-4 shadow-sm text-center transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            <div 
                                                className="text-3xl font-bold mb-1"
                                                style={{ color: primaryColor }}
                                            >
                                                4.7
                                            </div>
                                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                Avg. Reading Time (min)
                                            </div>
                                        </div>
                                        <div className={`rounded-lg p-4 shadow-sm text-center transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            <div className="flex flex-col items-center">
                                                <div 
                                                    className={`text-3xl font-bold mb-1 bg-gradient-to-r ${getBadgeColor(profileData.points)} text-transparent bg-clip-text`}
                                                >
                                                    {profileData.points}
                                                </div>
                                                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    Points
                                                </div>
                                                <span className={`text-xs mt-1 px-2 py-1 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                                    {profileData.points >= 1000 ? 'Expert' : 
                                                     profileData.points >= 500 ? 'Advanced' : 
                                                     profileData.points >= 200 ? 'Intermediate' : 'Beginner'}
                                                </span>
                                            </div>
                                        </div>
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
                                        Recent Blogs
                                    </h2>
                                    <div className="space-y-6">
                                        {[
                                            {
                                                title: 'Quantum Computing Breakthroughs',
                                                date: 'May 15, 2025',
                                                readTime: '5 min read',
                                                views: '1.2K',
                                                likes: '124',
                                                image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80'
                                            },
                                            {
                                                title: 'Space Exploration Technologies',
                                                date: 'April 28, 2025',
                                                readTime: '7 min read',
                                                views: '890',
                                                likes: '95',
                                                image: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80'
                                            }
                                        ].map((blog, index) => (
                                            <div key={index} className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                <div
                                                    className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                                    style={{ backgroundImage: `url('${blog.image}')` }}
                                                ></div>
                                                <div>
                                                    <h3 className="text-lg font-semibold">{blog.title}</h3>
                                                    <div className={`flex justify-between text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        <span>{blog.date}</span>
                                                        <span>{blog.readTime}</span>
                                                    </div>
                                                    <div className="flex space-x-4 mt-2">
                                                        <button 
                                                            className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                                            style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                                                        >
                                                            <i className="fas fa-eye mr-1"></i> {blog.views}
                                                        </button>
                                                        <button 
                                                            className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                                            style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                                                        >
                                                            <i className="fas fa-heart mr-1"></i> {blog.likes}
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
                                    My Blogs
                                </h1>

                                <div className="mb-6">
                                    <select className={`border rounded px-3 py-2 w-full md:w-64 transition-colors duration-300 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-800'}`}>
                                        <option value="all">All Blogs</option>
                                        <option value="popular">Most Popular</option>
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                    </select>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        {
                                            title: 'Quantum Computing Breakthroughs',
                                            date: 'May 15, 2025',
                                            readTime: '5 min read',
                                            views: '1.2K',
                                            likes: '124',
                                            image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80'
                                        },
                                        {
                                            title: 'Space Exploration Technologies',
                                            date: 'April 28, 2025',
                                            readTime: '7 min read',
                                            views: '890',
                                            likes: '95',
                                            image: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80'
                                        }
                                    ].map((blog, index) => (
                                        <div key={index} className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <div
                                                className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                                style={{ backgroundImage: `url('${blog.image}')` }}
                                            ></div>
                                            <div>
                                                <h3 className="text-lg font-semibold">{blog.title}</h3>
                                                <div className={`flex justify-between text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    <span>{blog.date}</span>
                                                    <span>{blog.readTime}</span>
                                                </div>
                                                <div className="flex space-x-4 mt-2">
                                                    <button 
                                                        className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                                        style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                                                    >
                                                        <i className="fas fa-eye mr-1"></i> {blog.views}
                                                    </button>
                                                    <button 
                                                        className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                                        style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                                                    >
                                                        <i className="fas fa-heart mr-1"></i> {blog.likes}
                                                    </button>
                                                    <button 
                                                        className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                                        style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                                                    >
                                                        <i className="fas fa-ellipsis-v"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeSection === 'drafts' && (
                            <div>
                                <h1 
                                    className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                                    style={{ borderColor: primaryColor }}
                                >
                                    Draft Blogs
                                </h1>

                                {[
                                    {
                                        title: '$20 million gift supports theoretical physics research at MIT',
                                        date: 'May 14, 2025',
                                        image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80'
                                    },
                                    {
                                        title: 'New findings in quantum entanglement research',
                                        date: 'May 10, 2025',
                                        image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80'
                                    }
                                ].map((draft, index) => (
                                    <div key={index} className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <div
                                            className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                            style={{ backgroundImage: `url('${draft.image}')` }}
                                        ></div>
                                        <div>
                                            <h3 className="text-lg font-semibold">{draft.title}</h3>
                                            <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Last edited: {draft.date}
                                            </div>
                                            <div className="flex space-x-4 mt-2">
                                                <button 
                                                    className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                                    style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                                                >
                                                    <i className="fas fa-edit mr-1"></i> Edit
                                                </button>
                                                <button 
                                                    className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                                    style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                                                >
                                                    <i className="fas fa-trash mr-1"></i> Delete
                                                </button>
                                                <button 
                                                    className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
                                                    style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
                                                >
                                                    <i className="fas fa-share mr-1"></i> Publish
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeSection === 'saved' && (
                            <div>
                                <h1 
                                    className="text-2xl font-bold mb-6 pb-2 border-b-2 inline-block"
                                    style={{ borderColor: primaryColor }}
                                >
                                    Saved Blogs
                                </h1>

                                <div className="space-y-6">
                                    {[
                                        {
                                            title: 'Space Exploration Technologies',
                                            author: 'By Dr. Emily Wong',
                                            date: 'May 5, 2025',
                                            image: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80'
                                        },
                                        {
                                            title: 'AI in Healthcare: Clinical Trial Results',
                                            author: 'By Dr. Michael Chen',
                                            date: 'April 22, 2025',
                                            image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80'
                                        }
                                    ].map((saved, index) => (
                                        <div key={index} className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <div
                                                className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                                style={{ backgroundImage: `url('${saved.image}')` }}
                                            ></div>
                                            <div>
                                                <h3 className="text-lg font-semibold">{saved.title}</h3>
                                                <div className={`flex justify-between text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    <span>{saved.author}</span>
                                                    <span>{saved.date}</span>
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