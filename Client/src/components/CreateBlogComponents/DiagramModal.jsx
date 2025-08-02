import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { FiX, FiCheck } from 'react-icons/fi';

// Initialize Mermaid with a unique ID
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  flowchart: { useMaxWidth: true, htmlLabels: true },
  sequence: { actorMargin: 50 },
  class: { useMaxWidth: true },
  gantt: { axisFormat: '%Y-%m-%d' },
});

const diagramTemplates = {
  flowchart: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,
  sequence: `sequenceDiagram
    Alice->>Bob: Hello Bob, how are you?
    Note right of Bob: Bob thinks
    Bob-->>Alice: I am good thanks!`,
  class: `classDiagram
    Class01 <|-- AveryLongClass : Cool
    Class03 *-- Class04
    Class05 o-- Class06
    Class07 .. Class08
    Class09 --> C2 : Where am I?
    Class09 --* C3
    Class09 --|> Class07
    Class07 : equals()
    Class07 : Object[] elementData
    Class01 : size()
    Class01 : int chimp
    Class01 : int gorilla`,
  gantt: `gantt
    dateFormat  YYYY-MM-DD
    title Adding GANTT diagram functionality
    section A section
    Completed task    :done, des1, 2014-01-06,2014-01-08
    Active task      :active, des2, 2014-01-09, 3d
    Future task      :des3, after des2, 5d
    Future task2     :des4, after des3, 5d`,
};

const DiagramModal = ({ editor, primaryColor, darkMode, isOpen, setIsOpen }) => {
  const [diagramType, setDiagramType] = useState('flowchart');
  const [diagramCode, setDiagramCode] = useState(diagramTemplates.flowchart);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const renderIdRef = useRef(`diagram-preview-${Date.now()}`);

  useEffect(() => {
    if (isOpen) {
      // Update diagram code when type changes
      setDiagramCode(diagramTemplates[diagramType]);
      setPreview('');
      setError('');
    }
  }, [diagramType, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Debounce rendering to avoid excessive calls
    const renderDiagram = async () => {
      try {
        // Generate a unique ID for each render to avoid Mermaid conflicts
        const renderId = `diagram-preview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        renderIdRef.current = renderId;

        const { svg } = await mermaid.render(renderId, diagramCode);
        setPreview(svg);
        setError('');
      } catch (err) {
        setError('Invalid diagram syntax. Please check your code.');
        setPreview('');
      }
    };

    const timer = setTimeout(renderDiagram, 300);
    return () => clearTimeout(timer);
  }, [diagramCode, isOpen]);

  const handleInsert = () => {
    if (editor && preview) {
      const base64Svg = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(preview)))}`;
      editor.chain().focus().setImage({ src: base64Svg, alt: `Diagram (${diagramType})` }).run();
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setDiagramType('flowchart');
    setDiagramCode(diagramTemplates.flowchart);
    setPreview('');
    setError('');
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`relative w-full max-w-3xl rounded-lg shadow-xl p-6 ${
          darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-md hover:bg-opacity-80 transition-all"
          style={{
            backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
            color: darkMode ? '#e5e7eb' : '#1f2937',
          }}
        >
          <FiX size={20} />
        </button>

        <h3 className="text-lg font-semibold mb-4">Create Diagram</h3>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Diagram Type</label>
            <select
              value={diagramType}
              onChange={(e) => setDiagramType(e.target.value)}
              className={`p-2 rounded-md border focus:outline-none focus:ring-2 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-[var(--primary-color)]'
                  : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-[var(--primary-color)]'
              }`}
            >
              <option value="flowchart">Flowchart</option>
              <option value="sequence">Sequence Diagram</option>
              <option value="class">Class Diagram</option>
              <option value="gantt">Gantt Chart</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Diagram Code (Mermaid Syntax)</label>
            <textarea
              value={diagramCode}
              onChange={(e) => setDiagramCode(e.target.value)}
              className={`w-full h-48 p-3 rounded-md border resize-y focus:outline-none focus:ring-2 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-[var(--primary-color)]'
                  : 'bg-gray-50 border-gray-300 text-gray-800 focus:ring-[var(--primary-color)]'
              }`}
              placeholder="Enter Mermaid diagram code..."
            />
            {error && <span className="text-red-500 text-sm">{error}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Preview</label>
            <div
              className={`border rounded-md p-4 overflow-auto max-h-60 ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
              }`}
            >
              {preview ? (
                <div dangerouslySetInnerHTML={{ __html: preview }} />
              ) : (
                <p className="text-gray-500">Diagram preview will appear here...</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleClose}
              className={`px-4 py-2 rounded-md transition-all ${
                darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              disabled={!preview}
              className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
                preview
                  ? `bg-[var(--primary-color)] hover:bg-opacity-90 text-white`
                  : 'bg-gray-400 cursor-not-allowed text-gray-200'
              }`}
              style={{ backgroundColor: preview ? primaryColor : undefined }}
            >
              <FiCheck />
              Insert Diagram
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagramModal;