
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, CartesianGrid } from 'recharts';
import GoalSettingModal from '../components/GoalSettingModal';

const StatisticsView: React.FC = () => {
  const { customers, contactRecords, goals } = useApp();
  const [periodTab, setPeriodTab] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [weekOffset, setWeekOffset] = useState(0);
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  // Calculate stats from real data
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'ACTIVE').length;
    const inactiveCustomers = customers.filter(c => c.status === 'INACTIVE').length;
    const contactManaged = customers.filter(c => c.contactDueDays <= 14).length;
    const newThisMonth = customers.filter(c => c.isNew).length;

    return [
      { label: '전체 고객 DB', value: totalCustomers.toString(), unit: '명', color: 'text-gray-900 dark:text-white' },
      { label: '활성 고객', value: activeCustomers.toString(), unit: '명', color: 'text-primary' },
      { label: '비활성 고객', value: inactiveCustomers.toString(), unit: '명', color: 'text-gray-400' },
      { label: 'CONTACT 관리', value: contactManaged.toString(), unit: '명', color: 'text-gray-900 dark:text-white' },
      { label: '5월 신규 등록', value: newThisMonth.toString(), unit: '명', color: 'text-blue-500' },
    ];
  }, [customers]);

  // Generate chart data based on period
  const chartData = useMemo(() => {
    if (periodTab === 'weekly') {
      return [
        { name: '월', registrations: 4, contacts: 14 },
        { name: '화', registrations: 2, contacts: 10 },
        { name: '수', registrations: 6, contacts: 12 },
        { name: '목', registrations: 3, contacts: 8 },
        { name: '금', registrations: 5, contacts: 15 },
        { name: '토', registrations: 1, contacts: 3 },
        { name: '일', registrations: 0, contacts: 0 },
      ];
    } else if (periodTab === 'monthly') {
      return [
        { name: '1주', registrations: 12, contacts: 45 },
        { name: '2주', registrations: 18, contacts: 52 },
        { name: '3주', registrations: 15, contacts: 38 },
        { name: '4주', registrations: 21, contacts: 61 },
      ];
    } else {
      return [
        { name: '1월', registrations: 45, contacts: 120 },
        { name: '2월', registrations: 52, contacts: 140 },
        { name: '3월', registrations: 38, contacts: 95 },
        { name: '4월', registrations: 61, contacts: 180 },
        { name: '5월', registrations: 55, contacts: 165 },
      ];
    }
  }, [periodTab]);

  const totalRegistrations = chartData.reduce((sum, d) => sum + d.registrations, 0);
  const totalContacts = chartData.reduce((sum, d) => sum + d.contacts, 0);
  const todayRegistrations = periodTab === 'weekly' ? chartData[2].registrations : chartData[chartData.length - 1].registrations;
  const todayContacts = periodTab === 'weekly' ? chartData[2].contacts : chartData[chartData.length - 1].contacts;

  const getDateLabel = () => {
    const baseDate = new Date(2024, 4, 4); // May 4, 2024
    baseDate.setDate(baseDate.getDate() + weekOffset * 7);
    return `${baseDate.getFullYear()}.${String(baseDate.getMonth() + 1).padStart(2, '0')}.${String(baseDate.getDate()).padStart(2, '0')}`;
  };

  const handlePrevPeriod = () => setWeekOffset(prev => prev - 1);
  const handleNextPeriod = () => setWeekOffset(prev => Math.min(prev + 1, 0));

  // Get current month goal
  const currentMonthGoal = goals.find(g => g.type === 'monthly' && g.period === '2024-05');
  const currentQuarterGoal = goals.find(g => g.type === 'quarterly' && g.period === '2024-Q2');

  const calculateProgress = (actual: number = 0, target: number) => {
    if (target === 0) return 0;
    return Math.min(100, Math.round((actual / target) * 100));
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-black shadow-lg shadow-primary/20 w-fit">통계</span>
        <h2 className="text-xl lg:text-2xl font-black border-l-4 border-primary pl-4">고객 관리 요약</h2>
        <span className="text-[10px] text-gray-400 sm:ml-auto font-bold uppercase tracking-widest">실시간 데이터 업데이트</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-[#1A1A1A] p-4 lg:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm text-center space-y-2 group hover:shadow-xl transition-all">
            <p className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl lg:text-3xl font-black ${s.color}`}>
              {s.value}<span className="text-xs lg:text-sm font-medium ml-1 text-gray-400">{s.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Goal Progress Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl lg:text-2xl font-black border-l-4 border-primary pl-4">목표 달성률</h2>
        <button
          onClick={() => setGoalModalOpen(true)}
          className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"
        >
          <span className="material-symbols-outlined text-sm text-primary">flag</span>
          목표 설정
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Monthly Goal */}
        <div className="bg-white dark:bg-[#1A1A1A] p-4 lg:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded">월간</span>
              <h3 className="font-bold text-sm lg:text-base">2024년 5월 목표</h3>
            </div>
          </div>
          
          {currentMonthGoal ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">신규 등록</span>
                  <span className="font-bold">
                    <span className="text-primary">{currentMonthGoal.actualRegistrations || 0}</span>
                    <span className="text-gray-400"> / {currentMonthGoal.targetRegistrations}명</span>
                  </span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${calculateProgress(currentMonthGoal.actualRegistrations, currentMonthGoal.targetRegistrations) >= 100 ? 'bg-green-500' : 'bg-primary'}`}
                    style={{ width: `${calculateProgress(currentMonthGoal.actualRegistrations, currentMonthGoal.targetRegistrations)}%` }}
                  />
                </div>
                <p className="text-right text-[10px] font-bold text-gray-400">
                  {calculateProgress(currentMonthGoal.actualRegistrations, currentMonthGoal.targetRegistrations)}% 달성
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Contact 기록</span>
                  <span className="font-bold">
                    <span className="text-secondary">{currentMonthGoal.actualContacts || 0}</span>
                    <span className="text-gray-400"> / {currentMonthGoal.targetContacts}건</span>
                  </span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${calculateProgress(currentMonthGoal.actualContacts, currentMonthGoal.targetContacts) >= 100 ? 'bg-green-500' : 'bg-secondary'}`}
                    style={{ width: `${calculateProgress(currentMonthGoal.actualContacts, currentMonthGoal.targetContacts)}%` }}
                  />
                </div>
                <p className="text-right text-[10px] font-bold text-gray-400">
                  {calculateProgress(currentMonthGoal.actualContacts, currentMonthGoal.targetContacts)}% 달성
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <span className="material-symbols-outlined text-3xl mb-2">flag</span>
              <p className="text-xs">월간 목표가 설정되지 않았습니다</p>
              <button
                onClick={() => setGoalModalOpen(true)}
                className="text-primary text-xs font-bold mt-2 hover:underline"
              >
                목표 설정하기
              </button>
            </div>
          )}
        </div>

        {/* Quarterly Goal */}
        <div className="bg-white dark:bg-[#1A1A1A] p-4 lg:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-[10px] font-bold rounded">분기</span>
              <h3 className="font-bold text-sm lg:text-base">2024년 Q2 목표</h3>
            </div>
          </div>
          
          {currentQuarterGoal ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">신규 등록</span>
                  <span className="font-bold">
                    <span className="text-primary">{currentQuarterGoal.actualRegistrations || 0}</span>
                    <span className="text-gray-400"> / {currentQuarterGoal.targetRegistrations}명</span>
                  </span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${calculateProgress(currentQuarterGoal.actualRegistrations, currentQuarterGoal.targetRegistrations) >= 100 ? 'bg-green-500' : 'bg-primary'}`}
                    style={{ width: `${calculateProgress(currentQuarterGoal.actualRegistrations, currentQuarterGoal.targetRegistrations)}%` }}
                  />
                </div>
                <p className="text-right text-[10px] font-bold text-gray-400">
                  {calculateProgress(currentQuarterGoal.actualRegistrations, currentQuarterGoal.targetRegistrations)}% 달성
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Contact 기록</span>
                  <span className="font-bold">
                    <span className="text-secondary">{currentQuarterGoal.actualContacts || 0}</span>
                    <span className="text-gray-400"> / {currentQuarterGoal.targetContacts}건</span>
                  </span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${calculateProgress(currentQuarterGoal.actualContacts, currentQuarterGoal.targetContacts) >= 100 ? 'bg-green-500' : 'bg-secondary'}`}
                    style={{ width: `${calculateProgress(currentQuarterGoal.actualContacts, currentQuarterGoal.targetContacts)}%` }}
                  />
                </div>
                <p className="text-right text-[10px] font-bold text-gray-400">
                  {calculateProgress(currentQuarterGoal.actualContacts, currentQuarterGoal.targetContacts)}% 달성
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <span className="material-symbols-outlined text-3xl mb-2">flag</span>
              <p className="text-xs">분기 목표가 설정되지 않았습니다</p>
              <button
                onClick={() => setGoalModalOpen(true)}
                className="text-primary text-xs font-bold mt-2 hover:underline"
              >
                목표 설정하기
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <h2 className="text-xl lg:text-2xl font-black border-l-4 border-primary pl-4">활동 분석</h2>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 lg:p-1.5 rounded-xl gap-1 w-full sm:w-auto">
          {[
            { key: 'weekly', label: '주간 통계' },
            { key: 'monthly', label: '월간 통계' },
            { key: 'yearly', label: '연간 통계' },
          ].map((t) => (
            <button 
              key={t.key} 
              onClick={() => setPeriodTab(t.key as any)}
              className={`flex-1 sm:flex-none px-4 lg:px-8 py-2 lg:py-2.5 rounded-lg text-[10px] lg:text-xs font-bold transition-all ${periodTab === t.key ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-8">
        <div className="bg-white dark:bg-[#1A1A1A] p-4 lg:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4 lg:gap-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 relative">
             <div className="flex gap-4">
                <div className="text-center">
                   <p className="text-[8px] lg:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Today</p>
                   <p className="text-base lg:text-lg font-black">{todayRegistrations}</p>
                </div>
                <div className="w-px h-8 bg-gray-100 dark:bg-gray-800"></div>
                <div className="text-center">
                   <p className="text-[8px] lg:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{periodTab === 'weekly' ? 'Weekly' : periodTab === 'monthly' ? 'Monthly' : 'Yearly'}</p>
                   <p className="text-base lg:text-lg font-black">{totalRegistrations}</p>
                </div>
             </div>
             <h3 className="text-xs lg:text-sm font-black hidden lg:block lg:absolute lg:left-1/2 lg:-translate-x-1/2">신규 고객 등록</h3>
             <div className="flex items-center gap-2 text-[9px] lg:text-[10px] bg-gray-50 dark:bg-gray-900/50 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full border border-gray-100 dark:border-gray-800 font-bold">
                <button onClick={handlePrevPeriod} className="hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xs">chevron_left</span>
                </button>
                {getDateLabel()}
                <button onClick={handleNextPeriod} disabled={weekOffset >= 0} className={`transition-colors ${weekOffset >= 0 ? 'text-gray-300' : 'hover:text-primary'}`}>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                </button>
             </div>
          </div>
          <div className="h-48 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:10, fontWeight:700, fill:'#9CA3AF'}} />
                <Tooltip cursor={{fill:'#F9FAFB'}} />
                <Bar dataKey="registrations" radius={[4, 4, 0, 0]}>
                  {chartData.map((e, i) => <Cell key={i} fill={e.registrations > 0 ? '#BEA05E' : '#F3F4F6'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-gray-100 dark:border-gray-800 text-[11px] lg:text-xs font-medium leading-relaxed">
            <p className="font-black text-gray-900 dark:text-white">이동현 님은 오늘 <span className="text-primary underline">{todayRegistrations}명의 신규 고객</span>을 등록했어요!</p>
            <p className="text-gray-400 mt-2">이번 {periodTab === 'weekly' ? '주' : periodTab === 'monthly' ? '달' : '해'} 누적 <span className="font-black text-gray-600 dark:text-gray-200">{totalRegistrations}명</span>의 신규 고객을 등록했고, <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">5월 누적 총 92명</span>을 등록하셨네요!</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] p-4 lg:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4 lg:gap-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 relative">
             <div className="flex gap-4">
                <div className="text-center">
                   <p className="text-[8px] lg:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Today</p>
                   <p className="text-base lg:text-lg font-black">{todayContacts}</p>
                </div>
                <div className="w-px h-8 bg-gray-100 dark:bg-gray-800"></div>
                <div className="text-center">
                   <p className="text-[8px] lg:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{periodTab === 'weekly' ? 'Weekly' : periodTab === 'monthly' ? 'Monthly' : 'Yearly'}</p>
                   <p className="text-base lg:text-lg font-black">{totalContacts}</p>
                </div>
             </div>
             <h3 className="text-xs lg:text-sm font-black hidden lg:block lg:absolute lg:left-1/2 lg:-translate-x-1/2">CONTACT 기록 업데이트</h3>
             <div className="flex items-center gap-2 text-[9px] lg:text-[10px] bg-gray-50 dark:bg-gray-900/50 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full border border-gray-100 dark:border-gray-800 font-bold">
                <button onClick={handlePrevPeriod} className="hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xs">chevron_left</span>
                </button>
                {getDateLabel()}
                <button onClick={handleNextPeriod} disabled={weekOffset >= 0} className={`transition-colors ${weekOffset >= 0 ? 'text-gray-300' : 'hover:text-primary'}`}>
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                </button>
             </div>
          </div>
          <div className="h-48 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:10, fontWeight:700, fill:'#9CA3AF'}} />
                <Tooltip cursor={{fill:'#F9FAFB'}} />
                <Bar dataKey="contacts" radius={[4, 4, 0, 0]}>
                  {chartData.map((e, i) => <Cell key={i} fill={e.contacts > 0 ? '#1A1A1A' : '#F3F4F6'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-gray-100 dark:border-gray-800 text-[11px] lg:text-xs font-medium leading-relaxed">
            <p className="font-black text-gray-900 dark:text-white">이동현 님은 오늘 <span className="text-primary underline">{todayContacts}건의 CONTACT 기록</span>을 업데이트 했어요!</p>
            <p className="text-gray-400 mt-2">이번 {periodTab === 'weekly' ? '주' : periodTab === 'monthly' ? '달' : '해'} 누적 <span className="font-black text-gray-600 dark:text-gray-200">{totalContacts}건</span>을 업데이트 했고, <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">5월 누적 총 120건</span>을 업데이트 하셨네요!</p>
          </div>
        </div>
      </div>

      {/* Goal Setting Modal */}
      <GoalSettingModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
      />
    </div>
  );
};

export default StatisticsView;
