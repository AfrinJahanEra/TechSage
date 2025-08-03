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
  

  
const BadgesManagement = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold pb-2 border-b-2 border-teal-500 inline-block ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Badges Management
        </h1>
        <button 
          onClick={() => {
            setNewBadge({ name: '', image_url: '' });
            setPreviewImage('');
            setActiveSection('create-badge');
          }}
          className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-500 hover:bg-teal-600'} text-white`}
        >
          <i className="fas fa-plus mr-2"></i> Create New Badge
        </button>
      </div>

      <div className="space-y-6">
        {badges.length === 0 ? (
          <div className={`text-center py-10 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <i className="fas fa-award text-3xl mb-4"></i>
            <p>No badges found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map(badge => (
              <div key={badge._id || badge.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} flex flex-col`}>
                <div className="flex items-center mb-4">
                  {badge.image_url ? (
                    <img 
                      src={badge.image_url} 
                      alt={badge.name} 
                      className="w-16 h-16 object-contain mr-4"
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <i className="fas fa-award text-2xl text-gray-500"></i>
                    </div>
                  )}
                  <div>
                    <h4 className={`font-semibold text-lg capitalize ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {badge.name}
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Minimum points: {getBadgeThreshold(badge.name)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-center">
                    <select
                      className={`px-3 py-1 rounded mr-2 flex-grow ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssignBadge(e.target.value, badge._id || badge.id);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">Assign to user...</option>
                      {users.map(user => (
                        <option key={user.username} value={user.username}>
                          {user.username} ({user.points || 0} pts)
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDeleteBadge(badge._id || badge.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                      title="Delete badge"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
