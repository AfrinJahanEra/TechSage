import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext';
import Download from './Download.jsx';

const BlogActions = ({ upvotes, downvotes, onReport, blogId, blogTitle, blog }) => {
  const [votes, setVotes] = useState({
    up: upvotes,
    down: downvotes,
    userVote: null
  });
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState(null);
  const [loadingPlagiarism, setLoadingPlagiarism] = useState(false);
  const [error, setError] = useState(null);
  const { user, api } = useAuth();
  const { primaryColor, darkMode } = useTheme();

  const handlePlagiarismCheck = async () => {
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

  const handleVote = (type) => {
    if (!user) {
      alert('Please login to vote');
      return;
    }

    if (type === 'up') {
      if (votes.userVote === 'up') {
        setVotes(prev => ({
          ...prev,
          up: prev.up - 1,
          userVote: null
        }));
      } else if (votes.userVote === 'down') {
        setVotes(prev => ({
          ...prev,
          up: prev.up + 1,
          down: prev.down - 1,
          userVote: 'up'
        }));
      } else {
        setVotes(prev => ({
          ...prev,
          up: prev.up + 1,
          userVote: 'up'
        }));
      }
    } else {
      if (votes.userVote === 'down') {
        setVotes(prev => ({
          ...prev,
          down: prev.down - 1,
          userVote: null
        }));
      } else if (votes.userVote === 'up') {
        setVotes(prev => ({
          ...prev,
          down: prev.down + 1,
          up: prev.up - 1,
          userVote: 'down'
        }));
      } else {
        setVotes(prev => ({
          ...prev,
          down: prev.down + 1,
          userVote: 'down'
        }));
      }
    }
  };

  const shareBlog = (platform) => {
    const url = `${window.location.origin}/blog/${blogId}`;
    const text = `Check out this research: ${blogTitle}`;
    
    switch(platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(blogTitle)}`, '_blank');
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: blogTitle,
            text: text,
            url: url
          }).catch(err => console.log('Error sharing:', err));
        }
    }
  };

  return (
    <div className={`border-t border-b py-5 my-8 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button 
            onClick={() => handleVote('up')}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-full ${
              votes.userVote === 'up' 
                ? `border-green-500 text-green-500` 
                : `${darkMode ? 'border-gray-600 hover:border-green-400' : 'border-gray-300 hover:border-green-400'} hover:text-green-500`
            } transition-colors`}
          >
            <i className="fas fa-arrow-up"></i>
            <span>{votes.up}</span>
          </button>
          <button 
            onClick={() => handleVote('down')}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-full ${
              votes.userVote === 'down' 
                ? `border-red-500 text-red-500` 
                : `${darkMode ? 'border-gray-600 hover:border-red-400' : 'border-gray-300 hover:border-red-400'} hover:text-red-500`
            } transition-colors`}
          >
            <i className="fas fa-arrow-down"></i>
            <span>{votes.down}</span>
          </button>
        </div>

        <div className="flex space-x-4">
          <Download blog={blog} />
          <div className="relative">
            <button 
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="flex items-center space-x-2 px-4 py-2 rounded-full transition-colors"
              style={{ backgroundColor: primaryColor, color: 'white' }}
            >
              <i className="fas fa-share-alt"></i>
              <span>Share</span>
            </button>
            
            {showShareOptions && (
              <div className={`absolute right-0 bottom-full mb-2 w-48 shadow-lg rounded-md py-2 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <button 
                  onClick={() => shareBlog('facebook')}
                  className={`flex items-center px-4 py-2 w-full text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} text-blue-600`}
                >
                  <i className="fab fa-facebook-f mr-2"></i>
                  Facebook
                </button>
                <button 
                  onClick={() => shareBlog('twitter')}
                  className={`flex items-center px-4 py-2 w-full text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} text-blue-400`}
                >
                  <i className="fab fa-twitter mr-2"></i>
                  Twitter
                </button>
                <button 
                  onClick={() => shareBlog('linkedin')}
                  className={`flex items-center px-4 py-2 w-full text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} text-blue-700`}
                >
                  <i className="fab fa-linkedin-in mr-2"></i>
                  LinkedIn
                </button>
                {navigator.share && (
                  <button 
                    onClick={() => shareBlog('native')}
                    className={`flex items-center px-4 py-2 w-full text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <i className="fas fa-share-alt mr-2"></i>
                    Other
                  </button>
                )}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => {
              if (!user) {
                alert('Please login to report content');
                return;
              }
              onReport();
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <i className="fas fa-flag"></i>
            <span>Report</span>
          </button>
        </div>
      </div>

      {(user?.role === 'moderator' || user?.role === 'admin') && (
        <div className={`flex space-x-4 mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button 
            onClick={handlePlagiarismCheck}
            disabled={loadingPlagiarism}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loadingPlagiarism ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Checking...</span>
              </>
            ) : (
              <>
                <i className="fas fa-search"></i>
                <span>Check Plagiarism</span>
              </>
            )}
          </button>
        </div>
      )}

      {plagiarismResult && (
        <div className={`mt-4 p-4 rounded-md ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
          <h3 className="font-bold mb-2 flex items-center">
            <i className="fas fa-search mr-2"></i>
            Plagiarism Check Results
          </h3>
          <p className="mb-2">
            <span className="font-semibold">Score:</span> {plagiarismResult.plagiarism_score}%
          </p>
          
          {plagiarismResult.sources && plagiarismResult.sources.length > 0 && (
            <div className="mt-3">
              <h4 className="font-semibold mb-1">Potential Sources:</h4>
              <ul className="space-y-2">
                {plagiarismResult.sources.map((source, index) => (
                  <li key={index} className="text-sm">
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
        <div className={`mt-4 p-4 rounded-md ${darkMode ? 'bg-red-900/30' : 'bg-red-100'} text-red-600`}>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default BlogActions;