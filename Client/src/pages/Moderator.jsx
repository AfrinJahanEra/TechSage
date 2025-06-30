import { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ModeratorDashboard = () => {
    const performanceChartRef = useRef(null);
    const [activeSection, setActiveSection] = useState('profile');
    const [blogFilter, setBlogFilter] = useState('all');
    const [reportFilter, setReportFilter] = useState('all');
    const [reports, setReports] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useAuth();
    const [darkMode, setDarkMode] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [showProfilePanel, setShowProfilePanel] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        username: '',
        name: '',
        job_title: 'Moderator',
        role: 'moderator',
        bio: '',
        avatar_url: '',
        is_verified: false
    });
    const [loading, setLoading] = useState(true);
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`/api/user/${user.username}`);
                setProfileData({
                    username: response.data.username || '',
                    name: response.data.name || response.data.username || '',
                    job_title: response.data.job_title || 'Moderator',
                    role: response.data.role || 'moderator',
                    bio: response.data.bio || '',
                    avatar_url: response.data.avatar_url || '',
                    is_verified: response.data.is_verified || false
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

    // Function to handle blog clicks
    const handleBlogClick = (blogId) => {
        navigate(`/blog/${blogId}`);
    };

    // Function to handle profile icon/name clicks
    const handleProfileClick = (userId) => {
        navigate(`/dashboard/${userId}`);
    };

    useEffect(() => {
        // Initialize dark mode from localStorage
        const savedDarkMode = localStorage.getItem('darkMode') === 'enabled';
        setDarkMode(savedDarkMode);

        if (savedDarkMode) {
            document.body.classList.add('dark-mode');
        }

        // Initialize reports from localStorage
        const storedReports = JSON.parse(localStorage.getItem('blogReports')) || [];
        setReports(storedReports);

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
                            label: 'Blog Views',
                            data: [1200, 1900, 1500, 2200, 1800, 2500],
                            borderColor: '#1a5276',
                            backgroundColor: 'rgba(26, 82, 118, 0.1)',
                            tension: 0.3,
                            fill: true
                        }, {
                            label: 'Engagement Rate',
                            data: [65, 59, 70, 72, 75, 78],
                            borderColor: '#7d3c98',
                            backgroundColor: 'rgba(125, 60, 152, 0.1)',
                            tension: 0.3,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: false
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                            }
                        }
                    }
                });
            }
        }

        // Navbar scroll effect
        const handleScroll = () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar?.classList.add('scrolled');
            } else {
                navbar?.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [activeSection]);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        if (newDarkMode) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    };

    const toggleNotifications = () => {
        setNotificationsEnabled(!notificationsEnabled);
        alert(`Notifications ${!notificationsEnabled ? 'enabled' : 'disabled'}`);
    };

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        setEditMode(false);
        alert('Profile updated successfully!');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
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

    const updateReportStatus = (index, status) => {
        const updatedReports = [...reports];
        if (updatedReports[index]) {
            updatedReports[index].status = status;
            localStorage.setItem('blogReports', JSON.stringify(updatedReports));
            setReports(updatedReports);
            alert(`Report marked as ${status}`);
        }
    };

    const filteredReports = reportFilter === 'all'
        ? reports
        : reports.filter(report => report.status === reportFilter);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        document.body.style.overflow = isMenuOpen ? '' : 'hidden';
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        document.body.style.overflow = '';
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

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
                                    onClick={() => setActiveSection('deleted')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === 'deleted' ? 'bg-teal-50 text-teal-600 border-l-4 border-teal-500' : 'hover:bg-gray-100'}`}
                                >
                                    <i className="fas fa-trash mr-3 text-teal-500"></i>
                                    Deleted Blogs
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection('reports')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === 'reports' ? 'bg-teal-50 text-teal-600 border-l-4 border-teal-500' : 'hover:bg-gray-100'}`}
                                >
                                    <i className="fas fa-flag mr-3 text-teal-500"></i>
                                    Reports
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Main Content */}
                    <div className={`flex-1 p-6 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
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
                                                src={profileData.avatar_url || "https://randomuser.me/api/portraits/women/44.jpg"}
                                                alt="Profile"
                                                className="w-20 h-20 rounded-full border-4 border-teal-500 object-cover mr-0 md:mr-6 mb-4 md:mb-0"
                                            />
                                            <div className="text-center md:text-left">
                                                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                    {profileData.name || profileData.username}
                                                </h2>
                                                <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    {profileData.job_title}
                                                </p>
                                                <div className="flex justify-center md:justify-start space-x-2">
                                                    <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-xs">
                                                        {(profileData.role || 'moderator').charAt(0).toUpperCase() + (profileData.role || 'moderator').slice(1)}
                                                    </span>
                                                    {profileData.is_verified && (
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
                                                {profileData.bio || 'No bio provided'}
                                            </p>
                                            <div className="flex space-x-4">
                                                <button className="text-teal-500 hover:text-teal-600 flex items-center">
                                                    <i className="fas fa-envelope mr-1"></i> Contact
                                                </button>
                                                <button className="text-teal-500 hover:text-teal-600 flex items-center">
                                                    <i className="fas fa-share-alt mr-1"></i> Share Profile
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className={`rounded-lg p-4 shadow-sm text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            <div className="text-3xl font-bold text-teal-500 mb-1">24</div>
                                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Reviews</div>
                                        </div>
                                        <div className={`rounded-lg p-4 shadow-sm text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            <div className="text-3xl font-bold text-teal-500 mb-1">1.2K</div>
                                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Blogs Moderated</div>
                                        </div>
                                        <div className={`rounded-lg p-4 shadow-sm text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            <div className="text-3xl font-bold text-teal-500 mb-1">4.7</div>
                                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Avg. Reviews/Day</div>
                                        </div>
                                        <div className={`rounded-lg p-4 shadow-sm text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            <div className="text-3xl font-bold text-teal-500 mb-1">78%</div>
                                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Accuracy</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Chart */}
                                <div className={`rounded-lg p-4 mb-6 h-80 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                    <canvas id="performanceChart"></canvas>
                                </div>

                                {/* Recent Blogs */}
                                <div>
                                    <h2 className={`text-xl font-bold mb-4 pb-2 border-b-2 border-teal-500 inline-block ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        Recent Reviewed Blogs
                                    </h2>
                                    <div className="space-y-6">
                                        {/* Blog Card 1 */}
                                        <div className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                                            <div
                                                className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center cursor-pointer"
                                                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80')" }}
                                                onClick={() => handleBlogClick("1")}
                                            ></div>
                                            <div>
                                                <h3 
                                                    className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} cursor-pointer hover:text-teal-500`}
                                                    onClick={() => handleBlogClick("1")}
                                                >
                                                    Quantum Computing Breakthroughs
                                                </h3>
                                                <div className={`flex justify-between text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    <span>May 15, 2025</span>
                                                    <span>5 min read</span>
                                                </div>
                                                <div className="flex space-x-4 mt-2">
                                                    <button className={`flex items-center text-sm ${darkMode ? 'text-gray-400 hover:text-teal-500' : 'text-gray-500 hover:text-teal-500'}`}>
                                                        <i className="fas fa-eye mr-1"></i> 1.2K
                                                    </button>
                                                    <button className={`flex items-center text-sm ${darkMode ? 'text-gray-400 hover:text-teal-500' : 'text-gray-500 hover:text-teal-500'}`}>
                                                        <i className="fas fa-heart mr-1"></i> 124
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Blog Card 2 */}
                                        <div className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                                            <div
                                                className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center cursor-pointer"
                                                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80')" }}
                                                onClick={() => handleBlogClick("2")}
                                            ></div>
                                            <div>
                                                <h3 
                                                    className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} cursor-pointer hover:text-teal-500`}
                                                    onClick={() => handleBlogClick("2")}
                                                >
                                                    AI in Healthcare Innovations
                                                </h3>
                                                <div className={`flex justify-between text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    <span>May 10, 2025</span>
                                                    <span>6 min read</span>
                                                </div>
                                                <div className="flex space-x-4 mt-2">
                                                    <button className={`flex items-center text-sm ${darkMode ? 'text-gray-400 hover:text-teal-500' : 'text-gray-500 hover:text-teal-500'}`}>
                                                        <i className="fas fa-eye mr-1"></i> 980
                                                    </button>
                                                    <button className={`flex items-center text-sm ${darkMode ? 'text-gray-400 hover:text-teal-500' : 'text-gray-500 hover:text-teal-500'}`}>
                                                        <i className="fas fa-heart mr-1"></i> 87
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Other sections (blogs, reviewed, deleted, reports) */}
                        {/* ... (keep the existing implementation for these sections) */}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ModeratorDashboard;