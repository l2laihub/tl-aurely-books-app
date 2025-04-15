import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={onClose} // Close on overlay click
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
        {title && (
          <h2 className="text-xl font-semibold mb-4 text-primary-800">{title}</h2>
        )}
        <div className="prose max-w-none"> 
          {/* Using prose for basic styling of content */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;