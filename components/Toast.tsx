
import React from 'react';
import { useApp } from '../context/AppContext';

const Toast: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      case 'warning': return 'bg-yellow-500 text-white';
      default: return 'bg-secondary text-white';
    }
  };

  return (
    <div className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl animate-fade-in ${getColors(toast.type)}`}
          onClick={() => removeToast(toast.id)}
        >
          <span className="material-symbols-outlined text-lg">{getIcon(toast.type)}</span>
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export default Toast;
