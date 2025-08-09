import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SearchForm from '../components/SearchForm';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, calculateReadTime, getThumbnailUrl, normalizeBlog, getContentPreview } from '../utils/blogUtils.js';
import Sidebar from '../components/Sidebar.jsx';
import TopContributor from '../components/TopContributor.jsx';
import { PER_PAGE, AVAILABLE_CATEGORIES } from '../constants.js';

const AllBlogs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, primaryColor, shadeColor } = useTheme();
  const { api } = useAuth();

  const [currentView, setCurrentView] = useState(location.state?.currentView || 'community');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [communityPosts, setCommunityPosts] = useState([]);
  const [recommendationPosts, setRecommendationPosts] = useState([]);
  const [jobOpportunities, setJobOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    per_page: PER_PAGE,
    has_next: false,
    has_previous: false,
  });

  const primaryDark = shadeColor(primaryColor, -20);
  const primaryLight = shadeColor(primaryColor, 20);

  const themeStyles = {
    '--primary-color': primaryColor,
    '--primary-dark': primaryDark,
    '--primary-light': primaryLight,
  };

  const fetchBlogs = async (view, page = 1, query = '', category = 'all') => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = '/published-blogs/';
      let params = { page, per_page: PER_PAGE };

      if (query) {
        endpoint = '/published-blogs/search/';
        params.q = query;
      } else if (category !== 'all') {
        params.category = category;
      }

      if (view === 'recommendations') {
        params.category = category !== 'all' ? category : 'Job'; // Keep "Job" for recommendations
      }

      const response = await api.get(endpoint, { params });
      const data = response.data;

      if (view === 'community') {
        setCommunityPosts(data.blogs?.map(normalizeBlog) || []);
      } else {
        setRecommendationPosts(data.blogs?.map(normalizeBlog) || []);
      }
      setPagination({
        current_page: data.pagination.current_page,
        total_pages: data.pagination.total_pages,
        per_page: data.pagination.per_page,
        has_next: data.pagination.has_next,
        has_previous: data.pagination.has_previous,
      });

      // Fetch job opportunities only if not already loaded
      if (jobOpportunities.length === 0) {
        const jobResponse = await api.get('/published-blogs/', { params: { category: 'Job', limit: 5 } });
        setJobOpportunities(jobResponse.data.blogs?.map(normalizeBlog) || []);
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError(err.response?.data?.error || 'Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(currentView, 1, searchQuery, activeCategory);
  }, [currentView, activeCategory]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBlogs(currentView, 1, searchQuery, activeCategory);
    }, searchQuery ? 500 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentView, activeCategory]);

  const handleViewToggle = (view) => {
    setCurrentView(view);
    setSearchQuery('');
    setActiveCategory('all'); // Reset to 'all', excluding 'Job' from UI
    navigate('/all-blogs', {
      state: { currentView: view },
      replace: true,
    });
  };

  const handlePageChange = (page) => {
    fetchBlogs(currentView, page, searchQuery, activeCategory);
  };

  const renderPosts = (posts) => {
    return posts.map(post => (
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
          {!post.categories?.some(cat => cat.toLowerCase() === 'job') && (
            <div
              className="w-full md:w-48 h-40 rounded-lg bg-cover bg-center"
              style={{
                backgroundImage: `url(${getThumbnailUrl(post)})`,
                backgroundColor: 'var(--card-bg)',
              }}
            ></div>
          )}
          <div className="flex-1">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--primary-color)' }}
            >
              {post.categories?.[0] || 'Uncategorized'}
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
    ));
  };

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
                    backgroundColor: currentView === 'community' ? 'var(--primary-color)' : 'transparent',
                  }}
                  aria-pressed={currentView === 'community'}
                  aria-label="View community updates"
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
                    backgroundColor: currentView === 'recommendations' ? 'var(--primary-color)' : 'transparent',
                  }}
                  aria-pressed={currentView === 'recommendations'}
                  aria-label="View recommended research"
                >
                  Recommendations
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span aria-hidden="true">
                  <i className="fas fa-search" style={{ color: 'var(--muted-text)' }}></i>
                </span>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)',
                  '--tw-ring-color': 'var(--primary-color)',
                }}
                placeholder={currentView === 'community' ? "Search updates..." : "Search research..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={currentView === 'community' ? "Search community updates" : "Search recommended research"}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['all', ...AVAILABLE_CATEGORIES].filter(category => category.toLowerCase() !== 'job').map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    activeCategory === category
                      ? 'text-white'
                      : 'hover:bg-[var(--card-bg)]'
                  }`}
                  style={{
                    backgroundColor: activeCategory === category ? 'var(--primary-color)' : 'transparent',
                  }}
                  aria-pressed={activeCategory === category}
                  aria-label={`Filter by ${category === 'all' ? 'all categories' : category}`}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>

            {/* Content Display */}
            <div className="space-y-8 mb-8">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p>{error}</p>
                  <button
                    onClick={() => fetchBlogs(currentView, pagination.current_page, searchQuery, activeCategory)}
                    className="mt-4 px-4 py-2 rounded text-white"
                    style={{ backgroundColor: 'var(--primary-color)' }}
                    aria-label="Retry loading content"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                renderPosts(currentView === 'community' ? communityPosts : recommendationPosts)
              )}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex justify-center gap-1">
                {pagination.has_previous && (
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    className="w-10 h-10 flex items-center justify-center rounded hover:bg-[var(--card-bg)] transition-colors"
                    style={{ color: 'var(--text-color)' }}
                    aria-label="Previous page"
                  >
                    <i className="fas fa-chevron-left text-sm"></i>
                  </button>
                )}
                {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
                      pagination.current_page === page ? 'text-white' : 'hover:bg-[var(--card-bg)]'
                    }`}
                    style={{
                      backgroundColor: pagination.current_page === page ? 'var(--primary-color)' : 'transparent',
                      color: 'var(--text-color)',
                    }}
                    aria-label={`Go to page ${page}`}
                    aria-current={pagination.current_page === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}
                {pagination.has_next && (
                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded hover:bg-[var(--card-bg)] transition-colors"
                    style={{ color: 'var(--text-color)' }}
                    aria-label="Next page"
                  >
                    <i className="fas fa-chevron-right text-sm"></i>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-8">
            <Sidebar />
            <TopContributor />
            <SearchForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AllBlogs;