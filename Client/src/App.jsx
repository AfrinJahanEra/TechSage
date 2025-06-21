// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function AppRoutes() {
  const { firstVisit } = useAuth();

  return (
    <Routes>
      <Route path="/" element={firstVisit ? <WelcomePage /> : <Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/inside-blog" element={<InsideBlog />} />
      <Route path="/top-contributors" element={<TopContributors />} />
      <Route path="/all-blogs" element={<AllBlogs />} />
      <Route path="/other-dashboard" element={<OtherDashboard />} />
      <Route path="/signup" element={<SignupForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;