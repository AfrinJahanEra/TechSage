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
  showEdit = false,
  showUnsave = false,
  showHistory = false // New prop to control History button visibility
}) => {
  const navigate = useNavigate();

  const handleHistory = () => {
    navigate(`/blogs/${blog.id}/history`);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-md ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} border border-gray-200 dark:border-gray-700`}>
      <BlogLink blog={blog}>
        <div
          className="h-24 md:h-full rounded-lg bg-cover bg-center cursor-pointer transition-transform duration-300 hover:scale-105"
          style={{ backgroundImage: `url('${getThumbnailUrl(blog)}')`, backgroundColor: darkMode ? '#374151' : '#e5e7eb' }}
        ></div>
      </BlogLink>
      <div>
        <BlogLink blog={blog}>
          <h3 className={`text-lg font-semibold transition-colors duration-200 ${darkMode ? 'text-white' : 'text-gray-800'} cursor-pointer hover:text-[var(--primary-color)]`}>
            {blog.title}
          </h3>
        </BlogLink>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {getContentPreview(blog.content)}
        </p>
        <div className={`flex justify-between text-sm mt-1 transition-colors duration-200 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
        <div className="flex flex-wrap gap-2 mt-3">
          
          {showDelete && (
            <button 
              onClick={() => onDelete(blog.id)}
              className={`flex items-center text-sm px-3 py-1 rounded-full transition-all duration-200 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
            >
              <i className="fas fa-trash mr-1"></i> Trash
            </button>
          )}
          
          {showPublish && (
            <button 
              onClick={() => onPublish(blog.id)}
              className={`flex items-center text-sm px-3 py-1 rounded-full transition-all duration-200 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
            >
              <i className="fas fa-share mr-1"></i> Publish
            </button>
          )}
          
          {showHistory && (
            <button 
              onClick={handleHistory}
              className={`flex items-center text-sm px-3 py-1 rounded-full transition-all duration-200 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
            >
              <i className="fas fa-history mr-1"></i> History
            </button>
          )}
          
          {showRestore && (
            <button 
              onClick={() => onRestore(blog.id)}
              className={`flex items-center text-sm px-3 py-1 rounded-full transition-all duration-200 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
            >
              <i className="fas fa-undo mr-1"></i> Restore
            </button>
          )}
          
          {showPermanentDelete && (
            <button 
              onClick={() => onPermanentDelete(blog.id)}
              className={`flex items-center text-sm px-3 py-1 rounded-full transition-all duration-200 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
            >
              <i className="fas fa-trash-alt mr-1"></i> Delete Permanently
            </button>
          )}

          {showEdit && (
            <button 
              onClick={() => onEdit(blog)}
              className={`flex items-center text-sm px-3 py-1 rounded-full transition-all duration-200 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              style={{ color: darkMode ? '#e2e8f0' : '#4a5568' }}
            >
              <i className="fas fa-edit mr-1"></i> Edit
            </button>
          )}

          {showUnsave && (
            <button 
              onClick={() => onUnsave(blog.id)}
              className={`flex items-center text-sm px-3 py-1 rounded-full transition-all duration-200 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
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