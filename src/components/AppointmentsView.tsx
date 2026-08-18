import React, { useState } from 'react';
import { AppointmentTask, AppointmentCategory, PriorityLevel } from '../types';
import { FormulaTooltip } from './FormulaTooltip';
import { Calendar, Plus, CheckCircle2, Clock, Filter, AlertCircle, Pencil, Trash2, X } from 'lucide-react';

interface AppointmentsViewProps {
  appointments: AppointmentTask[];
  showFormulas: boolean;
  onAddAppointment: (apt: Omit<AppointmentTask, 'id'>) => void;
  onToggleComplete: (id: string) => void;
  onDeleteAppointment?: (id: string) => void;
  onEditAppointment?: (apt: AppointmentTask) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments = [],
  showFormulas,
  onAddAppointment,
  onToggleComplete,
  onDeleteAppointment,
  onEditAppointment,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>('ALL');

  const [newApt, setNewApt] = useState({
    date: new Date().toISOString().split('T')[0],
    task: '',
    category: 'Health' as AppointmentCategory,
    priority: 'Medium' as PriorityLevel,
    completed: false,
    notes: '',
  });

  const handleStartAdd = () => {
    setEditingId(null);
    setNewApt({
      date: new Date().toISOString().split('T')[0],
      task: '',
      category: 'Health',
      priority: 'Medium',
      completed: false,
      notes: '',
    });
    setShowAddForm(true);
  };

  const handleStartEdit = (a: AppointmentTask) => {
    setEditingId(a.id);
    setNewApt({
      date: a.date,
      task: a.task,
      category: a.category,
      priority: a.priority,
      completed: a.completed,
      notes: a.notes || '',
    });
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApt.task) return;

    if (editingId && onEditAppointment) {
      const existing = appointments.find((item) => item.id === editingId);
      onEditAppointment({
        id: editingId,
        petId: existing?.petId || 'pet-bella',
        ...newApt,
      });
    } else {
      onAddAppointment({
        petId: appointments[0]?.petId || 'pet-bella',
        ...newApt,
      });
    }

    setShowAddForm(false);
    setEditingId(null);
    setNewApt({
      date: new Date().toISOString().split('T')[0],
      task: '',
      category: 'Health',
      priority: 'Medium',
      completed: false,
      notes: '',
    });
  };

  const handleDelete = (id: string) => {
    onDeleteAppointment?.(id);
  };

  const filteredAppointments = appointments.filter((a) => {
    return filterCat === 'ALL' || a.category === filterCat;
  });

  // Dynamic Array Formula: Next 5 Upcoming Appointments
  const todayStr = new Date().toISOString().split('T')[0];
  const next5Upcoming = [...appointments]
    .filter((a) => a.date >= todayStr && !a.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-sky-100 text-sky-800 rounded-lg text-xs font-bold font-mono">
              SHEET: tblAppointments
            </span>
            <span className="text-xs text-slate-400">• Dynamic Task Calendar</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Appointments & Care To-Do Calendar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic array formulas auto-filter and sort upcoming visits with checkbox strikethroughs.
          </p>
        </div>

        <button
          onClick={handleStartAdd}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Care Task</span>
        </button>
      </div>

      {/* Next 5 Dynamic Array Formula Showcase Box */}
      <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-sky-800/60">
        <div className="flex items-center justify-between mb-3 border-b border-sky-800/80 pb-2">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>NEXT 5 UPCOMING APPOINTMENTS</span>
          </h3>
          <FormulaTooltip
            formula="=SORT(FILTER(tblAppointments, Date>=TODAY()), 1, 1)"
            showAlways={true}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
          {next5Upcoming.map((item) => (
            <div key={item.id} className="bg-slate-800/80 p-3 rounded-xl border border-sky-700/50 space-y-1">
              <div className="text-[10px] font-bold text-sky-300 font-mono">{item.date}</div>
              <div className="text-xs font-bold truncate text-white">{item.task}</div>
              <span className="inline-block text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-200">
                {item.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-sky-50/50 dark:bg-slate-800/80 p-5 rounded-2xl border border-sky-200 dark:border-sky-800/50 space-y-4 animate-fade-in"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-sky-900 dark:text-sky-300">
              {editingId ? 'Edit Appointment / Task' : 'Schedule Appointment / Add Task'}
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
                value={newApt.date}
                onChange={(e) => setNewApt({ ...newApt, date: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={newApt.category}
                onChange={(e) => setNewApt({ ...newApt, category: e.target.value as AppointmentCategory })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                <option value="Health">Health</option>
                <option value="Grooming">Grooming</option>
                <option value="Vaccination">Vaccination</option>
                <option value="Training">Training</option>
                <option value="Shopping">Shopping</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={newApt.priority}
                onChange={(e) => setNewApt({ ...newApt, priority: e.target.value as PriorityLevel })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                <option value="High">High 🔴</option>
                <option value="Medium">Medium 🟠</option>
                <option value="Low">Low 🟢</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Task Description
              </label>
              <input
                type="text"
                required
                placeholder="Vet appointment at 10 AM, Buy food refill..."
                value={newApt.task}
                onChange={(e) => setNewApt({ ...newApt, task: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notes
              </label>
              <input
                type="text"
                placeholder="Dr. Jenkins clinic room 2..."
                value={newApt.notes}
                onChange={(e) => setNewApt({ ...newApt, notes: e.target.value })}
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
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl"
            >
              Save Appointment
            </button>
          </div>
        </form>
      )}

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3 text-center">Done</th>
                <th className="p-3">Date</th>
                <th className="p-3">Task Description</th>
                <th className="p-3">Category</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Notes</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {filteredAppointments.map((a) => (
                <tr
                  key={a.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${
                    a.completed ? 'opacity-60 bg-slate-50/50' : ''
                  }`}
                >
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onToggleComplete(a.id)}
                      className={`w-5 h-5 rounded mx-auto flex items-center justify-center border transition ${
                        a.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 hover:border-emerald-500'
                      }`}
                    >
                      {a.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  </td>

                  <td className="p-3 font-mono text-sky-600 dark:text-sky-400 font-bold">
                    {a.date}
                  </td>

                  <td
                    className={`p-3 font-bold ${
                      a.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {a.task}
                  </td>

                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">
                      {a.category}
                    </span>
                  </td>

                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        a.priority === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : a.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {a.priority}
                    </span>
                  </td>

                  <td className="p-3 text-slate-500 max-w-xs truncate">{a.notes || '—'}</td>

                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleStartEdit(a)}
                        className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition cursor-pointer"
                        title="Edit task"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                        title="Delete task"
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
