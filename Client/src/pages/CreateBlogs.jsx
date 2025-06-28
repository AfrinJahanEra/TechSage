import { useState, useRef, useEffect } from 'react';
import { FiUpload, FiX, FiPlus, FiCheck, FiUsers, FiClock, FiInfo } from 'react-icons/fi';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import BlogEditorToolbar from './BlogEditorToolbar';

const CreateBlogPage = () => {
  // State management
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [content, setContent] = useState('<p>Start writing your blog post here...</p>');
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'Ramisa Anan', email: 'ramisa@example.com', role: 'Editor', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 2, name: 'Ridika Naznin', email: 'ridika@example.com', role: 'Professor', avatar: 'https://randomuser.me/api/portraits/women/65.jpg' }
  ]);
  const [newCollaborator, setNewCollaborator] = useState('');
  const [lastSaved, setLastSaved] = useState('Just now');
  const [versions, setVersions] = useState([
    { id: 1, name: 'Current Version', date: 'Just now', author: 'You', active: true },
    { id: 2, name: 'Updated content', date: '2 hours ago', author: 'Ridika Naznin', active: false },
    { id: 3, name: 'Initial draft', date: 'Yesterday', author: 'You', active: false }
  ]);

  // Available categories
  const availableCategories = [
    'Software', 'Math', 'Electronics', 'AI', 'Cybersecurity', 'Web Development'
  ];

  // Refs
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Toggle category selection
  const toggleCategory = (category) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnail(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle collaborator addition
  const addCollaborator = (e) => {
    e.preventDefault();
    if (!newCollaborator.includes('@')) {
      alert('Please enter a valid email');
      return;
    }
    setCollaborators([...collaborators, {
      id: Date.now(),
      name: newCollaborator.split('@')[0],
      email: newCollaborator,
      role: 'Contributor',
      avatar: `https://ui-avatars.com/api/?name=${newCollaborator.split('@')[0]}&background=random`
    }]);
    setNewCollaborator('');
  };

  // Handle version selection
  const selectVersion = (id) => {
    setVersions(versions.map(version => ({
      ...version,
      active: version.id === id
    })));
    // In a real app, you would load the selected version content here
  };

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (title || content !== '<p>Start writing your blog post here...</p>') {
        setLastSaved(new Date().toLocaleTimeString());
        console.log('Auto-saved draft');
      }
    }, 30000);

    return () => clearInterval(autoSave);
  }, [title, content]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a blog title');
      return;
    }

    if (!categories.length) {
      alert('Please select at least one category');
      return;
    }

    if (!thumbnail) {
      alert('Please upload a thumbnail image');
      return;
    }

    if (content === '<p>Start writing your blog post here...</p>' || !content.trim()) {
      alert('Please write some content for your blog');
      return;
    }

    // In a real app, you would send this data to your backend
    console.log('Blog data:', {
      title,
      categories,
      content,
      thumbnail,
      collaborators
    });

    alert('Blog published successfully!');
  };

  useEffect(() => {
    // Show placeholder on mount
    if (editorRef.current) {
      editorRef.current.innerHTML = `<p class="text-gray-400">Start writing your blog post here...</p>`;
      editorRef.current.classList.add('text-gray-400');
      editorRef.current.classList.remove('text-gray-800');
    }
  }, []);

  const handleFocus = () => {
    const isPlaceholder = editorRef.current.textContent.trim() === 'Start writing your blog post here...';
    if (isPlaceholder) {
      editorRef.current.innerHTML = '';
      editorRef.current.classList.remove('text-gray-400');
      editorRef.current.classList.add('text-gray-800');
    }
  };

  const handleBlur = () => {
    if (editorRef.current.textContent.trim() === '') {
      editorRef.current.innerHTML = `<p class="text-gray-400">Start writing your blog post here...</p>`;
      editorRef.current.classList.add('text-gray-400');
      editorRef.current.classList.remove('text-gray-800');
    }
  };

  const handleInput = () => {
    const text = editorRef.current.textContent.trim();
    setContent(editorRef.current.innerHTML);

    // Ensure gray class is removed if real input begins
    if (text !== '' && text !== 'Start writing your blog post here...') {
      editorRef.current.classList.remove('text-gray-400');
      editorRef.current.classList.add('text-gray-800');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 pt-16">
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Page Header */}
            <div className="px-8 py-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-800">Create New Blog</h1>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              {/* Blog Title */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Blog Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  placeholder="Enter your blog title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Thumbnail Upload */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Thumbnail Image</label>
                <div
                  className={`border-2 border-dashed ${thumbnail ? 'border-gray-200' : 'border-gray-300'} rounded-lg p-8 text-center cursor-pointer hover:border-teal-500 transition-colors relative`}
                  onClick={() => fileInputRef.current.click()}
                >
                  {thumbnail ? (
                    <div className="relative">
                      <img
                        src={thumbnail}
                        alt="Preview"
                        className="max-h-60 mx-auto rounded-md object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setThumbnail(null);
                        }}
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">Recommended size: 1200×630px</p>
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    required
                  />
                </div>
              </div>

              {/* Category Selection */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center transition-colors duration-200 ${categories.includes(cat)
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-teal-500 hover:text-white hover:border-teal-500'
                        }`}
                      onClick={() => toggleCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>



              {/* Blog Content Editor */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Blog Content</label>

                <BlogEditorToolbar editorRef={editorRef} />

                <div
                  ref={editorRef}
                  contentEditable
                  dir="ltr"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onInput={handleInput}
                  className="min-h-[300px] border border-gray-300 rounded-lg p-4 prose max-w-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                />

              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
                <div className="text-sm text-gray-500 flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <FiInfo className="text-teal-500" />
                    <span>Status: <span className="font-medium text-amber-500">Draft</span></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiClock className="text-teal-500" />
                    <span>Last Saved: <span className="font-medium">{lastSaved}</span></span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
                    onClick={() => {
                      if (confirm('Are you sure you want to discard all changes?')) {
                        setTitle('');
                        setCategories([]);
                        setThumbnail(null);
                        setContent('<p>Start writing your blog post here...</p>');
                      }
                    }}
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors w-full sm:w-auto"
                    onClick={() => {
                      if (title || content !== '<p>Start writing your blog post here...</p>') {
                        setLastSaved(new Date().toLocaleTimeString());
                        alert('Draft saved successfully!');
                      }
                    }}
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors w-full sm:w-auto"
                  >
                    Publish Blog
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="hidden lg:block w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
          {/* Collaborators Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiUsers className="text-teal-500" />
              Collaborators
            </h3>
            <div className="space-y-3">
              {collaborators.map((person) => (
                <div key={person.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-xs hover:shadow-sm transition-shadow">
                  <div className="flex items-center">
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="h-10 w-10 rounded-full object-cover mr-3"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{person.name}</p>
                      <p className="text-xs text-gray-500">{person.role}</p>
                    </div>
                  </div>
                  <button
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    onClick={() => setCollaborators(collaborators.filter(c => c.id !== person.id))}
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={addCollaborator} className="mt-4 flex">
              <input
                type="email"
                value={newCollaborator}
                onChange={(e) => setNewCollaborator(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="Add collaborator by email"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-teal-500 text-white rounded-r-lg hover:bg-teal-600 transition-colors"
              >
                <FiPlus />
              </button>
            </form>
          </div>

          {/* Version History */}
          <div className="bg-white p-6 rounded-lg shadow-xs">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiClock className="text-teal-500" />
              Version History
            </h3>
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${version.active
                    ? 'bg-teal-50 border-l-4 border-teal-500'
                    : 'hover:bg-gray-50'
                    }`}
                  onClick={() => selectVersion(version.id)}
                >
                  <p className="font-medium text-gray-800">{version.name}</p>
                  <p className="text-xs text-gray-500">{version.date} • {version.author}</p>
                </div>
              ))}
            </div>
            <button
              className="mt-4 text-sm text-teal-500 hover:text-teal-600 hover:underline w-full text-center transition-colors"
              onClick={() => {
                const activeVersions = versions.filter(v => v.active);
                if (activeVersions.length === 1) {
                  alert('Please select another version to compare by clicking on it');
                } else {
                  alert('Comparing selected versions');
                }
              }}
            >
              Compare Versions
            </button>
          </div>

          {/* Blog Status */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow-xs">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiInfo className="text-teal-500" />
              Blog Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-medium text-amber-500">Draft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Saved:</span>
                <span className="font-medium">{lastSaved}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created:</span>
                <span className="font-medium">3 days ago</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default CreateBlogPage;