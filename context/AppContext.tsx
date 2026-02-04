
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Customer, ToDo, CustomerGroup, CustomerAttachment, Goal } from '../types';

// Extended Types
export interface ContactRecord {
  id: string;
  customerId: string;
  date: string;
  type: 'call' | 'visit' | 'message' | 'email';
  note: string;
}

export interface ScheduleEvent {
  id: string;
  date: string;
  title: string;
  time: string;
  location?: string;
  type: 'meeting' | 'visit' | 'task';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  // 되돌리기 등 액션 버튼을 지원하기 위한 확장 필드
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AppContextType {
  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  addCustomers: (customers: Omit<Customer, 'id'>[]) => void; // Bulk add
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomer: (id: string) => Customer | undefined;
  
  // Customer Groups
  customerGroups: CustomerGroup[];
  addCustomerGroup: (group: Omit<CustomerGroup, 'id'>) => void;
  updateCustomerGroup: (id: string, data: Partial<CustomerGroup>) => void;
  deleteCustomerGroup: (id: string) => void;
  
  // Customer Attachments
  addAttachment: (customerId: string, attachment: Omit<CustomerAttachment, 'id'>) => void;
  deleteAttachment: (customerId: string, attachmentId: string) => void;
  
  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  // Todos
  todos: ToDo[];
  addTodo: (todo: Omit<ToDo, 'id'>) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  restoreLastDeletedTodo: () => void; // 마지막으로 삭제된 할 일 복구
  
  // Contact Records
  contactRecords: ContactRecord[];
  addContactRecord: (record: Omit<ContactRecord, 'id'>) => void;
  
  // Schedule Events
  scheduleEvents: ScheduleEvent[];
  addScheduleEvent: (event: Omit<ScheduleEvent, 'id'>) => void;
  deleteScheduleEvent: (id: string) => void;
  
  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type'], action?: Toast['action']) => void;
  removeToast: (id: string) => void;
  
  // Settings Modal
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  
  // Selected customers for bulk actions
  selectedCustomerIds: string[];
  toggleCustomerSelection: (id: string) => void;
  selectAllCustomers: (ids: string[]) => void;
  clearCustomerSelection: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Data
const initialCustomers: Customer[] = [
  { id: '1', name: '홍길동', phone: '010-1234-5678', lastContact: '2024.05.15', registrationDate: '2022.05.16', status: 'ACTIVE', contactDueDays: 3, isNew: true, tier: 'Platinum Elite', groups: ['1', '3'], email: 'hong@email.com', address: '서울시 강남구 역삼동' },
  { id: '2', name: '삼성동 건물주', phone: '010-2345-6789', lastContact: '2024.05.31', registrationDate: '2022.01.08', status: 'ACTIVE', contactDueDays: 0, isNew: true, tier: 'Gold Medal', groups: ['1', '4'], email: 'samsung@email.com' },
  { id: '3', name: '홍길준', phone: '010-3456-7890', lastContact: '2024.04.14', registrationDate: '2022.04.15', status: 'ACTIVE', contactDueDays: -1, tier: 'Silver Link', groups: ['5'] },
  { id: '4', name: '고길동', phone: '010-4567-8901', lastContact: '-', registrationDate: '2022.09.15', status: 'INACTIVE', contactDueDays: 99 },
  { id: '5', name: '고길순', phone: '02-555-0000', lastContact: '-', registrationDate: '2020.09.02', status: 'INACTIVE', contactDueDays: 99 },
  { id: '6', name: '김중앙', phone: '010-5678-9012', lastContact: '2024.05.10', registrationDate: '2023.03.20', status: 'ACTIVE', contactDueDays: 5, tier: 'Gold Medal', groups: ['2', '4'] },
  { id: '7', name: '박서초', phone: '010-6789-0123', lastContact: '2024.05.18', registrationDate: '2023.06.15', status: 'ACTIVE', contactDueDays: 1, tier: 'Silver Link', groups: ['3'] },
  { id: '8', name: '최강남', phone: '010-7890-1234', lastContact: '2024.05.20', registrationDate: '2024.01.10', status: 'ACTIVE', contactDueDays: 0, isNew: true, tier: 'Platinum Elite', groups: ['1', '2'] },
  { id: '9', name: '이송파', phone: '010-8901-2345', lastContact: '2024.05.05', registrationDate: '2022.11.25', status: 'ACTIVE', contactDueDays: -3, groups: ['4'] },
  { id: '10', name: '정마포', phone: '010-9012-3456', lastContact: '2024.04.28', registrationDate: '2021.08.30', status: 'ACTIVE', contactDueDays: -7, tier: 'Gold Medal', groups: ['5'] },
];

const initialTodos: ToDo[] = [
  { id: '1', title: '매물 홍보 전단지 검토', time: '09:30', completed: true },
  { id: '2', title: '강남역 인근 신축 부지 확인', time: '14:00', completed: false },
  { id: '3', title: '삼성동 주택 임대인 계약 검토', time: '16:30', completed: false },
  { id: '4', title: 'TM 리스트 작성하기', time: '10:00', completed: true },
  { id: '5', title: 'OO빌딩 인근 Farming 하기', time: '11:00', completed: false },
  { id: '6', title: '전용 120평 오피스 물건 찾기', time: '15:00', completed: false },
];

const initialContactRecords: ContactRecord[] = [
  { id: '1', customerId: '1', date: '2024.05.15', type: 'call', note: '전세 매물 문의. 강남 선호' },
  { id: '2', customerId: '1', date: '2024.05.10', type: 'visit', note: '삼성동 오피스텔 방문' },
  { id: '3', customerId: '2', date: '2024.05.31', type: 'message', note: '매물 정보 문자 발송' },
  { id: '4', customerId: '3', date: '2024.04.14', type: 'call', note: '재계약 관련 상담' },
];

const initialScheduleEvents: ScheduleEvent[] = [
  { id: '1', date: '2024-05-22', title: 'OO빌딩 현장 실사', time: '10:00', location: '서울시 서초구 서초대로', type: 'visit' },
  { id: '2', date: '2024-05-22', title: '홍길동 고객 미팅', time: '14:00', location: '본사 2층 회의실', type: 'meeting' },
  { id: '3', date: '2024-05-16', title: '잠실 엘스 상담', time: '14:00', type: 'meeting' },
  { id: '4', date: '2024-05-20', title: '역삼동 현장 방문', time: '11:00', type: 'visit' },
];

const initialNotifications: Notification[] = [
  { id: '1', title: '후속 관리 알림', message: '김중앙 고객 연락 기한이 3일 지났습니다.', time: '10분 전', read: false, type: 'warning' },
  { id: '2', title: '신규 고객 등록', message: '최강남 고객이 새로 등록되었습니다.', time: '1시간 전', read: false, type: 'info' },
  { id: '3', title: '일정 알림', message: '오후 2시 홍길동 고객 미팅이 있습니다.', time: '2시간 전', read: true, type: 'info' },
];

const initialCustomerGroups: CustomerGroup[] = [
  { id: '1', name: 'VIP 고객', color: '#8B5CF6', description: '최우선 관리 대상 고객' },
  { id: '2', name: '신규 상담', color: '#3B82F6', description: '첫 상담 진행 중인 고객' },
  { id: '3', name: '계약 진행중', color: '#10B981', description: '계약 협의 중인 고객' },
  { id: '4', name: '매물 관심', color: '#F59E0B', description: '특정 매물에 관심 있는 고객' },
  { id: '5', name: '재계약 대상', color: '#EF4444', description: '재계약 시기가 다가온 고객' },
];

const initialGoals: Goal[] = [
  { id: '1', type: 'monthly', period: '2024-05', targetRegistrations: 30, targetContacts: 100, actualRegistrations: 21, actualContacts: 62 },
  { id: '2', type: 'monthly', period: '2024-04', targetRegistrations: 25, targetContacts: 80, actualRegistrations: 28, actualContacts: 95 },
  { id: '3', type: 'quarterly', period: '2024-Q2', targetRegistrations: 90, targetContacts: 300, actualRegistrations: 49, actualContacts: 157 },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [todos, setTodos] = useState<ToDo[]>(initialTodos);
  const [deletedTodos, setDeletedTodos] = useState<ToDo[]>([]); // 삭제된 할 일 임시 저장 (되돌리기용)
  const [contactRecords, setContactRecords] = useState<ContactRecord[]>(initialContactRecords);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>(initialScheduleEvents);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>(initialCustomerGroups);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);

  // Generate unique ID
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  // Customer operations
  const addCustomer = useCallback((customer: Omit<Customer, 'id'>) => {
    const newCustomer = { ...customer, id: generateId() };
    setCustomers(prev => [newCustomer, ...prev]);
    showToast('고객이 등록되었습니다.', 'success');
  }, []);

  const addCustomers = useCallback((newCustomers: Omit<Customer, 'id'>[]) => {
    const customersWithIds = newCustomers.map(c => ({ ...c, id: generateId() }));
    setCustomers(prev => [...customersWithIds, ...prev]);
    showToast(`${newCustomers.length}명의 고객이 등록되었습니다.`, 'success');
  }, []);

  const updateCustomer = useCallback((id: string, data: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    showToast('고객 정보가 수정되었습니다.', 'success');
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    showToast('고객이 삭제되었습니다.', 'success');
  }, []);

  const getCustomer = useCallback((id: string) => {
    return customers.find(c => c.id === id);
  }, [customers]);

  // Customer Group operations
  const addCustomerGroup = useCallback((group: Omit<CustomerGroup, 'id'>) => {
    const newGroup = { ...group, id: generateId() };
    setCustomerGroups(prev => [...prev, newGroup]);
    showToast('그룹이 생성되었습니다.', 'success');
  }, []);

  const updateCustomerGroup = useCallback((id: string, data: Partial<CustomerGroup>) => {
    setCustomerGroups(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
    showToast('그룹이 수정되었습니다.', 'success');
  }, []);

  const deleteCustomerGroup = useCallback((id: string) => {
    setCustomerGroups(prev => prev.filter(g => g.id !== id));
    // Remove group from all customers
    setCustomers(prev => prev.map(c => ({
      ...c,
      groups: c.groups?.filter(gId => gId !== id)
    })));
    showToast('그룹이 삭제되었습니다.', 'success');
  }, []);

  // Customer Attachment operations
  const addAttachment = useCallback((customerId: string, attachment: Omit<CustomerAttachment, 'id'>) => {
    const newAttachment = { ...attachment, id: generateId() };
    setCustomers(prev => prev.map(c => 
      c.id === customerId 
        ? { ...c, attachments: [...(c.attachments || []), newAttachment] }
        : c
    ));
    showToast('파일이 첨부되었습니다.', 'success');
  }, []);

  const deleteAttachment = useCallback((customerId: string, attachmentId: string) => {
    setCustomers(prev => prev.map(c => 
      c.id === customerId 
        ? { ...c, attachments: c.attachments?.filter(a => a.id !== attachmentId) }
        : c
    ));
    showToast('파일이 삭제되었습니다.', 'success');
  }, []);

  // Goal operations
  const addGoal = useCallback((goal: Omit<Goal, 'id'>) => {
    const newGoal = { ...goal, id: generateId() };
    setGoals(prev => [...prev, newGoal]);
    showToast('목표가 설정되었습니다.', 'success');
  }, []);

  const updateGoal = useCallback((id: string, data: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
    showToast('목표가 수정되었습니다.', 'success');
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    showToast('목표가 삭제되었습니다.', 'success');
  }, []);

  // Todo operations
  const addTodo = useCallback((todo: Omit<ToDo, 'id'>) => {
    const newTodo = { ...todo, id: generateId() };
    setTodos(prev => [...prev, newTodo]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  // 할 일 삭제 - 삭제된 항목을 임시 저장하여 복구 가능하게 함
  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => {
      const todoToDelete = prev.find(t => t.id === id);
      if (todoToDelete) {
        // 삭제할 항목을 deletedTodos에 저장 (최대 1개만 유지)
        setDeletedTodos([todoToDelete]);
      }
      return prev.filter(t => t.id !== id);
    });
  }, []);

  // 마지막으로 삭제된 할 일 복구
  const restoreLastDeletedTodo = useCallback(() => {
    setDeletedTodos(prev => {
      if (prev.length > 0) {
        const todoToRestore = prev[0];
        setTodos(todos => [...todos, todoToRestore]);
      }
      return []; // 복구 후 삭제 목록 비움
    });
  }, []);

  // Contact record operations
  const addContactRecord = useCallback((record: Omit<ContactRecord, 'id'>) => {
    const newRecord = { ...record, id: generateId() };
    setContactRecords(prev => [newRecord, ...prev]);
    // Update customer's last contact
    setCustomers(prev => prev.map(c => 
      c.id === record.customerId 
        ? { ...c, lastContact: record.date, contactDueDays: 14 }
        : c
    ));
    showToast('연락 기록이 저장되었습니다.', 'success');
  }, []);

  // Schedule event operations
  const addScheduleEvent = useCallback((event: Omit<ScheduleEvent, 'id'>) => {
    const newEvent = { ...event, id: generateId() };
    setScheduleEvents(prev => [...prev, newEvent]);
    showToast('일정이 추가되었습니다.', 'success');
  }, []);

  const deleteScheduleEvent = useCallback((id: string) => {
    setScheduleEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  // Notification operations
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Toast operations - 액션 버튼(되돌리기 등)을 지원
  const showToast = useCallback((message: string, type: Toast['type'] = 'info', action?: Toast['action']) => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type, action }]);
    // 액션이 있는 경우 5초, 없으면 3초 후 자동 제거
    const duration = action ? 5000 : 3000;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Customer selection operations
  const toggleCustomerSelection = useCallback((id: string) => {
    setSelectedCustomerIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const selectAllCustomers = useCallback((ids: string[]) => {
    setSelectedCustomerIds(ids);
  }, []);

  const clearCustomerSelection = useCallback(() => {
    setSelectedCustomerIds([]);
  }, []);

  return (
    <AppContext.Provider value={{
      customers,
      addCustomer,
      addCustomers,
      updateCustomer,
      deleteCustomer,
      getCustomer,
      customerGroups,
      addCustomerGroup,
      updateCustomerGroup,
      deleteCustomerGroup,
      addAttachment,
      deleteAttachment,
      goals,
      addGoal,
      updateGoal,
      deleteGoal,
      todos,
      addTodo,
      toggleTodo,
      deleteTodo,
      restoreLastDeletedTodo,
      contactRecords,
      addContactRecord,
      scheduleEvents,
      addScheduleEvent,
      deleteScheduleEvent,
      notifications,
      markNotificationRead,
      clearNotifications,
      toasts,
      showToast,
      removeToast,
      isSettingsOpen,
      setIsSettingsOpen,
      selectedCustomerIds,
      toggleCustomerSelection,
      selectAllCustomers,
      clearCustomerSelection,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
