import { FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const PopupModal = ({ 
  show, 
  message, 
  type = 'info', 
  onClose, 
  primaryColor, 
  darkMode, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  title 
}) => {
  if (!show) return null;

  return (
    <>
      <style>
        {`
          .modal {
            position: relative;
            z-index: 50;
            padding: 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 90%;
            max-width: 400px;
          }
        `}
      </style>
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 ${darkMode ? 'bg-black/50' : 'bg-black/30'}`}
        style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <div
          className={`modal ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
          style={{ border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}` }}
          onClick={(e) => e.stopPropagation()}
        >
          {type !== 'confirm' ? (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{title || (type === 'success' ? 'Success' : 'Error')}</h3>
                <button onClick={onClose} aria-label="Close">
                  <FiX />
                </button>
              </div>
              <div className="flex items-start gap-3">
                {type === 'success' ? (
                  <FiCheckCircle className="text-green-500 w-6 h-6" />
                ) : (
                  <FiAlertCircle className="text-red-500 w-6 h-6" />
                )}
                <div className="flex-1 text-sm">{message}</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {title && (
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <button onClick={onCancel} aria-label="Close">
                    <FiX />
                  </button>
                </div>
              )}
              <div className="flex-1 text-sm">{message}</div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={onCancel}
                  className={`px-4 py-2 border rounded-lg ${darkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-800 hover:bg-gray-50'}`}
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                  style={{ backgroundColor: primaryColor }}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PopupModal;