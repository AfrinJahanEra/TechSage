import React, { useState, useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { json } from '@codemirror/lang-json';
import { StreamLanguage } from '@codemirror/stream-parser';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { darcula } from '@uiw/codemirror-theme-darcula';
import { material } from '@uiw/codemirror-theme-material';

const CodeModal = ({ editorRef, showCodeModal, setShowCodeModal, selectedCodeBlock, darkMode, primaryColor }) => {
  const [code, setCode] = useState(selectedCodeBlock ? selectedCodeBlock.codeContent : '');
  const [language, setLanguage] = useState(selectedCodeBlock ? selectedCodeBlock.language : 'javascript');
  const editorContainerRef = useRef(null);

  useEffect(() => {
    if (showCodeModal && editorContainerRef.current) {
      editorContainerRef.current.editor.focus();
    }
  }, [showCodeModal]);

  const handleInsertCode = () => {
    if (!code.trim()) return;

    const pre = document.createElement('pre');
    pre.className = 'code-block';
    pre.contentEditable = 'false';
    pre.style.padding = '1em';
    pre.style.borderRadius = '8px';
    pre.style.overflowX = 'auto';
    pre.style.background = darkMode ? '#1e293b' : '#f3f4f6';
    pre.style.color = darkMode ? '#e2e8f0' : '#1e293b';
    pre.style.margin = '1em 0';
    pre.style.fontSize = '0.875rem';
    pre.style.fontFamily = 'monospace';

    const codeElement = document.createElement('code');
    codeElement.className = `language-${language}`;
    codeElement.textContent = code;
    pre.appendChild(codeElement);

    const editor = editorRef.current;
    if (selectedCodeBlock) {
      selectedCodeBlock.pre.replaceWith(pre);
    } else {
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

      if (range && editor.contains(range.startContainer)) {
        range.deleteContents();
        range.insertNode(pre);
      } else {
        editor.appendChild(pre);
      }
    }

    setShowCodeModal(false);
    setSelectedCodeBlock(null);
    editor.focus();
  };

  const languageMap = {
    javascript: javascript(),
    python: python(),
    html: html(),
    css: css(),
    java: java(),
    c_cpp: cpp(),
    bash: StreamLanguage.define(shell),
    json: json(),
  };

  const theme = darkMode ? darcula : material;

  return (
    showCodeModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className={`rounded-xl p-6 w-full max-w-2xl bg-white border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {selectedCodeBlock ? 'Edit Code Snippet' : 'Insert Code Snippet'}
            </h3>
            <button
              onClick={() => {
                setShowCodeModal(false);
                setSelectedCodeBlock(null);
              }}
              className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="mb-4">
            <label className={`text-sm font-semibold block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`w-full border rounded px-3 py-2 text-sm ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
            >
              {Object.keys(languageMap).map((lang) => (
                <option key={lang} value={lang}>
                  {lang === 'c_cpp' ? 'C/C++' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4" ref={editorContainerRef}>
            <label className={`text-sm font-semibold block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Code</label>
            <CodeMirror
              value={code}
              onChange={setCode}
              extensions={[languageMap[language]]}
              theme={theme}
              height="300px"
              style={{ borderRadius: '4px', border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}` }}
              basicSetup={{
                lineNumbers: true,
                tabSize: 2,
                indentOnInput: true,
              }}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setShowCodeModal(false);
                setSelectedCodeBlock(null);
              }}
              className={`px-4 py-2 rounded ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Cancel
            </button>
            <button
              onClick={handleInsertCode}
              className="px-4 py-2 text-white rounded"
              style={{ backgroundColor: primaryColor }}
            >
              {selectedCodeBlock ? 'Update Code' : 'Insert'}
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default CodeModal;