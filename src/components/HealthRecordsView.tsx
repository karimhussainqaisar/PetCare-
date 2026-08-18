import React, { useState } from 'react';
import { HealthRecord } from '../types';
import { FormulaTooltip } from './FormulaTooltip';
import { Stethoscope, Plus, Search, Calendar, DollarSign, Filter, Pencil, Trash2, X } from 'lucide-react';

interface HealthRecordsViewProps {
  records?: HealthRecord[];
  healthRecords?: HealthRecord[];
  showFormulas: boolean;
  onAddRecord?: (record: Omit<HealthRecord, 'id'>) => void;
  onAddHealthRecord?: (record: Omit<HealthRecord, 'id'>) => void;
  onDeleteRecord?: (id: string) => void;
  onDeleteHealthRecord?: (id: string) => void;
  onEditRecord?: (record: HealthRecord) => void;
  onEditHealthRecord?: (record: HealthRecord) => void;
}

export const HealthRecordsView: React.FC<HealthRecordsViewProps> = ({
  records,
  healthRecords,
  showFormulas,
  onAddRecord,
  onAddHealthRecord,
  onDeleteRecord,
  onDeleteHealthRecord,
  onEditRecord,
  onEditHealthRecord,
}) => {
  const actualRecords = records || healthRecords || [];
  const handleAdd = onAddRecord || onAddHealthRecord || (() => {});
  const handleDeleteFn = onDeleteRecord || onDeleteHealthRecord || (() => {});
  const handleEditFn = onEditRecord || onEditHealthRecord || (() => {});

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newForm, setNewForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Checkup' as HealthRecord['type'],
    description: '',
    vet: '',
    cost: 0,
    followUpDate: '',
    notes: '',
  });

  const filteredRecords = actualRecords.filter((r) => {
    const matchesSearch =
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || r.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalCost = filteredRecords.reduce((sum, r) => sum + r.cost, 0);

  const handleStartAdd = () => {
    setEditingId(null);
    setNewForm({
      date: new Date().toISOString().split('T')[0],
      type: 'Checkup',
      description: '',
      vet: '',
      cost: 0,
      followUpDate: '',
      notes: '',
    });
    setShowAddForm(true);
  };

  const handleStartEdit = (r: HealthRecord) => {
    setEditingId(r.id);
    setNewForm({
      date: r.date,
      type: r.type,
      description: r.description,
      vet: r.vet,
      cost: r.cost,
      followUpDate: r.followUpDate || '',
      notes: r.notes || '',
    });
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.description) return;

    if (editingId) {
      const existing = actualRecords.find((rec) => rec.id === editingId);
      handleEditFn({
        id: editingId,
        petId: existing?.petId || 'pet-bella',
        ...newForm,
      });
    } else {
      handleAdd({
        petId: actualRecords[0]?.petId || 'pet-bella',
        ...newForm,
      });
    }

    setShowAddForm(false);
    setEditingId(null);
    setNewForm({
      date: new Date().toISOString().split('T')[0],
      type: 'Checkup',
      description: '',
      vet: '',
      cost: 0,
      followUpDate: '',
      notes: '',
    });
  };

  const handleDelete = (id: string) => {
    handleDeleteFn(id);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Stats Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-purple-100 text-purple-800 rounded-lg text-xs font-bold font-mono">
              SHEET: tblHealth
            </span>
            <span className="text-xs text-slate-400">• Health Database</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Veterinary & Health History Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log annual checkups, dental cleanings, surgeries, and routine exams.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-right">
            <div className="text-[11px] font-bold text-slate-500 uppercase">
              Total Medical Spend
            </div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
              ${totalCost.toFixed(2)}
            </div>
            <FormulaTooltip formula="=SUM(tblHealth[Cost])" showAlways={showFormulas} />
          </div>

          <button
            onClick={handleStartAdd}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Health Record</span>
          </button>
        </div>
      </div>

      {/* Inline Add/Edit Modal Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-purple-50/50 dark:bg-slate-800/80 p-5 rounded-2xl border border-purple-200 dark:border-purple-800/50 space-y-4 animate-fade-in"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-purple-900 dark:text-purple-300">
              {editingId ? 'Edit Health Record' : 'Log New Health Record'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
              }}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={newForm.date}
                onChange={(e) => setNewForm({ ...newForm, date: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <select
                value={newForm.type}
                onChange={(e) => setNewForm({ ...newForm, type: e.target.value as HealthRecord['type'] })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              >
                <option value="Checkup">Checkup</option>
                <option value="Surgery">Surgery</option>
                <option value="Vaccination">Vaccination</option>
                <option value="Dental">Dental</option>
                <option value="Emergency">Emergency</option>
                <option value="Routine">Routine</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={newForm.cost}
                onChange={(e) => setNewForm({ ...newForm, cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <input
                type="text"
                required
                placeholder="Annual wellness exam, physical checkup..."
                value={newForm.description}
                onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Veterinarian Name
              </label>
              <input
                type="text"
                placeholder="Dr. Smith"
                value={newForm.vet}
                onChange={(e) => setNewForm({ ...newForm, vet: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Follow-Up Date
              </label>
              <input
                type="date"
                value={newForm.followUpDate}
                onChange={(e) => setNewForm({ ...newForm, followUpDate: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notes
              </label>
              <input
                type="text"
                placeholder="Healthy heart, glossy coat..."
                value={newForm.notes}
                onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl"
            >
              Save Record
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search procedure, vet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700"
          >
            <option value="ALL">All Event Types</option>
            <option value="Checkup">Checkup</option>
            <option value="Surgery">Surgery</option>
            <option value="Vaccination">Vaccination</option>
            <option value="Dental">Dental</option>
            <option value="Emergency">Emergency</option>
            <option value="Routine">Routine</option>
          </select>
        </div>
      </div>

      {/* Table Display - Excel Style Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Type</th>
                <th className="p-3">Description</th>
                <th className="p-3">Vet</th>
                <th className="p-3 text-right">Cost</th>
                <th className="p-3">Follow-Up</th>
                <th className="p-3">Notes</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono text-purple-600 dark:text-purple-400 font-semibold">
                      {r.date}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                        {r.type}
                      </span>
                    </td>
                    <td className="p-3 font-semibold">{r.description}</td>
                    <td className="p-3">{r.vet}</td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                      ${r.cost.toFixed(2)}
                    </td>
                    <td className="p-3 font-mono text-slate-500">{r.followUpDate || '—'}</td>
                    <td className="p-3 text-slate-500 max-w-xs truncate">{r.notes}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleStartEdit(r)}
                          className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition cursor-pointer"
                          title="Edit record"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No health records found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
