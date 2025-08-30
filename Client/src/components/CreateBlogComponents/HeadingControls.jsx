import React, { useState, useRef, useEffect } from 'react';
import { FiType, FiChevronDown } from 'react-icons/fi';

const HeadingControls = ({ editor, primaryColor, darkMode, readOnly }) => {
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
  const [tooltip, setTooltip] = useState('');
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const headingButtonRef = useRef(null);

  const headingStyles = [
    { name: 'Paragraph', level: null },
    { name: 'Heading 1', level: 1 },
    { name: 'Heading 2', level: 2 },
    { name: 'Heading 3', level: 3 },
    { name: 'Heading 4', level: 4 },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headingButtonRef.current && !headingButtonRef.current.contains(e.target) && !e.target.closest('.heading-dropdown')) {
        setShowHeadingDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={headingButtonRef}>
      <button
        type="button"
        className={`
          p-2.5 rounded-md border shadow-sm transition-colors duration-200 font-bold flex items-center gap-1
          ${editor.isActive('heading') ? 'text-white' : darkMode ? 'text-gray-200 hover:text-white' : 'text-gray-800 hover:text-white'}
        `}
        onClick={() => !readOnly && setShowHeadingDropdown(!showHeadingDropdown)}
        onMouseEnter={() => {
          setTooltip('Headings');
          setHoveredIcon('heading');
        }}
        onMouseLeave={() => {
          setTooltip('');
          setHoveredIcon(null);
        }}
        disabled={readOnly}
        style={{
          backgroundColor: editor.isActive('heading') || hoveredIcon === 'heading'
            ? primaryColor
            : darkMode
              ? '#374151'
              : 'white',
          borderColor: editor.isActive('heading') || hoveredIcon === 'heading'
            ? primaryColor
            : darkMode
              ? '#4b5563'
              : '#e5e7eb',
        }}
      >
        <FiType />
        <FiChevronDown />
      </button>
      {tooltip === 'Headings' && (
        <div
          className={`absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1 text-xs rounded whitespace-nowrap ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}
        >
          Headings
          <span className="ml-2 text-gray-400">{`(Ctrl+Alt+[0-4])`}</span>
        </div>
      )}
      {showHeadingDropdown && !readOnly && (
        <div
          className={`heading-dropdown absolute z-20 left-0 mt-1 w-44 rounded-md border shadow-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
        >
          {headingStyles.map((style) => (
            <button
              key={style.name}
              className={`heading-item-button w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${editor.isActive('heading', { level: style.level }) ? 'active' : darkMode ? 'text-white' : 'text-gray-800'}`}
              style={{
                backgroundColor: editor.isActive('heading', { level: style.level }) ? primaryColor : 'transparent',
                color: editor.isActive('heading', { level: style.level }) ? 'white' : darkMode ? 'white' : '#1f2937',
                borderColor: editor.isActive('heading', { level: style.level }) ? primaryColor : 'transparent',
              }}
              onClick={() => {
                if (style.level) {
                  editor.chain().focus().toggleHeading({ level: style.level }).run();
                } else {
                  editor.chain().focus().setParagraph().run();
                }
                setShowHeadingDropdown(false);
              }}
            >
              {style.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeadingControls;