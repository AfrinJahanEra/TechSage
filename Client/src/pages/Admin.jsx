// src/pages/Admin.jsx
import { useAuth } from '../context/AuthContext.jsx';

const Admin = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <p className="text-gray-600">Welcome, {user?.name} (Admin)</p>
      {/* Add admin-specific content here */}
    </div>
  );
};

export default Admin;