
import React from 'react';
import { ViewType } from '../types';

interface BottomNavProps {
  currentView: ViewType;
  navigateTo: (view: ViewType) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, navigateTo }) => {
  const navItems = [
    { id: 'DASHBOARD', icon: 'home', label: '홈' },
    { id: 'CUSTOMER_DB', icon: 'groups', label: '고객' },
    { id: 'SCHEDULE', icon: 'calendar_today', label: '일정' },
    { id: 'AI_SECRETARY', icon: 'smart_toy', label: 'AI비서' },
    { id: 'OPERATIONS', icon: 'send', label: '발송' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#1A1A1A] border-t border-gray-200 dark:border-gray-800 flex items-center justify-around px-2 z-40 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => navigateTo(item.id as ViewType)}
          className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-all ${
            currentView === item.id 
              ? 'text-primary' 
              : 'text-gray-400'
          }`}
        >
          <span className={`material-symbols-outlined text-[22px] ${currentView === item.id ? 'fill-1' : ''}`}>
            {item.icon}
          </span>
          <span className="text-[10px] font-bold tracking-tighter">
            {item.label}
          </span>
          {currentView === item.id && (
            <div className="w-1 h-1 bg-primary rounded-full absolute top-1"></div>
          )}
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
