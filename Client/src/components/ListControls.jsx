import React, { useState, useEffect, useRef } from 'react';
import { FiList, FiChevronDown } from 'react-icons/fi';
import { MdFormatListNumbered } from 'react-icons/md';

const ListControls = ({ editorRef, darkMode, primaryColor, activeFormats, setActiveFormats }) => {
  const [showBulletDropdown, setShowBulletDropdown] = useState(false);
  const [showNumberedDropdown, setShowNumberedDropdown] = useState(false);
  const [tooltip, setTooltip] = useState('');
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const bulletButtonRef = useRef(null);
  const numberedButtonRef = useRef(null);

  const bulletStyles = [
    { name: 'Empty Circle', type: 'unordered', value: 'circle', style: 'list-style-type: circle; padding-left: 30px; margin: 0;', liStyle: '' },
    { name: 'Filled Circle', type: 'unordered', value: 'disc', style: 'list-style-type: disc; padding-left: 30px; margin: 0;', liStyle: '' },
    { name: 'Square', type: 'unordered', value: 'square', style: 'list-style-type: square; padding-left: 30px; margin: 0;', liStyle: '' },
  ];

  const numberedStyles = [
    { name: 'Numbers', type: 'ordered', value: 'decimal', style: 'list-style-type: decimal; padding-left: 30px; margin: 0;', liStyle: '' },
    { name: 'Letters', type: 'ordered', value: 'lower-alpha', style: 'list-style-type: lower-alpha; padding-left: 30px; margin: 0;', liStyle: '' },
    { name: 'Roman Numerals', type: 'ordered', value: 'lower-roman', style: 'list-style-type: lower-roman; padding-left: 30px; margin: 0;', liStyle: '' },
  ];

  const handleSelectListStyle = (styleObj) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    try {
      if (range && !range.collapsed) {
        const clonedRange = range.cloneRange();
        const fragment = clonedRange.cloneContents();
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(fragment);

        const lines = [];
        const processNode = (node) => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            lines.push(node.textContent.trim());
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (['P', 'DIV', 'LI'].includes(node.tagName)) {
              node.childNodes.forEach(child => processNode(child));
            } else if (node.tagName === 'BR') {
              if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
            }
          }
        };
        tempDiv.childNodes.forEach(processNode);

        const listTag = styleObj.type === 'ordered' ? 'ol' : 'ul';
        const list = document.createElement(listTag);
        list.style.cssText = styleObj.style;
        list.setAttribute('style', styleObj.style);
        list.setAttribute('data-list-style', styleObj.value);

        lines.forEach(text => {
          if (text.trim()) {
            const li = document.createElement('li');
            li.style.cssText = styleObj.liStyle ? `position: relative; ${styleObj.liStyle}` : '';
            li.textContent = text;
            list.appendChild(li);
          }
        });

        const commonAncestor = range.commonAncestorContainer;
        const parentList = commonAncestor.nodeType === Node.ELEMENT_NODE
          ? commonAncestor.closest('ul,ol')
          : commonAncestor.parentElement?.closest('ul,ol');

        if (parentList && parentList.parentElement === editor) {
          const startLi = range.startContainer.nodeType === Node.ELEMENT_NODE && range.startContainer.tagName === 'LI'
            ? range.startContainer
            : range.startContainer.closest('li');
          const endLi = range.endContainer.nodeType === Node.ELEMENT_NODE && range.endContainer.tagName === 'LI'
            ? range.endContainer
            : range.endContainer.closest('li');

          if (startLi && endLi && startLi.parentElement === parentList && endLi.parentElement === parentList) {
            const rangeToReplace = document.createRange();
            rangeToReplace.setStartBefore(startLi);
            rangeToReplace.setEndAfter(endLi);
            rangeToReplace.extractContents();
            rangeToReplace.insertNode(list);

            if (parentList.children.length === 0) {
              parentList.remove();
            }
          } else {
            range.deleteContents();
            range.insertNode(list);
          }
        } else {
          range.deleteContents();
          range.insertNode(list);
        }

        const lastLi = list.querySelector('li:last-child');
        if (lastLi) {
          const newRange = document.createRange();
          newRange.setStart(lastLi, lastLi.childNodes.length);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } else {
        const listTag = styleObj.type === 'ordered' ? 'ol' : 'ul';
        const list = document.createElement(listTag);
        list.style.cssText = styleObj.style;
        list.setAttribute('data-list-style', styleObj.value);
        const li = document.createElement('li');
        li.style.cssText = styleObj.liStyle ? `position: relative; ${styleObj.liStyle}` : 'position: relative;';
        list.appendChild(li);

        if (range && editor.contains(range.startContainer)) {
          range.deleteContents();
          range.insertNode(list);
        } else {
          editor.appendChild(list);
        }

        const firstLi = list.querySelector('li');
        if (firstLi) {
          const newRange = document.createRange();
          newRange.setStart(firstLi, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    } catch (error) {
      console.error('Error inserting list:', error);
    }

    setShowBulletDropdown(false);
    setShowNumberedDropdown(false);
    editor.focus();
    updateActiveFormats();
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        if (!range || !editor.contains(range.startContainer)) return;

        const currentLi = range.startContainer.closest('li');
        if (!currentLi) return;

        const parentList = currentLi.parentElement;
        if (!['UL', 'OL'].includes(parentList.tagName)) return;

        e.preventDefault();
        if (currentLi.textContent.trim() === '') {
          const p = document.createElement('p');
          p.appendChild(document.createTextNode(''));

          if (parentList.children.length === 1) {
            parentList.replaceWith(p);
          } else {
            currentLi.remove();
            parentList.insertAdjacentElement('afterend', p);
          }

          const newRange = document.createRange();
          newRange.setStart(p, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          editor.focus();
        } else {
          const newLi = document.createElement('li');
          newLi.style.cssText = currentLi.style.cssText;
          currentLi.insertAdjacentElement('afterend', newLi);

          const newRange = document.createRange();
          newRange.setStart(newLi, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }

      if (e.key === 'Backspace') {
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        if (!range || !editor.contains(range.startContainer)) return;

        const currentLi = range.startContainer.closest('li');
        if (!currentLi) return;

        const parentList = currentLi.parentElement;
        if (!['UL', 'OL'].includes(parentList.tagName)) return;

        if (currentLi.textContent.trim() === '') {
          e.preventDefault();
          const p = document.createElement('p');
          p.appendChild(document.createTextNode(''));

          if (parentList.children.length === 1) {
            parentList.replaceWith(p);
          } else {
            currentLi.remove();
            parentList.insertAdjacentElement('afterend', p);
          }

          const newRange = document.createRange();
          newRange.setStart(p, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          editor.focus();
        }
      }
    };

    editor.addEventListener('keydown', handleKeyDown);
    return () => editor.removeEventListener('keydown', handleKeyDown);
  }, [editorRef]);

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

  const getActiveListStyle = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;
    const range = selection.getRangeAt(0);
    const parentList = range.startContainer.closest('ul,ol');
    if (parentList) {
      return parentList.getAttribute('data-list-style');
    }
    return null;
  };

  // Handle clicks outside dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        bulletButtonRef.current &&
        numberedButtonRef.current &&
        !bulletButtonRef.current.contains(e.target) &&
        !numberedButtonRef.current.contains(e.target) &&
        !e.target.closest('.list-dropdown')
      ) {
        setShowBulletDropdown(false);
        setShowNumberedDropdown(false);
        if (editorRef.current) {
          editorRef.current.focus();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editorRef]);

  return (
    <>
      <style>
        {`
          .list-item-button:hover {
            background-color: ${primaryColor} !important;
            color: white !important;
            border-color: ${primaryColor} !important;
          }
          .list-item-button.active {
            background-color: ${primaryColor} !important;
            color: white !important;
            border-color: ${primaryColor} !important;
          }
        `}
      </style>
      <div className="relative" ref={bulletButtonRef}>
        <button
          type="button"
          className={`
            p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold flex items-center gap-1
            ${
              activeFormats.includes('insertUnorderedList')
                ? 'text-white'
                : darkMode
                ? 'text-gray-200 hover:text-white'
                : 'text-gray-800 hover:text-white'
            }
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
          style={{
            backgroundColor: activeFormats.includes('insertUnorderedList') ? primaryColor : darkMode ? '#374151' : 'white',
            borderColor: activeFormats.includes('insertUnorderedList') ? primaryColor : darkMode ? '#4b5563' : '#e5e7eb'
          }}
        >
          <FiList />
          <FiChevronDown className="text-sm" />
        </button>

        {tooltip === 'Bullet List' && (
          <div
            className={`absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap ${
              darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'
            }`}
          >
            Bullet List
          </div>
        )}

        {showBulletDropdown && (
          <div
            className={`list-dropdown absolute z-20 left-0 mt-1 w-44 rounded-md border shadow-md ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
            }`}
          >
            {bulletStyles.map((style) => {
              const isActive = activeFormats.includes('insertUnorderedList') && getActiveListStyle() === style.value;
              return (
                <button
                  key={style.value}
                  className={`list-item-button w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                    isActive ? 'active' : darkMode ? 'text-white' : 'text-gray-800'
                  }`}
                  style={{
                    backgroundColor: isActive ? primaryColor : 'transparent',
                    color: isActive ? 'white' : darkMode ? 'white' : '#1f2937',
                    borderColor: isActive ? primaryColor : 'transparent'
                  }}
                  onClick={() => handleSelectListStyle(style)}
                >
                  <span style={{ display: 'inline-block', width: '25px', textAlign: 'center' }}>
                    {style.value === 'circle' ? '○' : style.value === 'disc' ? '●' : '■'}
                  </span>
                  {style.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="relative" ref={numberedButtonRef}>
        <button
          type="button"
          className={`
            p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold flex items-center gap-1
            ${
              activeFormats.includes('insertOrderedList')
                ? 'text-white'
                : darkMode
                ? 'text-gray-200 hover:text-white'
                : 'text-gray-800 hover:text-white'
            }
          `}
          onClick={() => setShowNumberedDropdown(!showNumberedDropdown)}
          onMouseEnter={() => {
            setTooltip('Numbered List');
            setHoveredIcon('insertOrderedList');
          }}
          onMouseLeave={() => {
            setTooltip('');
            setHoveredIcon(null);
          }}
          style={{
            backgroundColor: activeFormats.includes('insertOrderedList') ? primaryColor : darkMode ? '#374151' : 'white',
            borderColor: activeFormats.includes('insertOrderedList') ? primaryColor : darkMode ? '#4b5563' : '#e5e7eb'
          }}
        >
          <MdFormatListNumbered />
          <FiChevronDown className="text-sm" />
        </button>

        {tooltip === 'Numbered List' && (
          <div
            className={`absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap ${
              darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'
            }`}
          >
            Numbered List
          </div>
        )}

        {showNumberedDropdown && (
          <div
            className={`list-dropdown absolute z-20 left-0 mt-1 w-44 rounded-md border shadow-md ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
            }`}
          >
            {numberedStyles.map((style) => {
              const isActive = activeFormats.includes('insertOrderedList') && getActiveListStyle() === style.value;
              return (
                <button
                  key={style.value}
                  className={`list-item-button w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                    isActive ? 'active' : darkMode ? 'text-white' : 'text-gray-800'
                  }`}
                  style={{
                    backgroundColor: isActive ? primaryColor : 'transparent',
                    color: isActive ? 'white' : darkMode ? 'white' : '#1f2937',
                    borderColor: isActive ? primaryColor : 'transparent'
                  }}
                  onClick={() => handleSelectListStyle(style)}
                >
                  <span style={{ display: 'inline-block', width: '25px', textAlign: 'center' }}>
                    {style.value === 'decimal' ? '1.' : style.value === 'lower-alpha' ? 'a.' : 'i.'}
                  </span>
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

export default ListControls;