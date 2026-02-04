
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';

const OperationalManagement: React.FC = () => {
  const { customers, showToast } = useApp();
  
  const [message, setMessage] = useState(`안녕하세요 {고객명}님, Century 21 이동현 에이전트입니다. 요청하신 매물이 새로 등록되어 안내드립니다.`);
  const [isRecipientListOpen, setIsRecipientListOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [channelTab, setChannelTab] = useState<'sms' | 'email' | 'kakao'>('sms');
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [template, setTemplate] = useState('new_listing');
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [testSendOpen, setTestSendOpen] = useState(false);
  const [aiSuggestionOpen, setAiSuggestionOpen] = useState(false);

  // Get active customers as recipients
  const recipients = useMemo(() => {
    return customers
      .filter(c => c.status === 'ACTIVE')
      .map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        recent: c.lastContact === '-' ? '연락 없음' : `최근 ${c.lastContact}`,
      }));
  }, [customers]);

  // Filter recipients by search
  const filteredRecipients = recipients.filter(r => 
    r.name.includes(searchTerm) || r.phone.includes(searchTerm)
  );

  const selectedCount = selectedRecipients.size;
  const byteCount = new TextEncoder().encode(message).length;

  const toggleRecipient = (id: string) => {
    const newSet = new Set(selectedRecipients);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedRecipients(newSet);
  };

  const selectAllRecipients = () => {
    if (selectedRecipients.size === filteredRecipients.length) {
      setSelectedRecipients(new Set());
    } else {
      setSelectedRecipients(new Set(filteredRecipients.map(r => r.id)));
    }
  };

  const handleTemplateChange = (t: string) => {
    setTemplate(t);
    switch (t) {
      case 'new_listing':
        setMessage('안녕하세요 {고객명}님, Century 21 이동현 에이전트입니다. 요청하신 매물이 새로 등록되어 안내드립니다.');
        break;
      case 'visit_thanks':
        setMessage('안녕하세요 {고객명}님, 오늘 방문해주셔서 감사합니다. 추가 문의사항이 있으시면 언제든 연락주세요. - Century 21 이동현');
        break;
      case 'follow_up':
        setMessage('{고객명}님 안녕하세요, 지난번 상담드린 매물 관련해서 진행 상황 여쭤보려 연락드립니다. 편하신 시간에 회신 부탁드립니다.');
        break;
      default:
        break;
    }
  };

  const handleAISuggestion = () => {
    setAiSuggestionOpen(true);
  };

  const applyAISuggestion = (suggestion: string) => {
    setMessage(suggestion);
    setAiSuggestionOpen(false);
    showToast('AI 추천 문구가 적용되었습니다.', 'success');
  };

  const handleTestSend = () => {
    setTestSendOpen(true);
  };

  const confirmTestSend = () => {
    setTestSendOpen(false);
    showToast('테스트 발송이 완료되었습니다.', 'success');
  };

  const handleSend = () => {
    if (selectedCount === 0) {
      showToast('발송 대상을 선택해주세요.', 'warning');
      return;
    }
    setSendConfirmOpen(true);
  };

  const confirmSend = () => {
    setSendConfirmOpen(false);
    const channelName = channelTab === 'sms' ? 'SMS' : channelTab === 'email' ? '이메일' : '카카오톡 알림';
    showToast(`${selectedCount}명에게 ${channelName}이 발송되었습니다.`, 'success');
    setSelectedRecipients(new Set());
  };

  // 채널별 바이트 제한 (카카오톡은 1000자 제한)
  const getByteLimit = () => {
    switch (channelTab) {
      case 'kakao': return 1000;
      case 'email': return 10000;
      default: return 2000;
    }
  };

  const byteLimit = getByteLimit();

  const insertVariable = (variable: string) => {
    setMessage(prev => prev + variable);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-0 lg:gap-6 lg:-m-8 -m-3 overflow-hidden">
      {/* Recipient Selection - Desktop Sidebar / Mobile Bottom Sheet */}
      <aside className={`
        fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-0 lg:w-80 bg-white dark:bg-[#1A1A1A] 
        lg:border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0 transition-transform duration-300
        ${isRecipientListOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
      `}>
        {/* Mobile Handle */}
        <div className="h-1.5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mt-3 lg:hidden cursor-pointer" onClick={() => setIsRecipientListOpen(false)}></div>
        
        <div className="p-5 lg:p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
          <h3 className="font-black text-sm lg:text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">groups</span>
            발송 대상 ({selectedCount})
          </h3>
          <button onClick={() => setIsRecipientListOpen(false)} className="lg:hidden text-gray-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
            <input 
              type="text" 
              placeholder="검색" 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Select All */}
          <div 
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 cursor-pointer"
            onClick={selectAllRecipients}
          >
            <input 
              type="checkbox" 
              checked={selectedRecipients.size === filteredRecipients.length && filteredRecipients.length > 0}
              onChange={selectAllRecipients}
              className="rounded text-primary focus:ring-primary size-5 border-gray-200 dark:border-gray-700" 
            />
            <span className="text-xs font-bold text-gray-500">전체 선택 ({filteredRecipients.length}명)</span>
          </div>
          
          {filteredRecipients.map((r) => (
            <div 
              key={r.id} 
              className={`flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer ${selectedRecipients.has(r.id) ? 'bg-primary/5 border border-primary/20' : ''}`}
              onClick={() => toggleRecipient(r.id)}
            >
              <input 
                type="checkbox" 
                checked={selectedRecipients.has(r.id)}
                onChange={() => toggleRecipient(r.id)}
                className="rounded text-primary focus:ring-primary size-5 border-gray-200 dark:border-gray-700" 
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate">{r.name}</p>
                <p className="text-[10px] text-gray-400">{r.phone}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 lg:hidden border-t border-gray-100 dark:border-gray-800">
          <button 
            onClick={() => setIsRecipientListOpen(false)}
            className="w-full py-3 bg-secondary text-white rounded-xl text-xs font-bold"
          >
            선택 완료 ({selectedCount}명)
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="flex-1 flex flex-col bg-[#F9F9F7] dark:bg-[#0F0F0F] relative overflow-hidden min-h-0">
        <div className="px-4 lg:px-10 pt-4 lg:pt-8 bg-white dark:bg-[#1A1A1A] border-b border-gray-50 dark:border-gray-800 shrink-0">
          <div className="flex justify-between items-center lg:block">
            <div className="flex gap-4 lg:gap-10">
              <button 
                onClick={() => setChannelTab('sms')}
                className={`border-b-2 lg:border-b-4 pb-3 lg:pb-5 px-1 text-xs lg:text-sm font-black flex items-center gap-1.5 tracking-tighter transition-colors ${channelTab === 'sms' ? 'border-primary text-secondary dark:text-white' : 'border-transparent text-gray-400'}`}
              >
                <span className="material-symbols-outlined text-base lg:text-lg">sms</span> SMS
              </button>
              <button 
                onClick={() => setChannelTab('email')}
                className={`border-b-2 lg:border-b-4 pb-3 lg:pb-5 px-1 text-xs lg:text-sm font-bold flex items-center gap-1.5 tracking-tighter transition-colors ${channelTab === 'email' ? 'border-primary text-secondary dark:text-white' : 'border-transparent text-gray-400'}`}
              >
                <span className="material-symbols-outlined text-base lg:text-lg">mail</span> Email
              </button>
              <button 
                onClick={() => setChannelTab('kakao')}
                className={`border-b-2 lg:border-b-4 pb-3 lg:pb-5 px-1 text-xs lg:text-sm font-bold flex items-center gap-1.5 tracking-tighter transition-colors ${channelTab === 'kakao' ? 'border-primary text-secondary dark:text-white' : 'border-transparent text-gray-400'}`}
              >
                {/* 카카오톡 아이콘 - SVG 사용 */}
                <svg className="w-4 h-4 lg:w-5 lg:h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.89 5.31 4.71 6.74l-.97 3.6c-.11.41.36.74.71.49l4.4-2.94c.38.04.76.11 1.15.11 5.52 0 10-3.58 10-8 0-4.42-4.48-8-10-8z"/>
                </svg>
                <span className="hidden sm:inline">카카오톡</span>
                <span className="sm:hidden">카톡</span>
              </button>
            </div>
            {/* Mobile Tab Toggle for Editor/Preview */}
            <div className="flex lg:hidden bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-2">
              <button 
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1 text-[10px] font-bold rounded ${activeTab === 'editor' ? 'bg-white dark:bg-gray-700 text-primary' : 'text-gray-500'}`}
              >
                편집
              </button>
              <button 
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 text-[10px] font-bold rounded ${activeTab === 'preview' ? 'bg-white dark:bg-gray-700 text-primary' : 'text-gray-500'}`}
              >
                미리보기
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-10 flex flex-col xl:flex-row gap-8 lg:gap-12 custom-scrollbar pb-32 lg:pb-40">
          {/* Editor Side */}
          <div className={`flex-1 max-w-2xl space-y-6 ${activeTab === 'editor' ? 'block' : 'hidden lg:block'}`}>
            <div className="flex justify-between items-end">
              <button 
                onClick={() => setIsRecipientListOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-[10px] font-bold text-secondary dark:text-white shadow-sm"
              >
                <span className="material-symbols-outlined text-primary text-sm">person_add</span>
                대상 선택 ({selectedCount})
              </button>
              <div className="space-y-1 text-right flex-1 lg:flex-none">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  {channelTab === 'kakao' ? '글자수' : 'Bytes'}
                </p>
                <p className={`text-xs font-black ${byteCount > byteLimit ? 'text-red-500' : 'text-primary'}`}>
                  {channelTab === 'kakao' ? message.length : byteCount} / {byteLimit.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2 lg:space-y-3">
              <label className="text-[10px] lg:text-xs font-black text-gray-400 uppercase tracking-widest">메시지 템플릿</label>
              <select 
                className="w-full bg-white dark:bg-gray-800 border-none rounded-xl lg:rounded-2xl p-3 lg:p-4 text-xs lg:text-sm font-bold shadow-sm focus:ring-1 focus:ring-primary"
                value={template}
                onChange={(e) => handleTemplateChange(e.target.value)}
              >
                <option value="new_listing">신규 매물 안내</option>
                <option value="visit_thanks">방문 감사 인사</option>
                <option value="follow_up">후속 연락</option>
              </select>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['{고객명}', '{담당자}', '{매물주소}', '{가격}'].map(p => (
                <button 
                  key={p} 
                  onClick={() => insertVariable(p)}
                  className="px-2 lg:px-3 py-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-[9px] lg:text-[10px] font-bold text-gray-500 hover:text-primary hover:border-primary/50 transition-all shadow-sm"
                >
                  {p}
                </button>
              ))}
              <button 
                onClick={handleAISuggestion}
                className="ml-auto text-primary font-bold text-[10px] flex items-center gap-1 hover:underline"
              >
                <span className="material-symbols-outlined text-xs">auto_awesome</span> AI 추천
              </button>
            </div>

            <div className="space-y-2 lg:space-y-3">
              <textarea 
                className="w-full bg-white dark:bg-gray-800 border-none rounded-xl lg:rounded-2xl p-4 lg:p-6 text-xs lg:text-sm font-medium leading-relaxed shadow-sm focus:ring-1 focus:ring-primary min-h-[180px] lg:min-h-[300px] resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="내용을 입력하세요..."
              />
            </div>
          </div>

          {/* Preview Side */}
          <div className={`w-full xl:w-80 flex-col gap-6 ${activeTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
            <h4 className="text-[10px] lg:text-xs font-black text-gray-400 uppercase tracking-widest text-center lg:text-left">
              {channelTab === 'kakao' ? '카카오톡 미리보기' : '전송 미리보기'}
            </h4>
            <div className="relative mx-auto w-full max-w-[220px] lg:max-w-[280px]">
              {/* 카카오톡 미리보기 */}
              {channelTab === 'kakao' ? (
                <>
                  <div className="absolute inset-0 -m-1 border-[6px] lg:border-[8px] border-[#391B1B] rounded-[36px] lg:rounded-[48px] shadow-2xl z-20 pointer-events-none"></div>
                  <div className="bg-[#B2C7D9] w-full aspect-[9/18.5] rounded-[30px] lg:rounded-[42px] overflow-hidden flex flex-col shadow-inner relative">
                    {/* 카카오톡 상단 바 */}
                    <div className="bg-[#B2C7D9] px-4 lg:px-6 py-3 lg:py-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] lg:text-[10px] font-black text-gray-700">9:41</span>
                        <div className="flex gap-1 items-center text-gray-700 text-[10px]">
                          <span className="material-symbols-outlined text-[10px] lg:text-[12px]">signal_cellular_4_bar</span>
                          <span className="material-symbols-outlined text-[10px] lg:text-[12px]">battery_full</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="material-symbols-outlined text-gray-600 text-sm">arrow_back</span>
                        <span className="text-[10px] lg:text-xs font-bold text-gray-800">Century 21 부동산</span>
                        <span className="material-symbols-outlined text-gray-600 text-sm">search</span>
                      </div>
                    </div>
                    {/* 채팅 영역 */}
                    <div className="flex-1 p-3 lg:p-4 overflow-hidden">
                      <div className="flex gap-2 items-end">
                        {/* 프로필 이미지 */}
                        <div className="size-8 lg:size-10 rounded-full bg-[#FEE500] flex items-center justify-center shrink-0 shadow-md">
                          <svg className="w-5 h-5 lg:w-6 lg:h-6 text-[#391B1B]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.89 5.31 4.71 6.74l-.97 3.6c-.11.41.36.74.71.49l4.4-2.94c.38.04.76.11 1.15.11 5.52 0 10-3.58 10-8 0-4.42-4.48-8-10-8z"/>
                          </svg>
                        </div>
                        <div className="flex flex-col gap-1 max-w-[75%]">
                          <span className="text-[9px] lg:text-[10px] font-bold text-gray-700 ml-1">Century 21</span>
                          <div className="bg-white p-3 rounded-xl rounded-tl-sm text-[10px] lg:text-[11px] leading-relaxed font-medium shadow-sm text-gray-800 whitespace-pre-wrap break-words">
                            {message.replace('{고객명}', '홍길동')}
                          </div>
                          <span className="text-[8px] text-gray-500 ml-1">오후 2:30</span>
                        </div>
                      </div>
                    </div>
                    {/* 하단 바 */}
                    <div className="bg-white/80 px-3 py-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-gray-400 text-lg">add</span>
                      <div className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-[10px] text-gray-400">메시지 입력</div>
                      <span className="material-symbols-outlined text-gray-400 text-lg">sentiment_satisfied</span>
                    </div>
                    <div className="h-0.5 lg:h-1 w-1/3 bg-gray-400 rounded-full mx-auto mb-1"></div>
                  </div>
                </>
              ) : (
                /* SMS/Email 미리보기 (기존) */
                <>
                  <div className="absolute inset-0 -m-1 border-[6px] lg:border-[8px] border-secondary rounded-[36px] lg:rounded-[48px] shadow-2xl z-20 pointer-events-none"></div>
                  <div className="bg-white dark:bg-black w-full aspect-[9/18.5] rounded-[30px] lg:rounded-[42px] overflow-hidden flex flex-col p-4 lg:p-6 shadow-inner relative">
                    <div className="flex justify-between items-center mb-6 lg:mb-10 pt-2">
                      <span className="text-[8px] lg:text-[10px] font-black dark:text-white">9:41</span>
                      <div className="flex gap-1 items-center dark:text-white text-[10px]">
                        <span className="material-symbols-outlined text-[10px] lg:text-[12px]">signal_cellular_4_bar</span>
                        <span className="material-symbols-outlined text-[10px] lg:text-[12px]">battery_full</span>
                      </div>
                    </div>
                    <div className="space-y-4 lg:space-y-6 flex-1 min-w-0">
                       <div className="flex items-center gap-1.5">
                          <div className="size-5 lg:size-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0"><span className="material-symbols-outlined text-[12px] lg:text-[14px]">person</span></div>
                          <span className="text-[9px] lg:text-[10px] font-black tracking-tight dark:text-white truncate">Century 21</span>
                       </div>
                       <div className="bg-gray-100 dark:bg-gray-800 p-3 lg:p-4 rounded-xl lg:rounded-2xl rounded-tl-none text-[10px] lg:text-[11px] leading-relaxed font-medium shadow-sm dark:text-gray-300 whitespace-pre-wrap break-words">
                          {message.replace('{고객명}', '홍길동')}
                       </div>
                    </div>
                    <div className="h-0.5 lg:h-1 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mt-auto mb-1"></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-30">
          <div className="max-w-4xl mx-auto flex gap-2 lg:gap-4">
            <button 
              onClick={handleTestSend}
              className="flex-1 lg:flex-none lg:px-10 py-3 lg:py-4 border border-gray-200 dark:border-gray-700 rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-black hover:bg-gray-50 transition-all flex items-center justify-center gap-2 uppercase tracking-tighter"
            >
              <span className="material-symbols-outlined text-base">send_time_extension</span> 테스트
            </button>
            <button 
              onClick={handleSend}
              disabled={selectedCount === 0}
              className={`flex-[2] lg:flex-1 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-black shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-tighter ${
                channelTab === 'kakao' 
                  ? 'bg-[#FEE500] text-[#391B1B] shadow-yellow-300/30' 
                  : 'bg-primary text-white shadow-primary/30'
              } ${selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-95'}`}
            >
              {channelTab === 'kakao' ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.89 5.31 4.71 6.74l-.97 3.6c-.11.41.36.74.71.49l4.4-2.94c.38.04.76.11 1.15.11 5.52 0 10-3.58 10-8 0-4.42-4.48-8-10-8z"/>
                </svg>
              ) : (
                <span className="material-symbols-outlined text-base">send</span>
              )}
              {channelTab === 'kakao' ? '카톡 발송' : '지금 발송'} ({selectedCount}명)
            </button>
          </div>
        </div>
      </section>

      {/* Send Confirmation Modal */}
      <Modal isOpen={sendConfirmOpen} onClose={() => setSendConfirmOpen(false)} title="발송 확인" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-bold text-primary">{selectedCount}명</span>에게 {channelTab === 'sms' ? 'SMS' : channelTab === 'email' ? '이메일' : '카카오톡 알림'}을 발송하시겠습니까?
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl text-xs text-gray-500 max-h-32 overflow-y-auto">
            {message.substring(0, 100)}...
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              onClick={() => setSendConfirmOpen(false)}
              className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm"
            >
              취소
            </button>
            <button 
              onClick={confirmSend}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
            >
              발송
            </button>
          </div>
        </div>
      </Modal>

      {/* Test Send Modal */}
      <Modal isOpen={testSendOpen} onClose={() => setTestSendOpen(false)} title="테스트 발송" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {channelTab === 'kakao' 
              ? '테스트 발송할 카카오톡 계정을 입력하세요.' 
              : channelTab === 'email'
              ? '테스트 발송할 이메일 주소를 입력하세요.'
              : '테스트 발송할 번호를 입력하세요.'}
          </p>
          <input 
            type="text"
            placeholder={channelTab === 'kakao' ? 'kakao_id' : channelTab === 'email' ? 'test@email.com' : '010-0000-0000'}
            className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm p-3"
            defaultValue={channelTab === 'kakao' ? 'century21_agent' : channelTab === 'email' ? 'test@century21.com' : '010-1234-5678'}
          />
          <div className="flex gap-3 pt-4">
            <button 
              onClick={() => setTestSendOpen(false)}
              className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm"
            >
              취소
            </button>
            <button 
              onClick={confirmTestSend}
              className="flex-1 py-2.5 bg-secondary text-white rounded-xl font-bold text-sm"
            >
              테스트 발송
            </button>
          </div>
        </div>
      </Modal>

      {/* AI Suggestion Modal */}
      <Modal isOpen={aiSuggestionOpen} onClose={() => setAiSuggestionOpen(false)} title="AI 추천 문구" size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            AI가 추천하는 메시지 문구를 선택하세요.
          </p>
          <div className="space-y-3">
            {[
              '안녕하세요 {고객명}님, 관심 가지셨던 지역에 새로운 매물이 등록되었습니다. 상세 정보가 필요하시면 연락주세요. - Century 21 이동현',
              '{고객명}님, 지난번 상담드린 조건에 딱 맞는 매물을 찾았습니다! 편하신 시간에 함께 방문해보시겠어요? - 이동현 드림',
              '좋은 아침입니다 {고객명}님! 주말 특별 매물 투어를 준비했습니다. 관심 있으시면 답장 부탁드려요. 🏠',
            ].map((suggestion, i) => (
              <button 
                key={i}
                onClick={() => applyAISuggestion(suggestion)}
                className="w-full text-left p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-xs leading-relaxed hover:bg-primary/10 hover:border-primary/50 border border-transparent transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OperationalManagement;
