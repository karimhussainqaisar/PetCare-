import React, { useState } from 'react';
import { FeedingRecord } from '../types';
import { FormulaTooltip } from './FormulaTooltip';
import { Utensils, Plus, Clock, Pencil, Trash2, X } from 'lucide-react';

interface FeedingTrackerViewProps {
  feedings: FeedingRecord[];
  showFormulas: boolean;
  onAddFeeding: (f: Omit<FeedingRecord, 'id'>) => void;
  onDeleteFeeding?: (id: string) => void;
  onEditFeeding?: (f: FeedingRecord) => void;
}

export const FeedingTrackerView: React.FC<FeedingTrackerViewProps> = ({
  feedings = [],
  showFormulas,
  onAddFeeding,
  onDeleteFeeding,
  onEditFeeding,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newFeed, setNewFeed] = useState({
    date: new Date().toISOString().split('T')[0],
    meal: 'Breakfast' as FeedingRecord['meal'],
    food: '',
    amount: '120g',
    time: '08:00 AM',
    notes: '',
  });

  const handleStartAdd = () => {
    setEditingId(null);
    setNewFeed({
      date: new Date().toISOString().split('T')[0],
      meal: 'Breakfast',
      food: '',
      amount: '120g',
      time: '08:00 AM',
      notes: '',
    });
    setShowAddForm(true);
  };

  const handleStartEdit = (f: FeedingRecord) => {
    setEditingId(f.id);
    setNewFeed({
      date: f.date,
      meal: f.meal,
      food: f.food,
      amount: f.amount,
      time: f.time,
      notes: f.notes || '',
    });
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeed.food) return;

    if (editingId && onEditFeeding) {
      const existing = feedings.find((item) => item.id === editingId);
      onEditFeeding({
        id: editingId,
        petId: existing?.petId || 'pet-bella',
        ...newFeed,
      });
    } else {
      onAddFeeding({
        petId: feedings[0]?.petId || 'pet-bella',
        ...newFeed,
      });
    }

    setShowAddForm(false);
    setEditingId(null);
    setNewFeed({
      date: new Date().toISOString().split('T')[0],
      meal: 'Breakfast',
      food: '',
      amount: '120g',
      time: '08:00 AM',
      notes: '',
    });
  };

  const handleDelete = (id: string) => {
    onDeleteFeeding?.(id);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold font-mono">
              SHEET: tblFeeding
            </span>
            <span className="text-xs text-slate-400">• Meal Portions & Timings</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Daily Feeding & Dietary Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log dry kibble, wet cans, raw meals, toppers, supplements, and exact serving times.
          </p>
        </div>

        <button
          onClick={handleStartAdd}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log Feeding</span>
        </button>
      </div>

      {/* Add / Edit Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-emerald-50/50 dark:bg-slate-800/80 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 space-y-4 animate-fade-in"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-300">
              {editingId ? 'Edit Meal Entry' : 'Log Meal Serving'}
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
                value={newFeed.date}
                onChange={(e) => setNewFeed({ ...newFeed, date: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Meal Type
              </label>
              <select
                value={newFeed.meal}
                onChange={(e) => setNewFeed({ ...newFeed, meal: e.target.value as FeedingRecord['meal'] })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
                <option value="Supplements">Supplements</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Time
              </label>
              <input
                type="text"
                placeholder="08:00 AM"
                value={newFeed.time}
                onChange={(e) => setNewFeed({ ...newFeed, time: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Food Description & Formula
              </label>
              <input
                type="text"
                required
                placeholder="Dry Salmon Formula, Joint Chew, Bone Broth..."
                value={newFeed.food}
                onChange={(e) => setNewFeed({ ...newFeed, food: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Amount / Portion
              </label>
              <input
                type="text"
                placeholder="120g, 1 cup, 1 can..."
                value={newFeed.amount}
                onChange={(e) => setNewFeed({ ...newFeed, amount: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-emerald-600"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notes
              </label>
              <input
                type="text"
                placeholder="Ate eagerly, mixed with water..."
                value={newFeed.notes}
                onChange={(e) => setNewFeed({ ...newFeed, notes: e.target.value })}
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
            >
              Save Meal Entry
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
                <th className="p-3">Date</th>
                <th className="p-3">Meal</th>
                <th className="p-3">Food & Ingredients</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Time</th>
                <th className="p-3">Notes</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {feedings.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {f.date}
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{f.meal}</td>
                  <td className="p-3 font-semibold">{f.food}</td>
                  <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {f.amount}
                  </td>
                  <td className="p-3 font-mono text-slate-500">{f.time}</td>
                  <td className="p-3 text-slate-500 max-w-xs truncate">{f.notes || '—'}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleStartEdit(f)}
                        className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition cursor-pointer"
                        title="Edit feeding record"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                        title="Delete feeding record"
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
