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
  'Technology', 'Science', 'Programming', 'AI', 'Web Development', 'Mobile', 'Fluid Mechanics', 'Data Science'
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
  const recPerPage = 1000;

  const primaryDark = shadeColor(primaryColor, -20);
  const primaryLight = shadeColor(primaryColor, 20);

  const themeStyles = {
    '--primary-color': primaryColor,
    '--primary-dark': primaryDark,
    '--primary-light': primaryLight,
    '--text-color': darkMode ? '#f3f4f6' : '#1f2937',
    '--muted-text': darkMode ? '#9ca3af' : '#6b7280',
    '--border-color': darkMode ? '#374151' : '#e5e7eb',
    '--background-color': darkMode ? '#111827' : '#ffffff',
  };

  const fetchBlogs = async (view, page = 1, query = '', category = 'all') => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = '/published-blogs/';
      let params = { page, per_page: view === 'recommendations' ? recPerPage : 10 };

      if (view === 'recommendations') {
        params.category = 'Job';
      } else {
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
        setRecommendationPosts(data.blogs?.map(normalizeBlog) || []);
        setPagination({
          current_page: data.pagination.current_page,
          total_pages: data.pagination.total_pages,
          per_page: data.pagination.per_page,
          has_next: data.pagination.has_next,
          has_previous: data.pagination.has_previous,
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
      const response = await api.get('/published-blogs/', { params: { category: 'Job', limit: 5 } });
      setJobOpportunities(response.data.blogs?.map(normalizeBlog) || []);
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
      if (searchQuery) {
        if (currentView === 'community') {
          fetchBlogs(currentView, 1, searchQuery);
        }
      } else {
        fetchBlogs(currentView, 1, '', activeCategory);
      }
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
    if (currentView === 'recommendations') {
      setRecPage(page);
    } else {
      fetchBlogs(currentView, page, searchQuery, activeCategory);
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
      const start = (recPage - 1) * 10;
      const end = start + 10;
      displayedPosts = filteredPosts.slice(start, end);
    }

    return displayedPosts.map(post => (
      <Link
        to={`/inside-blog/${post.id}`}
        key={post.id}
        className="block group"
      >
        <div className="flex flex-col md:flex-row gap-6 py-6 border-b border-[var(--border-color)] hover:bg-[var(--primary-light)]/10 transition-all duration-200">
          {!post.categories?.some(cat => cat.toLowerCase() === 'job') && (
            <div
              className="w-full md:w-48 h-40 rounded-lg bg-cover bg-center transition-transform duration-300 group-hover:scale-[1.02]"
              style={{
                backgroundImage: `url(${getThumbnailUrl(post)})`,
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
            <h3 className="text-xl md:text-2xl font-semibold mb-2 transition-colors duration-200 group-hover:text-[var(--primary-color)]">
              {post.title}
            </h3>
            <p className="text-sm md:text-base leading-relaxed mb-4" style={{ color: 'var(--muted-text)' }}>
              {(getContentPreview(post.content) || 'No content available').substring(0, 150)}...
            </p>
            <div className="flex justify-between text-xs md:text-sm" style={{ color: 'var(--muted-text)' }}>
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
    return Math.ceil(filtered.length / 10);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[var(--background-color)] text-[var(--text-color)]' : 'bg-[var(--background-color)] text-[var(--text-color)]'}`}
      style={themeStyles}
    >
      <Navbar activePage="all-blogs" />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-24">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight">
                {currentView === 'community' ? 'Community Updates' : 'Recommended Research'}
              </h1>
              <div className="flex gap-3">
                <button
                  onClick={() => handleViewToggle('community')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentView === 'community'
                      ? 'text-white bg-[var(--primary-color)]'
                      : 'text-[var(--text-color)] hover:bg-[var(--primary-light)]/20'
                  }`}
                >
                  Community
                </button>
                <button
                  onClick={() => handleViewToggle('recommendations')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentView === 'recommendations'
                      ? 'text-white bg-[var(--primary-color)]'
                      : 'text-[var(--text-color)] hover:bg-[var(--primary-light)]/20'
                  }`}
                >
                  Recommendations
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-[var(--muted-text)]"></i>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all duration-200"
                style={{
                  backgroundColor: 'var(--background-color)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)',
                }}
                placeholder={currentView === 'community' ? 'Search updates...' : 'Search research...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters - only for community */}
            {currentView === 'community' && (
              <div className="flex flex-wrap gap-2 mb-8">
                {['all', ...availableCategories].map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeCategory === category
                        ? 'text-white bg-[var(--primary-color)]'
                        : 'text-[var(--text-color)] hover:bg-[var(--primary-light)]/20'
                    }`}
                  >
                    {category === 'all' ? 'All' : category}
                  </button>
                ))}
              </div>
            )}

            {/* Content Display */}
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-[var(--muted-text)]">{error}</p>
                  <button
                    onClick={() => fetchBlogs(currentView, pagination.current_page, searchQuery, activeCategory)}
                    className="mt-4 px-6 py-2 rounded-lg text-white bg-[var(--primary-color)] hover:bg-[var(--primary-dark)] transition-all duration-200"
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
              <div className="flex justify-center gap-2 mt-10">
                {(currentView === 'community' ? pagination.has_previous : recPage > 1) && (
                  <button
                    onClick={() => handlePageChange(currentView === 'community' ? pagination.current_page - 1 : recPage - 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--primary-light)]/20 transition-all duration-200"
                    style={{ color: 'var(--text-color)' }}
                  >
                    <i className="fas fa-chevron-left text-sm"></i>
                  </button>
                )}
                {Array.from({ length: currentView === 'community' ? pagination.total_pages : getRecTotalPages() }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 ${
                      (currentView === 'community' ? pagination.current_page : recPage) === page
                        ? 'text-white bg-[var(--primary-color)]'
                        : 'text-[var(--text-color)] hover:bg-[var(--primary-light)]/20'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                {(currentView === 'community' ? pagination.has_next : recPage < getRecTotalPages()) && (
                  <button
                    onClick={() => handlePageChange(currentView === 'community' ? pagination.current_page + 1 : recPage + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--primary-light)]/20 transition-all duration-200"
                    style={{ color: 'var(--text-color)' }}
                  >
                    <i className="fas fa-chevron-right text-sm"></i>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80 space-y-8">
            <Sidebar />
            <TopContributor />
            <SearchForm />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AllBlogs;