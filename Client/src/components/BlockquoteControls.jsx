import React from 'react';
import { FiCornerUpLeft } from 'react-icons/fi';

const BlockquoteControls = ({ editorRef, darkMode, primaryColor, activeFormats, formatText }) => {
  const handleBlockquote = () => {
    const isActive = document.queryCommandState('formatBlock') && document.queryCommandValue('formatBlock') === 'blockquote';
    const selection = window.getSelection();

    if (selection.isCollapsed) {
      document.execCommand('formatBlock', false, isActive ? 'p' : 'blockquote');
    } else {
      document.execCommand('formatBlock', false, isActive ? 'p' : 'blockquote');
    }
    editorRef.current.focus();
    formatText('formatBlock'); // Update active formats
  };

  return (
    <div className="relative">
      <button
        type="button"
        className={`
          p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold
          ${
            activeFormats.includes('formatBlock') && document.queryCommandValue('formatBlock') === 'blockquote'
              ? 'text-white'
              : darkMode
              ? 'text-gray-200 hover:text-white'
              : 'text-gray-800 hover:text-white'
          }
        `}
        onClick={handleBlockquote}
        style={{
          backgroundColor:
            activeFormats.includes('formatBlock') && document.queryCommandValue('formatBlock') === 'blockquote'
              ? primaryColor
              : darkMode
              ? '#374151'
              : 'white',
          borderColor:
            activeFormats.includes('formatBlock') && document.queryCommandValue('formatBlock') === 'blockquote'
              ? primaryColor
              : darkMode
              ? '#4b5563'
              : '#e5e7eb',
          '--tw-ring-color': primaryColor
        }}
      >
        <FiCornerUpLeft className="font-bold" />
      </button>
    </div>
  );
};

export default BlockquoteControls;