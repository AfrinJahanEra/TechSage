import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SearchForm from '../components/SearchForm';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, calculateReadTime, getThumbnailUrl, normalizeBlog ,getContentPreview} from '../utils/blogUtils.js';
import Sidebar from '../components/Sidebar.jsx';
import TopContributor from '../components/TopContributor.jsx';

const AllBlogs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, primaryColor, shadeColor } = useTheme();
  const { api } = useAuth();
  
  const [currentView, setCurrentView] = useState(location.state?.currentView || 'community');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeScienceFilter, setActiveScienceFilter] = useState('all');
  const [communityPosts, setCommunityPosts] = useState([]);
  const [recommendationPosts, setRecommendationPosts] = useState([]);
  const [jobOpportunities, setJobOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const primaryDark = shadeColor(primaryColor, -20);
  const primaryLight = shadeColor(primaryColor, 20);


  const themeStyles = {
    '--primary-color': primaryColor,
    '--primary-dark': primaryDark,
    '--primary-light': primaryLight,
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);


        const communityResponse = await api.get('/published-blogs/');
        console.log('Community Posts Response:', communityResponse.data); // Debug log
        setCommunityPosts(communityResponse.data.blogs?.map(normalizeBlog) || []);


        const recommendationResponse = await api.get('/jobs/');
        console.log('Recommendation Posts Response:', recommendationResponse.data); // Debug log
        setRecommendationPosts(recommendationResponse.data.blogs?.map(normalizeBlog) || []);


        const jobsResponse = await api.get('/jobs/?limit=5');
        console.log('Jobs Response:', jobsResponse.data); // Debug log
        setJobOpportunities(jobsResponse.data.blogs?.map(normalizeBlog) || []);


        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load content. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [api]);


  const handleViewToggle = (view) => {
    setCurrentView(view);
    navigate('/all-blogs', { 
      state: { currentView: view },
      replace: true
    });
  };


  const filteredCommunityPosts = activeCategory === 'all' 
    ? communityPosts 
    : communityPosts.filter(post => post.categories?.includes(activeCategory));

  const filteredRecommendationPosts = activeScienceFilter === 'all' 
    ? recommendationPosts 
    : recommendationPosts.filter(post => post.categories?.includes(activeScienceFilter));

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

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
                {currentView === 'community' ? 'Community Updates' : 'Recommended Research'}
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewToggle('community')}
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
                  onClick={() => handleViewToggle('recommendations')}
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
                placeholder={currentView === 'community' ? "Search updates..." : "Search research..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
            {currentView === 'community' ? (
              <div className="flex flex-wrap gap-2 mb-6">
                {['all', 'physics', 'operations', 'scholarships', 'social-impact', 'medical', 'open-access', 'jobs'].map(category => (
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
            {currentView === 'community' ? (
              <div className="space-y-8 mb-8">
                {filteredCommunityPosts
                  .filter(post => 
                    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (getContentPreview(post.content) || '').toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(post => (
                    <Link 
                      to={`/inside-blog/${post.id}`} 
                      key={post.id} 
                      className="block"
                      state={{ blog: post }}
                    >
                      <div 
                        className="flex flex-col md:flex-row gap-6 pb-6 border-b transition-colors"
                        style={{ borderColor: 'var(--border-color)' }}
                      >
                        {post.categories?.includes('jobs') ? null : (
                          <div 
                            className="w-full md:w-48 h-40 rounded-lg bg-cover bg-center"
                            style={{ 
                              backgroundImage: `url(${getThumbnailUrl(post)})`,
                              backgroundColor: 'var(--card-bg)'
                            }}
                          ></div>
                        )}
                        <div className="flex-1">
                          <span 
                            className="inline-block text-xs font-semibold uppercase tracking-wider mb-2"
                            style={{ color: 'var(--primary-color)' }}
                          >
                            {post.categories?.[0]?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Uncategorized'}
                          </span>
                          <h3 
                            className="text-xl font-bold mb-2 hover:text-[var(--primary-color)] transition-colors"
                          >
                            {post.title}
                          </h3>
                          <p className="mb-4" style={{ color: 'var(--muted-text)' }}>
                            {(getContentPreview(post.content) || 'No content available').substring(0, 150)}...
                          </p>
                          <div className="flex justify-between text-sm" style={{ color: 'var(--muted-text)' }}>
                            <span>{formatDate(post.published_at)}</span>
                            <span>{calculateReadTime(post.content)}</span>
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
                    (post.content || '').toLowerCase().includes(searchQuery.toLowerCase())
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
                        {post.categories?.[0]?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Uncategorized'}
                      </span>
                      <Link 
                        to={`/inside-blog/${post.id}`} 
                        className="block"
                        state={{ blog: post }}
                      >
                        <h3 className="text-lg font-semibold mb-2 hover:text-[var(--primary-color)] transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-sm mb-4" style={{ color: 'var(--muted-text)' }}>
                        {(post.content || 'No content available').substring(0, 150)}...
                      </p>
                      <div className="flex items-center text-xs" style={{ color: 'var(--muted-text)' }}>
                        <div className="flex items-center mr-4">
                          <img 
                            src={post.authors?.[0]?.avatar_url || 'https://randomuser.me/api/portraits/men/32.jpg'} 
                            alt={post.authors?.[0]?.username || 'Author'} 
                            className="w-5 h-5 rounded-full mr-2"
                          />
                          <Link 
                            to={`/user/${post.authors?.[0]?.username}`} 
                            className="hover:text-[var(--primary-color)] transition-colors"
                          >
                            {post.authors?.[0]?.username || 'Unknown'}
                          </Link>
                        </div>
                        <span className="mr-4">{formatDate(post.published_at)}</span>
                        <span className="ml-auto">{calculateReadTime(post.content)}</span>
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
          <div className="lg:w-80 space-y-8">
            <Sidebar />
            <TopContributor/>
            <SearchForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AllBlogs;