import React, { useState } from 'react';
import { WeightRecord } from '../types';
import { Scale, Plus, TrendingUp, TrendingDown, Minus, Pencil, Trash2, X } from 'lucide-react';
import { FormulaTooltip } from './FormulaTooltip';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface WeightTrackerViewProps {
  weights: WeightRecord[];
  weightUnit: 'kg' | 'lbs';
  showFormulas: boolean;
  onAddWeight: (record: Omit<WeightRecord, 'id'>) => void;
  onDeleteWeight?: (id: string) => void;
  onEditWeight?: (record: WeightRecord) => void;
}

export const WeightTrackerView: React.FC<WeightTrackerViewProps> = ({
  weights = [],
  weightUnit,
  showFormulas,
  onAddWeight,
  onDeleteWeight,
  onEditWeight,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newVal, setNewVal] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: 26.0,
    unit: weightUnit,
    notes: '',
  });

  const sortedWeights = [...weights].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const startingWeight = sortedWeights[0]?.weight || 0;
  const currentWeight = sortedWeights[sortedWeights.length - 1]?.weight || 0;
  const netChange = currentWeight - startingWeight;

  const chartData = sortedWeights.map((w) => ({
    date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: w.weight,
  }));

  const handleStartAdd = () => {
    setEditingId(null);
    setNewVal({
      date: new Date().toISOString().split('T')[0],
      weight: 26.0,
      unit: weightUnit,
      notes: '',
    });
    setShowAddForm(true);
  };

  const handleStartEdit = (w: WeightRecord) => {
    setEditingId(w.id);
    setNewVal({
      date: w.date,
      weight: w.weight,
      unit: w.unit,
      notes: w.notes || '',
    });
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newVal.weight <= 0) return;

    if (editingId && onEditWeight) {
      const existing = weights.find((item) => item.id === editingId);
      onEditWeight({
        id: editingId,
        petId: existing?.petId || 'pet-bella',
        ...newVal,
      });
    } else {
      onAddWeight({
        petId: weights[0]?.petId || 'pet-bella',
        ...newVal,
      });
    }

    setShowAddForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    onDeleteWeight?.(id);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-purple-100 text-purple-800 rounded-lg text-xs font-bold font-mono">
              SHEET: tblWeight
            </span>
            <span className="text-xs text-slate-400">• Weight Log & Trend Line</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Weight Growth & Health Monitor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatic line chart and net weight gain/loss tracking.
          </p>
        </div>

        {/* Dashboard Metrics */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-right">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Starting Weight</div>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {startingWeight} {weightUnit}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-right">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Current Weight</div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {currentWeight} {weightUnit}
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border text-right ${
              netChange > 0
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : netChange < 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-50 text-slate-800 border-slate-200'
            }`}
          >
            <div className="text-[11px] font-bold uppercase">Net Change</div>
            <div className="text-lg font-bold flex items-center justify-end gap-1">
              {netChange > 0 ? (
                <TrendingUp className="w-4 h-4 text-amber-600" />
              ) : netChange < 0 ? (
                <TrendingDown className="w-4 h-4 text-emerald-600" />
              ) : (
                <Minus className="w-4 h-4 text-slate-500" />
              )}
              <span>
                {netChange > 0 ? `+${netChange.toFixed(1)}` : netChange.toFixed(1)} {weightUnit}
              </span>
            </div>
          </div>

          <button
            onClick={handleStartAdd}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Weight</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-purple-50/50 dark:bg-slate-800/80 p-5 rounded-2xl border border-purple-200 dark:border-purple-800/50 space-y-4 animate-fade-in"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-purple-900 dark:text-purple-300">
              {editingId ? 'Edit Weight Entry' : 'Log Weight Entry'}
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
                value={newVal.date}
                onChange={(e) => setNewVal({ ...newVal, date: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Weight ({weightUnit})
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={newVal.weight}
                onChange={(e) => setNewVal({ ...newVal, weight: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notes
              </label>
              <input
                type="text"
                placeholder="Spring weigh-in, post-grooming..."
                value={newVal.notes}
                onChange={(e) => setNewVal({ ...newVal, notes: e.target.value })}
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
              Save Weight
            </button>
          </div>
        </form>
      )}

      {/* Interactive Weight Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
          <span>Automatic Weight Trend Line Chart</span>
          <span className="text-xs text-slate-400 font-mono">Recharts Line Series</span>
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} />
              <Tooltip formatter={(val: number) => `${val} ${weightUnit}`} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ r: 5, fill: '#8b5cf6', strokeWidth: 2, stroke: '#ffffff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weight History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Weight</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Notes</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {sortedWeights.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-3 font-mono text-purple-600 dark:text-purple-400 font-bold">
                    {w.date}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                    {w.weight}
                  </td>
                  <td className="p-3 font-semibold text-slate-500">{w.unit}</td>
                  <td className="p-3 text-slate-500">{w.notes || '—'}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleStartEdit(w)}
                        className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition cursor-pointer"
                        title="Edit weight entry"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                        title="Delete weight entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
