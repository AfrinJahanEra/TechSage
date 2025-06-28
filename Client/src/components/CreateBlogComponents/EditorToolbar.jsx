import React from 'react';

const EditorToolbar = ({ editorRef, onLatexClick }) => {
  const handleCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  return (
    <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-100 rounded-md">
      {/* Text formatting buttons */}
      <button
        type="button"
        onClick={() => handleCommand('bold')}
        className="p-2 rounded hover:bg-gray-200"
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => handleCommand('italic')}
        className="p-2 rounded hover:bg-gray-200"
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={() => handleCommand('underline')}
        className="p-2 rounded hover:bg-gray-200"
        title="Underline"
      >
        <u>U</u>
      </button>
      
      {/* Headings */}
      <button
        type="button"
        onClick={() => handleCommand('formatBlock', '<h2>')}
        className="p-2 rounded hover:bg-gray-200"
        title="Heading"
      >
        H
      </button>
      
      {/* Lists */}
      <button
        type="button"
        onClick={() => handleCommand('insertUnorderedList')}
        className="p-2 rounded hover:bg-gray-200"
        title="Bullet List"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => handleCommand('insertOrderedList')}
        className="p-2 rounded hover:bg-gray-200"
        title="Numbered List"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </button>
      
      {/* Link */}
      <button
        type="button"
        onClick={() => {
          const url = prompt('Enter the URL:');
          if (url) handleCommand('createLink', url);
        }}
        className="p-2 rounded hover:bg-gray-200"
        title="Link"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </button>
      
      {/* Image */}
      <button
        type="button"
        onClick={() => {
          const url = prompt('Enter the image URL:');
          if (url) handleCommand('insertImage', url);
        }}
        className="p-2 rounded hover:bg-gray-200"
        title="Image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      
      {/* LaTeX Button */}
      <button
        type="button"
        onClick={onLatexClick}
        className="p-2 rounded hover:bg-gray-200 font-bold text-red-600"
        title="LaTeX Equation"
      >
        <span className="text-xs">∑ LaTeX</span>
      </button>
      
      {/* Undo/Redo */}
      <button
        type="button"
        onClick={() => handleCommand('undo')}
        className="p-2 rounded hover:bg-gray-200"
        title="Undo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => handleCommand('redo')}
        className="p-2 rounded hover:bg-gray-200"
        title="Redo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
};

export default EditorToolbar;