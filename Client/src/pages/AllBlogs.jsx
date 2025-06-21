import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AllBlogs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const showAllArticles = location.state?.showAllArticles || false;
  
  const [currentView, setCurrentView] = useState(showAllArticles ? 'community' : 'recommendations');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeScienceFilter, setActiveScienceFilter] = useState('all');

  // Handle view toggle
  const handleSeeAllArticles = () => {
    navigate('/all-blogs', { 
      state: { showAllArticles: !showAllArticles },
      replace: true
    });
  };

  // Community blog posts data
  const communityPosts = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      category: 'physics',
      title: '$20 million gift supports theoretical physics research and education at MIT',
      excerpt: 'Gift from the Leinweber Foundation, in addition to a $5 million commitment from the School of Science, will drive discovery, collaboration, and the next generation of physics leaders.',
      date: 'May 15, 2025',
      readTime: '5 min read'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      category: 'mathematics',
      title: 'New algorithm revolutionizes complex calculations',
      excerpt: 'The breakthrough computational method could dramatically speed up simulations in fields ranging from climate modeling to financial forecasting.',
      date: 'May 12, 2025',
      readTime: '4 min read'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      category: 'scholarships',
      title: 'Global scholarship program expands to 10 new countries',
      excerpt: 'The initiative will provide full tuition and living expenses for outstanding students from developing nations to pursue graduate studies.',
      date: 'May 10, 2025',
      readTime: '6 min read'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1576091160550-2173dbe999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      category: 'social-impact',
      title: 'Community outreach programs show measurable impact',
      excerpt: 'New study demonstrates significant improvements in educational outcomes and economic mobility in neighborhoods with intensive programs.',
      date: 'May 8, 2025',
      readTime: '7 min read'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a9b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      category: 'medical',
      title: 'Breakthrough in cancer immunotherapy research',
      excerpt: 'New approach shows 80% response rate in early clinical trials for previously untreatable forms of cancer.',
      date: 'May 5, 2025',
      readTime: '8 min read'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      category: 'open-access',
      title: 'Major universities adopt open-access publishing mandate',
      excerpt: 'New policy requires all faculty research to be published in open-access journals or repositories.',
      date: 'May 3, 2025',
      readTime: '5 min read'
    }
  ];

  // Recommendation posts data
  const recommendationPosts = [
    {
      id: 1,
      category: 'computer-science',
      title: 'Advanced Quantum Algorithms for Optimization Problems',
      excerpt: 'New approaches leveraging quantum properties to solve NP-hard problems with unprecedented efficiency, potentially revolutionizing logistics and scheduling systems.',
      author: 'Prof. Michael Chen',
      authorImage: 'https://randomuser.me/api/portraits/men/32.jpg',
      date: 'Jun 15, 2025',
      readTime: '8 min read'
    },
    {
      id: 2,
      category: 'physics',
      title: 'Breakthrough in High-Temperature Superconductivity',
      excerpt: 'Experimental results showing stable superconductivity at temperatures previously thought impossible, with implications for energy transmission and storage.',
      author: 'Dr. Sarah Johnson',
      authorImage: 'https://randomuser.me/api/portraits/women/44.jpg',
      date: 'Jun 12, 2025',
      readTime: '6 min read'
    },
    {
      id: 3,
      category: 'biotech',
      title: 'CRISPR-Based Gene Drives for Disease Control',
      excerpt: 'Ethical and technical considerations of using gene drive systems to combat mosquito-borne illnesses in vulnerable populations.',
      author: 'Dr. Emily Rodriguez',
      authorImage: 'https://randomuser.me/api/portraits/women/68.jpg',
      date: 'Jun 10, 2025',
      readTime: '10 min read'
    },
    {
      id: 4,
      category: 'data-science',
      title: 'Federated Learning for Privacy-Preserving AI',
      excerpt: 'New frameworks that enable machine learning model training across decentralized devices while maintaining data privacy standards.',
      author: 'Prof. James Wilson',
      authorImage: 'https://randomuser.me/api/portraits/men/75.jpg',
      date: 'Jun 8, 2025',
      readTime: '7 min read'
    }
  ];

  // Job opportunities data
  const jobOpportunities = [
    {
      id: 1,
      title: 'Senior Frontend Developer (React)',
      company: 'LinkedIn',
      location: 'Remote',
      type: 'Full-time',
      recommender: 'Mahbuba Afrin Meghla',
      recommenderTitle: 'CS Department Chair'
    },
    {
      id: 2,
      title: 'Machine Learning Researcher',
      company: 'Google AI',
      location: 'New York',
      type: 'PhD Required',
      recommender: 'Mohmina Richi',
      recommenderTitle: 'AI Research Lab'
    },
    {
      id: 3,
      title: 'Data Science Intern',
      company: 'Microsoft Research',
      location: 'Redmond',
      type: 'Summer 2025',
      recommender: 'Ayesha Siddika Juthi',
      recommenderTitle: 'Data Science Institute'
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      company: 'Amazon Web Services',
      location: 'Remote',
      type: 'Contract',
      recommender: 'Abdul Hakim',
      recommenderTitle: 'Cloud Computing Center'
    }
  ];

  // Top contributors data
  const topContributors = [
    {
      id: 1,
      name: 'Ramisa Anan Rahman',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      blogs: '15 research blogs'
    },
    {
      id: 2,
      name: 'Ridika Naznin',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      blogs: '12 research blogs'
    },
    {
      id: 3,
      name: 'Afrin Jahan Era',
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      blogs: '9 research blogs'
    }
  ];

  // Filtered posts based on active filters
  const filteredCommunityPosts = activeCategory === 'all' 
    ? communityPosts 
    : communityPosts.filter(post => post.category === activeCategory);

  const filteredRecommendationPosts = activeScienceFilter === 'all' 
    ? recommendationPosts 
    : recommendationPosts.filter(post => post.category === activeScienceFilter);

  return (
    <div className="min-h-screen bg-white">
      <Navbar activePage="all-blogs" />
      
      <main className="container mx-auto px-20 py-20 pt-28">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">
                {showAllArticles ? 'Community Updates' : 'Recommended Research'}
              </h1>
              {showAllArticles && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentView('community')}
                    className={`px-3 py-1 rounded text-sm font-medium ${currentView === 'community' ? 'bg-teal-500 text-white' : 'bg-teal-100 text-teal-800'}`}
                  >
                    Community
                  </button>
                  <button
                    onClick={() => setCurrentView('recommendations')}
                    className={`px-3 py-1 rounded text-sm font-medium ${currentView === 'recommendations' ? 'bg-teal-500 text-white' : 'bg-teal-100 text-teal-800'}`}
                  >
                    Recommendations
                  </button>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder={showAllArticles ? "Search updates..." : "Search research..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
            {showAllArticles ? (
              <div className="flex flex-wrap gap-2 mb-6">
                {['all', 'physics', 'operations', 'scholarships', 'social-impact', 'medical', 'open-access'].map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm ${activeCategory === category ? 'bg-teal-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {category === 'all' ? 'All' : category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mb-6">
                {['all', 'computer-science', 'physics', 'biotech', 'engineering', 'mathematics', 'data-science'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveScienceFilter(filter)}
                    className={`px-3 py-1 rounded text-sm ${activeScienceFilter === filter ? 'bg-teal-500 text-white' : 'bg-teal-100 text-teal-800 hover:bg-teal-200'}`}
                  >
                    {filter === 'all' ? 'All' : filter.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            )}

            {/* Content Display */}
            {showAllArticles ? (
              <div className="space-y-8 mb-8">
                {filteredCommunityPosts
                  .filter(post => 
                    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(post => (
                    <Link to="/inside-blog" key={post.id} className="block">
                      <div className="flex flex-col md:flex-row gap-6 pb-6 border-b border-gray-200">
                        <div 
                          className="w-full md:w-48 h-40 bg-gray-200 rounded-lg bg-cover bg-center"
                          style={{ backgroundImage: `url(${post.image})` }}
                        ></div>
                        <div className="flex-1">
                          <span className="inline-block text-teal-500 text-xs font-semibold uppercase tracking-wider mb-2">
                            {post.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                          <h3 className="text-xl font-bold mb-2 hover:text-teal-600 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 mb-4">{post.excerpt}</p>
                          <div className="flex justify-between text-gray-500 text-sm">
                            <span>{post.date}</span>
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            ) : (
              <div className="space-y-6 mb-8">
                {filteredRecommendationPosts
                  .filter(post => 
                    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(post => (
                    <div key={post.id} className="pb-6 border-b border-gray-200">
                      <span className="inline-block text-teal-500 text-xs font-semibold uppercase tracking-wider mb-1">
                        {post.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                      <Link to="/inside-blog" className="block">
                        <h3 className="text-lg font-semibold mb-2 hover:text-teal-600 transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                      <div className="flex items-center text-gray-500 text-xs">
                        <div className="flex items-center mr-4">
                          <img 
                            src={post.authorImage} 
                            alt={post.author} 
                            className="w-5 h-5 rounded-full mr-2"
                          />
                          <Link to="/other-dashboard" className="hover:text-teal-600 transition-colors">
                            {post.author}
                          </Link>
                        </div>
                        <span className="mr-4">{post.date}</span>
                        <span className="ml-auto">{post.readTime}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center gap-1">
              <button className="w-10 h-10 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200">
                <i className="fas fa-chevron-left text-sm"></i>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded bg-teal-500 text-white">
                1
              </button>
              {[2, 3, 4].map(page => (
                <button 
                  key={page}
                  className="w-10 h-10 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200"
                >
                  {page}
                </button>
              ))}
              <span className="w-10 h-10 flex items-center justify-center">...</span>
              <button className="w-10 h-10 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200">
                10
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200">
                <i className="fas fa-chevron-right text-sm"></i>
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Job Recommendations */}
            <div className="bg-white p-4 rounded-lg border-l-4 border-teal-500">
              <h3 className="text-lg font-semibold text-teal-600 mb-4 flex items-center">
                <i className="fas fa-briefcase mr-2"></i>
                Career Opportunities
              </h3>
              <ul className="space-y-4">
                {jobOpportunities.map(job => (
                  <li key={job.id} className="pb-4 border-b border-gray-100 last:border-0">
                    <Link to="/inside-blog" className="block font-medium text-gray-800 hover:text-teal-600 mb-1">
                      {job.title}
                    </Link>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                      <span className="font-medium">{job.company}</span>
                      <span className="flex items-center">
                        <i className="fas fa-map-marker-alt text-xs mr-1"></i>
                        {job.location}
                      </span>
                      <span>{job.type}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="text-gray-400">Recommended by: </span>
                      <Link to="/other-dashboard" className="text-teal-600 hover:underline font-medium">
                        {job.recommender}
                      </Link>
                      <span className="text-gray-400"> ({job.recommenderTitle})</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="text-center mt-4">
                <button 
                  onClick={handleSeeAllArticles}
                  className="text-teal-600 font-semibold hover:underline"
                >
                  {showAllArticles ? 'Back to Recommendations' : 'See All Articles'}
                  <i className={`fas fa-chevron-${showAllArticles ? 'left' : 'right'} ml-1`}></i>
                </button>
              </div>
            </div>

            {/* More Articles (shown in recommendations view) */}
            {!showAllArticles && (
              <div className="bg-white p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-teal-600 mb-4 border-b border-gray-200 pb-2">
                  More Articles
                </h3>
                <div className="space-y-4">
                  {communityPosts.slice(0, 4).map(post => (
                    <Link to="/inside-blog" key={post.id} className="flex gap-3">
                      <div 
                        className="w-16 h-16 bg-gray-200 rounded bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: `url(${post.image})` }}
                      ></div>
                      <div>
                        <span className="block text-teal-500 text-xs font-semibold uppercase tracking-wider mb-1">
                          {post.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                        <h4 className="text-sm font-medium hover:text-teal-600 transition-colors">
                          {post.title}
                        </h4>
                        <div className="flex justify-between text-gray-500 text-xs mt-1">
                          <span>{post.date}</span>
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <button 
                    onClick={handleSeeAllArticles}
                    className="text-teal-600 font-semibold hover:underline"
                  >
                    See All Articles <i className="fas fa-chevron-right ml-1"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Top Contributors */}
            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-teal-600 mb-4 border-b border-gray-200 pb-2">
                Top Contributors
              </h3>
              <ul className="space-y-3">
                {topContributors.map(contributor => (
                  <li key={contributor.id} className="pb-3 border-b border-gray-100 last:border-0">
                    <Link to="/other-dashboard" className="flex items-center gap-3">
                      <img 
                        src={contributor.image} 
                        alt={contributor.name} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-medium hover:text-teal-600 transition-colors">
                          {contributor.name}
                        </h4>
                        <p className="text-teal-600 text-xs">{contributor.blogs}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="text-center mt-4">
                <Link to="/top-contributors" className="text-teal-600 font-semibold hover:underline">
                  See All Contributors <i className="fas fa-chevron-right ml-1"></i>
                </Link>
              </div>
            </div>

            {/* Search Users */}
            <div className="lg:w-80 space-y-8">
            <SearchForm/>
          </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AllBlogs;