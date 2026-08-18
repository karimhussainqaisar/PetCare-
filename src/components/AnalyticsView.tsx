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
import { BarChart3, Download, FileSpreadsheet, Share2, Sparkles, Table } from 'lucide-react';

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

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6', '#6366F1', '#F43F5E'];

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
  // 1. Expense Breakdown Doughnut
  const categoryMap = expenses.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const doughnutData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    value: categoryMap[cat],
  }));

  // 2. Monthly Expenses Column Chart
  const monthlyMap = expenses.reduce((acc: Record<string, number>, curr) => {
    const month = new Date(curr.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
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
    { name: 'Transactions', count: expenses.length },
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
            <span className="text-xs text-slate-400">• Visual Charts Dashboard</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Executive Pet Care Analytics & Export Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Doughnut breakdowns, monthly expenditure trends, and spreadsheet exports.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onExportExcel}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>Export 12-Tab .xlsx</span>
          </button>

          <button
            onClick={onOpenGoogleSheetsModal}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Google Sheets</span>
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Breakdown Doughnut */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>Expense Category Breakdown</span>
            <span className="text-xs text-slate-400 font-mono">Doughnut Chart</span>
          </h3>

          <div className="h-64">
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
          </div>
        </div>

        {/* Monthly Expenses Column Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>Monthly Expenditure Trend</span>
            <span className="text-xs text-slate-400 font-mono">Column Chart</span>
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" fontSize={11} stroke="#64748b" />
                <YAxis fontSize={11} stroke="#64748b" />
                <Tooltip formatter={(val: number) => `$${val.toFixed(2)}`} />
                <Bar dataKey="amount" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weight Trend Line Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>Weight Growth Curve</span>
            <span className="text-xs text-slate-400 font-mono">Line Chart</span>
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" fontSize={11} stroke="#64748b" />
                <YAxis fontSize={11} stroke="#64748b" domain={['auto', 'auto']} />
                <Tooltip formatter={(val: number) => `${val} ${pet.weightUnit}`} />
                <Line type="monotone" dataKey="weight" stroke="#EC4899" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Activity Frequency Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
            <span>Care Log volume</span>
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
