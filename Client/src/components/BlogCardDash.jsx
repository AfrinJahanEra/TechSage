import { 
  getThumbnailUrl, 
  getContentPreview, 
  calculateReadTime, 
  formatDate 
} from '../utils/blogUtils.js';
import BlogLink from '../components/BlogLink.jsx';
import { useNavigate } from 'react-router-dom';

const BlogCardDash = ({ 
  blog, 
  darkMode, 
  onDelete,
  onPublish,
  onRestore,
  onPermanentDelete,
  onEdit, 
  onUnsave,
  showDelete = false,
  showPublish = false,
  showRestore = false,
  showPermanentDelete = false,
  showUpvotes = true,
  showEdit = false,
  showUnsave = false,
  showHistory = false // New prop to control History button visibility
}) => {
  const navigate = useNavigate();

  const handleHistory = () => {
    navigate(`/blogs/${blog.id}/history`);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <BlogLink blog={blog}>
        <div
          className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center cursor-pointer"
          style={{ backgroundImage: `url('${getThumbnailUrl(blog)}')` }}
        ></div>
      </BlogLink>
      <div>
        <BlogLink blog={blog}>
          <h3 className="text-lg font-semibold cursor-pointer hover:underline">{blog.title}</h3>
        </BlogLink>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {getContentPreview(blog.content)}
        </p>
        <div className={`flex justify-between text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <span>
            {blog.deleted_at 
              ? `Deleted on: ${formatDate(blog.deleted_at)}` 
              : blog.published_at 
                ? `Published on: ${formatDate(blog.published_at)}`
                : `Created on: ${formatDate(blog.created_at)}`
            }
          </span>
          <span>{calculateReadTime(blog.content)}</span>
        </div>
        <div className="flex space-x-4 mt-2">
          {showUpvotes && (
            <button 
              className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
              style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
            >
              <i className="fas fa-heart mr-1"></i> {blog.upvotes?.length || '0'}
            </button>
          )}
          
          {showDelete && (
            <button 
              onClick={() => onDelete(blog.id)}
              className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
              style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
            >
              <i className="fas fa-trash mr-1"></i> Delete
            </button>
          )}
          
          {showPublish && (
            <button 
              onClick={() => onPublish(blog.id)}
              className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
              style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
            >
              <i className="fas fa-share mr-1"></i> Publish
            </button>
          )}
          
          {showHistory && (
            <button 
              onClick={handleHistory}
              className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
              style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
            >
              <i className="fas fa-history mr-1"></i> History
            </button>
          )}
          
          {showRestore && (
            <button 
              onClick={() => onRestore(blog.id)}
              className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
              style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
            >
              <i className="fas fa-undo mr-1"></i> Restore
            </button>
          )}
          
          {showPermanentDelete && (
            <button 
              onClick={() => onPermanentDelete(blog.id)}
              className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
              style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
            >
              <i className="fas fa-trash-alt mr-1"></i> Delete Permanently
            </button>
          )}

          {showEdit && (
            <button 
              onClick={() => onEdit(blog)}
              className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
              style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
            >
              <i className="fas fa-edit mr-1"></i> Edit
            </button>
          )}

          {showUnsave && (
            <button 
              onClick={() => onUnsave(blog.id)}
              className={`flex items-center text-sm ${darkMode ? 'hover:text-[var(--primary-color)]' : 'hover:text-[var(--primary-dark)]'}`}
              style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
            >
              <i className="fas fa-bookmark mr-1"></i> Unsave
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogCardDash;