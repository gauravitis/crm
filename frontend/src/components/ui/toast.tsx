import React from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  variant = 'default',
  onClose
}) => {
  // Define colors based on variant
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-white border-gray-200 text-gray-800';
    }
  };

  return (
    <div 
      className={`flex items-start shadow-md rounded-lg border p-4 mb-3 ${getVariantClasses()}`}
      role="alert"
    >
      <div className="flex-1 mr-2">
        <h3 className="font-medium">{title}</h3>
        {description && <p className="text-sm mt-1">{description}</p>}
      </div>
      <button 
        className="text-gray-400 hover:text-gray-600"
        onClick={() => onClose(id)}
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{
  toasts: Array<{
    id: string;
    title: string;
    description?: string;
    variant?: 'default' | 'success' | 'warning' | 'error';
  }>;
  onClose: (id: string) => void;
}> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-xs w-full flex flex-col">
      {toasts.map((toast) => (
        <Toast 
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onClose={onClose}
        />
      ))}
    </div>
  );
}; 