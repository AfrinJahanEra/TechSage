import { useState } from 'react';
import { Link } from 'react-router-dom';
import BlogCard from './BlogCard';
import ContributorCard from './ContributorCard';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ type = 'default' }) => {
  const [showJobs, setShowJobs] = useState(false);
  const { primaryColor, darkMode } = useTheme();

  const recentPublications = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      category: 'Physics',
      title: 'New discoveries in dark matter research',
      date: 'June 12, 2025',
      readTime: '8 min read'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      category: 'Mathematics',
      title: 'Proof of the Riemann Hypothesis',
      date: 'June 10, 2025',
      readTime: '12 min read'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      category: 'Biology',
      title: 'CRISPR gene editing breakthrough',
      date: 'June 8, 2025',
      readTime: '10 min read'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1576091160550-2173dbe999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      category: 'Chemistry',
      title: 'New catalyst for carbon capture',
      date: 'June 5, 2025',
      readTime: '7 min read'
    }
  ];

  const topContributors = [
    {
      id: 1,
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      name: 'Ramisa Anan Rahman',
      blogs: '15 research blogs'
    },
    {
      id: 2,
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      name: 'Ridika Naznin',
      blogs: '12 research blogs'
    },
    {
      id: 3,
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      name: 'Afrin Jahan Era',
      blogs: '9 research blogs'
    }
  ];

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
      {type === 'inside-blog' && (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 
              className="uppercase text-sm font-semibold tracking-wider border-b pb-2"
              style={{ color: primaryColor, borderColor: darkMode ? '#374151' : '#e5e7eb' }}
            >
              Related Research
            </h3>
            <div className="space-y-4">
              {recentPublications.map(publication => (
                <BlogCard key={publication.id} {...publication} />
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

          <div className="space-y-4">
            <h3 
              className="uppercase text-sm font-semibold tracking-wider border-b pb-2"
              style={{ color: primaryColor, borderColor: darkMode ? '#374151' : '#e5e7eb' }}
            >
              Related Studies
            </h3>
            <div className="space-y-4">
              {recentPublications.slice(0, 2).map(publication => (
                <BlogCard key={`related-${publication.id}`} {...publication} />
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
                {recentPublications.map(publication => (
                  <BlogCard key={publication.id} {...publication} />
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

      <div className="space-y-4">
        <h3 className="text-teal-700 uppercase text-sm font-semibold tracking-wider border-b border-gray-200 pb-2" style={{ color: primaryColor, borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
          Top Contributors
        </h3>
        <div className="space-y-4">
          {topContributors.map(contributor => (
            <ContributorCard key={contributor.id} {...contributor} />
          ))}
        </div>
        <div className="text-center" >
          <Link 
            to="/top-contributors" 
            className="text-teal-500 font-semibold hover:underline"
            style={{ color: primaryColor, borderColor: darkMode ? '#374151' : '#e5e7eb' }}
          >
            See All Contributors →
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;