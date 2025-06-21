import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import SearchForm from '../components/SearchForm';

const TopContributors = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const contributors = [
    {
      id: 1,
      rank: 1,
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      name: 'Ramisa Anan Rahman',
      field: 'Quantum Computing',
      publications: 42,
      citations: 1250,
      rating: 4.9,
      badge: 'gold'
    },
    {
      id: 2,
      rank: 2,
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      name: 'Ridika Naznin',
      field: 'Machine Learning',
      publications: 38,
      citations: 980,
      rating: 4.8,
      badge: 'silver'
    },
    {
      id: 3,
      rank: 3,
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      name: 'Afrin Jahan Era',
      field: 'Biotechnology',
      publications: 35,
      citations: 850,
      rating: 4.7,
      badge: 'bronze'
    },
    {
      id: 4,
      rank: 4,
      image: 'https://randomuser.me/api/portraits/men/75.jpg',
      name: 'Dr. Tahira Jannat',
      field: 'Renewable Energy',
      publications: 28,
      citations: 720,
      rating: 4.6
    },
    {
      id: 5,
      rank: 5,
      image: 'https://randomuser.me/api/portraits/women/33.jpg',
      name: 'Sabikunnahar Tabassom',
      field: 'Neuroscience',
      publications: 25,
      citations: 680,
      rating: 4.5
    },
    {
      id: 6,
      rank: 6,
      image: 'https://randomuser.me/api/portraits/men/45.jpg',
      name: 'Ayesha Siddika Juthi',
      field: 'Cybersecurity',
      publications: 22,
      citations: 620,
      rating: 4.4
    }
  ];

  const getBadgeClass = (badge) => {
    switch (badge) {
      case 'gold':
        return 'bg-yellow-300 text-yellow-800';
      case 'silver':
        return 'bg-gray-300 text-gray-800';
      case 'bronze':
        return 'bg-amber-600 text-amber-100';
      default:
        return '';
    }
  };

  const getBadgeText = (badge) => {
    switch (badge) {
      case 'gold':
        return 'Top';
      case 'silver':
        return 'Senior';
      case 'bronze':
        return 'Rising';
      default:
        return '';
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // In a real app, you would fetch data for the new page here
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar activePage="top-contributors" />
      
      <main className="container mx-auto px-20 py-8 pt-28">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <article className="flex-1">
            <header className="border-b border-gray-200 pb-6 mb-8">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">Top Researchers</h1>
              <p className="text-lg text-gray-600">
                Our most active and influential contributors based on publications, citations, and community engagement.
              </p>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-teal-500 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">Researcher</th>
                    <th className="px-4 py-3 text-left">Field</th>
                    <th className="px-4 py-3 text-left">Publications</th>
                    <th className="px-4 py-3 text-left">Citations</th>
                    <th className="px-4 py-3 text-left">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {contributors.map(contributor => (
                    <tr key={contributor.id} className="border-b border-gray-200 hover:bg-teal-50 transition-colors">
                      <td className="px-4 py-3">{contributor.rank}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Link to="/other-dashboard" className="flex items-center">
                            <img 
                              src={contributor.image} 
                              alt={contributor.name} 
                              className="w-10 h-10 rounded-full mr-3 object-cover"
                            />
                            <span>{contributor.name}</span>
                          </Link>
                          {contributor.badge && (
                            <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded ${getBadgeClass(contributor.badge)}`}>
                              {getBadgeText(contributor.badge)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{contributor.field}</td>
                      <td className="px-4 py-3">{contributor.publications}</td>
                      <td className="px-4 py-3">{contributor.citations.toLocaleString()}</td>
                      <td className="px-4 py-3">{contributor.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 border border-gray-300 rounded-md ${currentPage === page ? 'bg-teal-500 text-white border-teal-500' : 'hover:bg-gray-100'}`}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-8">
            <Sidebar />
            <SearchForm/>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TopContributors;