import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const LinkModal = ({ editorRef, setShowLinkModal, darkMode, primaryColor }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const insertLink = () => {
    if (!linkUrl.trim()) return;

    const linkElement = document.createElement('a');
    linkElement.href = linkUrl;
    linkElement.className = 'inserted-link';
    linkElement.contentEditable = 'false';
    linkElement.style.display = 'inline-block';
    linkElement.style.padding = '0.2em 0.4em';
    linkElement.style.margin = '0 0.1em';
    linkElement.style.borderRadius = '3px';
    linkElement.style.color = darkMode ? '#2dd4bf' : '#0d9488'; // Teal for visibility in both modes
    linkElement.style.textDecoration = 'underline';
    linkElement.style.cursor = 'pointer';
    linkElement.textContent = linkText.trim() || linkUrl;

    // Ensure links open in a new tab and handle click redirection
    linkElement.target = '_blank';
    linkElement.rel = 'noopener noreferrer';
    linkElement.onclick = (e) => {
      e.preventDefault();
      window.open(linkUrl, '_blank');
    };

    const editor = editorRef.current;
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    if (!range || !editor.contains(range.startContainer)) {
      editor.appendChild(linkElement);
    } else {
      range.deleteContents();
      range.insertNode(linkElement);
    }

    const newRange = document.createRange();
    newRange.setStartAfter(linkElement);
    newRange.collapse(true);

    selection.removeAllRanges();
    selection.addRange(newRange);
    editor.focus();

    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  };

  return (
    <>
      <style>
        {`
          .inserted-link:hover {
            cursor: pointer !important;
          }
        `}
      </style>
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      >
        <div
          className={`rounded-xl p-6 w-full max-w-md h-[300px] overflow-hidden flex flex-col shadow-xl ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
          style={{
            border: '1px solid rgba(0, 0, 0, 0.12)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Link Insertion
            </h4>
            <div className="relative flex-1 text-center">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Insert Link
              </h3>
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkUrl('');
                  setLinkText('');
                }}
                className={`absolute right-0 top-1/2 -translate-y-1/2 ${
                  darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div className="w-full">
              <input
                type="text"
                className={`w-full p-2 border rounded mb-2 font-mono text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                placeholder="Enter URL (e.g., https://example.com)"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                autoFocus
              />
              <input
                type="text"
                className={`w-full p-2 border rounded mb-2 font-mono text-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                placeholder="Enter display text (optional)"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
              <div className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Tip: Enter a URL to create a link. Optionally, add display text to customize how the link appears.
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  className={`px-4 py-2 rounded hover:opacity-90 transition-colors duration-200 ${
                    darkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                  onClick={() => {
                    setShowLinkModal(false);
                    setLinkUrl('');
                    setLinkText('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-white rounded hover:opacity-90 transition-colors duration-200"
                  style={{ backgroundColor: primaryColor }}
                  onClick={insertLink}
                >
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LinkModal;