import React, { useState, useRef } from 'react';
import EditorToolbar from './EditorToolbar';
import LatexModal from './LatexModal';
import CollaboratorList from './CollaboratorList';

const CreateBlogPage = () => {
  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [content, setContent] = useState('<p>Start writing your blog post here...</p>');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Editor and modal states
  const editorRef = useRef(null);
  const [showLatexModal, setShowLatexModal] = useState(false);
  
  // Collaborators
  const [collaborators, setCollaborators] = useState([
    { id: 1, name: 'Ramisa Anan', email: 'ramisa@example.com' },
    { id: 2, name: 'Ridika Naznin', email: 'ridika@example.com' }
  ]);
  const [newCollaborator, setNewCollaborator] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = {
        title,
        category,
        thumbnail,
        content,
        collaborators
      };
      
      console.log('Submitting:', formData);
      // await axios.post('/api/blogs', formData);
      
      alert('Blog saved successfully!');
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Error saving blog. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6"> {/* Added padding-top for navbar */}
  <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
    <h1 className="text-3xl font-bold text-gray-800 mb-8">Create New Blog</h1>
    
    {/* Title Section */}
    <div className="mb-8">
      <label className="block text-sm font-semibold text-gray-700 mb-2">Blog Title</label>
      <input
        type="text"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        placeholder="Enter your blog title"
      />
    </div>

    {/* Thumbnail Upload */}
    <div className="mb-8">
      <label className="block text-sm font-semibold text-gray-700 mb-2">Thumbnail Image</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
        <p className="text-xs text-gray-500 mt-1">Recommended size: 1000×500px</p>
      </div>
    </div>

    {/* Category Selection - Grid Layout */}
    <div className="mb-8">
      <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
      <div className="grid grid-cols-3 gap-3">
        {['Software', 'Math', 'Electronics', 'AI', 'Cybersecurity', 'Web Development'].map((cat) => (
          <button
            key={cat}
            className={`px-4 py-3 rounded-lg border text-sm font-medium ${
              category === cat 
                ? 'bg-teal-500 text-white border-teal-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>

    {/* Editor Section */}
    <div className="mb-8">
      <label className="block text-sm font-semibold text-gray-700 mb-3">Blog Content</label>
      <EditorToolbar />
      <div
        className="min-h-[300px] border border-gray-300 rounded-lg p-4"
        contentEditable
      >
        Start writing your blog post here...
      </div>
    </div>

    {/* Two-Column Layout for Bottom Sections */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column - Collaborators */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Collaborators</h3>
        <div className="space-y-3">
          {collaborators.map((person) => (
            <div key={person.email} className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-medium mr-3">
                  {person.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{person.name}</p>
                  <p className="text-xs text-gray-500">{person.email}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-red-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex">
          <input
            type="email"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-teal-500 focus:border-teal-500"
            placeholder="Add collaborator by email"
          />
          <button className="px-4 py-2 bg-teal-500 text-white rounded-r-lg hover:bg-teal-600">
            Add
          </button>
        </div>
      </div>

      {/* Right Column - Version History */}
      <div className="bg-gray-50 p-6 rounded-lg">
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
        <div className="mt-6">
          <button className="text-sm text-teal-500 hover:underline">Compare Versions</button>
        </div>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="mt-8 flex justify-between">
      <div className="text-sm text-gray-500">
        <p><span className="font-medium">Status:</span> Draft</p>
        <p><span className="font-medium">Last Saved:</span> Just now</p>
      </div>
      <div className="space-x-3">
        <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
          Discard
        </button>
        <button className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
          Publish Blog
        </button>
      </div>
    </div>
  </div>
</div>
  );
};

export default CreateBlogPage;