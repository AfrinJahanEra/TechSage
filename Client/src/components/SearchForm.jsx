import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SearchForm = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { api } = useContext(AuthContext);
  const { primaryColor, darkMode } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/search/?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data.slice(0, 3));
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <h3 
        className="uppercase text-sm font-semibold tracking-wider border-b pb-2 mb-3"
        style={{ color: primaryColor, borderColor: darkMode ? '#374151' : '#e5e7eb' }}
      >
        Search Researchers
      </h3>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name..."
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700 text-white focus:border-gray-600' 
              : 'bg-white border-gray-300 text-gray-700 focus:border-gray-400'
          }`}
          style={{ '--tw-ring-color': primaryColor }}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: primaryColor }}></div>
          </div>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className={`mt-2 border rounded-md max-h-60 overflow-y-auto ${
          darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'
        }`}>
          {searchResults.map((user) => (
            <Link 
              key={user.id} 
              to={`/users/${user.username}`}
              className={`block p-3 border-b last:border-b-0 transition-colors ${
                darkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 border-gray-200'
              }`}
            >
              <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user.username}</p>
            </Link>
          ))}
        </div>
      )}

      {searchQuery && !isLoading && searchResults.length === 0 && (
        <div className={`mt-2 text-center text-sm py-2 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          No researchers found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default SearchForm;