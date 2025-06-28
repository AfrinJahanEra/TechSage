import React, { useState } from 'react';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiAlignLeft,
  FiLink,
  FiImage,
  FiCode,
  FiRotateCcw,
  FiRotateCw,
  FiChevronDown,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify
} from 'react-icons/fi';
import { MdFormatListNumbered } from 'react-icons/md';
import { PiMathOperationsFill } from 'react-icons/pi';

const BlogEditorToolbar = ({ editorRef }) => {
  const [showAlignmentOptions, setShowAlignmentOptions] = useState(false);
  const [activeFormat, setActiveFormat] = useState(null);
  const [tooltip, setTooltip] = useState('');
  const [hoveredIcon, setHoveredIcon] = useState(null);

  // Formatting functions
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    setActiveFormat(command);
  };

  const handleAlignmentChange = (alignType) => {
    formatText('justify' + alignType);
    setShowAlignmentOptions(false);
  };

  const insertImage = () => {
    const url = prompt('Enter the image URL:');
    if (url) {
      formatText('insertImage', url);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter the URL:');
    if (url) {
      formatText('createLink', url);
    }
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

  // Toolbar buttons data
  const buttons = [
    {
      icon: <FiBold />,
      command: 'bold',
      name: 'Bold',
      action: () => formatText('bold')
    },
    {
      icon: <FiItalic />,
      command: 'italic',
      name: 'Italic',
      action: () => formatText('italic')
    },
    {
      icon: <FiUnderline />,
      command: 'underline',
      name: 'Underline',
      action: () => formatText('underline')
    },
    {
      icon: <FiList />,
      command: 'insertUnorderedList',
      name: 'Bullet List',
      action: () => formatText('insertUnorderedList')
    },
    {
      icon: <MdFormatListNumbered />,
      command: 'insertOrderedList',
      name: 'Numbered List',
      action: () => formatText('insertOrderedList')
    },
    {
      icon: <FiLink />,
      command: 'createLink',
      name: 'Insert Link',
      action: insertLink
    },
    {
      icon: <FiImage />,
      command: 'insertImage',
      name: 'Upload Image',
      action: insertImage
    },
    {
      icon: <FiCode />,
      command: 'formatBlock',
      name: 'Insert Code',
      action: insertCode
    },
    {
      icon: <PiMathOperationsFill />,
      command: 'insertLatex',
      name: 'Insert LaTeX',
      action: insertLatex
    },
    {
      icon: <FiRotateCcw />,
      command: 'undo',
      name: 'Undo',
      action: () => formatText('undo')
    },
    {
      icon: <FiRotateCw />,
      command: 'redo',
      name: 'Redo',
      action: () => formatText('redo')
    }
  ];

  return (
    <div className="flex items-center gap-1 mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200 relative">
      {buttons.map((button) => (
        <div key={button.command} className="relative">
          <button
            type="button"
            className={`
              p-2 rounded-md
              bg-white
              border border-gray-200
              shadow-sm
              transition-colors duration-200
              font-bold
              ${activeFormat === button.command ? 'bg-teal-500 text-white' : 'text-gray-800'}
              hover:bg-teal-500 hover:text-white
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


      {/* Alignment Dropdown */}
      <div className="relative">
        <button
          type="button"
          className={`
            p-2 rounded-md
            bg-white
            border border-gray-200
            shadow-sm
            transition-colors duration-200
            font-bold
            ${hoveredIcon === 'alignment' ? 'bg-teal-500 text-white' : 'text-gray-800'}
            hover:bg-teal-500 hover:text-white
          `}
          onClick={() => setShowAlignmentOptions(!showAlignmentOptions)}
          onMouseEnter={() => {
            setTooltip('Alignment');
            setHoveredIcon('alignment');
          }}
          onMouseLeave={() => {
            setTooltip('');
            setHoveredIcon(null);
          }}
        >
          <div className="flex items-center font-bold">
            <FiAlignLeft />
            <FiChevronDown className="ml-1" size={12} />
          </div>
        </button>
        
        {tooltip === 'Alignment' && (
          <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
            Alignment
          </div>
        )}

        {showAlignmentOptions && (
          <div className="absolute z-20 left-0 mt-1 bg-white shadow-lg rounded-md p-2 border border-gray-200">
            {[
              { icon: <FiAlignLeft />, name: 'Align Left', command: 'Left' },
              { icon: <FiAlignCenter />, name: 'Center', command: 'Center' },
              { icon: <FiAlignRight />, name: 'Align Right', command: 'Right' },
              { icon: <FiAlignJustify />, name: 'Justify', command: 'Full' }
            ].map((item) => (
              <button
                key={item.command}
                className="
                  w-full px-3 py-2 rounded-md
                  text-left text-gray-800 font-bold
                  hover:bg-teal-500 hover:text-white
                  flex items-center gap-2
                  transition-colors duration-200
                "
                onClick={() => handleAlignmentChange(item.command)}
                onMouseEnter={() => setTooltip(item.name)}
                onMouseLeave={() => setTooltip('')}
              >
                {React.cloneElement(item.icon, { className: "font-bold" })}
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


export default BlogEditorToolbar;