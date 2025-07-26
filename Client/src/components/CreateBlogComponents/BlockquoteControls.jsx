import React, { useState } from 'react';
import { BiSolidQuoteRight } from 'react-icons/bi';

const BlockquoteControls = ({ editorRef, darkMode, primaryColor, activeFormats, formatText, updateActiveFormats }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleBlockquote = () => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const parentBlockquote = range.startContainer.nodeType === Node.TEXT_NODE
      ? range.startContainer.parentNode.closest('blockquote')
      : range.startContainer.closest('blockquote');

    if (parentBlockquote) {
      let currentNode = range.startContainer.nodeType === Node.TEXT_NODE
        ? range.startContainer.parentNode
        : range.startContainer;
      let currentParagraph = currentNode.closest('p') || currentNode;

      if (currentParagraph.nodeName !== 'P') {
        const p = document.createElement('p');
        p.appendChild(range.extractContents());
        range.insertNode(p);
        currentParagraph = p;
      }

      if (parentBlockquote.nextSibling) {
        parentBlockquote.parentNode.insertBefore(currentParagraph, parentBlockquote.nextSibling);
      } else {
        parentBlockquote.parentNode.appendChild(currentParagraph);
      }

      const children = Array.from(parentBlockquote.childNodes);
      children.forEach(child => {
        if (
          child.nodeName === 'P' &&
          (child.innerHTML === '' || child.innerHTML === '<br>' || child.textContent.trim() === '')
        ) {
          child.remove();
        }
      });

      if (parentBlockquote.childNodes.length === 0) {
        parentBlockquote.remove();
      }

      currentParagraph.removeAttribute('style');
      currentParagraph.classList.remove('blockquote');

      const newRange = document.createRange();
      newRange.selectNodeContents(currentParagraph);
      newRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      document.execCommand('formatBlock', false, 'blockquote');
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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundColor:
            activeFormats.includes('formatBlock') && document.queryCommandValue('formatBlock') === 'blockquote'
              ? primaryColor
              : isHovered
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
        <BiSolidQuoteRight className="font-bold" />
      </button>
      {isHovered && (
        <div
          className={`absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap ${
            darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'
          }`}
        >
          Blockquote
        </div>
      )}
    </div>
  );
};

export default BlockquoteControls;