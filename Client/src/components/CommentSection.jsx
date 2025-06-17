import { useState } from 'react';

const CommentSection = () => {
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
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
    if (!comment.trim()) return;
    
    const newComment = {
      id: Date.now(),
      author: 'Current User',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
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
    if (!replyContent.trim()) return;
    
    const newReply = {
      id: Date.now(),
      author: 'Current User',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
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
    <section className="mt-16 border-t border-gray-200 pt-10">
      <h2 className="text-2xl font-bold mb-8 relative pb-2">
        Academic Discussion
        <span className="absolute bottom-0 left-0 w-16 h-1 bg-teal-500"></span>
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleCommentSubmit} className="mb-10">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Contribute to the academic discussion..."
          className="w-full p-4 border border-gray-300 rounded-lg mb-4 min-h-32 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        ></textarea>
        <button 
          type="submit" 
          className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors"
        >
          Post Comment
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-8 max-h-screen overflow-y-auto pr-4">
        {comments.map(comment => (
          <div key={comment.id} className="border-b border-gray-200 pb-8 last:border-0">
            <div className="flex items-start gap-4 mb-4">
              <img src={comment.avatar} alt={comment.author} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <div className="flex items-center gap-4">
                  <h4 className="font-semibold">{comment.author}</h4>
                  <span className="text-gray-500 text-sm">{comment.date}</span>
                  <button 
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-500 text-sm hover:text-red-700 ml-auto"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
                <p className="mt-1">{comment.content}</p>
              </div>
            </div>

            <div className="flex gap-6 ml-14">
              <button 
                onClick={() => handleLike(comment.id)}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm"
              >
                <i className="fas fa-thumbs-up"></i>
                <span>Like ({comment.likes})</span>
              </button>
              <button 
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm"
              >
                <i className="fas fa-reply"></i>
                <span>Reply</span>
              </button>
            </div>

            {/* Reply Form */}
            {replyTo === comment.id && (
              <form onSubmit={(e) => handleReplySubmit(comment.id, e)} className="mt-4 ml-14">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your academic reply..."
                  className="w-full p-3 border border-gray-300 rounded-lg mb-2 min-h-24 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                ></textarea>
                <div className="flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setReplyTo(null)}
                    className="px-4 py-1 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-teal-500 text-white px-4 py-1 rounded-lg hover:bg-teal-600"
                  >
                    Post Reply
                  </button>
                </div>
              </form>
            )}

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="mt-6 ml-14 pl-6 border-l-2 border-gray-200">
                {comment.replies.map(reply => (
                  <div key={reply.id} className="py-4 border-b border-gray-100 last:border-0">
                    <div className="flex items-start gap-4 mb-2">
                      <img src={reply.avatar} alt={reply.author} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-sm">{reply.author}</h4>
                          <span className="text-gray-500 text-xs">{reply.date}</span>
                        </div>
                        <p className="mt-1 text-sm">{reply.content}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 ml-12">
                      <button 
                        onClick={() => handleLike(comment.id, true, reply.id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-xs"
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