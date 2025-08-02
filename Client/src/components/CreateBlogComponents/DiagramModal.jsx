
import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { FiX, FiCheck, FiChevronDown } from 'react-icons/fi';

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
  pie: `pie title Sample Pie Chart
    "Category A" : 30
    "Category B" : 20
    "Category C" : 40
    "Category D" : 10`,
  erd: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses
    LINE-ITEM ||--o{ PRODUCT : includes
    CUSTOMER {
        int customerId
        string name
        string email
    }
    ORDER {
        int orderId
        date orderDate
        string status
    }
    LINE-ITEM {
        int itemId
        int orderId
        int productId
        int quantity
    }
    PRODUCT {
        int productId
        string name
        float price
    }
    DELIVERY-ADDRESS {
        int addressId
        int customerId
        string street
        string city
    }`
};

const diagramTypes = [
  { value: 'flowchart', label: 'Flowchart' },
  { value: 'sequence', label: 'Sequence Diagram' },
  { value: 'class', label: 'Class Diagram' },
  { value: 'gantt', label: 'Gantt Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'erd', label: 'ER Diagram' },
];

const DiagramModal = ({ editor, primaryColor, darkMode, isOpen, setIsOpen }) => {
  const [diagramType, setDiagramType] = useState('flowchart');
  const [diagramCode, setDiagramCode] = useState(diagramTemplates.flowchart);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [showDiagramDropdown, setShowDiagramDropdown] = useState(false);
  const [tooltip, setTooltip] = useState('');
  const diagramButtonRef = useRef(null);
  const renderIdRef = useRef(`diagram-preview-${Date.now()}`);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        diagramButtonRef.current &&
        !diagramButtonRef.current.contains(e.target) &&
        !e.target.closest('.diagram-dropdown')
      ) {
        setShowDiagramDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const themeCSS = darkMode
      ? `
        .node rect, .node circle, .node ellipse, .node polygon, .node path {
          fill: #9ca3af;
          stroke: #d1d5db;
          stroke-width: 2px;
        }
        .edgePath path {
          stroke: #d1d5db;
          stroke-width: 3px;
        }
        .label, .actor, .messageText, .noteText, .taskText {
          fill: #ffffff;
          color: #ffffff;
        }
        .section rect {
          fill: #4b5563;
        }
        .grid .tick line {
          stroke: #6b7280;
        }
        .todayMarker {
          stroke: #d1d5db;
          stroke-width: 2px;
        }
        .actor {
          fill: #9ca3af;
        }
        .note rect {
          fill: #4b5563;
          stroke: #d1d5db;
        }
        .cluster rect {
          fill: #4b5563;
          stroke: #d1d5db;
          stroke-width: 1px;
        }
        .pieLabel {
          fill: #ffffff;
          color: #ffffff;
        }
        .mermaid-main {
          background: transparent !important;
        }
        svg {
          height: 400px !important;
          max-height: 400px !important;
        }
      `
      : `
        .node rect, .node circle, .node ellipse, .node polygon, .node path {
          fill: #e5e7eb;
          stroke: #4b5563;
          stroke-width: 2px;
        }
        .edgePath path {
          stroke: #4b5563;
          stroke-width: 3px;
        }
        .label, .actor, .messageText, .noteText, .taskText {
          fill: #1f2937;
          color: #1f2937;
        }
        .section rect {
          fill: #6b7280;
        }
        .grid .tick line {
          stroke: #9ca3af;
        }
        .todayMarker {
          stroke: #4b5563;
          stroke-width: 2px;
        }
        .actor {
          fill: #e5e7eb;
        }
        .note rect {
          fill: #6b7280;
          stroke: #4b5563;
        }
        .cluster rect {
          fill: #6b7280;
          stroke: #4b5563;
          stroke-width: 1px;
        }
        .pieLabel {
          fill: #1f2937;
          color: #1f2937;
        }
        .mermaid-main {
          background: transparent !important;
        }
        svg {
          height: 400px !important;
          max-height: 400px !important;
        }
      `;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeCSS,
      flowchart: { useMaxWidth: false, htmlLabels: true, diagramPadding: 8 },
      sequence: { actorMargin: 50, useMaxWidth: false },
      class: { useMaxWidth: false },
      gantt: { 
        axisFormat: '%Y-%m-%d', 
        useMaxWidth: false, 
        barHeight: 30,
        fontSize: 14,
        sectionPadding: 20,
        barGap: 10,
        topPadding: 50,
        gridLineStartPadding: 40
      },
      pie: { useMaxWidth: false },
      er: { useMaxWidth: false }
    });
  }, [darkMode]);

  useEffect(() => {
    if (isOpen) {
      setDiagramCode(diagramTemplates[diagramType]);
      setPreview('');
      setError('');
    }
  }, [diagramType, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const renderDiagram = async () => {
      try {
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
      editor.chain().focus().setImage({ 
        src: base64Svg, 
        alt: `Diagram (${diagramType})`,
        height: 400
      }).run();
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setDiagramType('flowchart');
    setDiagramCode(diagramTemplates.flowchart);
    setPreview('');
    setError('');
    setShowDiagramDropdown(false);
  };

  return (
    isOpen && (
      <>
        <style>
          {`
            .diagram-dropdown {
              position: absolute;
              z-index: 20;
              left: 0;
              margin-top: 0.25rem;
              width: 11rem;
              border-radius: 0.375rem;
              border: 1px solid ${darkMode ? '#4b5563' : '#e5e7eb'};
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              background-color: ${darkMode ? '#374151' : 'white'};
            }
            .diagram-item-button {
              width: 100%;
              text-align: left;
              padding: 0.5rem 1rem;
              font-size: 0.875rem;
              line-height: 1.25rem;
              transition: background-color 0.2s ease, color 0.2s ease;
              color: ${darkMode ? 'white' : '#1f2937'};
            }
            .diagram-item-button.active {
              background-color: ${primaryColor};
              color: white;
            }
            .diagram-item-button:hover {
              background-color: ${primaryColor};
              color: white;
            }
            .diagram-modal-textarea:focus {
              border-color: ${primaryColor};
              outline: none;
            }
            .diagram-button {
              background-color: ${darkMode ? '#374151' : 'white'};
              border-color: ${darkMode ? '#4b5563' : '#e5e7eb'};
              color: ${darkMode ? 'white' : '#1f2937'};
            }
            .diagram-button:hover {
              background-color: ${darkMode ? '#374151' : 'white'};
              border-color: ${darkMode ? '#4b5563' : '#e5e7eb'};
              color: ${darkMode ? 'white' : '#1f2937'};
            }
            .preview-box::-webkit-scrollbar {
              height: 8px;
            }
          `}
        </style>
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 ${darkMode ? 'bg-black/50' : 'bg-black/30'}`}
          onClick={handleClose}
        >
          <div
            className={`p-6 rounded-lg shadow-lg max-w-3xl w-full ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}
            style={{ border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Create Diagram</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Diagram Type</label>
              <div className="relative" ref={diagramButtonRef}>
                <button
                  type="button"
                  className="diagram-button p-2 rounded-md border shadow-sm transition-colors duration-200 flex items-center gap-1 w-full text-sm"
                  onClick={() => setShowDiagramDropdown(!showDiagramDropdown)}
                  onMouseEnter={() => setTooltip('Select Diagram Type')}
                  onMouseLeave={() => setTooltip('')}
                >
                  <span>{diagramTypes.find((type) => type.value === diagramType).label}</span>
                  <FiChevronDown className="ml-auto" />
                </button>
                {tooltip === 'Select Diagram Type' && (
                  <div
                    className={`absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}
                  >
                    Select Diagram Type
                  </div>
                )}
                {showDiagramDropdown && (
                  <div className="diagram-dropdown">
                    {diagramTypes.map((type) => (
                      <button
                        key={type.value}
                        className={`diagram-item-button ${diagramType === type.value ? 'active' : ''}`}
                        onClick={() => {
                          setDiagramType(type.value);
                          setShowDiagramDropdown(false);
                        }}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Diagram Code (Mermaid Syntax)</label>
              <textarea
                value={diagramCode}
                onChange={(e) => setDiagramCode(e.target.value)}
                className={`diagram-modal-textarea w-full p-2 rounded border resize-y font-mono text-sm ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-800'}`}
                style={{ minHeight: '150px' }}
                placeholder="Enter Mermaid diagram code..."
              />
              {error && <span className="text-red-500 text-sm">{error}</span>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Preview</label>
              <div
                className={`preview-box border rounded-md p-4 overflow-auto max-h-60 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
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
                type="button"
                onClick={handleClose}
                className={`px-4 py-2 rounded ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsert}
                disabled={!preview}
                className={`px-4 py-2 rounded flex items-center gap-2 text-white ${preview ? '' : 'opacity-50 cursor-not-allowed'}`}
                style={{ backgroundColor: preview ? primaryColor : '#9ca3af', borderColor: preview ? primaryColor : '#9ca3af' }}
              >
                <FiCheck />
                Insert Diagram
              </button>
            </div>
          </div>
        </div>
      </>
    )
  );
};

export default DiagramModal;
