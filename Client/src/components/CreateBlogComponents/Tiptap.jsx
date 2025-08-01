import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import { Mathematics } from '@tiptap/extension-mathematics';
import { createLowlight } from 'lowlight';
import {
  FiBold, FiItalic, FiUnderline, FiLink, FiImage, FiCode, FiRotateCcw, FiRotateCw,
} from 'react-icons/fi';
import { BiSolidQuoteRight, BiMath } from 'react-icons/bi';
import LinkModal from './LinkModal';
import LatexModal from './LatexModal';
import ListControls from './ListControls';
import HeadingControls from './HeadingControls';
import 'katex/dist/katex.min.css';
import '../../styles.css';

// Create lowlight instance
const lowlight = createLowlight();

// Custom BulletList extension with bulletStyle attribute
const CustomBulletList = BulletList.extend({
  addAttributes() {
    return {
      bulletStyle: {
        default: 'disc',
        parseHTML: element => element.style.listStyleType || 'disc',
        renderHTML: attributes => ({
          style: `list-style-type: ${attributes.bulletStyle}`,
          class: 'list-bullets',
        }),
      },
    };
  },
  addCommands() {
    return {
      setBulletListStyle: (bulletStyle) => ({ commands }) => {
        return commands.updateAttributes('bulletList', { bulletStyle });
      },
      toggleBulletList: () => ({ commands, state }) => {
        const { from, to } = state.selection;
        const isBulletListActive = state.doc.rangeHasMark(from, to, state.schema.nodes.bulletList);
        if (isBulletListActive) {
          return commands.liftListItem('listItem');
        } else {
          return commands.toggleList('bulletList', 'listItem');
        }
      },
    };
  },
});

// Custom OrderedList extension with numberStyle attribute
const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      numberStyle: {
        default: 'decimal',
        parseHTML: element => element.style.listStyleType || 'decimal',
        renderHTML: attributes => ({
          style: `list-style-type: ${attributes.numberStyle}`,
          class: 'list-numbers',
        }),
      },
    };
  },
  addCommands() {
    return {
      setOrderedListStyle: (numberStyle) => ({ commands }) => {
        return commands.updateAttributes('orderedList', { numberStyle });
      },
      toggleOrderedList: () => ({ commands, state }) => {
        const { from, to } = state.selection;
        const isOrderedListActive = state.doc.rangeHasMark(from, to, state.schema.nodes.orderedList);
        if (isOrderedListActive) {
          return commands.liftListItem('listItem');
        } else {
          return commands.toggleList('orderedList', 'listItem');
        }
      },
    };
  },
});

const Tiptap = ({ content, setContent, primaryColor, darkMode }) => {
  const [tooltip, setTooltip] = useState('');
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showLatexModal, setShowLatexModal] = useState(false);
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
      CustomBulletList,
      CustomOrderedList,
      ListItem,
      Underline,
      Link.configure({
        openOnClick: true,
        autolink: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Mathematics.configure({
        inlineOptions: {
          katexOptions: {
            throwOnError: false,
            macros: {
              '\\R': '\\mathbb{R}',
              '\\N': '\\mathbb{N}',
            },
          },
          onClick: (node, pos) => {
            setShowLatexModal(true);
            // Selection is handled in LatexModal.jsx
          },
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      console.log('Editor content updated:', html);
      setContent(html);
    },
    onCreate: ({ editor }) => {
      console.log('Editor initialized:', editor);
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      console.log('Updating editor content:', content);
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleImageUpload = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        editor.chain().focus().setImage({ src: event.target.result }).run();
      };
      reader.readAsDataURL(file);
      fileInputRef.current.value = '';
    }
  };

  const buttons = [
    { 
      icon: <FiBold />, 
      action: () => editor.chain().focus().toggleBold().run(), 
      disabled: !editor.can().toggleBold(), 
      active: editor.isActive('bold'), 
      name: 'Bold' 
    },
    { 
      icon: <FiItalic />, 
      action: () => editor.chain().focus().toggleItalic().run(), 
      disabled: !editor.can().toggleItalic(), 
      active: editor.isActive('italic'), 
      name: 'Italic' 
    },
    { 
      icon: <FiUnderline />, 
      action: () => editor.chain().focus().toggleUnderline().run(), 
      disabled: !editor.can().toggleUnderline(), 
      active: editor.isActive('underline'), 
      name: 'Underline' 
    },
    { 
      icon: <BiSolidQuoteRight />, 
      action: () => editor.chain().focus().toggleBlockquote().run(), 
      active: editor.isActive('blockquote'), 
      name: 'Blockquote' 
    },
    { 
      icon: <FiLink />, 
      action: () => setShowLinkModal(true), 
      active: editor.isActive('link'), 
      name: 'Insert/Edit Link' 
    },
    { 
      icon: <FiImage />, 
      action: handleImageUpload, 
      active: false, 
      name: 'Insert Image' 
    },
    { 
      icon: <FiCode />, 
      action: () => editor.chain().focus().toggleCodeBlock().run(), 
      active: editor.isActive('codeBlock'), 
      name: 'Insert Code' 
    },
    { 
      icon: <BiMath />, 
      action: () => setShowLatexModal(true), 
      active: editor.isActive('inlineMath'), 
      name: 'Insert/Edit LaTeX' 
    },
    { 
      icon: <FiRotateCcw />, 
      action: () => editor.chain().focus().undo().run(), 
      disabled: !editor.can().undo(), 
      name: 'Undo' 
    },
    { 
      icon: <FiRotateCw />, 
      action: () => editor.chain().focus().redo().run(), 
      disabled: !editor.can().redo(), 
      name: 'Redo' 
    },
  ];

  return (
    <>
      <style>
        {`
          .is-active {
            background-color: ${primaryColor} !important;
            color: white !important;
            border-color: ${primaryColor} !important;
          }
          .heading-item-button:hover, .bullet-item-button:hover, .number-item-button:hover {
            background-color: ${primaryColor} !important;
            color: white !important;
            border-color: ${primaryColor} !important;
          }
          .heading-item-button.active, .bullet-item-button.active, .number-item-button.active {
            background-color: ${primaryColor} !important;
            color: white !important;
            border-color: ${primaryColor} !important;
          }
          .ProseMirror {
            min-height: 300px;
            max-height: 400px;
            padding: 0.75rem 1rem;
            outline: none;
            background: transparent;
            color: inherit;
            line-height: 1.5;
            overflow-y: auto;
          }
          .ProseMirror a {
            cursor: pointer;
          }
          .ProseMirror::-webkit-scrollbar {
            width: 8px;
          }
          .ProseMirror::-webkit-scrollbar-track {
            background: ${darkMode ? '#1f2937' : '#f9fafb'};
            border-radius: 4px;
          }
          .ProseMirror::-webkit-scrollbar-thumb {
            background: ${primaryColor};
            border-radius: 4px;
          }
          .ProseMirror::-webkit-scrollbar-thumb:hover {
            background: ${darkMode ? 'color-mix(in srgb, ' + primaryColor + ' 80%, white)' : 'color-mix(in srgb, ' + primaryColor + ' 80%, black)'};
          }
          .ProseMirror p {
            margin-top: 0;
            margin-bottom: 0;
          }
          .ProseMirror p.is-empty:first-child::before {
            content: 'Start typing your blog content...';
            color: ${darkMode ? '#6b7280' : '#9ca3af'};
            pointer-events: none;
            float: left;
            height: 0;
          }
          .ProseMirror .list-bullets, .ProseMirror .list-numbers {
            padding-left: 1.5rem;
            margin: 1.25rem 0;
          }
          .ProseMirror p[style*="text-align"],
          .ProseMirror h1[style*="text-align"],
          .ProseMirror h2[style*="text-align"],
          .ProseMirror h3[style*="text-align"],
          .ProseMirror h4[style*="text-align"],
          .ProseMirror li[style*="text-align"] {
            text-align: var(--text-align) !important;
            width: 100%;
            display: block;
            --text-align: attr(style, "text-align", "left");
          }
          .ProseMirror ul[data-type="bulletList"],
          .ProseMirror ol[data-type="orderedList"] {
            width: 100%;
            margin-left: 0;
            padding-left: 1.5rem;
          }
          .ProseMirror li p {
            margin: 0;
          }
          .tiptap-mathematics-render {
            background-color: ${darkMode ? '#4b5563' : '#f3f4f6'};
            padding: 0.3em 0.4em;
            border-radius: 4px;
            cursor: pointer;
            display: inline-block;
            margin: 0.2em 0.1em;
            font-family: monospace;
            font-size: 0.9em;
            line-height: 1.6;
          }
          .tiptap-mathematics-render--editable {
            cursor: text;
          }
          .tiptap-mathematics-render[data-type="inline-math"] {
            display: inline-block;
            vertical-align: middle;
          }
        `}
      </style>
      <div className={`flex items-center gap-1 mb-3 p-2 rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-300'} focus-within:!border-[var(--primary-color)]`}>
        {buttons.map((button) => (
          <div className="relative" key={button.name}>
            <button
              type="button"
              onClick={button.action}
              disabled={button.disabled}
              className={`
                p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold
                ${button.active ? 'text-white' : darkMode ? 'text-gray-200 hover:text-white' : 'text-gray-800 hover:text-white'}
              `}
              onMouseEnter={() => {
                setTooltip(button.name);
                setHoveredIcon(button.name);
              }}
              onMouseLeave={() => {
                setTooltip('');
                setHoveredIcon(null);
              }}
              style={{
                backgroundColor: button.active || hoveredIcon === button.name
                  ? primaryColor
                  : darkMode
                    ? '#374151'
                    : 'white',
                borderColor: button.active || hoveredIcon === button.name
                  ? primaryColor
                  : darkMode
                    ? '#4b5563'
                    : '#e5e7eb',
              }}
            >
              {button.icon}
            </button>
            {tooltip === button.name && (
              <div
                className={`absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}
              >
                {button.name}
              </div>
            )}
          </div>
        ))}
        <ListControls editor={editor} primaryColor={primaryColor} darkMode={darkMode} />
        <HeadingControls editor={editor} primaryColor={primaryColor} darkMode={darkMode} />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
      <EditorContent
        editor={editor}
        className={`relative min-h-[300px] border rounded-lg prose max-w-none focus:outline-none focus:!border-[var(--primary-color)] transition-colors ${darkMode ? 'text-gray-200 border-gray-600 bg-gray-800' : 'text-gray-800 border-gray-300 bg-gray-50'}`}
      />
      <LinkModal
        editor={editor}
        primaryColor={primaryColor}
        darkMode={darkMode}
        isOpen={showLinkModal}
        setIsOpen={setShowLinkModal}
      />
      <LatexModal
        editor={editor}
        primaryColor={primaryColor}
        darkMode={darkMode}
        isOpen={showLatexModal}
        setIsOpen={setShowLatexModal}
      />
    </>
  );
};

export default Tiptap;