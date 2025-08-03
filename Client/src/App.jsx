// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CreateBlogs from './pages/CreateBlogs.jsx';
import Home from './pages/Home.jsx';
import InsideBlog from './pages/InsideBlog.jsx';
import TopContributors from './pages/TopContributors.jsx';
import AllBlogs from './pages/AllBlogs.jsx';
import OtherDashboard from './pages/OtherDashboard.jsx';
import Settings from './pages/Settings.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import SignupForm from './components/auth/SignupForm.jsx';
import LoginForm from './components/auth/LoginForm.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Admin from './pages/Admin.jsx';
import ModeratorDashboard from './pages/Moderator.jsx';
import SearchForm from './components/SearchForm.jsx';
import AdminDashboard from '../src/pages/Admin.jsx';
import { useContext } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';

function AppRoutes() {
  const { firstVisit } = useAuth();

  return (
    <Routes>
      <Route path="/" element={firstVisit ? <WelcomePage /> : <Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/blog/:id" element={<InsideBlog />} />
      <Route path="/top-contributors" element={<TopContributors />} />
      <Route path="/all-blogs" element={<AllBlogs />} />
      <Route path="/other-dashboard" element={<OtherDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/signup" element={<SignupForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/create-blog" element={<CreateBlogs />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
      <Route path="/moderator" element={<PrivateRoute><ModeratorDashboard /></PrivateRoute>} />
      <Route path="/user/:username" element={<OtherDashboard />} />
      <Route path="/search" element={<SearchForm />} />
      <Route path="/users/:username" element={<OtherDashboard />} />
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppRoutes />
          <ToastContainer />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;