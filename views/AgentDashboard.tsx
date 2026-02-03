
import React, { useState } from 'react';
import { ViewType } from '../types';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import ContactRecordModal from '../components/ContactRecordModal';

interface AgentDashboardProps {
  navigateTo: (view: ViewType, id?: string) => void;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ navigateTo }) => {
  const { todos, toggleTodo, addTodo, customers, scheduleEvents } = useApp();
  const [activeTab, setActiveTab] = useState<'todos' | 'contacts'>('todos');
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(null);

  const weeklyData = [
    { name: '월', registrations: 4, activity: 34 },
    { name: '화', registrations: 7, activity: 42 },
    { name: '수', registrations: 12, activity: 38 },
    { name: '목', registrations: 2, activity: 10 },
    { name: '금', registrations: 0, activity: 5 },
    { name: '토', registrations: 0, activity: 0 },
    { name: '일', registrations: 0, activity: 0 },
  ];

  // Get urgent follow-ups from customer data
  const urgentFollowUps = customers
    .filter(c => c.status === 'ACTIVE' && c.contactDueDays <= 3)
    .sort((a, b) => a.contactDueDays - b.contactDueDays)
    .slice(0, 3)
    .map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone.replace(/(\d{3}-\d{4})-\d{4}/, '$1-****'),
      status: c.contactDueDays === 0 ? 'D-day' : c.contactDueDays > 0 ? `+${c.contactDueDays}일` : `${c.contactDueDays}일`,
      color: c.contactDueDays < 0 ? 'bg-red-500' : c.contactDueDays === 0 ? 'bg-primary' : 'bg-orange-400',
    }));

  const urgentCount = customers.filter(c => c.status === 'ACTIVE' && c.contactDueDays <= 3).length;

  // Get today's todos (first 3)
  const dashboardTodos = todos.slice(0, 3);

  // Get recent contacts for the contacts tab
  const recentContacts = customers.filter(c => c.status === 'ACTIVE').slice(0, 3);

  // Get today's event
  const todayEvent = scheduleEvents.find(e => e.date === '2024-05-22');

  const handleAddTodo = () => {
    if (newTodoTitle.trim()) {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      addTodo({ title: newTodoTitle.trim(), time, completed: false });
      setNewTodoTitle('');
      setShowAddTodo(false);
    }
  };

  const openContactModal = (customerId: string, customerName: string) => {
    setSelectedCustomer({ id: customerId, name: customerName });
    setContactModalOpen(true);
  };

  return (
    <div className="space-y-4 lg:space-y-8">
      {/* Top Section Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8">
        {/* Calendar Summary */}
        <div 
          className="bg-white dark:bg-[#1A1A1A] p-4 lg:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden order-1 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigateTo('SCHEDULE')}
        >
          <div className="flex justify-between items-center mb-4 lg:mb-6">
            <h3 className="font-bold text-xs lg:text-base">활동 일정</h3>
            <span className="text-[9px] font-bold text-gray-400 uppercase">2024.05</span>
          </div>
          <div className="grid grid-cols-7 text-center text-[9px] font-bold text-gray-400 mb-2 uppercase tracking-tighter">
            {['일','월','화','수','목','금','토'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1 lg:gap-y-2 text-center text-[11px] lg:text-xs">
            {Array.from({ length: 31 }, (_, i) => {
              const hasEvent = scheduleEvents.some(e => e.date === `2024-05-${String(i + 1).padStart(2, '0')}`);
              return (
                <div 
                  key={i} 
                  className={`py-1.5 lg:py-2 rounded-lg cursor-pointer transition-all relative ${i+1 === 22 ? 'bg-primary text-white font-bold shadow-lg shadow-primary/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  {i + 1}
                  {hasEvent && i+1 !== 22 && <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>}
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0"></div>
            <p className="text-[10px] lg:text-[11px] font-bold truncate">
              {todayEvent ? `${todayEvent.time} ${todayEvent.title}` : '오늘 일정이 없습니다'}
            </p>
          </div>
        </div>

        {/* To-Do List / Contacts */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col order-3 md:order-2 xl:order-2">
          <div className="flex border-b border-gray-50 dark:border-gray-800">
            <button 
              onClick={() => setActiveTab('todos')}
              className={`flex-1 py-3 text-[10px] lg:text-xs font-bold border-b-2 transition-colors ${activeTab === 'todos' ? 'border-primary text-secondary dark:text-white' : 'border-transparent text-gray-400'}`}
            >
              할 일
            </button>
            <button 
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 py-3 text-[10px] lg:text-xs font-bold border-b-2 transition-colors ${activeTab === 'contacts' ? 'border-primary text-secondary dark:text-white' : 'border-transparent text-gray-400'}`}
            >
              연락처
            </button>
          </div>
          <div className="p-4 flex-1">
            {activeTab === 'todos' ? (
              <ul className="space-y-3 lg:space-y-4">
                {dashboardTodos.map(todo => (
                  <li 
                    key={todo.id} 
                    className="flex items-start gap-3 cursor-pointer group"
                    onClick={() => toggleTodo(todo.id)}
                  >
                    <span className={`material-symbols-outlined text-lg transition-colors ${todo.completed ? 'text-green-500' : 'text-gray-300 group-hover:text-primary'}`}>
                      {todo.completed ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] lg:text-xs font-bold truncate transition-all ${todo.completed ? 'text-gray-400 line-through' : ''}`}>{todo.title}</p>
                      <p className={`text-[8px] lg:text-[9px] ${todo.completed ? 'text-gray-300' : 'text-primary font-bold'}`}>{todo.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-3 lg:space-y-4">
                {recentContacts.map(contact => (
                  <li 
                    key={contact.id} 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => navigateTo('CUSTOMER_DETAIL', contact.id)}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-400 text-sm">person</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] lg:text-xs font-bold truncate">{contact.name}</p>
                      <p className="text-[8px] lg:text-[9px] text-gray-400">{contact.phone}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {activeTab === 'todos' && (
            showAddTodo ? (
              <div className="m-4 flex gap-2">
                <input 
                  type="text"
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                  placeholder="할 일 입력..."
                  className="flex-1 bg-gray-50 dark:bg-gray-900 border-none rounded-lg text-xs p-2"
                  autoFocus
                />
                <button 
                  onClick={handleAddTodo}
                  className="bg-primary text-white px-3 rounded-lg text-[9px] font-bold"
                >
                  추가
                </button>
                <button 
                  onClick={() => { setShowAddTodo(false); setNewTodoTitle(''); }}
                  className="text-gray-400 px-2"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAddTodo(true)}
                className="m-4 p-2 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-[9px] font-bold text-gray-400 hover:bg-gray-50 hover:text-primary transition-all"
              >
                + 할 일 추가
              </button>
            )
          )}
        </div>

        {/* Follow-up Section */}
        <div className="bg-white dark:bg-[#1A1A1A] p-4 lg:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col order-2 md:order-3 xl:order-3 md:col-span-2 xl:col-span-1">
          <div className="flex justify-between items-center mb-4 lg:mb-6">
            <h3 className="font-bold text-xs lg:text-base">후속 관리</h3>
            <span className="bg-red-50 text-red-600 text-[9px] px-2 py-0.5 rounded-full font-bold">긴급 {urgentCount}</span>
          </div>
          <div className="space-y-2 lg:space-y-3">
            {urgentFollowUps.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-2 lg:p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all">
                <div 
                  className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1 cursor-pointer"
                  onClick={() => navigateTo('CUSTOMER_DETAIL', client.id)}
                >
                  <span className={`${client.color} text-white text-[7px] lg:text-[8px] px-1 lg:px-1.5 py-0.5 rounded font-black whitespace-nowrap`}>{client.status}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] lg:text-xs font-bold truncate">{client.name}</p>
                    <p className="text-[8px] lg:text-[9px] text-gray-400 truncate">{client.phone}</p>
                  </div>
                </div>
                <button 
                  onClick={() => openContactModal(client.id, client.name)}
                  className="bg-secondary dark:bg-[#2A2A2A] text-white px-2 py-1 rounded-lg text-[8px] lg:text-[9px] font-bold shrink-0 hover:bg-primary transition-colors"
                >
                  기록
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigateTo('CUSTOMER_DB')}
            className="mt-4 w-full py-2.5 text-[9px] lg:text-[10px] font-bold text-gray-400 border border-gray-100 dark:border-gray-800 rounded-xl hover:text-primary transition-all"
          >
            전체 리스트 보기
          </button>
        </div>
      </div>

      {/* Contact Record Modal */}
      {selectedCustomer && (
        <ContactRecordModal
          isOpen={contactModalOpen}
          onClose={() => { setContactModalOpen(false); setSelectedCustomer(null); }}
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
        />
      )}

      {/* Stats Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white dark:bg-[#1A1A1A] p-5 lg:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-start mb-4 lg:mb-8">
            <div>
              <h3 className="font-bold text-sm lg:text-lg flex items-center gap-2">
                <span className="w-1.5 h-4 lg:h-6 bg-primary rounded-full"></span>
                신규 고객 유입
              </h3>
              <p className="text-[8px] lg:text-[11px] text-gray-400 mt-1 uppercase">Recent 7 Days</p>
            </div>
            <div className="text-right shrink-0">
              <span className="block text-lg lg:text-2xl font-black text-secondary dark:text-white leading-none">21</span>
              <span className="text-[7px] lg:text-[8px] font-bold text-primary tracking-widest">WEEKLY</span>
            </div>
          </div>
          <div className="h-32 lg:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} />
                <Bar dataKey="registrations" radius={[4, 4, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 2 ? '#BEA05E' : '#F3F4F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] p-5 lg:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-start mb-4 lg:mb-8">
            <div>
              <h3 className="font-bold text-sm lg:text-lg flex items-center gap-2">
                <span className="w-1.5 h-4 lg:h-6 bg-secondary dark:bg-gray-500 rounded-full"></span>
                활동 지수
              </h3>
              <p className="text-[8px] lg:text-[11px] text-gray-400 mt-1 uppercase">Activity Score</p>
            </div>
            <div className="text-right shrink-0">
              <span className="block text-lg lg:text-2xl font-black text-secondary dark:text-white leading-none">52</span>
              <span className="text-[7px] lg:text-[8px] font-bold text-gray-400 tracking-widest">GOAL 60</span>
            </div>
          </div>
          <div className="h-32 lg:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#9CA3AF' }} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} />
                <Bar dataKey="activity" fill="#1A1A1A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
