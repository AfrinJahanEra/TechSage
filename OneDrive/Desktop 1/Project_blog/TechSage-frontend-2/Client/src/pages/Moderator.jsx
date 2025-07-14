import { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

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
        name: user?.name || 'Demo User',
        email: user?.email || 'demo@university.edu',
        university: user?.university || 'Demo University',
        profession: 'Professor of Quantum Physics'
    });

    useEffect(() => {
        // Initialize dark mode from localStorage
        const savedDarkMode = localStorage.getItem('darkMode') === 'enabled';
        setDarkMode(savedDarkMode);

        if (savedDarkMode) {
            document.body.classList.add('dark-mode');
        }

        // Initialize reports from localStorage
        let performanceChart = null;
        const storedReports = JSON.parse(localStorage.getItem('blogReports'));

        if (!storedReports) {
            // Set sample reports if none exist
            const sampleReports = [
                {
                    blogId: "1",
                    blogTitle: "Quantum Computing Breakthroughs",
                    blogImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
                    reason: "Plagiarism",
                    details: "This blog appears to copy content from a published paper without proper attribution.",
                    reporter: {
                        name: "Dr. Michael Chen",
                        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
                    },
                    date: new Date().toLocaleDateString(),
                    status: "pending"
                },
                {
                    blogId: "2",
                    blogTitle: "AI in Healthcare Innovations",
                    blogImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
                    reason: "Inappropriate content",
                    details: "Contains unverified medical claims that could be dangerous if followed.",
                    reporter: {
                        name: "Dr. Emily Rodriguez",
                        avatar: "https://randomuser.me/api/portraits/women/65.jpg"
                    },
                    date: new Date().toLocaleDateString(),
                    status: "approved"
                },
                {
                    blogId: "3",
                    blogTitle: "Advanced Robotics Systems",
                    blogImage: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
                    reason: "Spam",
                    details: "This was mistakenly reported as spam. The content is legitimate research.",
                    reporter: {
                        name: "Prof. David Wilson",
                        avatar: "https://randomuser.me/api/portraits/men/75.jpg"
                    },
                    date: new Date().toLocaleDateString(),
                    status: "rejected"
                }
            ];
            localStorage.setItem('blogReports', JSON.stringify(sampleReports));
            setReports(sampleReports);
        } else {
            setReports(storedReports);
        }

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
                                                src={user?.avatar || "https://randomuser.me/api/portraits/women/44.jpg"}
                                                alt="Profile"
                                                className="w-20 h-20 rounded-full border-4 border-teal-500 object-cover mr-0 md:mr-6 mb-4 md:mb-0"
                                            />
                                            <div className="text-center md:text-left">
                                                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{profileData.name}</h2>
                                                <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{profileData.profession}</p>
                                                <div className="flex justify-center md:justify-start space-x-2">
                                                    <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-xs">
                                                        {profileData.university} Faculty
                                                    </span>
                                                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
                                                        Verified
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className={`text-lg font-semibold mb-3 pb-2 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>About</h3>
                                            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Professor of Quantum Physics at {profileData.university}. My research focuses on quantum error correction and
                                                quantum algorithms. Currently working on topological quantum computing approaches.
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
                                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Blogs</div>
                                        </div>
                                        <div className={`rounded-lg p-4 shadow-sm text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            <div className="text-3xl font-bold text-teal-500 mb-1">1.2K</div>
                                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Followers</div>
                                        </div>
                                        <div className={`rounded-lg p-4 shadow-sm text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            <div className="text-3xl font-bold text-teal-500 mb-1">4.7</div>
                                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Avg. Reading Time (min)</div>
                                        </div>
                                        <div className={`rounded-lg p-4 shadow-sm text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                            <div className="text-3xl font-bold text-teal-500 mb-1">78%</div>
                                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Engagement Rate</div>
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
                                                className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80')" }}
                                            ></div>
                                            <div>
                                                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quantum Computing Breakthroughs</h3>
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
                                                className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80')" }}
                                            ></div>
                                            <div>
                                                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>AI in Healthcare Innovations</h3>
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

                        {/* All Blogs Section */}
                        {activeSection === 'blogs' && (
                            <div>
                                <h1 className={`text-2xl font-bold mb-6 pb-2 border-b-2 border-teal-500 inline-block ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    All Blogs
                                </h1>

                                {/* Blog Filter */}
                                <div className="mb-5">
                                    <select
                                        className={`border rounded px-3 py-2 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                                        id="blog-filter"
                                        value={blogFilter}
                                        onChange={(e) => setBlogFilter(e.target.value)}
                                    >
                                        <option value="all">All Blogs</option>
                                        <option value="popular">Most Popular</option>
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                    </select>
                                </div>

                                {/* Blog List */}
                                <div className="space-y-6">
                                    {/* Blog Card 1 */}
                                    <div className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-5 items-center pb-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                                        <div
                                            className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80')" }}
                                        ></div>
                                        <div>
                                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quantum Computing Breakthroughs</h3>
                                            <div className={`flex justify-between text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                <span>May 15, 2025</span>
                                                <span>5 min read</span>
                                            </div>
                                            <div className="flex space-x-4 mt-3">
                                                <button className={`flex items-center text-sm ${darkMode ? 'text-gray-400 hover:text-teal-500' : 'text-gray-500 hover:text-teal-500'}`}>
                                                    <i className="fas fa-eye mr-1"></i> 1.2K
                                                </button>
                                                <button className={`flex items-center text-sm ${darkMode ? 'text-gray-400 hover:text-teal-500' : 'text-gray-500 hover:text-teal-500'}`}>
                                                    <i className="fas fa-heart mr-1"></i> 124
                                                </button>
                                                <button className="text-green-500 text-sm flex items-center hover:opacity-80">
                                                    <i className="fas fa-check mr-1"></i> Approve
                                                </button>
                                                <button className="text-red-500 text-sm flex items-center hover:opacity-80">
                                                    <i className="fas fa-trash mr-1"></i> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Blog Card 2 */}
                                    <div className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-5 items-center pb-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                                        <div
                                            className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80')" }}
                                        ></div>
                                        <div>
                                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>AI in Healthcare Innovations</h3>
                                            <div className={`flex justify-between text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                <span>May 10, 2025</span>
                                                <span>6 min read</span>
                                            </div>
                                            <div className="flex space-x-4 mt-3">
                                                <button className={`flex items-center text-sm ${darkMode ? 'text-gray-400 hover:text-teal-500' : 'text-gray-500 hover:text-teal-500'}`}>
                                                    <i className="fas fa-eye mr-1"></i> 980
                                                </button>
                                                <button className={`flex items-center text-sm ${darkMode ? 'text-gray-400 hover:text-teal-500' : 'text-gray-500 hover:text-teal-500'}`}>
                                                    <i className="fas fa-heart mr-1"></i> 87
                                                </button>
                                                <button className="text-green-500 text-sm flex items-center hover:opacity-80">
                                                    <i className="fas fa-check mr-1"></i> Approve
                                                </button>
                                                <button className="text-red-500 text-sm flex items-center hover:opacity-80">
                                                    <i className="fas fa-trash mr-1"></i> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reviewed Blogs Section */}
                        {activeSection === 'reviewed' && (
                            <div>
                                <h1 className={`text-2xl font-bold mb-6 pb-2 border-b-2 border-teal-500 inline-block ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    Reviewed Blogs
                                </h1>

                                {/* Blog List */}
                                <div className="space-y-6">
                                    {/* Blog Card 1 - Approved */}
                                    <div className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-5 items-center pb-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                                        <div
                                            className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80')" }}
                                        ></div>
                                        <div>
                                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                Quantum Computing Breakthroughs
                                                <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold ml-2 bg-green-50 text-green-500">
                                                    Approved
                                                </span>
                                            </h3>
                                            <div className={`flex justify-between text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                <span>May 15, 2025</span>
                                                <span>5 min read</span>
                                            </div>
                                            <div className="flex space-x-4 mt-3">
                                                <button className={`flex items-center text-sm ${darkMode ? 'text-gray-400 hover:text-teal-500' : 'text-gray-500 hover:text-teal-500'}`}>
                                                    <i className="fas fa-eye mr-1"></i> 1.2K
                                                </button>
                                                <button className={`flex items-center text-sm ${darkMode ? 'text-gray-400 hover:text-teal-500' : 'text-gray-500 hover:text-teal-500'}`}>
                                                    <i className="fas fa-heart mr-1"></i> 124
                                                </button>
                                                <button className="text-red-500 text-sm flex items-center hover:opacity-80">
                                                    <i className="fas fa-trash mr-1"></i> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Blog Card 2 - Rejected */}
                                    <div className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-5 items-center pb-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                                        <div
                                            className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80')" }}
                                        ></div>
                                        <div>
                                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                AI in Healthcare Innovations
                                                <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold ml-2 bg-red-50 text-red-500">
                                                    Rejected
                                                </span>
                                            </h3>
                                            <div className={`flex justify-between text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                <span>May 10, 2025</span>
                                                <span>6 min read</span>
                                            </div>
                                            <div className="flex space-x-4 mt-3">
                                                <button className={`flex items-center text-sm ${darkMode ? 'text-gray-400 hover:text-teal-500' : 'text-gray-500 hover:text-teal-500'}`}>
                                                    <i className="fas fa-eye mr-1"></i> 980
                                                </button>
                                                <button className={`flex items-center text-sm ${darkMode ? 'text-gray-400 hover:text-teal-500' : 'text-gray-500 hover:text-teal-500'}`}>
                                                    <i className="fas fa-heart mr-1"></i> 87
                                                </button>
                                                <button className="text-green-500 text-sm flex items-center hover:opacity-80">
                                                    <i className="fas fa-check mr-1"></i> Approve
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Deleted Blogs Section */}
                        {activeSection === 'deleted' && (
                            <div>
                                <h1 className={`text-2xl font-bold mb-6 pb-2 border-b-2 border-teal-500 inline-block ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    Deleted Blogs
                                </h1>

                                <div className="space-y-6">
                                    {/* Deleted Blog 1 */}
                                    <div className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-5 items-center pb-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                                        <div
                                            className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80')" }}
                                        ></div>
                                        <div>
                                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Space Exploration Technologies</h3>
                                            <div className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                <span>Deleted on: May 5, 2025</span>
                                            </div>
                                            <div className="mt-3">
                                                <button className="text-teal-500 text-sm flex items-center hover:text-teal-600">
                                                    <i className="fas fa-undo mr-1"></i> Restore
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Deleted Blog 2 */}
                                    <div className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-5 items-center pb-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                                        <div
                                            className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80')" }}
                                        ></div>
                                        <div>
                                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Advances in Synthetic Biology</h3>
                                            <div className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                <span>Deleted on: April 22, 2025</span>
                                            </div>
                                            <div className="mt-3">
                                                <button className="text-teal-500 text-sm flex items-center hover:text-teal-600">
                                                    <i className="fas fa-undo mr-1"></i> Restore
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reports Section */}
                        {activeSection === 'reports' && (
                            <div>
                                <h1 className={`text-2xl font-bold mb-6 pb-2 border-b-2 border-teal-500 inline-block ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    Reports
                                </h1>

                                <div className="mb-5 flex justify-between items-center">
                                    <div>
                                        <select
                                            className={`border rounded px-3 py-2 w-48 inline-block ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                                            id="report-filter"
                                            value={reportFilter}
                                            onChange={(e) => setReportFilter(e.target.value)}
                                        >
                                            <option value="all">All Reports</option>
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                    <button
                                        id="refresh-reports-btn"
                                        className="bg-teal-500 text-white border-none px-5 py-2 rounded cursor-pointer text-base transition-all duration-300 hover:bg-teal-600 m-0"
                                        onClick={() => setReports(JSON.parse(localStorage.getItem('blogReports')) || [])}
                                    >
                                        <i className="fas fa-sync-alt mr-1"></i> Refresh
                                    </button>
                                </div>

                                {/* Reports List */}
                                <div className="space-y-6" id="reports-list">
                                    {filteredReports.length === 0 ? (
                                        <div className={`text-center py-10 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <i className="fas fa-flag text-3xl mb-4"></i>
                                            <p>No {reportFilter === 'all' ? '' : reportFilter} reports found</p>
                                        </div>
                                    ) : (
                                        filteredReports.map((report, index) => (
                                            <div key={index} className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-5 items-center pb-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                                                <div
                                                    className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                                    style={{ backgroundImage: `url('${report.blogImage}')` }}
                                                ></div>
                                                <div>
                                                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                        {report.blogTitle}
                                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ml-2 ${report.status === 'pending' ? 'bg-yellow-50 text-yellow-500' :
                                                            report.status === 'approved' ? 'bg-green-50 text-green-500' :
                                                                'bg-red-50 text-red-500'
                                                            }`}>
                                                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                                        </span>
                                                    </h3>
                                                    <div className={`text-sm mt-2 space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        <div>Reported on: {report.date}</div>
                                                        <div>Reason: {report.reason}</div>
                                                    </div>
                                                    {report.details && (
                                                        <p className={`my-2 text-sm ${darkMode ? 'text-gray-300' : ''}`}>
                                                            "{report.details}"
                                                        </p>
                                                    )}
                                                    <div className="reporter-info flex items-center mt-2">
                                                        <div className="flex items-center">
                                                            {report.reporter.avatar && (
                                                                <img src={report.reporter.avatar} alt="Reporter" className="w-7 h-7 rounded-full mr-2 object-cover" />
                                                            )}
                                                            <span className="text-teal-500 font-medium text-sm">Reported by: {report.reporter.name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-4 mt-3">
                                                        {report.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    className="text-green-500 text-sm flex items-center hover:opacity-80"
                                                                    onClick={() => updateReportStatus(index, 'approved')}
                                                                >
                                                                    <i className="fas fa-check mr-1"></i> Approve Report
                                                                </button>
                                                                <button
                                                                    className="text-red-500 text-sm flex items-center hover:opacity-80"
                                                                    onClick={() => updateReportStatus(index, 'rejected')}
                                                                >
                                                                    <i className="fas fa-times mr-1"></i> Reject Report
                                                                </button>
                                                            </>
                                                        )}
                                                        {report.status === 'approved' && (
                                                            <button
                                                                className="text-red-500 text-sm flex items-center hover:opacity-80"
                                                                onClick={() => updateReportStatus(index, 'rejected')}
                                                            >
                                                                <i className="fas fa-trash mr-1"></i> Delete Blog
                                                            </button>
                                                        )}
                                                        {report.status === 'rejected' && (
                                                            <button className={`text-sm flex items-center ${darkMode ? 'text-gray-400 hover:text-teal-500' : 'text-gray-500 hover:text-teal-500'}`}>
                                                                <i className="fas fa-eye mr-1"></i> View Blog
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
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