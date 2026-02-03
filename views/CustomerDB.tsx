
import React, { useState, useMemo } from 'react';
import { ViewType } from '../types';
import { useApp } from '../context/AppContext';
import ContactRecordModal from '../components/ContactRecordModal';
import Modal from '../components/Modal';

interface CustomerDBProps {
  navigateTo: (view: ViewType, id?: string) => void;
}

const CustomerDB: React.FC<CustomerDBProps> = ({ navigateTo }) => {
  const { customers, deleteCustomer, updateCustomer, selectedCustomerIds, toggleCustomerSelection, selectAllCustomers, clearCustomerSelection, showToast } = useApp();
  
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  
  const itemsPerPage = 5;

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesName = customer.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesPhone = customer.phone.includes(searchPhone);
      
      let matchesDate = true;
      if (dateFrom || dateTo) {
        const regDate = new Date(customer.registrationDate.replace(/\./g, '-'));
        if (dateFrom) {
          matchesDate = matchesDate && regDate >= new Date(dateFrom);
        }
        if (dateTo) {
          matchesDate = matchesDate && regDate <= new Date(dateTo);
        }
      }
      
      return matchesName && matchesPhone && matchesDate;
    });
  }, [customers, searchName, searchPhone, dateFrom, dateTo]);

  // Paginate
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const allSelected = paginatedCustomers.length > 0 && paginatedCustomers.every(c => selectedCustomerIds.includes(c.id));

  const handleSelectAll = () => {
    if (allSelected) {
      clearCustomerSelection();
    } else {
      selectAllCustomers(paginatedCustomers.map(c => c.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedCustomerIds.length === 0) {
      showToast('삭제할 고객을 선택해주세요.', 'warning');
      return;
    }
    setConfirmDeleteOpen(true);
  };

  const confirmBulkDelete = () => {
    selectedCustomerIds.forEach(id => deleteCustomer(id));
    clearCustomerSelection();
    setConfirmDeleteOpen(false);
    showToast(`${selectedCustomerIds.length}명의 고객이 삭제되었습니다.`, 'success');
  };

  const handlePostpone = () => {
    if (selectedCustomerIds.length === 0) {
      showToast('미룰 고객을 선택해주세요.', 'warning');
      return;
    }
    selectedCustomerIds.forEach(id => {
      updateCustomer(id, { contactDueDays: 7 });
    });
    clearCustomerSelection();
    showToast(`${selectedCustomerIds.length}명의 연락이 7일 미뤄졌습니다.`, 'success');
  };

  const openContactModal = (customerId: string, customerName: string) => {
    setSelectedCustomer({ id: customerId, name: customerName });
    setContactModalOpen(true);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    showToast('검색이 적용되었습니다.', 'info');
  };

  const clearFilters = () => {
    setSearchName('');
    setSearchPhone('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg lg:text-2xl font-black flex items-center gap-2 lg:gap-3">
          <span className="material-symbols-outlined text-primary text-2xl lg:text-3xl">groups</span>
          고객 DB 관리
        </h2>
        <button 
          onClick={() => navigateTo('CUSTOMER_DETAIL')}
          className="bg-primary hover:brightness-95 text-white px-3 lg:px-6 py-2 lg:py-2.5 rounded-lg text-[10px] lg:text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm lg:text-lg">person_add</span>
          등록
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-[#1A1A1A] p-4 lg:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6">
          <div className="space-y-1.5">
            <label className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest">고객명</label>
            <input 
              type="text" 
              placeholder="이름" 
              className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-lg text-[11px] lg:text-sm p-2 lg:p-3"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest">연락처</label>
            <input 
              type="text" 
              placeholder="010-****" 
              className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-lg text-[11px] lg:text-sm p-2 lg:p-3"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest">등록일</label>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                className="flex-1 bg-gray-50 dark:bg-gray-900 border-none rounded-lg text-[10px] lg:text-xs p-2 lg:p-3"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="text-gray-300 text-[10px]">~</span>
              <input 
                type="date" 
                className="flex-1 bg-gray-50 dark:bg-gray-900 border-none rounded-lg text-[10px] lg:text-xs p-2 lg:p-3"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between gap-4">
          <button 
            onClick={clearFilters}
            className="text-[11px] font-bold text-gray-400 hover:text-gray-600"
          >
            필터 초기화
          </button>
          <div className="flex gap-2">
            <button 
              onClick={handleSearch}
              className="lg:hidden bg-secondary text-white px-6 py-2 rounded-lg text-[11px] font-bold"
            >
              필터 적용
            </button>
            <button 
              onClick={handleSearch}
              className="hidden lg:block bg-secondary text-white px-8 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
            >
              검색
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-gray-500">
          총 <span className="font-bold text-primary">{filteredCustomers.length}</span>명의 고객
        </p>
        {selectedCustomerIds.length > 0 && (
          <p className="text-xs text-primary font-bold">
            {selectedCustomerIds.length}명 선택됨
          </p>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px] lg:min-w-[1000px]">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-[9px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded text-primary size-3 lg:size-4"
                    checked={allSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-3">Contact 도래</th>
                <th className="p-3">고객명</th>
                <th className="p-3">연락처</th>
                <th className="p-3">최근 Contact</th>
                <th className="p-3 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
                    <p className="text-sm">검색 결과가 없습니다</p>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map(customer => (
                  <tr 
                    key={customer.id} 
                    className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer ${selectedCustomerIds.includes(customer.id) ? 'bg-primary/5' : ''}`} 
                    onClick={() => navigateTo('CUSTOMER_DETAIL', customer.id)}
                  >
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded text-primary size-3 lg:size-4"
                        checked={selectedCustomerIds.includes(customer.id)}
                        onChange={() => toggleCustomerSelection(customer.id)}
                      />
                    </td>
                    <td className="p-3">
                      <span className={`text-[11px] lg:text-sm font-black ${customer.contactDueDays < 0 ? 'text-red-500' : customer.contactDueDays === 0 ? 'text-primary' : 'text-gray-600'}`}>
                        {customer.contactDueDays === 0 ? 'Today' : customer.contactDueDays > 90 ? '-' : `${customer.contactDueDays > 0 ? '+' : ''}${customer.contactDueDays}일`}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] lg:text-sm font-bold">{customer.name}</span>
                        {customer.isNew && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[8px] font-bold rounded">NEW</span>
                        )}
                        {customer.tier && (
                          <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${
                            customer.tier === 'Platinum Elite' ? 'bg-purple-100 text-purple-600' :
                            customer.tier === 'Gold Medal' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {customer.tier.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-[10px] lg:text-sm text-gray-500">{customer.phone}</td>
                    <td className="p-3 text-[10px] lg:text-sm text-gray-500">{customer.lastContact}</td>
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => openContactModal(customer.id, customer.name)}
                        className="bg-secondary hover:bg-primary text-white text-[9px] lg:text-[10px] px-2 py-1 lg:px-3 lg:py-1.5 rounded transition-colors"
                      >
                        기록
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination & Bulk Actions */}
        <div className="p-3 lg:p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex gap-1.5 order-2 sm:order-1">
            <button 
              onClick={handleBulkDelete}
              disabled={selectedCustomerIds.length === 0}
              className={`px-3 py-1.5 text-[10px] font-bold text-red-500 border border-red-100 rounded-lg bg-white dark:bg-gray-800 transition-opacity ${selectedCustomerIds.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50'}`}
            >
              삭제 ({selectedCustomerIds.length})
            </button>
            <button 
              onClick={handlePostpone}
              disabled={selectedCustomerIds.length === 0}
              className={`px-3 py-1.5 text-[10px] font-bold text-gray-500 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 transition-opacity ${selectedCustomerIds.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            >
              미루기 (7일)
            </button>
          </div>
          <div className="flex gap-1 order-1 sm:order-2">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded-lg text-[10px] font-bold hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <button 
                  key={page} 
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-colors ${page === currentPage ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  {page}
                </button>
              );
            })}
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 rounded-lg text-[10px] font-bold hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)} title="삭제 확인" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            선택한 <span className="font-bold text-red-500">{selectedCustomerIds.length}명</span>의 고객을 삭제하시겠습니까?
          </p>
          <p className="text-xs text-gray-400">이 작업은 되돌릴 수 없습니다.</p>
          <div className="flex gap-3 pt-4">
            <button 
              onClick={() => setConfirmDeleteOpen(false)}
              className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm"
            >
              취소
            </button>
            <button 
              onClick={confirmBulkDelete}
              className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600"
            >
              삭제
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerDB;
