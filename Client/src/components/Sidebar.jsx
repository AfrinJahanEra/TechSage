// src/components/Sidebar.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from './BlogCard';
import ContributorCard from './ContributorCard';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';


const Sidebar = ({ type = 'default', currentBlogId = null }) => {
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { primaryColor, darkMode } = useTheme();
  const { api } = useAuth();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);

        const recentResponse = await api.get('/published-blogs/?limit=5&sort=-published_at');
        setRecentBlogs(recentResponse.data.blogs || []);
        
        if (type === 'inside-blog' && currentBlogId) {
          const currentBlogResponse = await api.get(`/blogs/${currentBlogId}`);
          const currentCategories = currentBlogResponse.data.categories || [];
          
          if (currentCategories.length > 0) {
            const relatedResponse = await api.get(
              `/published-blogs/?category=${currentCategories[0]}&limit=4`
            );
            setRelatedBlogs(
              (relatedResponse.data.blogs || [])
                .filter(blog => blog.id !== currentBlogId)
                .slice(0, 3)
            );
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [type, currentBlogId, api]);

  return (
    // Made the sidebar wider by changing max-w-xs to max-w-sm
    <aside className="w-full md:max-w-sm space-y-8">
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: primaryColor }}></div>
        </div>
      ) : (
        <>
          {type === 'inside-blog' && (
            <div className="space-y-8">
              {relatedBlogs.length > 0 && (
                <div className="space-y-4">
                  <h3 
                    className="uppercase text-sm font-semibold tracking-wider border-b pb-2"
                    style={{ color: primaryColor, borderColor: darkMode ? '#374151' : '#e5e7eb' }}
                  >
                    Related Research
                  </h3>
                  <div className="space-y-4">
                    {relatedBlogs.map(blog => (
                      <BlogCard key={blog.id} blog={blog} />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 
                  className="uppercase text-sm font-semibold tracking-wider border-b pb-2"
                  style={{ color: primaryColor, borderColor: darkMode ? '#374151' : '#e5e7eb' }}
                >
                  Recent Studies
                </h3>
                <div className="space-y-4">
                  {recentBlogs
                    .filter(blog => blog.id !== currentBlogId)
                    .slice(0, 2)
                    .map(blog => (
                      <BlogCard key={`recent-${blog.id}`} blog={blog} />
                    ))}
                </div>
              </div>
            </div>
          )}

          {type !== 'inside-blog' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 
                  className="uppercase text-sm font-semibold tracking-wider border-b pb-2"
                  style={{ color: primaryColor, borderColor: darkMode ? '#374151' : '#e5e7eb' }}
                >
                  Recent Publications
                </h3>
                <div className="space-y-4">
                  {recentBlogs.map(blog => (
                    <BlogCard key={blog.id} blog={blog} />
                  ))}
                </div>
                <div className="text-center">
                  <Link 
                    to="/all-blogs" 
                    className="font-semibold hover:underline"
                    style={{ color: primaryColor }}
                  >
                    View All Publications →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </aside>
  );
};

export default Sidebar;