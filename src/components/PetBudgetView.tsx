import React, { useState } from 'react';
import { BudgetItem, Expense, ExpenseCategory, Vaccination, Medication, HealthRecord } from '../types';
import { CATEGORIES } from './ExpenseTrackerView';
import { FormulaTooltip } from './FormulaTooltip';
import { calculatePetFinancialMetrics } from '../utils/petCalculations';
import {
  PiggyBank,
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Syringe,
  Pill,
  Stethoscope,
} from 'lucide-react';

interface PetBudgetViewProps {
  petId?: string;
  budgets: BudgetItem[];
  expenses: Expense[];
  vaccinations?: Vaccination[];
  medications?: Medication[];
  healthRecords?: HealthRecord[];
  showFormulas: boolean;
  onUpdateBudget: (category: ExpenseCategory, monthlyBudget: number) => void;
}

export const PetBudgetView: React.FC<PetBudgetViewProps> = ({
  petId = 'pet-bella',
  budgets = [],
  expenses = [],
  vaccinations = [],
  medications = [],
  healthRecords = [],
  showFormulas,
  onUpdateBudget,
}) => {
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);

  // Synchronized Multi-Tab Financial Metrics
  const metrics = calculatePetFinancialMetrics(
    petId,
    expenses,
    vaccinations,
    medications,
    healthRecords
  );

  // Calculate totals across all categories with multi-tab synchronized actuals
  const categorySummary = CATEGORIES.map((cat) => {
    const budgetItem = budgets.find((b) => b.category === cat);
    const monthlyBudget = budgetItem ? budgetItem.monthlyBudget : 0;

    // Actual includes direct ledger expenses + synchronized vaccinations, medications, and health records for the category
    const actual = metrics.categoryMap[cat] || 0;

    const difference = monthlyBudget - actual;
    const percentUsed =
      monthlyBudget > 0 ? Math.min(100, Math.round((actual / monthlyBudget) * 100)) : 0;

    return {
      category: cat,
      monthlyBudget,
      actual,
      difference,
      percentUsed,
    };
  });

  const totalBudget = categorySummary.reduce((sum, c) => sum + c.monthlyBudget, 0);
  const totalActual = metrics.totalAllExpenses;
  const totalDifference = totalBudget - totalActual;

  const handleSaveBudget = (cat: ExpenseCategory) => {
    onUpdateBudget(cat, editAmount);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold font-mono">
              SHEET: tblBudget
            </span>
            <span className="text-xs text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              <RefreshCw className="w-3 h-3 text-indigo-600 animate-spin" />
              <span>Multi-Tab Synchronized Actuals</span>
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Monthly Pet Budget & Variance Planner
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compares monthly budget targets against actual spend consolidated across Vaccinations, Medications, Health Records, and Direct Ledger.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-right">
            <div className="text-[11px] font-bold text-slate-500 uppercase">
              Total Budget
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              ${totalBudget.toFixed(2)}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-right">
            <div className="text-[11px] font-bold text-slate-500 uppercase">
              Actual Spent (All Tabs)
            </div>
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              ${totalActual.toFixed(2)}
            </div>
            <FormulaTooltip
              formula="=SUM(tblExpenses[Amount], tblVaccinations[Cost], tblMedications[Cost], tblHealth[Cost])"
              showAlways={showFormulas}
            />
          </div>

          <div
            className={`p-3 rounded-xl border text-right ${
              totalDifference >= 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="text-[11px] font-bold uppercase">Difference</div>
            <div className="text-lg font-bold">
              {totalDifference >= 0
                ? `+$${totalDifference.toFixed(2)}`
                : `-$${Math.abs(totalDifference).toFixed(2)}`}
            </div>
            <FormulaTooltip formula="=Budget - Actual" showAlways={showFormulas} />
          </div>
        </div>
      </div>

      {/* Multi-Tab Synced Breakdown Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
        <div className="flex items-center gap-2">
          <Syringe className="w-4 h-4 text-rose-500" />
          <div>
            <span className="text-slate-500 font-medium">Vaccinations:</span>
            <span className="font-bold text-slate-900 dark:text-white ml-1.5">
              ${metrics.vaccinationTotal.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-amber-500" />
          <div>
            <span className="text-slate-500 font-medium">Medications:</span>
            <span className="font-bold text-slate-900 dark:text-white ml-1.5">
              ${metrics.medicationTotal.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-purple-500" />
          <div>
            <span className="text-slate-500 font-medium">Health Records:</span>
            <span className="font-bold text-slate-900 dark:text-white ml-1.5">
              ${metrics.healthRecordsTotal.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-indigo-500" />
          <div>
            <span className="text-slate-500 font-medium">General Purchases:</span>
            <span className="font-bold text-slate-900 dark:text-white ml-1.5">
              ${metrics.directLedgerTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Budget Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Monthly Target ($)</th>
                <th className="p-3 text-right">Actual Spent ($)</th>
                <th className="p-3 text-right">Difference ($)</th>
                <th className="p-3">Budget Usage Progress Bar</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
              {categorySummary.map((item) => {
                const isOverBudget = item.difference < 0;
                return (
                  <tr
                    key={item.category}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <PiggyBank className="w-4 h-4 text-indigo-500" />
                      <span>{item.category}</span>
                      {item.category === 'Veterinary' && metrics.vaccinationTotal > 0 && (
                        <span className="text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 font-semibold">
                          Includes Vaccines & Health
                        </span>
                      )}
                      {item.category === 'Medication' && metrics.medicationTotal > 0 && (
                        <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">
                          Includes Meds Tab
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right font-bold font-mono">
                      {editingCategory === item.category ? (
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border rounded text-right bg-white dark:bg-slate-800 font-bold"
                        />
                      ) : (
                        `$${item.monthlyBudget.toFixed(2)}`
                      )}
                    </td>

                    <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      ${item.actual.toFixed(2)}
                      <FormulaTooltip
                        formula={`=SUMIFS(tblExpenses[Amount], tblExpenses[Category], "${item.category}")`}
                        showAlways={showFormulas}
                      />
                    </td>

                    <td
                      className={`p-3 text-right font-bold font-mono ${
                        isOverBudget
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {item.difference >= 0
                        ? `$${item.difference.toFixed(2)}`
                        : `-$${Math.abs(item.difference).toFixed(2)}`}
                      <FormulaTooltip formula="=Target - Actual" showAlways={showFormulas} />
                    </td>

                    <td className="p-3 min-w-[200px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>{item.percentUsed}% used</span>
                          {isOverBudget && (
                            <span className="text-rose-600 font-bold flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> Over Budget
                            </span>
                          )}
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                              isOverBudget
                                ? 'bg-rose-500'
                                : item.percentUsed > 80
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, item.percentUsed)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      {editingCategory === item.category ? (
                        <button
                          onClick={() => handleSaveBudget(item.category)}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingCategory(item.category);
                            setEditAmount(item.monthlyBudget);
                          }}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Edit Target
                        </button>
                      )}
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
