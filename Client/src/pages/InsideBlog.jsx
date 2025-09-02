import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Sidebar from '../components/Sidebar.jsx';
import BlogActions from '../components/BlogActions.jsx';
import CommentSection from '../components/CommentSection.jsx';
import SearchForm from '../components/SearchForm.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import Tiptap from '../components/CreateBlogComponents/Tiptap';
import {
  getThumbnailUrl,
  formatDate,
  calculateReadTime,
  normalizeBlog,
} from '../utils/blogUtils.js';
import BlogLink from '../components/BlogLink';
import TopContributor from '../components/TopContributor.jsx';
import 'katex/dist/katex.min.css';

const InsideBlog = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user, api } = useAuth();
  const [blog, setBlog] = useState(location.state?.blog || null);
  const [loading, setLoading] = useState(!location.state?.blog);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const { darkMode, primaryColor, shadeColor } = useTheme();
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  const primaryDark = shadeColor(primaryColor, -20);
  const primaryLight = shadeColor(primaryColor, 20);

  const themeStyles = {
    '--primary-color': primaryColor,
    '--primary-dark': primaryDark,
    '--primary-light': primaryLight,
  };

  useEffect(() => {
    if (location.state?.blog) {
      setBlog(location.state.blog);
      setLoading(false);

      const fetchFreshData = async () => {
        try {
          const query = user ? `?username=${user.username}` : '';
          const response = await api.get(`/blogs/${id}${query}`);
          setBlog(response.data);
        } catch (err) {
          console.error('Error fetching fresh blog data:', err);
        }
      };
      fetchFreshData();
    } else {
      const fetchBlog = async () => {
        try {
          setLoading(true);
          const query = user ? `?username=${user.username}` : '';
          const response = await api.get(`/blogs/${id}${query}`);
          setBlog(response.data);
          setLoading(false);
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to fetch blog');
          setLoading(false);
        }
      };
      fetchBlog();
    }
  }, [id, api, location.state, user]);

  useEffect(() => {
    if (blog && blog.categories && blog.categories.length > 0) {
      const fetchRelatedBlogs = async () => {
        try {
          setLoadingRelated(true);
          const response = await api.get(`/published-blogs/?category=${blog.categories[0]}&limit=5`);
          const filteredBlogs = response.data.blogs.filter(b => b.id !== blog.id);
          setRelatedBlogs(filteredBlogs);
          setLoadingRelated(false);
        } catch (err) {
          console.error('Error fetching related blogs:', err);
          setRelatedBlogs([]);
          setLoadingRelated(false);
        }
      };
      fetchRelatedBlogs();
    }
  }, [blog, api]);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to report content');
      return;
    }
    try {
      await api.post('/reports/submit/', {
        blog_id: id,
        user_id: user.id,
        reason: reportReason,
        details: reportDetails,
      });
      setReportSubmitted(true);
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <div className="text-center p-6">
          <h2 className="text-3xl font-bold mb-4">Error loading blog</h2>
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <div className="text-center p-6">
          <h2 className="text-3xl font-bold mb-4">Blog not found</h2>
          <p className="text-lg">The requested blog could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}
      style={themeStyles}
    >
      <Navbar activePage="home" />
      <main className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-8 pt-24 overflow-visible">
        <div className="flex flex-col lg:flex-row gap-6">
          <article className="flex-1 overflow-visible">
            <header className={`border-b pb-5 mb-5 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
                {blog.title}
              </h1>
              <div className="flex flex-wrap gap-3 mb-3">
                {blog.categories?.map((category, index) => (
                  <span
                    key={`cat-${index}`}
                    className="px-3 py-1 text-sm rounded-full font-medium transition-colors duration-500"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      color: primaryColor,
                    }}
                  >
                    {category}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mb-3">
                {blog.tags?.map((tag, index) => (
                  <span
                    key={`tag-${index}`}
                    className={`px-2 py-1 text-sm rounded-full transition-colors duration-500 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className={`flex flex-wrap gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>Published: {formatDate(blog.published_at)}</span>
                <span>
                  By:{' '}
                  {blog.authors?.map((author, index) => (
                    <BlogLink key={index} blog={blog}>
                      <a
                        href={`/user/${author.username}`}
                        style={{ color: primaryColor }}
                        className="hover:underline transition-colors duration-500"
                      >
                        {author.username}
                        {index < blog.authors.length - 1 ? ', ' : ''}
                      </a>
                    </BlogLink>
                  ))}
                </span>
                <span>{calculateReadTime(blog.content)}</span>
              </div>
            </header>

            <div className="mb-6 overflow-visible h-auto">
              <div
                className="w-full sm:w-80 h-48 sm:h-60 bg-cover bg-center rounded-lg my-5 mx-auto shadow-md transition-shadow duration-500 hover:shadow-lg"
                style={{ backgroundImage: `url('${getThumbnailUrl(blog)}')` }}
              ></div>
              <div className={`border-b mb-5 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
              <Tiptap
                content={blog.content}
                setContent={() => {}} // No-op for read-only
                primaryColor={primaryColor}
                darkMode={darkMode}
                readOnly
                className="overflow-visible max-h-none h-auto"
              />
            </div>

            <BlogActions
              upvotes={blog.upvotes || 0}
              downvotes={blog.downvotes || 0}
              onReport={() => setShowReportModal(true)}
              blogId={blog.id}
              blogTitle={blog.title}
              blog={blog}
            />

            <CommentSection blogId={id} />
          </article>

          <aside className="lg:w-96 space-y-6">
            <Sidebar />
            <TopContributor />
            <SearchForm />
          </aside>
        </div>
      </main>

      <section className={`py-12 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-5 relative pb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {blog?.categories?.[0] ? `More in ${blog.categories[0]}` : 'Latest Research'}
            <span className="absolute bottom-0 left-0 w-20 h-1" style={{ backgroundColor: primaryColor }}></span>
          </h2>
          <p className={`text-xl mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Explore more research in this category
          </p>

          {loadingRelated ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
            </div>
          ) : relatedBlogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {relatedBlogs.map((relatedBlog) => {
                const normalizedBlog = normalizeBlog(relatedBlog);
                return (
                  <BlogLink key={normalizedBlog.id} blog={normalizedBlog}>
                    <div className="group relative rounded-lg overflow-hidden h-48 shadow-md transition-shadow duration-500 hover:shadow-lg">
                      <div
                        className={`w-full h-full bg-cover bg-center ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                        style={{ backgroundImage: `url('${getThumbnailUrl(normalizedBlog)}')` }}
                      ></div>
                      <div
                        className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${darkMode ? 'from-black/80' : 'from-black/70'}`}
                      ></div>
                      <h3 className="absolute bottom-0 left-0 w-full p-3 text-white text-lg font-semibold translate-y-full group-hover:translate-y-0 transition-transform duration-500 line-clamp-2">
                        {normalizedBlog.title}
                      </h3>
                    </div>
                  </BlogLink>
                );
              })}
            </div>
          ) : (
            <div className={`text-center py-6 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No related blogs found in this category
            </div>
          )}
        </div>
      </section>

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-500">
          <div className={`p-5 sm:p-6 rounded-xl w-full max-w-md relative shadow-xl ${darkMode ? 'bg-gray-800/90 text-white' : 'bg-white/90 text-gray-800'}`}>
            <button
              onClick={() => {
                setShowReportModal(false);
                setReportSubmitted(false);
              }}
              className={`absolute top-4 right-4 text-2xl ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-500`}
            >
              &times;
            </button>

            {!reportSubmitted ? (
              <>
                <h3 className="text-xl sm:text-2xl font-bold mb-5">Report Content</h3>
                <p className="mb-5 text-base">Please select the reason for reporting this academic content:</p>

                <form onSubmit={handleReportSubmit}>
                  <div className="space-y-4 mb-5">
                    {[
                      { id: 'reason-inaccurate', value: 'inaccurate', label: 'Inaccurate or misleading research' },
                      { id: 'reason-plagiarism', value: 'plagiarism', label: 'Plagiarism concerns' },
                      { id: 'reason-methodological', value: 'methodological', label: 'Methodological flaws' },
                      { id: 'reason-other', value: 'other', label: 'Other academic concern' },
                    ].map(({ id, value, label }) => (
                      <div key={id} className="flex items-center">
                        <input
                          type="radio"
                          id={id}
                          name="report-reason"
                          value={value}
                          onChange={() => setReportReason(value)}
                          className="mr-3 h-5 w-5"
                          style={{ accentColor: primaryColor }}
                        />
                        <label htmlFor={id} className="text-base">{label}</label>
                      </div>
                    ))}
                  </div>

                  <label htmlFor="report-details" className="block mb-3 text-base">
                    Academic justification for report (required):
                  </label>
                  <textarea
                    id="report-details"
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Please provide academic rationale for your report with references if possible..."
                    className={`w-full p-3 border rounded-lg mb-5 min-h-36 focus:outline-none focus:ring-2 transition-shadow duration-500 ${darkMode ? 'bg-gray-700/80 border-gray-600 text-white focus:ring-[var(--primary-color)]' : 'bg-white/80 border-gray-300 text-gray-800 focus:ring-[var(--primary-color)]'}`}
                    style={{ '--tw-ring-color': primaryColor }}
                    required
                  ></textarea>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="px-5 py-2 border rounded-lg hover:opacity-90 transition-colors duration-500 text-base"
                      style={{ borderColor: primaryColor, color: primaryColor }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-white rounded-lg hover:opacity-90 transition-colors duration-500 text-base"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="text-5xl mb-5" style={{ color: primaryColor }}>
                  <i className="fas fa-check-circle"></i>
                </div>
                <p className="text-lg mb-5">
                  Thank you for your academic review. Our editorial board will evaluate this report.
                </p>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-5 py-2 text-white rounded-lg hover:opacity-90 transition-colors duration-500 text-base"
                  style={{ backgroundColor: primaryColor }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default InsideBlog;