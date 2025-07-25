import React, { useRef, useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { json } from '@codemirror/lang-json';
import { EditorState } from '@codemirror/state';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript.min';
import 'prismjs/components/prism-python.min';
import 'prismjs/components/prism-markup.min';
import 'prismjs/components/prism-css.min';
import 'prismjs/components/prism-java.min';
import 'prismjs/components/prism-c.min';
import 'prismjs/components/prism-cpp.min';
import 'prismjs/components/prism-bash.min';
import 'prismjs/components/prism-json.min';

const CodeModal = ({
  editorRef,
  codeInput,
  setCodeInput,
  codeLanguage,
  setCodeLanguage,
  isEditingCodeBlock,
  setShowCodeModal,
  setIsEditingCodeBlock,
  setSelectedCodeBlock,
  darkMode,
  primaryColor,
  savedRange,
}) => {
  const editorContainerRef = useRef(null);
  const editorViewRef = useRef(null);
  const previewRef = useRef(null);
  const [error, setError] = useState(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript', extension: javascript() },
    { value: 'python', label: 'Python', extension: python() },
    { value: 'html', label: 'HTML', extension: html() },
    { value: 'css', label: 'CSS', extension: css() },
    { value: 'java', label: 'Java', extension: java() },
    { value: 'cpp', label: 'C++', extension: cpp() },
    { value: 'json', label: 'JSON', extension: json() },
    { value: 'bash', label: 'Bash', extension: javascript() },
  ];

  const getLanguageExtension = (langValue) => {
    const lang = languages.find((l) => l.value === langValue);
    return lang ? lang.extension : javascript();
  };

  // Initialize CodeMirror and auto-focus
  useEffect(() => {
    if (!editorContainerRef.current) return;

    try {
      const state = EditorState.create({
        doc: codeInput,
        extensions: [
          basicSetup,
          getLanguageExtension(codeLanguage),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              setCodeInput(update.state.doc.toString());
            }
          }),
          EditorView.theme({
            '&': {
              height: '8rem',
              border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '0.5rem',
              backgroundColor: darkMode ? '#1f2937' : '#fff',
              color: darkMode ? '#e5e7eb' : '#1f293b',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            },
            '.cm-scroller': {
              overflow: 'auto',
            },
            '.cm-editor': {
              outline: 'none',
            },
          }),
          EditorView.domEventHandlers({
            keydown(event, view) {
              event.stopPropagation();
              return false;
            },
          }),
        ],
      });

      editorViewRef.current = new EditorView({
        state,
        parent: editorContainerRef.current,
      });

      editorViewRef.current.focus();

      return () => {
        editorViewRef.current?.destroy();
        editorViewRef.current = null;
      };
    } catch (err) {
      console.error('CodeMirror initialization failed:', err);
      setError('Failed to initialize code editor');
    }
  }, [codeLanguage, darkMode]);

  // Update CodeMirror content
  useEffect(() => {
    if (editorViewRef.current && editorViewRef.current.state.doc.toString() !== codeInput) {
      try {
        editorViewRef.current.dispatch({
          changes: {
            from: 0,
            to: editorViewRef.current.state.doc.length,
            insert: codeInput,
          },
        });
      } catch (err) {
        console.error('CodeMirror update failed:', err);
        setError('Failed to update code editor');
      }
    }
  }, [codeInput]);

  // Update Prism.js preview
  useEffect(() => {
    if (previewRef.current && previewRef.current.querySelector('code')) {
      try {
        Prism.highlightElement(previewRef.current.querySelector('code'));
      } catch (err) {
        console.error('Prism.js highlighting error:', err);
        setError('Failed to apply syntax highlighting');
      }
    }
  }, [codeInput, codeLanguage, darkMode]);

  // Prevent clicks on backdrop
  const handleBackdropClick = (e) => {
    e.stopPropagation();
  };

  const handleInsertCodeBlock = () => {
    if (!codeInput.trim()) {
      setError('Code input cannot be empty');
      return;
    }

    if (!editorRef.current) {
      console.error('editorRef is not initialized');
      setError('Editor reference is missing');
      return;
    }

    try {
      // Create code block element
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = codeInput.trim();
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

      const selection = window.getSelection();
      let range = savedRange || (selection.rangeCount > 0 ? selection.getRangeAt(0) : null);

      console.log('SavedRange:', savedRange, 'Selection:', selection, 'Range:', range, 'editorRef.current:', editorRef.current);

      // Validate or create range
      if (!range || !editorRef.current.contains(range.commonAncestorContainer)) {
        console.log('Invalid range, creating new one');
        range = document.createRange();
        const targetNode = editorRef.current.lastChild || editorRef.current;
        range.selectNodeContents(targetNode);
        range.collapse(false); // End of content
        selection.removeAllRanges();
        selection.addRange(range);
      } else if (savedRange) {
        console.log('Restoring saved range');
        selection.removeAllRanges();
        selection.addRange(savedRange);
        range = savedRange;
      }

      // Handle editing mode
      if (isEditingCodeBlock) {
        const existingCodeBlock = editorRef.current.querySelector('.code-block');
        if (existingCodeBlock) {
          console.log('Replacing existing code block');
          existingCodeBlock.replaceWith(pre);
        } else {
          console.log('Inserting new code block in edit mode');
          range.deleteContents();
          range.insertNode(pre);
        }
      } else {
        console.log('Inserting new code block at cursor');
        range.deleteContents();
        range.insertNode(pre);
      }

      // Position cursor after code block
      const newRange = document.createRange();
      newRange.setStartAfter(pre);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);

      // Ensure focus
      editorRef.current.focus();

      // Close modal and reset state
      setShowCodeModal(false);
      setCodeInput('');
      setCodeLanguage('javascript');
      setSelectedCodeBlock(null);
      setIsEditingCodeBlock(false);
    } catch (err) {
      console.error('Error inserting code block:', err);
      setError('Failed to insert code block');
    }
  };

  if (error) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        onClick={handleBackdropClick}
      >
        <div
          className={`rounded-xl p-6 w-full max-w-3xl shadow-xl ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
          style={{
            border: '1px solid rgba(0, 0, 0, 0.12)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
          }}
        >
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Error
          </h3>
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => setShowCodeModal(false)}
            className="px-4 py-2 text-white rounded mt-4 hover:opacity-90 transition-colors duration-200"
            style={{ backgroundColor: primaryColor }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .action-button:hover {
            background-color: ${primaryColor} !important;
            color: white !important;
          }
          .select-input:hover {
            border-color: ${primaryColor} !important;
          }
          .select-input:focus {
            border-color: ${primaryColor} !important;
            box-shadow: 0 0 0 2px ${primaryColor}20 !important;
          }
        `}
      </style>
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        onClick={handleBackdropClick}
      >
        <div
          className={`rounded-xl p-6 w-full max-w-3xl h-[350px] overflow-hidden flex flex-col shadow-xl ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
          style={{
            border: '1px solid rgba(0, 0, 0, 0.12)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 text-center">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {isEditingCodeBlock ? 'Edit Code Snippet' : 'Insert Code Snippet'}
              </h3>
              <button
                onClick={() => {
                  setShowCodeModal(false);
                  setCodeInput('');
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
            <div className="w-full md:w-1/2 flex flex-col">
              <label
                className={`text-sm font-semibold block mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Language
              </label>
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className={`select-input w-full border rounded px-3 py-2 text-sm font-mono transition-colors duration-200 mb-4 ${
                  darkMode
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-white text-gray-800 border-gray-300'
                }`}
                autoFocus
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <label
                className={`text-sm font-semibold block mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Code
              </label>
              <div ref={editorContainerRef} className="flex-1" />
              <div className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Tip: Use Tab for indentation.
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col">
              <div className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Live Preview:
              </div>
              <pre
                ref={previewRef}
                className={`flex-1 border rounded p-3 overflow-auto ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
                }`}
                style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
              >
                <code className={`language-${codeLanguage}`}>
                  {codeInput || '// Enter your code here...'}
                </code>
              </pre>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              className={`action-button px-4 py-2 rounded hover:opacity-90 transition-colors duration-200 ${
                darkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'
              }`}
              onClick={() => {
                setShowCodeModal(false);
                setCodeInput('');
              }}
            >
              Cancel
            </button>
            <button
              className="action-button px-4 py-2 text-white rounded hover:opacity-90 transition-colors duration-200"
              style={{ backgroundColor: primaryColor }}
              onClick={handleInsertCodeBlock}
            >
              {isEditingCodeBlock ? 'Update Code' : 'Insert Code'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CodeModal;