import { FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const PopupModal = ({ show, message, type = 'info', onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed top-5 right-5 z-50 w-[300px]">
      <div className={`flex items-start gap-3 border-l-4 p-4 rounded-md shadow-lg ${
        type === 'success' 
          ? 'bg-green-100 border-green-400 text-green-800' 
          : 'bg-red-100 border-red-400 text-red-800'
      }`}>
        {type === 'success' 
          ? <FiCheckCircle className="text-green-500 w-6 h-6" /> 
          : <FiAlertCircle className="text-red-500 w-6 h-6" />
        }
        <div className="flex-1 text-sm">
          {message}
        </div>
        <button
          className="ml-2 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          <FiX />
        </button>
      </div>
    </div>
  );
};

export default PopupModal;