import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import InsideBlog from './pages/InsideBlog.jsx';
import TopContributors from './pages/TopContributors.jsx';
import AllBlogs from './pages/AllBlogs.jsx';
import OtherDashboard from './pages/OtherDashboard.jsx';
import Settings from './pages/Settings.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inside-blog" element={<InsideBlog />} />
        <Route path="/top-contributors" element={<TopContributors />} />
        <Route path="/all-blogs" element={<AllBlogs />} />
        <Route path="/other-dashboard" element={<OtherDashboard />} />
        <Route path="/Settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;