import { useState } from 'react';

const PlagiarismChecker = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState(null);

  const checkPlagiarism = async () => {
    setIsChecking(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response
    const mockResponse = {
      score: Math.floor(Math.random() * 100),
      sources: [
        { url: "https://example.com/source1", similarity: Math.floor(Math.random() * 30) + 10 },
        { url: "https://example.com/source2", similarity: Math.floor(Math.random() * 20) }
      ]
    };
    
    setResult(mockResponse);
    setIsChecking(false);
  };

  const getSeverityClass = (score) => {
    if (score > 70) return 'bg-red-50 border-l-4 border-red-500 text-red-700';
    if (score > 30) return 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700';
    return 'bg-green-50 border-l-4 border-green-500 text-green-700';
  };

  const getSeverityText = (score) => {
    if (score > 70) return 'High';
    if (score > 30) return 'Medium';
    return 'Low';
  };

  return (
    <div className="my-6">
      <button 
        onClick={checkPlagiarism}
        disabled={isChecking}
        className={`flex items-center gap-2 px-4 py-2 rounded-md ${isChecking ? 'bg-blue-400' : 'bg-blue-500'} text-white hover:bg-blue-600 transition-colors`}
      >
        {isChecking ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Checking...
          </>
        ) : (
          <>
            <i className="fas fa-search"></i>
            Check Plagiarism
          </>
        )}
      </button>

      {result && (
        <div className={`mt-4 p-4 rounded-md ${getSeverityClass(result.score)}`}>
          <h4 className="font-bold mb-2">Plagiarism Check Results:</h4>
          <p>This content has a plagiarism score of {result.score}% ({getSeverityText(result.score)} risk).</p>
          
          {result.sources.length > 0 ? (
            <>
              <p className="mt-2">Potential matching sources found:</p>
              <ul className="list-disc pl-5 mt-1">
                {result.sources.map((source, index) => (
                  <li key={index}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {source.url}
                    </a> ({source.similarity}% similar)
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-2">No exact matches found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PlagiarismChecker;