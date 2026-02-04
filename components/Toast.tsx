
import React from 'react';
import { useApp } from '../context/AppContext';

/**
 * Toast 컴포넌트
 * - 알림 메시지를 화면 하단에 표시
 * - 액션 버튼(예: 되돌리기)을 지원
 */
const Toast: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  // 타입별 아이콘 반환
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  // 타입별 색상 클래스 반환
  const getColors = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      case 'warning': return 'bg-yellow-500 text-white';
      default: return 'bg-secondary text-white';
    }
  };

  // 액션 버튼 클릭 핸들러
  const handleActionClick = (e: React.MouseEvent, action: () => void, toastId: string) => {
    e.stopPropagation(); // Toast 닫힘 방지
    action();
    removeToast(toastId); // 액션 실행 후 Toast 닫기
  };

  return (
    <div className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl animate-fade-in ${getColors(toast.type)}`}
          onClick={() => !toast.action && removeToast(toast.id)} // 액션이 없을 때만 클릭으로 닫기
        >
          <span className="material-symbols-outlined text-lg">{getIcon(toast.type)}</span>
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          
          {/* 액션 버튼이 있는 경우 표시 (예: 되돌리기) */}
          {toast.action && (
            <button
              onClick={(e) => handleActionClick(e, toast.action!.onClick, toast.id)}
              className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors border border-white/30"
            >
              {toast.action.label}
            </button>
          )}
          
          {/* 액션이 있을 때 닫기 버튼 추가 */}
          {toast.action && (
            <button
              onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
              className="ml-1 hover:bg-white/20 rounded p-0.5 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Toast;
