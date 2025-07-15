import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiUpload, FiX, FiPlus, FiCheck, FiUsers, FiClock, FiInfo, FiSave, FiTrash2, FiSearch } from 'react-icons/fi';
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
  const location = useLocation();

  // State management
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [content, setContent] = useState('');
  const [blog, setBlog] = useState(null);
  const [blogId, setBlogId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [status, setStatus] = useState('draft');
  const [lastSaved, setLastSaved] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Available categories
  const availableCategories = [
    'Technology', 'Science', 'Programming', 'AI', 'Web Development', 'Mobile'
  ];

  // Refs
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const searchRef = useRef(null);

  // Initialize from location state if editing
  useEffect(() => {
    if (location.state?.draftData) {
      const { draftData } = location.state;
      setTitle(draftData.title);
      setContent(draftData.content);
      setCategories(draftData.categories || []);
      setTags(draftData.tags || []);
      setThumbnail(draftData.thumbnail_url);
      setBlogId(draftData.id);
      setBlog(draftData);
      setIsEditing(true);
      setStatus(draftData.is_published ? 'published' : 'draft');
    }
  }, [location.state]);

  



  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Search for users to collaborate with
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await api.get(`search/?q=${query.trim()}`);
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    }
  };

  // Send author request
  const sendAuthorRequest = async (username) => {
    if (!blogId) {
      // If no blogId exists, save as draft first
      try {
        const newBlogId = await createDraft();
        setBlogId(newBlogId);

        // Now send the request with the new blogId
        await sendCollaborationRequest(newBlogId, username);
      } catch (error) {
        console.error('Error creating draft before sending request:', error);
        toast.error('Failed to create draft before sending request');
      }
    } else {
      // If we already have a blogId, just send the request
      await sendCollaborationRequest(blogId, username);
    }
  };

  // Helper function to actually send the request
  const sendCollaborationRequest = async (blogId, username) => {
    try {
      const response = await api.post('/collaboration-request/request-author/', {
        username: user.username,
        requested_username: username,
        blog_id: blogId
      });

      toast.success('Collaboration request sent successfully');
      setSearchQuery('');
      setSearchResults([]);
      setShowSearchResults(false);
    } catch (error) {
      console.error('Error sending author request:', error);
      toast.error(error.response?.data?.error || 'Failed to send request');
    }
  };

  // Remove collaborator
  const removeCollaborator = async (username) => {
    if (!blogId) {
      toast.error('No blog selected');
      return;
    }

    try {
      const response = await api.delete(`/blogs/remove-author/${blogId}/`, {
        data: {
          username: user.username,
          author_to_remove: username
        }
      });

      // Update local state
      if (response.data.success) {
        setBlog(prev => ({
          ...prev,
          authors: prev.authors.filter(a => a.username !== username)
        }));
        toast.success('Collaborator removed successfully');
      }
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast.error(error.response?.data?.error || 'Failed to remove collaborator');
    }
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
    if (editorRef.current && editorRef.current.textContent.trim() === '') {
      editorRef.current.innerHTML = `<p class="text-gray-400">Start writing your blog post here...</p>`;
    }
  };



const handleInput = () => {
  if (editorRef.current) {
    const html = editorRef.current.innerHTML.trim();
    setContent(html);
  }
};


  // Create a new draft
  const createDraft = async () => {
    try {
      setIsSubmitting(true);

      const response = await api.post('/blogs/create-draft/', {
        username: user.username,
        title: title || "Untitled Draft",
        content: content || ""
      });

      setBlogId(response.data.id);
      setStatus('draft');
      setLastSaved(new Date());
      toast.success('Draft created successfully');
      return response.data.id;
    } catch (error) {
      console.error('Error creating draft:', error);
      toast.error(error.response?.data?.error || 'Failed to create draft');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save as draft
  const saveAsDraft = async () => {
    try {
      setIsSubmitting(true);

      // If we don't have a blogId yet, create a new draft first
      let currentBlogId = blogId;
      if (!currentBlogId) {
        currentBlogId = await createDraft();
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('username', user.username);

      // Append categories and tags
      categories.forEach(cat => formData.append('categories[]', cat));
      tags.forEach(tag => formData.append('tags[]', tag));

      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      const response = await api.put(`/blogs/update-draft/${currentBlogId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!blogId) {
        setBlogId(currentBlogId);
      }
      setStatus('draft');
      setLastSaved(new Date());
      toast.success('Draft saved successfully');
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

    if (categories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    try {
      setIsSubmitting(true);

      // If we don't have a blogId yet, create a new draft first
      let currentBlogId = blogId;
      if (!currentBlogId) {
        currentBlogId = await createDraft();
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('username', user.username);
      formData.append('is_published', true);

      categories.forEach(cat => formData.append('categories[]', cat));
      tags.forEach(tag => formData.append('tags[]', tag));

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
      navigate(`/blogs/${currentBlogId}`);
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

        if (!blogId) {
          // If we haven't saved the draft yet, just navigate away
          navigate('/blogs/drafts');
          return;
        }

        await api.post(`/blogs/delete/${blogId}/`, {
          username: user.username
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
      <Navbar />

      <div className="flex flex-1 pt-16">
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className={`max-w-5xl mx-auto rounded-xl shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Page Header */}
            <div className={`px-8 py-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {isEditing ? 'Edit Blog' : 'Create New Blog'}
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${darkMode
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
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${thumbnail
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
                      className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center transition-colors duration-200 ${categories.includes(cat)
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
                      className={`px-3 py-1 rounded-full text-sm flex items-center ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'
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
                    className={`flex-1 px-3 py-2 border text-sm rounded-l-lg focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] ${darkMode
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
                <label className="block text-sm font-bold text-gray-700 mb-2">Blog Content</label>

                <BlogEditorToolbar editorRef={editorRef} />
<div
  ref={editorRef}
  contentEditable
  onFocus={handleFocus}
  onBlur={handleBlur}
  onInput={handleInput}
  data-placeholder="Start writing your blog post here..."
  className={`
    relative min-h-[300px] border border-gray-300 rounded-lg p-4 prose max-w-none focus:outline-none focus:ring-2 focus:ring-teal-500
    ${darkMode ? 'text-gray-200' : 'text-gray-800'}
    before:content-[attr(data-placeholder)]
    before:absolute before:text-gray-400 before:pointer-events-none before:select-none before:italic
    before:whitespace-pre-wrap before:top-4 before:left-4
    ${content ? 'before:hidden' : ''}
  `}
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
                    className={`px-6 py-2 border rounded-lg transition-colors w-full sm:w-auto flex items-center justify-center gap-2 ${darkMode
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
                    onClick={isEditing ? saveAsDraft : saveAsDraft}
                  >
                    <FiSave />
                    {isEditing ? 'Update Draft' : 'Save Draft'}
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
        <aside className={`hidden lg:block w-80 border-l p-6 overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
          {/* Collaborators Section */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'
              }`}>
              <FiUsers className="text-[var(--primary-color)]" />
              Collaborators
            </h3>

            {/* Current user and collaborators */}
            {user && (
              <div className="space-y-3">
                {/* Current user as primary author */}
                <div className={`flex items-center p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
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
                      Primary Author
                    </p>
                  </div>
                </div>

                {/* Collaborators */}
                {blog?.authors?.filter(author => author.username !== user.username).map((author) => (
                  <div
                    key={author.username}
                    className={`flex justify-between items-center p-3 rounded-lg ${darkMode ? 'bg-gray-700 hover:shadow-md' : 'bg-white hover:shadow-sm'
                      }`}
                  >
                    <div className="flex items-center">
                      <img
                        src={author.avatar_url || `https://ui-avatars.com/api/?name=${author.username}&background=random`}
                        alt={author.username}
                        className="h-10 w-10 rounded-full object-cover mr-3"
                      />
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {author.username}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Collaborator
                        </p>
                      </div>
                    </div>
                    {user.username === blog.authors[0].username && ( // Only primary author can remove
                      <button
                        className={`transition-colors ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                          }`}
                        onClick={() => removeCollaborator(author.username)}
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Search for collaborators */}
            <div className="mt-4 relative" ref={searchRef}>
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className={`flex-1 px-3 py-2 border text-sm rounded-l-lg focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] ${darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300'
                    }`}
                  placeholder="Search users to collaborate"
                />
                <button
                  className="px-3 py-2 text-white rounded-r-lg hover:opacity-90 transition-colors"
                  style={{ backgroundColor: primaryColor }}
                >
                  <FiSearch />
                </button>
              </div>

              {/* Search results dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className={`absolute z-10 mt-1 w-full rounded-lg shadow-lg py-1 ${darkMode ? 'bg-gray-700' : 'bg-white'
                  }`}>
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className={`px-4 py-2 text-sm cursor-pointer flex items-center justify-between ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                        }`}
                    >
                      <div className="flex items-center">
                        <img
                          src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                          alt={user.username}
                          className="h-8 w-8 rounded-full object-cover mr-3"
                        />
                        <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>
                          {user.username}
                        </span>
                      </div>
                      <button
                        className={`p-1 rounded-full ${darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-200'
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          sendAuthorRequest(user.username);
                        }}
                      >
                        <FiPlus />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4">
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Search for users and send them collaboration requests. They'll need to accept your request to become co-authors.
              </p>
            </div>
          </div>

          {/* Blog Status */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'
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

      <Footer />
    </div>
  );
};

export default CreateBlogPage;