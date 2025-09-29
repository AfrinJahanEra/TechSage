// src/pages/WelcomePage.jsx
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';


const WelcomePage = () => {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      {/* Background with university image overlay */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gray-900/50"></div>
        <img 
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
          alt="University campus"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 text-center">
        {/* Logo/header area */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Welcome to <span className="text-[#4fd1c5]">TechSage</span>
          </h1>
          <div className="w-24 h-1 bg-[#4fd1c5] mx-auto my-6"></div>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            The premier platform for academic collaboration, where students and researchers connect to advance knowledge.
          </p>
        </div>

        {/* Feature highlights without cards */}
        <div className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-12 text-white">
          <div className="space-y-4">
            <div className="text-[#4fd1c5] text-4xl mb-3">
              <i className="fas fa-microscope"></i>
            </div>
            <h3 className="text-xl font-semibold">Cutting-edge Research</h3>
            <p className="text-white/80">Access the latest academic discoveries across all disciplines</p>
          </div>

          <div className="space-y-4">
            <div className="text-[#4fd1c5] text-4xl mb-3">
              <i className="fas fa-user-graduate"></i>
            </div>
            <h3 className="text-xl font-semibold">Global Network</h3>
            <p className="text-white/80">Connect with students and researchers worldwide</p>
          </div>

          <div className="space-y-4">
            <div className="text-[#4fd1c5] text-4xl mb-3">
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <h3 className="text-xl font-semibold">Knowledge Sharing</h3>
            <p className="text-white/80">Publish your work and receive expert feedback</p>
          </div>
        </div>

        {/* Student collaboration image */}
        
        {/* CTA button */}
        <Link 
          to="/home" 
          className="inline-block bg-[#4fd1c5] hover:bg-[#38b2ac] text-gray-900 font-bold py-3 px-10 rounded-full text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Begin Your Journey
        </Link>
      </div>
    </div>
  );
};


export default WelcomePage;