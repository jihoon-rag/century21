
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';

const MasterAdmin: React.FC = () => {
  const { showToast } = useApp();
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [pushNotificationModalOpen, setPushNotificationModalOpen] = useState(false);
  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushTargetType, setPushTargetType] = useState<'all' | 'selected'>('all');
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  
  const kpis = [
    { label: '총 매출', value: '₩1.24B', fullValue: '₩1,240,000,000', change: '+12.5%', color: 'text-green-500' },
    { label: '활성 중개사', value: '156명', fullValue: '156명', change: '+3.2%', color: 'text-green-500' },
    { label: '전체 고객 DB', value: '12,450', fullValue: '12,450명', change: '+5.8%', color: 'text-green-500' },
    { label: '메시지 발송', value: '45.2K', fullValue: '45,200건', change: '-2.1%', color: 'text-red-500' },
  ];

  const pieData = [
    { name: '상위 그룹 (A)', value: 75, fill: '#BEA05E' },
    { name: '중위 그룹 (B)', value: 15, fill: '#1A1A1A' },
    { name: '하위 그룹 (C)', value: 10, fill: '#E5E7EB' },
  ];

  const agentActivity = [
    { name: '김태리 중개사', date: '2023.10.12', clients: 142, status: '온라인' },
    { name: '이정재 지점장', date: '2023.08.05', clients: 285, status: '2시간 전' },
    { name: '한지민 중개사', date: '2024.01.20', clients: 64, status: '온라인' },
  ];

  const notices = [
    { date: '2024.05.28', title: '시스템 정기 점검 안내 (06/01 02:00~04:00)', content: '서버 안정성 개선을 위한 정기 점검이 예정되어 있습니다.' },
    { date: '2024.05.25', title: '대시보드 신규 리포트 기능 업데이트 안내', content: '월간 성과 리포트 자동 생성 기능이 추가되었습니다.' },
    { date: '2024.05.20', title: '모바일 앱 업데이트 v2.5.0', content: 'AI 비서 기능이 개선되었습니다.' },
  ];

  const handleDownloadReport = () => {
    showToast('보고서 다운로드가 시작됩니다.', 'success');
  };

  // 알림 푸시 모달 초기화 및 열기
  const openPushModal = () => {
    setPushTitle('');
    setPushMessage('');
    setPushTargetType('all');
    setSelectedAgents(new Set());
    setPushNotificationModalOpen(true);
  };

  // 중개사 선택 토글
  const toggleAgentSelection = (name: string) => {
    const newSet = new Set(selectedAgents);
    if (newSet.has(name)) {
      newSet.delete(name);
    } else {
      newSet.add(name);
    }
    setSelectedAgents(newSet);
  };

  // 알림 푸시 전송
  const handleSendPushNotification = () => {
    if (!pushTitle.trim() || !pushMessage.trim()) {
      showToast('제목과 내용을 입력해주세요.', 'warning');
      return;
    }
    if (pushTargetType === 'selected' && selectedAgents.size === 0) {
      showToast('발송 대상을 선택해주세요.', 'warning');
      return;
    }
    
    const targetCount = pushTargetType === 'all' ? agentActivity.length : selectedAgents.size;
    setPushNotificationModalOpen(false);
    showToast(`${targetCount}명의 중개사에게 알림이 발송되었습니다.`, 'success');
    
    // 상태 초기화
    setPushTitle('');
    setPushMessage('');
    setSelectedAgents(new Set());
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 lg:gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-black tracking-tighter">마스터 관리자 대시보드</h2>
          <p className="text-gray-400 font-medium mt-1 uppercase text-[10px] lg:text-xs tracking-widest">Agency Operations & System Metrics</p>
        </div>
        <div className="flex gap-2 lg:gap-3 w-full lg:w-auto">
          <button 
            onClick={() => setDateModalOpen(true)}
            className="flex-1 lg:flex-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 lg:px-6 py-2 lg:py-2.5 rounded-xl font-bold text-[10px] lg:text-sm shadow-sm flex items-center justify-center gap-1 lg:gap-2"
          >
            <span className="material-symbols-outlined text-base lg:text-lg">calendar_today</span> 
            <span className="hidden sm:inline">2024.05.01 - 2024.05.31</span>
            <span className="sm:hidden">5월</span>
          </button>
          <button 
            onClick={handleDownloadReport}
            className="flex-1 lg:flex-none bg-primary text-white px-3 lg:px-8 py-2 lg:py-2.5 rounded-xl font-black text-[10px] lg:text-sm shadow-lg shadow-primary/30 flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-base lg:hidden">download</span>
            <span className="hidden lg:inline">보고서 다운로드</span>
            <span className="lg:hidden">다운로드</span>
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1A1A1A] p-4 lg:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-1 lg:gap-2 group hover:shadow-xl transition-all">
            <div className="flex justify-between items-start">
              <span className="text-[9px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</span>
              <span className={`text-[8px] lg:text-[10px] font-black px-1.5 lg:px-2 py-0.5 rounded ${kpi.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{kpi.change}</span>
            </div>
            <p className="text-lg lg:text-2xl font-black tracking-tight">
              <span className="lg:hidden">{kpi.value}</span>
              <span className="hidden lg:inline">{kpi.fullValue}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Usage Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1A1A1A] p-4 lg:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 lg:space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-sm lg:text-lg font-black">일일 활성 중개사 수 (DAU)</h3>
            <span className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">Weekly Active Users</span>
          </div>
          <div className="h-48 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{n:'월',v:30},{n:'화',v:45},{n:'수',v:85},{n:'목',v:60},{n:'금',v:95},{n:'토',v:40},{n:'일',v:25}]}>
                <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{fontSize:10, fontWeight:700, fill:'#9CA3AF'}} />
                <Tooltip cursor={{fill:'#F9FBFB'}} />
                <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                  {[0,1,2,3,4,5,6].map(i => <Cell key={i} fill={i === 4 ? '#BEA05E' : '#F3F4F6'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl lg:rounded-2xl overflow-hidden">
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h4 className="font-bold text-xs lg:text-sm">소속 중개사 활동 현황</h4>
              <button className="text-[9px] lg:text-[10px] font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest">전체보기</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] lg:text-xs min-w-[400px]">
                <thead className="bg-gray-100 dark:bg-gray-800 text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-4 lg:px-6 py-2 lg:py-3">중개사 성명</th>
                    <th className="px-4 lg:px-6 py-2 lg:py-3 hidden sm:table-cell">등록일</th>
                    <th className="px-4 lg:px-6 py-2 lg:py-3">보유 고객</th>
                    <th className="px-4 lg:px-6 py-2 lg:py-3">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {agentActivity.map((agent, i) => (
                    <tr key={i} className="hover:bg-white dark:hover:bg-gray-800 transition-colors">
                      <td className="px-4 lg:px-6 py-3 lg:py-4 font-bold">{agent.name}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-400 hidden sm:table-cell">{agent.date}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 font-black">{agent.clients}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4">
                        <span className={`flex items-center gap-1 lg:gap-2 font-bold text-[10px] lg:text-xs ${agent.status === '온라인' ? 'text-green-500' : 'text-gray-400'}`}>
                          <span className={`w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full ${agent.status === '온라인' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          {agent.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-4 lg:space-y-6">
          {/* 소속 중개사 알림 푸시 카드 */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-4 lg:p-6 rounded-2xl border border-primary/20 shadow-sm">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="font-bold text-sm lg:text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg lg:text-xl">campaign</span>
                소속 중개사 알림
              </h3>
            </div>
            <p className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400 mb-4">
              소속 공인중개사들에게 공지사항, 업무 지시, 중요 안내 등을 실시간으로 전달할 수 있습니다.
            </p>
            <button 
              onClick={openPushModal}
              className="w-full py-2.5 lg:py-3 bg-primary text-white rounded-xl font-bold text-xs lg:text-sm shadow-lg shadow-primary/30 hover:brightness-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base lg:text-lg">send</span>
              알림 보내기
            </button>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] p-4 lg:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
            <h3 className="text-sm lg:text-lg font-black mb-4 lg:mb-6">중개사별 고객 분포</h3>
            <div className="flex-1 flex flex-col justify-center">
              <div className="h-48 lg:h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl lg:text-3xl font-black">75%</span>
                  <span className="text-[8px] lg:text-[9px] font-bold text-gray-400 uppercase tracking-widest">상위 10인</span>
                </div>
              </div>
              <div className="mt-4 lg:mt-8 space-y-2 lg:space-y-3">
                {pieData.map(d => (
                  <div key={d.name} className="flex justify-between items-center text-[11px] lg:text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.fill}}></div>
                      <span className="font-medium text-gray-500">{d.name}</span>
                    </div>
                    <span className="font-black">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#1A1A1A] p-4 lg:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 lg:space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm lg:text-lg">공지사항</h3>
                <span className="material-symbols-outlined text-primary text-lg lg:text-xl">notifications</span>
             </div>
             <div className="space-y-3 lg:space-y-4">
                {notices.slice(0, 2).map((notice, i) => (
                  <div key={i} className="space-y-1 cursor-pointer hover:opacity-80" onClick={() => setNoticeModalOpen(true)}>
                    <p className="text-[9px] lg:text-[10px] text-gray-400 font-bold">{notice.date}</p>
                    <p className="text-xs lg:text-sm font-bold truncate">{notice.title}</p>
                  </div>
                ))}
             </div>
             <button 
               onClick={() => setNoticeModalOpen(true)}
               className="w-full py-2.5 lg:py-3 text-[9px] lg:text-[10px] font-bold text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl hover:text-primary transition-all"
             >
               전체 공지 보기
             </button>
          </div>
        </div>
      </div>

      {/* Date Range Modal */}
      <Modal isOpen={dateModalOpen} onClose={() => setDateModalOpen(false)} title="기간 선택" size="sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500">시작일</label>
            <input type="date" defaultValue="2024-05-01" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm p-3" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500">종료일</label>
            <input type="date" defaultValue="2024-05-31" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm p-3" />
          </div>
          <button 
            onClick={() => { setDateModalOpen(false); showToast('기간이 적용되었습니다.', 'success'); }}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm"
          >
            적용
          </button>
        </div>
      </Modal>

      {/* Notice Modal */}
      <Modal isOpen={noticeModalOpen} onClose={() => setNoticeModalOpen(false)} title="공지사항" size="md">
        <div className="space-y-4">
          {notices.map((notice, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-2">
              <p className="text-[10px] text-gray-400 font-bold">{notice.date}</p>
              <p className="text-sm font-bold">{notice.title}</p>
              <p className="text-xs text-gray-500">{notice.content}</p>
            </div>
          ))}
        </div>
      </Modal>

      {/* Push Notification Modal - 소속 중개사 알림 발송 */}
      <Modal isOpen={pushNotificationModalOpen} onClose={() => setPushNotificationModalOpen(false)} title="소속 중개사 알림 발송" size="md">
        <div className="space-y-5">
          {/* 발송 대상 선택 */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">발송 대상</label>
            <div className="flex gap-3">
              <button 
                onClick={() => setPushTargetType('all')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pushTargetType === 'all' 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
                }`}
              >
                전체 중개사 ({agentActivity.length}명)
              </button>
              <button 
                onClick={() => setPushTargetType('selected')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pushTargetType === 'selected' 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
                }`}
              >
                선택 발송
              </button>
            </div>
          </div>

          {/* 선택 발송 시 중개사 목록 */}
          {pushTargetType === 'selected' && (
            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
              {agentActivity.map((agent, i) => (
                <div 
                  key={i}
                  onClick={() => toggleAgentSelection(agent.name)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    selectedAgents.has(agent.name) 
                      ? 'bg-primary/10 border border-primary/30' 
                      : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <input 
                    type="checkbox"
                    checked={selectedAgents.has(agent.name)}
                    onChange={() => toggleAgentSelection(agent.name)}
                    className="rounded text-primary focus:ring-primary size-4"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-bold">{agent.name}</p>
                    <p className="text-[10px] text-gray-400">고객 {agent.clients}명</p>
                  </div>
                  <span className={`text-[10px] font-bold ${agent.status === '온라인' ? 'text-green-500' : 'text-gray-400'}`}>
                    {agent.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 알림 제목 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">알림 제목</label>
            <input 
              type="text"
              placeholder="예: 긴급 공지사항"
              className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm p-3 focus:ring-2 focus:ring-primary"
              value={pushTitle}
              onChange={(e) => setPushTitle(e.target.value)}
            />
          </div>

          {/* 알림 내용 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">알림 내용</label>
            <textarea 
              placeholder="알림 내용을 입력하세요..."
              className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm p-3 min-h-[100px] resize-none focus:ring-2 focus:ring-primary"
              value={pushMessage}
              onChange={(e) => setPushMessage(e.target.value)}
            />
          </div>

          {/* 빠른 템플릿 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">빠른 템플릿</label>
            <div className="flex flex-wrap gap-2">
              {[
                { title: '시스템 점검', message: '오늘 밤 02:00~04:00 시스템 점검이 예정되어 있습니다.' },
                { title: '회의 안내', message: '내일 오전 10시 전체 회의가 있습니다. 본사 회의실로 참석 바랍니다.' },
                { title: '실적 마감', message: '이번 달 실적 마감이 3일 남았습니다. 미제출 건은 서둘러 처리해주세요.' },
              ].map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => { setPushTitle(tpl.title); setPushMessage(tpl.message); }}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-[10px] font-bold text-gray-500 hover:bg-primary/10 hover:text-primary transition-all"
                >
                  {tpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => setPushNotificationModalOpen(false)}
              className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
            >
              취소
            </button>
            <button 
              onClick={handleSendPushNotification}
              className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/30 hover:brightness-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">send</span>
              발송하기
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MasterAdmin;
