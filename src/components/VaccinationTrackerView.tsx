import React, { useState } from 'react';
import { Vaccination } from '../types';
import { getVaccinationStatus } from '../utils/petCalculations';
import { FormulaTooltip } from './FormulaTooltip';
import { Syringe, Plus, AlertCircle, CheckCircle, Clock, Pencil, Trash2, X } from 'lucide-react';

interface VaccinationTrackerViewProps {
  petId?: string;
  vaccinations: Vaccination[];
  showFormulas: boolean;
  onAddVaccination: (vac: Omit<Vaccination, 'id'>) => void;
  onDeleteVaccination?: (id: string) => void;
  onEditVaccination?: (vac: Vaccination) => void;
}

export const VaccinationTrackerView: React.FC<VaccinationTrackerViewProps> = ({
  petId,
  vaccinations = [],
  showFormulas,
  onAddVaccination,
  onDeleteVaccination,
  onEditVaccination,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newVac, setNewVac] = useState({
    vaccine: '',
    dateGiven: new Date().toISOString().split('T')[0],
    nextDue: '',
    veterinarian: '',
    batchNumber: '',
    cost: 35,
    notes: '',
  });

  const handleStartAdd = () => {
    setEditingId(null);
    setNewVac({
      vaccine: '',
      dateGiven: new Date().toISOString().split('T')[0],
      nextDue: '',
      veterinarian: '',
      batchNumber: '',
      cost: 35,
      notes: '',
    });
    setShowAddForm(true);
  };

  const handleStartEdit = (vac: Vaccination) => {
    setEditingId(vac.id);
    setNewVac({
      vaccine: vac.vaccine,
      dateGiven: vac.dateGiven,
      nextDue: vac.nextDue,
      veterinarian: vac.veterinarian,
      batchNumber: vac.batchNumber || '',
      cost: vac.cost,
      notes: vac.notes || '',
    });
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVac.vaccine) return;

    if (editingId && onEditVaccination) {
      const existing = vaccinations.find((item) => item.id === editingId);
      onEditVaccination({
        id: editingId,
        petId: existing?.petId || petId || 'pet-bella',
        ...newVac,
      });
    } else {
      onAddVaccination({
        petId: petId || vaccinations[0]?.petId || 'pet-bella',
        ...newVac,
      });
    }

    setShowAddForm(false);
    setEditingId(null);
    setNewVac({
      vaccine: '',
      dateGiven: new Date().toISOString().split('T')[0],
      nextDue: '',
      veterinarian: '',
      batchNumber: '',
      cost: 35,
      notes: '',
    });
  };

  const handleDelete = (id: string) => {
    onDeleteVaccination?.(id);
  };

  const overdueCount = vaccinations.filter((v) => getVaccinationStatus(v.nextDue).status === 'OVERDUE').length;
  const dueSoonCount = vaccinations.filter((v) => getVaccinationStatus(v.nextDue).status === 'DUE SOON').length;
  const totalCost = vaccinations.reduce((sum, v) => sum + (v.cost || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Status Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-rose-100 text-rose-800 rounded-lg text-xs font-bold font-mono">
              SHEET: tblVaccinations
            </span>
            <span className="text-xs text-rose-700 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
              🔄 Synced to Master Expenses
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Vaccination Schedule & Alert Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatic status formulas highlight overdue or upcoming booster shots. Costs automatically sync with the Expense Tracker and Budget.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Total Cost Badge */}
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-right">
            <div className="text-[11px] font-bold text-slate-500 uppercase">
              Total Vaccine Spend
            </div>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400">
              ${totalCost.toFixed(2)}
            </div>
            <FormulaTooltip formula="=SUM(tblVaccinations[Cost])" showAlways={showFormulas} />
          </div>

          {/* Status Counter Badges */}
          <div className="flex items-center space-x-2 text-xs font-bold">
            <span className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 border border-rose-300">
              🔴 Overdue: {overdueCount}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-300">
              🟠 Due Soon: {dueSoonCount}
            </span>
          </div>

          <button
            onClick={handleStartAdd}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vaccine</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Vaccine Modal */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-rose-50/50 dark:bg-slate-800/80 p-5 rounded-2xl border border-rose-200 dark:border-rose-800/50 space-y-4 animate-fade-in"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-rose-900 dark:text-rose-300">
              {editingId ? 'Edit Vaccination Record' : 'Log New Vaccination & Booster Date'}
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
                Vaccine Name (Required)
              </label>
              <input
                type="text"
                required
                placeholder="Rabies, DHPP, Bordetella..."
                value={newVac.vaccine}
                onChange={(e) => setNewVac({ ...newVac, vaccine: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date Given
              </label>
              <input
                type="date"
                required
                value={newVac.dateGiven}
                onChange={(e) => setNewVac({ ...newVac, dateGiven: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Next Due Date (Booster)
              </label>
              <input
                type="date"
                required
                value={newVac.nextDue}
                onChange={(e) => setNewVac({ ...newVac, nextDue: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Veterinarian
              </label>
              <input
                type="text"
                placeholder="Dr. Jenkins"
                value={newVac.veterinarian}
                onChange={(e) => setNewVac({ ...newVac, veterinarian: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Batch / Lot Number
              </label>
              <input
                type="text"
                placeholder="LOT-88219"
                value={newVac.batchNumber}
                onChange={(e) => setNewVac({ ...newVac, batchNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={newVac.cost}
                onChange={(e) => setNewVac({ ...newVac, cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notes
              </label>
              <input
                type="text"
                placeholder="3-year certificate issued, required for boarding..."
                value={newVac.notes}
                onChange={(e) => setNewVac({ ...newVac, notes: e.target.value })}
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
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl"
            >
              Save Vaccine
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
                <th className="p-3">Vaccine</th>
                <th className="p-3">Date Given</th>
                <th className="p-3">Next Due</th>
                <th className="p-3">Veterinarian</th>
                <th className="p-3">Batch/Lot #</th>
                <th className="p-3 text-right">Cost</th>
                <th className="p-3">Automated Status</th>
                <th className="p-3">Notes</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {vaccinations.map((vac) => {
                const st = getVaccinationStatus(vac.nextDue);
                return (
                  <tr key={vac.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Syringe className="w-3.5 h-3.5 text-rose-500" />
                      <span>{vac.vaccine}</span>
                    </td>
                    <td className="p-3 font-mono">{vac.dateGiven}</td>
                    <td className="p-3 font-mono font-bold text-rose-600 dark:text-rose-400">
                      {vac.nextDue}
                    </td>
                    <td className="p-3">{vac.veterinarian}</td>
                    <td className="p-3 font-mono text-slate-500">{vac.batchNumber || '—'}</td>
                    <td className="p-3 text-right font-bold">${vac.cost.toFixed(2)}</td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${st.badgeClass}`}>
                          {st.status}
                        </span>
                        <FormulaTooltip formula={st.formula} showAlways={showFormulas} />
                      </div>
                    </td>
                    <td className="p-3 text-slate-500 max-w-xs truncate">{vac.notes}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleStartEdit(vac)}
                          className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition cursor-pointer"
                          title="Edit vaccination"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(vac.id)}
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Delete vaccination"
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
