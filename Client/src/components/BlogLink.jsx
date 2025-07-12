// src/components/BlogLink.jsx
import { Link } from 'react-router-dom';
import { normalizeBlog } from '../utils/blogUtils';

const BlogLink = ({ blog, children }) => {
  const normalizedBlog = normalizeBlog(blog);
  
  return (
    <Link 
      to={{
        pathname: `/blog/${normalizedBlog.id}`,
        state: { 
          blog: normalizedBlog,
          fromRelated: true
        }
      }}
    >
      {children}
    </Link>
  );
};

export default BlogLink;