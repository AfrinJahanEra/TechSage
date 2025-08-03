import React, { useState, useRef, useEffect } from 'react';
import { FiArrowUp, FiArrowDown, FiXCircle, FiArrowLeft, FiArrowRight, FiXSquare, FiGrid, FiTrash2 } from 'react-icons/fi';

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
      icon: <FiXCircle />,
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
      icon: <FiXSquare />,
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
    {
      icon: <FiTrash2 />,
      name: 'Delete Table',
      action: () => editor.chain().focus().deleteTable().run(),
      disabled: !editor.can().deleteTable(),
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
      style={{
        background: darkMode ? '#374151' : 'white',
        border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        borderRadius: '6px',
        padding: '8px',
        display: 'flex',
        gap: '8px',
        zIndex: 20,
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        transform: 'translateY(0)',
      }}
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
              p-2.5 rounded-md border shadow-sm transition-all duration-200 font-bold table-item-button
              ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
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
              className={`absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1 text-xs rounded whitespace-nowrap ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}
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