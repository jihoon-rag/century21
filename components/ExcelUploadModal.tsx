
import React, { useState, useRef } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedCustomer {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  memo?: string;
}

const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({ isOpen, onClose }) => {
  const { addCustomers, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<ParsedCustomer[]>([]);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        showToast('파일에 데이터가 없습니다.', 'error');
        setIsLoading(false);
        return;
      }

      // Parse header
      const header = lines[0].split(',').map(h => h.trim().toLowerCase());
      const nameIdx = header.findIndex(h => h.includes('이름') || h.includes('name') || h.includes('고객명'));
      const phoneIdx = header.findIndex(h => h.includes('연락처') || h.includes('phone') || h.includes('전화'));
      const emailIdx = header.findIndex(h => h.includes('이메일') || h.includes('email'));
      const addressIdx = header.findIndex(h => h.includes('주소') || h.includes('address'));
      const memoIdx = header.findIndex(h => h.includes('메모') || h.includes('memo') || h.includes('비고'));

      if (nameIdx === -1 || phoneIdx === -1) {
        showToast('필수 컬럼(이름, 연락처)을 찾을 수 없습니다.', 'error');
        setIsLoading(false);
        return;
      }

      // Parse data rows
      const customers: ParsedCustomer[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values[nameIdx] && values[phoneIdx]) {
          customers.push({
            name: values[nameIdx]?.trim() || '',
            phone: values[phoneIdx]?.trim() || '',
            email: emailIdx >= 0 ? values[emailIdx]?.trim() : undefined,
            address: addressIdx >= 0 ? values[addressIdx]?.trim() : undefined,
            memo: memoIdx >= 0 ? values[memoIdx]?.trim() : undefined,
          });
        }
      }

      setParsedData(customers);
      setStep('preview');
    } catch (error) {
      showToast('파일 파싱 중 오류가 발생했습니다.', 'error');
    }
    
    setIsLoading(false);
  };

  // Simple CSV parser that handles quoted values
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const handleImport = () => {
    if (parsedData.length === 0) {
      showToast('가져올 데이터가 없습니다.', 'warning');
      return;
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    const customersToAdd = parsedData.map(c => ({
      name: c.name,
      phone: c.phone,
      email: c.email,
      address: c.address,
      memo: c.memo,
      lastContact: dateStr,
      registrationDate: dateStr,
      status: 'ACTIVE' as const,
      contactDueDays: 14,
      isNew: true,
    }));

    addCustomers(customersToAdd);
    handleClose();
  };

  const handleClose = () => {
    setParsedData([]);
    setFileName('');
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const downloadTemplate = () => {
    const csvContent = '고객명,연락처,이메일,주소,메모\n홍길동,010-1234-5678,hong@email.com,서울시 강남구,VIP 고객';
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '고객_업로드_템플릿.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('템플릿이 다운로드되었습니다.', 'success');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="고객 대량 업로드" size="lg">
      {step === 'upload' ? (
        <div className="space-y-6">
          <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl hover:border-primary/50 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileSelect}
              className="hidden"
              id="excel-upload"
            />
            <label htmlFor="excel-upload" className="cursor-pointer">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">upload_file</span>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                CSV 파일을 선택하거나 드래그하세요
              </p>
              <p className="text-xs text-gray-400 mt-2">
                .csv, .txt 파일 지원 (UTF-8 인코딩)
              </p>
            </label>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              파일 형식 안내
            </h4>
            <ul className="text-xs text-gray-500 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                첫 번째 행은 헤더(컬럼명)로 인식됩니다
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                필수 컬럼: <span className="font-bold text-gray-700 dark:text-gray-300">고객명, 연락처</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                선택 컬럼: 이메일, 주소, 메모
              </li>
            </ul>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-xs font-bold text-primary hover:underline mt-3"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              템플릿 파일 다운로드
            </button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-500">check_circle</span>
              <span className="text-sm font-bold">{fileName}</span>
            </div>
            <span className="text-xs text-gray-400">
              {parsedData.length}명의 고객 데이터
            </span>
          </div>

          <div className="max-h-64 overflow-auto rounded-xl border border-gray-100 dark:border-gray-800">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                <tr>
                  <th className="p-3 text-left font-bold text-gray-500">#</th>
                  <th className="p-3 text-left font-bold text-gray-500">고객명</th>
                  <th className="p-3 text-left font-bold text-gray-500">연락처</th>
                  <th className="p-3 text-left font-bold text-gray-500">이메일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {parsedData.slice(0, 50).map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="p-3 text-gray-400">{i + 1}</td>
                    <td className="p-3 font-bold">{c.name}</td>
                    <td className="p-3 text-gray-500">{c.phone}</td>
                    <td className="p-3 text-gray-400">{c.email || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedData.length > 50 && (
              <div className="p-3 text-center text-xs text-gray-400 bg-gray-50 dark:bg-gray-900">
                ... 외 {parsedData.length - 50}명
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => { setStep('upload'); setParsedData([]); }}
              className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50"
            >
              다시 선택
            </button>
            <button
              onClick={handleImport}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:brightness-95"
            >
              {parsedData.length}명 등록하기
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ExcelUploadModal;
