// src/components/Dashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Chart } from 'chart.js/auto';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx'

const Dashboard = () => {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState('profile');
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

        // Initialize chart
        const ctx = document.getElementById('performanceChart');
        if (ctx) {
            const performanceChart = new Chart(ctx, {
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

            return () => {
                performanceChart.destroy();
            };
        }
    }, []);

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

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
            {/* Navbar */}
            
            <Navbar activePage="dashboard" />

            {/* Profile Panel */}
            {showProfilePanel && (
                <div
                    className="fixed top-20 right-5 w-80 bg-white text-gray-800 rounded-lg shadow-xl z-50 max-h-[80vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-5 border-b border-gray-200 flex items-center">
                        <img
                            src={user?.avatar || "https://randomuser.me/api/portraits/women/44.jpg"}
                            alt="Profile"
                            className="w-14 h-14 rounded-full mr-4 object-cover"
                        />
                        <div>
                            <h4 className="text-lg font-semibold">{profileData.name}</h4>
                            <p className="text-gray-600 text-sm">{profileData.profession}</p>
                        </div>
                    </div>

                    <div className="p-5">
                        {/* Profile Section */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold flex items-center">
                                    <i className="fas fa-user mr-2 text-teal-500"></i>
                                    Profile
                                </h3>
                                {!editMode && (
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            {!editMode ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="flex items-center">
                                            <i className="fas fa-user mr-2 text-teal-500"></i>
                                            Name
                                        </span>
                                        <span>{profileData.name}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="flex items-center">
                                            <i className="fas fa-envelope mr-2 text-teal-500"></i>
                                            Email
                                        </span>
                                        <span>{profileData.email}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="flex items-center">
                                            <i className="fas fa-university mr-2 text-teal-500"></i>
                                            University
                                        </span>
                                        <span>{profileData.university}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="flex items-center">
                                            <i className="fas fa-briefcase mr-2 text-teal-500"></i>
                                            Profession
                                        </span>
                                        <span>{profileData.profession}</span>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleProfileUpdate}>
                                    <div className="space-y-3">
                                        <div className="form-group">
                                            <label className="block text-sm mb-1">Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={profileData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border rounded"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="block text-sm mb-1">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={profileData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border rounded"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="block text-sm mb-1">University</label>
                                            <input
                                                type="text"
                                                name="university"
                                                value={profileData.university}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border rounded"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="block text-sm mb-1">Profession</label>
                                            <input
                                                type="text"
                                                name="profession"
                                                value={profileData.profession}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border rounded"
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-2 mt-4">
                                            <button
                                                type="button"
                                                onClick={() => setEditMode(false)}
                                                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Settings Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <i className="fas fa-cog mr-2 text-teal-500"></i>
                                Settings
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="flex items-center">
                                        <i className="fas fa-bell mr-2 text-teal-500"></i>
                                        Notifications
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notificationsEnabled}
                                            onChange={toggleNotifications}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                                    </label>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="flex items-center">
                                        <i className="fas fa-moon mr-2 text-teal-500"></i>
                                        Dark Mode
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={darkMode}
                                            onChange={toggleDarkMode}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Notifications Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <i className="fas fa-bell mr-2 text-teal-500"></i>
                                Notifications
                            </h3>
                            <div className="space-y-3">
                                <div className="py-2 border-b border-gray-100">
                                    <p className="text-sm">Your blog "Quantum Computing Breakthroughs" has 5 new comments</p>
                                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                                </div>
                                <div className="py-2 border-b border-gray-100">
                                    <p className="text-sm">Dr. Michael Chen mentioned you in a comment</p>
                                    <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                                </div>
                                <div className="py-2">
                                    <p className="text-sm">Your draft "New findings in quantum entanglement" is ready to publish</p>
                                    <p className="text-xs text-gray-500 mt-1">3 days ago</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 border-t border-gray-200 text-center">
                        <button className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white rounded">
                            <i className="fas fa-sign-out-alt mr-2"></i> Logout
                        </button>
                    </div>
                </div>
            )}

            {/* Dashboard Content */}
            <div className="pt-20 min-h-screen">
                <div className="flex flex-col md:flex-row">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 bg-white border-r border-gray-200 p-4">
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
                                    My Blogs
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection('drafts')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === 'drafts' ? 'bg-teal-50 text-teal-600 border-l-4 border-teal-500' : 'hover:bg-gray-100'}`}
                                >
                                    <i className="fas fa-file-alt mr-3 text-teal-500"></i>
                                    Draft Blogs
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActiveSection('saved')}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeSection === 'saved' ? 'bg-teal-50 text-teal-600 border-l-4 border-teal-500' : 'hover:bg-gray-100'}`}
                                >
                                    <i className="fas fa-bookmark mr-3 text-teal-500"></i>
                                    Saved Blogs
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-6">
                        {/* Profile Section */}
                        {activeSection === 'profile' && (
                            <div>
                                <h1 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-teal-500 inline-block">My Profile</h1>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* User Info Card */}
                                    <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                                        <div className="flex flex-col md:flex-row items-center mb-6">
                                            <img
                                                src={user?.avatar || "https://randomuser.me/api/portraits/women/44.jpg"}
                                                alt="Profile"
                                                className="w-20 h-20 rounded-full border-4 border-teal-500 object-cover mr-0 md:mr-6 mb-4 md:mb-0"
                                            />
                                            <div className="text-center md:text-left">
                                                <h2 className="text-xl font-bold">{profileData.name}</h2>
                                                <p className="text-gray-600 mb-2">{profileData.profession}</p>
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
                                            <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-200">About</h3>
                                            <p className="text-gray-700 mb-4">
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
                                        <div className="bg-gray-50 rounded-lg p-4 shadow-sm text-center">
                                            <div className="text-3xl font-bold text-teal-500 mb-1">24</div>
                                            <div className="text-gray-600 text-sm">Total Blogs</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 shadow-sm text-center">
                                            <div className="text-3xl font-bold text-teal-500 mb-1">1.2K</div>
                                            <div className="text-gray-600 text-sm">Followers</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 shadow-sm text-center">
                                            <div className="text-3xl font-bold text-teal-500 mb-1">4.7</div>
                                            <div className="text-gray-600 text-sm">Avg. Reading Time (min)</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 shadow-sm text-center">
                                            <div className="text-3xl font-bold text-teal-500 mb-1">78%</div>
                                            <div className="text-gray-600 text-sm">Engagement Rate</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Chart */}
                                <div className="bg-white rounded-lg p-4 shadow-sm mb-6 h-80">
                                    <canvas id="performanceChart"></canvas>
                                </div>

                                {/* Recent Blogs */}
                                <div>
                                    <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-teal-500 inline-block">Recent Blogs</h2>
                                    <div className="space-y-6">
                                        {/* Blog Card 1 */}
                                        <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b border-gray-200">
                                            <div
                                                className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80')" }}
                                            ></div>
                                            <div>
                                                <h3 className="text-lg font-semibold">Quantum Computing Breakthroughs</h3>
                                                <div className="flex justify-between text-sm text-gray-500 mt-1">
                                                    <span>May 15, 2025</span>
                                                    <span>5 min read</span>
                                                </div>
                                                <div className="flex space-x-4 mt-2">
                                                    <button className="text-gray-500 hover:text-teal-500 flex items-center text-sm">
                                                        <i className="fas fa-eye mr-1"></i> 1.2K
                                                    </button>
                                                    <button className="text-gray-500 hover:text-teal-500 flex items-center text-sm">
                                                        <i className="fas fa-heart mr-1"></i> 124
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Blog Card 2 */}
                                        <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b border-gray-200">
                                            <div
                                                className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80')" }}
                                            ></div>
                                            <div>
                                                <h3 className="text-lg font-semibold">Space Exploration Technologies</h3>
                                                <div className="flex justify-between text-sm text-gray-500 mt-1">
                                                    <span>April 28, 2025</span>
                                                    <span>7 min read</span>
                                                </div>
                                                <div className="flex space-x-4 mt-2">
                                                    <button className="text-gray-500 hover:text-teal-500 flex items-center text-sm">
                                                        <i className="fas fa-eye mr-1"></i> 890
                                                    </button>
                                                    <button className="text-gray-500 hover:text-teal-500 flex items-center text-sm">
                                                        <i className="fas fa-heart mr-1"></i> 95
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* My Blogs Section */}
                        {activeSection === 'blogs' && (
                            <div>
                                <h1 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-teal-500 inline-block">My Blogs</h1>

                                {/* Blog Filter */}
                                <div className="mb-6">
                                    <select className="border rounded px-3 py-2 w-full md:w-64">
                                        <option value="all">All Blogs</option>
                                        <option value="popular">Most Popular</option>
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                    </select>
                                </div>

                                {/* Blog List */}
                                <div className="space-y-6">
                                    {/* Blog Card 1 */}
                                    <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b border-gray-200">
                                        <div
                                            className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80')" }}
                                        ></div>
                                        <div>
                                            <h3 className="text-lg font-semibold">Quantum Computing Breakthroughs</h3>
                                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                                <span>May 15, 2025</span>
                                                <span>5 min read</span>
                                            </div>
                                            <div className="flex space-x-4 mt-2">
                                                <button className="text-gray-500 hover:text-teal-500 flex items-center text-sm">
                                                    <i className="fas fa-eye mr-1"></i> 1.2K
                                                </button>
                                                <button className="text-gray-500 hover:text-teal-500 flex items-center text-sm">
                                                    <i className="fas fa-heart mr-1"></i> 124
                                                </button>
                                                <button className="text-gray-500 hover:text-teal-500 flex items-center text-sm">
                                                    <i className="fas fa-ellipsis-v"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Blog Card 2 */}
                                    <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b border-gray-200">
                                        <div
                                            className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80')" }}
                                        ></div>
                                        <div>
                                            <h3 className="text-lg font-semibold">Space Exploration Technologies</h3>
                                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                                <span>April 28, 2025</span>
                                                <span>7 min read</span>
                                            </div>
                                            <div className="flex space-x-4 mt-2">
                                                <button className="text-gray-500 hover:text-teal-500 flex items-center text-sm">
                                                    <i className="fas fa-eye mr-1"></i> 890
                                                </button>
                                                <button className="text-gray-500 hover:text-teal-500 flex items-center text-sm">
                                                    <i className="fas fa-heart mr-1"></i> 95
                                                </button>
                                                <button className="text-gray-500 hover:text-teal-500 flex items-center text-sm">
                                                    <i className="fas fa-ellipsis-v"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Draft Blogs Section */}
                        {activeSection === 'drafts' && (
                            <div>
                                <h1 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-teal-500 inline-block">Draft Blogs</h1>

                                {/* Draft Blog 1 */}
                                <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b border-gray-200">
                                    <div
                                        className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80')" }}
                                    ></div>
                                    <div>
                                        <h3 className="text-lg font-semibold">$20 million gift supports theoretical physics research at MIT</h3>
                                        <div className="text-sm text-gray-500 mt-1">Last edited: May 14, 2025</div>
                                        <div className="flex space-x-4 mt-2">
                                            <button className="text-gray-500 hover:text-teal-500 flex items-center text-sm">
                                                <i className="fas fa-edit mr-1"></i> Edit
                                            </button>
                                            <button className="text-gray-500 hover:text-teal-500 flex items-center text-sm">
                                                <i className="fas fa-trash mr-1"></i> Delete
                                            </button>
                                            <button className="text-gray-500 hover:text-teal-500 flex items-center text-sm">
                                                <i className="fas fa-share mr-1"></i> Publish
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Draft Blog 2 */}
                                <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b border-gray-200">
                                    <div
                                        className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80')" }}
                                    ></div>
                                    <div>
                                        <h3 className="text-lg font-semibold">New findings in quantum entanglement research</h3>
                                        <div className="text-sm text-gray-500 mt-1">Last edited: May 10, 2025</div>
                                        <div className="flex space-x-4 mt-2">
                                            <button className="text-gray-500 hover:text-teal-500 flex items-center text-sm">
                                                <i className="fas fa-edit mr-1"></i> Edit
                                            </button>
                                            <button className="text-gray-500 hover:text-teal-500 flex items-center text-sm">
                                                <i className="fas fa-trash mr-1"></i> Delete
                                            </button>
                                            <button className="text-gray-500 hover:text-teal-500 flex items-center text-sm">
                                                <i className="fas fa-share mr-1"></i> Publish
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Saved Blogs Section */}
                        {activeSection === 'saved' && (
                            <div>
                                <h1 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-teal-500 inline-block">Saved Blogs</h1>

                                <div className="space-y-6">
                                    {/* Saved Blog 1 */}
                                    <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b border-gray-200">
                                        <div
                                            className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80')" }}
                                        ></div>
                                        <div>
                                            <h3 className="text-lg font-semibold">Space Exploration Technologies</h3>
                                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                                <span>By Dr. Emily Wong</span>
                                                <span>May 5, 2025</span>
                                            </div>
                                            <div className="flex space-x-4 mt-2">
                                                <button className="text-teal-500 hover:text-teal-600 flex items-center text-sm">
                                                    <i className="fas fa-bookmark mr-1"></i> Saved
                                                </button>
                                                <button className="text-gray-500 hover:text-teal-500 flex items-center text-sm">
                                                    <i className="fas fa-share-alt mr-1"></i> Share
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Saved Blog 2 */}
                                    <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b border-gray-200">
                                        <div
                                            className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80')" }}
                                        ></div>
                                        <div>
                                            <h3 className="text-lg font-semibold">AI in Healthcare: Clinical Trial Results</h3>
                                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                                <span>By Dr. Michael Chen</span>
                                                <span>April 22, 2025</span>
                                            </div>
                                            <div className="flex space-x-4 mt-2">
                                                <button className="text-teal-500 hover:text-teal-600 flex items-center text-sm">
                                                    <i className="fas fa-bookmark mr-1"></i> Saved
                                                </button>
                                                <button className="text-gray-500 hover:text-teal-500 flex items-center text-sm">
                                                    <i className="fas fa-share-alt mr-1"></i> Share
                                                </button>
                                            </div>
                                        </div>
                                    </div>
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


