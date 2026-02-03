
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  navigateTo: (view: ViewType) => void;
  isAdminMode: boolean;
  toggleAdmin: () => void;
  closeSidebar: () => void;
  openSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, navigateTo, isAdminMode, toggleAdmin, closeSidebar, openSettings }) => {
  const agentMenu = [
    { id: 'DASHBOARD', icon: 'home', label: '홈' },
    { id: 'CUSTOMER_DB', icon: 'groups', label: '고객 DB' },
    { id: 'STATISTICS', icon: 'analytics', label: '통계 데이터' },
    { id: 'SCHEDULE', icon: 'calendar_month', label: '전체 일정' },
    { id: 'AI_SECRETARY', icon: 'smart_toy', label: 'AI 비서' },
    { id: 'OPERATIONS', icon: 'campaign', label: '통합 운영 관리' },
  ];

  const adminMenu = [
    { id: 'MASTER_ADMIN', icon: 'grid_view', label: '관리자 홈' },
    { id: 'AGENT_MANAGEMENT', icon: 'badge', label: '소속 중개사 관리' },
    { id: 'STATISTICS', icon: 'monitoring', label: '전체 고객 통계' },
  ];

  const activeMenu = isAdminMode ? adminMenu : agentMenu;

  return (
    <aside className="w-64 bg-secondary text-white flex flex-col h-full shrink-0 shadow-2xl lg:shadow-none">
      <div className="p-6 lg:p-8 border-b border-white/5 flex items-center justify-between">
        <h1 className="flex flex-col gap-0.5 font-black tracking-widest uppercase">
          <span className="text-primary text-xl lg:text-2xl leading-none">Century 21</span>
          <span className="text-[8px] lg:text-[9px] opacity-40 tracking-[0.4em]">{isAdminMode ? 'Master Admin' : 'Real Estate'}</span>
        </h1>
        <button onClick={closeSidebar} className="lg:hidden p-1 hover:bg-white/10 rounded-lg">
          <span className="material-symbols-outlined text-gray-400">close</span>
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="pb-2 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Menu</div>
        {activeMenu.map(item => (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id as ViewType)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all duration-200 ${
              currentView === item.id 
                ? 'bg-primary text-black font-bold shadow-lg shadow-primary/20' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto p-4 border-t border-white/5 space-y-2">
        <button 
          onClick={toggleAdmin}
          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-primary border border-primary/20 rounded hover:bg-primary/5 transition-all"
        >
          <span className="material-symbols-outlined text-sm">{isAdminMode ? 'person' : 'admin_panel_settings'}</span>
          {isAdminMode ? '에이전트 모드 전환' : '마스터 관리자 전환'}
        </button>
        <button 
          onClick={() => { openSettings(); closeSidebar(); }}
          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-gray-500 hover:text-white transition-all"
        >
          <span className="material-symbols-outlined text-sm">settings</span>
          설정
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
