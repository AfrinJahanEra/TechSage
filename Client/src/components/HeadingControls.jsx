import React, { useState, useEffect, useRef } from 'react';
import { FiType, FiChevronDown } from 'react-icons/fi';

const HeadingControls = ({ editorRef, darkMode, primaryColor, activeFormats, setActiveFormats, updateActiveFormats }) => {
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
  const [tooltip, setTooltip] = useState('');
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const headingButtonRef = useRef(null);

  const headingStyles = [
    { name: 'Heading 1', tag: 'h1', style: 'font-size: 28px; font-weight: bold; color: #000000; margin: 0.67em 0; line-height: 1.2;' },
    { name: 'Heading 2', tag: 'h2', style: 'font-size: 24px; font-weight: bold; color: #000000; margin: 0.83em 0; line-height: 1.3;' },
    { name: 'Heading 3', tag: 'h3', style: 'font-size: 20px; font-weight: bold; color: #5F6368; margin: 1em 0; line-height: 1.4;' },
    { name: 'Heading 4', tag: 'h4', style: 'font-size: 18px; font-weight: bold; color: #80868B; margin: 1.33em 0; line-height: 1.5;' },
    { name: 'Normal Text', tag: 'p', style: 'font-size: 16px; color: #000000; margin: 1em 0; line-height: 1.6;' },
  ];

  const handleSelectHeading = (styleObj) => {
    const editor = editorRef.current;
    if (!editor) return;

    const scrollTop = editor.scrollTop;
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    try {
      let currentBlock;
      if (range && editor.contains(range.startContainer)) {
        // Find the current block element
        currentBlock = range.startContainer.nodeType === Node.ELEMENT_NODE
          ? range.startContainer.closest('h1, h2, h3, h4, p, div')
          : range.startContainer.parentNode.closest('h1, h2, h3, h4, p, div');

        if (currentBlock && currentBlock !== editor) {
          // Replace the current block with the new heading tag
          const newBlock = document.createElement(styleObj.tag);
          newBlock.style.cssText = styleObj.style;
          newBlock.innerHTML = currentBlock.innerHTML || '<br>';

          // Preserve inline styles (e.g., bold, italic)
          const inlineStyles = ['font-weight', 'font-style', 'text-decoration'];
          inlineStyles.forEach((style) => {
            const value = window.getComputedStyle(currentBlock)[style];
            if (value && value !== 'normal' && value !== 'none') {
              newBlock.style[style] = value;
            }
          });

          currentBlock.parentNode.replaceChild(newBlock, currentBlock);
          currentBlock = newBlock;

          // Restore selection
          const newRange = document.createRange();
          newRange.setStart(range.startContainer, range.startOffset);
          newRange.setEnd(range.endContainer, range.endOffset);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else {
          // If no valid block, create a new one
          const newBlock = document.createElement(styleObj.tag);
          newBlock.style.cssText = styleObj.style;
          newBlock.innerHTML = '<br>';
          range.deleteContents();
          range.insertNode(newBlock);
          currentBlock = newBlock;

          const newRange = document.createRange();
          newRange.setStart(newBlock, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } else {
        // If no selection or outside editor, append a new block
        const newBlock = document.createElement(styleObj.tag);
        newBlock.style.cssText = styleObj.style;
        newBlock.innerHTML = '<br>';
        editor.appendChild(newBlock);
        currentBlock = newBlock;

        const newRange = document.createRange();
        newRange.setStart(newBlock, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }

      updateActiveFormats();
      editor.scrollTop = scrollTop;
    } catch (error) {
      console.error('Error applying heading:', error);
    }

    setShowHeadingDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        headingButtonRef.current &&
        !headingButtonRef.current.contains(e.target) &&
        !e.target.closest('.heading-dropdown')
      ) {
        setShowHeadingDropdown(false);
        if (editorRef.current && document.activeElement !== editorRef.current) {
          editorRef.current.focus({ preventScroll: true });
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editorRef]);

  const getActiveHeadingStyle = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;
    const range = selection.getRangeAt(0);
    const currentBlock = range.startContainer.nodeType === Node.ELEMENT_NODE
      ? range.startContainer.closest('h1, h2, h3, h4, p')
      : range.startContainer.parentNode.closest('h1, h2, h3, h4, p');
    return currentBlock ? currentBlock.tagName.toLowerCase() : null;
  };

  return (
    <>
      <style>
        {`
          .heading-item-button:hover {
            background-color: ${primaryColor} !important;
            color: white !important;
            border-color: ${primaryColor} !important;
          }
          .heading-item-button.active {
            background-color: ${primaryColor} !important;
            color: white !important;
            border-color: ${primaryColor} !important;
          }
          /* Google Docs-inspired heading styles, adjusted for default text size */
          [contenteditable] h1 { font-size: 28px !important; font-weight: bold !important; color: #000000 !important; margin: 0.67em 0 !important; line-height: 1.2 !important; }
          [contenteditable] h2 { font-size: 24px !important; font-weight: bold !important; color: #000000 !important; margin: 0.83em 0 !important; line-height: 1.3 !important; }
          [contenteditable] h3 { font-size: 20px !important; font-weight: bold !important; color: #5F6368 !important; margin: 1em 0 !important; line-height: 1.4 !important; }
          [contenteditable] h4 { font-size: 18px !important; font-weight: bold !important; color: #80868B !important; margin: 1.33em 0 !important; line-height: 1.5 !important; }
          [contenteditable] p { font-size: 16px !important; color: #000000 !important; margin: 1em 0 !important; line-height: 1.6 !important; }
        `}
      </style>
      <div className="relative" ref={headingButtonRef}>
        <button
          type="button"
          className={`
            p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold flex items-center gap-1
            ${
              activeFormats.includes('formatBlock') && getActiveHeadingStyle() !== 'p'
                ? 'text-white'
                : darkMode
                ? 'text-gray-200 hover:text-white'
                : 'text-gray-800 hover:text-white'
            }
          `}
          onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
          onMouseEnter={() => {
            setTooltip('Headings');
            setHoveredIcon('formatBlock');
          }}
          onMouseLeave={() => {
            setTooltip('');
            setHoveredIcon(null);
          }}
          style={{
            backgroundColor:
              (activeFormats.includes('formatBlock') && getActiveHeadingStyle() !== 'p') ||
              hoveredIcon === 'formatBlock'
                ? primaryColor
                : darkMode
                ? '#374151'
                : 'white',
            borderColor:
              (activeFormats.includes('formatBlock') && getActiveHeadingStyle() !== 'p') ||
              hoveredIcon === 'formatBlock'
                ? primaryColor
                : darkMode
                ? '#4b5563'
                : '#e5e7eb',
            '--tw-ring-color': primaryColor,
          }}
        >
          <FiType className="font-bold" />
          <FiChevronDown className="font-bold" />
        </button>

        {tooltip === 'Headings' && (
          <div
            className={`absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap ${
              darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'
            }`}
          >
            Headings
          </div>
        )}

        {showHeadingDropdown && (
          <div
            className={`heading-dropdown absolute z-20 left-0 mt-1 w-44 rounded-md border shadow-md ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
            }`}
          >
            {headingStyles.map((style) => {
              const isActive = activeFormats.includes('formatBlock') && getActiveHeadingStyle() === style.tag;
              return (
                <button
                  key={style.tag}
                  className={`heading-item-button w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                    isActive ? 'active' : darkMode ? 'text-white' : 'text-gray-800'
                  }`}
                  style={{
                    backgroundColor: isActive ? primaryColor : 'transparent',
                    color: isActive ? 'white' : darkMode ? 'white' : '#1f2937',
                    borderColor: isActive ? primaryColor : 'transparent',
                  }}
                  onClick={() => handleSelectHeading(style)}
                >
                  {style.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default HeadingControls;