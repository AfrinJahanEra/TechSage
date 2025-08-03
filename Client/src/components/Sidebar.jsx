// src/components/Sidebar.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from './BlogCard';
import ContributorCard from './ContributorCard';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';


const Sidebar = ({ type = 'default', currentBlogId = null }) => {
  const [showJobs, setShowJobs] = useState(false);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [newestBlogs, setNewestBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { primaryColor, darkMode } = useTheme();
  const { api } = useAuth();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);

        const newestResponse = await api.get('/published-blogs/?limit=5&sort=-published_at');
        setNewestBlogs(newestResponse.data.blogs || []);
        
  
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
            

            const featuredResponse = await api.get(
              `/published-blogs/?category=${currentCategories[0]}&limit=5&sort=-published_at`
            );
            setFeaturedBlogs(
              featuredResponse.data.blogs || []
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

  

  const jobOpportunities = [
    {
      id: 1,
      title: 'Research Scientist - Quantum Computing',
      company: 'TechSage Labs',
      location: 'San Francisco, CA',
      description: 'Lead research in quantum algorithms and error correction techniques.',
      posted: '2 days ago'
    },
    {
      id: 2,
      title: 'Machine Learning Engineer',
      company: 'AI Research Institute',
      location: 'Remote',
      description: 'Develop novel ML models for scientific applications.',
      posted: '1 week ago'
    },
    {
      id: 3,
      title: 'Biotechnology Researcher',
      company: 'BioTech Innovations',
      location: 'Boston, MA',
      description: 'CRISPR-based gene editing research position.',
      posted: '3 days ago'
    }
  ];

  return (
    <aside className="w-full md:max-w-xs space-y-8">
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
              {showJobs ? (
                <div className="space-y-4">
                  <h3 
                    className="uppercase text-sm font-semibold tracking-wider border-b pb-2"
                    style={{ color: primaryColor, borderColor: darkMode ? '#374151' : '#e5e7eb' }}
                  >
                    Job Opportunities
                  </h3>
                  <div className="space-y-4">
                    {jobOpportunities.map(job => (
                      <div 
                        key={job.id} 
                        className={`border rounded-md p-4 hover:border-opacity-80 transition-colors ${
                          darkMode 
                            ? 'border-gray-700 hover:border-gray-600 bg-gray-800' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        style={{ borderColor: primaryColor }}
                      >
                        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{job.title}</h4>
                        <p className="text-sm" style={{ color: primaryColor }}>{job.company}</p>
                        <p className={`text-sm flex items-center mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <i className="fas fa-map-marker-alt mr-1"></i> {job.location}
                        </p>
                        <p className={`text-sm mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{job.description}</p>
                        <div className="flex justify-between items-center mt-3">
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{job.posted}</span>
                          <button 
                            className="text-xs py-1 px-3 rounded hover:opacity-90 transition-colors text-white"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          )}
        </>
      )}
    </aside>
  );
};

export default Sidebar;