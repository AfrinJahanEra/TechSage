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

const availableCategories = [
  'Technology', 'Science', 'Programming', 'AI', 'Web Development', 'Mobile', 'Job', 'Fluid Mechanics', 'Data Science'
];

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
    per_page: 10,
    has_next: false,
    has_previous: false,
  });
  const [recPage, setRecPage] = useState(1);
  const recPerPage = 10;

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

      let endpoint = view === 'community' ? '/published-blogs/' : '/jobs/';
      let params = view === 'community' ? { page, per_page: 10 } : {};

      if (view === 'community') {
        if (query) {
          endpoint = '/published-blogs/search/';
          params.q = query;
        } else if (category !== 'all') {
          params.category = category;
        }
      }

      const response = await api.get(endpoint, { params });
      const data = response.data;

      if (view === 'community') {
        setCommunityPosts(data.blogs?.map(normalizeBlog) || []);
        setPagination({
          current_page: data.pagination.current_page,
          total_pages: data.pagination.total_pages,
          per_page: data.pagination.per_page,
          has_next: data.pagination.has_next,
          has_previous: data.pagination.has_previous,
        });
      } else {
        setRecommendationPosts(data.results?.map(normalizeBlog) || []);
        setPagination({
          current_page: 1,
          total_pages: 1,
          has_next: false,
          has_previous: false,
        });
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError(err.response?.data?.error || 'Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobOpportunities = async () => {
    try {
      const response = await api.get('/jobs/', { params: { limit: 5 } });
      setJobOpportunities(response.data.results?.map(normalizeBlog) || []);
    } catch (err) {
      console.error('Error fetching job opportunities:', err);
    }
  };

  useEffect(() => {
    fetchBlogs(currentView, 1, '', activeCategory);
    fetchJobOpportunities();
  }, [currentView, activeCategory]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (currentView === 'community') {
        if (searchQuery) {
          fetchBlogs(currentView, 1, searchQuery);
        } else {
          fetchBlogs(currentView, 1, '', activeCategory);
        }
      }
      // For recommendations, search is client-side, no fetch
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentView, activeCategory]);

  const handleViewToggle = (view) => {
    setCurrentView(view);
    setSearchQuery('');
    setActiveCategory('all');
    setRecPage(1);
    navigate('/all-blogs', {
      state: { currentView: view },
      replace: true,
    });
  };

  const handlePageChange = (page) => {
    if (currentView === 'community') {
      fetchBlogs(currentView, page, searchQuery, activeCategory);
    } else {
      setRecPage(page);
    }
  };

  const renderPosts = (posts) => {
    let filteredPosts = posts;
    if (currentView === 'recommendations' && searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(lowerQuery) ||
        post.content.toLowerCase().includes(lowerQuery)
      );
    }

    let displayedPosts = filteredPosts;
    if (currentView === 'recommendations') {
      const start = (recPage - 1) * recPerPage;
      const end = start + recPerPage;
      displayedPosts = filteredPosts.slice(start, end);
    }

    return displayedPosts.map(post => (
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
          {!post.categories?.includes('Job') && (
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

  const getRecTotalPages = () => {
    const filtered = recommendationPosts.filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return Math.ceil(filtered.length / recPerPage);
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
                  '--tw-ring-color': 'var(--primary-color)',
                }}
                placeholder={currentView === 'community' ? "Search updates..." : "Search research..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters - only for community */}
            {currentView === 'community' && (
              <div className="flex flex-wrap gap-2 mb-6">
                {['all', ...availableCategories].map(category => (
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
                  >
                    {category === 'all' ? 'All' : category}
                  </button>
                ))}
              </div>
            )}

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
                  >
                    Retry
                  </button>
                </div>
              ) : (
                currentView === 'community' ? renderPosts(communityPosts) : renderPosts(recommendationPosts)
              )}
            </div>

            {/* Pagination */}
            {(currentView === 'community' || (currentView === 'recommendations' && getRecTotalPages() > 1)) && (
              <div className="flex justify-center gap-1">
                { (currentView === 'community' ? pagination.has_previous : recPage > 1) && (
                  <button
                    onClick={() => handlePageChange(currentView === 'community' ? pagination.current_page - 1 : recPage - 1)}
                    className="w-10 h-10 flex items-center justify-center rounded hover:bg-[var(--card-bg)] transition-colors"
                    style={{ color: 'var(--text-color)' }}
                  >
                    <i className="fas fa-chevron-left text-sm"></i>
                  </button>
                )}
                {Array.from({ length: currentView === 'community' ? pagination.total_pages : getRecTotalPages() }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
                      (currentView === 'community' ? pagination.current_page : recPage) === page ? 'text-white' : 'hover:bg-[var(--card-bg)]'
                    }`}
                    style={{
                      backgroundColor: (currentView === 'community' ? pagination.current_page : recPage) === page ? 'var(--primary-color)' : 'transparent',
                      color: 'var(--text-color)',
                    }}
                  >
                    {page}
                  </button>
                ))}
                { (currentView === 'community' ? pagination.has_next : recPage < getRecTotalPages()) && (
                  <button
                    onClick={() => handlePageChange(currentView === 'community' ? pagination.current_page + 1 : recPage + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded hover:bg-[var(--card-bg)] transition-colors"
                    style={{ color: 'var(--text-color)' }}
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