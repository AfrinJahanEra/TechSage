import React from 'react';
import { FiX } from 'react-icons/fi';

const UnorderedListModal = ({ editorRef, setShowUnorderedListModal, darkMode, primaryColor }) => {
  const bulletStyles = [
    { name: 'Disc', value: 'disc', html: '<ul style="list-style-type: disc;"><li></li></ul>' },
    { name: 'Circle', value: 'circle', html: '<ul style="list-style-type: circle;"><li></li></ul>' },
    { name: 'Square', value: 'square', html: '<ul style="list-style-type: square;"><li></li></ul>' },
    { name: 'Checklist', value: 'checklist', html: '<ul><li>☐ </li></ul>' },
  ];

  const handleSelectBulletStyle = (html, value) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    // Ensure we're inserting into the content box
    if (range && editor.contains(range.startContainer)) {
      range.deleteContents(); // Clear any selected text
      if (value === 'disc') {
        document.execCommand('insertUnorderedList', false, null);
      } else if (value !== 'checklist') {
        document.execCommand('insertUnorderedList', false, null);
        const ul = editor.querySelector('ul:last-child');
        if (ul) ul.style.listStyleType = value;
      } else {
        document.execCommand('insertHTML', false, html);
      }
    } else {
      // If no selection or cursor is outside, append to the editor
      if (value === 'disc') {
        document.execCommand('insertUnorderedList', false, null);
      } else if (value !== 'checklist') {
        document.execCommand('insertUnorderedList', false, null);
        const ul = editor.querySelector('ul:last-child');
        if (ul) ul.style.listStyleType = value;
      } else {
        document.execCommand('insertHTML', false, html);
      }
    }

    // Move cursor to the first list item
    const ul = editor.querySelector('ul:last-child');
    if (ul) {
      const firstLi = ul.querySelector('li');
      if (firstLi) {
        const newRange = document.createRange();
        newRange.setStart(firstLi, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }

    setShowUnorderedListModal(false);
    editor.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className={`rounded-xl p-6 w-full max-w-sm bg-white border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Select Bullet Style</h3>
          <button
            onClick={() => setShowUnorderedListModal(false)}
            className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {bulletStyles.map((style) => (
            <button
              key={style.value}
              className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 rounded-md ${
                darkMode ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-800'
              }`}
              onClick={() => handleSelectBulletStyle(style.html, style.value)}
            >
              <span style={{ display: 'inline-block', width: '20px', textAlign: 'center' }}>
                {style.value === 'checklist' ? '☐' : '•'}
              </span>
              {style.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UnorderedListModal;