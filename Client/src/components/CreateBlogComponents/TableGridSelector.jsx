import React, { useState, useEffect, useRef } from 'react';

const TableGridSelector = ({ editor, primaryColor, darkMode, onClose, tableButtonRef }) => {
  const [hoveredSize, setHoveredSize] = useState({ rows: 0, cols: 0 });
  const maxRows = 6;
  const maxCols = 6;
  const gridRef = useRef(null);

  const handleMouseEnter = (row, col) => {
    setHoveredSize({ rows: row + 1, cols: col + 1 });
  };

  const handleClick = (row, col) => {
    editor.chain().focus().insertTable({ rows: row + 1, cols: col + 1, withHeaderRow: true }).run();
    onClose();
  };

  // Close grid selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        gridRef.current &&
        !gridRef.current.contains(event.target) &&
        tableButtonRef.current &&
        !tableButtonRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const buttonRect = tableButtonRef.current?.getBoundingClientRect();

  return (
    <div
      ref={gridRef}
      className={`absolute z-20 mt-2 p-4 rounded-lg shadow-lg border ${
        darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
      }`}
      style={{
        top: buttonRect ? buttonRect.bottom + window.scrollY + 4 : '100%',
        left: buttonRect ? buttonRect.left + window.scrollX : 0,
      }}
    >
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${maxCols}, 20px)` }}>
        {Array.from({ length: maxRows }).map((_, rowIndex) =>
          Array.from({ length: maxCols }).map((_, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-5 h-5 border cursor-pointer ${
                rowIndex < hoveredSize.rows && colIndex < hoveredSize.cols
                  ? 'bg-blue-100 border-blue-500'
                  : darkMode
                  ? 'bg-gray-700 border-gray-600'
                  : 'bg-gray-100 border-gray-300'
              }`}
              onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              onClick={() => handleClick(rowIndex, colIndex)}
            />
          ))
        )}
      </div>
      <div className={`mt-2 text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        {hoveredSize.rows} × {hoveredSize.cols}
      </div>
    </div>
  );
};

export default TableGridSelector;