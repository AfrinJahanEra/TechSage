import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Sidebar from '../components/Sidebar.jsx';
import SearchForm from '../components/SearchForm.jsx';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const [fadeInElements, setFadeInElements] = useState([]);
  const { darkMode, primaryColor, shadeColor } = useTheme();

  // Generate color variants
  const primaryDark = shadeColor(primaryColor, -20);
  const primaryLight = shadeColor(primaryColor, 20);

  // Dynamic style variables for theme colors
  const themeStyles = {
    '--primary-color': primaryColor,
    '--primary-dark': primaryDark,
    '--primary-light': primaryLight,
  };

  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.fade-in');
      const windowHeight = window.innerHeight;
      
      elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        if (elementPosition < windowHeight - 100) {
          setFadeInElements(prev => [...prev, element]);
          element.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial load
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featuredResearch = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      title: 'Quantum Computing Research'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      title: 'Renewable Energy Studies'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1576091160550-2173dbe999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      title: 'Neuroscience Discoveries'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      title: 'AI and Robotics'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      title: 'Cognitive Science'
    }
  ];

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}
      style={themeStyles}
    >
      <Navbar activePage="home" />
      
      <main className="container mx-auto px-4 md:px-20 py-10 pt-28">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <article className="flex-1">
            <header className={`border-b pb-6 mb-8 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
                Advancements in Quantum Computing: A Breakthrough in Academic Research
              </h1>
              <div className="flex flex-wrap gap-4 text-sm" style={{ color: primaryColor, borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                <span className="font-semibold"  >Computer Science</span>
                <span>Published: June 15, 2025</span>
                <span>
                  By: <a href="/other-dashboard" className="text-teal-500 hover:underline" style={{ color: primaryColor, borderColor: darkMode ? '#374151' : '#e5e7eb' }}>Dr. Tahira Jannat</a>
                </span>
              </div>
            </header>

            <div className="prose max-w-none">
              <p className={darkMode ? 'text-gray-300' : ''}>
                At AcademicHub, we are committed to showcasing groundbreaking research across all disciplines. The recent breakthroughs in quantum computing represent a significant leap forward in computational capabilities, with researchers demonstrating quantum supremacy in solving complex optimization problems.
              </p>

              <p className={darkMode ? 'text-gray-300' : ''}>
                This year's research findings, published in Nature Computational Science, detail how a team of physicists and computer scientists developed a 72-qubit quantum processor that can perform calculations in minutes that would take classical supercomputers thousands of years. The implications for fields ranging from cryptography to drug discovery are profound.
              </p>

              <blockquote className={`border-l-4 pl-5 italic my-6 ${darkMode ? 'border-teal-300 text-teal-300' : 'border-teal-500 text-teal-700'}`}>
                "What makes this breakthrough particularly exciting is its potential for real-world applications in materials science and molecular modeling," explained Professor Michael Chen, one of the lead researchers. "We're not just proving theoretical concepts—we're building tools that will transform scientific discovery."
              </blockquote>

              <div className={`p-6 rounded-lg my-8 ${darkMode ? 'bg-gray-800' : 'bg-teal-50'}`}>
                <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-teal-300' : 'text-teal-800'}`}>Key Findings from the Research</h3>
                <p className={darkMode ? 'text-gray-300' : ''}>
                  The study demonstrates error correction techniques that maintain quantum coherence for unprecedented durations, a new quantum algorithm for simulating molecular interactions, and the successful integration of classical and quantum computing architectures.
                </p>
              </div>

              <p className={darkMode ? 'text-gray-300' : ''}>
                The research team, comprising scientists from multiple universities, has made their quantum computing framework available to academic institutions worldwide. This open-source approach is expected to accelerate innovation across the field, with early adopters already reporting significant progress in their own quantum computing initiatives.
              </p>
            </div>

            <div className="mt-8">
              <a href="/inside-blog" className="text-teal-500 font-semibold hover:underline" style={{ color: primaryColor, borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
                Read Full Blog →
              </a>
            </div>
          </article>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-8" >
            <Sidebar />
            <SearchForm/>
          </div>
        </div>
      </main>

      {/* Featured Research Section */}
      <section className={`py-16 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 md:px-20">
          <h2 className={`text-3xl font-bold mb-4 relative pb-4 fade-in ${darkMode ? 'text-white' : ''}`}>
            Featured Research
            <span className="absolute bottom-0 left-0 w-16 h-1" style={{ backgroundColor: primaryColor }}></span>
          </h2>
          <p className={`text-xl mb-8 fade-in ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Explore groundbreaking academic work across disciplines
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 fade-in">
            {featuredResearch.map(research => (
              <a 
                key={research.id} 
                href="/inside-blog" 
                className="group relative rounded-lg overflow-hidden h-48"
              >
                <img 
                  src={research.image} 
                  alt={research.title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <h3 className="absolute bottom-0 left-0 w-full p-4 text-white text-lg font-semibold translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  {research.title}
                </h3>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;