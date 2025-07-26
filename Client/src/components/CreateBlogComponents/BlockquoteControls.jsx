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
      // Find the current paragraph or parent element within the blockquote
      let currentNode = range.startContainer.nodeType === Node.TEXT_NODE
        ? range.startContainer.parentNode
        : range.startContainer;
      let currentParagraph = currentNode.closest('p') || currentNode;

      // If the current node is not a paragraph, wrap it in a <p> to standardize
      if (currentParagraph.nodeName !== 'P') {
        const p = document.createElement('p');
        p.appendChild(range.extractContents());
        range.insertNode(p);
        currentParagraph = p;
      }

      // Move the current paragraph after the blockquote
      if (parentBlockquote.nextSibling) {
        parentBlockquote.parentNode.insertBefore(currentParagraph, parentBlockquote.nextSibling);
      } else {
        parentBlockquote.parentNode.appendChild(currentParagraph);
      }

      // Clean up empty paragraphs or <br> in the blockquote
      const children = Array.from(parentBlockquote.childNodes);
      children.forEach(child => {
        if (
          child.nodeName === 'P' &&
          (child.innerHTML === '' || child.innerHTML === '<br>' || child.textContent.trim() === '')
        ) {
          child.remove();
        }
      });

      // If the blockquote is empty after moving the content, remove it
      if (parentBlockquote.childNodes.length === 0) {
        parentBlockquote.remove();
      }

      // Normalize the paragraph to remove any blockquote-specific styling
      currentParagraph.removeAttribute('style'); // Remove any inline styles
      currentParagraph.classList.remove('blockquote'); // Remove any blockquote classes if applied

      // Place the cursor at the end of the moved paragraph
      const newRange = document.createRange();
      newRange.selectNodeContents(currentParagraph);
      newRange.collapse(false); // Place cursor at the end
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      // Apply blockquote to the selected content
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