import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const LatexModal = ({ editorRef, latexInput, setLatexInput, isLatexSelected, setShowLatexModal, darkMode, primaryColor }) => {
  const [latexPreview, setLatexPreview] = useState('');
  const [openTemplateCategory, setOpenTemplateCategory] = useState(null);
  const [openFunctionSubcategory, setOpenFunctionSubcategory] = useState(null);
  const [showMatrixInput, setShowMatrixInput] = useState(false);
  const [matrixRows, setMatrixRows] = useState(2);
  const [matrixCols, setMatrixCols] = useState(2);

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

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div
        className={`rounded-xl p-6 w-full max-w-3xl h-[550px] overflow-hidden flex flex-col shadow-xl ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
        style={{
          border: '1px solid rgba(0, 0, 0, 0.12)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            LaTeX Templates
          </h4>

          <div className="relative flex-1 text-center">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {isLatexSelected ? 'Edit LaTeX Equation' : 'Insert LaTeX Equation'}
            </h3>
            <button
              onClick={() => {
                setShowLatexModal(false);
                setLatexInput('');
              }}
              className={`absolute right-0 top-1/2 -translate-y-1/2 ${
                darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
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
                    onClick={() => setOpenTemplateCategory(isOpen ? null : category.category)}
                    className={`w-full flex justify-between items-center px-4 py-2 rounded-md border text-sm font-medium transition-colors duration-200 ${
                      isOpen ? 'text-white' : darkMode ? 'text-gray-200 hover:text-white' : 'text-gray-800 hover:text-white'
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
                    <div className={`mt-1 border rounded-md shadow-sm overflow-hidden ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      {'subcategories' in category ? (
                        category.subcategories.map((subcat) => {
                          const isSubOpen = openFunctionSubcategory === subcat.name;

                          return (
                            <div key={subcat.name}>
                              <button
                                onClick={() => setOpenFunctionSubcategory(isSubOpen ? null : subcat.name)}
                                className={`w-full flex justify-between items-center px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                                  isSubOpen ? 'text-white' : darkMode ? 'text-gray-200 hover:text-white' : 'text-gray-800 hover:text-white'
                                }`}
                                style={{
                                  backgroundColor: isSubOpen ? primaryColor : darkMode ? '#4b5563' : '#f9fafb'
                                }}
                              >
                                {subcat.name}
                                <span>{isSubOpen ? '▲' : '▼'}</span>
                              </button>

                              {isSubOpen && (
                                <div className={`pl-4 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                                  {subcat.items.map((item) => (
                                    <button
                                      key={item.name}
                                      className={`w-full text-left px-4 py-1 text-sm transition-colors duration-200 ${
                                        darkMode ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-800'
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
                            className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                              darkMode ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-800'
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
              <div className={`mb-4 border p-3 rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-teal-50 border-teal-200'}`}>
                <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  Custom Matrix Size
                </h4>
                <div className="flex gap-4 items-center mb-2">
                  <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rows:
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={matrixRows}
                      onChange={(e) => setMatrixRows(Number(e.target.value))}
                      className={`ml-2 w-16 border rounded px-2 py-1 text-sm ${
                        darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                      }`}
                    />
                  </label>
                  <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Columns:
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={matrixCols}
                      onChange={(e) => setMatrixCols(Number(e.target.value))}
                      className={`ml-2 w-16 border rounded px-2 py-1 text-sm ${
                        darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
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
              className={`latex-textarea w-full h-32 p-2 border rounded mb-4 font-mono text-sm ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="Enter LaTeX code (e.g., \frac{a}{b} or x^2 + y^2 = z^2)"
              value={latexInput}
              onChange={(e) => setLatexInput(e.target.value)}
              autoFocus
            />

            <div className={`text-xs mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Tip: Use standard LaTeX syntax. Your equation will be rendered when published.
            </div>

            <div className={`border p-3 rounded mb-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
              <div className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Live Preview:
              </div>
              <div className="text-sm" dangerouslySetInnerHTML={{ __html: latexPreview }} />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                className={`px-4 py-2 rounded hover:opacity-90 transition-colors duration-200 ${
                  darkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'
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
  );
};

export default LatexModal;