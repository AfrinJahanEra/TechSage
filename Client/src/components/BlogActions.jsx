import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import Download from './Download.jsx';
import { FaArrowUp, FaArrowDown, FaShareAlt, FaFlag, FaSearch, FaSpinner, FaFacebookF, FaTwitter, FaLinkedinIn, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import { TbArrowBigUpLinesFilled, TbArrowBigDownLineFilled } from "react-icons/tb";

const BlogActions = ({ upvotes, downvotes, onReport, blogId, blogTitle, blog, onVoteUpdate }) => {
  const [votes, setVotes] = useState({
    up: upvotes || 0,
    down: downvotes || 0,
    userVote: null // 'up', 'down', or null
  });
  const [isSaved, setIsSaved] = useState(blog.is_saved || false); // Track saved state
  const [loadingVote, setLoadingVote] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState(null);
  const [loadingPlagiarism, setLoadingPlagiarism] = useState(false);
  const [error, setError] = useState(null);
  const { user, api } = useAuth();
  const { primaryColor, darkMode } = useTheme();

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const query = user ? `?username=${user.username}` : '';
        const response = await api.get(`/blogs/${blogId}${query}`, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        const blogData = response.data;
        setVotes({
          up: blogData.upvotes,
          down: blogData.downvotes,
          userVote: blogData.has_upvoted ? 'up' : blogData.has_downvoted ? 'down' : null
        });
        setIsSaved(blogData.is_saved); // Update saved state
      } catch (err) {
        console.error('Error fetching blog data:', err);
        setVotes({ up: blog.upvotes || 0, down: blog.downvotes || 0, userVote: null });
        setIsSaved(blog.is_saved || false);
      }
    };
    fetchBlogData();
  }, [user, blogId, api, blog]);

  const showLoginToast = () => {
    toast.error('Please login to perform this action', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: darkMode ? 'dark' : 'light'
    });
  };

  const handlePlagiarismCheck = async () => {
    if (!user) {
      showLoginToast();
      return;
    }
    try {
      setLoadingPlagiarism(true);
      setError(null);
      const response = await api.post(`/checker/plagiarism/${blogId}/`);
      setPlagiarismResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to check plagiarism');
      console.error('Plagiarism check error:', err);
    } finally {
      setLoadingPlagiarism(false);
    }
  };

  const handleVote = async (type) => {
    if (!user) {
      showLoginToast();
      return;
    }
    if (loadingVote) return;

    setLoadingVote(true);
    try {
      setVotes(prev => ({
        ...prev,
        up: type === 'up' ? (prev.userVote === 'up' ? prev.up - 1 : prev.up + (prev.userVote === 'down' ? 1 : 0)) : prev.up - (prev.userVote === 'up' ? 1 : 0),
        down: type === 'down' ? (prev.userVote === 'down' ? prev.down - 1 : prev.down + (prev.userVote === 'up' ? 1 : 0)) : prev.down - (prev.userVote === 'down' ? 1 : 0),
        userVote: prev.userVote === type ? null : type
      }));

      const response = await api.post(`/blogs/vote/${blogId}/`, {
        username: user.username,
        type
      });

      setVotes({
        up: response.data.upvotes,
        down: response.data.downvotes,
        userVote: response.data.has_upvoted ? 'up' : response.data.has_downvoted ? 'down' : null
      });

      if (onVoteUpdate) onVoteUpdate();

      toast.success(`${type === 'up' ? 'Upvote' : 'Downvote'} recorded!`, {
        position: "top-right",
        autoClose: 2000,
        theme: darkMode ? 'dark' : 'light'
      });
    } catch (err) {
      setVotes(prev => ({
        up: blog.upvotes || 0,
        down: blog.downvotes || 0,
        userVote: prev.userVote
      }));
      toast.error(err.response?.data?.error || 'Failed to record vote. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        theme: darkMode ? 'dark' : 'light'
      });
      console.error('Vote error:', err);
    } finally {
      setLoadingVote(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!user) {
      showLoginToast();
      return;
    }
    try {
      if (isSaved) {
        // Unsave the blog
        await api.delete(`/user/${user.username}/saved-blogs/`, {
          data: { blog_id: blogId }
        });
        setIsSaved(false);
        toast.success('Blog removed from saved list!', {
          position: "top-right",
          autoClose: 2000,
          theme: darkMode ? 'dark' : 'light'
        });
      } else {
        // Save the blog
        await api.post(`/user/${user.username}/saved-blogs/`, {
          blog_id: blogId
        });
        setIsSaved(true);
        toast.success('Blog saved!', {
          position: "top-right",
          autoClose: 2000,
          theme: darkMode ? 'dark' : 'light'
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update saved blogs. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        theme: darkMode ? 'dark' : 'light'
      });
      console.error('Save blog error:', err);
    }
  };

  const shareBlog = (platform) => {
    if (!user) {
      showLoginToast();
      return;
    }
    const url = `${window.location.origin}/blog/${blogId}`;
    const text = `Check out this research: ${blogTitle}`;
    const hashtags = blog.categories?.map(cat => cat.replace(/\s+/g, '')).join(',') || 'blog,research';
    const description = blog.excerpt || text;
    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank',
          'noopener,noreferrer'
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${encodeURIComponent(hashtags)}`,
          '_blank',
          'noopener,noreferrer'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(blogTitle)}&summary=${encodeURIComponent(description)}`,
          '_blank',
          'noopener,noreferrer'
        );
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: blogTitle,
            text: text,
            url: url
          }).catch(err => {
            console.error('Error sharing (native):', err);
            copyToClipboard(url);
          });
        } else {
          copyToClipboard(url);
        }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success('Link copied to clipboard!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: darkMode ? 'dark' : 'light'
        });
      },
      (err) => {
        console.error('Failed to copy link:', err);
        toast.error('Failed to copy link. Please try again.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: darkMode ? 'dark' : 'light'
        });
      }
    );
  };

  return (
    <div className={`border-t border-b py-4 sm:py-6 my-6 sm:my-8 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex flex-row sm:flex-row justify-between items-center gap-3 sm:gap-6">
        <div className="flex space-x-2 sm:space-x-4">
          <button
            onClick={() => handleVote('upvote')}
            disabled={loadingVote}
            className={`flex items-center justify-center space-x-2 px-2 sm:px-4 py-1 sm:py-2 border rounded-full text-sm sm:text-base font-medium transition-all duration-200 w-10 sm:w-auto h-10 sm:h-auto ${votes.userVote === 'up'
                ? `border-green-500 bg-green-500/10 text-green-500 hover:bg-green-500/20`
                : `${darkMode ? 'border-gray-600 hover:border-green-400 hover:bg-green-400/10' : 'border-gray-300 hover:border-green-400 hover:bg-green-400/10'} hover:text-green-500`
              } ${loadingVote ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Upvote"
          >
            <TbArrowBigUpLinesFilled className="text-base sm:text-lg" />
            <span className="hidden sm:inline">{votes.up}</span>
          </button>
          <button
            onClick={() => handleVote('downvote')}
            disabled={loadingVote}
            className={`flex items-center justify-center space-x-2 px-2 sm:px-4 py-1 sm:py-2 border rounded-full text-sm sm:text-base font-medium transition-all duration-200 w-10 sm:w-auto h-10 sm:h-auto ${votes.userVote === 'down'
                ? `border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20`
                : `${darkMode ? 'border-gray-600 hover:border-red-400 hover:bg-red-400/10' : 'border-gray-300 hover:border-red-400 hover:bg-red-400/10'} hover:text-red-500`
              } ${loadingVote ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Downvote"
          >
            <TbArrowBigDownLineFilled className="text-base sm:text-lg" />
            <span className="hidden sm:inline">{votes.down}</span>
          </button>
        </div>
        <div className="flex space-x-2 sm:space-x-4">
          <Download blog={blog} />
          <button
            onClick={handleSaveToggle}
            className={`flex items-center justify-center space-x-2 px-2 sm:px-4 py-1 sm:py-2 border rounded-full text-sm sm:text-base font-medium transition-all duration-200 w-10 sm:w-auto h-10 sm:h-auto ${isSaved
                ? `border-yellow-500 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20`
                : `${darkMode ? 'border-gray-600 hover:border-yellow-400 hover:bg-yellow-400/10' : 'border-gray-300 hover:border-yellow-400 hover:bg-yellow-400/10'} hover:text-yellow-500`
              }`}
            title={isSaved ? "Unsave" : "Save"}
          >
            {isSaved ? (
              <FaBookmark className="text-base sm:text-lg" />
            ) : (
              <FaRegBookmark className="text-base sm:text-lg" />
            )}
            <span className="hidden sm:inline">{isSaved ? 'Unsave' : 'Save'}</span>
          </button>
          <div className="relative">
            <button
              onClick={() => {
                if (!user) {
                  showLoginToast();
                  return;
                }
                setShowShareOptions(!showShareOptions);
              }}
              className="flex items-center justify-center space-x-2 px-2 sm:px-4 py-1 sm:py-2 rounded-full hover:opacity-90 transition-colors text-sm sm:text-base w-10 sm:w-auto h-10 sm:h-auto"
              style={{ backgroundColor: primaryColor, color: 'white' }}
              title="Share"
            >
              <FaShareAlt className="text-base sm:text-lg" />
              <span className="hidden sm:inline">Share</span>
            </button>
            {showShareOptions && (
              <div className={`absolute right-0 bottom-full mb-2 w-36 sm:w-48 shadow-lg rounded-md py-2 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <button
                  onClick={() => shareBlog('facebook')}
                  className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2 w-full text-left text-sm sm:text-base ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} text-blue-600`}
                >
                  <FaFacebookF className="mr-2" />
                  Facebook
                </button>
                <button
                  onClick={() => shareBlog('twitter')}
                  className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2 w-full text-left text-sm sm:text-base ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} text-blue-400`}
                >
                  <FaTwitter className="mr-2" />
                  Twitter
                </button>
                <button
                  onClick={() => shareBlog('linkedin')}
                  className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2 w-full text-left text-sm sm:text-base ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} text-blue-700`}
                >
                  <FaLinkedinIn className="mr-2" />
                  LinkedIn
                </button>
                <button
                  onClick={() => shareBlog('native')}
                  className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2 w-full text-left text-sm sm:text-base ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  <FaShareAlt className="mr-2" />
                  Other
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              if (!user) {
                showLoginToast();
                return;
              }
              onReport();
            }}
            className="flex items-center justify-center space-x-2 px-2 sm:px-4 py-1 sm:py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors text-sm sm:text-base w-10 sm:w-auto h-10 sm:h-auto"
            title="Report"
          >
            <FaFlag className="text-base sm:text-lg" />
            <span className="hidden sm:inline">Report</span>
          </button>
        </div>
      </div>
      {(user?.role === 'moderator' || user?.role === 'admin') && (
        <div className={`flex space-x-2 sm:space-x-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={handlePlagiarismCheck}
            disabled={loadingPlagiarism}
            className="flex items-center space-x-2 px-2 sm:px-4 py-1 sm:py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm sm:text-base w-10 sm:w-auto h-10 sm:h-auto"
            title="Check Plagiarism"
          >
            {loadingPlagiarism ? (
              <>
                <FaSpinner className="text-base sm:text-lg animate-spin" />
                <span className="hidden sm:inline">Checking...</span>
              </>
            ) : (
              <>
                <FaSearch className="text-base sm:text-lg" />
                <span className="hidden sm:inline">Check Plagiarism</span>
              </>
            )}
          </button>
        </div>
      )}
      {plagiarismResult && (
        <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-md ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
          <h3 className="font-bold text-sm sm:text-base mb-2 flex items-center">
            <FaSearch className="mr-2 text-base sm:text-lg" />
            Plagiarism Check Results
          </h3>
          <p className="text-sm sm:text-base mb-2">
            <span className="font-semibold">Score:</span> {plagiarismResult.plagiarism_score}%
          </p>
          {plagiarismResult.sources && plagiarismResult.sources.length > 0 && (
            <div className="mt-2 sm:mt-3">
              <h4 className="font-semibold text-sm sm:text-base mb-1">Potential Sources:</h4>
              <ul className="space-y-1 sm:space-y-2">
                {plagiarismResult.sources.map((source, index) => (
                  <li key={index} className="text-xs sm:text-sm">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {source.title}
                    </a> ({source.plagiarismWords} matching words)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {error && (
        <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-md ${darkMode ? 'bg-red-900/30' : 'bg-red-100'} text-red-600 text-sm sm:text-base`}>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default BlogActions;