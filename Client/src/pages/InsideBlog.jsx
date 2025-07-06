// src/pages/InsideBlog.jsx
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
import {
  getThumbnailUrl,
  formatDate,
  calculateReadTime,
  normalizeBlog
} from '../utils/blogUtils.js';
import BlogLink from '../components/BlogLink';

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

  if (location.state?.blog) {
    setBlog(location.state.blog);
    setLoading(false);

    const fetchFreshData = async () => {
      try {
        const response = await api.get(`/blogs/${id}`);
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
        const response = await api.get(`/blogs/${id}`);
        setBlog(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch blog');
        setLoading(false);
      }
    };
    fetchBlog();
  }
}, [id, api, location.state]);

  useEffect(() => {
    if (blog && blog.categories && blog.categories.length > 0) {
      const fetchRelatedBlogs = async () => {
        try {
          setLoadingRelated(true);
          const response = await api.get(`/published-blogs/?category=${blog.categories[0]}&limit=5`);
          // Filter out the current blog from the results
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


  const handleReportSubmit = (e) => {
    e.preventDefault();
    console.log('Report submitted:', { reason: reportReason, details: reportDetails });
    setReportSubmitted(true);
  };

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
          <h2 className="text-2xl font-bold mb-4">Error loading blog</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Blog not found</h2>
          <p>The requested blog could not be found.</p>
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

      <main className="container mx-auto px-4 md:px-20 py-20 pt-28">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <article className="flex-1">
            <header className={`border-b pb-6 mb-8 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h1 className={`text-3xl md:text-4xl font-bold leading-tight mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {blog.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-2">
                {blog.categories?.map((category, index) => (
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
                {blog.tags?.map((tag, index) => (
                  <span
                    key={`tag-${index}`}
                    className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className={`flex flex-wrap gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>Published: {formatDate(blog.published_at)}</span>
                <span>
                  By: {blog.authors?.map((author, index) => (
                    <BlogLink key={index} blog={blog}>
                      <a
                        href={`/user/${author.username}`}
                        style={{ color: primaryColor }}
                        className="hover:underline"
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

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Blog content with floating sidebar */}
              <div className="prose max-w-none lg:w-[calc(100%-200px)]">
                <div
                  className={`float-left mr-6 mb-4 w-48 h-48 bg-cover bg-center rounded-md ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}
                  style={{ backgroundImage: `url('${getThumbnailUrl(blog)}')` }}
                ></div>

                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
              </div>
            </div>

            <BlogActions
              upvotes={blog.upvotes?.length || 0}
              downvotes={blog.downvotes?.length || 0}
              onReport={() => setShowReportModal(true)}
              blogId={blog.id}
              blogTitle={blog.title}
            />


            {/* Author Bio */}
            {blog.authors?.map(author => (
              <div key={author.username} className={`flex flex-col md:flex-row gap-5 p-6 rounded-lg my-8 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <img
                  src={author?.avatar_url || "https://randomuser.me/api/portraits/women/44.jpg"}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-4 object-cover mr-0 md:mr-6 mb-4 md:mb-0"
                  style={{ borderColor: primaryColor }}
                />
                <div>
                  <h3 className="text-xl font-semibold">{author.username}</h3>
                  <p className="text-sm mb-3" style={{ color: primaryColor }}>
                    {author.job_title || 'Author'} {author.university ? `at ${author.university}` : ''}
                  </p>
                  <p className="mb-4">
                    {author.bio || 'No bio provided.'}
                  </p>
                  <div className="flex gap-4">
                    <a href="#" className={`${darkMode ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'}`}>
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="#" className={`${darkMode ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'}`}>
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                    <a href="#" className={`${darkMode ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'}`}>
                      <i className="fab fa-google-scholar"></i>
                    </a>
                    <a href="#" className={`${darkMode ? 'text-gray-300 hover:text-teal-400' : 'text-gray-700 hover:text-teal-500'}`}>
                      <i className="fas fa-envelope"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}

            <CommentSection blogId={id} />
          </article>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-8" >
            <Sidebar />
            <SearchForm />
          </div>
        </div>
      </main>

      {/* Latest Research Section */}
      <section className={`py-16 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 md:px-20">
          <h2 className={`text-3xl font-bold mb-4 relative pb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {blog?.categories?.[0] ? `More in ${blog.categories[0]}` : 'Latest Research'}
            <span className="absolute bottom-0 left-0 w-16 h-1" style={{ backgroundColor: primaryColor }}></span>
          </h2>
          <p className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Explore more research in this category
          </p>

          {loadingRelated ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
            </div>
          ) : relatedBlogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {relatedBlogs.map((relatedBlog) => {
                const normalizedBlog = normalizeBlog(relatedBlog);
                return (
                  <BlogLink key={normalizedBlog.id} blog={normalizedBlog}>
                    <div className="group relative rounded-lg overflow-hidden h-48">
                      <div
                        className={`w-full h-full bg-cover bg-center ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                        style={{ backgroundImage: `url('${getThumbnailUrl(normalizedBlog)}')` }}
                      ></div>
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${darkMode ? 'from-black/90' : 'from-black/80'}`}></div>
                      <h3 className="absolute bottom-0 left-0 w-full p-4 text-white text-lg font-semibold translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        {normalizedBlog.title}
                      </h3>
                    </div>
                  </BlogLink>
                );
              })}
            </div>
          ) : (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No related blogs found in this category
            </div>
          )}
        </div>
      </section>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg w-full max-w-md relative ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <button
              onClick={() => {
                setShowReportModal(false);
                setReportSubmitted(false);
              }}
              className={`absolute top-4 right-4 text-2xl ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              &times;
            </button>

            {!reportSubmitted ? (
              <>
                <h3 className="text-xl font-bold mb-4">Report Content</h3>
                <p className="mb-4">Please select the reason for reporting this academic content:</p>

                <form onSubmit={handleReportSubmit}>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="reason-inaccurate"
                        name="report-reason"
                        value="inaccurate"
                        onChange={() => setReportReason('inaccurate')}
                        className="mr-2"
                        style={{ accentColor: primaryColor }}
                      />
                      <label htmlFor="reason-inaccurate">Inaccurate or misleading research</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="reason-plagiarism"
                        name="report-reason"
                        value="plagiarism"
                        onChange={() => setReportReason('plagiarism')}
                        className="mr-2"
                        style={{ accentColor: primaryColor }}
                      />
                      <label htmlFor="reason-plagiarism">Plagiarism concerns</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="reason-methodological"
                        name="report-reason"
                        value="methodological"
                        onChange={() => setReportReason('methodological')}
                        className="mr-2"
                        style={{ accentColor: primaryColor }}
                      />
                      <label htmlFor="reason-methodological">Methodological flaws</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="reason-other"
                        name="report-reason"
                        value="other"
                        onChange={() => setReportReason('other')}
                        className="mr-2"
                        style={{ accentColor: primaryColor }}
                      />
                      <label htmlFor="reason-other">Other academic concern</label>
                    </div>
                  </div>

                  <label htmlFor="report-details" className="block mb-2">
                    Academic justification for report (required):
                  </label>
                  <textarea
                    id="report-details"
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Please provide academic rationale for your report with references if possible..."
                    className={`w-full p-3 border rounded-md mb-4 min-h-32 focus:outline-none focus:ring-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-[var(--primary-color)]' : 'bg-white border-gray-300 text-gray-800 focus:border-[var(--primary-color)]'}`}
                    style={{ '--tw-ring-color': primaryColor }}
                    required
                  ></textarea>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="px-6 py-2 border rounded-md hover:opacity-90 transition-colors duration-200"
                      style={{ borderColor: primaryColor, color: primaryColor }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 text-white rounded-md hover:opacity-90 transition-colors duration-200"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="text-5xl mb-4" style={{ color: primaryColor }}>
                  <i className="fas fa-check-circle"></i>
                </div>
                <p className="text-lg mb-6">
                  Thank you for your academic review. Our editorial board will evaluate this report.
                </p>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-6 py-2 text-white rounded-md hover:opacity-90 transition-colors duration-200"
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