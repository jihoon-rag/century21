
export type ViewType = 
  | 'DASHBOARD' 
  | 'CUSTOMER_DB' 
  | 'CUSTOMER_DETAIL' 
  | 'STATISTICS' 
  | 'SCHEDULE' 
  | 'AI_SECRETARY' 
  | 'OPERATIONS' 
  | 'MASTER_ADMIN'
  | 'AGENT_MANAGEMENT';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  lastContact: string;
  registrationDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  tier?: 'Platinum Elite' | 'Gold Medal' | 'Silver Link';
  contactDueDays: number; // e.g., +3, 0 (Today), -1
  isNew?: boolean;
}

export interface ToDo {
  id: string;
  title: string;
  time: string;
  completed: boolean;
}

export interface ActivityStats {
  date: string;
  registrations: number;
  contacts: number;
}
