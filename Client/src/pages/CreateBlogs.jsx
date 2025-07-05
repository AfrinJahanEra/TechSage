import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiPlus, FiCheck, FiUsers, FiClock, FiInfo, FiSave, FiTrash2 } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import BlogEditorToolbar from './BlogEditorToolbar';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const CreateBlogPage = () => {
  const { primaryColor, darkMode } = useTheme();
  const { user, api } = useAuth();
  const navigate = useNavigate();

  // State management
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [content, setContent] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [newCollaborator, setNewCollaborator] = useState('');
  const [status, setStatus] = useState('draft');
  const [lastSaved, setLastSaved] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available categories
  const availableCategories = [
    'Technology', 'Science', 'Programming', 'AI', 'Web Development', 'Mobile'
  ];

  // Refs
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !content) {
      editorRef.current.innerHTML = 
        `<p class="${darkMode ? 'text-gray-400' : 'text-gray-400'}">Start writing your blog post here...</p>`;
    }
  }, [darkMode, content]);

  // Toggle category selection
  const toggleCategory = (category) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Handle tag addition
  const addTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnail(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle collaborator addition
  const addCollaborator = async (e) => {
    e.preventDefault();
    if (!newCollaborator.trim()) return;

    try {
      const response = await api.get(`/user/search/?q=${newCollaborator.trim()}`);
      if (response.data.length === 0) {
        toast.error('User not found');
        return;
      }

      const userToAdd = response.data[0];
      if (!collaborators.some(c => c._id === userToAdd._id)) {
        setCollaborators([...collaborators, userToAdd]);
        setNewCollaborator('');
        toast.success('Collaborator added');
      } else {
        toast.error('User is already a collaborator');
      }
    } catch (error) {
      toast.error('Failed to add collaborator');
      console.error(error);
    }
  };

  // Remove collaborator
  const removeCollaborator = (userId) => {
    setCollaborators(collaborators.filter(c => c._id !== userId));
  };

  // Handle editor content changes
  const handleFocus = () => {
    const isPlaceholder = editorRef.current.textContent.trim() === 'Start writing your blog post here...';
    if (isPlaceholder) {
      editorRef.current.innerHTML = '';
      editorRef.current.classList.remove('text-gray-400');
      editorRef.current.classList.add(darkMode ? 'text-gray-200' : 'text-gray-800');
    }
  };

  const handleBlur = () => {
    if (editorRef.current.textContent.trim() === '') {
      editorRef.current.innerHTML = `<p class="${darkMode ? 'text-gray-400' : 'text-gray-400'}">Start writing your blog post here...</p>`;
      editorRef.current.classList.add(darkMode ? 'text-gray-400' : 'text-gray-400');
      editorRef.current.classList.remove(darkMode ? 'text-gray-200' : 'text-gray-800');
    }
  };

  const handleInput = () => {
    const text = editorRef.current.textContent.trim();
    setContent(editorRef.current.innerHTML);

    // Ensure gray class is removed if real input begins
    if (text !== '' && text !== 'Start writing your blog post here...') {
      editorRef.current.classList.remove('text-gray-400');
      editorRef.current.classList.add(darkMode ? 'text-gray-200' : 'text-gray-800');
    }
  };

  // Save as draft
  const saveAsDraft = async () => {
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('is_draft', true);
      formData.append('is_published', false);
      formData.append('username', user.username);
      
      categories.forEach(cat => formData.append('categories[]', cat));
      tags.forEach(tag => formData.append('tags[]', tag));
      collaborators.forEach(collab => formData.append('authors[]', collab._id));
      
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      const response = await api.post('/blogs/create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setStatus('draft');
      setLastSaved(new Date());
      toast.success('Draft saved successfully');
      navigate(`/blogs/edit/${response.data.id}`);
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error(error.response?.data?.error || 'Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Publish blog
  const publishBlog = async () => {
    if (!title.trim()) {
      toast.error('Please enter a blog title');
      return;
    }

    if (!content.trim() || content === '<p>Start writing your blog post here...</p>') {
      toast.error('Please add some content to your blog');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('is_draft', false);
      formData.append('is_published', true);
      formData.append('username', user.username);
      
      categories.forEach(cat => formData.append('categories[]', cat));
      tags.forEach(tag => formData.append('tags[]', tag));
      collaborators.forEach(collab => formData.append('authors[]', collab._id));
      
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      const response = await api.post('/blogs/create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setStatus('published');
      toast.success('Blog published successfully');
      navigate(`/blogs/${response.data.id}`);
    } catch (error) {
      console.error('Error publishing blog:', error);
      toast.error(error.response?.data?.error || 'Failed to publish blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Discard blog (move to trash)
  const discardBlog = async () => {
    if (window.confirm('Are you sure you want to discard this blog? It will be moved to trash.')) {
      try {
        setIsSubmitting(true);
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('is_deleted', true);
        formData.append('username', user.username);
        
        categories.forEach(cat => formData.append('categories[]', cat));
        tags.forEach(tag => formData.append('tags[]', tag));
        
        if (thumbnailFile) {
          formData.append('thumbnail', thumbnailFile);
        }

        await api.post('/blogs/create/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        toast.success('Blog moved to trash');
        navigate('/blogs/drafts');
      } catch (error) {
        console.error('Error discarding blog:', error);
        toast.error(error.response?.data?.error || 'Failed to discard blog');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return 'Not saved yet';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(lastSaved)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Auto-save functionality for drafts
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((title || content) && status === 'draft') {
        saveAsDraft();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(timer);
  }, [title, content, categories, tags, thumbnail]);

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      <Navbar/>
      
      <div className="flex flex-1 pt-16">
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className={`max-w-5xl mx-auto rounded-xl shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Page Header */}
            <div className={`px-8 py-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Create New Blog
              </h1>
            </div>

            <div className="p-8">
              {/* Blog Title */}
              <div className="mb-8">
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Blog Title *
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-[var(--primary-color)]'
                      : 'border-gray-300 focus:ring-[var(--primary-color)]'
                  }`}
                  placeholder="Enter your blog title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Thumbnail Upload */}
              <div className="mb-8">
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Thumbnail Image
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    thumbnail
                      ? darkMode ? 'border-gray-700' : 'border-gray-200'
                      : darkMode ? 'border-gray-700 hover:border-[var(--primary-color)]' : 'border-gray-300 hover:border-[var(--primary-color)]'
                  }`}
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
                          setThumbnailFile(null);
                        }}
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FiUpload className={`mx-auto h-12 w-12 mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Click to upload or drag and drop
                      </p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Recommended size: 1200×630px
                      </p>
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
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Categories *
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center transition-colors duration-200 ${
                        categories.includes(cat)
                          ? 'text-white border-[var(--primary-color)]'
                          : darkMode
                            ? 'bg-gray-700 text-gray-200 border-gray-600 hover:text-white hover:border-[var(--primary-color)]'
                            : 'bg-white text-gray-700 border-gray-300 hover:text-white hover:border-[var(--primary-color)]'
                      }`}
                      style={{
                        backgroundColor: categories.includes(cat) ? primaryColor : ''
                      }}
                      onClick={() => toggleCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Input */}
              <div className="mb-8">
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className={`px-3 py-1 rounded-full text-sm flex items-center ${
                        darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-1.5 hover:text-red-500 transition-colors"
                        onClick={() => removeTag(tag)}
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <form onSubmit={addTag} className="flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className={`flex-1 px-3 py-2 border text-sm rounded-l-lg focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300'
                    }`}
                    placeholder="Add tags (press Enter)"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 text-white rounded-r-lg hover:opacity-90 transition-colors"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <FiPlus />
                  </button>
                </form>
              </div>

              {/* Blog Content Editor */}
                            <div className="mb-8">
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Blog Content</label>

                <BlogEditorToolbar editorRef={editorRef} />

                <div
                  ref={editorRef}
                  contentEditable
                  dir="ltr"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onInput={handleInput}
                  className={`min-h-[300px] border rounded-lg p-4 prose max-w-none focus:outline-none focus:ring-2 ${darkMode
                      ? 'bg-gray-700 border-gray-600 focus:ring-[var(--primary-color)]'
                      : 'border-gray-300 focus:ring-[var(--primary-color)]'
                    }`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
                <div className={`text-sm flex items-center gap-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="flex items-center gap-1">
                    <FiInfo className="text-[var(--primary-color)]" />
                    <span>
                      Status: <span className="font-medium text-amber-500 capitalize">{status}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiClock className="text-[var(--primary-color)]" />
                    <span>
                      Last Saved: <span className="font-medium">{formatLastSaved()}</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    className={`px-6 py-2 border rounded-lg transition-colors w-full sm:w-auto flex items-center justify-center gap-2 ${
                      darkMode
                        ? 'border-gray-600 text-gray-200 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={discardBlog}
                  >
                    <FiTrash2 />
                    Discard
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
                    onClick={saveAsDraft}
                  >
                    <FiSave />
                    Save Draft
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting || !title || !content || !categories.length}
                    className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                    onClick={publishBlog}
                  >
                    <FiCheck />
                    Publish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className={`hidden lg:block w-80 border-l p-6 overflow-y-auto ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          {/* Collaborators Section */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <FiUsers className="text-[var(--primary-color)]" />
              Collaborators
            </h3>
            <div className="space-y-3">
              {/* Current user as default author */}
              {user && (
                <div className={`flex items-center p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-white'
                }`}>
                  <img
                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                    alt={user.username}
                    className="h-10 w-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {user.username} (You)
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Author
                    </p>
                  </div>
                </div>
              )}

              {/* Additional collaborators */}
              {collaborators.map((person) => (
                <div
                  key={person._id}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    darkMode ? 'bg-gray-700 hover:shadow-md' : 'bg-white hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center">
                    <img
                      src={person.avatar_url || `https://ui-avatars.com/api/?name=${person.username}&background=random`}
                      alt={person.username}
                      className="h-10 w-10 rounded-full object-cover mr-3"
                    />
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {person.username}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Collaborator
                      </p>
                    </div>
                  </div>
                  <button
                    className={`transition-colors ${
                      darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                    }`}
                    onClick={() => removeCollaborator(person._id)}
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={addCollaborator} className="mt-4 flex">
              <input
                type="text"
                value={newCollaborator}
                onChange={(e) => setNewCollaborator(e.target.value)}
                className={`flex-1 px-3 py-2 border text-sm rounded-l-lg focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300'
                }`}
                placeholder="Add collaborator by username"
              />
              <button
                type="submit"
                className="px-3 py-2 text-white rounded-r-lg hover:opacity-90 transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                <FiPlus />
              </button>
            </form>
          </div>

          {/* Blog Status */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <FiInfo className="text-[var(--primary-color)]" />
              Blog Status
            </h3>
            <div className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium text-amber-500 capitalize">{status}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Saved:</span>
                <span className="font-medium">{formatLastSaved()}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="font-medium">{lastSaved ? new Date(lastSaved).toLocaleString() : 'Not saved yet'}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <Footer/>
    </div>
  );
};

export default CreateBlogPage;