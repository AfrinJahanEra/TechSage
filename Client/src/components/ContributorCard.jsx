import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const ContributorCard = ({ image, name, blogs }) => {
  const { primaryColor, darkMode } = useTheme();

  return (
    <Link 
      to={`/contributors/${name.toLowerCase().replace(/\s+/g, '-')}`}
      className={`flex items-center gap-4 p-3 rounded-md transition-colors ${
        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
      }`}
    >
      <div className="w-12 h-12 rounded-full overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{name}</h4>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{blogs}</p>
      </div>
    </Link>
  );
};

export default ContributorCard;