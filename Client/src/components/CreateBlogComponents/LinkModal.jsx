import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const LinkModal = ({ editor, primaryColor, darkMode, isOpen, setIsOpen }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [displayText, setDisplayText] = useState('');

  // Handle Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        console.log('Ctrl+K pressed, opening link modal');
        handleLinkButtonClick();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  // Set initial URL and display text when opening modal
  const handleLinkButtonClick = () => {
    if (!editor) {
      console.error('Editor instance is not available');
      return;
    }
    editor.commands.focus();
    const { from, to } = editor.state.selection;
    const previousUrl = editor.getAttributes('link').href || '';
    const selectedText = from !== to ? editor.state.doc.textBetween(from, to) : '';
    console.log('Selection:', { from, to, selectedText });
    console.log('Previous URL:', previousUrl);
    setLinkUrl(previousUrl);
    setDisplayText(selectedText || previousUrl || '');
    setIsOpen(true);
  };

  // Handle link insertion or removal
  const handleInsertLink = () => {
    if (!editor) {
      console.error('Editor instance is not available');
      alert('Editor is not initialized. Please try again.');
      return;
    }
    console.log('Attempting to focus editor');
    editor.chain().focus().run();
    const url = linkUrl.trim();
    const text = displayText.trim() || url;

    if (!url) {
      console.log('Unsetting link');
      editor.chain().focus().unsetLink().run();
      setIsOpen(false);
      setLinkUrl('');
      setDisplayText('');
      return;
    }

    const isValidUrl = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i.test(url);
    if (!isValidUrl) {
      alert('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    const { from, to } = editor.state.selection;
    console.log('Inserting link:', { url, text, hasSelection: from !== to });

    if (from !== to) {
      // If text is selected, apply the link to the selected text
      editor.chain().focus().setLink({ href: url }).run();
    } else {
      // If no text is selected, insert the display text with the link
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: text,
          marks: [{ type: 'link', attrs: { href: url, target: '_blank', rel: 'noopener noreferrer' } }],
        })
        .run();
    }

    setIsOpen(false);
    setLinkUrl('');
    setDisplayText('');
  };

  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          .modal {
            position: relative;
            z-index: 50;
            padding: 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 90%;
            max-width: 400px;
          }
        `}
      </style>
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 ${darkMode ? 'bg-black/50' : 'bg-black/30'}`}
        style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={`modal ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
          style={{ border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}` }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Insert/Edit Link</h3>
            <button onClick={() => setIsOpen(false)} aria-label="Close">
              <FiX />
            </button>
          </div>
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInsertLink();
              if (e.key === 'Escape') setIsOpen(false);
            }}
            placeholder="https://example.com"
            className={`w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:!border-[${primaryColor}] ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-800'}`}
            autoFocus
          />
          <input
            type="text"
            value={displayText}
            onChange={(e) => setDisplayText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInsertLink();
              if (e.key === 'Escape') setIsOpen(false);
            }}
            placeholder="Optional display text"
            className={`w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:!border-[${primaryColor}] ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-800'}`}
          />
          {linkUrl && (
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Preview: <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: primaryColor }}>{displayText || linkUrl}</a>
            </p>
          )}
          <div className="flex justify-end gap-2">
            {linkUrl && (
              <button
                onClick={() => {
                  console.log('Removing link');
                  editor.chain().focus().unsetLink().run();
                  setIsOpen(false);
                  setLinkUrl('');
                  setDisplayText('');
                }}
                className={`px-4 py-2 border rounded-lg ${darkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-50'}`}
              >
                Remove Link
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className={`px-4 py-2 border rounded-lg ${darkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-50'}`}
            >
              Cancel
            </button>
            <button
              onClick={handleInsertLink}
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              Insert
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LinkModal;