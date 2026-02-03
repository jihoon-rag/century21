
import React, { useState, useEffect } from 'react';
import { ViewType } from '../types';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import ContactRecordModal from '../components/ContactRecordModal';

interface CustomerDetailProps {
  id: string | null;
  navigateTo: (view: ViewType) => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ id, navigateTo }) => {
  const { getCustomer, addCustomer, updateCustomer, deleteCustomer, showToast, contactRecords } = useApp();
  
  const existingCustomer = id ? getCustomer(id) : null;
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [memo, setMemo] = useState('');
  const [contactCycle, setContactCycle] = useState('14');
  const [calendarAlert, setCalendarAlert] = useState(true);
  const [smsAlert, setSmsAlert] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Load existing customer data
  useEffect(() => {
    if (existingCustomer) {
      setName(existingCustomer.name);
      setPhone(existingCustomer.phone);
      setIsVerified(true);
    }
  }, [existingCustomer]);

  const customerRecords = id ? contactRecords.filter(r => r.customerId === id) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      showToast('고객명을 입력해주세요.', 'warning');
      return;
    }
    if (!phone.trim()) {
      showToast('연락처를 입력해주세요.', 'warning');
      return;
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    if (existingCustomer) {
      updateCustomer(id!, {
        name: name.trim(),
        phone: phone.trim(),
      });
      showToast('고객 정보가 수정되었습니다.', 'success');
    } else {
      addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        lastContact: dateStr,
        registrationDate: dateStr,
        status: 'ACTIVE',
        contactDueDays: parseInt(contactCycle),
        isNew: true,
      });
      showToast('새 고객이 등록되었습니다.', 'success');
    }
    
    navigateTo('CUSTOMER_DB');
  };

  const handleDelete = () => {
    if (id) {
      deleteCustomer(id);
      showToast('고객이 삭제되었습니다.', 'success');
      navigateTo('CUSTOMER_DB');
    }
  };

  const handleVerify = () => {
    if (!phone.trim()) {
      showToast('연락처를 먼저 입력해주세요.', 'warning');
      return;
    }
    // Simulate verification
    setIsVerified(true);
    showToast('연락처가 인증되었습니다.', 'success');
  };

  const handlePrint = () => {
    window.print();
    showToast('인쇄 창이 열립니다.', 'info');
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('클립보드에 복사되었습니다.', 'success');
    setShareModalOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 lg:space-y-8 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <nav className="flex text-[9px] lg:text-xs text-gray-400 mb-1.5 lg:mb-2 gap-2">
            <span className="cursor-pointer hover:text-primary" onClick={() => navigateTo('CUSTOMER_DB')}>고객 DB</span>
            <span>&gt;</span>
            <span className="text-gray-900 dark:text-white font-bold">{id ? '상세' : '등록'}</span>
          </nav>
          <h2 className="text-xl lg:text-3xl font-black tracking-tight">{id ? '고객 상세 정보' : '신규 고객 등록'}</h2>
        </div>
        {id && (
          <div className="flex gap-1.5 self-end sm:self-auto">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-1 text-[9px] lg:text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined text-sm lg:text-base">print</span> 인쇄
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center gap-1 text-[9px] lg:text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined text-sm lg:text-base">share</span> 공유
            </button>
            <button 
              onClick={() => setContactModalOpen(true)}
              className="flex items-center gap-1 text-[9px] lg:text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg hover:brightness-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm lg:text-base">edit_note</span> 기록
            </button>
          </div>
        )}
      </header>

      <form className="space-y-4 lg:space-y-6" onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-50 dark:border-gray-800 flex items-center gap-2 lg:gap-3">
            <span className="w-1 h-4 lg:w-1.5 lg:h-6 bg-primary rounded-full"></span>
            <h3 className="font-bold text-sm lg:text-lg">기본 정보</h3>
          </div>
          <div className="p-4 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
            <div className="space-y-1.5">
              <label className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase">고객명 <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                placeholder="성함" 
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-[11px] lg:text-sm p-3 focus:ring-1 focus:ring-primary" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase">연락처 <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="010-0000-0000" 
                  className="flex-1 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-[11px] lg:text-sm p-3 focus:ring-1 focus:ring-primary" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={handleVerify}
                  className={`px-4 rounded-xl text-[10px] font-bold transition-colors ${isVerified ? 'bg-green-500 text-white' : 'bg-secondary text-white hover:bg-gray-700'}`}
                >
                  {isVerified ? '인증완료' : '인증'}
                </button>
              </div>
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase">메모</label>
              <textarea 
                placeholder="특이사항 입력" 
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-[11px] lg:text-sm p-3 h-20 lg:h-32 resize-none"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Contact Settings */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-bold text-sm lg:text-lg flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-base lg:text-xl">notifications_active</span>
              CONTACT 관리
            </h3>
          </div>
          <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
              <div className="space-y-1.5">
                <label className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase">주기 설정</label>
                <select 
                  className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-[11px] lg:text-sm p-3 appearance-none"
                  value={contactCycle}
                  onChange={(e) => setContactCycle(e.target.value)}
                >
                  <option value="7">7일 (1주일)</option>
                  <option value="14">14일 (2주일)</option>
                  <option value="30">30일 (1개월)</option>
                  <option value="60">60일 (2개월)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase">알림 채널</label>
                <div className="flex flex-wrap gap-4 py-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={calendarAlert}
                      onChange={(e) => setCalendarAlert(e.target.checked)}
                      className="rounded text-primary size-4" 
                    />
                    <span className="text-[11px] lg:text-sm font-medium">캘린더</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={smsAlert}
                      onChange={(e) => setSmsAlert(e.target.checked)}
                      className="rounded text-primary size-4" 
                    />
                    <span className="text-[11px] lg:text-sm font-medium">문자알림</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact History (only for existing customers) */}
        {id && customerRecords.length > 0 && (
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-sm lg:text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-base lg:text-xl text-gray-400">history</span>
                최근 연락 기록
              </h3>
              <span className="text-xs text-gray-400">{customerRecords.length}건</span>
            </div>
            <div className="p-4 lg:p-6 space-y-3">
              {customerRecords.slice(0, 3).map((record) => (
                <div key={record.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <span className="material-symbols-outlined text-gray-400">
                    {record.type === 'call' ? 'call' : record.type === 'visit' ? 'location_on' : record.type === 'message' ? 'sms' : 'mail'}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-bold">{record.note}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{record.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-3 lg:gap-4">
          {id && (
            <button 
              type="button" 
              onClick={() => setDeleteModalOpen(true)}
              className="w-full sm:w-auto text-red-500 border border-red-100 px-8 py-2.5 rounded-xl font-bold text-[11px] lg:text-sm hover:bg-red-50 transition-colors"
            >
              고객 삭제
            </button>
          )}
          <div className={`w-full sm:w-auto flex gap-2 lg:gap-4 ${!id ? 'sm:ml-auto' : ''}`}>
            <button 
              type="button" 
              onClick={() => navigateTo('CUSTOMER_DB')} 
              className="flex-1 sm:flex-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-8 py-2.5 rounded-xl font-bold text-[11px] lg:text-sm hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button 
              type="submit" 
              className="flex-[2] sm:flex-none bg-primary text-white px-10 py-2.5 rounded-xl font-black text-[11px] lg:text-sm shadow-lg shadow-primary/20 hover:brightness-95 transition-all"
            >
              {id ? '수정하기' : '등록하기'}
            </button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="고객 삭제" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-bold">{name}</span> 고객을 삭제하시겠습니까?
          </p>
          <p className="text-xs text-gray-400">이 작업은 되돌릴 수 없으며, 관련된 모든 연락 기록도 함께 삭제됩니다.</p>
          <div className="flex gap-3 pt-4">
            <button 
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50"
            >
              취소
            </button>
            <button 
              onClick={handleDelete}
              className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600"
            >
              삭제
            </button>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} title="공유하기" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">고객 정보를 공유합니다.</p>
          <div className="space-y-2">
            <button 
              onClick={() => copyToClipboard(`고객명: ${name}\n연락처: ${phone}`)}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-500">content_copy</span>
              <span className="text-sm font-bold">텍스트로 복사</span>
            </button>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: `${name} 고객 정보`, text: `고객명: ${name}\n연락처: ${phone}` });
                } else {
                  copyToClipboard(`고객명: ${name}\n연락처: ${phone}`);
                }
              }}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-500">share</span>
              <span className="text-sm font-bold">다른 앱으로 공유</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Contact Record Modal */}
      {id && (
        <ContactRecordModal
          isOpen={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
          customerId={id}
          customerName={name}
        />
      )}
    </div>
  );
};

export default CustomerDetail;
