import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { Chart } from 'chart.js/auto';

const OtherDashboard = () => {
  const { primaryColor, darkMode, shadeColor } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [performanceChart, setPerformanceChart] = useState(null);

  // Generate color variants
  const primaryDark = shadeColor(primaryColor, -20);
  const primaryLight = shadeColor(primaryColor, 20);

  // Dynamic style variables for theme colors
  const themeStyles = {
    '--primary-color': primaryColor,
    '--primary-dark': primaryDark,
    '--primary-light': primaryLight,
  };

  // Initialize chart when component mounts
  useEffect(() => {
        const ctx = document.getElementById('performanceChart');
        if (ctx) {
            const performanceChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Blog Views',
                        data: [1200, 1900, 1500, 2200, 1800, 2500],
                        borderColor: primaryColor,
                        backgroundColor: darkMode 
                            ? `${primaryColor}20` // 20% opacity
                            : `${primaryColor}10`, // 10% opacity
                        tension: 0.3,
                        fill: true
                    }, {
                        label: 'Engagement Rate',
                        data: [65, 59, 70, 72, 75, 78],
                        borderColor: primaryDark,
                        backgroundColor: darkMode 
                            ? `${primaryDark}20` 
                            : `${primaryDark}10`,
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: false,
                            grid: {
                                color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                color: darkMode ? '#e2e8f0' : '#4a5568'
                            }
                        },
                        x: {
                            grid: {
                                color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            },
                            ticks: {
                                color: darkMode ? '#e2e8f0' : '#4a5568'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: darkMode ? '#e2e8f0' : '#4a5568'
                            }
                        }
                    }
                }
            });

            return () => {
                performanceChart.destroy();
            };
        }
    }, [darkMode, primaryColor, primaryDark]);

  const publications = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      title: 'Quantum Computing Breakthroughs in Error Correction',
      date: 'May 15, 2025',
      readTime: '5 min read',
      views: 1200,
      likes: 124
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      title: 'New Algorithm Revolutionizes Complex Quantum Calculations',
      date: 'June 10, 2025',
      readTime: '4 min read',
      views: 980,
      likes: 85
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      title: 'Global Quantum Research Scholarship Program Expands',
      date: 'June 8, 2025',
      readTime: '6 min read',
      views: 1500,
      likes: 210
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
      title: 'Community Outreach Programs Show Impact on STEM Education',
      date: 'June 5, 2025',
      readTime: '7 min read',
      views: 890,
      likes: 76
    }
  ];

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}
      style={themeStyles}
    >
      <Navbar activePage="dashboard" />
      
      <main className={`container mx-auto px-4 py-8 pt-28 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Section */}
            <div id="profile" className={activeSection === 'profile' ? 'block' : 'hidden'}>
              <h1 className={`text-3xl font-bold mb-6 relative pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                Academic Profile
                <span className="absolute bottom-0 left-0 w-16 h-1" style={{ backgroundColor: primaryColor }}></span>
              </h1>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* User Info Card */}
                <div className={`rounded-lg p-6 shadow-sm border-l-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`} style={{ borderLeftColor: primaryColor }}>
                  <div className="flex items-center mb-6">
                    <div 
                      className="w-20 h-20 rounded-full border-4 overflow-hidden cursor-pointer"
                      style={{ 
                        backgroundColor: darkMode ? 'rgb(31, 41, 55)' : 'white',
                        borderColor: primaryColor
                      }}
                      onClick={() => window.location.href = '/other-dashboard'}
                    >
                      <img 
                        src="https://randomuser.me/api/portraits/women/44.jpg" 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <h2 
                        className="text-2xl font-bold cursor-pointer"
                        onClick={() => window.location.href = '/other-dashboard'}
                      >
                        Afrin Jahan Era
                      </h2>
                      <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Professor of Quantum Physics</p>
                      <div className="flex gap-2">
                        <span className="text-white px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: primaryColor }}>
                          MIT Faculty
                        </span>
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className={`text-lg font-semibold mb-4 pb-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>Academic Profile</h3>
                    <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Professor of Quantum Physics at MIT with over 15 years of research experience in quantum error correction
                      and quantum algorithms. Published 78 peer-reviewed papers in top-tier journals. Currently leading research
                      on topological quantum computing approaches with NSF funding.
                    </p>
                    <div className="flex gap-6">
                      <Link to="#" className="flex items-center" style={{ color: primaryColor }}>
                        <i className="fas fa-envelope mr-2"></i> Contact
                      </Link>
                      <Link to="#" className="flex items-center" style={{ color: primaryColor }}>
                        <i className="fas fa-share-alt mr-2"></i> Share Profile
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: '24', label: 'Research Publications' },
                    { value: '1.2K', label: 'Academic Followers' },
                    { value: '4.7', label: 'Avg. Citation Score' },
                    { value: '78%', label: 'Engagement Rate' }
                  ].map((stat, index) => (
                    <div 
                      key={index} 
                      className={`rounded-lg p-5 text-center shadow-sm border-t-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                      style={{ borderTopColor: primaryColor }}
                    >
                      <div className="text-3xl font-bold mb-2" style={{ color: primaryColor }}>{stat.value}</div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Chart */}
              <div className={`rounded-lg p-5 shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} style={{ height: '300px' }}>
                <canvas id="performanceChart"></canvas>
              </div>

              {/* Recent Publications */}
              <div className="mb-8">
                <h2 className={`text-3xl font-bold mb-6 relative pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  Recent Research Publications
                  <span className="absolute bottom-0 left-0 w-16 h-1" style={{ backgroundColor: primaryColor }}></span>
                </h2>
                
                <div className="space-y-6 mb-6">
                  {publications.slice(0, 3).map(pub => (
                    <div 
                      key={pub.id} 
                      className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-5 pb-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} cursor-pointer`}
                      onClick={() => window.location.href = '/inside-blog'}
                    >
                      <div 
                        className={`h-24 md:h-full rounded-md bg-cover bg-center ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                        style={{ backgroundImage: `url(${pub.image})` }}
                      ></div>
                      <div>
                        <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{pub.title}</h3>
                        <div className={`flex justify-between text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span>{pub.date}</span>
                          <span>{pub.readTime}</span>
                        </div>
                        <div className="flex gap-4">
                          <span className={`text-sm flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <i className="fas fa-eye mr-1"></i> {pub.views.toLocaleString()}
                          </span>
                          <span className={`text-sm flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <i className="fas fa-heart mr-1"></i> {pub.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setActiveSection('blogs')}
                  className="text-white px-6 py-2 rounded-md transition-colors hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  View All Publications
                </button>
              </div>
            </div>

            {/* Publications Section */}
            <div id="blogs" className={activeSection === 'blogs' ? 'block' : 'hidden'}>
              <h1 className={`text-3xl font-bold mb-6 relative pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                Research Publications
                <span className="absolute bottom-0 left-0 w-16 h-1" style={{ backgroundColor: primaryColor }}></span>
              </h1>

              {/* Filter Options */}
              <div className={`flex flex-wrap gap-4 mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex items-center">
                  <input type="radio" id="all" name="filter" className="mr-2" defaultChecked />
                  <label htmlFor="all">All</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="popular" name="filter" className="mr-2" />
                  <label htmlFor="popular">Most Cited</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="newest" name="filter" className="mr-2" />
                  <label htmlFor="newest">Newest</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="oldest" name="filter" className="mr-2" />
                  <label htmlFor="oldest">Oldest</label>
                </div>
              </div>

              {/* Publications List */}
              <div className="space-y-6 mb-6">
                {publications.map(pub => (
                  <div 
                    key={pub.id} 
                    className={`grid grid-cols-1 md:grid-cols-[150px_1fr] gap-5 pb-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} cursor-pointer`}
                    onClick={() => window.location.href = '/inside-blog'}
                  >
                    <div 
                      className={`h-24 md:h-full rounded-md bg-cover bg-center ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                      style={{ backgroundImage: `url(${pub.image})` }}
                    ></div>
                    <div>
                      <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{pub.title}</h3>
                      <div className={`flex justify-between text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span>{pub.date}</span>
                        <span>{pub.readTime}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className={`text-sm flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <i className="fas fa-eye mr-1"></i> {pub.views.toLocaleString()}
                        </span>
                        <span className={`text-sm flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <i className="fas fa-heart mr-1"></i> {pub.likes}
                        </span>
                        <button className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'} ml-auto`}>
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setActiveSection('profile')}
                className="text-white px-6 py-2 rounded-md transition-colors hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                Back to Profile
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            <Sidebar />
          </div>
        </div>
      </main>

      {/* Latest Research Section */}
      <section className={`py-16 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold mb-4 relative pb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            Latest Research
            <span className="absolute bottom-0 left-0 w-16 h-1" style={{ backgroundColor: primaryColor }}></span>
          </h2>
          <p className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Explore the latest academic publications from our community
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
                title: 'Quantum Computing Breakthroughs'
              },
              {
                image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
                title: 'Sustainable Energy Solutions'
              },
              {
                image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
                title: 'AI in Healthcare Innovations'
              },
              {
                image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80',
                title: 'Advanced Robotics Systems'
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="relative h-48 rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => window.location.href = '/inside-blog'}
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <h3 className="absolute bottom-0 left-0 w-full p-4 text-white text-lg font-semibold translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OtherDashboard;