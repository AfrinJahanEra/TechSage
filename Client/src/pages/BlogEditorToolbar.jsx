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

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
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
    { icon: <FiList />, command: 'insertUnorderedList', name: 'Bullet List', action: () => formatText('insertUnorderedList') },
    { icon: <MdFormatListNumbered />, command: 'insertOrderedList', name: 'Numbered List', action: () => formatText('insertOrderedList') },
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
  const handleSelectionChange = () => {
    const active = [];
    ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList',
      'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'].forEach(cmd => {
        if (document.queryCommandState(cmd)) active.push(cmd);
      });
    setActiveFormats(active);
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  return (
    <div className="flex items-center gap-1 mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
      {buttons.map((button) => (
        <div key={button.command} className="relative">
          <button
            type="button"
            className={`p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold
    ${activeFormats.includes(button.command)
                ? 'bg-teal-500 text-white border-teal-500'
                : 'bg-white text-gray-800 border-gray-200 hover:bg-teal-500 hover:text-white hover:border-teal-500'
              }
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
      ))}
    </div>
  );
};

export default BlogEditorToolbar;
