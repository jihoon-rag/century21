
import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, [isOpen]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="설정" size="md">
      <div className="space-y-6">
        {/* Appearance */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">화면 설정</h4>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl text-gray-500">dark_mode</span>
              <div>
                <p className="text-sm font-bold">다크 모드</p>
                <p className="text-[10px] text-gray-400">어두운 테마를 사용합니다</p>
              </div>
            </div>
            <button 
              onClick={toggleDarkMode}
              className={`w-12 h-7 rounded-full transition-colors relative ${isDarkMode ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}></div>
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">알림 설정</h4>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl text-gray-500">notifications</span>
              <div>
                <p className="text-sm font-bold">푸시 알림</p>
                <p className="text-[10px] text-gray-400">앱 내 알림을 받습니다</p>
              </div>
            </div>
            <button 
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-12 h-7 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl text-gray-500">sms</span>
              <div>
                <p className="text-sm font-bold">SMS 알림</p>
                <p className="text-[10px] text-gray-400">문자로 알림을 받습니다</p>
              </div>
            </div>
            <button 
              onClick={() => setSmsNotifications(!smsNotifications)}
              className={`w-12 h-7 rounded-full transition-colors relative ${smsNotifications ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${smsNotifications ? 'translate-x-6' : 'translate-x-1'}`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-xl text-gray-500">mail</span>
              <div>
                <p className="text-sm font-bold">이메일 알림</p>
                <p className="text-[10px] text-gray-400">이메일로 알림을 받습니다</p>
              </div>
            </div>
            <button 
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`w-12 h-7 rounded-full transition-colors relative ${emailNotifications ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`}></div>
            </button>
          </div>
        </div>

        {/* Account */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">계정</h4>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                DH
              </div>
              <div>
                <p className="font-bold">이동현</p>
                <p className="text-xs text-gray-400">서울 본부 · 수석 중개사</p>
              </div>
            </div>
          </div>

          <button className="w-full py-3 text-sm font-bold text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-colors">
            로그아웃
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
