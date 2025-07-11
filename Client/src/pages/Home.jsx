import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Sidebar from '../components/Sidebar.jsx';
import SearchForm from '../components/SearchForm.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { normalizeBlog, getThumbnailUrl, formatDate, calculateReadTime, getContentPreview } from '../utils/blogUtils';
import BlogLink from '../components/BlogLink';

const Home = () => {
  const { darkMode, primaryColor, shadeColor } = useTheme();
  const { api } = useAuth();
  const [mostPopularBlog, setMostPopularBlog] = useState(null);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const primaryDark = shadeColor(primaryColor, -20);
  const primaryLight = shadeColor(primaryColor, 20);

  const themeStyles = {
    '--primary-color': primaryColor,
    '--primary-dark': primaryDark,
    '--primary-light': primaryLight,
  };

  const fetchPopularBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/published-blogs/');
      if (!response.data || !response.data.blogs) {
        throw new Error('Invalid response format');
      }

      let blogs = response.data.blogs.map(blog => normalizeBlog(blog));
      
      blogs.sort((a, b) => {
        const aUpvotes = a.upvotes?.length || 0;
        const bUpvotes = b.upvotes?.length || 0;
        const upvoteDiff = bUpvotes - aUpvotes;
        if (upvoteDiff !== 0) return upvoteDiff;
        return new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at);
      });

      setMostPopularBlog(blogs[0] || null);
      setFeaturedBlogs(blogs.length > 1 ? blogs.slice(1, 6) : []);
      
    } catch (err) {
      console.error('Error fetching popular blogs:', err);
      setError(err.response?.data?.error || 'Failed to load popular blogs. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchPopularBlogs();
  }, [fetchPopularBlogs]);

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
          <h2 className="text-2xl font-bold mb-4">Error loading content</h2>
          <p>{error}</p>
          <button
            onClick={fetchPopularBlogs}
            className="mt-4 px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: primaryColor, color: 'white' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
            {mostPopularBlog ? (
              <>
                <header className={`border-b pb-6 mb-8 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
                    {mostPopularBlog.title}
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {mostPopularBlog.categories?.map((category, index) => (
                      <span 
                        key={`cat-${index}`} 
                        className="px-3 py-1 text-sm rounded-full font-medium"
                        style={{ 
                          backgroundColor: `${primaryColor}20`,
                          color: primaryColor
                        }}
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {mostPopularBlog.tags?.map((tag, index) => (
                      <span 
                        key={`tag-${index}`} 
                        className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className={`flex flex-wrap gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>Published: {formatDate(mostPopularBlog.published_at)}</span>
                    <span>
                      By: {mostPopularBlog.authors?.map((author, index) => (
                        <BlogLink key={index} blog={mostPopularBlog}>
                          <a
                            href={`/user/${author.username}`}
                            style={{ color: primaryColor }}
                            className="hover:underline"
                          >
                            {author.username}
                            {index < mostPopularBlog.authors.length - 1 ? ', ' : ''}
                          </a>
                        </BlogLink>
                      ))}
                    </span>
                    <span>{calculateReadTime(mostPopularBlog.content)}</span>
                    <span className="flex items-center">
                      <i className="fas fa-arrow-up mr-1"></i>
                      {mostPopularBlog.upvotes?.length || 0} upvotes
                    </span>
                  </div>
                </header>

                <div className="prose max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ __html: getContentPreview(mostPopularBlog.content, '/home') }} 
                    className={`${darkMode ? 'text-gray-300' : 'text-gray-800'}`}
                  />
                </div>

                <div className="mt-8">
                  <BlogLink blog={mostPopularBlog}>
                    <a 
                      className="font-semibold hover:underline"
                      style={{ color: primaryColor }}
                    >
                      Read Full Blog →
                    </a>
                  </BlogLink>
                </div>
              </>
            ) : (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>No popular blogs available</p>
                <button
                  onClick={fetchPopularBlogs}
                  className="mt-4 px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: primaryColor, color: 'white' }}
                >
                  Refresh
                </button>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-8">
            <Sidebar />
            <SearchForm/>
          </div>
        </div>
      </main>

      {/* Featured Research Section */}
      <section className={`py-16 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 md:px-20">
          <h2 className={`text-3xl font-bold mb-4 relative pb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Trending Research
            <span className="absolute bottom-0 left-0 w-16 h-1" style={{ backgroundColor: primaryColor }}></span>
          </h2>
          <p className={`text-xl mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Explore the most popular academic work this week
          </p>

          {featuredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {featuredBlogs.map((blog) => {
                const preview = getContentPreview(blog.content, '/home');
                return (
                  <BlogLink key={blog.id} blog={blog}>
                    <div className="group relative rounded-lg overflow-hidden h-48">
                      <div
                        className={`w-full h-full bg-cover bg-center ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                        style={{
                          backgroundImage: `url('${getThumbnailUrl(blog)}')`
                        }}
                        aria-label={blog.title || 'Blog thumbnail'}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${darkMode ? 'from-black/90' : 'from-black/80'}`} />
                      <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white text-lg font-semibold mb-1 line-clamp-2">
                          {blog.title || 'Untitled Blog'}
                        </h3>
                        <p className="text-white text-sm mb-2 line-clamp-2">
                          {preview}
                        </p>
                        <div className="flex items-center text-sm text-white">
                          <i className="fas fa-arrow-up mr-1"></i>
                          <span>{blog.upvotes?.length || 0}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(blog.published_at || blog.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </BlogLink>
                );
              })}
            </div>
          ) : (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>No trending research available</p>
              <button
                onClick={fetchPopularBlogs}
                className="mt-4 px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: primaryColor, color: 'white' }}
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;