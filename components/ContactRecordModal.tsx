
import React, { useState } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';

interface ContactRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
}

const ContactRecordModal: React.FC<ContactRecordModalProps> = ({ 
  isOpen, 
  onClose, 
  customerId, 
  customerName 
}) => {
  const { addContactRecord, contactRecords } = useApp();
  const [type, setType] = useState<'call' | 'visit' | 'message' | 'email'>('call');
  const [note, setNote] = useState('');

  const customerRecords = contactRecords.filter(r => r.customerId === customerId);

  const handleSubmit = () => {
    if (!note.trim()) return;
    
    const today = new Date();
    const date = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    
    addContactRecord({
      customerId,
      date,
      type,
      note: note.trim(),
    });
    
    setNote('');
    onClose();
  };

  const getTypeLabel = (t: string) => {
    switch (t) {
      case 'call': return '전화';
      case 'visit': return '방문';
      case 'message': return '문자';
      case 'email': return '이메일';
      default: return t;
    }
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'call': return 'call';
      case 'visit': return 'location_on';
      case 'message': return 'sms';
      case 'email': return 'mail';
      default: return 'note';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${customerName} 연락 기록`} size="lg">
      <div className="space-y-6">
        {/* New Record Form */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl space-y-4">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">add_circle</span>
            새 기록 추가
          </h4>
          
          <div className="flex flex-wrap gap-2">
            {(['call', 'visit', 'message', 'email'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  type === t 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{getTypeIcon(t)}</span>
                {getTypeLabel(t)}
              </button>
            ))}
          </div>
          
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="연락 내용을 입력하세요..."
            className="w-full bg-white dark:bg-gray-800 border-none rounded-xl p-4 text-sm resize-none h-24"
          />
          
          <button
            onClick={handleSubmit}
            disabled={!note.trim()}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-95 transition-all"
          >
            기록 저장
          </button>
        </div>

        {/* Record History */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-gray-400">history</span>
            이전 기록
          </h4>
          
          {customerRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <span className="material-symbols-outlined text-4xl mb-2">folder_open</span>
              <p className="text-sm">아직 연락 기록이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customerRecords.map((record) => (
                <div key={record.id} className="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-gray-500">{getTypeIcon(record.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{getTypeLabel(record.type)}</span>
                      <span className="text-[10px] text-gray-300">|</span>
                      <span className="text-[10px] text-gray-400">{record.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{record.note}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ContactRecordModal;
