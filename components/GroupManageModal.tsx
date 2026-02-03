
import React, { useState } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';

interface GroupManageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GROUP_COLORS = [
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

const GroupManageModal: React.FC<GroupManageModalProps> = ({ isOpen, onClose }) => {
  const { customerGroups, addCustomerGroup, updateCustomerGroup, deleteCustomerGroup, customers, showToast } = useApp();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(GROUP_COLORS[0]);
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const getCustomerCountByGroup = (groupId: string) => {
    return customers.filter(c => c.groups?.includes(groupId)).length;
  };

  const handleAddGroup = () => {
    if (!newGroupName.trim()) {
      showToast('그룹명을 입력해주세요.', 'warning');
      return;
    }
    addCustomerGroup({
      name: newGroupName.trim(),
      color: newGroupColor,
      description: newGroupDesc.trim() || undefined,
    });
    setNewGroupName('');
    setNewGroupDesc('');
    setNewGroupColor(GROUP_COLORS[0]);
    setShowAddForm(false);
  };

  const handleUpdateGroup = (id: string, name: string, color: string, description?: string) => {
    updateCustomerGroup(id, { name, color, description });
    setEditingId(null);
  };

  const handleDeleteGroup = (id: string) => {
    const count = getCustomerCountByGroup(id);
    if (count > 0) {
      if (!confirm(`이 그룹에 ${count}명의 고객이 있습니다. 삭제하시겠습니까?`)) {
        return;
      }
    }
    deleteCustomerGroup(id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="고객 그룹 관리" size="lg">
      <div className="space-y-4">
        {/* Group List */}
        <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
          {customerGroups.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <span className="material-symbols-outlined text-4xl mb-2">folder_off</span>
              <p className="text-sm">등록된 그룹이 없습니다</p>
            </div>
          ) : (
            customerGroups.map((group) => (
              <div
                key={group.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {editingId === group.id ? (
                  <EditGroupRow
                    group={group}
                    onSave={(name, color, desc) => handleUpdateGroup(group.id, name, color, desc)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: group.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{group.name}</p>
                      {group.description && (
                        <p className="text-[10px] text-gray-400 truncate">{group.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-bold">
                      {getCustomerCountByGroup(group.id)}명
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingId(group.id)}
                        className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm text-gray-400">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm text-red-400">delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add New Group */}
        {showAddForm ? (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="그룹명 *"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="flex-1 bg-white dark:bg-gray-800 border-none rounded-lg text-sm p-2.5 focus:ring-1 focus:ring-primary"
              />
            </div>
            <input
              type="text"
              placeholder="설명 (선택)"
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border-none rounded-lg text-sm p-2.5 focus:ring-1 focus:ring-primary"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-bold">색상:</span>
              <div className="flex gap-1.5 flex-wrap">
                {GROUP_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewGroupColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform ${newGroupColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setShowAddForm(false); setNewGroupName(''); setNewGroupDesc(''); }}
                className="flex-1 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold"
              >
                취소
              </button>
              <button
                onClick={handleAddGroup}
                className="flex-1 py-2 bg-primary text-white rounded-lg text-xs font-bold"
              >
                추가
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-400 hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            새 그룹 추가
          </button>
        )}
      </div>
    </Modal>
  );
};

// Edit Group Row Component
interface EditGroupRowProps {
  group: { id: string; name: string; color: string; description?: string };
  onSave: (name: string, color: string, description?: string) => void;
  onCancel: () => void;
}

const EditGroupRow: React.FC<EditGroupRowProps> = ({ group, onSave, onCancel }) => {
  const [name, setName] = useState(group.name);
  const [color, setColor] = useState(group.color);
  const [desc, setDesc] = useState(group.description || '');

  return (
    <div className="flex-1 space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-white dark:bg-gray-800 border-none rounded-lg text-sm p-2 focus:ring-1 focus:ring-primary"
        />
      </div>
      <input
        type="text"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="설명"
        className="w-full bg-white dark:bg-gray-800 border-none rounded-lg text-xs p-2 focus:ring-1 focus:ring-primary"
      />
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {GROUP_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-full ${color === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex gap-1">
          <button
            onClick={onCancel}
            className="px-3 py-1 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-lg"
          >
            취소
          </button>
          <button
            onClick={() => onSave(name, color, desc || undefined)}
            className="px-3 py-1 text-xs font-bold bg-primary text-white rounded-lg"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupManageModal;
