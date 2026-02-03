
import React from 'react';
import { useApp } from '../context/AppContext';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, clearNotifications } = useApp();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return 'warning';
      case 'success': return 'check_circle';
      default: return 'info';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-orange-500';
      case 'success': return 'text-green-500';
      default: return 'text-blue-500';
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-fade-in">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h4 className="font-bold text-sm">알림</h4>
          {unreadCount > 0 && (
            <button 
              onClick={clearNotifications}
              className="text-[10px] font-bold text-primary hover:underline"
            >
              모두 읽음
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-gray-300">notifications_off</span>
              <p className="text-sm text-gray-400 mt-2">알림이 없습니다</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                onClick={() => markNotificationRead(notification.id)}
                className={`px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
              >
                <div className="flex gap-3">
                  <span className={`material-symbols-outlined ${getIconColor(notification.type)}`}>
                    {getIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold truncate">{notification.title}</p>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-primary rounded-full shrink-0"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                    <p className="text-[9px] text-gray-400 mt-1">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
