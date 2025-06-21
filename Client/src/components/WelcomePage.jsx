// src/pages/WelcomePage.jsx
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const WelcomePage = () => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex flex-col items-center justify-center transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-teal-800 mb-6 font-orbitron">
          Welcome to <span className="text-teal-600">AcademicSage</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-10 leading-relaxed">
          A platform where students and researchers collaborate, share knowledge, and advance academic discovery together.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-teal-500 text-4xl mb-4">
              <i className="fas fa-book-open"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Explore Research</h3>
            <p className="text-gray-600">Discover thousands of academic blogs across all disciplines</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-teal-500 text-4xl mb-4">
              <i className="fas fa-users"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Join Discussions</h3>
            <p className="text-gray-600">Engage with researchers and students in academic discussions</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-teal-500 text-4xl mb-4">
              <i className="fas fa-pen-fancy"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Share Your Work</h3>
            <p className="text-gray-600">Publish your research and get feedback from the community</p>
          </div>
        </div>
        
        <Link 
          to="/home" 
          className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors shadow-lg"
        >
          Explore Now
        </Link>
      </div>
    </div>
  );
};

export default WelcomePage;