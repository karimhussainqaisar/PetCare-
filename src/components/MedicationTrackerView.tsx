import React, { useState } from 'react';
import { Medication } from '../types';
import { getMedicationStatus } from '../utils/petCalculations';
import { FormulaTooltip } from './FormulaTooltip';
import { Pill, Plus, Clock, CheckCircle, Pencil, Trash2, X } from 'lucide-react';

interface MedicationTrackerViewProps {
  petId?: string;
  medications: Medication[];
  showFormulas: boolean;
  onAddMedication: (med: Omit<Medication, 'id'>) => void;
  onDeleteMedication?: (id: string) => void;
  onEditMedication?: (med: Medication) => void;
}

export const MedicationTrackerView: React.FC<MedicationTrackerViewProps> = ({
  petId,
  medications = [],
  showFormulas,
  onAddMedication,
  onDeleteMedication,
  onEditMedication,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newMed, setNewMed] = useState({
    medication: '',
    dose: '',
    frequency: 'Once daily',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    cost: 25,
    notes: '',
  });

  const handleStartAdd = () => {
    setEditingId(null);
    setNewMed({
      medication: '',
      dose: '',
      frequency: 'Once daily',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      cost: 25,
      notes: '',
    });
    setShowAddForm(true);
  };

  const handleStartEdit = (m: Medication) => {
    setEditingId(m.id);
    setNewMed({
      medication: m.medication,
      dose: m.dose,
      frequency: m.frequency,
      startDate: m.startDate,
      endDate: m.endDate,
      cost: m.cost,
      notes: m.notes || '',
    });
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.medication) return;

    if (editingId && onEditMedication) {
      const existing = medications.find((item) => item.id === editingId);
      onEditMedication({
        id: editingId,
        petId: existing?.petId || petId || 'pet-bella',
        ...newMed,
      });
    } else {
      onAddMedication({
        petId: petId || medications[0]?.petId || 'pet-bella',
        ...newMed,
      });
    }

    setShowAddForm(false);
    setEditingId(null);
    setNewMed({
      medication: '',
      dose: '',
      frequency: 'Once daily',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      cost: 25,
      notes: '',
    });
  };

  const handleDelete = (id: string) => {
    onDeleteMedication?.(id);
  };

  const activeCount = medications.filter(
    (m) => getMedicationStatus(m.startDate, m.endDate).status === 'ACTIVE'
  ).length;
  const totalCost = medications.reduce((sum, m) => sum + (m.cost || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold font-mono">
              SHEET: tblMedications
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              🔄 Synced to Master Expenses
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Medication & Prescription Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tracks dosage, frequency, course end dates, and days remaining. Prescription costs automatically sync with the Expense Tracker.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Total Cost Badge */}
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-right">
            <div className="text-[11px] font-bold text-slate-500 uppercase">
              Total Medication Spend
            </div>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
              ${totalCost.toFixed(2)}
            </div>
            <FormulaTooltip formula="=SUM(tblMedications[Cost])" showAlways={showFormulas} />
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
            🟢 Active Courses: {activeCount}
          </div>

          <button
            onClick={handleStartAdd}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medication</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-amber-50/50 dark:bg-slate-800/80 p-5 rounded-2xl border border-amber-200 dark:border-amber-800/50 space-y-4 animate-fade-in"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-amber-900 dark:text-amber-300">
              {editingId ? 'Edit Prescription Record' : 'Log New Medication or Flea/Tick Preventive'}
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
                Medication Name
              </label>
              <input
                type="text"
                required
                placeholder="NexGard, Heartgard, Apoquel..."
                value={newMed.medication}
                onChange={(e) => setNewMed({ ...newMed, medication: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Dosage
              </label>
              <input
                type="text"
                placeholder="1 chewable (28mg), 1/2 tablet..."
                value={newMed.dose}
                onChange={(e) => setNewMed({ ...newMed, dose: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Frequency
              </label>
              <input
                type="text"
                placeholder="Monthly, Daily with meals..."
                value={newMed.frequency}
                onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={newMed.startDate}
                onChange={(e) => setNewMed({ ...newMed, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                required
                value={newMed.endDate}
                onChange={(e) => setNewMed({ ...newMed, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={newMed.cost}
                onChange={(e) => setNewMed({ ...newMed, cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notes / Special Refill Instructions
              </label>
              <input
                type="text"
                placeholder="Take with food, chewable beef flavor..."
                value={newMed.notes}
                onChange={(e) => setNewMed({ ...newMed, notes: e.target.value })}
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
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl"
            >
              Save Medication
            </button>
          </div>
        </form>
      )}

      {/* Table Display */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Medication</th>
                <th className="p-3">Dose</th>
                <th className="p-3">Frequency</th>
                <th className="p-3">Start Date</th>
                <th className="p-3">End Date</th>
                <th className="p-3 text-right">Cost</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Days Remaining</th>
                <th className="p-3">Notes</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {medications.map((m) => {
                const st = getMedicationStatus(m.startDate, m.endDate);
                return (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-amber-500" />
                      <span>{m.medication}</span>
                    </td>
                    <td className="p-3 font-semibold">{m.dose}</td>
                    <td className="p-3">{m.frequency}</td>
                    <td className="p-3 font-mono">{m.startDate}</td>
                    <td className="p-3 font-mono">{m.endDate}</td>
                    <td className="p-3 text-right font-bold">${m.cost.toFixed(2)}</td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${st.badgeClass}`}>
                          {st.status}
                        </span>
                        <FormulaTooltip formula={st.formula} showAlways={showFormulas} />
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-900 dark:text-white font-mono">
                      {st.daysRemaining} days
                      <FormulaTooltip
                        formula="=MAX(0, [@[End Date]] - TODAY())"
                        showAlways={showFormulas}
                      />
                    </td>
                    <td className="p-3 text-slate-500 max-w-xs truncate">{m.notes}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleStartEdit(m)}
                          className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition cursor-pointer"
                          title="Edit medication"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Delete medication"
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
