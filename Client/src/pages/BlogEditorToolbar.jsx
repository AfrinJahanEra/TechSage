import React, { useState, useEffect, useContext } from 'react';
import {
  FiBold, FiItalic, FiUnderline, FiList, FiAlignLeft, FiAlignCenter, FiAlignRight,
  FiAlignJustify, FiLink, FiImage, FiCode, FiRotateCcw, FiRotateCw, FiX
} from 'react-icons/fi';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { MdFormatListNumbered } from 'react-icons/md';
import { PiMathOperationsFill } from 'react-icons/pi';
import { useTheme } from '../context/ThemeContext';

const BlogEditorToolbar = ({ editorRef }) => {
  const { primaryColor, darkMode } = useTheme();
  const [tooltip, setTooltip] = useState('');
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [activeFormats, setActiveFormats] = useState([]);
  const [showBulletDropdown, setShowBulletDropdown] = useState(false);
  const [showNumberDropdown, setShowNumberDropdown] = useState(false);
  const [showLatexModal, setShowLatexModal] = useState(false);
  const [latexInput, setLatexInput] = useState('');
  const [isLatexSelected, setIsLatexSelected] = useState(false);
  const [latexPreview, setLatexPreview] = useState('');
  const [openTemplateCategory, setOpenTemplateCategory] = useState(null);
  const [openFunctionSubcategory, setOpenFunctionSubcategory] = useState(null);
  const [showMatrixInput, setShowMatrixInput] = useState(false);
  const [matrixRows, setMatrixRows] = useState(2);
  const [matrixCols, setMatrixCols] = useState(2);

  const [showCodeModal, setShowCodeModal] = useState(false);
const [codeInput, setCodeInput] = useState('');
const [codeLanguage, setCodeLanguage] = useState('javascript');

const [isEditingCodeBlock, setIsEditingCodeBlock] = useState(false);
const [selectedCodeBlock, setSelectedCodeBlock] = useState(null);


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


  // LaTeX templates organized by category
  const latexTemplates = [
    {
      category: 'Fractions',
      items: [
        { name: 'Simple Fraction', template: '\\frac{a}{b}' },
        { name: 'Mixed Fraction', template: 'c\\frac{a}{b}' },
      ]
    },
    {
      category: 'Script',
      items: [
        { name: 'Superscript', template: 'x^{n}' },
        { name: 'Subscript', template: 'x_{i}' },
        { name: 'Superscript with Subscript', template: 'x_{i}^{n}' },
        { name: 'Left Subscript-Superscript', template: '{}_{i}^{n}x' },
      ]
    },
    {
      category: 'Radical',
      items: [
        { name: 'Square Root', template: '\\sqrt{a}' },
        { name: 'N-th Root', template: '\\sqrt[n]{a}' },
      ]
    },
    {
      category: 'Differentiation',
      items: [
        { name: 'Derivative', template: '\\frac{dy}{dx}' },
        { name: 'n-th Derivative', template: '\\frac{d^n y}{dx^n}' },
        { name: 'Partial Derivative', template: '\\frac{\\partial y}{\\partial x}' },
      ]
    },
    {
      category: 'Integration',
      items: [
        { name: 'Indefinite Integral', template: '\\int y \\, dx' },
        { name: 'Definite Integral', template: '\\int_{a}^{b} y \\, dx' },
        { name: 'Double Integral', template: '\\iint y \\, dx' },
        { name: 'Double Definite Integral', template: '\\iint_{a}^{b} y \\, dx \\, dy' },
      ]
    },
    {
      category: 'Functions',
      subcategories: [
        {
          name: 'Trigonometric',
          items: [
            { name: 'sin', template: '\\sin(x)' },
            { name: 'cos', template: '\\cos(x)' },
            { name: 'tan', template: '\\tan(x)' },
            { name: 'cot', template: '\\cot(x)' },
            { name: 'sec', template: '\\sec(x)' },
            { name: 'cosec', template: '\\csc(x)' },
          ]
        },
        {
          name: 'Inverse Trigonometric',
          items: [
            { name: 'Inverse sin', template: '\\sin^{-1}(x)' },
            { name: 'Inverse cos', template: '\\cos^{-1}(x)' },
            { name: 'Inverse tan', template: '\\tan^{-1}(x)' },
            { name: 'Inverse cot', template: '\\cot^{-1}(x)' },
            { name: 'Inverse sec', template: '\\sec^{-1}(x)' },
            { name: 'Inverse cosec', template: '\\csc^{-1}(x)' },
          ],
        },
        {
          name: 'Hyperbolic',
          items: [
            { name: 'Hyperbolic sin', template: '\\sinh(x)' },
            { name: 'Hyperbolic cos', template: '\\cosh(x)' },
            { name: 'Hyperbolic tan', template: '\\tanh(x)' },
            { name: 'Hyperbolic cot', template: '\\coth(x)' },
            { name: 'Hyperbolic sec', template: '\\sech(x)' },
            { name: 'Hyperbolic cosec', template: '\\csch(x)' },
          ]
        },
        {
          name: 'Inverse Hyperbolic',
          items: [
            { name: 'Inverse Hyperbolic sin', template: '\\sinh^{-1}(x)' },
            { name: 'Inverse Hyperbolic cos', template: '\\cosh^{-1}(x)' },
            { name: 'Inverse Hyperbolic tan', template: '\\tanh^{-1}(x)' },
            { name: 'Inverse Hyperbolic cot', template: '\\coth^{-1}(x)' },
            { name: 'Inverse Hyperbolic sec', template: '\\sech^{-1}(x)' },
            { name: 'Inverse Hyperbolic cosec', template: '\\csch^{-1}(x)' },
          ]
        },
      ]
    },
    {
      category: 'Logarithms',
      items: [
        { name: 'Logarithm with Base', template: '\\log_{a} b' },
        { name: 'Natural Logarithm', template: '\\ln(a)' },
        { name: 'Common Logarithm', template: '\\log_{10} a' },
      ]
    },
    {
      category: 'Greek Letters',
      items: [
        { name: 'Alpha', template: '\\alpha' },
        { name: 'Beta', template: '\\beta' },
        { name: 'Gamma', template: '\\gamma' },
        { name: 'Delta', template: '\\delta' },
        { name: 'Theta', template: '\\theta' },
        { name: 'Pi', template: '\\pi' },
        { name: 'Sigma', template: '\\sigma' },
        { name: 'Omega', template: '\\omega' },
      ]
    },
    {
      category: 'Operators',
      items: [
        { name: 'Summation', template: '\\sum_{i=1}^{n}' },
        { name: 'Product', template: '\\prod_{i=1}^{n}' },
        { name: 'Limit', template: '\\lim_{x \\to \\infty}' },
      ]
    },
    {
      category: 'Matrix',
      items: [
        { name: '2x2 Matrix', template: '\\left| \\begin{matrix} a & b \\\\ c & d \\end{matrix} \\right|' },
        { name: 'Custom Matrix', template: 'custom-matrix' }
      ]
    }
  ];

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
  if (!url || !editorRef.current) return;

  editorRef.current.focus();

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const selectedText = selection.toString() || url;

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.textContent = selectedText;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.style.textDecoration = 'underline';
anchor.style.color = '#6b98faff';
anchor.style.cursor = 'pointer';

  range.deleteContents();
  range.insertNode(anchor);

  range.setStartAfter(anchor);
  range.setEndAfter(anchor);
  selection.removeAllRanges();
  selection.addRange(range);
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
    latexSpan.style.borderRadius = '3px';
    latexSpan.style.fontFamily = 'monospace';
    latexSpan.style.fontSize = '0.9em';
    latexSpan.style.backgroundColor = darkMode ? '#374151' : '#f5f5f5';
    latexSpan.style.color = darkMode ? '#f3f4f6' : '#333';

    try {
      latexSpan.innerHTML = katex.renderToString(latexInput, {
        throwOnError: false,
        displayMode: false,
      });
      latexSpan.setAttribute('data-latex', latexInput);
    } catch (err) {
      console.error('KaTeX render error:', err);
      alert('Invalid LaTeX syntax.');
      return;
    }

    const editor = editorRef.current;
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;



    // Insert the LaTeX span
    if (!range || !editor.contains(range.startContainer)) {
      editor.appendChild(latexSpan);
    } else {
      range.deleteContents();
      range.insertNode(latexSpan);
    }

    const newRange = document.createRange();
    newRange.setStartAfter(latexSpan);
    newRange.collapse(true);

    selection.removeAllRanges();
    selection.addRange(newRange);
    editor.focus();

    

    setShowLatexModal(false);
    setLatexInput('');
  };

  const insertLatexTemplate = (template) => {
    if (template === 'custom-matrix') {
      setShowMatrixInput(true);
      return;
    }

    const textarea = document.querySelector('.latex-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const before = latexInput.slice(0, start);
    const after = latexInput.slice(end);

    const newLatex = before + template + after;
    setLatexInput(newLatex);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + template.length, start + template.length);
    }, 0);
  };

  const buttons = [
    { icon: <FiBold />, command: 'bold', name: 'Bold', action: () => formatText('bold') },
    { icon: <FiItalic />, command: 'italic', name: 'Italic', action: () => formatText('italic') },
    { icon: <FiUnderline />, command: 'underline', name: 'Underline', action: () => formatText('underline') },
    { icon: <FiAlignLeft />, command: 'justifyLeft', name: 'Align Left', action: () => formatText('justifyLeft') },
    { icon: <FiAlignCenter />, command: 'justifyCenter', name: 'Align Center', action: () => formatText('justifyCenter') },
    { icon: <FiAlignRight />, command: 'justifyRight', name: 'Align Right', action: () => formatText('justifyRight') },
    { icon: <FiAlignJustify />, command: 'justifyFull', name: 'Justify', action: () => formatText('justifyFull') },
    {
  name: 'Insert Link',
  command: 'insertLink',
  icon: <FiLink />,
  action: insertLink
},
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

  useEffect(() => {
  const editor = editorRef.current;
  if (!editor) return;

  const handleLinkClick = (e) => {
    const target = e.target;
    if (target.tagName === 'A' && target.href) {
      e.preventDefault(); // Prevent placing cursor
      window.open(target.href, '_blank', 'noopener,noreferrer');
    }
  };

  editor.addEventListener('click', handleLinkClick);

  return () => {
    editor.removeEventListener('click', handleLinkClick);
  };
}, [editorRef]);


  return (
    <div
      className={`flex items-center gap-1 mb-3 p-2 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}
    >
      {buttons.map((button) => (
        <React.Fragment key={button.command}>
          <div className="relative">
            <button
              type="button"
              className={`
                p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold
                ${activeFormats.includes(button.command)
                  ? 'text-white'
                  : darkMode
                    ? 'text-gray-200 hover:text-white'
                    : 'text-gray-800 hover:text-white'}
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
              {React.cloneElement(button.icon, { className: "font-bold" })}
            </button>

            {tooltip === button.name && (
              <div className={`absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'
                }`}>
                {button.name}
              </div>
            )}
          </div>

          {button.command === 'underline' && (
            <>
              {/* Bullet List Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className={`
                    p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold
                    ${activeFormats.includes('insertUnorderedList')
                      ? 'text-white'
                      : darkMode
                        ? 'text-gray-200 hover:text-white'
                        : 'text-gray-800 hover:text-white'}
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
                  <div className={`absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'
                    }`}>
                    Bullet List
                  </div>
                )}

                {showBulletDropdown && (
                  <div className={`absolute z-20 left-0 mt-1 w-40 rounded-md border shadow-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                    }`}>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${darkMode ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-800'
                        }`}
                      onClick={() => {
                        formatText('insertUnorderedList');
                        setShowBulletDropdown(false);
                      }}
                    >
                      • Bulleted List
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${darkMode ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-800'
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

              {/* Numbered List Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className={`
                    p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold
                    ${activeFormats.includes('insertOrderedList')
                      ? 'text-white'
                      : darkMode
                        ? 'text-gray-200 hover:text-white'
                        : 'text-gray-800 hover:text-white'}
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
                  <div className={`absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'
                    }`}>
                    Numbered List
                  </div>
                )}

                {showNumberDropdown && (
                  <div className={`absolute z-20 left-0 mt-1 w-44 rounded-md border shadow-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                    }`}>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${darkMode ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-800'
                        }`}
                      onClick={() => {
                        formatText('insertOrderedList');
                        setShowNumberDropdown(false);
                      }}
                    >
                      1. Numbered List
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${darkMode ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-800'
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
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        >
          <div
            className={`rounded-xl p-6 w-full max-w-3xl h-[550px] overflow-hidden flex flex-col shadow-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            style={{
              border: '1px solid rgba(0, 0, 0, 0.12)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                LaTeX Templates
              </h4>

              <div className="relative flex-1 text-center">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                  {isLatexSelected ? 'Edit LaTeX Equation' : 'Insert LaTeX Equation'}
                </h3>
                <button
                  onClick={() => {
                    setShowLatexModal(false);
                    setLatexInput('');
                  }}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
              <div className="w-full md:w-1/3 h-full overflow-y-auto pr-2 space-y-2">
                {latexTemplates.map((category) => {
                  const isOpen = openTemplateCategory === category.category;

                  return (
                    <div key={category.category} className="shrink-0">
                      <button
                        onClick={() =>
                          setOpenTemplateCategory(isOpen ? null : category.category)
                        }
                        className={`w-full flex justify-between items-center px-4 py-2 rounded-md border text-sm font-medium transition-colors duration-200 ${isOpen
                            ? 'text-white'
                            : darkMode
                              ? 'text-gray-200 hover:text-white'
                              : 'text-gray-800 hover:text-white'
                          }`}
                        style={{
                          backgroundColor: isOpen ? primaryColor : darkMode ? '#374151' : 'white',
                          borderColor: isOpen ? primaryColor : darkMode ? '#4b5563' : '#e5e7eb'
                        }}
                      >
                        {category.category}
                        <span className="ml-2">{isOpen ? '▲' : '▼'}</span>
                      </button>

                      {isOpen && (
                        <div className={`mt-1 border rounded-md shadow-sm overflow-hidden ${darkMode ? 'border-gray-600' : 'border-gray-200'
                          }`}>
                          {'subcategories' in category ? (
                            category.subcategories.map((subcat) => {
                              const isSubOpen = openFunctionSubcategory === subcat.name;

                              return (
                                <div key={subcat.name}>
                                  <button
                                    onClick={() =>
                                      setOpenFunctionSubcategory(isSubOpen ? null : subcat.name)
                                    }
                                    className={`w-full flex justify-between items-center px-4 py-2 text-sm font-medium transition-colors duration-200 ${isSubOpen
                                        ? 'text-white'
                                        : darkMode
                                          ? 'text-gray-200 hover:text-white'
                                          : 'text-gray-800 hover:text-white'
                                      }`}
                                    style={{
                                      backgroundColor: isSubOpen ? primaryColor : darkMode ? '#4b5563' : '#f9fafb'
                                    }}
                                  >
                                    {subcat.name}
                                    <span>{isSubOpen ? '▲' : '▼'}</span>
                                  </button>

                                  {isSubOpen && (
                                    <div className={`pl-4 ${darkMode ? 'bg-gray-700' : 'bg-white'
                                      }`}>
                                      {subcat.items.map((item) => (
                                        <button
                                          key={item.name}
                                          className={`w-full text-left px-4 py-1 text-sm transition-colors duration-200 ${darkMode ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-800'
                                            }`}
                                          onClick={() => insertLatexTemplate(item.template)}
                                        >
                                          {item.name}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            category.items.map((item) => (
                              <button
                                key={item.name}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${darkMode ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-800'
                                  }`}
                                onClick={() => insertLatexTemplate(item.template)}
                              >
                                {item.name}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="w-full md:w-2/3">
                {showMatrixInput && (
                  <div className={`mb-4 border p-3 rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-teal-50 border-teal-200'
                    }`}>
                    <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'
                      }`}>
                      Custom Matrix Size
                    </h4>
                    <div className="flex gap-4 items-center mb-2">
                      <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Rows:
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={matrixRows}
                          onChange={(e) => setMatrixRows(Number(e.target.value))}
                          className={`ml-2 w-16 border rounded px-2 py-1 text-sm ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                            }`}
                        />
                      </label>
                      <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Columns:
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={matrixCols}
                          onChange={(e) => setMatrixCols(Number(e.target.value))}
                          className={`ml-2 w-16 border rounded px-2 py-1 text-sm ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                            }`}
                        />
                      </label>
                      <button
                        className="ml-auto px-3 py-1 text-white text-sm rounded hover:opacity-90 transition-colors duration-200"
                        style={{ backgroundColor: primaryColor }}
                        onClick={() => {
                          let matrix = '\\left| \\begin{matrix}\n';
                          for (let i = 0; i < matrixRows; i++) {
                            let row = [];
                            for (let j = 0; j < matrixCols; j++) {
                              row.push(`a_{${i + 1}${j + 1}}`);
                            }
                            matrix += row.join(' & ');
                            if (i < matrixRows - 1) matrix += ' \\\\\n';
                          }
                          matrix += '\n\\end{matrix} \\right|';
                          insertLatexTemplate(matrix);
                          setShowMatrixInput(false);
                        }}
                      >
                        Insert
                      </button>
                    </div>
                  </div>
                )}
                <textarea
                  className={`latex-textarea w-full h-32 p-2 border rounded mb-4 font-mono text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  placeholder="Enter LaTeX code (e.g., \frac{a}{b} or x^2 + y^2 = z^2)"
                  value={latexInput}
                  onChange={(e) => setLatexInput(e.target.value)}
                  autoFocus
                />

                <div className={`text-xs mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                  Tip: Use standard LaTeX syntax. Your equation will be rendered when published.
                </div>

                <div className={`border p-3 rounded mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
                  }`}>
                  <div className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    Live Preview:
                  </div>
                  <div
                    className="text-sm"
                    dangerouslySetInnerHTML={{ __html: latexPreview }}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    className={`px-4 py-2 rounded hover:opacity-90 transition-colors duration-200 ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'
                      }`}
                    onClick={() => {
                      setShowLatexModal(false);
                      setLatexInput('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 text-white rounded hover:opacity-90 transition-colors duration-200"
                    style={{ backgroundColor: primaryColor }}
                    onClick={insertLatex}
                  >
                    {isLatexSelected ? 'Update Equation' : 'Insert Equation'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogEditorToolbar;