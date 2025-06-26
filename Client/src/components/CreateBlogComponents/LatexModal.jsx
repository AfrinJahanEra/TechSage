import React, { useState, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const LatexModal = ({ isOpen, onClose, editorRef }) => {
  const [latexInput, setLatexInput] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  
  // Update preview when LaTeX changes
  useEffect(() => {
    try {
      const html = katex.renderToString(latexInput, {
        throwOnError: false,
        displayMode: true
      });
      setPreviewHtml(html);
    } catch (e) {
      setPreviewHtml('<span style="color:red">Invalid LaTeX</span>');
    }
  }, [latexInput]);
  
  // Insert LaTeX into editor
  const insertLatex = () => {
    if (!latexInput.trim()) return;
    
    try {
      const tempDiv = document.createElement('div');
      katex.render(latexInput, tempDiv, {
        throwOnError: false,
        displayMode: true
      });
      
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(tempDiv);
        
        // Add space after equation
        const space = document.createTextNode(' ');
        range.setStartAfter(tempDiv);
        range.insertNode(space);
        
        // Move cursor after space
        range.setStartAfter(space);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      onClose();
      setLatexInput('');
    } catch (e) {
      alert('Error inserting equation. Please check your LaTeX syntax.');
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Insert LaTeX Equation</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        
        <textarea
          value={latexInput}
          onChange={(e) => setLatexInput(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Enter LaTeX equation (e.g., E = mc^2)"
          autoFocus
        />
        
        <div className="mb-4 p-3 bg-gray-100 rounded-md min-h-12">
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={insertLatex}
            disabled={!latexInput.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Insert Equation
          </button>
        </div>
      </div>
    </div>
  );
};

export default LatexModal;