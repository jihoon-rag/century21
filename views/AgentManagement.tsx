
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';

const AgentManagement: React.FC = () => {
  const { showToast } = useApp();
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [addAgentModalOpen, setAddAgentModalOpen] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());

  const agents = [
    { id: '1', name: '김태호', branch: '강남본점', role: '팀장', agentId: 'C21-2024001', phone: '010-1234-5678', clients: 142, status: '활성', tier: 'Platinum Elite' },
    { id: '2', name: '이미연', branch: '서초 지점', role: '수석', agentId: 'C21-2024024', phone: '010-9876-5432', clients: 89, status: '활성', tier: 'Gold Medal' },
    { id: '3', name: '박준영', branch: '송파 지점', role: '주임', agentId: 'C21-2024105', phone: '010-5555-1212', clients: 12, status: '대기', tier: 'Silver Link' },
    { id: '4', name: '최수지', branch: '마포 지점', role: '실장', agentId: 'C21-2023998', phone: '010-8888-9999', clients: 205, status: '비활성', tier: 'Platinum Elite' },
  ];

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesBranch = selectedBranch === 'all' || agent.branch === selectedBranch;
      const matchesTier = selectedTiers.length === 0 || selectedTiers.includes(agent.tier);
      return matchesBranch && matchesTier;
    });
  }, [selectedBranch, selectedTiers]);

  const toggleTierFilter = (tier: string) => {
    setSelectedTiers(prev => 
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    );
  };

  const toggleAgentSelection = (id: string) => {
    const newSet = new Set(selectedAgentIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedAgentIds(newSet);
  };

  const handleAddAgent = () => {
    setAddAgentModalOpen(false);
    showToast('신규 중개사가 등록되었습니다.', 'success');
  };

  const handleBulkPermission = () => {
    if (selectedAgentIds.size === 0) {
      showToast('권한을 변경할 중개사를 선택해주세요.', 'warning');
      return;
    }
    setPermissionModalOpen(true);
  };

  const applyPermission = () => {
    setPermissionModalOpen(false);
    showToast(`${selectedAgentIds.size}명의 권한이 변경되었습니다.`, 'success');
    setSelectedAgentIds(new Set());
  };

  const activeAgents = agents.filter(a => a.status === '활성').length;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-4xl font-black tracking-tighter">소속 중개사 관리</h2>
          <p className="text-gray-400 font-medium mt-1 text-xs lg:text-sm">전체 지점의 중개사 명단을 관리하고 권한을 설정합니다.</p>
        </div>
        <div className="flex gap-2 lg:gap-3">
          <button 
            onClick={handleBulkPermission}
            className="flex-1 lg:flex-none bg-gray-100 dark:bg-gray-800 px-3 lg:px-6 py-2 lg:py-3 rounded-xl font-bold text-[10px] lg:text-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-1 lg:gap-2"
          >
            <span className="material-symbols-outlined text-base lg:text-lg">admin_panel_settings</span> 
            <span className="hidden sm:inline">권한 일괄 변경</span>
            <span className="sm:hidden">권한</span>
          </button>
          <button 
            onClick={() => setAddAgentModalOpen(true)}
            className="flex-1 lg:flex-none bg-primary text-white px-3 lg:px-8 py-2 lg:py-3 rounded-xl font-black text-[10px] lg:text-sm shadow-lg shadow-primary/30 flex items-center justify-center gap-1 lg:gap-2"
          >
            <span className="material-symbols-outlined text-base lg:text-lg">person_add</span> 
            <span className="hidden sm:inline">신규 중개사 등록</span>
            <span className="sm:hidden">등록</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 space-y-4 lg:space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] p-4 lg:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 lg:space-y-6">
            <h3 className="font-bold text-sm lg:text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg lg:text-xl">filter_alt</span> 상세 필터
            </h3>
            <div className="space-y-4 lg:space-y-6">
              <div className="space-y-2">
                <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest">지점 선택</p>
                <select 
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-xs p-3 font-bold focus:ring-1 focus:ring-primary"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  <option value="all">전체 지점</option>
                  <option value="강남본점">강남본점</option>
                  <option value="서초 지점">서초 지점</option>
                  <option value="송파 지점">송파 지점</option>
                  <option value="마포 지점">마포 지점</option>
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest">성과 등급</p>
                <div className="space-y-2 lg:space-y-3">
                  {['Platinum Elite', 'Gold Medal', 'Silver Link'].map(tier => (
                    <label key={tier} className="flex items-center gap-2 lg:gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedTiers.includes(tier)}
                        onChange={() => toggleTierFilter(tier)}
                        className="rounded-lg text-primary focus:ring-primary size-4 lg:size-5 border-gray-100 dark:border-gray-700" 
                      />
                      <span className="text-xs lg:text-sm font-medium group-hover:text-primary transition-all">{tier}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-primary/10 border border-primary/30 p-4 lg:p-6 rounded-2xl shadow-sm text-center">
            <p className="text-[10px] lg:text-xs font-bold text-[#7A6E2E] uppercase tracking-widest mb-1">현재 활성 중개사</p>
            <p className="text-2xl lg:text-3xl font-black text-secondary dark:text-white">{activeAgents}<span className="text-xs lg:text-sm font-medium ml-1">명</span></p>
            <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-primary/20 flex justify-between items-center text-[9px] lg:text-[10px] font-black text-[#7A6E2E] uppercase">
              <span>지난 달 대비</span>
              <span className="text-green-600 flex items-center"><span className="material-symbols-outlined text-xs">arrow_upward</span> 12%</span>
            </div>
          </div>
        </aside>

        {/* Table Content */}
        <div className="flex-1 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                  <th className="px-3 lg:px-6 py-3 lg:py-4"><input type="checkbox" className="rounded text-primary size-3 lg:size-4" /></th>
                  <th className="px-3 lg:px-6 py-3 lg:py-4">중개사 정보</th>
                  <th className="px-3 lg:px-6 py-3 lg:py-4 hidden sm:table-cell">사번</th>
                  <th className="px-3 lg:px-6 py-3 lg:py-4">보유 고객</th>
                  <th className="px-3 lg:px-6 py-3 lg:py-4">상태</th>
                  <th className="px-3 lg:px-6 py-3 lg:py-4 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filteredAgents.map((agent) => (
                  <tr key={agent.id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer group ${selectedAgentIds.has(agent.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-3 lg:px-6 py-3 lg:py-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedAgentIds.has(agent.id)}
                        onChange={() => toggleAgentSelection(agent.id)}
                        className="rounded text-primary size-3 lg:size-4" 
                      />
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <div className="flex items-center gap-2 lg:gap-4">
                        <div className="size-8 lg:size-10 rounded-full bg-gray-200 shrink-0 flex items-center justify-center text-gray-400 text-[10px] lg:text-xs font-bold">
                          {agent.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs lg:text-sm font-black">{agent.name}</p>
                          <p className="text-[9px] lg:text-[10px] text-gray-400 font-bold">{agent.branch} · {agent.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 text-[11px] lg:text-sm font-bold text-gray-600 dark:text-gray-300 hidden sm:table-cell">{agent.agentId}</td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm font-black text-secondary dark:text-white">{agent.clients}</td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <span className={`px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-[8px] lg:text-[10px] font-black tracking-widest uppercase ${
                        agent.status === '활성' ? 'bg-green-100 text-green-700' : 
                        agent.status === '대기' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 text-right">
                      <button 
                        onClick={() => showToast(`${agent.name} 설정 열기`, 'info')}
                        className="material-symbols-outlined text-gray-400 hover:text-primary transition-all text-lg lg:text-xl"
                      >
                        settings
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 lg:px-6 py-3 lg:py-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-[10px] lg:text-xs font-bold text-gray-400 tracking-tighter uppercase">
              {filteredAgents.length}명 표시 중
            </span>
            <div className="flex gap-1">
               <button className="w-7 lg:w-8 h-7 lg:h-8 rounded-lg bg-primary text-white font-black text-[10px] lg:text-xs">1</button>
               <button className="w-7 lg:w-8 h-7 lg:h-8 rounded-lg text-[10px] lg:text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700">2</button>
               <button className="w-7 lg:w-8 h-7 lg:h-8 rounded-lg text-[10px] lg:text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700">3</button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Agent Modal */}
      <Modal isOpen={addAgentModalOpen} onClose={() => setAddAgentModalOpen(false)} title="신규 중개사 등록" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">이름</label>
              <input type="text" placeholder="이름" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm p-3" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">연락처</label>
              <input type="text" placeholder="010-0000-0000" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm p-3" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">소속 지점</label>
              <select className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm p-3">
                <option>강남본점</option>
                <option>서초 지점</option>
                <option>송파 지점</option>
                <option>마포 지점</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">직급</label>
              <select className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm p-3">
                <option>주임</option>
                <option>수석</option>
                <option>팀장</option>
                <option>실장</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              onClick={() => setAddAgentModalOpen(false)}
              className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm"
            >
              취소
            </button>
            <button 
              onClick={handleAddAgent}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
            >
              등록
            </button>
          </div>
        </div>
      </Modal>

      {/* Permission Modal */}
      <Modal isOpen={permissionModalOpen} onClose={() => setPermissionModalOpen(false)} title="권한 일괄 변경" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-bold text-primary">{selectedAgentIds.size}명</span>의 중개사 권한을 변경합니다.
          </p>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500">새 권한 설정</label>
            <select className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm p-3">
              <option>일반 중개사</option>
              <option>수석 중개사</option>
              <option>팀장</option>
              <option>지점장</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              onClick={() => setPermissionModalOpen(false)}
              className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm"
            >
              취소
            </button>
            <button 
              onClick={applyPermission}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
            >
              적용
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AgentManagement;
