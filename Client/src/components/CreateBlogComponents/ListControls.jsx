import React, { useState, useRef, useEffect } from 'react';
import { FiList, FiChevronDown } from 'react-icons/fi';
import { MdFormatListNumbered } from 'react-icons/md';

const ListControls = ({ editor, primaryColor, darkMode }) => {
  const [showBulletDropdown, setShowBulletDropdown] = useState(false);
  const [showNumberDropdown, setShowNumberDropdown] = useState(false);
  const [tooltip, setTooltip] = useState('');
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const bulletButtonRef = useRef(null);
  const numberButtonRef = useRef(null);

  const bulletStyles = [
    { name: 'Disc', style: 'disc' },
    { name: 'Circle', style: 'circle' },
    { name: 'Square', style: 'square' },
  ];

  const numberStyles = [
    { name: 'Decimal', style: 'decimal' },
    { name: 'Upper Roman', style: 'upper-roman' },
    { name: 'Lower Roman', style: 'lower-roman' },
    { name: 'Upper Alpha', style: 'upper-alpha' },
    { name: 'Lower Alpha', style: 'lower-alpha' },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bulletButtonRef.current && !bulletButtonRef.current.contains(e.target) && !e.target.closest('.bullet-dropdown')) {
        setShowBulletDropdown(false);
      }
      if (numberButtonRef.current && !numberButtonRef.current.contains(e.target) && !e.target.closest('.number-dropdown')) {
        setShowNumberDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="relative" ref={bulletButtonRef}>
        <button
          type="button"
          className={`
            p-2.5 rounded-md border shadow-sm transition-colors duration-200 font-bold flex items-center gap-1
            ${editor.isActive('bulletList') ? 'text-white' : darkMode ? 'text-gray-200 hover:text-white' : 'text-gray-800 hover:text-white'}
          `}
          onClick={() => setShowBulletDropdown(!showBulletDropdown)}
          onMouseEnter={() => {
            setTooltip('Bullet Styles');
            setHoveredIcon('bullet');
          }}
          onMouseLeave={() => {
            setTooltip('');
            setHoveredIcon(null);
          }}
          style={{
            backgroundColor: editor.isActive('bulletList') || hoveredIcon === 'bullet'
              ? primaryColor
              : darkMode
                ? '#374151'
                : 'white',
            borderColor: editor.isActive('bulletList') || hoveredIcon === 'bullet'
              ? primaryColor
              : darkMode
                ? '#4b5563'
                : '#e5e7eb',
          }}
        >
          <FiList />
          <FiChevronDown />
        </button>
        {tooltip === 'Bullet Styles' && (
          <div
            className={`absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}
          >
            Bullet Styles
          </div>
        )}
        {showBulletDropdown && (
          <div
            className={`bullet-dropdown absolute z-20 left-0 mt-1 w-44 rounded-md border shadow-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
          >
            {bulletStyles.map((style) => (
              <button
                key={style.name}
                className={`bullet-item-button w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${editor.isActive('bulletList', { bulletStyle: style.style }) ? 'active' : darkMode ? 'text-white' : 'text-gray-800'}`}
                style={{
                  backgroundColor: editor.isActive('bulletList', { bulletStyle: style.style }) ? primaryColor : 'transparent',
                  color: editor.isActive('bulletList', { bulletStyle: style.style }) ? 'white' : darkMode ? 'white' : '#1f2937',
                  borderColor: editor.isActive('bulletList', { bulletStyle: style.style }) ? primaryColor : 'transparent',
                }}
                onClick={() => {
                  if (editor.isActive('bulletList')) {
                    editor.chain().focus().setBulletListStyle(style.style).run();
                  } else {
                    editor.chain().focus().toggleBulletList().setBulletListStyle(style.style).run();
                  }
                  setShowBulletDropdown(false);
                }}
              >
                {style.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="relative" ref={numberButtonRef}>
        <button
          type="button"
          className={`
            p-2.5 rounded-md border shadow-sm transition-colors duration-200 font-bold flex items-center gap-1
            ${editor.isActive('orderedList') ? 'text-white' : darkMode ? 'text-gray-200 hover:text-white' : 'text-gray-800 hover:text-white'}
          `}
          onClick={() => setShowNumberDropdown(!showNumberDropdown)}
          onMouseEnter={() => {
            setTooltip('Number Styles');
            setHoveredIcon('number');
          }}
          onMouseLeave={() => {
            setTooltip('');
            setHoveredIcon(null);
          }}
          style={{
            backgroundColor: editor.isActive('orderedList') || hoveredIcon === 'number'
              ? primaryColor
              : darkMode
                ? '#374151'
                : 'white',
            borderColor: editor.isActive('orderedList') || hoveredIcon === 'number'
              ? primaryColor
              : darkMode
                ? '#4b5563'
                : '#e5e7eb',
          }}
        >
          <MdFormatListNumbered />
          <FiChevronDown />
        </button>
        {tooltip === 'Number Styles' && (
          <div
            className={`absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}
          >
            Number Styles
          </div>
        )}
        {showNumberDropdown && (
          <div
            className={`number-dropdown absolute z-20 left-0 mt-1 w-44 rounded-md border shadow-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
          >
            {numberStyles.map((style) => (
              <button
                key={style.name}
                className={`number-item-button w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${editor.isActive('orderedList', { numberStyle: style.style }) ? 'active' : darkMode ? 'text-white' : 'text-gray-800'}`}
                style={{
                  backgroundColor: editor.isActive('orderedList', { numberStyle: style.style }) ? primaryColor : 'transparent',
                  color: editor.isActive('orderedList', { numberStyle: style.style }) ? 'white' : darkMode ? 'white' : '#1f2937',
                  borderColor: editor.isActive('orderedList', { numberStyle: style.style }) ? primaryColor : 'transparent',
                }}
                onClick={() => {
                  if (editor.isActive('orderedList')) {
                    editor.chain().focus().setOrderedListStyle(style.style).run();
                  } else {
                    editor.chain().focus().toggleOrderedList().setOrderedListStyle(style.style).run();
                  }
                  setShowNumberDropdown(false);
                }}
              >
                {style.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ListControls;