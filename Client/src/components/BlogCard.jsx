import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const BlogCard = ({ image, category, title, date, readTime }) => {
  const { primaryColor, darkMode } = useTheme();

  return (
    <Link to="/inside-blog" className="group">
      <div className={`flex gap-4 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} group-hover:opacity-90 transition-opacity`}>
        <div className={`w-20 h-20 min-w-20 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-md overflow-hidden`}>
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex-1">
          <span className="uppercase text-xs font-semibold tracking-wider" style={{ color: primaryColor }}>
            {category}
          </span>
          <h3 className={`text-sm font-medium leading-snug mt-1 group-hover:opacity-80 transition-colors ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {title}
          </h3>
          <div className={`flex justify-between text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <span>{date}</span>
            <span>{readTime}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;