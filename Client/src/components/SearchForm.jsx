import { useState } from 'react';

const SearchForm = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowResults(true);
  };

  return (
    <div className="mb-6">
      <h3 className="text-teal-700 uppercase text-sm font-semibold tracking-wider border-b border-gray-200 pb-2 mb-3">
        Search Researchers
      </h3>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or field..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
        <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-500">
          <i className="fas fa-search"></i>
        </button>
      </form>

      {showResults && (
        <div className="mt-2 border border-gray-300 rounded-md max-h-60 overflow-y-auto">
          <div className="p-3 hover:bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Dr. Sarah Johnson" className="w-9 h-9 rounded-full object-cover" />
              <div>
                <p className="font-medium text-sm">Dr. Sarah Johnson</p>
                <p className="text-gray-600 text-xs">Quantum Computing</p>
              </div>
            </div>
          </div>
          <div className="p-3 hover:bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Prof. Michael Chen" className="w-9 h-9 rounded-full object-cover" />
              <div>
                <p className="font-medium text-sm">Prof. Michael Chen</p>
                <p className="text-gray-600 text-xs">Machine Learning</p>
              </div>
            </div>
          </div>
          <div className="p-3 hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Dr. Emily Rodriguez" className="w-9 h-9 rounded-full object-cover" />
              <div>
                <p className="font-medium text-sm">Dr. Emily Rodriguez</p>
                <p className="text-gray-600 text-xs">Biotechnology</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchForm;