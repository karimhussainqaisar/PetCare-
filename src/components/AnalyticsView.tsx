import React from 'react';
import {
  Pet,
  HealthRecord,
  Vaccination,
  Medication,
  Expense,
  BudgetItem,
  WeightRecord,
  FeedingRecord,
  GroomingRecord,
  AppointmentTask,
} from '../types';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Share2,
  Sparkles,
  Table,
  RefreshCw,
  Syringe,
  Pill,
  Stethoscope,
  Receipt,
  DollarSign,
} from 'lucide-react';
import { calculatePetFinancialMetrics } from '../utils/petCalculations';

interface AnalyticsViewProps {
  pet: Pet;
  healthRecords: HealthRecord[];
  vaccinations: Vaccination[];
  medications: Medication[];
  expenses: Expense[];
  budgets: BudgetItem[];
  weights: WeightRecord[];
  feedings: FeedingRecord[];
  groomings: GroomingRecord[];
  appointments: AppointmentTask[];
  onExportExcel: () => void;
  onOpenGoogleSheetsModal: () => void;
}

const COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EC4899',
  '#8B5CF6',
  '#14B8A6',
  '#6366F1',
  '#F43F5E',
];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  pet,
  healthRecords = [],
  vaccinations = [],
  medications = [],
  expenses = [],
  budgets = [],
  weights = [],
  onExportExcel,
  onOpenGoogleSheetsModal,
}) => {
  // Synchronized Financial Metrics across all tabs
  const metrics = calculatePetFinancialMetrics(
    pet.id,
    expenses,
    vaccinations,
    medications,
    healthRecords
  );

  // 1. Expense Breakdown Doughnut (Using Synchronized Category Map)
  const doughnutData = Object.keys(metrics.categoryMap).map((cat) => ({
    name: cat,
    value: metrics.categoryMap[cat],
  }));

  // 2. Monthly Expenses Column Chart (Aggregated from all synchronized entries)
  const monthlyMap = metrics.unified.reduce((acc: Record<string, number>, curr) => {
    const month = new Date(curr.date).toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    });
    acc[month] = (acc[month] || 0) + curr.amount;
    return acc;
  }, {});

  const barData = Object.keys(monthlyMap).map((m) => ({
    month: m,
    amount: monthlyMap[m],
  }));

  // 3. Weight Trend Line
  const weightData = [...weights]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((w) => ({
      date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: w.weight,
    }));

  // 4. Health & Medical Event Activity
  const activityData = [
    { name: 'Checkups', count: healthRecords.length },
    { name: 'Vaccines', count: vaccinations.length },
    { name: 'Meds', count: medications.length },
    { name: 'Direct Entries', count: expenses.length },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold font-mono">
              SHEET 12: ANALYTICS & REPORTS
            </span>
            <span className="text-xs text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              <RefreshCw className="w-3 h-3 text-indigo-600 animate-spin" />
              <span>Multi-Tab Synchronized Financials</span>
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Executive Pet Care Analytics & Export Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Doughnut breakdowns, monthly expenditure trends including vaccines & medications, and spreadsheet exports.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onExportExcel}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export 12-Tab .xlsx</span>
          </button>

          <button
            onClick={onOpenGoogleSheetsModal}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Google Sheets</span>
          </button>
        </div>
      </div>

      {/* Multi-Tab Financial Analytics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Total All Tabs</span>
            <Receipt className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
            ${metrics.totalAllExpenses.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {metrics.unified.length} total transactions
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Vaccinations</span>
            <Syringe className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
            ${metrics.vaccinationTotal.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {vaccinations.length} vaccines recorded
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Medications</span>
            <Pill className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
            ${metrics.medicationTotal.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {medications.length} prescriptions
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Health & Vet</span>
            <Stethoscope className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
            ${metrics.healthRecordsTotal.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {healthRecords.length} clinical visits
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Direct Ledger</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            ${metrics.directLedgerTotal.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {expenses.length} general purchases
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Breakdown Doughnut */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>Synchronized Category Breakdown</span>
            <span className="text-xs text-slate-400 font-mono">Doughnut Chart</span>
          </h3>

          <div className="h-64">
            {doughnutData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={doughnutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {doughnutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => `$${val.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No expense data recorded.
              </div>
            )}
          </div>
        </div>

        {/* Monthly Expenses Column Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>Monthly Consolidated Trend (All Tabs)</span>
            <span className="text-xs text-slate-400 font-mono">Column Chart</span>
          </h3>

          <div className="h-64">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" fontSize={11} stroke="#64748b" />
                  <YAxis fontSize={11} stroke="#64748b" />
                  <Tooltip formatter={(val: number) => `$${val.toFixed(2)}`} />
                  <Bar dataKey="amount" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No monthly data recorded.
              </div>
            )}
          </div>
        </div>

        {/* Weight Trend Line Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>Weight Growth Curve</span>
            <span className="text-xs text-slate-400 font-mono">Line Chart</span>
          </h3>

          <div className="h-64">
            {weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" fontSize={11} stroke="#64748b" />
                  <YAxis fontSize={11} stroke="#64748b" domain={['auto', 'auto']} />
                  <Tooltip formatter={(val: number) => `${val} ${pet.weightUnit}`} />
                  <Line type="monotone" dataKey="weight" stroke="#EC4899" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No weight logs recorded.
              </div>
            )}
          </div>
        </div>

        {/* Health Activity Frequency Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>Care Log Volume by Category</span>
            <span className="text-xs text-slate-400 font-mono">Bar Chart</span>
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={11} stroke="#64748b" />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
