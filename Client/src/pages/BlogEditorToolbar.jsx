import React, { useState, useEffect, useRef } from 'react';
import {
  FiBold, FiItalic, FiUnderline, FiList, FiAlignLeft, FiAlignCenter, FiAlignRight,
  FiAlignJustify, FiLink, FiImage, FiCode, FiRotateCcw, FiRotateCw, FiX
} from 'react-icons/fi';
import { MdFormatListNumbered } from 'react-icons/md';
import { PiMathOperationsFill } from 'react-icons/pi';
import { useTheme } from '../context/ThemeContext';
import LatexModal from '../components/LatexModal';
import LinkModal from '../components/LinkModal';

const BlogEditorToolbar = ({ editorRef }) => {
  const { primaryColor, darkMode } = useTheme();
  const [tooltip, setTooltip] = useState('');
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [activeFormats, setActiveFormats] = useState([]);
  const [showBulletDropdown, setShowBulletDropdown] = useState(false);
  const [showNumberedDropdown, setShowNumberedDropdown] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [isEditingCodeBlock, setIsEditingCodeBlock] = useState(false);
  const [selectedCodeBlock, setSelectedCodeBlock] = useState(null);
  const [showLatexModal, setShowLatexModal] = useState(false);
  const [latexInput, setLatexInput] = useState('');
  const [isLatexSelected, setIsLatexSelected] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const fileInputRef = useRef(null);
  const lastKeyPress = useRef(null);

  const bulletStyles = [
    { name: 'Empty Circle', type: 'unordered', value: 'circle', style: 'list-style-type: circle; padding-left: 20px; margin: 0;', liStyle: '' },
    { name: 'Filled Circle', type: 'unordered', value: 'disc', style: 'list-style-type: disc; padding-left: 20px; margin: 0;', liStyle: '' },
    { name: 'Square', type: 'unordered', value: 'square', style: 'list-style-type: square; padding-left: 20px; margin: 0;', liStyle: '' },
  ];

  const numberedStyles = [
    { name: 'Numbers', type: 'ordered', value: 'decimal', style: 'list-style-type: decimal; padding-left: 20px; margin: 0;', liStyle: '' },
    { name: 'Letters', type: 'ordered', value: 'lower-alpha', style: 'list-style-type: lower-alpha; padding-left: 20px; margin: 0;', liStyle: '' },
    { name: 'Roman Numerals', type: 'ordered', value: 'lower-roman', style: 'list-style-type: lower-roman; padding-left: 20px; margin: 0;', liStyle: '' },
  ];

  const handleSelectListStyle = (styleObj) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

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
      list.removeAttribute('style');
      list.setAttribute('style', styleObj.style);
      list.setAttribute('data-list-style', styleObj.value);

      lines.forEach(text => {
        if (text.trim()) {
          const li = document.createElement('li');
          li.style.cssText = '';
          if (styleObj.liStyle) li.style.cssText = `position: relative; ${styleObj.liStyle}`;
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
        if (currentLi.textContent === '' && lastKeyPress.current === 'Enter') {
          const textNode = document.createTextNode('');
          const p = document.createElement('p');
          p.appendChild(textNode);

          if (parentList.children.length === 1) {
            parentList.replaceWith(p);
          } else {
            currentLi.remove();
            parentList.insertAdjacentElement('afterend', p);
          }

          const newRange = document.createRange();
          newRange.setStart(textNode, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          editor.focus();
        } else {
          const newLi = document.createElement('li');
          newLi.style.cssText = currentLi.style.cssText;
          currentLi.parentElement.appendChild(newLi);

          const newRange = document.createRange();
          newRange.setStart(newLi, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }

        lastKeyPress.current = 'Enter';
      } else {
        lastKeyPress.current = e.key;
      }

      if (e.key === 'Backspace') {
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        if (!range || !editor.contains(range.startContainer)) return;

        const currentLi = range.startContainer.closest('li');
        if (!currentLi) return;

        const parentList = currentLi.parentElement;
        if (!['UL', 'OL'].includes(parentList.tagName)) return;

        if (currentLi.textContent === '') {
          e.preventDefault();
          const textNode = document.createTextNode('');
          const p = document.createElement('p');
          p.appendChild(textNode);

          if (parentList.children.length === 1) {
            parentList.replaceWith(p);
          } else {
            currentLi.remove();
            parentList.insertAdjacentElement('afterend', p);
          }

          const newRange = document.createRange();
          newRange.setStart(textNode, 0);
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

  const insertCode = () => {
    setShowCodeModal(true);
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleCodeClick = (e) => {
      const pre = e.target.closest('pre.code-block');
      if (!pre || !editor.contains(pre)) return;

      const codeElement = pre.querySelector('code');
      const codeContent = codeElement?.textContent || '';
      const langClass = codeElement?.className || 'language-javascript';
      const language = langClass.replace('language-', '') || 'javascript';

      setCodeInput(codeContent);
      setCodeLanguage(language);
      setIsEditingCodeBlock(true);
      setSelectedCodeBlock(pre);
      setShowCodeModal(true);
    };

    editor.addEventListener('click', handleCodeClick);
    return () => {
      editor.removeEventListener('click', handleCodeClick);
    };
  }, [editorRef]);

  const handleInsertCodeBlock = () => {
    if (!codeInput.trim()) return;

    const pre = document.createElement('pre');
    const code = document.createElement('code');

    code.textContent = codeInput;
    code.className = `language-${codeLanguage}`;
    pre.className = 'code-block';
    pre.contentEditable = 'false';
    pre.appendChild(code);

    pre.style.padding = '1em';
    pre.style.borderRadius = '8px';
    pre.style.overflowX = 'auto';
    pre.style.background = darkMode ? '#1e293b' : '#f3f4f6';
    pre.style.color = darkMode ? '#e2e8f0' : '#1e293b';
    pre.style.margin = '1em 0';
    pre.style.fontSize = '0.875rem';
    pre.style.fontFamily = 'monospace';

    if (isEditingCodeBlock && selectedCodeBlock) {
      selectedCodeBlock.querySelector('.inserted-image')?.remove();
      selectedCodeBlock.replaceWith(pre);
    } else {
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

      if (range && editorRef.current.contains(range.startContainer)) {
        range.deleteContents();
        range.insertNode(pre);
      } else {
        editorRef.current.appendChild(pre);
      }
    }

    setShowCodeModal(false);
    setCodeInput('');
    setCodeLanguage('javascript');
    setSelectedCodeBlock(null);
    setIsEditingCodeBlock(false);
    editorRef.current.focus();
  };

  const formatText = (command, value = null) => {
    const isActive = document.queryCommandState(command);
    const selection = window.getSelection();

    if (selection.isCollapsed) {
      if (['bold', 'italic', 'underline'].includes(command)) {
        document.execCommand(command, false, value);
        updateActiveFormats();
        editorRef.current.focus();
        return;
      }
    }
    document.execCommand(command, false, value);
    editorRef.current.focus();
    updateActiveFormats();
  };

  const handleImageButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgElement = document.createElement('img');
    imgElement.className = 'inserted-image';
    imgElement.src = URL.createObjectURL(file);
    imgElement.contentEditable = 'false';
    imgElement.style.display = 'block';
    imgElement.style.margin = '1em auto';
    imgElement.style.borderRadius = '3px';
    imgElement.style.maxWidth = '500px';
    imgElement.style.width = '300px';
    imgElement.style.cursor = 'pointer';
    imgElement.style.border = '2px solid transparent';

    const wrapper = document.createElement('div');
    wrapper.className = 'image-wrapper';
    wrapper.contentEditable = 'false';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.margin = '1em auto';
    wrapper.appendChild(imgElement);

    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.bottom = '-2px';
    resizeHandle.style.right = '-2px';
    resizeHandle.style.width = '10px';
    resizeHandle.style.height = '10px';
    resizeHandle.style.backgroundColor = primaryColor;
    resizeHandle.style.cursor = 'se-resize';
    wrapper.appendChild(resizeHandle);

    const editor = editorRef.current;
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    if (!range || !editor.contains(range.startContainer)) {
      editor.appendChild(wrapper);
    } else {
      range.deleteContents();
      range.insertNode(wrapper);
    }

    const newRange = document.createRange();
    newRange.setStartAfter(wrapper);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
    editor.focus();

    fileInputRef.current.value = '';
  };

  const handleLatexButtonClick = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedNode = range.startContainer.parentNode;

      if (selectedNode.classList && selectedNode.classList.contains('latex-equation')) {
        const latexContent = selectedNode.getAttribute('data-latex') || '';
        setLatexInput(latexContent);
        setIsLatexSelected(true);
      } else {
        setIsLatexSelected(false);
      }
    } else {
      setIsLatexSelected(false);
    }
    setShowLatexModal(true);
  };

  const handleLinkButtonClick = () => {
    setShowLinkModal(true);
  };

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
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleLinkClick = (e) => {
      const target = e.target;
      if (target.tagName === 'A' && target.href) {
        e.preventDefault();
        window.open(target.href, '_blank', 'noopener,noreferrer');
      }
    };

    const handleImageClick = (e) => {
      const target = e.target;
      if (target.classList.contains('inserted-image')) {
        e.preventDefault();
        const prevSelected = document.querySelector('.inserted-image.selected');
        if (prevSelected && prevSelected !== target) {
          prevSelected.style.border = '2px solid transparent';
          prevSelected.classList.remove('selected');
          const prevWrapper = prevSelected.parentElement;
          const prevHandle = prevWrapper.querySelector('.resize-handle');
          if (prevHandle) prevHandle.style.display = 'none';
        }
        target.classList.toggle('selected');
        target.style.border = target.classList.contains('selected')
          ? `2px solid ${primaryColor}`
          : '2px solid transparent';
        const wrapper = target.parentElement;
        const handle = wrapper.querySelector('.resize-handle');
        if (handle) handle.style.display = target.classList.contains('selected') ? 'block' : 'none';
      }
    };

    const handleClickOutside = (e) => {
      const selectedImage = document.querySelector('.inserted-image.selected');
      if (selectedImage && !selectedImage.contains(e.target) && !e.target.classList.contains('resize-handle')) {
        selectedImage.style.border = '2px solid transparent';
        selectedImage.classList.remove('selected');
        const wrapper = selectedImage.parentElement;
        const handle = wrapper.querySelector('.resize-handle');
        if (handle) handle.style.display = 'none';
      }
    };

    const handleMouseDown = (e) => {
      if (e.target.classList.contains('resize-handle')) {
        e.preventDefault();
        const wrapper = e.target.parentElement;
        const img = wrapper.querySelector('.inserted-image');
        const startX = e.clientX;
        const startWidth = parseInt(img.style.width) || 300;

        const handleMouseMove = (moveEvent) => {
          const newWidth = Math.min(Math.max(startWidth + (moveEvent.clientX - startX), 100), 500);
          img.style.width = `${newWidth}px`;
          e.target.style.bottom = '-2px';
          e.target.style.right = '-2px';
        };

        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }
    };

    editor.addEventListener('click', handleLinkClick);
    editor.addEventListener('click', handleImageClick);
    document.addEventListener('click', handleClickOutside);
    editor.addEventListener('mousedown', handleMouseDown);
    return () => {
      editor.removeEventListener('click', handleLinkClick);
      editor.removeEventListener('click', handleImageClick);
      document.removeEventListener('click', handleClickOutside);
      editor.removeEventListener('mousedown', handleMouseDown);
    };
  }, [editorRef, primaryColor]);

  const buttons = [
    { icon: <FiBold />, command: 'bold', name: 'Bold', action: () => formatText('bold') },
    { icon: <FiItalic />, command: 'italic', name: 'Italic', action: () => formatText('italic') },
    { icon: <FiUnderline />, command: 'underline', name: 'Underline', action: () => formatText('underline') },
    { icon: <FiAlignLeft />, command: 'justifyLeft', name: 'Align Left', action: () => formatText('justifyLeft') },
    { icon: <FiAlignCenter />, command: 'justifyCenter', name: 'Align Center', action: () => formatText('justifyCenter') },
    { icon: <FiAlignRight />, command: 'justifyRight', name: 'Align Right', action: () => formatText('justifyRight') },
    { icon: <FiAlignJustify />, command: 'justifyFull', name: 'Justify', action: () => formatText('justifyFull') },
    { icon: <FiLink />, command: 'insertLink', name: 'Insert Link', action: handleLinkButtonClick },
    { icon: <FiImage />, command: 'insertImage', name: 'Insert Image', action: handleImageButtonClick },
    { icon: <FiCode />, command: 'formatBlock', name: 'Insert Code', action: insertCode },
    { icon: <PiMathOperationsFill />, command: 'insertLatex', name: 'Insert LaTeX', action: handleLatexButtonClick },
    { icon: <FiRotateCcw />, command: 'undo', name: 'Undo', action: () => formatText('undo') },
    { icon: <FiRotateCw />, command: 'redo', name: 'Redo', action: () => formatText('redo') },
  ];

  return (
    <>
      <style>
        {`
          .inserted-image:hover {
            cursor: pointer !important;
          }
          .inserted-image.selected {
            border: 2px solid ${primaryColor} !important;
          }
          .image-wrapper {
            position: relative;
            display: inline-block;
          }
          .resize-handle {
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 10px;
            height: 10px;
            background-color: ${primaryColor};
            cursor: se-resize;
            display: none;
          }
          .image-wrapper .inserted-image.selected ~ .resize-handle {
            display: block;
          }
          .resize-handle:hover {
            opacity: 0.8;
          }
        `}
      </style>
      <div
        className={`flex items-center gap-1 mb-3 p-2 rounded-lg border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}
      >
        {buttons.map((button) => (
          <React.Fragment key={button.command}>
            <div className="relative">
              <button
                type="button"
                className={`
                  p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold
                  ${
                    activeFormats.includes(button.command)
                      ? 'text-white'
                      : darkMode
                      ? 'text-gray-200 hover:text-white'
                      : 'text-gray-800 hover:text-white'
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
                style={{
                  backgroundColor: activeFormats.includes(button.command) ? primaryColor : darkMode ? '#374151' : 'white',
                  borderColor: activeFormats.includes(button.command) ? primaryColor : darkMode ? '#4b5563' : '#e5e7eb',
                  '--tw-ring-color': primaryColor
                }}
              >
                {React.cloneElement(button.icon, { className: 'font-bold' })}
              </button>

              {tooltip === button.name && (
                <div
                  className={`absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'
                  }`}
                >
                  {button.name}
                </div>
              )}
            </div>

            {button.command === 'underline' && (
              <>
                <div className="relative">
                  <button
                    type="button"
                    className={`
                      p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold
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
                      className={`absolute z-20 left-0 mt-1 w-44 rounded-md border shadow-md ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                      }`}
                    >
                      {bulletStyles.map((style) => (
                        <button
                          key={style.value}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                            darkMode ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-800'
                          }`}
                          onClick={() => handleSelectListStyle(style)}
                        >
                          <span style={{ display: 'inline-block', width: '25px', textAlign: 'center' }}>
                            {style.value === 'circle' ? '○' : style.value === 'disc' ? '●' : '■'}
                          </span>
                          {style.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    className={`
                      p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold
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
                      className={`absolute z-20 left-0 mt-1 w-44 rounded-md border shadow-md ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                      }`}
                    >
                      {numberedStyles.map((style) => (
                        <button
                          key={style.value}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                            darkMode ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-800'
                          }`}
                          onClick={() => handleSelectListStyle(style)}
                        >
                          <span style={{ display: 'inline-block', width: '25px', textAlign: 'center' }}>
                            {style.value === 'decimal' ? '1.' : style.value === 'lower-alpha' ? 'a.' : 'i.'}
                          </span>
                          {style.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </React.Fragment>
        ))}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className={`rounded-xl p-6 w-full max-w-2xl bg-white border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Insert Code Snippet</h3>
              <button onClick={() => setShowCodeModal(false)} className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
                <FiX size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className={`text-sm font-semibold block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Language</label>
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className={`w-full border rounded px-3 py-2 text-sm ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="java">Java</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="bash">Bash</option>
                <option value="json">JSON</option>
              </select>
            </div>

            <div className="mb-4">
              <label className={`text-sm font-semibold block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Code</label>
              <textarea
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                className={`w-full h-40 border rounded px-3 py-2 font-mono text-sm ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                placeholder="Enter your code here..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCodeModal(false)}
                className={`px-4 py-2 rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleInsertCodeBlock}
                className="px-4 py-2 text-white rounded"
                style={{ backgroundColor: primaryColor }}
              >
                {isEditingCodeBlock ? 'Update Code' : 'Insert'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLatexModal && (
        <LatexModal
          editorRef={editorRef}
          latexInput={latexInput}
          setLatexInput={setLatexInput}
          isLatexSelected={isLatexSelected}
          setShowLatexModal={setShowLatexModal}
          darkMode={darkMode}
          primaryColor={primaryColor}
        />
      )}

      {showLinkModal && (
        <LinkModal
          editorRef={editorRef}
          setShowLinkModal={setShowLinkModal}
          darkMode={darkMode}
          primaryColor={primaryColor}
        />
      )}
    </>
  );
};

export default BlogEditorToolbar;