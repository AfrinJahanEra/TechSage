import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext';
import userImage from '../assets/user.jpg'

const Navbar = ({ activePage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { primaryColor, darkMode } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'moderator') return '/moderator';
    return '/dashboard';
  };

  const getDashboardText = () => {
    if (user?.role === 'admin') return 'Admin Dashboard';
    if (user?.role === 'moderator') return 'Moderator Dashboard';
    return 'Dashboard';
  };

  // Navbar background style
  const navbarStyle = {
    backgroundColor: isScrolled ? primaryColor : `${primaryColor}cc`, // cc adds 80% opacity
  };

  // Mobile menu background style
  const mobileMenuStyle = {
    backgroundColor: darkMode ? '#1a1a1a' : primaryColor,
  };

  // Login button style
  const loginButtonStyle = {
    color: primaryColor,
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'h-16 shadow-md' : 'h-20 shadow-lg'}`}
      style={navbarStyle}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8 h-full flex justify-between items-center">
        <Link
          to={user ? "/home" : "/"}
          className="text-white font-bold text-2xl md:text-3xl font-orbitron tracking-wider"
        >
          <span className="text-white">Tech</span>Sage
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              {user.role === 'user' && (
                <Link
                  to="/home"
                  className={`text-white text-lg font-medium hover:underline ${activePage === 'home' ? 'font-bold' : ''}`}
                >
                  Home
                </Link>
              )}

              {user.role === 'user' && (
                <Link
                  to="/create-blog"
                  className={`text-white text-lg font-medium hover:underline ${activePage === 'create-blog' ? 'font-bold' : ''}`}
                >
                  Create Blog
                </Link>
              )}

              <Link
                to={getDashboardLink()}
                className={`text-white text-lg font-medium hover:underline ${activePage === 'dashboard' ? 'font-bold' : ''}`}
              >
                {getDashboardText()}
              </Link>

              <div className="relative group">
                <Link
                  to="/settings"
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold overflow-hidden border-2 border-white hover:scale-105 transition-transform"
                  style={{ color: primaryColor }}
                >
                  <img
                    src={user?.avatar_url || userImage}  // Fallback to imported image if avatar_url is missing
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                className="text-white text-lg font-medium hover:underline"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                style={loginButtonStyle}
              >
                Login
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <div
        className={`md:hidden fixed top-20 left-0 w-full transition-all duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} pt-4 pb-8 shadow-lg`}
        style={mobileMenuStyle}
      >
        <div className="flex flex-col items-center space-y-4 text-white">
          {user ? (
            <>
              {user.role === 'user' && (
                <Link
                  to="/home"
                  className="text-white text-lg font-medium hover:underline"
                  onClick={toggleMenu}
                >
                  Home
                </Link>
              )}
              {user.role === 'user' && (
                <Link
                  to="/create-blog"
                  className="text-white text-lg font-medium hover:underline"
                  onClick={toggleMenu}
                >
                  Create Blog
                </Link>
              )}
              <Link
                to={getDashboardLink()}
                className="text-white text-lg font-medium hover:underline"
                onClick={toggleMenu}
              >
                {getDashboardText()}
              </Link>
              <Link
                to="/settings"
                className="text-white text-lg font-medium hover:underline"
                onClick={toggleMenu}
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  logout();
                  toggleMenu();
                }}
                className="text-white text-lg font-medium hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                className="text-white text-lg font-medium hover:underline"
                onClick={toggleMenu}
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="text-white text-lg font-medium hover:underline"
                onClick={toggleMenu}
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;