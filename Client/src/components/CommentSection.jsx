import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import { FaThumbsUp, FaReply, FaTrash, FaSpinner } from 'react-icons/fa';
import avatar from '../../src/assets/user.jpg';

const CommentSection = ({ blogId }) => {
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const { user, api } = useContext(AuthContext);
  const { primaryColor, darkMode } = useTheme();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const socket = useRef(null);

  const generateKey = useCallback((comment) => {
    return `${comment.id}-${new Date(comment.created_at).getTime()}`;
  }, []);

  const formatDate = useCallback((dateString) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  }, []);

  const organizeComments = useCallback((commentsData) => {
    const commentMap = {};
    const rootComments = [];
    
    commentsData.forEach(comment => {
      commentMap[comment.id] = {
        ...comment,
        replies: [],
        date: formatDate(comment.created_at),
        key: generateKey(comment)
      };
    });
    
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
  }, [formatDate, generateKey]);

  const handleNewComment = useCallback((comment, isFromCurrentUser = false) => {
    setComments(prev => {
      const formattedComment = {
        ...comment,
        date: formatDate(comment.created_at),
        replies: [],
        key: generateKey(comment)
      };

      const exists = prev.some(c => c.id === comment.id) || 
                   prev.some(c => c.replies.some(r => r.id === comment.id));
      
      if (exists) return prev;

      if (isFromCurrentUser) {
        if (comment.parent) {
          return prev.map(c => 
            c.id === comment.parent 
              ? { 
                  ...c, 
                  replies: [
                    ...c.replies.filter(r => !r.isOptimistic || r.author?.username !== user?.username),
                    formattedComment
                  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                } 
              : c
          );
        } else {
          return [
            formattedComment,
            ...prev.filter(c => !c.isOptimistic || c.author?.username !== user?.username)
          ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
      }
      
      if (comment.parent) {
        return prev.map(c => 
          c.id === comment.parent 
            ? { 
                ...c, 
                replies: [
                  ...c.replies.filter(r => r.id !== comment.id),
                  formattedComment
                ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              } 
            : c
        );
      } else {
        return [
          formattedComment,
          ...prev.filter(c => c.id !== comment.id)
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
    });
  }, [formatDate, generateKey, user]);

  const handleUpdatedComment = useCallback((updatedComment) => {
    setComments(prev => {
      if (updatedComment.parent) {
        return prev.map(c => 
          c.id === updatedComment.parent
            ? {
                ...c,
                replies: c.replies.map(r => 
                  r.id === updatedComment.id 
                    ? { ...r, likes: updatedComment.likes } 
                    : r
                )
              }
            : c
        );
      } else {
        return prev.map(c => 
          c.id === updatedComment.id 
            ? { ...c, likes: updatedComment.likes } 
            : c
        );
      }
    });
  }, []);

  const handleDeletedComment = useCallback((commentId, parentId) => {
    setComments(prev => {
      if (parentId) {
        return prev.map(c => 
          c.id === parentId
            ? { ...c, replies: c.replies.filter(r => r.id !== commentId) }
            : c
        );
      } else {
        return prev.filter(c => c.id !== commentId);
      }
    });
  }, []);

  const handleWebSocketMessage = useCallback((data) => {
    const isFromCurrentUser = data.comment?.author?.username === user?.username;
    
    switch (data.action) {
      case 'new_comment':
        handleNewComment(data.comment, isFromCurrentUser);
        break;
      case 'update_comment':
        handleUpdatedComment(data.comment);
        break;
      case 'delete_comment':
        handleDeletedComment(data.comment_id, data.parent_id);
        break;
      default:
        console.warn('Unknown WebSocket action:', data.action);
    }
  }, [handleNewComment, handleUpdatedComment, handleDeletedComment, user]);

  useEffect(() => {
    if (!blogId) return;

    const connectWebSocket = () => {
      const wsScheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      const backendUrl = new URL(import.meta.env.VITE_API_BASE_URL);
      const wsUrl = `${wsScheme}${backendUrl.host}/ws/comments/${blogId}/`;
      
      socket.current = new WebSocket(wsUrl);

      socket.current.onopen = () => {
        setSocketStatus('connected');
        console.log('WebSocket connected');
      };

      socket.current.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          handleWebSocketMessage(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      socket.current.onclose = () => {
        setSocketStatus('disconnected');
        console.log('WebSocket disconnected');
        setTimeout(connectWebSocket, 5000);
      };

      socket.current.onerror = (err) => {
        console.error('WebSocket error:', err);
        setSocketStatus('error');
      };
    };

    connectWebSocket();

    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/comments/blog/${blogId}`);
        organizeComments(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch comments');
        setLoading(false);
      }
    };

    fetchComments();

    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, [blogId, api, organizeComments, handleWebSocketMessage]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;
    
    setIsSubmitting(true);
    const tempId = `temp-${Date.now()}`;
    const commentContent = comment.trim();
    
    const optimisticComment = {
      id: tempId,
      author: { username: user.username, avatar_url: user.avatar },
      content: commentContent,
      date: 'Just now',
      likes: 0,
      replies: [],
      created_at: new Date().toISOString(),
      isOptimistic: true
    };
    
    setComments(prev => [optimisticComment, ...prev]);
    setComment('');
    
    try {
      if (socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({
          action: 'new_comment',
          blog_id: blogId,
          author: user.username,
          content: commentContent
        }));
      } else {
        const response = await api.post('/comments/post/', {
          blog_id: blogId,
          author: user.username,
          content: commentContent
        });
        setComments(prev => prev.map(c => 
          c.id === tempId ? { ...response.data, date: formatDate(response.data.created_at), replies: [] } : c
        ));
      }
    } catch (err) {
      setComments(prev => prev.filter(c => c.id !== tempId));
      alert('Failed to post comment: ' + (err.response?.data?.error || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (commentId, e) => {
    e.preventDefault();
    if (!user || !replyContent.trim()) return;
    
    setIsSubmitting(true);
    const tempId = `temp-reply-${Date.now()}`;
    const replyContentTrimmed = replyContent.trim();
    
    const optimisticReply = {
      id: tempId,
      author: { username: user.username, avatar_url: user.avatar },
      content: replyContentTrimmed,
      date: 'Just now',
      likes: 0,
      created_at: new Date().toISOString(),
      isOptimistic: true
    };
    
    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, replies: [...c.replies, optimisticReply] } 
        : c
    ));
    setReplyContent('');
    setReplyTo(null);
    
    try {
      if (socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({
          action: 'new_comment',
          blog_id: blogId,
          author: user.username,
          content: replyContentTrimmed,
          parent_id: commentId
        }));
      } else {
        const response = await api.post('/comments/post/', {
          blog_id: blogId,
          author: user.username,
          content: replyContentTrimmed,
          parent_id: commentId
        });
        setComments(prev => prev.map(c => 
          c.id === commentId
            ? { 
                ...c, 
                replies: c.replies.map(r => 
                  r.id === tempId ? { ...response.data, date: formatDate(response.data.created_at) } : r
                ) 
              }
            : c
        ));
      }
    } catch (err) {
      setComments(prev => prev.map(c => 
        c.id === commentId
          ? { ...c, replies: c.replies.filter(r => r.id !== tempId) }
          : c
      ));
      alert('Failed to post reply: ' + (err.response?.data?.error || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId, isReply = false, replyId = null) => {
    if (!user) {
      alert('Please login to like comments');
      return;
    }

    const targetId = isReply ? replyId : commentId;
    
    setComments(prev => {
      if (isReply) {
        return prev.map(c => 
          c.id === commentId
            ? {
                ...c,
                replies: c.replies.map(r => 
                  r.id === replyId
                    ? { ...r, likes: (r.likes || 0) + 1 }
                    : r
                )
              }
            : c
        );
      } else {
        return prev.map(c => 
          c.id === commentId
            ? { ...c, likes: (c.likes || 0) + 1 }
            : c
        );
      }
    });

    try {
      if (socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({
          action: 'like_comment',
          comment_id: targetId,
          username: user.username
        }));
      } else {
        await api.post(`/comments/${targetId}/like/`, {
          username: user.username
        });
      }
    } catch (err) {
      setComments(prev => {
        if (isReply) {
          return prev.map(c => 
            c.id === commentId
              ? {
                  ...c,
                  replies: c.replies.map(r => 
                    r.id === replyId
                      ? { ...r, likes: (r.likes || 0) - 1 }
                      : r
                  )
                }
              : c
          );
        } else {
          return prev.map(c => 
            c.id === commentId
              ? { ...c, likes: (c.likes || 0) - 1 }
              : c
          );
        }
      });
      alert('Failed to like comment: ' + (err.response?.data?.error || 'Server error'));
    }
  };

  const handleDeleteComment = async (commentId, isReply = false, replyId = null) => {
    if (!user || !confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    const targetId = isReply ? replyId : commentId;
    
    setComments(prev => {
      if (isReply) {
        return prev.map(c => 
          c.id === commentId
            ? { ...c, replies: c.replies.filter(r => r.id !== replyId) }
            : c
        );
      } else {
        return prev.filter(c => c.id !== commentId);
      }
    });

    try {
      if (socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({
          action: 'delete_comment',
          comment_id: targetId,
          username: user.username,
          parent_id: isReply ? commentId : null
        }));
      } else {
        await api.delete(`/comments/${targetId}/delete/`, {
          data: { username: user.username }
        });
      }
    } catch (err) {
      try {
        const response = await api.get(`/comments/blog/${blogId}`);
        organizeComments(response.data);
      } catch (fetchErr) {
        alert('Failed to restore comments after delete error');
      }
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center py-8 sm:py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <FaSpinner className="animate-spin text-xl sm:text-2xl mr-2" />
        <span className="text-sm sm:text-base">Loading comments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`py-6 sm:py-8 px-3 sm:px-4 rounded-lg text-center ${darkMode ? 'bg-gray-800 text-red-400' : 'bg-red-50 text-red-600'}`}>
        <p className="text-sm sm:text-base">Error loading comments: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className={`mt-4 px-3 sm:px-4 py-1 sm:py-2 rounded-lg text-sm sm:text-base ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className={`mt-12 sm:mt-16 border-t pt-8 sm:pt-10 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 className={`text-xl sm:text-2xl font-bold relative pb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Academic Discussion
          <span className="absolute bottom-0 left-0 w-12 sm:w-16 h-1" style={{ backgroundColor: primaryColor }}></span>
        </h2>
        <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {socketStatus === 'connected' ? (
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Live updates
            </span>
          ) : (
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
              Connecting...
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleCommentSubmit} className="mb-8 sm:mb-10">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={user ? "Contribute to the academic discussion..." : "Please login to comment"}
          className={`w-full p-3 sm:p-4 rounded-lg mb-4 min-h-24 sm:min-h-32 focus:outline-none focus:ring-2 text-sm sm:text-base ${
            darkMode 
              ? 'bg-gray-800 border-gray-600 text-white focus:border-gray-500' 
              : 'bg-white border-gray-300 text-gray-700 focus:border-gray-400'
          }`}
          style={{ '--tw-ring-color': primaryColor }}
          disabled={!user}
        />
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="px-4 sm:px-6 py-1 sm:py-2 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 flex items-center text-sm sm:text-base"
            style={{ backgroundColor: primaryColor }}
            disabled={!user || !comment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Posting...
              </>
            ) : 'Post Comment'}
          </button>
        </div>
      </form>

      <div className="space-y-6 sm:space-y-8 max-h-screen overflow-y-auto pr-3 sm:pr-4">
        {comments.length === 0 ? (
          <div className={`text-center py-8 sm:py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="text-base sm:text-lg mb-2">No comments yet</p>
            <p className="text-sm sm:text-base">Be the first to contribute to this academic discussion</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.key || comment.id} className={`pb-6 sm:pb-8 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <img 
                  src={comment.author.avatar_url || avatar} 
                  alt={comment.author.username} 
                  className="w-8 sm:w-10 h-8 sm:h-10 rounded-full object-cover flex-shrink-0" 
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                    <h4 className={`font-semibold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {comment.author.username}
                    </h4>
                    <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {comment.date}
                    </span>
                    {user && (user.username === comment.author.username || user.role === 'admin' || user.role === 'moderator') && (
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className={`text-xs sm:text-sm ml-auto ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                        title="Delete comment"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                  <p className={`mt-1 text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {comment.content}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 sm:gap-6 ml-10 sm:ml-14">
                <button 
                  onClick={() => handleLike(comment.id)}
                  className={`flex items-center gap-1 text-xs sm:text-sm ${
                    darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FaThumbsUp />
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
                  className={`flex items-center gap-1 text-xs sm:text-sm ${
                    darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FaReply />
                  <span>Reply</span>
                </button>
              </div>

              {replyTo === comment.id && (
                <form onSubmit={(e) => handleReplySubmit(comment.id, e)} className="mt-4 ml-10 sm:ml-14">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your academic reply..."
                    className={`w-full p-3 rounded-lg mb-2 min-h-20 sm:min-h-24 focus:outline-none focus:ring-2 text-sm sm:text-base ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-600 text-white focus:border-gray-500' 
                        : 'bg-white border-gray-300 text-gray-700 focus:border-gray-400'
                    }`}
                    style={{ '--tw-ring-color': primaryColor }}
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setReplyTo(null)}
                      className={`px-3 sm:px-4 py-1 border rounded-lg text-sm sm:text-base ${
                        darkMode 
                          ? 'border-gray-600 hover:bg-gray-700' 
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-3 sm:px-4 py-1 text-white rounded-lg hover:opacity-90 flex items-center text-sm sm:text-base"
                      style={{ backgroundColor: primaryColor }}
                      disabled={!replyContent.trim() || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Posting...
                        </>
                      ) : 'Post Reply'}
                    </button>
                  </div>
                </form>
              )}

              {comment.replies.length > 0 && (
                <div className={`mt-4 sm:mt-6 ml-10 sm:ml-14 pl-4 sm:pl-6 border-l-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  {comment.replies.map(reply => (
                    <div key={reply.key || reply.id} className={`py-3 sm:py-4 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className="flex items-start gap-3 sm:gap-4 mb-2">
                        <img 
                          src={reply.author.avatar_url || avatar} 
                          alt={reply.author.username} 
                          className="w-6 sm:w-8 h-6 sm:h-8 rounded-full object-cover flex-shrink-0" 
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <h4 className={`font-semibold text-xs sm:text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {reply.author.username}
                            </h4>
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {reply.date}
                            </span>
                            {user && (user.username === reply.author.username || user.role === 'admin' || user.role === 'moderator') && (
                              <button 
                                onClick={() => handleDeleteComment(comment.id, true, reply.id)}
                                className={`text-xs ml-auto ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
                                title="Delete reply"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                          <p className={`mt-1 text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {reply.content}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 sm:gap-4 ml-10 sm:ml-12">
                        <button 
                          onClick={() => handleLike(comment.id, true, reply.id)}
                          className={`flex items-center gap-1 text-xs ${
                            darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <FaThumbsUp className="text-xs" />
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