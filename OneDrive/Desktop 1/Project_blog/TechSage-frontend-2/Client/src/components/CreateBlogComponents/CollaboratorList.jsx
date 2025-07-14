import React from 'react';

const CollaboratorList = ({ collaborators, setCollaborators, newCollaborator, setNewCollaborator }) => {
  const addCollaborator = (e) => {
    e.preventDefault();
    if (!newCollaborator.trim()) return;
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCollaborator)) {
      alert('Please enter a valid email address');
      return;
    }
    
    // Check if collaborator already exists
    if (collaborators.some(c => c.email === newCollaborator)) {
      alert('This collaborator is already added');
      return;
    }
    
    // In a real app, you would verify the email with your backend
    setCollaborators([
      ...collaborators,
      { 
        id: Date.now(), // Temporary ID
        name: newCollaborator.split('@')[0], // Default name
        email: newCollaborator 
      }
    ]);
    setNewCollaborator('');
  };
  
  const removeCollaborator = (id) => {
    setCollaborators(collaborators.filter(c => c.id !== id));
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Collaborators</h3>
      
      <div className="space-y-3 mb-4">
        {collaborators.map(collaborator => (
          <div key={collaborator.id} className="flex justify-between items-center p-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">
                {collaborator.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{collaborator.name}</p>
                <p className="text-xs text-gray-500">{collaborator.email}</p>
              </div>
            </div>
            <button
              onClick={() => removeCollaborator(collaborator.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      
      <form onSubmit={addCollaborator} className="flex">
        <input
          type="email"
          value={newCollaborator}
          onChange={(e) => setNewCollaborator(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add collaborator by email"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
        >
          Add
        </button>
      </form>
    </div>
  );
};

export default CollaboratorList;