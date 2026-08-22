import React, { useState } from 'react';
import {
  Heart,
  Syringe,
  Pill,
  Utensils,
  Receipt,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Plus,
  Scale,
  Sparkles,
  CheckCircle2,
  Clock,
  TrendingUp,
  Activity,
  ShieldCheck,
  Stethoscope,
  Scissors,
  Check,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  Pet,
  HealthRecord,
  Vaccination,
  Medication,
  Expense,
  WeightRecord,
  GroomingRecord,
  AppointmentTask,
  TabKey,
} from '../types';
import {
  calculatePetAge,
  getVaccinationStatus,
  getGroomingStatus,
  calculatePetFinancialMetrics,
} from '../utils/petCalculations';
import { FormulaTooltip } from './FormulaTooltip';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardViewProps {
  pet: Pet;
  healthRecords: HealthRecord[];
  vaccinations: Vaccination[];
  medications: Medication[];
  expenses: Expense[];
  weights: WeightRecord[];
  groomings: GroomingRecord[];
  appointments: AppointmentTask[];
  showFormulas: boolean;
  onNavigateTab: (tab: TabKey) => void;
  onOpenAddModal: (type: 'expense' | 'appointment' | 'weight' | 'vaccine') => void;
  onToggleTaskComplete: (taskId: string) => void;
}

const CATEGORY_COLORS = [
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#F43F5E', // Rose
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  pet,
  healthRecords = [],
  vaccinations = [],
  medications = [],
  expenses = [],
  weights = [],
  groomings = [],
  appointments = [],
  showFormulas,
  onNavigateTab,
  onOpenAddModal,
  onToggleTaskComplete,
}) => {
  const [graphMode, setGraphMode] = useState<'weight' | 'expenses'>('weight');

  // Synchronized financial metrics across all sheets
  const metrics = calculatePetFinancialMetrics(
    pet.id,
    expenses,
    vaccinations,
    medications,
    healthRecords
  );

  // Vaccinations Due Count
  const overdueVaccines = vaccinations.filter(
    (v) => getVaccinationStatus(v.nextDue).status === 'OVERDUE'
  );
  const dueSoonVaccines = vaccinations.filter(
    (v) => getVaccinationStatus(v.nextDue).status === 'DUE SOON'
  );
  const vaccinationsActionCount = overdueVaccines.length + dueSoonVaccines.length;

  // Upcoming appointments
  const upcomingAppointments = appointments
    .filter((a) => !a.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextAppointment = upcomingAppointments[0];

  // Grooming alerts count
  const groomingAlerts = groomings.filter((g) => getGroomingStatus(g.nextDue).status !== 'OK');

  // Pie chart data
  const pieChartData = Object.keys(metrics.categoryMap).map((cat) => ({
    name: cat,
    value: metrics.categoryMap[cat],
  }));

  // Weight Trend Data
  const weightChartData = [...weights]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((w) => ({
      date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: w.weight,
    }));

  // Monthly Expense Trend Data for the Graph toggle
  const monthlyExpenseMap = metrics.unified.reduce((acc: Record<string, number>, curr) => {
    const month = new Date(curr.date).toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    });
    acc[month] = (acc[month] || 0) + curr.amount;
    return acc;
  }, {});

  const expenseChartData = Object.keys(monthlyExpenseMap).map((m) => ({
    date: m,
    amount: monthlyExpenseMap[m],
  }));

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* 1. Header with Pet Profile Summary & Quick Actions */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 rounded-lg text-[10px] font-bold font-mono border border-indigo-100 dark:border-indigo-900">
              SHEET 1: DASHBOARD
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              Real-Time Synchronized
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {pet.name}’s Care Command Center
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full font-semibold border border-slate-200/60 dark:border-slate-700">
              Species: <strong className="text-slate-900 dark:text-white">{pet.species}</strong>
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full font-semibold border border-slate-200/60 dark:border-slate-700">
              Breed: <strong className="text-slate-900 dark:text-white">{pet.breed}</strong>
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full font-semibold border border-slate-200/60 dark:border-slate-700">
              Age: <strong className="text-slate-900 dark:text-white">{calculatePetAge(pet.dob)}</strong>
            </span>
            <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full font-semibold border border-indigo-100 dark:border-indigo-900">
              Weight: <strong className="text-indigo-900 dark:text-indigo-200">{pet.weight} {pet.weightUnit}</strong>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenAddModal('expense')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenAddModal('appointment')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200/80 dark:border-slate-700 shadow-xs transition cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>Schedule Task</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenAddModal('weight')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200/80 dark:border-slate-700 shadow-xs transition cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5 text-indigo-500" />
            <span>Log Weight</span>
          </motion.button>
        </div>
      </motion.header>

      {/* 2. TOP SECTION: Metrics Grid (Left) + Large Graph (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* TOP-LEFT: 6 Metric Cards Grid (Span 7 on lg screens) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Metrics & Financial KPIs</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">
              Auto-Calculated
            </span>
          </div>

          {/* 2 rows × 3 columns grid on md/lg, responsive on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {/* Card 1: Total Combined Spend */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              whileHover={{ y: -2 }}
              onClick={() => onNavigateTab('expenses')}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Spend
                </span>
                <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="my-2">
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                  ${metrics.totalAllExpenses.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                  {metrics.unified.length} total entries
                </div>
              </div>

              <FormulaTooltip
                formula="=SUM(tblExpenses[Amount], tblVaccinations[Cost], tblMedications[Cost], tblHealth[Cost])"
                showAlways={showFormulas}
              />
            </motion.div>

            {/* Card 2: Vet & Health Visits (HEALTH RECORDS ONLY) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
              whileHover={{ y: -2 }}
              onClick={() => onNavigateTab('health')}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 transition cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Vet & Health
                </span>
                <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Stethoscope className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="my-2">
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                  ${metrics.healthRecordsTotal.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                  {healthRecords.length} clinical visits
                </div>
              </div>

              <FormulaTooltip
                formula="=SUM(tblHealth[Cost])"
                showAlways={showFormulas}
              />
            </motion.div>

            {/* Card 3: Vaccinations (VACCINATIONS ONLY) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.15 }}
              whileHover={{ y: -2 }}
              onClick={() => onNavigateTab('vaccinations')}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-rose-300 dark:hover:border-rose-700 transition cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Vaccinations
                </span>
                <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Syringe className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="my-2">
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                  ${metrics.vaccinationTotal.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                  {vaccinations.length} vaccines logged
                </div>
              </div>

              <FormulaTooltip
                formula="=SUM(tblVaccinations[Cost])"
                showAlways={showFormulas}
              />
            </motion.div>

            {/* Card 4: Medications & Rx (MEDICATIONS ONLY) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.2 }}
              whileHover={{ y: -2 }}
              onClick={() => onNavigateTab('medications')}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-700 transition cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Medications
                </span>
                <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Pill className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="my-2">
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                  ${metrics.medicationTotal.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                  {medications.length} prescriptions
                </div>
              </div>

              <FormulaTooltip
                formula="=SUM(tblMedications[Cost])"
                showAlways={showFormulas}
              />
            </motion.div>

            {/* Card 5: Food & Nutrition */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.25 }}
              whileHover={{ y: -2 }}
              onClick={() => onNavigateTab('feeding')}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Food & Diet
                </span>
                <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Utensils className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="my-2">
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  ${metrics.foodCategoryTotal.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                  Dietary provisions
                </div>
              </div>

              <FormulaTooltip
                formula='=SUMIFS(tblExpenses[Amount], tblExpenses[Category], "Food")'
                showAlways={showFormulas}
              />
            </motion.div>

            {/* Card 6: Care Alerts & Action Items */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.3 }}
              whileHover={{ y: -2 }}
              onClick={() => onNavigateTab('appointments')}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Care Alerts
                </span>
                <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="my-2">
                <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>{vaccinationsActionCount} Vaccines</span>
                  {vaccinationsActionCount > 0 && (
                    <span className="text-[9px] bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 px-1.5 py-0.5 rounded-full font-extrabold">
                      Due
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                  {upcomingAppointments.length} upcoming tasks
                </div>
              </div>

              <FormulaTooltip
                formula='=COUNTIF(tblVaccinations[Status], "<>UP TO DATE")'
                showAlways={showFormulas}
              />
            </motion.div>
          </div>
        </div>

        {/* TOP-RIGHT: Large Graph Block (Span 5 on lg screens) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
        >
          {/* Graph Header with Mode Switcher */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>
                  {graphMode === 'weight' ? 'Weight Growth Curve' : 'Monthly Expenditure Trend'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {graphMode === 'weight' ? 'Growth tracking & target health' : 'Consolidated monthly trend'}
              </p>
            </div>

            {/* Toggle Buttons */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700 text-[11px] font-semibold">
              <button
                onClick={() => setGraphMode('weight')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  graphMode === 'weight'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Weight
              </button>
              <button
                onClick={() => setGraphMode('expenses')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  graphMode === 'expenses'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Spend
              </button>
            </div>
          </div>

          {/* Graph Body */}
          <div className="h-56 w-full">
            {graphMode === 'weight' ? (
              weightChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightChartData}>
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      domain={['auto', 'auto']}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(val: number) => [`${val} ${pet.weightUnit}`, 'Weight']}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="#6366F1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#weightGrad)"
                      dot={{ r: 4, fill: '#6366F1', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 space-y-2">
                  <Scale className="w-8 h-8 text-slate-300" />
                  <span>No weight entries recorded yet.</span>
                </div>
              )
            ) : expenseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={expenseChartData}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(val: number) => [`$${val.toFixed(2)}`, 'Spend']}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#10B981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#spendGrad)"
                    dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 space-y-2">
                <Receipt className="w-8 h-8 text-slate-300" />
                <span>No expense history logged yet.</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Latest weight: {pet.weight} {pet.weightUnit}</span>
            <button
              onClick={() => onNavigateTab(graphMode === 'weight' ? 'weight' : 'analytics')}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore History</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* 3. BOTTOM SECTION: Wide Card (Left) + Pie Chart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* BOTTOM-LEFT: Wide Rectangular Block (Care Schedule, Health Visits & Active Tasks) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Care Schedule & Clinical Follow-ups</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Synchronized checklist of upcoming vet appointments, booster alerts, and care tasks
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('appointments')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Two Sub-Columns inside the wide box for clinical visits & task checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sub-Column 1: Upcoming Tasks Checklist */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Active Care Tasks</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {upcomingAppointments.length} pending
                  </span>
                </div>

                <div className="space-y-2">
                  {appointments.slice(0, 4).map((apt) => (
                    <motion.div
                      key={apt.id}
                      whileHover={{ x: 2 }}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs transition ${
                        apt.completed
                          ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-60'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700'
                      }`}
                    >
                      <button
                        onClick={() => onToggleTaskComplete(apt.id)}
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition cursor-pointer ${
                          apt.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 hover:border-indigo-600 dark:border-slate-600'
                        }`}
                        aria-label="Toggle task completion"
                      >
                        {apt.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <span
                        className={`flex-1 font-medium text-slate-800 dark:text-slate-200 truncate ${
                          apt.completed ? 'line-through' : ''
                        }`}
                      >
                        {apt.task}
                      </span>

                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded">
                        {apt.date}
                      </span>
                    </motion.div>
                  ))}

                  {appointments.length === 0 && (
                    <div className="text-xs text-slate-400 py-3 text-center">
                      No care tasks scheduled.
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-Column 2: Vaccination & Grooming Status Alerts */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Vaccination Alerts</span>
                  <button
                    onClick={() => onNavigateTab('vaccinations')}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    View Schedule
                  </button>
                </div>

                <div className="space-y-2">
                  {vaccinations.slice(0, 3).map((v) => {
                    const st = getVaccinationStatus(v.nextDue);
                    return (
                      <div
                        key={v.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Syringe className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {v.vaccine}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {v.nextDue}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              st.status === 'UP TO DATE'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : st.status === 'DUE SOON'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {st.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Grooming Quick Snippet */}
                  {groomings.length > 0 && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs">
                      <div className="flex items-center gap-2">
                        <Scissors className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {groomings[0].service}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                        Due: {groomings[0].nextDue}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Next Visit: <strong>{nextAppointment ? `${nextAppointment.task} on ${nextAppointment.date}` : 'All caught up!'}</strong></span>
            <button
              onClick={() => onOpenAddModal('appointment')}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
            >
              + Quick Schedule
            </button>
          </div>
        </motion.div>

        {/* BOTTOM-RIGHT: Pie / Doughnut Chart Block */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Category Breakdown</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Consolidated distribution across all sheets
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('analytics')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pie Chart */}
            <div className="h-44 w-full relative">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={68}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`pie-cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`$${val.toFixed(2)}`, 'Amount']}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No expense breakdown available.
                </div>
              )}
            </div>

            {/* Category Legend Badges */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {pieChartData.slice(0, 4).map((item, idx) => {
                const percent =
                  metrics.totalAllExpenses > 0
                    ? Math.round((item.value / metrics.totalAllExpenses) * 100)
                    : 0;
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                      />
                      <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white shrink-0 ml-1">
                      {percent}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Total Consolidated: <strong className="text-indigo-600 dark:text-indigo-400">${metrics.totalAllExpenses.toFixed(2)}</strong></span>
            <button
              onClick={() => onNavigateTab('budget')}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
            >
              View Budget
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
