import React from 'react';
import { FiCornerUpLeft } from 'react-icons/fi';

const BlockquoteControls = ({ editorRef, darkMode, primaryColor, activeFormats, formatText, updateActiveFormats }) => {
  const handleBlockquote = () => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const parentBlockquote = range.startContainer.nodeType === Node.TEXT_NODE
      ? range.startContainer.parentNode.closest('blockquote')
      : range.startContainer.closest('blockquote');

    if (parentBlockquote) {
      // If inside a blockquote, exit by wrapping the current content in a paragraph
      document.execCommand('formatBlock', false, 'p');
      // Ensure the cursor is placed in a new paragraph after the blockquote
      const newParagraph = document.createElement('p');
      newParagraph.innerHTML = '<br>';
      parentBlockquote.parentNode.insertBefore(newParagraph, parentBlockquote.nextSibling);
      const newRange = document.createRange();
      newRange.setStart(newParagraph, 0);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      // Apply blockquote to the selected content
      document.execCommand('formatBlock', false, 'blockquote');
      // Ensure the blockquote contains paragraphs
      const blockquote = range.startContainer.nodeType === Node.TEXT_NODE
        ? range.startContainer.parentNode.closest('blockquote')
        : range.startContainer.closest('blockquote');
      if (blockquote) {
        const children = Array.from(blockquote.childNodes);
        if (children.length === 0 || !children.every(child => child.nodeName === 'P')) {
          const p = document.createElement('p');
          p.appendChild(range.extractContents());
          range.insertNode(p);
        }
      }
    }
    editorRef.current.focus();
    updateActiveFormats();
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