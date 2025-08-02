import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const CodeModal = ({ editor, primaryColor, darkMode, isOpen, setIsOpen }) => {
  const [language, setLanguage] = useState('plaintext');
  const [code, setCode] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [tooltip, setTooltip] = useState('');
  const languageButtonRef = useRef(null);

  const languages = [
    { value: 'plaintext', label: 'Plain Text' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'css', label: 'CSS' },
    { value: 'html', label: 'HTML' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'json', label: 'JSON' },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        languageButtonRef.current &&
        !languageButtonRef.current.contains(e.target) &&
        !e.target.closest('.language-dropdown')
      ) {
        setShowLanguageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = () => {
    if (editor) {
      // Insert code block with language and content in one step
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'codeBlock',
          attrs: { language: language || 'plaintext' },
          content: code ? [{ type: 'text', text: code }] : [],
        })
        .run();
      setIsOpen(false);
      setCode('');
      setLanguage('plaintext');
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setCode('');
    setLanguage('plaintext');
    setShowLanguageDropdown(false);
  };

  return (
    isOpen && (
      <>
        <style>
          {`
            .language-dropdown {
              position: absolute;
              z-index: 20;
              left: 0;
              margin-top: 0.25rem;
              width: 11rem;
              border-radius: 0.375rem;
              border: 1px solid ${darkMode ? '#4b5563' : '#e5e7eb'};
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              background-color: ${darkMode ? '#374151' : 'white'};
            }
            .language-item-button {
              width: 100%;
              text-align: left;
              padding: 0.5rem 1rem;
              font-size: 0.875rem;
              line-height: 1.25rem;
              transition: background-color 0.2s ease, color 0.2s ease;
              color: ${darkMode ? 'white' : '#1f2937'};
            }
            .language-item-button.active {
              background-color: ${primaryColor};
              color: white;
            }
            .language-item-button:hover {
              background-color: ${primaryColor};
              color: white;
            }
            .code-modal-textarea:focus {
              border-color: ${primaryColor};
              outline: none;
            }
            .language-button {
              background-color: ${darkMode ? '#374151' : 'white'};
              border-color: ${darkMode ? '#4b5563' : '#e5e7eb'};
              color: ${darkMode ? 'white' : '#1f2937'};
            }
            .language-button:hover {
              background-color: ${darkMode ? '#374151' : 'white'};
              border-color: ${darkMode ? '#4b5563' : '#e5e7eb'};
              color: ${darkMode ? 'white' : '#1f2937'};
            }
          `}
        </style>
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
              <div className="relative" ref={languageButtonRef}>
                <button
                  type="button"
                  className="language-button p-2 rounded-md border shadow-sm transition-colors duration-200 flex items-center gap-1 w-full text-sm"
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  onMouseEnter={() => setTooltip('Select Language')}
                  onMouseLeave={() => setTooltip('')}
                >
                  <span>{languages.find((lang) => lang.value === language).label}</span>
                  <FiChevronDown className="ml-auto" />
                </button>
                {tooltip === 'Select Language' && (
                  <div
                    className={`absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}
                  >
                    Select Language
                  </div>
                )}
                {showLanguageDropdown && (
                  <div className="language-dropdown">
                    {languages.map((lang) => (
                      <button
                        key={lang.value}
                        className={`language-item-button ${language === lang.value ? 'active' : ''}`}
                        onClick={() => {
                          setLanguage(lang.value);
                          setShowLanguageDropdown(false);
                        }}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Code</label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`code-modal-textarea w-full p-2 rounded border resize-y font-mono text-sm ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-800'}`}
                style={{ minHeight: '150px' }}
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
      </>
    )
  );
};

export default CodeModal;