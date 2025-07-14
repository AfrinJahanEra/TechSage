import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { primaryColor, darkMode } = useTheme();
  
  // Footer background style
  const footerStyle = {
    backgroundColor: darkMode ? '#111827' : '#1f2937',
  };

  // Section title style
  const sectionTitleStyle = {
    color: primaryColor,
    borderBottomColor: primaryColor,
  };

  // Social icon hover style
  const socialIconStyle = {
    backgroundColor: darkMode ? '#374151' : '#4b5563',
  };

  return (
    <footer className="pt-16 px-4 sm:px-6 lg:px-8" style={footerStyle}>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-4">
            <h3 className="text-xl font-bold pb-2 border-b" style={sectionTitleStyle}>
              TechSage
            </h3>
            <p className="text-gray-300">
              TechSage is a student-powered platform where knowledge meets creativity. 
              Dive into curated articles, explore trending academic topics, and contribute your insights.
            </p>
            <div className="flex space-x-4 mt-4">
              {['twitter', 'linkedin-in', 'facebook-f', 'youtube'].map((icon) => (
                <a 
                  key={icon}
                  href="#" 
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all"
                  style={socialIconStyle}
                >
                  <i className={`fab fa-${icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          {['Quick Links', 'Categories', 'Connect'].map((section) => (
            <div key={section} className="space-y-3">
              <h3 className="text-xl font-bold pb-2 border-b" style={sectionTitleStyle}>
                {section}
              </h3>
              {Array(4).fill(0).map((_, i) => (
                <Link 
                  key={i}
                  to="#" 
                  className="block text-gray-300 hover:text-white transition-colors"
                  style={{ '--tw-text-opacity': 0.7, '&:hover': { '--tw-text-opacity': 1 } }}
                >
                  {section === 'Quick Links' 
                    ? ['Privacy Policy', 'Terms of Use', 'Contact Us', 'About TechSage'][i]
                    : section === 'Categories'
                      ? ['Physics', 'Mathematics', 'Biology', 'Computer Science'][i]
                      : ['Twitter', 'Facebook', 'Instagram', 'LinkedIn'][i]}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className={`border-t ${darkMode ? 'border-gray-800' : 'border-gray-700'} pt-6 pb-6 text-center text-gray-500 text-sm`}>
          <p>&copy; {new Date().getFullYear()} TechSage. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;