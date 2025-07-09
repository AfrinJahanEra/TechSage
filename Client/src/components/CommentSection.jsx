import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';

const CommentSection = ({ blogId }) => {
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const { user, api } = useContext(AuthContext);
  const { primaryColor, darkMode } = useTheme();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch comments when component mounts or blogId changes
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/comments/blog/${blogId}`);
        const commentsData = response.data;
        
        // Organize comments into parent-child structure
        const commentMap = {};
        const rootComments = [];
        
        // First pass: create map and copy all comments
        commentsData.forEach(comment => {
          commentMap[comment.id] = {
            ...comment,
            replies: [],
            date: formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
          };
        });
        
        // Second pass: build hierarchy
        commentsData.forEach(comment => {
          if (comment.parent) {
            if (commentMap[comment.parent]) {
              commentMap[comment.parent].replies.push(commentMap[comment.id]);
            }
          } else {
            rootComments.push(commentMap[comment.id]);
          }
        });
        
        setComments(rootComments);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch comments');
        setLoading(false);
      }
    };

    if (blogId) {
      fetchComments();
    }
  }, [blogId, api]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to comment');
      return;
    }
    if (!comment.trim()) return;
    
    try {
      const response = await api.post('/comments/post/', {
        blog_id: blogId,
        author: user.username,
        content: comment
      });
      
      const newComment = {
        id: response.data.id,
        author: {
          username: user.username,
          avatar_url: user.avatar || 'https://randomuser.me/api/portraits/women/44.jpg'
        },
        content: comment,
        date: 'Just now',
        likes: 0,
        replies: []
      };
      
      setComments([...comments, newComment]);
      setComment('');
    } catch (err) {
      alert('Failed to post comment: ' + (err.response?.data?.error || 'Server error'));
    }
  };

  const handleReplySubmit = async (commentId, e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to reply');
      return;
    }
    if (!replyContent.trim()) return;
    
    try {
      const response = await api.post('/comments/post/', {
        blog_id: blogId,
        author: user.username,
        content: replyContent,
        parent_id: commentId
      });
      
      const newReply = {
        id: response.data.id,
        author: {
          username: user.username,
          avatar_url: user.avatar || 'https://randomuser.me/api/portraits/women/44.jpg'
        },
        content: replyContent,
        date: 'Just now',
        likes: 0
      };
      
      setComments(comments.map(c => 
        c.id === commentId 
          ? { ...c, replies: [...c.replies, newReply] } 
          : c
      ));
      
      setReplyContent('');
      setReplyTo(null);
    } catch (err) {
      alert('Failed to post reply: ' + (err.response?.data?.error || 'Server error'));
    }
  };

  const handleLike = async (commentId, isReply = false, replyId = null) => {
    if (!user) {
      alert('Please login to like comments');
      return;
    }

    try {
      await api.post(`/comments/${commentId}/like/`, {
        username: user.username
      });

      if (isReply) {
        setComments(comments.map(c => 
          c.id === commentId 
            ? { 
                ...c, 
                replies: c.replies.map(r => 
                  r.id === replyId 
                    ? { ...r, likes: r.likes + 1 } 
                    : r
                ) 
              } 
            : c
        ));
      } else {
        setComments(comments.map(c => 
          c.id === commentId 
            ? { ...c, likes: c.likes + 1 } 
            : c
        ));
      }
    } catch (err) {
      alert('Failed to like comment: ' + (err.response?.data?.error || 'Server error'));
    }
  };

  const handleDeleteComment = async (commentId, isReply = false, replyId = null) => {
    if (!user) {
      alert('Please login to delete comments');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await api.post(`/comments/${commentId}/delete/`, {
        username: user.username
      });

      if (isReply) {
        setComments(comments.map(c => 
          c.id === commentId 
            ? { 
                ...c, 
                replies: c.replies.filter(r => r.id !== replyId) 
              } 
            : c
        ));
      } else {
        setComments(comments.filter(c => c.id !== commentId));
      }
    } catch (err) {
      alert('Failed to delete comment: ' + (err.response?.data?.error || 'Server error'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
        Error loading comments: {error}
      </div>
    );
  }

  return (
    <section className={`mt-16 border-t pt-10 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <h2 className={`text-2xl font-bold mb-8 relative pb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Academic Discussion
        <span className="absolute bottom-0 left-0 w-16 h-1" style={{ backgroundColor: primaryColor }}></span>
      </h2>

      <form onSubmit={handleCommentSubmit} className="mb-10">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={user ? "Contribute to the academic discussion..." : "Please login to comment"}
          className={`w-full p-4 rounded-lg mb-4 min-h-32 focus:outline-none focus:ring-2 ${
            darkMode 
              ? 'bg-gray-800 border-gray-600 text-white focus:border-gray-500' 
              : 'bg-white border-gray-300 text-gray-700 focus:border-gray-400'
          }`}
          style={{ '--tw-ring-color': primaryColor }}
          disabled={!user}
        ></textarea>
        <button 
          type="submit" 
          className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
          style={{ backgroundColor: primaryColor }}
          disabled={!user}
        >
          Post Comment
        </button>
      </form>

      <div className="space-y-8 max-h-screen overflow-y-auto pr-4">
        {comments.length === 0 ? (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No comments yet. Be the first to contribute to the discussion!
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className={`pb-8 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-start gap-4 mb-4">
                <img 
                  src={comment.author.avatar_url || 'https://randomuser.me/api/portraits/women/44.jpg'} 
                  alt={comment.author.username} 
                  className="w-10 h-10 rounded-full object-cover" 
                />
                <div>
                  <div className="flex items-center gap-4">
                    <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {comment.author.username}
                    </h4>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {comment.date}
                    </span>
                    {user && (user.username === comment.author.username || user.role === 'admin') && (
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 text-sm hover:text-red-700 ml-auto"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                  <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {comment.content}
                  </p>
                </div>
              </div>

              <div className="flex gap-6 ml-14">
                <button 
                  onClick={() => handleLike(comment.id)}
                  className={`flex items-center gap-1 text-sm ${
                    darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <i className="fas fa-thumbs-up"></i>
                  <span>Like ({comment.likes || 0})</span>
                </button>
                <button 
                  onClick={() => {
                    if (!user) {
                      alert('Please login to reply');
                      return;
                    }
                    setReplyTo(replyTo === comment.id ? null : comment.id);
                  }}
                  className={`flex items-center gap-1 text-sm ${
                    darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <i className="fas fa-reply"></i>
                  <span>Reply</span>
                </button>
              </div>

              {replyTo === comment.id && (
                <form onSubmit={(e) => handleReplySubmit(comment.id, e)} className="mt-4 ml-14">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your academic reply..."
                    className={`w-full p-3 rounded-lg mb-2 min-h-24 focus:outline-none focus:ring-2 ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-white focus:border-gray-500' 
                        : 'bg-white border-gray-300 text-gray-700 focus:border-gray-400'
                    }`}
                    style={{ '--tw-ring-color': primaryColor }}
                  ></textarea>
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setReplyTo(null)}
                      className={`px-4 py-1 border rounded-lg ${
                        darkMode 
                          ? 'border-gray-600 hover:bg-gray-700' 
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-1 text-white rounded-lg hover:opacity-90"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Post Reply
                    </button>
                  </div>
                </form>
              )}

              {comment.replies.length > 0 && (
                <div className={`mt-6 ml-14 pl-6 border-l-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  {comment.replies.map(reply => (
                    <div key={reply.id} className={`py-4 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className="flex items-start gap-4 mb-2">
                        <img 
                          src={reply.author.avatar_url || 'https://randomuser.me/api/portraits/women/44.jpg'} 
                          alt={reply.author.username} 
                          className="w-8 h-8 rounded-full object-cover" 
                        />
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {reply.author.username}
                            </h4>
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {reply.date}
                            </span>
                            {user && (user.username === reply.author.username || user.role === 'admin') && (
                              <button 
                                onClick={() => handleDeleteComment(comment.id, true, reply.id)}
                                className="text-red-500 text-xs hover:text-red-700 ml-auto"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {reply.content}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 ml-12">
                        <button 
                          onClick={() => handleLike(comment.id, true, reply.id)}
                          className={`flex items-center gap-1 text-xs ${
                            darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <i className="fas fa-thumbs-up"></i>
                          <span>Like ({reply.likes || 0})</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default CommentSection;