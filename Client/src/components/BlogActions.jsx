// src/components/BlogActions.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext';

const BlogActions = ({ upvotes, downvotes, onReport, blogId, blogTitle }) => {
  const [votes, setVotes] = useState({
    up: upvotes,
    down: downvotes,
    userVote: null
  });
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { user } = useAuth();
  const { primaryColor, darkMode } = useTheme();

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
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            <i className="fas fa-search"></i>
            <span>Check Plagiarism</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
            <i className="fas fa-trash"></i>
            <span>Delete Blog</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogActions;