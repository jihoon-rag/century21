
import React, { useState } from 'react';
import { ViewType } from './types';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import NotificationPanel from './components/NotificationPanel';
import SettingsModal from './components/SettingsModal';
import AgentDashboard from './views/AgentDashboard';
import CustomerDB from './views/CustomerDB';
import CustomerDetail from './views/CustomerDetail';
import AISecretary from './views/AISecretary';
import ScheduleView from './views/ScheduleView';
import StatisticsView from './views/StatisticsView';
import OperationalManagement from './views/OperationalManagement';
import MasterAdmin from './views/MasterAdmin';
import AgentManagement from './views/AgentManagement';

const AppContent: React.FC = () => {
  const { notifications, isSettingsOpen, setIsSettingsOpen } = useApp();
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const navigateTo = (view: ViewType, customerId?: string) => {
    if (customerId) setSelectedCustomerId(customerId);
    setCurrentView(view);
    setIsSidebarOpen(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD': return <AgentDashboard navigateTo={navigateTo} />;
      case 'CUSTOMER_DB': return <CustomerDB navigateTo={navigateTo} />;
      case 'CUSTOMER_DETAIL': return <CustomerDetail navigateTo={navigateTo} id={selectedCustomerId} />;
      case 'SCHEDULE': return <ScheduleView />;
      case 'STATISTICS': return <StatisticsView />;
      case 'AI_SECRETARY': return <AISecretary />;
      case 'OPERATIONS': return <OperationalManagement />;
      case 'MASTER_ADMIN': return <MasterAdmin />;
      case 'AGENT_MANAGEMENT': return <AgentManagement />;
      default: return <AgentDashboard navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F0F] text-gray-900 dark:text-gray-100 overflow-hidden font-sans relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar - Desktop (static) & Mobile (drawer) */}
      <div className={`fixed inset-y-0 left-0 z-[60] transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar 
          currentView={currentView} 
          navigateTo={navigateTo} 
          isAdminMode={isAdminMode}
          toggleAdmin={() => {
              const nextMode = !isAdminMode;
              setIsAdminMode(nextMode);
              navigateTo(nextMode ? 'MASTER_ADMIN' : 'DASHBOARD');
          }}
          closeSidebar={() => setIsSidebarOpen(false)}
          openSettings={() => setIsSettingsOpen(true)}
        />
      </div>
      
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar relative pb-16 lg:pb-0">
        {/* Top Header */}
        <header className="h-14 lg:h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2 lg:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg lg:hidden"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>
            <h1 className="text-sm lg:text-lg font-bold tracking-tight truncate max-w-[120px] sm:max-w-none">
              {isAdminMode ? 'Master Console' : 'Agent Workspace'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-1.5 lg:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative"
              >
                <span className="material-symbols-outlined text-gray-500 text-xl lg:text-2xl">notifications</span>
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center px-1">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              <NotificationPanel 
                isOpen={isNotificationOpen} 
                onClose={() => setIsNotificationOpen(false)} 
              />
            </div>
            <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-gray-200 dark:border-gray-800">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] lg:text-xs font-bold leading-none">{isAdminMode ? '관리자' : '이동현'}</p>
                <p className="text-[9px] text-primary mt-0.5 font-bold">서울 본부</p>
              </div>
              <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-primary flex items-center justify-center font-bold text-white shadow-md text-[10px] lg:text-xs">
                {isAdminMode ? 'AD' : 'DH'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-3 lg:p-8 animate-fade-in">
          {renderView()}
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      {!isAdminMode && (
        <BottomNav currentView={currentView} navigateTo={navigateTo} />
      )}

      {/* Global Components */}
      <Toast />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
