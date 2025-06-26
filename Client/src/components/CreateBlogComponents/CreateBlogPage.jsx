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

  
};

export default CreateBlogPage;