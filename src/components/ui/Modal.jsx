import React from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ children, onClose }) => {
  // Handle closing when clicking outside the modal
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
      onClick={handleBackgroundClick}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
