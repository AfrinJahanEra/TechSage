import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-4">
            <h3 className="text-teal-400 text-xl font-bold pb-2 border-b border-teal-400">TechSage</h3>
            <p className="text-gray-300">
              TechSage is a student-powered platform where knowledge meets creativity. Dive into curated
              articles, explore trending academic topics, and contribute your insights.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-teal-500 transition-colors">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-teal-500 transition-colors">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-teal-500 transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-teal-500 transition-colors">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-teal-400 text-xl font-bold pb-2 border-b border-teal-400">Quick Links</h3>
            <Link to="#" className="block text-gray-300 hover:text-teal-400 transition-colors">Privacy Policy</Link>
            <Link to="#" className="block text-gray-300 hover:text-teal-400 transition-colors">Terms of Use</Link>
            <Link to="#" className="block text-gray-300 hover:text-teal-400 transition-colors">Contact Us</Link>
            <Link to="#" className="block text-gray-300 hover:text-teal-400 transition-colors">About TechSage</Link>
          </div>

          <div className="space-y-3">
            <h3 className="text-teal-400 text-xl font-bold pb-2 border-b border-teal-400">Categories</h3>
            <Link to="#" className="block text-gray-300 hover:text-teal-400 transition-colors">Physics</Link>
            <Link to="#" className="block text-gray-300 hover:text-teal-400 transition-colors">Mathematics</Link>
            <Link to="#" className="block text-gray-300 hover:text-teal-400 transition-colors">Biology</Link>
            <Link to="#" className="block text-gray-300 hover:text-teal-400 transition-colors">Computer Science</Link>
          </div>

          <div className="space-y-3">
            <h3 className="text-teal-400 text-xl font-bold pb-2 border-b border-teal-400">Connect</h3>
            <Link to="#" className="block text-gray-300 hover:text-teal-400 transition-colors">Twitter</Link>
            <Link to="#" className="block text-gray-300 hover:text-teal-400 transition-colors">Facebook</Link>
            <Link to="#" className="block text-gray-300 hover:text-teal-400 transition-colors">Instagram</Link>
            <Link to="#" className="block text-gray-300 hover:text-teal-400 transition-colors">LinkedIn</Link>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 pb-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} TechSage. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;