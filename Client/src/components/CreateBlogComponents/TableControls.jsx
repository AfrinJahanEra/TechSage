import React, { useState, useRef, useEffect } from 'react';
import { FiPlus, FiMinus, FiArrowUp, FiArrowDown, FiArrowLeft, FiArrowRight, FiGrid } from 'react-icons/fi';

const TableControls = ({ editor, primaryColor, darkMode, onClose, tableFormatButtonRef }) => {
  const [tooltip, setTooltip] = useState('');
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const tableDropdownRef = useRef(null);

  const tableOptions = [
    {
      icon: <FiArrowUp />,
      name: 'Add Row Above',
      action: () => editor.chain().focus().addRowBefore().run(),
      disabled: !editor.can().addRowBefore(),
    },
    {
      icon: <FiArrowDown />,
      name: 'Add Row Below',
      action: () => editor.chain().focus().addRowAfter().run(),
      disabled: !editor.can().addRowAfter(),
    },
    {
      icon: <FiMinus />,
      name: 'Delete Row',
      action: () => editor.chain().focus().deleteRow().run(),
      disabled: !editor.can().deleteRow(),
    },
    {
      icon: <FiArrowLeft />,
      name: 'Add Column Left',
      action: () => editor.chain().focus().addColumnBefore().run(),
      disabled: !editor.can().addColumnBefore(),
    },
    {
      icon: <FiArrowRight />,
      name: 'Add Column Right',
      action: () => editor.chain().focus().addColumnAfter().run(),
      disabled: !editor.can().addColumnAfter(),
    },
    {
      icon: <FiMinus />,
      name: 'Delete Column',
      action: () => editor.chain().focus().deleteColumn().run(),
      disabled: !editor.can().deleteColumn(),
    },
    {
      icon: <FiGrid />,
      name: 'Merge/Split Cells',
      action: () => editor.chain().focus().mergeOrSplit().run(),
      disabled: !editor.can().mergeOrSplit(),
    },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        tableDropdownRef.current &&
        !tableDropdownRef.current.contains(e.target) &&
        tableFormatButtonRef &&
        !tableFormatButtonRef.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, tableFormatButtonRef]);

  return (
    <div
      ref={tableDropdownRef}
      className="table-dropdown"
    >
      {tableOptions.map((option) => (
        <div className="relative" key={option.name}>
          <button
            type="button"
            onClick={() => {
              option.action();
              onClose();
            }}
            disabled={option.disabled}
            className={`
              p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold table-item-button
              ${darkMode ? 'text-gray-200 hover:text-white' : 'text-gray-800 hover:text-white'}
            `}
            onMouseEnter={() => {
              setTooltip(option.name);
              setHoveredIcon(option.name);
            }}
            onMouseLeave={() => {
              setTooltip('');
              setHoveredIcon(null);
            }}
            style={{
              backgroundColor: hoveredIcon === option.name ? primaryColor : darkMode ? '#374151' : 'white',
              borderColor: hoveredIcon === option.name ? primaryColor : darkMode ? '#4b5563' : '#e5e7eb',
            }}
          >
            {option.icon}
          </button>
          {tooltip === option.name && (
            <div
              className={`absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}
            >
              {option.name}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TableControls;