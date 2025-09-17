import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
    >
      <div 
        className="bg-cyber-surface/90 backdrop-blur-sm rounded-2xl w-full max-w-md p-6 relative border border-cyber-border shadow-lg modal-animate"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirmation-dialog-title" className="text-xl font-bold text-cyber-text-primary mb-4">{title}</h2>
        <p className="text-cyber-text-secondary mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyber-border hover:bg-cyber-border/80 text-cyber-text-primary font-semibold transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;