import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { BulletList, ListItem } from '@tiptap/extension-list'
import { createLowlight } from 'lowlight';
import {
    FiBold, FiItalic, FiUnderline, FiLink, FiImage, FiCode, FiRotateCcw, FiRotateCw,
    FiAlignLeft, FiAlignCenter, FiAlignRight, FiAlignJustify, FiList
} from 'react-icons/fi';
import { MdFormatListNumbered } from 'react-icons/md';
import { BiSolidQuoteRight } from 'react-icons/bi';
import { PiMathOperationsFill } from 'react-icons/pi';
import { FiType, FiChevronDown } from 'react-icons/fi';
import '../../styles.css';

// Create lowlight instance
const lowlight = createLowlight();

const Latex = {
    name: 'latex',
    marks: [
        {
            name: 'latex',
            parseHTML(element) {
                return {
                    name: 'latex',
                    getAttrs: (element) => ({
                        latex: element.getAttribute('data-latex') || '',
                    }),
                };
            },
            renderHTML({ mark }) {
                return ['span', { class: 'latex-equation', 'data-latex': mark.attrs.latex }, `$${mark.attrs.latex}$`];
            },
            parseDOM: [
                {
                    tag: 'span.latex-equation',
                    getAttrs: (dom) => ({
                        latex: dom.getAttribute('data-latex') || '',
                    }),
                },
            ],
        },
    ],
};

const Tiptap = ({ content, setContent, primaryColor, darkMode }) => {
    const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
    const [tooltip, setTooltip] = useState('');
    const [hoveredIcon, setHoveredIcon] = useState(null);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [showLatexModal, setShowLatexModal] = useState(false);
    const [latexInput, setLatexInput] = useState('');
    const fileInputRef = useRef(null);
    const headingButtonRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: false, // Disable StarterKit's BulletList to use standalone BulletList
            }),
            BulletList.configure({
                HTMLAttributes: {
                    class: 'list-bullets',
                },
            }),
            ListItem,
            Underline,
            Link.configure({
                openOnClick: true,
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
            Latex,
        ],
        content,
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (headingButtonRef.current && !headingButtonRef.current.contains(e.target) && !e.target.closest('.heading-dropdown')) {
                setShowHeadingDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!editor) {
        return null;
    }

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

    const handleLinkButtonClick = () => {
        const previousUrl = editor.getAttributes('link').href || '';
        setLinkUrl(previousUrl);
        setShowLinkModal(true);
    };

    const handleInsertLink = () => {
        if (linkUrl) {
            editor.chain().focus().setLink({ href: linkUrl }).run();
        } else {
            editor.chain().focus().unsetLink().run();
        }
        setShowLinkModal(false);
        setLinkUrl('');
    };

    const handleLatexButtonClick = () => {
        const selection = editor.state.selection;
        const node = selection.$from.nodeAfter;
        if (node && node.marks.some(mark => mark.type.name === 'latex')) {
            setLatexInput(node.marks.find(mark => mark.type.name === 'latex').attrs.latex);
        } else {
            setLatexInput('');
        }
        setShowLatexModal(true);
    };

    const handleInsertLatex = () => {
        if (latexInput) {
            editor.chain().focus().insertContent(`<span class="latex-equation" data-latex="${latexInput}">$${latexInput}$</span>`).run();
        }
        setShowLatexModal(false);
        setLatexInput('');
    };

    const buttons = [
        { icon: <FiBold />, action: () => editor.chain().focus().toggleBold().run(), disabled: !editor.can().toggleBold(), active: editor.isActive('bold'), name: 'Bold' },
        { icon: <FiItalic />, action: () => editor.chain().focus().toggleItalic().run(), disabled: !editor.can().toggleItalic(), active: editor.isActive('italic'), name: 'Italic' },
        { icon: <FiUnderline />, action: () => editor.chain().focus().toggleUnderline().run(), disabled: !editor.can().toggleUnderline(), active: editor.isActive('underline'), name: 'Underline' },
        { icon: <FiList />, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), name: 'Bullet List' },
        { icon: <MdFormatListNumbered />, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), name: 'Ordered List' },
        { icon: <FiAlignLeft />, action: () => editor.chain().focus().setTextAlign('left').run(), active: editor.isActive({ textAlign: 'left' }), name: 'Align Left' },
        { icon: <FiAlignCenter />, action: () => editor.chain().focus().setTextAlign('center').run(), active: editor.isActive({ textAlign: 'center' }), name: 'Align Center' },
        { icon: <FiAlignRight />, action: () => editor.chain().focus().setTextAlign('right').run(), active: editor.isActive({ textAlign: 'right' }), name: 'Align Right' },
        { icon: <FiAlignJustify />, action: () => editor.chain().focus().setTextAlign('justify').run(), active: editor.isActive({ textAlign: 'justify' }), name: 'Justify' },
        { icon: <BiSolidQuoteRight />, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote'), name: 'Blockquote' },
        { icon: <FiLink />, action: handleLinkButtonClick, active: editor.isActive('link'), name: 'Insert Link' },
        { icon: <FiImage />, action: handleImageUpload, active: false, name: 'Insert Image' },
        { icon: <FiCode />, action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock'), name: 'Insert Code' },
        { icon: <PiMathOperationsFill />, action: handleLatexButtonClick, active: false, name: 'Insert LaTeX' },
        { icon: <FiRotateCcw />, action: () => editor.chain().focus().undo().run(), disabled: !editor.can().undo(), name: 'Undo' },
        { icon: <FiRotateCw />, action: () => editor.chain().focus().redo().run(), disabled: !editor.can().redo(), name: 'Redo' },
    ];

    const headingStyles = [
        { name: 'Heading 1', level: 1 },
        { name: 'Heading 2', level: 2 },
        { name: 'Heading 3', level: 3 },
        { name: 'Heading 4', level: 4 },
        { name: 'Normal Text', level: null },
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
          .heading-item-button:hover {
            background-color: ${primaryColor} !important;
            color: white !important;
            border-color: ${primaryColor} !important;
          }
          .heading-item-button.active {
            background-color: ${primaryColor} !important;
            color: white !important;
            border-color: ${primaryColor} !important;
          }
          .latex-equation {
            background-color: ${darkMode ? '#4b5563' : '#f3f4f6'};
            padding: 2px 4px;
            border-radius: 3px;
            cursor: pointer;
          }
          .modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 50;
            padding: 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 90%;
            max-width: 400px;
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
          .ProseMirror .list-bullets {
            list-style-type: disc;
            padding-left: 1.5rem;
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
                <div className="relative" ref={headingButtonRef}>
                    <button
                        type="button"
                        className={`
                p-2 rounded-md border shadow-sm transition-colors duration-200 font-bold flex items-center gap-1
                ${editor.isActive('heading') ? 'text-white' : darkMode ? 'text-gray-200 hover:text-white' : 'text-gray-800 hover:text-white'}
              `}
                        onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
                        onMouseEnter={() => {
                            setTooltip('Headings');
                            setHoveredIcon('heading');
                        }}
                        onMouseLeave={() => {
                            setTooltip('');
                            setHoveredIcon(null);
                        }}
                        style={{
                            backgroundColor: editor.isActive('heading') || hoveredIcon === 'heading'
                                ? primaryColor
                                : darkMode
                                    ? '#374151'
                                    : 'white',
                            borderColor: editor.isActive('heading') || hoveredIcon === 'heading'
                                ? primaryColor
                                : darkMode
                                    ? '#4b5563'
                                        : '#e5e7eb',
                        }}
                    >
                        <FiType />
                        <FiChevronDown />
                    </button>
                    {tooltip === 'Headings' && (
                        <div
                            className={`absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}
                        >
                            Headings
                        </div>
                    )}
                    {showHeadingDropdown && (
                        <div
                            className={`heading-dropdown absolute z-20 left-0 mt-1 w-44 rounded-md border shadow-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}
                        >
                            {headingStyles.map((style) => (
                                <button
                                    key={style.name}
                                    className={`heading-item-button w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${editor.isActive('heading', { level: style.level }) ? 'active' : darkMode ? 'text-white' : 'text-gray-800'}`}
                                    style={{
                                        backgroundColor: editor.isActive('heading', { level: style.level }) ? primaryColor : 'transparent',
                                        color: editor.isActive('heading', { level: style.level }) ? 'white' : darkMode ? 'white' : '#1f2937',
                                        borderColor: editor.isActive('heading', { level: style.level }) ? primaryColor : 'transparent',
                                    }}
                                    onClick={() => {
                                        if (style.level) {
                                            editor.chain().focus().toggleHeading({ level: style.level }).run();
                                        } else {
                                            editor.chain().focus().setParagraph().run();
                                        }
                                        setShowHeadingDropdown(false);
                                    }}
                                >
                                    {style.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
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
            {showLinkModal && (
                <div className={`modal ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Insert Link</h3>
                        <button onClick={() => setShowLinkModal(false)}>
                            <FiX />
                        </button>
                    </div>
                    <input
                        type="text"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="Enter URL"
                        className={`w-full px-3 py-2 border rounded-lg mb-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-800'}`}
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setShowLinkModal(false)}
                            className={`px-4 py-2 border rounded-lg ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-300 text-gray-800'}`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleInsertLink}
                            className="px-4 py-2 text-white rounded-lg"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Insert
                        </button>
                    </div>
                </div>
            )}
            {showLatexModal && (
                <div className={`modal ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Insert LaTeX</h3>
                        <button onClick={() => setShowLatexModal(false)}>
                            <FiX />
                        </button>
                    </div>
                    <textarea
                        value={latexInput}
                        onChange={(e) => setLatexInput(e.target.value)}
                        placeholder="Enter LaTeX code"
                        className={`w-full px-3 py-2 border rounded-lg mb-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-800'}`}
                        rows="4"
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setShowLatexModal(false)}
                            className={`px-4 py-2 border rounded-lg ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-300 text-gray-800'}`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleInsertLatex}
                            className="px-4 py-2 text-white rounded-lg"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Insert
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Tiptap;