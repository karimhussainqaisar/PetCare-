import React, { useState } from 'react';
import { Expense, ExpenseCategory, Vaccination, Medication, HealthRecord } from '../types';
import { FormulaTooltip } from './FormulaTooltip';
import {
  calculatePetFinancialMetrics,
  getUnifiedExpenses,
  UnifiedExpense,
} from '../utils/petCalculations';
import {
  Receipt,
  Plus,
  Search,
  DollarSign,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Syringe,
  Pill,
  Stethoscope,
  CheckCircle2,
} from 'lucide-react';

interface ExpenseTrackerViewProps {
  petId?: string;
  expenses: Expense[];
  vaccinations?: Vaccination[];
  medications?: Medication[];
  healthRecords?: HealthRecord[];
  showFormulas: boolean;
  onAddExpense: (exp: Omit<Expense, 'id'>) => void;
  onDeleteExpense?: (id: string) => void;
  onEditExpense?: (exp: Expense) => void;
}

export const CATEGORIES: ExpenseCategory[] = [
  'Veterinary',
  'Medication',
  'Food',
  'Grooming',
  'Toys',
  'Training',
  'Insurance',
  'Boarding',
  'Accessories',
  'Other',
];

export const ExpenseTrackerView: React.FC<ExpenseTrackerViewProps> = ({
  petId = 'pet-bella',
  expenses = [],
  vaccinations = [],
  medications = [],
  healthRecords = [],
  showFormulas,
  onAddExpense,
  onDeleteExpense,
  onEditExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const [newExp, setNewExp] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Food' as ExpenseCategory,
    description: '',
    amount: 0,
    paymentMethod: 'Credit Card' as Expense['paymentMethod'],
    notes: '',
  });

  // Calculate synchronized metrics
  const metrics = calculatePetFinancialMetrics(
    petId,
    expenses,
    vaccinations,
    medications,
    healthRecords
  );

  const unifiedList = metrics.unified;

  // Filter unified expenses
  const filteredExpenses = unifiedList.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesSource =
      selectedSource === 'ALL' ||
      (selectedSource === 'DIRECT' && e.source === 'Direct') ||
      (selectedSource === 'VACCINATION' && e.source === 'Vaccination') ||
      (selectedSource === 'MEDICATION' && e.source === 'Medication') ||
      (selectedSource === 'HEALTH' && e.source === 'Health Record');
    return matchesSearch && matchesCategory && matchesSource;
  });

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleStartAdd = () => {
    setEditingExpenseId(null);
    setNewExp({
      date: new Date().toISOString().split('T')[0],
      category: 'Food',
      description: '',
      amount: 0,
      paymentMethod: 'Credit Card',
      notes: '',
    });
    setShowAddForm(true);
  };

  const handleStartEdit = (exp: UnifiedExpense) => {
    // If it's a direct expense, allow editing
    if (exp.source === 'Direct') {
      setEditingExpenseId(exp.id);
      setNewExp({
        date: exp.date,
        category: exp.category,
        description: exp.description,
        amount: exp.amount,
        paymentMethod: exp.paymentMethod,
        notes: exp.notes || '',
      });
      setShowAddForm(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.description || newExp.amount <= 0) return;

    if (editingExpenseId && onEditExpense) {
      const existing = expenses.find((item) => item.id === editingExpenseId);
      onEditExpense({
        id: editingExpenseId,
        petId: existing?.petId || petId || 'pet-bella',
        ...newExp,
      });
    } else {
      onAddExpense({
        petId: petId || expenses[0]?.petId || 'pet-bella',
        ...newExp,
      });
    }

    setShowAddForm(false);
    setEditingExpenseId(null);
    setNewExp({
      date: new Date().toISOString().split('T')[0],
      category: 'Food',
      description: '',
      amount: 0,
      paymentMethod: 'Credit Card',
      notes: '',
    });
  };

  const handleDelete = (id: string) => {
    onDeleteExpense?.(id);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner with Live Sync Indicator */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold font-mono">
              SHEET: tblExpenses
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
              <span>Multi-Tab Auto-Sync Active</span>
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Master Pet Expense Ledger & Consolidated Accounts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronizes expenses recorded across all tabs including Vaccinations, Medications, Health Records, and Direct purchases.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-right">
            <div className="text-[11px] font-bold text-slate-500 uppercase">
              Total Consolidated Spend
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              ${metrics.totalAllExpenses.toFixed(2)}
            </div>
            <FormulaTooltip
              formula="=SUM(tblExpenses[Amount], tblVaccinations[Cost], tblMedications[Cost], tblHealth[Cost])"
              showAlways={showFormulas}
            />
          </div>

          <button
            onClick={handleStartAdd}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 2. Multi-Tab Expense Synchronization KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Synced */}
        <div
          onClick={() => setSelectedSource('ALL')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            selectedSource === 'ALL'
              ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Total (All Tabs)
            </span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            ${metrics.totalAllExpenses.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            {unifiedList.length} total entries
          </p>
        </div>

        {/* Vaccinations Synced */}
        <div
          onClick={() => setSelectedSource('VACCINATION')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            selectedSource === 'VACCINATION'
              ? 'bg-rose-50 border-rose-300 dark:bg-rose-950/40 dark:border-rose-700 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Vaccinations Tab
            </span>
            <Syringe className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
            ${metrics.vaccinationTotal.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            Auto-synced vaccine costs
          </p>
        </div>

        {/* Medications Synced */}
        <div
          onClick={() => setSelectedSource('MEDICATION')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            selectedSource === 'MEDICATION'
              ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-700 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Medications Tab
            </span>
            <Pill className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
            ${metrics.medicationTotal.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            Auto-synced prescriptions
          </p>
        </div>

        {/* Health & Vet Visits Synced */}
        <div
          onClick={() => setSelectedSource('HEALTH')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            selectedSource === 'HEALTH'
              ? 'bg-purple-50 border-purple-300 dark:bg-purple-950/40 dark:border-purple-700 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Health Records Tab
            </span>
            <Stethoscope className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
            ${metrics.healthRecordsTotal.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            Auto-synced clinical visits
          </p>
        </div>

        {/* Direct Ledger Purchases */}
        <div
          onClick={() => setSelectedSource('DIRECT')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            selectedSource === 'DIRECT'
              ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-700 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Direct Purchases
            </span>
            <DollarSign className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            ${metrics.directLedgerTotal.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
            Food, toys & direct entries
          </p>
        </div>
      </div>

      {/* 3. Add / Edit Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-emerald-50/50 dark:bg-slate-800/80 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 space-y-4 animate-fade-in"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-300">
              {editingExpenseId ? 'Edit Expense Transaction' : 'Record New Transaction'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingExpenseId(null);
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
                value={newExp.date}
                onChange={(e) => setNewExp({ ...newExp, date: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={newExp.category}
                onChange={(e) => setNewExp({ ...newExp, category: e.target.value as ExpenseCategory })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={newExp.amount || ''}
                onChange={(e) => setNewExp({ ...newExp, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-emerald-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <input
                type="text"
                required
                placeholder="24lb Salmon Dry Food bag, Vet visit, Toy pack..."
                value={newExp.description}
                onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                value={newExp.paymentMethod}
                onChange={(e) => setNewExp({ ...newExp, paymentMethod: e.target.value as Expense['paymentMethod'] })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Pet Insurance">Pet Insurance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notes
              </label>
              <input
                type="text"
                placeholder="Chewy order #9982, clinic receipt..."
                value={newExp.notes}
                onChange={(e) => setNewExp({ ...newExp, notes: e.target.value })}
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
              Save Transaction
            </button>
          </div>
        </form>
      )}

      {/* 4. Category & Origin Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search description, notes, origin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Synchronized Expenses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Category</th>
                <th className="p-3">Source Tab</th>
                <th className="p-3">Description & Notes</th>
                <th className="p-3 text-right">Amount ($)</th>
                <th className="p-3">Payment Method</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((e) => {
                  const isDirect = e.source === 'Direct';
                  return (
                    <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3 font-mono text-slate-500">{e.date}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                          {e.category}
                        </span>
                      </td>
                      <td className="p-3">
                        {e.source === 'Vaccination' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                            <Syringe className="w-3 h-3 text-rose-500" />
                            <span>Vaccinations Tab</span>
                          </span>
                        )}
                        {e.source === 'Medication' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                            <Pill className="w-3 h-3 text-amber-500" />
                            <span>Medications Tab</span>
                          </span>
                        )}
                        {e.source === 'Health Record' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                            <Stethoscope className="w-3 h-3 text-purple-500" />
                            <span>Health Records Tab</span>
                          </span>
                        )}
                        {isDirect && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                            <Receipt className="w-3 h-3 text-indigo-500" />
                            <span>Expense Ledger</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {e.description}
                        </div>
                        {e.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-sm">
                            {e.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                        ${e.amount.toFixed(2)}
                      </td>
                      <td className="p-3 font-mono text-slate-500">{e.paymentMethod}</td>
                      <td className="p-3 text-center">
                        {isDirect ? (
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleStartEdit(e)}
                              className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                              title="Edit expense"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(e.id)}
                              className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                              title="Delete expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span
                            className="text-[10px] text-slate-400 font-medium italic"
                            title="Managed from source tab"
                          >
                            Synced
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    No matching transactions found.
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
