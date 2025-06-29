import React, { useState, useEffect } from 'react';
import {
  FiBold, FiItalic, FiUnderline, FiList, FiAlignLeft, FiAlignCenter, FiAlignRight,
  FiAlignJustify, FiLink, FiImage, FiCode, FiRotateCcw, FiRotateCw, FiX
} from 'react-icons/fi';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { MdFormatListNumbered } from 'react-icons/md';
import { PiMathOperationsFill } from 'react-icons/pi';


const BlogEditorToolbar = ({ editorRef }) => {
  const [tooltip, setTooltip] = useState('');
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [activeFormats, setActiveFormats] = useState([]);
  const [showBulletDropdown, setShowBulletDropdown] = useState(false);
  const [showNumberDropdown, setShowNumberDropdown] = useState(false);
  const [showLatexModal, setShowLatexModal] = useState(false);
  const [latexInput, setLatexInput] = useState('');
  const [isLatexSelected, setIsLatexSelected] = useState(false);

  const [latexPreview, setLatexPreview] = useState('');

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

  const handleLatexButtonClick = () => {
    // Check if we're currently selecting a LaTeX element
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedNode = range.startContainer.parentNode;

      if (selectedNode.classList && selectedNode.classList.contains('latex-equation')) {
        const latexContent = selectedNode.getAttribute('data-latex') || '';
        setLatexInput(latexContent);
        setIsLatexSelected(true);
      }
    } else {
      setIsLatexSelected(false);
    }
    setShowLatexModal(true);
  };

  const insertLatex = () => {
    if (!latexInput.trim()) return;

    const latexSpan = document.createElement('span');
    latexSpan.className = 'latex-equation';
    latexSpan.contentEditable = 'false';
    latexSpan.style.display = 'inline-block';
    latexSpan.style.padding = '0.2em 0.4em';
    latexSpan.style.margin = '0 0.1em';
    latexSpan.style.backgroundColor = '#f5f5f5';
    latexSpan.style.borderRadius = '3px';
    latexSpan.style.fontFamily = 'monospace';
    latexSpan.style.fontSize = '0.9em';
    latexSpan.style.color = '#333';

    try {
      latexSpan.innerHTML = katex.renderToString(latexInput, {
        throwOnError: false,
        displayMode: false,
      });
      latexSpan.setAttribute('data-latex', latexInput); // For editing later
    } catch (err) {
      console.error('KaTeX render error:', err);
      alert('Invalid LaTeX syntax.');
      return;
    }

    const zeroWidthSpace = document.createTextNode('\u200B');
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const frag = document.createDocumentFragment();
    frag.appendChild(latexSpan);
    frag.appendChild(zeroWidthSpace);
    range.insertNode(frag);

    range.setStartAfter(zeroWidthSpace);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    editorRef.current.focus();
    setShowLatexModal(false);
    setLatexInput('');
  };

  const buttons = [
    { icon: <FiBold />, command: 'bold', name: 'Bold', action: () => formatText('bold') },
    { icon: <FiItalic />, command: 'italic', name: 'Italic', action: () => formatText('italic') },
    { icon: <FiUnderline />, command: 'underline', name: 'Underline', action: () => formatText('underline') },
    { icon: <FiAlignLeft />, command: 'justifyLeft', name: 'Align Left', action: () => formatText('justifyLeft') },
    { icon: <FiAlignCenter />, command: 'justifyCenter', name: 'Align Center', action: () => formatText('justifyCenter') },
    { icon: <FiAlignRight />, command: 'justifyRight', name: 'Align Right', action: () => formatText('justifyRight') },
    { icon: <FiAlignJustify />, command: 'justifyFull', name: 'Justify', action: () => formatText('justifyFull') },
    { icon: <FiLink />, command: 'createLink', name: 'Insert Link', action: insertLink },
    { icon: <FiImage />, command: 'insertImage', name: 'Upload Image', action: insertImage },
    { icon: <FiCode />, command: 'formatBlock', name: 'Insert Code', action: insertCode },
    {
      icon: <PiMathOperationsFill />,
      command: 'insertLatex',
      name: 'Insert LaTeX',
      action: handleLatexButtonClick
    },
    { icon: <FiRotateCcw />, command: 'undo', name: 'Undo', action: () => formatText('undo') },
    { icon: <FiRotateCw />, command: 'redo', name: 'Redo', action: () => formatText('redo') },
  ];

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
    }
  }, []);

  useEffect(() => {
    try {
      if (latexInput.trim() === '') {
        setLatexPreview('');
        return;
      }

      const rendered = katex.renderToString(latexInput, {
        throwOnError: true,
        displayMode: false,
      });
      setLatexPreview(rendered);
    } catch (err) {
      setLatexPreview(`<span style="color: red; font-size: 0.875rem;">Invalid LaTeX syntax</span>`);
    }
  }, [latexInput]);

  return (
    <div className="flex items-center gap-1 mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
      {buttons.map((button) => (
        <React.Fragment key={button.command}>
          <div className="relative">
            <button
              type="button"
              className={`
                p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold
                ${activeFormats.includes(button.command)
                  ? 'bg-teal-500 text-white border-teal-500'
                  : 'bg-white text-gray-800 border-gray-200 hover:bg-teal-500 hover:text-white hover:border-teal-500'}
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

          {/* Insert dropdowns after underline */}
          {button.command === 'underline' && (
            <>
              {/* Bullet List Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className={`
                    p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold
                    ${activeFormats.includes('insertUnorderedList')
                      ? 'bg-teal-500 text-white border-teal-500'
                      : 'bg-white text-gray-800 border-gray-200 hover:bg-teal-500 hover:text-white hover:border-teal-500'}
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
                >
                  <FiList />
                </button>

                {tooltip === 'Bullet List' && (
                  <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
                    Bullet List
                  </div>
                )}

                {showBulletDropdown && (
                  <div className="absolute z-20 left-0 mt-1 w-40 bg-white rounded-md border border-gray-200 shadow-md">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-teal-500 hover:text-white text-sm"
                      onClick={() => {
                        formatText('insertUnorderedList');
                        setShowBulletDropdown(false);
                      }}
                    >
                      • Bulleted List
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-teal-500 hover:text-white text-sm"
                      onClick={() => {
                        formatText('insertHTML', '<ul><li>☐ Item 1</li><li>☐ Item 2</li></ul>');
                        setShowBulletDropdown(false);
                      }}
                    >
                      ☐ Checklist
                    </button>
                  </div>
                )}
              </div>

              {/* Numbered List Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className={`
                    p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold
                    ${activeFormats.includes('insertOrderedList')
                      ? 'bg-teal-500 text-white border-teal-500'
                      : 'bg-white text-gray-800 border-gray-200 hover:bg-teal-500 hover:text-white hover:border-teal-500'}
                  `}
                  onClick={() => setShowNumberDropdown(!showNumberDropdown)}
                  onMouseEnter={() => {
                    setTooltip('Numbered List');
                    setHoveredIcon('insertOrderedList');
                  }}
                  onMouseLeave={() => {
                    setTooltip('');
                    setHoveredIcon(null);
                  }}
                >
                  <MdFormatListNumbered />
                </button>

                {tooltip === 'Numbered List' && (
                  <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
                    Numbered List
                  </div>
                )}

                {showNumberDropdown && (
                  <div className="absolute z-20 left-0 mt-1 w-44 bg-white rounded-md border border-gray-200 shadow-md">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-teal-500 hover:text-white text-sm"
                      onClick={() => {
                        formatText('insertOrderedList');
                        setShowNumberDropdown(false);
                      }}
                    >
                      1. Numbered List
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-teal-500 hover:text-white text-sm"
                      onClick={() => {
                        formatText('insertHTML', '<ol type="i"><li>First</li><li>Second</li></ol>');
                        setShowNumberDropdown(false);
                      }}
                    >
                      i. Roman List
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </React.Fragment>
      ))}

      {/* LaTeX Modal */}
      {showLatexModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {isLatexSelected ? 'Edit LaTeX Equation' : 'Insert LaTeX Equation'}
              </h3>
              <button
                onClick={() => {
                  setShowLatexModal(false);
                  setLatexInput('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>

            <textarea
              className="w-full h-32 p-2 border border-gray-300 rounded mb-4 font-mono text-sm"
              placeholder="Enter LaTeX code (e.g., \frac{a}{b} or x^2 + y^2 = z^2)"
              value={latexInput}
              onChange={(e) => setLatexInput(e.target.value)}
              autoFocus
            />


            <div className="text-xs text-gray-500 mb-4">
              Tip: Use standard LaTeX syntax. Your equation will be rendered when published.
            </div>

            <div className="border border-gray-300 p-3 rounded bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">Live Preview:</div>
              <div
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: latexPreview }}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => {
                  setShowLatexModal(false);
                  setLatexInput('');
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
                onClick={insertLatex}
              >
                {isLatexSelected ? 'Update Equation' : 'Insert Equation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogEditorToolbar;