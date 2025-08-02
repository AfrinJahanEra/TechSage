import React, { useState } from 'react';

const CodeModal = ({ editor, primaryColor, darkMode, isOpen, setIsOpen }) => {
  const [language, setLanguage] = useState('plaintext');
  const [code, setCode] = useState('');

  const languages = [
    { value: 'plaintext', label: 'Plain Text' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'css', label: 'CSS' },
    { value: 'html', label: 'HTML' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'json', label: 'JSON' },
  ];

  const handleSubmit = () => {
    if (editor) {
      editor.chain().focus().setCodeBlock({ language }).run();
      if (code) {
        editor.chain().focus().insertContent(code).run();
      }
      setIsOpen(false);
      setCode('');
      setLanguage('plaintext');
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setCode('');
    setLanguage('plaintext');
  };

  return (
    isOpen && (
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 ${darkMode ? 'bg-black/50' : 'bg-black/30'}`}
        onClick={handleCancel}
      >
        <div
          className={`p-6 rounded-lg shadow-lg max-w-md w-full ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}
          style={{ border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}` }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold mb-4">Insert Code Block</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`w-full p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
              style={{ borderColor: darkMode ? '#4b5563' : '#d1d5db' }}
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Code</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`w-full p-2 rounded border resize-y font-mono text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-800'}`}
              style={{ borderColor: darkMode ? '#4b5563' : '#d1d5db', minHeight: '150px' }}
              placeholder="Enter your code here..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className={`px-4 py-2 rounded ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 rounded text-white"
              style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
            >
              Insert
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default CodeModal;