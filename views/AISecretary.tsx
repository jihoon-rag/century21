
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface Message {
  role: 'ai' | 'user';
  text: string;
  isLoading?: boolean;
}

const AISecretary: React.FC = () => {
  const { customers, contactRecords, showToast } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: '안녕하세요, 이동현 님. 오늘 분석할 데이터가 준비되었습니다. 현재 즉시 관리가 필요한 3명의 핵심 리드가 있습니다. 어떻게 도와드릴까요?' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Calculate dynamic insights from data
  const urgentCustomers = customers.filter(c => c.status === 'ACTIVE' && c.contactDueDays <= 0).length;
  const activeLeads = customers.filter(c => c.status === 'ACTIVE').length;
  const recentContacts = contactRecords.length;

  const insights = [
    { title: '후속 연락', text: `미접촉 고객 ${urgentCustomers}명`, time: '실시간', icon: 'notifications_active', query: '미접촉 고객 현황을 알려줘' },
    { title: '리드 분석', text: `활성 리드 ${activeLeads}명`, time: '실시간', icon: 'analytics', query: '활성 리드를 분석해줘' },
    { title: '연락 기록', text: `총 ${recentContacts}건의 기록`, time: '누적', icon: 'history', query: '최근 연락 기록을 요약해줘' },
  ];

  const quickQuestions = [
    { label: '요약', query: '오늘의 업무 현황을 요약해줘' },
    { label: '매물추천', query: '고객에게 추천할 매물을 찾아줘' },
    { label: '리드분석', query: '우선순위가 높은 리드를 분석해줘' },
    { label: '문자초안', query: '고객 안내 문자 초안을 작성해줘' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate AI response
  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('요약') || lowerMessage.includes('현황')) {
      return `📊 오늘의 업무 현황입니다:\n\n• 전체 고객: ${customers.length}명\n• 활성 고객: ${activeLeads}명\n• 긴급 후속관리 필요: ${urgentCustomers}명\n• 오늘 등록된 연락기록: ${recentContacts}건\n\n우선적으로 ${urgentCustomers}명의 미접촉 고객에게 연락하시는 것을 권장드립니다.`;
    }
    
    if (lowerMessage.includes('리드') || lowerMessage.includes('분석')) {
      const topLeads = customers.filter(c => c.tier).slice(0, 3);
      return `🎯 우선순위 높은 리드 분석:\n\n${topLeads.map((c, i) => `${i+1}. ${c.name} (${c.tier || '일반'})\n   - 연락 도래: ${c.contactDueDays > 0 ? `+${c.contactDueDays}일` : c.contactDueDays === 0 ? '오늘' : `${c.contactDueDays}일 지남`}\n   - 상태: ${c.status === 'ACTIVE' ? '활성' : '비활성'}`).join('\n\n')}\n\n💡 Tip: 연락 도래일이 지난 고객부터 우선 연락하세요.`;
    }
    
    if (lowerMessage.includes('매물') || lowerMessage.includes('추천')) {
      return `🏠 고객 맞춤 매물 추천:\n\n고객 선호도 분석 결과:\n\n1. 강남구 선호 고객 - 3명\n   → 삼성동 타워팰리스 전세 추천\n\n2. 서초구 선호 고객 - 2명\n   → 반포자이 아파트 매매 추천\n\n3. 송파구 선호 고객 - 4명\n   → 잠실 엘스 전세 추천\n\n각 고객에게 맞춤 안내 문자를 보내시겠어요?`;
    }
    
    if (lowerMessage.includes('문자') || lowerMessage.includes('초안')) {
      return `📝 고객 안내 문자 초안:\n\n안녕하세요, {고객명}님.\nCentury 21 이동현 에이전트입니다.\n\n관심 가지셨던 매물과 유사한 신규 물건이 등록되어 안내드립니다.\n\n📍 위치: 강남구 삼성동\n💰 가격: 전세 8억\n📐 면적: 84㎡ (25평형)\n\n자세한 정보가 필요하시면 언제든 연락주세요.\n감사합니다.\n\n---\n\n이 초안을 발송 대상에게 전송하시겠어요?`;
    }
    
    if (lowerMessage.includes('연락') || lowerMessage.includes('기록')) {
      const recentRecordsList = contactRecords.slice(0, 5);
      return `📞 최근 연락 기록 요약:\n\n${recentRecordsList.map(r => {
        const customer = customers.find(c => c.id === r.customerId);
        return `• ${customer?.name || '알 수 없음'} (${r.date})\n  - ${r.type === 'call' ? '전화' : r.type === 'visit' ? '방문' : r.type === 'message' ? '문자' : '이메일'}: ${r.note}`;
      }).join('\n\n')}\n\n총 ${recentContacts}건의 연락 기록이 있습니다.`;
    }
    
    if (lowerMessage.includes('안녕') || lowerMessage.includes('하이')) {
      return `안녕하세요! 무엇을 도와드릴까요? 😊\n\n다음과 같은 업무를 도와드릴 수 있어요:\n• 오늘의 업무 현황 요약\n• 우선순위 리드 분석\n• 고객 맞춤 매물 추천\n• 안내 문자 초안 작성\n\n궁금한 점이 있으시면 편하게 물어보세요!`;
    }
    
    return `네, 말씀하신 "${userMessage}"에 대해 분석해드릴게요.\n\n현재 ${customers.length}명의 고객 데이터를 바탕으로 살펴보면:\n\n• 활성 고객 중 ${urgentCustomers}명이 즉시 연락이 필요합니다.\n• 이번 주 예정된 미팅: 2건\n• 추천 드릴 신규 매물: 5건\n\n더 자세한 정보가 필요하시면 말씀해주세요!`;
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const userMessage = inputText.trim();
    setInputText('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage);
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickQuestion = (query: string) => {
    setInputText(query);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'user', text: query }]);
      setIsTyping(true);
      
      setTimeout(() => {
        const aiResponse = generateAIResponse(query);
        setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000);
    }, 100);
    setInputText('');
  };

  const handleInsightClick = (query: string) => {
    handleQuickQuestion(query);
  };

  const handleMicClick = () => {
    showToast('음성 입력 기능은 준비 중입니다.', 'info');
  };

  const handleAttachClick = () => {
    showToast('파일 첨부 기능은 준비 중입니다.', 'info');
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-0 lg:gap-6 lg:-m-8 -m-3 overflow-hidden">
      {/* Sidebar Insights */}
      <aside className="w-full lg:w-80 bg-white dark:bg-[#1A1A1A] border-b lg:border-r lg:border-b-0 border-gray-100 dark:border-gray-800 flex flex-col shrink-0 max-h-[120px] lg:max-h-full overflow-hidden">
        <div className="p-4 lg:p-8 border-b border-gray-50 dark:border-gray-800 hidden lg:block">
          <h3 className="text-xl font-black">스마트 인사이트</h3>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Analysis & Tasks</p>
        </div>
        
        <div className="flex-1 overflow-x-auto p-3 flex lg:flex-col gap-2.5 custom-scrollbar items-center lg:items-stretch bg-gray-50/50 dark:bg-gray-900/20 lg:bg-transparent">
          {insights.map((insight, idx) => (
            <div 
              key={idx} 
              onClick={() => handleInsightClick(insight.query)}
              className="min-w-[160px] lg:min-w-0 p-3 lg:p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 lg:bg-gray-50/30 lg:dark:bg-gray-900/30 shadow-sm lg:shadow-none shrink-0 flex flex-col justify-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-2 text-primary mb-1">
                <span className="material-symbols-outlined text-sm lg:text-xl">{insight.icon}</span>
                <span className="font-black text-[9px] lg:text-xs text-gray-900 dark:text-white uppercase truncate">{insight.title}</span>
              </div>
              <p className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400 font-bold truncate">{insight.text}</p>
              <div className="mt-1.5 hidden lg:flex items-center justify-between">
                <span className="text-[8px] lg:text-[9px] text-gray-400">{insight.time}</span>
                <span className="material-symbols-outlined text-gray-300 text-sm">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Interface */}
      <section className="flex-1 flex flex-col bg-[#FDFDFB] dark:bg-[#0F0F0F] relative overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto p-4 lg:p-12 space-y-6 lg:space-y-8 custom-scrollbar pb-32 lg:pb-40">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 lg:gap-4 max-w-3xl ${msg.role === 'user' ? 'flex-row-reverse self-end ml-auto' : ''}`}>
              <div className={`size-8 lg:size-10 rounded-lg shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'ai' ? 'bg-secondary text-primary' : 'bg-primary text-white'}`}>
                <span className="material-symbols-outlined text-base lg:text-xl">{msg.role === 'ai' ? 'auto_awesome' : 'person'}</span>
              </div>
              <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : ''}`}>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{msg.role === 'ai' ? 'AI Assistant' : '나'}</span>
                <div className={`p-3 lg:p-5 rounded-xl shadow-sm text-xs lg:text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'ai' ? 'bg-white dark:bg-gray-800 rounded-tl-none border border-gray-50 dark:border-gray-700' : 'bg-secondary text-white rounded-tr-none'}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 lg:gap-4 max-w-3xl">
              <div className="size-8 lg:size-10 rounded-lg shrink-0 flex items-center justify-center shadow-sm bg-secondary text-primary">
                <span className="material-symbols-outlined text-base lg:text-xl">auto_awesome</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">AI Assistant</span>
                <div className="p-3 lg:p-5 rounded-xl shadow-sm bg-white dark:bg-gray-800 rounded-tl-none border border-gray-50 dark:border-gray-700">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 p-3 lg:p-8 z-30">
          <div className="max-w-4xl mx-auto space-y-3 lg:space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {quickQuestions.map((q) => (
                <button 
                  key={q.label}
                  onClick={() => handleQuickQuestion(q.query)}
                  className="whitespace-nowrap px-3 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full text-[9px] font-bold text-gray-500 hover:text-primary hover:border-primary/50 transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center gap-2">
                <button onClick={handleMicClick} className="text-gray-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg lg:text-xl">mic</span>
                </button>
                <button onClick={handleAttachClick} className="text-gray-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg lg:text-xl">add_circle</span>
                </button>
              </div>
              <input 
                type="text" 
                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl py-3 lg:py-5 pl-20 lg:pl-32 pr-14 focus:ring-1 focus:ring-primary text-xs lg:text-sm shadow-inner"
                placeholder="무엇이든 물어보세요..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={!inputText.trim()}
                className={`absolute right-2 bg-secondary text-primary size-9 lg:size-12 rounded-lg flex items-center justify-center shadow-lg transition-all ${inputText.trim() ? 'hover:bg-primary hover:text-white' : 'opacity-50 cursor-not-allowed'}`}
              >
                <span className="material-symbols-outlined font-black text-lg">arrow_upward</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AISecretary;
