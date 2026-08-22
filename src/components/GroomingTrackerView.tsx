import React, { useState } from 'react';
import { GroomingRecord, GroomingServiceType } from '../types';
import { getGroomingStatus } from '../utils/petCalculations';
import { FormulaTooltip } from './FormulaTooltip';
import { Scissors, Plus, Sparkles, AlertTriangle, CheckCircle2, Pencil, Trash2, X } from 'lucide-react';

interface GroomingTrackerViewProps {
  petId?: string;
  groomings: GroomingRecord[];
  showFormulas: boolean;
  onAddGrooming: (g: Omit<GroomingRecord, 'id'>) => void;
  onDeleteGrooming?: (id: string) => void;
  onEditGrooming?: (g: GroomingRecord) => void;
}

export const GROOMING_SERVICES: GroomingServiceType[] = [
  'Bath',
  'Haircut',
  'Nail Trimming',
  'Ear Cleaning',
  'Teeth Cleaning',
  'Flea Treatment',
  'De-shedding',
  'Other',
];

export const GroomingTrackerView: React.FC<GroomingTrackerViewProps> = ({
  petId,
  groomings = [],
  showFormulas,
  onAddGrooming,
  onDeleteGrooming,
  onEditGrooming,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newGrm, setNewGrm] = useState({
    service: 'Bath' as GroomingServiceType,
    lastDate: new Date().toISOString().split('T')[0],
    nextDue: '',
    notes: '',
  });

  const handleStartAdd = () => {
    setEditingId(null);
    setNewGrm({
      service: 'Bath',
      lastDate: new Date().toISOString().split('T')[0],
      nextDue: '',
      notes: '',
    });
    setShowAddForm(true);
  };

  const handleStartEdit = (g: GroomingRecord) => {
    setEditingId(g.id);
    setNewGrm({
      service: g.service,
      lastDate: g.lastDate,
      nextDue: g.nextDue,
      notes: g.notes || '',
    });
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId && onEditGrooming) {
      const existing = groomings.find((item) => item.id === editingId);
      onEditGrooming({
        id: editingId,
        petId: existing?.petId || petId || 'pet-bella',
        ...newGrm,
      });
    } else {
      onAddGrooming({
        petId: petId || groomings[0]?.petId || 'pet-bella',
        ...newGrm,
      });
    }

    setShowAddForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    onDeleteGrooming?.(id);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-pink-100 text-pink-800 rounded-lg text-xs font-bold font-mono">
              SHEET: tblGrooming
            </span>
            <span className="text-xs text-slate-400">• Grooming & Hygiene Schedule</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Grooming & Hygiene Care Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitors bath intervals, nail clips, ear washings, and coat de-shedding.
          </p>
        </div>

        <button
          onClick={handleStartAdd}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Grooming Record</span>
        </button>
      </div>

      {/* Add / Edit Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-pink-50/50 dark:bg-slate-800/80 p-5 rounded-2xl border border-pink-200 dark:border-pink-800/50 space-y-4 animate-fade-in"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-pink-900 dark:text-pink-300">
              {editingId ? 'Edit Grooming Session' : 'Log Grooming Session'}
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
                Grooming Service
              </label>
              <select
                value={newGrm.service}
                onChange={(e) => setNewGrm({ ...newGrm, service: e.target.value as GroomingServiceType })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                {GROOMING_SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Last Performed Date
              </label>
              <input
                type="date"
                required
                value={newGrm.lastDate}
                onChange={(e) => setNewGrm({ ...newGrm, lastDate: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Next Due Date
              </label>
              <input
                type="date"
                required
                value={newGrm.nextDue}
                onChange={(e) => setNewGrm({ ...newGrm, nextDue: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notes
              </label>
              <input
                type="text"
                placeholder="Salon name, shampoo formula used..."
                value={newGrm.notes}
                onChange={(e) => setNewGrm({ ...newGrm, notes: e.target.value })}
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
              className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl"
            >
              Save Session
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Grooming Service</th>
                <th className="p-3">Last Performed</th>
                <th className="p-3">Next Due Date</th>
                <th className="p-3">Automated Status Alert</th>
                <th className="p-3">Notes</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {groomings.map((g) => {
                const st = getGroomingStatus(g.nextDue);
                return (
                  <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Scissors className="w-3.5 h-3.5 text-pink-500" />
                      <span>{g.service}</span>
                    </td>
                    <td className="p-3 font-mono">{g.lastDate}</td>
                    <td className="p-3 font-mono font-bold text-pink-600 dark:text-pink-400">
                      {g.nextDue}
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${st.badgeClass}`}>
                          {st.status}
                        </span>
                        <FormulaTooltip formula={st.formula} showAlways={showFormulas} />
                      </div>
                    </td>
                    <td className="p-3 text-slate-500 max-w-xs truncate">{g.notes || '—'}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleStartEdit(g)}
                          className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition cursor-pointer"
                          title="Edit grooming record"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(g.id)}
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Delete grooming record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
