import { useState, useEffect, useRef } from 'react';
import 'react-confirm-alert/src/react-confirm-alert.css';

const AdminDashboard = () => {
  // ... (keep all existing state and hooks)

  // Add new state for file upload
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  // Handle file upload to Cloudinary
  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'badges_preset'); // Replace with your upload preset

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      setNewBadge({ ...newBadge, image_url: data.secure_url });
      setPreviewImage(data.secure_url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };
  
  const CreateBadgeForm = () => (
    <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <form onSubmit={handleCreateBadge}>
        <div className="mb-4">
          <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Badge Name
          </label>
          <select
            className={`w-full px-3 py-2 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
            value={newBadge.name}
            onChange={(e) => setNewBadge({...newBadge, name: e.target.value})}
            required
          >
            <option value="">Select badge level</option>
            <option value="ruby">Ruby</option>
            <option value="bronze">Bronze</option>
            <option value="sapphire">Sapphire</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Badge Image
          </label>
          <div className="flex items-center space-x-4">
            {previewImage ? (
              <img 
                src={previewImage} 
                alt="Preview" 
                className="w-16 h-16 object-cover rounded-md"
              />
            ) : (
              <div className={`w-16 h-16 rounded-md flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <i className="fas fa-image text-gray-500"></i>
              </div>
            )}
            <label className="cursor-pointer">
              <span className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-500 hover:bg-teal-600'} text-white`}>
                {uploading ? 'Uploading...' : 'Choose Image'}
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                disabled={uploading}
              />
            </label>
          </div>
          {newBadge.image_url && (
            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Image URL: {newBadge.image_url.substring(0, 50)}...
            </p>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setActiveSection('badges');
              setNewBadge({ name: '', image_url: '' });
              setPreviewImage('');
            }}
            className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-500 hover:bg-teal-600'} text-white`}
            disabled={!newBadge.name || !newBadge.image_url || uploading}
          >
            {uploading ? 'Creating...' : 'Create Badge'}
          </button>
        </div>
      </form>
    </div>
  );