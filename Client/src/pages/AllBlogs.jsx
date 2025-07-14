import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SearchForm from '../components/SearchForm';
import { useTheme } from '../context/ThemeContext.jsx';

const AllBlogs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const showAllArticles = location.state?.showAllArticles || false;
  const { darkMode, primaryColor, shadeColor } = useTheme();
  
  const [currentView, setCurrentView] = useState(showAllArticles ? 'community' : 'recommendations');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeScienceFilter, setActiveScienceFilter] = useState('all');



  // Generate color variants
  const primaryDark = shadeColor(primaryColor, -20);
  const primaryLight = shadeColor(primaryColor, 20);

  // Dynamic style variables for theme colors
  const themeStyles = {
    '--primary-color': primaryColor,
    '--primary-dark': primaryDark,
    '--primary-light': primaryLight,
  };

  // Handle view toggle
  const handleSeeAllArticles = () => {
    navigate('/all-blogs', { 
      state: { showAllArticles: !showAllArticles },
      replace: true
    });
  };

  // Community blog posts data
  const communityPosts = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      category: 'physics',
      title: '$20 million gift supports theoretical physics research and education at MIT',
      excerpt: 'Gift from the Leinweber Foundation, in addition to a $5 million commitment from the School of Science, will drive discovery, collaboration, and the next generation of physics leaders.',
      date: 'May 15, 2025',
      readTime: '5 min read'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      category: 'operations',
      title: 'New study reveals breakthroughs in quantum computing operations',
      excerpt: 'Researchers have discovered more efficient methods for quantum error correction, potentially accelerating the timeline for practical quantum computing applications.',
      date: 'June 2, 2025',
      readTime: '7 min read'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      category: 'medical',
      title: 'Revolutionary cancer treatment shows 90% success rate in phase 2 trials',
      excerpt: 'The new immunotherapy approach combines genetic engineering with targeted drug delivery to attack tumors while sparing healthy cells.',
      date: 'June 10, 2025',
      readTime: '6 min read'
    }
  ];

  // Recommendation posts data
  const recommendationPosts = [
    {
      id: 1,
      category: 'computer-science',
      title: 'Advanced Quantum Algorithms for Optimization Problems',
      excerpt: 'New approaches leveraging quantum properties to solve NP-hard problems with unprecedented efficiency, potentially revolutionizing logistics and scheduling systems.',
      author: 'Prof. Michael Chen',
      authorImage: 'https://randomuser.me/api/portraits/men/32.jpg',
      date: 'Jun 15, 2025',
      readTime: '8 min read'
    },
    {
      id: 2,
      category: 'biotech',
      title: 'CRISPR 3.0: Next Generation Gene Editing with Improved Precision',
      excerpt: 'Breakthrough modifications to the CRISPR-Cas9 system reduce off-target effects by 99% while maintaining editing efficiency.',
      author: 'Dr. Sarah Johnson',
      authorImage: 'https://randomuser.me/api/portraits/women/44.jpg',
      date: 'Jun 8, 2025',
      readTime: '10 min read'
    },
    {
      id: 3,
      category: 'physics',
      title: 'Experimental Verification of Hawking Radiation in Analog Black Holes',
      excerpt: 'Researchers using Bose-Einstein condensates provide the most compelling evidence yet for the existence of Hawking radiation.',
      author: 'Dr. Raj Patel',
      authorImage: 'https://randomuser.me/api/portraits/men/68.jpg',
      date: 'Jun 5, 2025',
      readTime: '12 min read'
    }
  ];

  // Job opportunities data
  const jobOpportunities = [
    {
      id: 1,
      title: 'Senior Frontend Developer (React)',
      company: 'LinkedIn',
      location: 'Remote',
      type: 'Full-time',
      recommender: 'Mahbuba Afrin Meghla',
      recommenderTitle: 'CS Department Chair'
    },
    {
      id: 2,
      title: 'Machine Learning Research Scientist',
      company: 'DeepMind',
      location: 'London, UK',
      type: 'Full-time',
      recommender: 'Dr. Alan Turing',
      recommenderTitle: 'AI Research Lead'
    }
  ];

  // Top contributors data
  const topContributors = [
    {
      id: 1,
      name: 'Ramisa Anan Rahman',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      blogs: '15 research blogs'
    },
    {
      id: 2,
      name: 'Alex Johnson',
      image: 'https://randomuser.me/api/portraits/men/22.jpg',
      blogs: '12 research blogs'
    },
    {
      id: 3,
      name: 'Maria Garcia',
      image: 'https://randomuser.me/api/portraits/women/33.jpg',
      blogs: '9 research blogs'
    }
  ];

  // Filtered posts based on active filters
  const filteredCommunityPosts = activeCategory === 'all' 
    ? communityPosts 
    : communityPosts.filter(post => post.category === activeCategory);

  const filteredRecommendationPosts = activeScienceFilter === 'all' 
    ? recommendationPosts 
    : recommendationPosts.filter(post => post.category === activeScienceFilter);

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}
      style={themeStyles}
    >
      <Navbar activePage="all-blogs" />
      
      <main className="container mx-auto px-4 md:px-20 py-20 pt-28">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">
                {showAllArticles ? 'Community Updates' : 'Recommended Research'}
              </h1>
              {showAllArticles && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentView('community')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      currentView === 'community' 
                        ? 'text-white' 
                        : 'hover:bg-[var(--card-bg)]'
                    }`}
                    style={{
                      backgroundColor: currentView === 'community' ? 'var(--primary-color)' : 'transparent'
                    }}
                  >
                    Community
                  </button>
                  <button
                    onClick={() => setCurrentView('recommendations')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      currentView === 'recommendations' 
                        ? 'text-white' 
                        : 'hover:bg-[var(--card-bg)]'
                    }`}
                    style={{
                      backgroundColor: currentView === 'recommendations' ? 'var(--primary-color)' : 'transparent'
                    }}
                  >
                    Recommendations
                  </button>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search" style={{ color: 'var(--muted-text)' }}></i>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)',
                  '--tw-ring-color': 'var(--primary-color)'
                }}
                placeholder={showAllArticles ? "Search updates..." : "Search research..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
            {showAllArticles ? (
              <div className="flex flex-wrap gap-2 mb-6">
                {['all', 'physics', 'operations', 'scholarships', 'social-impact', 'medical', 'open-access'].map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      activeCategory === category 
                        ? 'text-white' 
                        : 'hover:bg-[var(--card-bg)]'
                    }`}
                    style={{
                      backgroundColor: activeCategory === category ? 'var(--primary-color)' : 'transparent'
                    }}
                  >
                    {category === 'all' ? 'All' : category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mb-6">
                {['all', 'computer-science', 'physics', 'biotech', 'engineering', 'mathematics', 'data-science'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveScienceFilter(filter)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      activeScienceFilter === filter 
                        ? 'text-white' 
                        : 'hover:bg-[var(--card-bg)]'
                    }`}
                    style={{
                      backgroundColor: activeScienceFilter === filter ? 'var(--primary-color)' : 'transparent'
                    }}
                  >
                    {filter === 'all' ? 'All' : filter.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            )}

            {/* Content Display */}
            {showAllArticles ? (
              <div className="space-y-8 mb-8">
                {filteredCommunityPosts
                  .filter(post => 
                    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(post => (
                    <Link to="/inside-blog" key={post.id} className="block">
                      <div 
                        className="flex flex-col md:flex-row gap-6 pb-6 border-b transition-colors"
                        style={{ borderColor: 'var(--border-color)' }}
                      >
                        <div 
                          className="w-full md:w-48 h-40 rounded-lg bg-cover bg-center"
                          style={{ 
                            backgroundImage: `url(${post.image})`,
                            backgroundColor: 'var(--card-bg)'
                          }}
                        ></div>
                        <div className="flex-1">
                          <span 
                            className="inline-block text-xs font-semibold uppercase tracking-wider mb-2"
                            style={{ color: 'var(--primary-color)' }}
                          >
                            {post.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                          <h3 
                            className="text-xl font-bold mb-2 hover:text-[var(--primary-color)] transition-colors"
                          >
                            {post.title}
                          </h3>
                          <p className="mb-4" style={{ color: 'var(--muted-text)' }}>{post.excerpt}</p>
                          <div className="flex justify-between text-sm" style={{ color: 'var(--muted-text)' }}>
                            <span>{post.date}</span>
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            ) : (
              <div className="space-y-6 mb-8">
                {filteredRecommendationPosts
                  .filter(post => 
                    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(post => (
                    <div 
                      key={post.id} 
                      className="pb-6 border-b transition-colors"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <span 
                        className="inline-block text-xs font-semibold uppercase tracking-wider mb-1"
                        style={{ color: 'var(--primary-color)' }}
                      >
                        {post.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                      <Link to="/inside-blog" className="block">
                        <h3 className="text-lg font-semibold mb-2 hover:text-[var(--primary-color)] transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-sm mb-4" style={{ color: 'var(--muted-text)' }}>{post.excerpt}</p>
                      <div className="flex items-center text-xs" style={{ color: 'var(--muted-text)' }}>
                        <div className="flex items-center mr-4">
                          <img 
                            src={post.authorImage} 
                            alt={post.author} 
                            className="w-5 h-5 rounded-full mr-2"
                          />
                          <Link 
                            to="/other-dashboard" 
                            className="hover:text-[var(--primary-color)] transition-colors"
                          >
                            {post.author}
                          </Link>
                        </div>
                        <span className="mr-4">{post.date}</span>
                        <span className="ml-auto">{post.readTime}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center gap-1">
              <button 
                className="w-10 h-10 flex items-center justify-center rounded hover:bg-[var(--card-bg)] transition-colors"
                style={{ color: 'var(--text-color)' }}
              >
                <i className="fas fa-chevron-left text-sm"></i>
              </button>
              <button 
                className="w-10 h-10 flex items-center justify-center rounded text-white"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                1
              </button>
              {[2, 3, 4].map(page => (
                <button 
                  key={page}
                  className="w-10 h-10 flex items-center justify-center rounded hover:bg-[var(--card-bg)] transition-colors"
                  style={{ color: 'var(--text-color)' }}
                >
                  {page}
                </button>
              ))}
              <span className="w-10 h-10 flex items-center justify-center" style={{ color: 'var(--muted-text)' }}>...</span>
              <button 
                className="w-10 h-10 flex items-center justify-center rounded hover:bg-[var(--card-bg)] transition-colors"
                style={{ color: 'var(--text-color)' }}
              >
                10
              </button>
              <button 
                className="w-10 h-10 flex items-center justify-center rounded hover:bg-[var(--card-bg)] transition-colors"
                style={{ color: 'var(--text-color)' }}
              >
                <i className="fas fa-chevron-right text-sm"></i>
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Job Recommendations */}
            <div 
              className="p-4 rounded-lg border-l-4 transition-colors"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--primary-color)'
              }}
            >
              <h3 
                className="text-lg font-semibold mb-4 flex items-center"
                style={{ color: 'var(--primary-color)' }}
              >
                <i className="fas fa-briefcase mr-2"></i>
                Career Opportunities
              </h3>
              <ul className="space-y-4">
                {jobOpportunities.map(job => (
                  <li 
                    key={job.id} 
                    className="pb-4 border-b last:border-0 transition-colors"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <Link 
                      to="/inside-blog" 
                      className="block font-medium mb-1 hover:text-[var(--primary-color)] transition-colors"
                    >
                      {job.title}
                    </Link>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-2" style={{ color: 'var(--muted-text)' }}>
                      <span className="font-medium">{job.company}</span>
                      <span className="flex items-center">
                        <i className="fas fa-map-marker-alt text-xs mr-1"></i>
                        {job.location}
                      </span>
                      <span>{job.type}</span>
                    </div>
                    <div className="text-xs" style={{ color: 'var(--muted-text)' }}>
                      <span>Recommended by: </span>
                      <Link 
                        to="/other-dashboard" 
                        className="hover:underline font-medium"
                        style={{ color: 'var(--primary-color)' }}
                      >
                        {job.recommender}
                      </Link>
                      <span> ({job.recommenderTitle})</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="text-center mt-4">
                <button 
                  onClick={handleSeeAllArticles}
                  className="font-semibold hover:underline transition-colors"
                  style={{ color: 'var(--primary-color)' }}
                >
                  {showAllArticles ? 'Back to Recommendations' : 'See All Articles'}
                  <i className={`fas fa-chevron-${showAllArticles ? 'left' : 'right'} ml-1`}></i>
                </button>
              </div>
            </div>

            {/* More Articles (shown in recommendations view) */}
            {!showAllArticles && (
              <div 
                className="p-4 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--card-bg)' }}
              >
                <h3 
                  className="text-lg font-semibold mb-4 pb-2 border-b transition-colors"
                  style={{ 
                    color: 'var(--primary-color)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  More Articles
                </h3>
                <div className="space-y-4">
                  {communityPosts.slice(0, 4).map(post => (
                    <Link to="/inside-blog" key={post.id} className="flex gap-3">
                      <div 
                        className="w-16 h-16 rounded flex-shrink-0 bg-cover bg-center"
                        style={{ 
                          backgroundImage: `url(${post.image})`,
                          backgroundColor: 'var(--card-bg)'
                        }}
                      ></div>
                      <div>
                        <span 
                          className="block text-xs font-semibold uppercase tracking-wider mb-1"
                          style={{ color: 'var(--primary-color)' }}
                        >
                          {post.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                        <h4 className="text-sm font-medium hover:text-[var(--primary-color)] transition-colors">
                          {post.title}
                        </h4>
                        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--muted-text)' }}>
                          <span>{post.date}</span>
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <button 
                    onClick={handleSeeAllArticles}
                    className="font-semibold hover:underline transition-colors"
                    style={{ color: 'var(--primary-color)' }}
                  >
                    See All Articles <i className="fas fa-chevron-right ml-1"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Top Contributors */}
            <div 
              className="p-4 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              <h3 
                className="text-lg font-semibold mb-4 pb-2 border-b transition-colors"
                style={{ 
                  color: 'var(--primary-color)',
                  borderColor: 'var(--border-color)'
                }}
              >
                Top Contributors
              </h3>
              <ul className="space-y-3">
                {topContributors.map(contributor => (
                  <li 
                    key={contributor.id} 
                    className="pb-3 border-b last:border-0 transition-colors"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <Link to="/other-dashboard" className="flex items-center gap-3">
                      <img 
                        src={contributor.image} 
                        alt={contributor.name} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-medium hover:text-[var(--primary-color)] transition-colors">
                          {contributor.name}
                        </h4>
                        <p className="text-xs" style={{ color: 'var(--primary-color)' }}>
                          {contributor.blogs}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="text-center mt-4">
                <Link 
                  to="/top-contributors" 
                  className="font-semibold hover:underline transition-colors"
                  style={{ color: 'var(--primary-color)' }}
                >
                  See All Contributors <i className="fas fa-chevron-right ml-1"></i>
                </Link>
              </div>
            </div>

            {/* Search Users */}
            <div className="lg:w-80 space-y-8">
              <SearchForm />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AllBlogs;