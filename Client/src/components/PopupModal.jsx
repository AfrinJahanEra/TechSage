// components/PopupModal.jsx
import React from 'react';
import { FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const PopupModal = ({ show, message, type = 'info', onClose }) => {
  if (!show) return null;

  const icon = {
    success: <FiCheckCircle className="text-green-500 w-6 h-6" />,
    error: <FiAlertCircle className="text-red-500 w-6 h-6" />,
    info: <FiAlertCircle className="text-blue-500 w-6 h-6" />
  }[type];

  const color = {
    success: 'bg-green-100 border-green-400 text-green-800',
    error: 'bg-red-100 border-red-400 text-red-800',
    info: 'bg-blue-100 border-blue-400 text-blue-800'
  }[type];

  return (
    <div className="fixed top-5 right-5 z-50 w-[300px]">
      <div className={`flex items-start gap-3 border-l-4 p-4 rounded-md shadow-lg ${color}`}>
        {icon}
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
