import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiUpload, FiX, FiPlus, FiCheck, FiUsers, FiClock, FiInfo, FiSave, FiTrash2, FiSearch } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Tiptap from '../components/CreateBlogComponents/Tiptap';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateBlogs = () => {
  const { primaryColor, darkMode } = useTheme();
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
  const [createdAt, setCreatedAt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [isHistoryHovered, setIsHistoryHovered] = useState(false);
  const [ws, setWs] = useState(null);

  const fileInputRef = useRef(null);
  const searchRef = useRef(null);

  const showToast = (message, type = 'success') => {
    const toastOptions = {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: darkMode ? 'dark' : 'light',
    };
    type === 'success' ? toast.success(message, toastOptions) : toast.error(message, toastOptions);
  };

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;

    const wsUrl = blogId
      ? `ws://localhost:8000/ws/blogs/update/${blogId}/`
      : `ws://localhost:8000/ws/blogs/create/`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket connected:', wsUrl);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          showToast(data.error, 'error');
          return;
        }
        if (data.title && data.title !== title) {
          setTitle(data.title);
        }
        if (data.content && data.content !== content) {
          setContent(data.content);
        }
        if (data.categories && JSON.stringify(data.categories) !== JSON.stringify(categories)) {
          setCategories(data.categories);
        }
        if (data.tags && JSON.stringify(data.tags) !== JSON.stringify(tags)) {
          setTags(data.tags);
        }
        if (data.thumbnail_url && data.thumbnail_url !== thumbnail) {
          setThumbnail(data.thumbnail_url);
          setThumbnailFile(null);
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
        showToast('Error processing real-time update', 'error');
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      showToast('Real-time collaboration failed to connect', 'error');
    };

    setWs(websocket);

    return () => {
      if (websocket) websocket.close();
    };
  }, [blogId, user]);

  // Send updates via WebSocket with debouncing
  useEffect(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const timeout = setTimeout(() => {
      ws.send(JSON.stringify({
        title,
        content,
        categories,
        tags,
        thumbnail_url: thumbnail,
      }));
    }, 300);

    return () => clearTimeout(timeout);
  }, [title, content, categories, tags, thumbnail, ws]);

  // Load draft data if editing
  useEffect(() => {
    if (location.state?.draftData) {
      const { draftData } = location.state;
      setTitle(draftData.title || '');
      setContent(draftData.content || '');
      setCategories(draftData.categories || []);
      setTags(draftData.tags || []);
      setThumbnail(draftData.thumbnail_url || null);
      setBlogId(draftData.id || null);
      setBlog(draftData);
      setIsEditing(true);
      setStatus(draftData.is_published ? 'published' : 'draft');
      setCreatedAt(draftData.created_at || null);
      setLastSaved(draftData.draft_saved_at || draftData.updated_at || draftData.created_at || null);
    }
  }, [location.state]);

  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = (category) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const addTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = async (event) => {
        setThumbnail(event.target.result);
        try {
          const formData = new FormData();
          formData.append('thumbnail', file);
          formData.append('username', user.username);
          let currentBlogId = blogId;
          if (!currentBlogId) {
            currentBlogId = await createDraft();
            setBlogId(currentBlogId);
          }
          const response = await api.post(`/blogs/draft/${currentBlogId}/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          setThumbnail(response.data.thumbnail_url);
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              title,
              content,
              categories,
              tags,
              thumbnail_url: response.data.thumbnail_url,
            }));
          }
        } catch (error) {
          console.error('Error uploading thumbnail:', error);
          showToast('Failed to upload thumbnail', 'error');
          setThumbnail(null);
          setThumbnailFile(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
      showToast('Failed to search users', 'error');
    }
  };

  const sendAuthorRequest = async (username) => {
    let currentBlogId = blogId;
    if (!currentBlogId) {
      try {
        currentBlogId = await createDraft();
        setBlogId(currentBlogId);
      } catch (error) {
        showToast('Failed to create draft for collaboration', 'error');
        return;
      }
    }
    try {
      await api.post('/collaboration-request/request-author/', {
        username: user.username,
        requested_username: username,
        blog_id: currentBlogId,
      });
      showToast('Collaboration request sent', 'success');
      setSearchQuery('');
      setSearchResults([]);
      setShowSearchResults(false);
    } catch (error) {
      console.error('Error sending author request:', error);
      showToast(error.response?.data?.error || 'Failed to send request', 'error');
    }
  };

  const removeCollaborator = async (username) => {
    if (!blogId) {
      showToast('No blog selected', 'error');
      return;
    }
    try {
      const response = await api.post(`/collaboration-request/remove-author/${blogId}/`, {
        username: user.username,
        author_to_remove: username,
      });
      if (response.data.success) {
        setBlog((prev) => ({
          ...prev,
          authors: prev.authors.filter((a) => a.username !== username),
        }));
        showToast('Collaborator removed', 'success');
      }
    } catch (error) {
      console.error('Error removing collaborator:', error);
      showToast(error.response?.data?.error || 'Failed to remove collaborator', 'error');
    }
  };

  const createDraft = async () => {
    try {
      setIsSubmitting(true);
      const response = await api.post('/blogs/create-draft/', {
        username: user.username,
        title: title || 'Untitled Draft',
        content: content || '',
      });
      setCreatedAt(response.data.created_at);
      setLastSaved(response.data.created_at);
      return response.data.id;
    } catch (error) {
      console.error('Error creating draft:', error);
      showToast(error.response?.data?.error || 'Failed to create draft', 'error');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveAsDraft = async () => {
    let currentBlogId = blogId;
    if (!currentBlogId) {
      try {
        currentBlogId = await createDraft();
        setBlogId(currentBlogId);
      } catch (error) {
        return;
      }
    }
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('username', user.username);
      categories.forEach((cat) => formData.append('categories[]', cat));
      tags.forEach((tag) => formData.append('tags[]', tag));
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      const response = await api.post(`/blogs/draft/${currentBlogId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus(response.data.status);
      setLastSaved(response.data.draft_saved_at);
      setCategories(response.data.categories || []);
      setTags(response.data.tags || []);
      setThumbnail(response.data.thumbnail_url || thumbnail);
      setBlog({
        ...blog,
        id: response.data.id,
        title: response.data.title,
        content,
        thumbnail_url: response.data.thumbnail_url,
        categories: response.data.categories,
        tags: response.data.tags,
        authors: response.data.authors || blog?.authors || [],
        status: response.data.status,
        version: response.data.version,
      });
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          title: response.data.title,
          content,
          categories: response.data.categories,
          tags: response.data.tags,
          thumbnail_url: response.data.thumbnail_url,
        }));
      }
      showToast(`Draft saved (Version ${response.data.version})`, 'success');
    } catch (error) {
      console.error('Error saving draft:', error);
      showToast(error.response?.data?.error || 'Failed to save draft', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const publishBlog = async () => {
    if (!title.trim()) {
      showToast('Please enter a blog title', 'error');
      return;
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    if (!tempDiv.textContent.trim()) {
      showToast('Please add some content to your blog', 'error');
      return;
    }
    if (!categories.length) {
      showToast('Please select at least one category', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      let currentBlogId = blogId;

      if (!currentBlogId) {
        currentBlogId = await createDraft();
        setBlogId(currentBlogId);
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('username', user.username);
      formData.append('is_published', 'true');
      categories.forEach((cat) => formData.append('categories[]', cat));
      tags.forEach((tag) => formData.append('tags[]', tag));
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      const endpoint = currentBlogId ? `/blogs/update/${currentBlogId}/` : '/blogs/create/';
      const method = currentBlogId ? api.put : api.post;
      const response = await method(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setStatus('published');
      setLastSaved(response.data.updated_at || response.data.created_at);
      setBlog({
        ...blog,
        id: response.data.id || currentBlogId,
        title: response.data.title || title,
        content,
        thumbnail_url: response.data.thumbnail_url || thumbnail,
        categories: response.data.categories || categories,
        tags: response.data.tags || tags,
        status: 'published',
        version: response.data.version || blog?.version,
      });

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          title: response.data.title || title,
          content,
          categories: response.data.categories || categories,
          tags: response.data.tags || tags,
          thumbnail_url: response.data.thumbnail_url || thumbnail,
        }));
      }

      showToast('Blog published successfully', 'success');
      setTimeout(() => {
        navigate(`/blogs/${response.data.id || currentBlogId}`);
      }, 2000);
    } catch (error) {
      console.error('Publish error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to publish blog';
      showToast(`Failed to publish blog: ${errorMessage}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const discardBlog = async () => {
    if (!window.confirm('Are you sure you want to discard this blog? It will be moved to trash.')) return;
    try {
      setIsSubmitting(true);
      if (!blogId) {
        navigate('/blogs/drafts');
        return;
      }
      await api.post(`/blogs/delete/${blogId}/`, { username: user.username });
      showToast('Blog moved to trash', 'success');
      navigate('/blogs/drafts');
    } catch (error) {
      console.error('Error discarding blog:', error);
      showToast(error.response?.data?.error || 'Failed to discard blog', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimestamp = (timestamp, useDDMMYYYY = false) => {
    if (!timestamp) return 'Not saved yet';
    const date = new Date(timestamp);
    if (useDDMMYYYY) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const time = date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return `${day}/${month}/${year}, ${time}`;
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const availableCategories = [
    'Technology', 'Science', 'Programming', 'AI', 'Web Development', 'Mobile', 'Job'
  ];

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      <Navbar />
      <ToastContainer />
      <div className="flex flex-col lg:flex-row flex-1 pt-16">
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className={`max-w-full sm:max-w-6xl mx-auto rounded-xl shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 sm:px-8 py-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {isEditing ? 'Edit Blog' : 'Create New Blog'}
              </h1>
            </div>
            <div className="p-4 sm:p-8">
              <div className="mb-6 sm:mb-8">
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Blog Title *
                </label>
                <input
                  type="text"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:!border-[var(--primary-color)] transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-800'}`}
                  placeholder="Enter your blog title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6 sm:mb-8">
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Thumbnail Image
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-colors ${thumbnail ? (darkMode ? 'border-gray-700' : 'border-gray-200') : (darkMode ? 'border-gray-600 hover:border-[var(--primary-color)]' : 'border-gray-300 hover:border-[var(--primary-color)]')}`}
                  onClick={() => fileInputRef.current.click()}
                >
                  {thumbnail ? (
                    <div className="relative">
                      <img src={thumbnail} alt="Preview" className="max-h-48 sm:max-h-60 mx-auto rounded-md object-cover w-full" />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setThumbnail(null);
                          setThumbnailFile(null);
                          if (ws && ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({
                              title,
                              content,
                              categories,
                              tags,
                              thumbnail_url: null,
                            }));
                          }
                        }}
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FiUpload className={`mx-auto h-10 sm:h-12 w-10 sm:w-12 mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Click to upload or drag and drop</p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Recommended size: 1200×630px</p>
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
              <div className="mb-6 sm:mb-8">
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Categories *
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`px-3 sm:px-4 py-2 rounded-full border text-sm font-medium flex items-center transition-colors duration-200 ${categories.includes(cat) ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]' : (darkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-300')}`}
                      onClick={() => toggleCategory(cat)}
                      onMouseEnter={() => setHoveredIcon(cat)}
                      onMouseLeave={() => setHoveredIcon(null)}
                      style={{ borderColor: hoveredIcon === cat && !categories.includes(cat) ? `var(--primary-color)` : undefined }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6 sm:mb-8">
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <div key={tag} className={`px-2 sm:px-3 py-1 rounded-full text-sm flex items-center ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                      {tag}
                      <button type="button" className="ml-1.5 hover:text-red-500 transition-colors" onClick={() => removeTag(tag)}>
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
                    className={`flex-1 px-3 py-2 border text-sm rounded-l-lg focus:outline-none focus:!border-[var(--primary-color)] transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-800'}`}
                    placeholder="Add tags (press Enter)"
                  />
                  <button type="submit" className="px-3 py-2 text-white rounded-r-lg hover:opacity-90 transition-colors" style={{ backgroundColor: primaryColor }}>
                    <FiPlus />
                  </button>
                </form>
              </div>
              <div className="mb-6 sm:mb-8">
                <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Blog Content *
                </label>
                <Tiptap content={content} setContent={setContent} primaryColor={primaryColor} darkMode={darkMode} />
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 sm:mt-8">
                <div className={`text-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="flex items-center gap-1">
                    <FiInfo className="text-[var(--primary-color)]" />
                    <span>Status: <span className="font-medium text-amber-500 capitalize">{status}</span></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiClock className="text-[var(--primary-color)]" />
                    <span>Last Saved: <span className="font-medium">{formatTimestamp(lastSaved)}</span></span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    className={`px-4 sm:px-6 py-2 border rounded-lg transition-colors w-full sm:w-auto flex items-center justify-center gap-2 ${darkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    onClick={discardBlog}
                  >
                    <FiTrash2 />
                    Discard
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    className="px-4 sm:px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
                    onClick={saveAsDraft}
                  >
                    <FiSave />
                    {isEditing ? 'Update Draft' : 'Save Draft'}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    className="px-4 sm:px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
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
        <aside className={`lg:block w-full lg:w-80 border-t lg:border-t-0 lg:border-l p-4 sm:p-6 overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="mb-6 sm:mb-8">
            <h3 className={`text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <FiUsers className="text-[var(--primary-color)]" />
              Collaborators
            </h3>
            {user && (
              <div className="space-y-3">
                <div className={`flex items-center p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <img
                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                    alt={user.username}
                    className="h-8 sm:h-10 w-8 sm:w-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user.username} (You)</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Primary Author</p>
                  </div>
                </div>
                {blog?.authors?.filter((author) => author.username !== user.username).map((author) => (
                  <div key={author.username} className={`flex justify-between items-center p-3 rounded-lg ${darkMode ? 'bg-gray-700 hover:shadow-md' : 'bg-white hover:shadow-sm'}`}>
                    <div className="flex items-center">
                      <img
                        src={author.avatar_url || `https://ui-avatars.com/api/?name=${author.username}&background=random`}
                        alt={author.username}
                        className="h-8 sm:h-10 w-8 sm:w-10 rounded-full object-cover mr-3"
                      />
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{author.username}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Collaborator</p>
                      </div>
                    </div>
                    {user.username === blog.authors[0]?.username && (
                      <button
                        className={`transition-colors ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
                        onClick={() => removeCollaborator(author.username)}
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
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
                  className={`flex-1 px-3 py-2 border text-sm rounded-l-lg focus:outline-none focus:!border-[var(--primary-color)] transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-800'}`}
                  placeholder="Search users to collaborate"
                />
                <button className="px-3 py-2 text-white rounded-r-lg hover:opacity-90 transition-colors" style={{ backgroundColor: primaryColor }}>
                  <FiSearch />
                </button>
              </div>
              {showSearchResults && searchResults.length > 0 && (
                <div className={`absolute z-10 mt-1 w-full rounded-lg shadow-lg py-1 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  {searchResults.map((user) => (
                    <div key={user._id} className={`px-4 py-2 text-sm cursor-pointer flex items-center justify-between ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}>
                      <div className="flex items-center">
                        <img
                          src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                          alt={user.username}
                          className="h-8 w-8 rounded-full object-cover mr-3"
                        />
                        <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{user.username}</span>
                      </div>
                      <button
                        className={`p-1 rounded-full ${darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-200'}`}
                        onClick={() => sendAuthorRequest(user.username)}
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
          <div className="mb-6 sm:mb-8">
            <button
              type="button"
              disabled={isSubmitting || !blogId}
              className={`w-full px-4 py-2 rounded-lg border flex items-center justify-center gap-2 transition-colors duration-200 ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-300 text-gray-700'} ${isSubmitting || !blogId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--primary-color)] hover:text-white'}`}
              onClick={() => navigate(`/blogs/${blogId}/history`)}
              onMouseEnter={() => setIsHistoryHovered(true)}
              onMouseLeave={() => setIsHistoryHovered(false)}
            >
              <FiClock className="text-[var(--primary-color)]" style={{ color: isHistoryHovered && !(isSubmitting || !blogId) ? 'white' : 'var(--primary-color)' }} />
              View History
            </button>
          </div>
          <div className={`p-4 sm:p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
            <h3 className={`text-base sm:text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
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
                <span className="font-medium">{formatTimestamp(lastSaved, true)}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="font-medium">{formatTimestamp(createdAt, true)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
      <Footer />
    </div>
  );
};

export default CreateBlogs;