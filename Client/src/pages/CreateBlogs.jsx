import React, { useState, useRef, useEffect } from 'react';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';

const NewBlog = () => {
  // State for form fields
  const [blogTitle, setBlogTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [navMenuActive, setNavMenuActive] = useState(false);
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  
  // Refs
  const thumbnailInputRef = useRef(null);
  const editorRef = useRef(null);
  
  // Categories
  const categories = [
    { id: 'software', name: 'Software' },
    { id: 'math', name: 'Math' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'ai', name: 'AI' },
    { id: 'cybersecurity', name: 'Cybersecurity' },
    { id: 'webdev', name: 'Web Development' }
  ];

  // Collaborators data
  const collaborators = [
    {
      name: 'Ramisa Anan Sharley',
      role: 'Editor',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      name: 'Ridika Naznin',
      role: 'Reviewer',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg'
    },
    {
      name: 'Afrin Jahan Era',
      role: 'Contributor',
      avatar: 'https://randomuser.me/api/portraits/men/75.jpg'
    }
  ];

  // Version history data
  const versions = [
    {
      name: 'Current Version',
      date: 'Just now',
      author: 'You',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      active: true
    },
    {
      name: 'Updated content',
      date: '2 hours ago',
      author: 'Ridika Naznin',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      active: false
    },
    {
      name: 'Initial draft',
      date: 'Yesterday',
      author: 'You',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      active: false
    },
    {
      name: 'Outline created',
      date: '3 days ago',
      author: 'You',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      active: false
    }
  ];

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setNavbarScrolled(true);
      } else {
        setNavbarScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle thumbnail upload
  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnailPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag and drop for thumbnail
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      setThumbnail(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnailPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Handle editor commands
  const handleEditorCommand = (command) => {
    if (command === 'createLink') {
      const url = prompt('Enter the URL:');
      if (url) document.execCommand(command, false, url);
    } else if (command === 'insertImage') {
      const url = prompt('Enter the image URL:');
      if (url) document.execCommand(command, false, url);
    } else if (command === 'insertCode') {
      insertCodeBlock();
    } else if (command === 'insertLatex') {
      insertLatex();
    } else {
      document.execCommand(command, false, null);
    }
    editorRef.current.focus();
  };

  // Insert code block
  const insertCodeBlock = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const codeBlock = document.createElement('pre');
      codeBlock.className = 'bg-gray-100 p-2 rounded overflow-x-auto';
      codeBlock.innerHTML = '<code>// Your code here</code>';

      range.deleteContents();
      range.insertNode(codeBlock);

      // Place cursor inside the code block
      const newRange = document.createRange();
      newRange.selectNodeContents(codeBlock.querySelector('code'));
      newRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  };

  // Insert LaTeX block
  const insertLatex = () => {
    const latexBlock = document.createElement('div');
    latexBlock.className = 'bg-gray-100 p-2 rounded font-mono';
    latexBlock.innerHTML = '\\[ Your LaTeX equation here \\]';

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(latexBlock);

      // Place cursor inside the LaTeX block
      const newRange = document.createRange();
      newRange.selectNodeContents(latexBlock);
      newRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  };

  // Handle version selection
  const handleVersionSelect = (index) => {
    const updatedVersions = versions.map((version, i) => ({
      ...version,
      active: i === index
    }));
    alert('Loading version: ' + versions[index].name);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!blogTitle) {
      alert('Please enter a blog title');
      return;
    }

    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    if (!thumbnail) {
      alert('Please upload a thumbnail image');
      return;
    }

    if (!editorContent || editorContent === '<br>' || editorContent === '<div><br></div>') {
      alert('Please write some content for your blog');
      return;
    }

    // In a real application, you would send this data to a server
    alert('Blog published successfully!');
    console.log({
      blogTitle,
      selectedCategory,
      editorContent,
      thumbnail
    });

    // Reset form
    setBlogTitle('');
    setSelectedCategory('');
    setThumbnail(null);
    setThumbnailPreview('');
    setEditorContent('');
  };

  // Handle save as draft
  const handleSaveDraft = () => {
    if (!blogTitle && !editorContent) {
      alert('Please add some content before saving as draft');
      return;
    }

    // In a real app, you would save to local storage or send to server
    alert('Draft saved successfully!');
    console.log('Draft saved:', { blogTitle, selectedCategory, editorContent });
  };

  // Handle discard changes
  const handleDiscardChanges = () => {
    if (confirm('Are you sure you want to discard all changes?')) {
      setBlogTitle('');
      setSelectedCategory('');
      setThumbnail(null);
      setThumbnailPreview('');
      setEditorContent('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <Navbar/>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row mt-20 flex-1 px-20">
        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-10 order-1 lg:order-1">
          <div className="bg-white rounded-lg p-6 lg:p-10">
            <h1 className="text-3xl font-bold mb-8">Create New Blog</h1>

            <form onSubmit={handleSubmit}>
              {/* Blog Title */}
              <div className="mb-8">
                <label htmlFor="blogTitle" className="block text-xl font-semibold mb-3">Blog Title</label>
                <input
                  type="text"
                  id="blogTitle"
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:border-teal-500 focus:outline-none"
                  placeholder="Enter your blog title"
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                />
              </div>

              {/* Thumbnail Upload */}
              <div className="mb-8">
                <label className="block text-xl font-semibold mb-3">Thumbnail Image</label>
                {!thumbnailPreview ? (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-all"
                    onClick={() => thumbnailInputRef.current.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <i className="fas fa-cloud-upload-alt text-teal-500 text-4xl mb-4"></i>
                    <p className="text-gray-400 mb-1">Click to upload or drag and drop</p>
                    <small className="text-gray-400">Recommended size: 1200x630px</small>
                    <input
                      type="file"
                      id="thumbnailInput"
                      ref={thumbnailInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbnailUpload}
                    />
                  </div>
                ) : (
                  <div className="mt-4">
                    <img
                      src={thumbnailPreview}
                      alt="Preview"
                      className="max-w-xs max-h-xs rounded"
                    />
                    <button
                      type="button"
                      className="mt-2 text-red-500 text-sm"
                      onClick={() => {
                        setThumbnail(null);
                        setThumbnailPreview('');
                      }}
                    >
                      Remove image
                    </button>
                  </div>
                )}
              </div>

              {/* Category Selection */}
              <div className="mb-8">
                <label className="block text-xl font-semibold mb-3">Category</label>
                <div className="flex flex-wrap gap-2 mt-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={`px-4 py-2 bg-gray-100 rounded-full cursor-pointer transition-all ${selectedCategory === category.id ? 'bg-teal-500 text-white' : 'hover:bg-teal-500 hover:text-white'}`}
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
                <input type="hidden" id="selectedCategory" value={selectedCategory} />
              </div>

              {/* Blog Content Editor */}
              <div className="mb-8">
                <label className="block text-xl font-semibold mb-3">Blog Content</label>
                
                {/* Editor Toolbar */}
                <div className="flex flex-wrap gap-1 mb-3 p-2 bg-gray-100 rounded">
                  {/* Formatting buttons */}
                  <button
                    type="button"
                    className="w-9 h-9 bg-white rounded flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all"
                    onClick={() => handleEditorCommand('bold')}
                    title="Bold"
                  >
                    <i className="fas fa-bold"></i>
                  </button>
                  <button
                    type="button"
                    className="w-9 h-9 bg-white rounded flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all"
                    onClick={() => handleEditorCommand('italic')}
                    title="Italic"
                  >
                    <i className="fas fa-italic"></i>
                  </button>
                  <button
                    type="button"
                    className="w-9 h-9 bg-white rounded flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all"
                    onClick={() => handleEditorCommand('underline')}
                    title="Underline"
                  >
                    <i className="fas fa-underline"></i>
                  </button>

                  <div className="w-px h-9 bg-gray-300 mx-1"></div>

                  {/* List buttons */}
                  <button
                    type="button"
                    className="w-9 h-9 bg-white rounded flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all"
                    onClick={() => handleEditorCommand('insertUnorderedList')}
                    title="Bullet List"
                  >
                    <i className="fas fa-list-ul"></i>
                  </button>
                  <button
                    type="button"
                    className="w-9 h-9 bg-white rounded flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all"
                    onClick={() => handleEditorCommand('insertOrderedList')}
                    title="Numbered List"
                  >
                    <i className="fas fa-list-ol"></i>
                  </button>

                  <div className="w-px h-9 bg-gray-300 mx-1"></div>

                  {/* Alignment buttons */}
                  <button
                    type="button"
                    className="w-9 h-9 bg-white rounded flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all"
                    onClick={() => handleEditorCommand('justifyLeft')}
                    title="Align Left"
                  >
                    <i className="fas fa-align-left"></i>
                  </button>
                  <button
                    type="button"
                    className="w-9 h-9 bg-white rounded flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all"
                    onClick={() => handleEditorCommand('justifyCenter')}
                    title="Center"
                  >
                    <i className="fas fa-align-center"></i>
                  </button>
                  <button
                    type="button"
                    className="w-9 h-9 bg-white rounded flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all"
                    onClick={() => handleEditorCommand('justifyRight')}
                    title="Align Right"
                  >
                    <i className="fas fa-align-right"></i>
                  </button>
                  <button
                    type="button"
                    className="w-9 h-9 bg-white rounded flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all"
                    onClick={() => handleEditorCommand('justifyFull')}
                    title="Justify"
                  >
                    <i className="fas fa-align-justify"></i>
                  </button>

                  <div className="w-px h-9 bg-gray-300 mx-1"></div>

                  {/* Media buttons */}
                  <button
                    type="button"
                    className="w-9 h-9 bg-white rounded flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all"
                    onClick={() => handleEditorCommand('createLink')}
                    title="Insert Link"
                  >
                    <i className="fas fa-link"></i>
                  </button>
                  <button
                    type="button"
                    className="w-9 h-9 bg-white rounded flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all"
                    onClick={() => handleEditorCommand('insertImage')}
                    title="Insert Image"
                  >
                    <i className="fas fa-image"></i>
                  </button>

                  <div className="w-px h-9 bg-gray-300 mx-1"></div>

                  {/* Special content buttons */}
                  <button
                    type="button"
                    className="w-9 h-9 bg-white rounded flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all"
                    onClick={() => handleEditorCommand('insertCode')}
                    title="Insert Code"
                  >
                    <i className="fas fa-code"></i>
                  </button>
                  <button
                    type="button"
                    className="w-9 h-9 bg-white rounded flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all"
                    onClick={() => handleEditorCommand('insertLatex')}
                    title="Insert LaTeX"
                  >
                    <i className="fas fa-square-root-alt"></i>
                  </button>

                  <div className="w-px h-9 bg-gray-300 mx-1"></div>

                  {/* Undo/Redo buttons */}
                  <button
                    type="button"
                    className="w-9 h-9 bg-white rounded flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all"
                    onClick={() => handleEditorCommand('undo')}
                    title="Undo"
                  >
                    <i className="fas fa-undo"></i>
                  </button>
                  <button
                    type="button"
                    className="w-9 h-9 bg-white rounded flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all"
                    onClick={() => handleEditorCommand('redo')}
                    title="Redo"
                  >
                    <i className="fas fa-redo"></i>
                  </button>
                </div>

                {/* Editor Content */}
                <div
                  ref={editorRef}
                  className="min-h-[300px] border border-gray-300 rounded p-4 focus:border-teal-500 focus:outline-none"
                  contentEditable
                  placeholder="Write your blog content here..."
                  onInput={(e) => setEditorContent(e.target.innerHTML)}
                  dangerouslySetInnerHTML={{ __html: editorContent }}
                ></div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button
                  type="submit"
                  className="bg-teal-500 text-white px-6 py-3 rounded font-semibold hover:bg-teal-600 transition-all"
                >
                  Publish Blog
                </button>
                <button
                  type="button"
                  className="bg-yellow-500 text-white px-6 py-3 rounded font-semibold hover:bg-yellow-600 transition-all"
                  onClick={handleSaveDraft}
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  className="bg-red-500 text-white px-6 py-3 rounded font-semibold hover:bg-red-600 transition-all"
                  onClick={handleDiscardChanges}
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-full lg:w-[450px] bg-gray-50 p-6 border-t lg:border-t-0 lg:border-l border-gray-200 order-2 lg:order-2 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto">
          <div className="mb-8 pb-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold">Blog Details</h3>
          </div>

          {/* Collaborators Section */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-users mr-2"></i>
              Collaborators
            </h4>
            <div className="space-y-3">
              {collaborators.map((collaborator, index) => (
                <a
                  key={index}
                  href="OtherDashboard.html"
                  className="flex items-center p-3 bg-white rounded shadow-sm hover:bg-teal-50 transition-all"
                >
                  <img
                    src={collaborator.avatar}
                    alt="Collaborator"
                    className="w-10 h-10 rounded-full border-2 border-gray-200 mr-3"
                  />
                  <div>
                    <div className="font-medium">{collaborator.name}</div>
                    <div className="text-sm text-gray-500">{collaborator.role}</div>
                  </div>
                </a>
              ))}
            </div>
            <div className="flex mt-4">
              <input
                type="email"
                placeholder="Add collaborator by email"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:border-teal-500 focus:outline-none"
              />
              <button
                type="button"
                className="bg-teal-500 text-white px-4 rounded-r hover:bg-teal-600 transition-all"
                onClick={() => alert('Invitation sent')}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>

          {/* Version Control Section */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-history mr-2"></i>
              Version History
            </h4>
            <div className="max-h-72 overflow-y-auto bg-white rounded shadow-sm p-2">
              {versions.map((version, index) => (
                <div
                  key={index}
                  className={`p-3 rounded mb-2 cursor-pointer transition-all ${version.active ? 'border-l-4 border-teal-500 bg-teal-50' : 'hover:bg-gray-100'}`}
                  onClick={() => handleVersionSelect(index)}
                >
                  <div className="font-medium">{version.name}</div>
                  <div className="text-sm text-gray-500">{version.date}</div>
                  <div className="flex items-center text-sm text-teal-500 mt-1">
                    <img
                      src={version.avatar}
                      className="w-5 h-5 rounded-full mr-1"
                      alt="Author"
                    />
                    {version.author}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="w-full bg-teal-500 text-white py-2 rounded mt-4 flex items-center justify-center hover:bg-teal-600 transition-all"
              onClick={() => alert('Compare versions')}
            >
              <i className="fas fa-code-branch mr-2"></i>
              Compare Versions
            </button>
          </div>

          {/* Blog Status Section */}
          <div className="bg-white rounded shadow-sm p-5">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-info-circle mr-2"></i>
              Blog Status
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-medium text-yellow-500">Draft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Saved:</span>
                <span className="font-medium">Just now</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created:</span>
                <span className="font-medium">3 days ago</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
      <Footer/>
    </div>
  );
};

export default NewBlog;