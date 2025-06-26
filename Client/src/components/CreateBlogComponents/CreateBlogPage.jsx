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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Create New Blog</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Blog Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Blog Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your blog title"
              required
            />
          </div>
          
          {/* Thumbnail Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail Image
            </label>
            <div 
              className={`border-2 border-dashed ${thumbnail ? 'border-transparent' : 'border-gray-300'} rounded-md p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors`}
              onClick={() => document.getElementById('thumbnail-upload').click()}
            >
              {thumbnail ? (
                <img src={thumbnail} alt="Thumbnail preview" className="max-h-60 mx-auto rounded-md" />
              ) : (
                <>
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">Recommended size: 1000×585px</p>
                </>
              )}
              <input
                id="thumbnail-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>
          
          {/* Category Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {['Software', 'Math', 'Electronics', 'AI', 'Cybersecurity', 'Web Development'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${category === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          {/* Blog Content Editor */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blog Content
            </label>
            
            <EditorToolbar 
              editorRef={editorRef} 
              onLatexClick={() => setShowLatexModal(true)} 
            />
            
            <div
              ref={editorRef}
              contentEditable
              dangerouslySetInnerHTML={{ __html: content }}
              onInput={(e) => setContent(e.target.innerHTML)}
              className="min-h-[300px] p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Blog'}
            </button>
          </div>
        </form>
        
        {/* Collaborators Section */}
        <CollaboratorList 
          collaborators={collaborators}
          setCollaborators={setCollaborators}
          newCollaborator={newCollaborator}
          setNewCollaborator={setNewCollaborator}
        />
        
        {/* Version History */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Version History</h3>
          <p className="text-gray-500">Version history will be implemented in the next phase.</p>
        </div>
      </div>
      
      {/* LaTeX Modal */}
      <LatexModal 
        isOpen={showLatexModal} 
        onClose={() => setShowLatexModal(false)} 
        editorRef={editorRef}
      />
    </div>
  );
};

export default CreateBlogPage;