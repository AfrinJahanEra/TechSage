import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiPlus, FiCheck } from 'react-icons/fi';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import BlogEditorToolbar from './BlogEditorToolbar';

const CreateBlogPage = () => {
  // State management
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState([]); // Now stores multiple categories
  const [thumbnail, setThumbnail] = useState(null);
  const [content, setContent] = useState('<p>Start writing your blog post here...</p>');
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'Ramisa Anan', email: 'ramisa@example.com', role: 'Editor' },
    { id: 2, name: 'Ridika Naznin', email: 'ridika@example.com', role: 'Professor' }
  ]);
  const [newCollaborator, setNewCollaborator] = useState('');

  // Available categories
  const availableCategories = [
    'Software', 'Math', 'Electronics', 'AI', 'Cybersecurity', 'Web Development'
  ];

  // Toggle category selection
  const toggleCategory = (category) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category) // Remove if already selected
        : [...prev, category] // Add if not selected
    );
  };

  // Refs
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);



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
      role: 'Contributor'
    }]);
    setNewCollaborator('');
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      title,
      category,
      content,
      thumbnail,
      collaborators
    });
    alert('Blog published successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Page Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Create New Blog</h1>
          </div>

          <div className="md:flex">
            {/* Main Content */}
            <div className="md:w-2/3 p-8">
              <form onSubmit={handleSubmit}>
                {/* Blog Title */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blog Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter your blog title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Thumbnail Upload */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail Image</label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-teal-500 transition-colors"
                    onClick={() => fileInputRef.current.click()}
                  >
                    {thumbnail ? (
                      <div className="relative">
                        <img src={thumbnail} alt="Preview" className="max-h-60 mx-auto rounded-md" />
                        <button
                          type="button"
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
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
                        <p className="text-xs text-gray-500 mt-1">Recommended size: 1000×585px</p>
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <div className="grid grid-cols-3 gap-3">
                    {availableCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`px-4 py-3 rounded-lg border text-sm font-medium flex items-center justify-center ${categories.includes(cat)
                          ? 'bg-teal-500 text-white border-teal-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        onClick={() => toggleCategory(cat)}
                      >
                        {cat}
                        {categories.includes(cat) && (
                          <FiCheck className="ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Blog Content Editor */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blog Content</label>

                  {/* Replace the old toolbar with the new component */}
                  <BlogEditorToolbar editorRef={editorRef} />

                  {/* Editor Content */}
                  <div
                    ref={editorRef}
                    className="min-h-[300px] border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    contentEditable
                    dangerouslySetInnerHTML={{ __html: content }}
                    onInput={(e) => setContent(e.target.innerHTML)}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-8">
                  <div className="text-sm text-gray-500">
                    <p><span className="font-medium">Status:</span> Draft</p>
                    <p><span className="font-medium">Last Saved:</span> Just now</p>
                  </div>
                  <div className="space-x-3">
                    <button
                      type="button"
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        if (confirm('Discard all changes?')) {
                          setTitle('');
                          setCategory('');
                          setThumbnail(null);
                          setContent('<p>Start writing your blog post here...</p>');
                        }
                      }}
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                    >
                      Publish Blog
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className="md:w-1/3 border-l border-gray-200 p-8 bg-gray-50">
              {/* Collaborators Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Collaborators</h3>
                <div className="space-y-3">
                  {collaborators.map((person) => (
                    <div key={person.id} className="flex justify-between items-center bg-white p-3 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-medium mr-3">
                          {person.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{person.name}</p>
                          <p className="text-xs text-gray-500">{person.role}</p>
                        </div>
                      </div>
                      <button
                        className="text-gray-400 hover:text-red-500"
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Add collaborator by email"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-teal-500 text-white rounded-r-lg hover:bg-teal-600"
                  >
                    <FiPlus />
                  </button>
                </form>
              </div>

              {/* Version History */}
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Version History</h3>
                <div className="space-y-3">
                  <div className="border-b border-gray-200 pb-3">
                    <p className="font-medium">Current Version</p>
                    <p className="text-sm text-gray-500">Just now • You</p>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <p className="font-medium">Updated content</p>
                    <p className="text-sm text-gray-500">2 hours ago • Ridika Nazrin</p>
                  </div>
                  <div>
                    <p className="font-medium">Initial draft</p>
                    <p className="text-sm text-gray-500">3 days ago • You</p>
                  </div>
                </div>
                <button className="mt-4 text-sm text-teal-500 hover:underline w-full text-center">
                  Compare Versions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateBlogPage;