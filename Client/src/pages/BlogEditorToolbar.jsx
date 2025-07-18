import React, { useState, useEffect } from 'react';
import {
  FiBold, FiItalic, FiUnderline, FiList, FiAlignLeft, FiAlignCenter, FiAlignRight,
  FiAlignJustify, FiLink, FiImage, FiCode, FiRotateCcw, FiRotateCw, FiX
} from 'react-icons/fi';
import { MdFormatListNumbered } from 'react-icons/md';
import { PiMathOperationsFill } from 'react-icons/pi';
import { useTheme } from '../context/ThemeContext';
import LatexModal from '../components/LatexModal';
import LinkModal from '../components/LinkModal';
import ImageModal from '../components/ImageModal';

const BlogEditorToolbar = ({ editorRef }) => {
  const { primaryColor, darkMode } = useTheme();
  const [tooltip, setTooltip] = useState('');
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [activeFormats, setActiveFormats] = useState([]);
  const [showBulletDropdown, setShowBulletDropdown] = useState(false);
  const [showNumberDropdown, setShowNumberDropdown] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [isEditingCodeBlock, setIsEditingCodeBlock] = useState(false);
  const [selectedCodeBlock, setSelectedCodeBlock] = useState(null);
  const [showLatexModal, setShowLatexModal] = useState(false);
  const [latexInput, setLatexInput] = useState('');
  const [isLatexSelected, setIsLatexSelected] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

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
    setShowImageModal(true);
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

    const handleImageResize = (e) => {
      const target = e.target;
      if (target.classList.contains('inserted-image') && target.classList.contains('selected')) {
        e.preventDefault();
        const currentWidth = parseInt(target.style.width) || 300;
        if (e.key === '+') {
          target.style.width = `${Math.min(currentWidth + 20, 500)}px`; // Max 500px
        } else if (e.key === '-') {
          target.style.width = `${Math.max(currentWidth - 20, 100)}px`; // Min 100px
        }
      }
    };

    editor.addEventListener('click', handleLinkClick);
    editor.addEventListener('keydown', handleImageResize);
    return () => {
      editor.removeEventListener('click', handleLinkClick);
      editor.removeEventListener('keydown', handleImageResize);
    };
  }, [editorRef]);

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
                    className={`absolute z-20 left-0 mt-1 w-40 rounded-md border shadow-md ${
                      darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <button
                      className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                        darkMode ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-800'
                      }`}
                      onClick={() => {
                        formatText('insertUnorderedList');
                        setShowBulletDropdown(false);
                      }}
                    >
                      • Bulleted List
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                        darkMode ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-800'
                      }`}
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
                  onClick={() => setShowNumberDropdown(!showNumberDropdown)}
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

                {showNumberDropdown && (
                  <div
                    className={`absolute z-20 left-0 mt-1 w-44 rounded-md border shadow-md ${
                      darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <button
                      className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                        darkMode ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-800'
                      }`}
                      onClick={() => {
                        formatText('insertOrderedList');
                        setShowNumberDropdown(false);
                      }}
                    >
                      1. Numbered List
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                        darkMode ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-800'
                      }`}
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

      {showImageModal && (
        <ImageModal
          editorRef={editorRef}
          setShowImageModal={setShowImageModal}
          darkMode={darkMode}
          primaryColor={primaryColor}
        />
      )}
    </div>
  );
};

export default BlogEditorToolbar;