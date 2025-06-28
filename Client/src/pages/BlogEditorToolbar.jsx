import React, { useState, useEffect } from 'react';
import {
  FiBold, FiItalic, FiUnderline, FiList, FiAlignLeft, FiAlignCenter, FiAlignRight,
  FiAlignJustify, FiLink, FiImage, FiCode, FiRotateCcw, FiRotateCw
} from 'react-icons/fi';
import { MdFormatListNumbered } from 'react-icons/md';
import { PiMathOperationsFill } from 'react-icons/pi';

const BlogEditorToolbar = ({ editorRef }) => {
  const [tooltip, setTooltip] = useState('');
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [activeFormats, setActiveFormats] = useState([]);

  const [showBulletDropdown, setShowBulletDropdown] = useState(false);
  const [showNumberDropdown, setShowNumberDropdown] = useState(false);

  const formatText = (command, value = null) => {
    const isActive = document.queryCommandState(command);
    const selection = window.getSelection();

    // If selection is collapsed (caret only) — manually toggle
    if (selection.isCollapsed) {
      // For togglable formats like bold, italic, etc.
      if (['bold', 'italic', 'underline'].includes(command)) {
        document.execCommand(command, false, value);
        updateActiveFormats(); // Refresh state immediately
        editorRef.current.focus();
        return;
      }
    }
    // Default formatting
    document.execCommand(command, false, value);
    editorRef.current.focus();
    updateActiveFormats();
  };

  const insertImage = () => {
    const url = prompt('Enter the image URL:');
    if (url) formatText('insertImage', url);
  };

  const insertLink = () => {
    const url = prompt('Enter the URL:');
    if (url) formatText('createLink', url);
  };

  const insertCode = () => {
    formatText('formatBlock', '<pre>');
  };

  const insertLatex = () => {
    const latexCode = prompt('Enter LaTeX code:');
    if (latexCode) {
      const latexElement = document.createElement('span');
      latexElement.className = 'latex-equation';
      latexElement.textContent = `$$${latexCode}$$`;
      formatText('insertHTML', latexElement.outerHTML);
    }
  };

  const buttons = [
    { icon: <FiBold />, command: 'bold', name: 'Bold', action: () => formatText('bold') },
    { icon: <FiItalic />, command: 'italic', name: 'Italic', action: () => formatText('italic') },
    { icon: <FiUnderline />, command: 'underline', name: 'Underline', action: () => formatText('underline') },


    { icon: <FiAlignLeft />, command: 'justifyLeft', name: 'Align Left', action: () => formatText('justifyLeft') },
    { icon: <FiAlignCenter />, command: 'justifyCenter', name: 'Align Center', action: () => formatText('justifyCenter') },
    { icon: <FiAlignRight />, command: 'justifyRight', name: 'Align Right', action: () => formatText('justifyRight') },
    { icon: <FiAlignJustify />, command: 'justifyFull', name: 'Justify', action: () => formatText('justifyFull') },
    { icon: <FiLink />, command: 'createLink', name: 'Insert Link', action: insertLink },
    { icon: <FiImage />, command: 'insertImage', name: 'Upload Image', action: insertImage },
    { icon: <FiCode />, command: 'formatBlock', name: 'Insert Code', action: insertCode },
    { icon: <PiMathOperationsFill />, command: 'insertLatex', name: 'Insert LaTeX', action: insertLatex },
    { icon: <FiRotateCcw />, command: 'undo', name: 'Undo', action: () => formatText('undo') },
    { icon: <FiRotateCw />, command: 'redo', name: 'Redo', action: () => formatText('redo') },
  ];

  // Check formatting status
  const updateActiveFormats = () => {
    const selection = window.getSelection();
    const isInsideEditor = editorRef.current && editorRef.current.contains(selection.anchorNode);

    if (!isInsideEditor) {
      setActiveFormats([]);
      return;
    }

    const formats = [
      'bold',
      'italic',
      'underline',
      'insertUnorderedList',
      'insertOrderedList',
      'justifyLeft',
      'justifyCenter',
      'justifyRight',
      'justifyFull'
    ];
    const active = formats.filter((cmd) => document.queryCommandState(cmd));
    setActiveFormats(active);
  };

  useEffect(() => {
    const handleSelectionChange = () => updateActiveFormats();

    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    }
  });

  return (
    <div className="flex items-center gap-1 mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
      {buttons.map((button) => (
        <React.Fragment key={button.command}>
          <div className="relative">
            <button
              type="button"
              className={`
              p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold
              ${activeFormats.includes(button.command)
                  ? 'bg-teal-500 text-white border-teal-500'
                  : 'bg-white text-gray-800 border-gray-200 hover:bg-teal-500 hover:text-white hover:border-teal-500'}
            `}
              onClick={button.action}
              onMouseEnter={() => {
                setTooltip(button.name);
                setHoveredIcon(button.command);
              }}
              onMouseLeave={() => {
                setTooltip('');
                setHoveredIcon(null);
              }}
            >
              {React.cloneElement(button.icon, { className: "font-bold" })}
            </button>

            {tooltip === button.name && (
              <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
                {button.name}
              </div>
            )}
          </div>

          {/* Insert dropdowns after underline */}
          {button.command === 'underline' && (
            <>
              {/* Bullet List Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className={`
                  p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold
                  ${activeFormats.includes('insertUnorderedList')
                      ? 'bg-teal-500 text-white border-teal-500'
                      : 'bg-white text-gray-800 border-gray-200 hover:bg-teal-500 hover:text-white hover:border-teal-500'}
                `}
                  onClick={() => setShowBulletDropdown(!showBulletDropdown)}
                  onMouseEnter={() => {
                    setTooltip('Bullet List');
                    setHoveredIcon('insertUnorderedList');
                  }}
                  onMouseLeave={() => {
                    setTooltip('');
                    setHoveredIcon(null);
                  }}
                >
                  <FiList />
                </button>

                {tooltip === 'Bullet List' && (
                  <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
                    Bullet List
                  </div>
                )}

                {showBulletDropdown && (
                  <div className="absolute z-20 left-0 mt-1 w-40 bg-white rounded-md border border-gray-200 shadow-md">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-teal-500 hover:text-white text-sm"
                      onClick={() => {
                        formatText('insertUnorderedList');
                        setShowBulletDropdown(false);
                      }}
                    >
                      • Bulleted List
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-teal-500 hover:text-white text-sm"
                      onClick={() => {
                        formatText('insertHTML', '<ul><li>☐ Item 1</li><li>☐ Item 2</li></ul>');
                        setShowBulletDropdown(false);
                      }}
                    >
                      ☐ Checklist
                    </button>
                  </div>
                )}
              </div>

              {/* Numbered List Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className={`
                  p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold
                  ${activeFormats.includes('insertOrderedList')
                      ? 'bg-teal-500 text-white border-teal-500'
                      : 'bg-white text-gray-800 border-gray-200 hover:bg-teal-500 hover:text-white hover:border-teal-500'}
                `}
                  onClick={() => setShowNumberDropdown(!showNumberDropdown)}
                  onMouseEnter={() => {
                    setTooltip('Numbered List');
                    setHoveredIcon('insertOrderedList');
                  }}
                  onMouseLeave={() => {
                    setTooltip('');
                    setHoveredIcon(null);
                  }}
                >
                  <MdFormatListNumbered />
                </button>

                {tooltip === 'Numbered List' && (
                  <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
                    Numbered List
                  </div>
                )}

                {showNumberDropdown && (
                  <div className="absolute z-20 left-0 mt-1 w-44 bg-white rounded-md border border-gray-200 shadow-md">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-teal-500 hover:text-white text-sm"
                      onClick={() => {
                        formatText('insertOrderedList');
                        setShowNumberDropdown(false);
                      }}
                    >
                      1. Numbered List
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-teal-500 hover:text-white text-sm"
                      onClick={() => {
                        formatText('insertHTML', '<ol type="i"><li>First</li><li>Second</li></ol>');
                        setShowNumberDropdown(false);
                      }}
                    >
                      i. Roman List
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default BlogEditorToolbar;
