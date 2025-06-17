import { Link } from 'react-router-dom';

const BlogCard = ({ image, category, title, date, readTime }) => {
  return (
    <Link to="/inside-blog" className="group">
      <div className="flex gap-4 pb-4 border-b border-gray-200 group-hover:opacity-90 transition-opacity">
        <div className="w-20 h-20 min-w-20 bg-gray-200 rounded-md overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex-1">
          <span className="text-teal-500 text-xs font-semibold uppercase tracking-wider">{category}</span>
          <h3 className="text-sm font-medium leading-snug mt-1 group-hover:text-teal-600 transition-colors">
            {title}
          </h3>
          <div className="flex justify-between text-gray-500 text-xs mt-2">
            <span>{date}</span>
            <span>{readTime}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;