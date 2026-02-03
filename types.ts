
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

export interface CustomerAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  dataUrl?: string; // Base64 for simulation
}

export interface CustomerGroup {
  id: string;
  name: string;
  color: string;
  description?: string;
}

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
  photo?: string; // Base64 or URL
  memo?: string;
  email?: string;
  address?: string;
  groups?: string[]; // Group IDs
  attachments?: CustomerAttachment[];
}

export interface Goal {
  id: string;
  type: 'monthly' | 'quarterly' | 'yearly';
  period: string; // e.g., "2024-05" for monthly, "2024-Q2" for quarterly
  targetRegistrations: number;
  targetContacts: number;
  actualRegistrations?: number;
  actualContacts?: number;
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
