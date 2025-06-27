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
    <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200 relative">
      {buttons.map((button) => (
        <div key={button.command} className="relative">
          <button
            type="button"
            className={`p-1.5 rounded hover:bg-gray-100 text-gray-700 ${
              activeFormat === button.command ? 'text-teal-500' : ''
            } ${
              hoveredIcon === button.command ? 'text-teal-500' : ''
            }`}
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
            {button.icon}
          </button>
          
          {tooltip === button.name && (
            <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
              {button.name}
            </div>
          )}
        </div>
      ))}

      {/* Alignment Dropdown */}
      <div className="relative">
        <button
          type="button"
          className={`p-1.5 rounded hover:bg-gray-100 text-gray-700 ${
            hoveredIcon === 'alignment' ? 'text-teal-500' : ''
          }`}
          onMouseEnter={() => {
            setTooltip('Alignment');
            setHoveredIcon('alignment');
          }}
          onMouseLeave={() => {
            setTooltip('');
            setHoveredIcon(null);
          }}
        >
          <div className="flex items-center">
            <FiAlignLeft />
            <FiChevronDown className="ml-1" size={12} />
          </div>
        </button>
        
        {tooltip === 'Alignment' && (
          <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
            Alignment
          </div>
        )}

        {showAlignmentOptions && (
          <div className="absolute z-20 left-0 mt-1 bg-white shadow-lg rounded-md p-2 flex flex-col gap-1">
            <button
              className="p-1.5 rounded hover:bg-gray-100 text-gray-700 flex items-center gap-2"
              onClick={() => handleAlignmentChange('Left')}
              onMouseEnter={() => setTooltip('Align Left')}
              onMouseLeave={() => setTooltip('')}
            >
              <FiAlignLeft /> Left
              {tooltip === 'Align Left' && (
                <div className="absolute left-full ml-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
                  Align Left
                </div>
              )}
            </button>
            <button
              className="p-1.5 rounded hover:bg-gray-100 text-gray-700 flex items-center gap-2"
              onClick={() => handleAlignmentChange('Center')}
              onMouseEnter={() => setTooltip('Center')}
              onMouseLeave={() => setTooltip('')}
            >
              <FiAlignCenter /> Center
              {tooltip === 'Center' && (
                <div className="absolute left-full ml-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
                  Center
                </div>
              )}
            </button>
            <button
              className="p-1.5 rounded hover:bg-gray-100 text-gray-700 flex items-center gap-2"
              onClick={() => handleAlignmentChange('Right')}
              onMouseEnter={() => setTooltip('Align Right')}
              onMouseLeave={() => setTooltip('')}
            >
              <FiAlignRight /> Right
              {tooltip === 'Align Right' && (
                <div className="absolute left-full ml-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
                  Align Right
                </div>
              )}
            </button>
            <button
              className="p-1.5 rounded hover:bg-gray-100 text-gray-700 flex items-center gap-2"
              onClick={() => handleAlignmentChange('Full')}
              onMouseEnter={() => setTooltip('Justify')}
              onMouseLeave={() => setTooltip('')}
            >
              <FiAlignJustify /> Justify
              {tooltip === 'Justify' && (
                <div className="absolute left-full ml-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
                  Justify
                </div>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogEditorToolbar;