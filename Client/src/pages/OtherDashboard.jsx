import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { Chart } from 'chart.js/auto';

const OtherDashboard = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [performanceChart, setPerformanceChart] = useState(null);

  // Initialize chart when component mounts
  useState(() => {
    const ctx = document.getElementById('performanceChart');
    if (ctx) {
      const newChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Research Engagement',
            data: [65, 59, 80, 81, 76, 85],
            backgroundColor: 'rgba(26, 188, 156, 0.2)',
            borderColor: 'rgba(26, 188, 156, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      setPerformanceChart(newChart);
    }

    return () => {
      if (performanceChart) {
        performanceChart.destroy();
      }
    };
  }, []);

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
    <div className="min-h-screen bg-white">
      <Navbar activePage="dashboard" />
      
      <main className="container mx-auto px-4 py-8 pt-28">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Section */}
            <div id="profile" className={activeSection === 'profile' ? 'block' : 'hidden'}>
              <h1 className="text-3xl font-bold mb-6 relative pb-4 border-b border-gray-200">
                Academic Profile
                <span className="absolute bottom-0 left-0 w-16 h-1 bg-teal-500"></span>
              </h1>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* User Info Card */}
                <div className="bg-gray-50 rounded-lg p-6 shadow-sm border-l-4 border-teal-500">
                  <div className="flex items-center mb-6">
                    <div 
                      className="w-20 h-20 rounded-full bg-white border-4 border-teal-500 overflow-hidden cursor-pointer"
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
                      <p className="text-gray-600 mb-2">Professor of Quantum Physics</p>
                      <div className="flex gap-2">
                        <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          MIT Faculty
                        </span>
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">Academic Profile</h3>
                    <p className="text-gray-700 mb-6">
                      Professor of Quantum Physics at MIT with over 15 years of research experience in quantum error correction
                      and quantum algorithms. Published 78 peer-reviewed papers in top-tier journals. Currently leading research
                      on topological quantum computing approaches with NSF funding.
                    </p>
                    <div className="flex gap-6">
                      <Link to="#" className="text-teal-500 hover:text-teal-700 flex items-center">
                        <i className="fas fa-envelope mr-2"></i> Contact
                      </Link>
                      <Link to="#" className="text-teal-500 hover:text-teal-700 flex items-center">
                        <i className="fas fa-share-alt mr-2"></i> Share Profile
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-5 text-center shadow-sm border-t-4 border-teal-500">
                    <div className="text-3xl font-bold text-teal-500 mb-2">24</div>
                    <div className="text-gray-600 text-sm">Research Publications</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-5 text-center shadow-sm border-t-4 border-teal-500">
                    <div className="text-3xl font-bold text-teal-500 mb-2">1.2K</div>
                    <div className="text-gray-600 text-sm">Academic Followers</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-5 text-center shadow-sm border-t-4 border-teal-500">
                    <div className="text-3xl font-bold text-teal-500 mb-2">4.7</div>
                    <div className="text-gray-600 text-sm">Avg. Citation Score</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-5 text-center shadow-sm border-t-4 border-teal-500">
                    <div className="text-3xl font-bold text-teal-500 mb-2">78%</div>
                    <div className="text-gray-600 text-sm">Engagement Rate</div>
                  </div>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 mb-8" style={{ height: '300px' }}>
                <canvas id="performanceChart"></canvas>
              </div>

              {/* Recent Publications */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-6 relative pb-4 border-b border-gray-200">
                  Recent Research Publications
                  <span className="absolute bottom-0 left-0 w-16 h-1 bg-teal-500"></span>
                </h2>
                
                <div className="space-y-6 mb-6">
                  {publications.slice(0, 3).map(pub => (
                    <div 
                      key={pub.id} 
                      className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-5 pb-6 border-b border-gray-200 cursor-pointer"
                      onClick={() => window.location.href = '/inside-blog'}
                    >
                      <div 
                        className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                        style={{ backgroundImage: `url(${pub.image})` }}
                      ></div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{pub.title}</h3>
                        <div className="flex justify-between text-gray-600 text-sm mb-3">
                          <span>{pub.date}</span>
                          <span>{pub.readTime}</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-gray-600 text-sm flex items-center">
                            <i className="fas fa-eye mr-1"></i> {pub.views.toLocaleString()}
                          </span>
                          <span className="text-gray-600 text-sm flex items-center">
                            <i className="fas fa-heart mr-1"></i> {pub.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setActiveSection('blogs')}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-md transition-colors"
                >
                  View All Publications
                </button>
              </div>
            </div>

            {/* Publications Section */}
            <div id="blogs" className={activeSection === 'blogs' ? 'block' : 'hidden'}>
              <h1 className="text-3xl font-bold mb-6 relative pb-4 border-b border-gray-200">
                Research Publications
                <span className="absolute bottom-0 left-0 w-16 h-1 bg-teal-500"></span>
              </h1>

              {/* Filter Options */}
              <div className="flex flex-wrap gap-4 mb-6">
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
                    className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-5 pb-6 border-b border-gray-200 cursor-pointer"
                    onClick={() => window.location.href = '/inside-blog'}
                  >
                    <div 
                      className="h-24 md:h-full bg-gray-200 rounded-md bg-cover bg-center"
                      style={{ backgroundImage: `url(${pub.image})` }}
                    ></div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{pub.title}</h3>
                      <div className="flex justify-between text-gray-600 text-sm mb-3">
                        <span>{pub.date}</span>
                        <span>{pub.readTime}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-gray-600 text-sm flex items-center">
                          <i className="fas fa-eye mr-1"></i> {pub.views.toLocaleString()}
                        </span>
                        <span className="text-gray-600 text-sm flex items-center">
                          <i className="fas fa-heart mr-1"></i> {pub.likes}
                        </span>
                        <button className="text-gray-600 hover:text-teal-500 ml-auto">
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setActiveSection('profile')}
                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-md transition-colors"
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
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 relative pb-4">
            Latest Research
            <span className="absolute bottom-0 left-0 w-16 h-1 bg-teal-500"></span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Explore the latest academic publications from our community
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              className="relative h-48 rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => window.location.href = '/inside-blog'}
            >
              <img 
                src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80" 
                alt="Quantum Research" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h3 className="absolute bottom-0 left-0 w-full p-4 text-white text-lg font-semibold translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                Quantum Computing Breakthroughs
              </h3>
            </div>

            <div 
              className="relative h-48 rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => window.location.href = '/inside-blog'}
            >
              <img 
                src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80" 
                alt="Energy Research" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h3 className="absolute bottom-0 left-0 w-full p-4 text-white text-lg font-semibold translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                Sustainable Energy Solutions
              </h3>
            </div>

            <div 
              className="relative h-48 rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => window.location.href = '/inside-blog'}
            >
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dbe999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80" 
                alt="Health Research" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h3 className="absolute bottom-0 left-0 w-full p-4 text-white text-lg font-semibold translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                AI in Healthcare Innovations
              </h3>
            </div>

            <div 
              className="relative h-48 rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => window.location.href = '/inside-blog'}
            >
              <img 
                src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80" 
                alt="Robotics Research" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h3 className="absolute bottom-0 left-0 w-full p-4 text-white text-lg font-semibold translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                Advanced Robotics Systems
              </h3>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OtherDashboard;