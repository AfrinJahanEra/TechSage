import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext';

const CommentSection = () => {
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const { user } = useContext(AuthContext);
  const { primaryColor, darkMode } = useTheme();
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Dr. Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
      date: '2 days ago',
      content: 'This is fascinating research! How does this compare to the surface code approach that Google and IBM have been pursuing in their recent publications? Are there any methodological trade-offs in terms of research validity?',
      likes: 12,
      replies: [
        {
          id: 11,
          author: 'Dr. Robert Chen',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          date: '1 day ago',
          content: 'Excellent question, Dr. Johnson. Compared to surface codes documented in recent literature, our approach requires fewer physical qubits per logical qubit (about 10x reduction based on our peer-reviewed findings), but currently has slightly slower gate operations (about 2x slower). We\'re working on optimizing this trade-off in our ongoing research.',
          likes: 24
        },
        {
          id: 12,
          author: 'Prof. Michael Tan',
          avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
          date: '20 hours ago',
          content: 'To add to Dr. Chen\'s response, the topological protection also means the system is more robust against certain types of noise that plague surface code implementations, as documented in our 2024 paper in the Journal of Social Innovation. This could be significant for near-term research applications.',
          likes: 8
        }
      ]
    },
    {
      id: 2,
      author: 'Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
      date: '2 days ago',
      content: 'Congratulations on this significant contribution to the literature! When do you anticipate publishing the full research methodology? Are there any academic institutions you\'re collaborating with to validate these findings?',
      likes: 5,
      replies: []
    }
  ]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to comment');
      return;
    }
    if (!comment.trim()) return;
    
    const newComment = {
      id: Date.now(),
      author: user.name,
      avatar: user.avatar || 'https://randomuser.me/api/portraits/women/44.jpg',
      date: 'Just now',
      content: comment,
      likes: 0,
      replies: []
    };
    
    setComments([...comments, newComment]);
    setComment('');
  };

  const handleReplySubmit = (commentId, e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to reply');
      return;
    }
    if (!replyContent.trim()) return;
    
    const newReply = {
      id: Date.now(),
      author: user.name,
      avatar: user.avatar || 'https://randomuser.me/api/portraits/women/44.jpg',
      date: 'Just now',
      content: replyContent,
      likes: 0
    };
    
    setComments(comments.map(c => 
      c.id === commentId 
        ? { ...c, replies: [...c.replies, newReply] } 
        : c
    ));
    
    setReplyContent('');
    setReplyTo(null);
  };

  const handleLike = (commentId, isReply = false, replyId = null) => {
    if (!user) {
      alert('Please login to like comments');
      return;
    }

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
  };

  const handleDeleteComment = (commentId, isReply = false, replyId = null) => {
    if (!user) {
      alert('Please login to delete comments');
      return;
    }
    
    if (confirm('Are you sure you want to delete this comment?')) {
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
    }
  };

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
        {comments.map(comment => (
          <div key={comment.id} className={`pb-8 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-start gap-4 mb-4">
              <img src={comment.avatar} alt={comment.author} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <div className="flex items-center gap-4">
                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{comment.author}</h4>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{comment.date}</span>
                  {user && (
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-500 text-sm hover:text-red-700 ml-auto"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>
                <p className={`mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{comment.content}</p>
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
                <span>Like ({comment.likes})</span>
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
                      <img src={reply.avatar} alt={reply.author} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{reply.author}</h4>
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{reply.date}</span>
                          {user && (
                            <button 
                              onClick={() => handleDeleteComment(comment.id, true, reply.id)}
                              className="text-red-500 text-xs hover:text-red-700 ml-auto"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{reply.content}</p>
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
                        <span>Like ({reply.likes})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CommentSection;