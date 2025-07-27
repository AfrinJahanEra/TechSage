// src/components/BlogCard.jsx
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { getThumbnailUrl, formatDate, calculateReadTime , getTitlePreview} from '../utils/blogUtils.js';

const BlogCard = ({ blog }) => {
  const { primaryColor, darkMode } = useTheme();

  return (
    <Link to={`/blog/${blog.id}`} className="group">
      <div className={`flex gap-4 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} group-hover:opacity-90 transition-opacity`}>
        <div className={`w-30 h-20 min-w-20 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-md overflow-hidden`}>
          <div 
            className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url('${getThumbnailUrl(blog)}')` }}
          ></div>
        </div>
        <div className="flex-1">
          <span className="uppercase text-xs font-semibold tracking-wider" style={{ color: primaryColor }}>
            {blog.categories?.[0] || 'Uncategorized'}
          </span>
          <h3 className={`text-sm font-medium leading-snug mt-1 group-hover:opacity-80 transition-colors ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {getTitlePreview(blog.title)}
          </h3>
          <div className={`flex justify-between text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <span>{formatDate(blog.published_at || blog.created_at)}</span>
            <span>{calculateReadTime(blog.content)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;