import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('edit-profile');
  const [darkMode, setDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#1abc9c');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 's.johnson@mit.edu',
    university: 'Massachusetts Institute of Technology',
    title: 'Professor of Quantum Physics',
    bio: 'Professor of Quantum Physics at MIT. My research focuses on quantum error correction and quantum algorithms. Currently working on topological quantum computing approaches.',
    website: 'https://quantum.mit.edu/sjohnson'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    publicProfile: true,
    showEmail: false,
    twoFactorAuth: false
  });

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.body.classList.toggle('dark-mode', newDarkMode);
    localStorage.setItem('darkMode', newDarkMode ? 'enabled' : 'disabled');
  };

  // Handle theme color change
  const changeThemeColor = (color) => {
    setPrimaryColor(color);
    document.documentElement.style.setProperty('--primary-color', color);
    document.documentElement.style.setProperty('--primary-dark', shadeColor(color, -20));
    localStorage.setItem('themeColor', color);
  };

  // Helper function to darken a color
  const shadeColor = (color, percent) => {
    let R = parseInt(color.substring(1,3), 16);
    let G = parseInt(color.substring(3,5), 16);
    let B = parseInt(color.substring(5,7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    R = Math.round(R);
    G = Math.round(G);
    B = Math.round(B);

    const RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    const GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    const BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Complexity checks
    if (password.match(/[a-z]/)) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
    
    setPasswordStrength(strength);
  };

  // Handle profile form submission
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };

  // Handle password form submission
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }
    alert('Password changed successfully!');
    setPasswordModalOpen(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  // Handle logout
  const handleLogout = () => {
    // In a real app, you would clear authentication state
    alert('You have been logged out successfully!');
    // Redirect to login page
    window.location.href = '/login';
  };

  // Load saved preferences on component mount
  useEffect(() => {
    // Dark mode
    const savedDarkMode = localStorage.getItem('darkMode') === 'enabled';
    setDarkMode(savedDarkMode);
    document.body.classList.toggle('dark-mode', savedDarkMode);

    // Theme color
    const savedColor = localStorage.getItem('themeColor') || '#1abc9c';
    setPrimaryColor(savedColor);
    document.documentElement.style.setProperty('--primary-color', savedColor);
    document.documentElement.style.setProperty('--primary-dark', shadeColor(savedColor, -20));
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar activePage="settings" />
      
      {/* Dashboard Layout */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <ul className="py-4">
            <li>
              <button
                onClick={() => setActiveSection('edit-profile')}
                className={`w-full px-6 py-3 text-left flex items-center ${activeSection === 'edit-profile' ? 'bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <i className="fas fa-user-edit mr-3"></i>
                Edit Profile
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('collaboration-request')}
                className={`w-full px-6 py-3 text-left flex items-center ${activeSection === 'collaboration-request' ? 'bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <i className="fas fa-handshake mr-3"></i>
                Collaboration
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('settings')}
                className={`w-full px-6 py-3 text-left flex items-center ${activeSection === 'settings' ? 'bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <i className="fas fa-cog mr-3"></i>
                Settings
              </button>
            </li>
            <li>
              <button
                onClick={() => setLogoutModalOpen(true)}
                className="w-full px-6 py-3 text-left flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <i className="fas fa-sign-out-alt mr-3"></i>
                Logout
              </button>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 bg-white dark:bg-gray-900">
          {/* Edit Profile Section */}
          {activeSection === 'edit-profile' && (
            <div>
              <h1 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 dark:border-gray-700 relative">
                Edit Profile
                <span className="absolute bottom-0 left-0 w-16 h-1 bg-blue-500"></span>
              </h1>

              <form onSubmit={handleProfileSubmit} className="max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 dark:text-gray-300 cursor-not-allowed"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">University</label>
                  <input
                    type="text"
                    value={profileData.university}
                    onChange={(e) => setProfileData({...profileData, university: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Title/Position</label>
                  <input
                    type="text"
                    value={profileData.title}
                    onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  ></textarea>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">Website</label>
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setPasswordModalOpen(true)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    <i className="fas fa-lock mr-2"></i>
                    Change Password
                  </button>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Collaboration Request Section */}
          {activeSection === 'collaboration-request' && (
            <div>
              <h1 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 dark:border-gray-700 relative">
                Collaboration Requests
                <span className="absolute bottom-0 left-0 w-16 h-1 bg-blue-500"></span>
              </h1>

              <div className="space-y-4">
                {/* Request Item - Unread */}
                <div className="p-4 bg-blue-50 dark:bg-gray-800 rounded-md border-l-4 border-blue-500">
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="flex items-center mb-4 md:mb-0 md:mr-4">
                      <img 
                        src="https://randomuser.me/api/portraits/women/33.jpg" 
                        alt="Era" 
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-medium"><span className="text-blue-600 dark:text-blue-400">Era</span> sent you a request for collaboration on Quantum Computing research</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-auto">
                      <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                        Accept
                      </button>
                      <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>

                {/* Request Item - Unread */}
                <div className="p-4 bg-blue-50 dark:bg-gray-800 rounded-md border-l-4 border-blue-500">
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="flex items-center mb-4 md:mb-0 md:mr-4">
                      <img 
                        src="https://randomuser.me/api/portraits/women/45.jpg" 
                        alt="Ridika" 
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-medium"><span className="text-blue-600 dark:text-blue-400">Ridika</span> wants to collaborate on your AI Ethics paper</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-auto">
                      <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                        Accept
                      </button>
                      <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>

                {/* Request Item - Unread */}
                <div className="p-4 bg-blue-50 dark:bg-gray-800 rounded-md border-l-4 border-blue-500">
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="flex items-center mb-4 md:mb-0 md:mr-4">
                      <img 
                        src="https://randomuser.me/api/portraits/women/28.jpg" 
                        alt="Ramisa" 
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-medium"><span className="text-blue-600 dark:text-blue-400">Ramisa</span> invited you to join her research team on Neural Networks</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">3 days ago</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-auto">
                      <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                        Accept
                      </button>
                      <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>

                {/* Request Item - Read */}
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-md opacity-80">
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="flex items-center mb-4 md:mb-0 md:mr-4">
                      <img 
                        src="https://randomuser.me/api/portraits/women/22.jpg" 
                        alt="Tahmina" 
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-medium"><span className="text-blue-600 dark:text-blue-400">Tahmina</span> requested to collaborate on Data Science project</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">1 week ago</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-auto">
                      <button className="px-4 py-2 bg-green-500 text-white rounded-md opacity-50 cursor-not-allowed">
                        Accepted
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div>
              <h1 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 dark:border-gray-700 relative">
                Settings
                <span className="absolute bottom-0 left-0 w-16 h-1 bg-blue-500"></span>
              </h1>

              <div className="max-w-3xl space-y-8">
                {/* Appearance Settings */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Appearance</h3>
                  
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Dark Mode</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark theme</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={darkMode} 
                          onChange={toggleDarkMode}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                    <div className="mb-4">
                      <div className="font-medium">Theme Color</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred color scheme</div>
                    </div>
                    
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                      {/* Teal */}
                      <button
                        onClick={() => changeThemeColor('#1abc9c')}
                        className={`flex flex-col items-center p-2 rounded-md ${primaryColor === '#1abc9c' ? 'ring-2 ring-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        <div className="w-12 h-12 rounded-full bg-teal-500 mb-1"></div>
                        <span className="text-sm">Teal</span>
                      </button>
                      
                      {/* Blue */}
                      <button
                        onClick={() => changeThemeColor('#3498db')}
                        className={`flex flex-col items-center p-2 rounded-md ${primaryColor === '#3498db' ? 'ring-2 ring-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-500 mb-1"></div>
                        <span className="text-sm">Blue</span>
                      </button>
                      
                      {/* Purple */}
                      <button
                        onClick={() => changeThemeColor('#9b59b6')}
                        className={`flex flex-col items-center p-2 rounded-md ${primaryColor === '#9b59b6' ? 'ring-2 ring-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        <div className="w-12 h-12 rounded-full bg-purple-500 mb-1"></div>
                        <span className="text-sm">Purple</span>
                      </button>
                      
                      {/* Red */}
                      <button
                        onClick={() => changeThemeColor('#e74c3c')}
                        className={`flex flex-col items-center p-2 rounded-md ${primaryColor === '#e74c3c' ? 'ring-2 ring-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        <div className="w-12 h-12 rounded-full bg-red-500 mb-1"></div>
                        <span className="text-sm">Red</span>
                      </button>
                      
                      {/* Orange */}
                      <button
                        onClick={() => changeThemeColor('#e67e22')}
                        className={`flex flex-col items-center p-2 rounded-md ${primaryColor === '#e67e22' ? 'ring-2 ring-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        <div className="w-12 h-12 rounded-full bg-orange-500 mb-1"></div>
                        <span className="text-sm">Orange</span>
                      </button>
                      
                      {/* Yellow */}
                      <button
                        onClick={() => changeThemeColor('#f1c40f')}
                        className={`flex flex-col items-center p-2 rounded-md ${primaryColor === '#f1c40f' ? 'ring-2 ring-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        <div className="w-12 h-12 rounded-full bg-yellow-500 mb-1"></div>
                        <span className="text-sm">Yellow</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Notifications</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Email Notifications</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Receive email alerts for new collaborations and messages</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.emailNotifications} 
                            onChange={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Push Notifications</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Get instant notifications on your device</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.pushNotifications} 
                            onChange={() => setSettings({...settings, pushNotifications: !settings.pushNotifications})}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Privacy</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Public Profile</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Make your profile visible to all users</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.publicProfile} 
                            onChange={() => setSettings({...settings, publicProfile: !settings.publicProfile})}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Show Email</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Display your email address on your profile</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.showEmail} 
                            onChange={() => setSettings({...settings, showEmail: !settings.showEmail})}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Settings */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Account</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Two-Factor Authentication</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.twoFactorAuth} 
                            onChange={() => setSettings({...settings, twoFactorAuth: !settings.twoFactorAuth})}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Delete Account</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Permanently remove your account and all data</div>
                        </div>
                        <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Change Password</h3>
              <button 
                onClick={() => setPasswordModalOpen(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData({...passwordData, newPassword: e.target.value});
                    checkPasswordStrength(e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
                <div className="h-1 bg-gray-200 dark:bg-gray-600 mt-1 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${passwordStrength >= 6 ? 'bg-green-500' : passwordStrength >= 4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, passwordStrength * 20)}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
                  Password strength: {passwordStrength >= 6 ? 'Strong' : passwordStrength >= 4 ? 'Medium' : 'Weak'}
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md text-center">
            <div className="flex justify-end">
              <button 
                onClick={() => setLogoutModalOpen(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <h3 className="text-xl font-bold mb-4">Logout Confirmation</h3>
            <p className="mb-6">Are you sure you want to logout?</p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Settings;