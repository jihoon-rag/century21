
import React, { useState } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';

interface GoalSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoalSettingModal: React.FC<GoalSettingModalProps> = ({ isOpen, onClose }) => {
  const { goals, addGoal, updateGoal, deleteGoal, showToast } = useApp();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [goalType, setGoalType] = useState<'monthly' | 'quarterly'>('monthly');
  const [period, setPeriod] = useState('');
  const [targetRegistrations, setTargetRegistrations] = useState('');
  const [targetContacts, setTargetContacts] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const getCurrentPeriod = (type: 'monthly' | 'quarterly') => {
    const now = new Date();
    if (type === 'monthly') {
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    } else {
      const quarter = Math.ceil((now.getMonth() + 1) / 3);
      return `${now.getFullYear()}-Q${quarter}`;
    }
  };

  const handleAddGoal = () => {
    if (!period || !targetRegistrations || !targetContacts) {
      showToast('모든 필드를 입력해주세요.', 'warning');
      return;
    }

    // Check if goal for same period exists
    const exists = goals.find(g => g.type === goalType && g.period === period);
    if (exists) {
      showToast('해당 기간의 목표가 이미 존재합니다.', 'warning');
      return;
    }

    addGoal({
      type: goalType,
      period,
      targetRegistrations: parseInt(targetRegistrations),
      targetContacts: parseInt(targetContacts),
      actualRegistrations: 0,
      actualContacts: 0,
    });

    resetForm();
  };

  const resetForm = () => {
    setShowAddForm(false);
    setPeriod('');
    setTargetRegistrations('');
    setTargetContacts('');
    setEditingId(null);
  };

  const formatPeriod = (type: string, period: string) => {
    if (type === 'monthly') {
      const [year, month] = period.split('-');
      return `${year}년 ${parseInt(month)}월`;
    } else if (type === 'quarterly') {
      const [year, quarter] = period.split('-');
      return `${year}년 ${quarter}`;
    }
    return period;
  };

  const calculateProgress = (actual: number = 0, target: number) => {
    if (target === 0) return 0;
    return Math.min(100, Math.round((actual / target) * 100));
  };

  const sortedGoals = [...goals].sort((a, b) => {
    if (a.period > b.period) return -1;
    if (a.period < b.period) return 1;
    return 0;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="목표 설정" size="lg">
      <div className="space-y-4">
        {/* Goal List */}
        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
          {sortedGoals.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <span className="material-symbols-outlined text-4xl mb-2">flag</span>
              <p className="text-sm">설정된 목표가 없습니다</p>
            </div>
          ) : (
            sortedGoals.map((goal) => {
              const regProgress = calculateProgress(goal.actualRegistrations, goal.targetRegistrations);
              const contactProgress = calculateProgress(goal.actualContacts, goal.targetContacts);
              
              return (
                <div
                  key={goal.id}
                  className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        goal.type === 'monthly' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {goal.type === 'monthly' ? '월간' : '분기'}
                      </span>
                      <span className="font-bold text-sm">{formatPeriod(goal.type, goal.period)}</span>
                    </div>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm text-gray-400">delete</span>
                    </button>
                  </div>
                  
                  {/* Registrations Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">신규 등록</span>
                      <span className="font-bold">
                        <span className="text-primary">{goal.actualRegistrations || 0}</span>
                        <span className="text-gray-400"> / {goal.targetRegistrations}명</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${regProgress >= 100 ? 'bg-green-500' : 'bg-primary'}`}
                        style={{ width: `${regProgress}%` }}
                      />
                    </div>
                    <p className="text-right text-[10px] text-gray-400">{regProgress}% 달성</p>
                  </div>

                  {/* Contacts Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Contact 기록</span>
                      <span className="font-bold">
                        <span className="text-secondary">{goal.actualContacts || 0}</span>
                        <span className="text-gray-400"> / {goal.targetContacts}건</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${contactProgress >= 100 ? 'bg-green-500' : 'bg-secondary'}`}
                        style={{ width: `${contactProgress}%` }}
                      />
                    </div>
                    <p className="text-right text-[10px] text-gray-400">{contactProgress}% 달성</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add New Goal Form */}
        {showAddForm ? (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => { setGoalType('monthly'); setPeriod(getCurrentPeriod('monthly')); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                  goalType === 'monthly' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}
              >
                월간 목표
              </button>
              <button
                onClick={() => { setGoalType('quarterly'); setPeriod(getCurrentPeriod('quarterly')); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                  goalType === 'quarterly' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}
              >
                분기 목표
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">기간</label>
              {goalType === 'monthly' ? (
                <input
                  type="month"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border-none rounded-lg text-sm p-2.5"
                />
              ) : (
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border-none rounded-lg text-sm p-2.5"
                >
                  <option value="">기간 선택</option>
                  <option value="2024-Q1">2024년 Q1</option>
                  <option value="2024-Q2">2024년 Q2</option>
                  <option value="2024-Q3">2024년 Q3</option>
                  <option value="2024-Q4">2024년 Q4</option>
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">신규 등록 목표 (명)</label>
                <input
                  type="number"
                  value={targetRegistrations}
                  onChange={(e) => setTargetRegistrations(e.target.value)}
                  placeholder="30"
                  min="0"
                  className="w-full bg-white dark:bg-gray-800 border-none rounded-lg text-sm p-2.5"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">Contact 목표 (건)</label>
                <input
                  type="number"
                  value={targetContacts}
                  onChange={(e) => setTargetContacts(e.target.value)}
                  placeholder="100"
                  min="0"
                  className="w-full bg-white dark:bg-gray-800 border-none rounded-lg text-sm p-2.5"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={resetForm}
                className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold"
              >
                취소
              </button>
              <button
                onClick={handleAddGoal}
                className="flex-1 py-2 bg-primary text-white rounded-lg text-xs font-bold"
              >
                목표 설정
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { setShowAddForm(true); setPeriod(getCurrentPeriod('monthly')); }}
            className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-400 hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            새 목표 추가
          </button>
        )}
      </div>
    </Modal>
  );
};

export default GoalSettingModal;
