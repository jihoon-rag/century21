
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';

const ScheduleView: React.FC = () => {
  const { todos, toggleTodo, addTodo, deleteTodo, restoreLastDeletedTodo, scheduleEvents, addScheduleEvent, contactRecords, customers, showToast } = useApp();
  
  const [currentYear, setCurrentYear] = useState(2024);
  const [currentMonth, setCurrentMonth] = useState(5); // May
  const [selectedDate, setSelectedDate] = useState(22);
  const [activeTab, setActiveTab] = useState<'todos' | 'contacts'>('todos');
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [addEventModalOpen, setAddEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('10:00');
  const [newEventLocation, setNewEventLocation] = useState('');

  // Calculate days in month
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();

  // Get events for selected date
  const selectedDateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
  const selectedDateEvents = scheduleEvents.filter(e => e.date === selectedDateStr);

  // Get events for the month (for dots on calendar)
  const monthEventDates = useMemo(() => {
    return scheduleEvents
      .filter(e => e.date.startsWith(`${currentYear}-${String(currentMonth).padStart(2, '0')}`))
      .map(e => parseInt(e.date.split('-')[2]));
  }, [scheduleEvents, currentYear, currentMonth]);

  // Contact records with customer names
  const enrichedContactRecords = contactRecords.map(record => {
    const customer = customers.find(c => c.id === record.customerId);
    return { ...record, customerName: customer?.name || '알 수 없음' };
  }).slice(0, 10);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(1);
  };

  const handleAddTodo = () => {
    if (newTodoTitle.trim()) {
      addTodo({ title: newTodoTitle.trim(), time: '09:00', completed: false });
      setNewTodoTitle('');
      showToast('할 일이 추가되었습니다.', 'success');
    }
  };

  const handleAddEvent = () => {
    if (newEventTitle.trim()) {
      addScheduleEvent({
        date: selectedDateStr,
        title: newEventTitle.trim(),
        time: newEventTime,
        location: newEventLocation || undefined,
        type: 'meeting',
      });
      setNewEventTitle('');
      setNewEventTime('10:00');
      setNewEventLocation('');
      setAddEventModalOpen(false);
      showToast('일정이 추가되었습니다.', 'success');
    }
  };

  const isToday = selectedDate === 22 && currentMonth === 5 && currentYear === 2024;
  const isYesterday = selectedDate === 21 && currentMonth === 5 && currentYear === 2024;

  // Completed todos for "yesterday"
  const completedTodos = todos.filter(t => t.completed);
  const pendingTodos = todos.filter(t => !t.completed);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-8 h-full">
      <section className="xl:col-span-4 space-y-4 lg:space-y-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 lg:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 lg:mb-10">
            <button 
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full text-gray-400 transition-colors"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <h3 className="text-lg lg:text-xl font-black">{currentYear}년 {currentMonth}월</h3>
            <button 
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full text-gray-400 transition-colors"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-4 text-center text-[10px] lg:text-[11px] font-black uppercase tracking-widest">
            {['일','월','화','수','목','금','토'].map((d, i) => (
              <div key={d} className={`py-2 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-400'}`}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 lg:gap-2">
            {/* Empty cells for days before first of month */}
            {Array.from({ length: firstDayOfMonth }, (_, i) => (
              <div key={`empty-${i}`} className="h-10 lg:h-12"></div>
            ))}
            {/* Days of month */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const hasEvent = monthEventDates.includes(day);
              const isSelected = day === selectedDate;
              return (
                <div 
                  key={day} 
                  onClick={() => setSelectedDate(day)}
                  className={`h-10 lg:h-12 flex flex-col items-center justify-center text-xs lg:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-primary text-white shadow-xl shadow-primary/30' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {day}
                  {hasEvent && !isSelected && <div className="w-1 h-1 bg-primary rounded-full mt-0.5"></div>}
                </div>
              );
            })}
          </div>
          
          {/* Selected Date Events */}
          <div className="mt-6 lg:mt-10 pt-6 lg:pt-8 border-t border-gray-50 dark:border-gray-800 space-y-4 lg:space-y-6">
            <div className="flex items-center justify-between text-[10px] lg:text-xs font-black text-gray-400 uppercase tracking-widest">
              <span>{currentMonth}월 {selectedDate}일 일정</span>
              <button 
                onClick={() => setAddEventModalOpen(true)}
                className="text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                추가
              </button>
            </div>
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <span className="material-symbols-outlined text-3xl mb-2">event_busy</span>
                <p className="text-xs">일정이 없습니다</p>
              </div>
            ) : (
              <ul className="space-y-3 lg:space-y-4">
                {selectedDateEvents.map((event) => (
                  <li key={event.id} className="flex items-start gap-3 lg:gap-4 p-3 lg:p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl lg:rounded-2xl border-l-4 border-l-primary shadow-sm">
                    <span className="material-symbols-outlined text-primary text-xl lg:text-2xl">
                      {event.type === 'visit' ? 'location_on' : event.type === 'meeting' ? 'groups' : 'task'}
                    </span>
                    <div>
                      <p className="text-xs lg:text-sm font-black">{event.time} - {event.title}</p>
                      {event.location && <p className="text-[9px] lg:text-[10px] text-gray-400 font-medium mt-1">{event.location}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="xl:col-span-8">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col h-full shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-50 dark:border-gray-800">
            <button 
              onClick={() => setActiveTab('todos')}
              className={`px-6 lg:px-10 py-4 lg:py-5 text-xs lg:text-sm font-black border-b-2 transition-colors ${activeTab === 'todos' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              To-do List
            </button>
            <button 
              onClick={() => setActiveTab('contacts')}
              className={`px-6 lg:px-10 py-4 lg:py-5 text-xs lg:text-sm font-bold border-b-2 transition-colors ${activeTab === 'contacts' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              Contact History
            </button>
          </div>
          
          <div className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar space-y-8 lg:space-y-12">
            {activeTab === 'todos' ? (
              <>
                {/* Completed Todos (Yesterday) */}
                {completedTodos.length > 0 && (
                  <div className="opacity-50">
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                      <div>
                        <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest">완료된 할 일</p>
                        <h4 className="text-lg lg:text-xl font-black text-gray-500 mt-1">어제의 할 일</h4>
                      </div>
                      <span className="px-2 lg:px-3 py-1 bg-green-50 text-green-600 text-[9px] lg:text-[10px] font-black rounded-full border border-green-100 uppercase tracking-widest">Completed</span>
                    </div>
                    <ul className="bg-gray-50 dark:bg-gray-900/30 p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 space-y-3 lg:space-y-4">
                      {completedTodos.slice(0, 3).map((todo) => (
                        <li key={todo.id} className="flex items-center gap-3 lg:gap-4 text-xs lg:text-sm font-medium text-gray-500 line-through">
                          <span className="material-symbols-outlined text-green-500">check_circle</span>
                          {todo.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Today's Todos */}
                <div>
                  <div className="flex items-center justify-between mb-4 lg:mb-6">
                    <div>
                      <p className="text-[9px] lg:text-[10px] font-black text-primary uppercase tracking-widest">{currentYear}년 {currentMonth}월 {selectedDate}일</p>
                      <h4 className="text-lg lg:text-xl font-black mt-1">오늘의 할 일</h4>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-xl space-y-4 lg:space-y-6">
                    <ul className="space-y-4 lg:space-y-6">
                      {pendingTodos.length === 0 ? (
                        <li className="text-center py-4 text-gray-400 text-sm">할 일이 없습니다</li>
                      ) : (
                        pendingTodos.map((todo) => (
                          <li key={todo.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3 lg:gap-4 flex-1">
                              <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-all text-lg lg:text-xl">play_arrow</span>
                              <span className="text-xs lg:text-sm font-bold">{todo.title}</span>
                              <span className="text-[9px] lg:text-[10px] text-gray-400">{todo.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => toggleTodo(todo.id)}
                                className="size-5 lg:size-6 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-primary transition-all flex items-center justify-center"
                              >
                              </button>
                              <button 
                                onClick={() => {
                                  deleteTodo(todo.id);
                                  // 삭제 후 되돌리기 옵션이 있는 Toast 표시
                                  showToast('할 일이 삭제되었습니다.', 'success', {
                                    label: '되돌리기',
                                    onClick: restoreLastDeletedTodo
                                  });
                                }}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                    <div className="pt-4 lg:pt-6 border-t border-gray-50 dark:border-gray-700 flex items-center gap-3 lg:gap-4">
                      <span className="material-symbols-outlined text-gray-300">add_circle</span>
                      <input 
                        type="text" 
                        placeholder="새로운 할 일을 입력하세요" 
                        className="flex-1 bg-transparent border-none focus:ring-0 text-xs lg:text-sm p-0 placeholder-gray-400"
                        value={newTodoTitle}
                        onChange={(e) => setNewTodoTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                      />
                      <button 
                        onClick={handleAddTodo}
                        className="bg-secondary text-white px-4 lg:px-6 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-[10px] lg:text-xs font-black"
                      >
                        저장
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Contact History Tab */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-black">최근 연락 기록</h4>
                  <span className="text-xs text-gray-400">{contactRecords.length}건</span>
                </div>
                {enrichedContactRecords.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <span className="material-symbols-outlined text-5xl mb-4">history</span>
                    <p className="text-sm">연락 기록이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enrichedContactRecords.map((record) => (
                      <div key={record.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-gray-400">
                            {record.type === 'call' ? 'call' : record.type === 'visit' ? 'location_on' : record.type === 'message' ? 'sms' : 'mail'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm">{record.customerName}</span>
                            <span className="text-[10px] text-gray-400 uppercase">{record.type}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{record.note}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{record.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Add Event Modal */}
      <Modal isOpen={addEventModalOpen} onClose={() => setAddEventModalOpen(false)} title="일정 추가" size="md">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500">일정 제목</label>
            <input 
              type="text"
              placeholder="일정 제목을 입력하세요"
              className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm p-3"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">시간</label>
              <input 
                type="time"
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm p-3"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">날짜</label>
              <input 
                type="text"
                className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm p-3 text-gray-500"
                value={`${currentYear}.${currentMonth}.${selectedDate}`}
                disabled
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500">장소 (선택)</label>
            <input 
              type="text"
              placeholder="장소를 입력하세요"
              className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-sm p-3"
              value={newEventLocation}
              onChange={(e) => setNewEventLocation(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              onClick={() => setAddEventModalOpen(false)}
              className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm"
            >
              취소
            </button>
            <button 
              onClick={handleAddEvent}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
            >
              추가
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ScheduleView;
