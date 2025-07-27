import React, { useState } from 'react';

const LinkModal = ({ editorRef, setShowLinkModal, darkMode, primaryColor, savedRange }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const insertLink = () => {
    if (!linkUrl.trim()) return;

    const editor = editorRef.current;
    if (!editor) {
      console.error('Editor reference is null');
      return;
    }

    const linkElement = document.createElement('a');
    linkElement.href = linkUrl;
    linkElement.className = 'inserted-link';
    linkElement.contentEditable = 'false';
    linkElement.style.display = 'inline-block';
    linkElement.style.padding = '0.2em 0.4em';
    linkElement.style.margin = '0 0.1em';
    linkElement.style.borderRadius = '3px';
    linkElement.style.color = darkMode ? '#2dd4bf' : '#0d9488';
    linkElement.style.textDecoration = 'underline';
    linkElement.style.cursor = 'pointer';
    linkElement.textContent = linkText.trim() || linkUrl;

    linkElement.target = '_blank';
    linkElement.rel = 'noopener noreferrer';
    linkElement.onclick = (e) => {
      e.preventDefault();
      window.open(linkUrl, '_blank');
    };

    try {
      editor.focus();
      const selection = window.getSelection();
      selection.removeAllRanges();

      let range = savedRange;
      if (!range || !editor.contains(range.startContainer)) {
        console.warn('Invalid saved range, attempting current selection');
        range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      }

      if (range && editor.contains(range.startContainer)) {
        console.log('Inserting at saved range:', {
          startContainer: range.startContainer,
          startOffset: range.startOffset,
        });
        range.deleteContents();
        range.insertNode(linkElement);
      } else {
        console.warn('No valid range, inserting at end of editor');
        const fallbackRange = document.createRange();
        fallbackRange.selectNodeContents(editor);
        fallbackRange.collapse(false); // Insert at end
        fallbackRange.insertNode(linkElement);
      }

      const newRange = document.createRange();
      newRange.setStartAfter(linkElement);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
      console.log('Cursor set after link');
    } catch (error) {
      console.error('Error inserting link:', error);
      const fallbackRange = document.createRange();
      fallbackRange.selectNodeContents(editor);
      fallbackRange.collapse(false);
      fallbackRange.insertNode(linkElement);
      const newRange = document.createRange();
      newRange.setStartAfter(linkElement);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
setTimeout(() => editor.focus(), 0); // Ensure focus after insertion
    
    
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
          {/* Title */}
          <div className="flex items-center justify-center pt-3 mb-3">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Insert Link
            </h3>
          </div>

          {/* Input Fields & Actions */}
          <div className="flex flex-1 flex-col gap-y-4">
            <input
              type="text"
              className={`w-full p-2 border rounded font-mono text-sm ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="Enter URL (e.g., https://example.com)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <input
              type="text"
              className={`w-full p-2 border rounded font-mono text-sm ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="Enter display text (optional)"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
            />
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
                  editorRef.current.focus();
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
    </>
  );
};

export default LinkModal;