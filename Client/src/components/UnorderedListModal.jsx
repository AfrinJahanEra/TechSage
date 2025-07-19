import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const UnorderedListModal = ({ editorRef, setShowUnorderedListModal, darkMode, primaryColor }) => {
  const bulletStyles = [
    { name: 'Circle', value: 'circle', style: 'list-style-type: circle;' },
    { name: 'Square', value: 'square', style: 'list-style-type: square;' },
    { name: 'Star', value: 'star', style: 'list-style-type: none; padding-left: 20px;', liStyle: 'content: "★ ";' },
    { name: 'Arrow', value: 'arrow', style: 'list-style-type: none; padding-left: 20px;', liStyle: 'content: "➔ ";' },
    { name: 'Checklist', value: 'checklist', style: 'list-style-type: none; padding-left: 20px;', liStyle: 'content: "☐ ";' },
  ];

  const handleSelectBulletStyle = (value, style, liStyle) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    // Check if selection spans multiple lines
    if (range && !range.collapsed) {
      const selectedText = range.toString();
      const lines = selectedText.split('\n').filter(line => line.trim() !== '');

      if (lines.length > 0) {
        // Create a new <ul> for selected lines
        const ul = document.createElement('ul');
        ul.style.cssText = style;
        lines.forEach(line => {
          const li = document.createElement('li');
          if (liStyle) li.style.cssText = `position: relative; ${liStyle}`;
          li.textContent = line;
          ul.appendChild(li);
        });

        // Check if we're inside an existing <ul>
        const commonAncestor = range.commonAncestorContainer;
        const parentUl = commonAncestor.nodeType === Node.ELEMENT_NODE
          ? commonAncestor.closest('ul')
          : commonAncestor.parentElement.closest('ul');

        if (parentUl && parentUl.parentElement === editor) {
          // Replace existing <ul> with new one
          parentUl.replaceWith(ul);
        } else {
          // Insert new <ul> at selection
          range.deleteContents();
          range.insertNode(ul);
        }

        // Move cursor to the last <li>
        const lastLi = ul.querySelector('li:last-child');
        if (lastLi) {
          const newRange = document.createRange();
          newRange.setStart(lastLi, lastLi.childNodes.length);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    } else {
      // No selection or collapsed selection: insert new list
      const ul = document.createElement('ul');
      ul.style.cssText = style;
      const li = document.createElement('li');
      if (liStyle) li.style.cssText = `position: relative; ${liStyle}`;
      ul.appendChild(li);

      if (range && editor.contains(range.startContainer)) {
        range.deleteContents();
        range.insertNode(ul);
      } else {
        editor.appendChild(ul);
      }

      // Move cursor to the first <li>
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

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        if (!range || !editor.contains(range.startContainer)) return;

        const currentLi = range.startContainer.closest ? range.startContainer.closest('li') : null;
        if (!currentLi) return;

        const parentUl = currentLi.parentElement;
        if (parentUl.tagName !== 'UL') return;

        e.preventDefault();
        const newLi = document.createElement('li');
        newLi.style.cssText = currentLi.style.cssText; // Copy bullet style
        currentLi.parentElement.appendChild(newLi);

        const newRange = document.createRange();
        newRange.setStart(newLi, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else if (e.key === 'Backspace') {
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        if (!range || !editor.contains(range.startContainer)) return;

        const currentLi = range.startContainer.closest ? range.startContainer.closest('li') : null;
        if (!currentLi) return;

        const parentUl = currentLi.parentElement;
        if (parentUl.tagName !== 'UL') return;

        if (currentLi.textContent === '' && parentUl.children.length === 1) {
          e.preventDefault();
          parentUl.remove();
          document.execCommand('insertParagraph', false, null);
          editor.focus();
        } else if (currentLi.textContent === '' && currentLi.previousElementSibling) {
          e.preventDefault();
          currentLi.remove();
          const prevLi = currentLi.previousElementSibling;
          const newRange = document.createRange();
          newRange.setStart(prevLi, prevLi.childNodes.length);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          editor.focus();
        }
      }
    };

    editor.addEventListener('keydown', handleKeyDown);
    return () => {
      editor.removeEventListener('keydown', handleKeyDown);
    };
  }, [editorRef]);

  return (
    <>
      <style>
        {`
          .bullet-button:hover {
            background-color: ${primaryColor} !important;
            color: white !important;
            border-color: ${primaryColor} !important;
          }
          li::before {
            position: absolute;
            left: -20px;
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
          className={`rounded-xl p-6 w-full max-w-sm flex flex-col shadow-xl ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
          style={{
            border: '1px solid rgba(0, 0, 0, 0.12)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Select Bullet Style
            </h3>
            <button
              onClick={() => setShowUnorderedListModal(false)}
              className={`${
                darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiX size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {bulletStyles.map((style) => (
              <button
                key={style.value}
                className={`bullet-button w-full text-left px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md border ${
                  darkMode ? 'text-gray-200 bg-gray-700 border-gray-600' : 'text-gray-800 bg-white border-gray-200'
                }`}
                style={{
                  borderColor: darkMode ? '#4b5563' : '#e5e7eb',
                }}
                onClick={() => handleSelectBulletStyle(style.value, style.style, style.liStyle)}
              >
                <span style={{ display: 'inline-block', width: '20px', textAlign: 'center' }}>
                  {style.value === 'checklist' ? '☐' : style.value === 'star' ? '★' : style.value === 'arrow' ? '➔' : '•'}
                </span>
                {style.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UnorderedListModal;