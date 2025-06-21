// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = ({ activePage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/home'); // Handle navigation here instead
  };

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

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'h-16 shadow-md' : 'h-20 shadow-lg'} bg-teal-500`}>
      <div className="container mx-auto px-4 md:px-20 h-full flex justify-between items-center">
        <Link to={user ? "/home" : "/"} className="text-white font-bold text-2xl md:text-3xl font-orbitron tracking-wider">
          <span className="text-white">Tech</span>Sage
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link to="/home" className={`text-white text-lg font-medium hover:underline ${activePage === 'home' ? 'font-bold' : ''}`}>
            Home
          </Link>

          {user ? (
            <>
              <Link to="/new-blog" className={`text-white text-lg font-medium hover:underline ${activePage === 'new-blog' ? 'font-bold' : ''}`}>
                Create Blog
              </Link>
              <Link to="/dashboard" className={`text-white text-lg font-medium hover:underline ${activePage === 'dashboard' ? 'font-bold' : ''}`}>
                Dashboard
              </Link>
              <div className="relative group">
                <Link to="/settings" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-teal-500 font-bold overflow-hidden border-2 border-white hover:scale-105 transition-transform">
                  <img src={user.avatar || "https://randomuser.me/api/portraits/women/44.jpg"} alt="Profile" className="w-full h-full object-cover" />
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link to="/signup" className="text-white text-lg font-medium hover:underline">
                Create Account
              </Link>
              <Link to="/login" className="px-4 py-2 bg-white text-teal-500 rounded-full hover:bg-gray-100 transition-colors">
                Login
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed top-20 left-0 w-full bg-teal-500 transition-all duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} pt-4 pb-8 shadow-lg`}>
        <div className="flex flex-col items-center space-y-4">
          <Link to="/home" className="text-white text-lg font-medium py-3" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>

          {user ? (
            <>
              <Link to="/new-blog" className="text-white text-lg font-medium py-3" onClick={() => setIsMenuOpen(false)}>
                Create Blog
              </Link>
              <Link to="/dashboard" className="text-white text-lg font-medium py-3" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/settings" className="text-white text-lg font-medium py-3" onClick={() => setIsMenuOpen(false)}>
                Settings
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="text-white text-lg font-medium py-3"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/signup" className="text-white text-lg font-medium py-3" onClick={() => setIsMenuOpen(false)}>
                Create Account
              </Link>
              <Link to="/login" className="text-white text-lg font-medium py-3" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav >
  );
};

export default Navbar;