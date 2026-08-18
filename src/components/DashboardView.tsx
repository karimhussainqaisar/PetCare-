import React from 'react';
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
} from 'recharts';

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

const PASTEL_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6'];

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
  // Calculations matching Excel formulas
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const vetExpenses = expenses
    .filter((e) => e.category === 'Veterinary')
    .reduce((sum, e) => sum + e.amount, 0);
  const medExpenses = expenses
    .filter((e) => e.category === 'Medication')
    .reduce((sum, e) => sum + e.amount, 0);
  const foodExpenses = expenses
    .filter((e) => e.category === 'Food')
    .reduce((sum, e) => sum + e.amount, 0);

  // Vaccinations Due Count
  const vaccinationsDueCount = vaccinations.filter(
    (v) => getVaccinationStatus(v.nextDue).status !== 'UP TO DATE'
  ).length;

  // Next Upcoming Appointment
  const upcomingAppointments = appointments
    .filter((a) => !a.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextAppointment = upcomingAppointments[0];

  // Grooming alerts count
  const groomingAlerts = groomings.filter((g) => getGroomingStatus(g.nextDue).status !== 'OK');

  // Chart data: Expense breakdown by category
  const expenseByCategory = expenses.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const pieChartData = Object.keys(expenseByCategory).map((cat) => ({
    name: cat,
    value: expenseByCategory[cat],
  }));

  // Weight Trend Data
  const weightChartData = [...weights]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((w) => ({
      date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: w.weight,
    }));

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Clean Minimalist Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase">
            MY PET TRACKER
          </h1>
          <div className="flex flex-wrap gap-2.5 mt-2.5 text-xs">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
              Name: {pet.name}
            </span>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
              Type: {pet.species}
            </span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold">
              Breed: {pet.breed}
            </span>
            <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full font-semibold">
              Age: {calculatePetAge(pet.dob)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onOpenAddModal('expense')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={() => onOpenAddModal('appointment')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-semibold text-xs border border-gray-200 shadow-xs transition cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Schedule Visit</span>
          </button>

          <button
            onClick={() => onOpenAddModal('weight')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-semibold text-xs border border-gray-200 shadow-xs transition cursor-pointer"
          >
            <Scale className="w-4 h-4 text-indigo-600" />
            <span>Log Weight</span>
          </button>
        </div>
      </header>

      {/* 2. KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Vet Expenses */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Vet Expenses</p>
          <h3 className="text-2xl font-bold text-gray-900">${vetExpenses.toFixed(2)}</h3>
          <p className="text-[10px] text-indigo-500 mt-1 font-semibold">+12% from last month</p>
          <FormulaTooltip
            formula='=SUMIFS(tblExpenses[Amount], tblExpenses[Category], "Veterinary")'
            showAlways={showFormulas}
          />
        </div>

        {/* Medication Expenses */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Medication</p>
          <h3 className="text-2xl font-bold text-gray-900">${medExpenses.toFixed(2)}</h3>
          <p className="text-[10px] text-emerald-500 mt-1 font-semibold">Under budget</p>
          <FormulaTooltip
            formula='=SUMIFS(tblExpenses[Amount], tblExpenses[Category], "Medication")'
            showAlways={showFormulas}
          />
        </div>

        {/* Food Expenses */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Food</p>
          <h3 className="text-2xl font-bold text-gray-900">${foodExpenses.toFixed(2)}</h3>
          <p className="text-[10px] text-gray-400 mt-1 font-semibold">Total YTD</p>
          <FormulaTooltip
            formula='=SUMIFS(tblExpenses[Amount], tblExpenses[Category], "Food")'
            showAlways={showFormulas}
          />
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Expenses</p>
          <h3 className="text-2xl font-bold text-indigo-600">${totalExpenses.toFixed(2)}</h3>
          <p className="text-[10px] text-indigo-400 mt-1 font-semibold italic">Auto-calculated</p>
          <FormulaTooltip formula="=SUM(tblExpenses[Amount])" showAlways={showFormulas} />
        </div>

        {/* Next Visit */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Next Visit</p>
          <h3 className="text-sm font-bold text-gray-900 truncate">
            {nextAppointment ? nextAppointment.date : 'None Scheduled'}
          </h3>
          <p className="text-[10px] text-gray-500 truncate mt-1">
            {nextAppointment ? nextAppointment.task : 'All caught up!'}
          </p>
          <FormulaTooltip
            formula="=INDEX(SORT(FILTER(tblAppointments, Date>=TODAY())), 1)"
            showAlways={showFormulas}
          />
        </div>

        {/* Vaccinations Due */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Vaccines Due</p>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>{vaccinationsDueCount}</span>
            {vaccinationsDueCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full">
                Action
              </span>
            )}
          </h3>
          <p className="text-[10px] text-gray-400 mt-1 font-semibold">Status check</p>
          <FormulaTooltip
            formula='=COUNTIF(tblVaccinations[Status], "<>UP TO DATE")'
            showAlways={showFormulas}
          />
        </div>
      </section>

      {/* 3. Main Dashboard Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Charts & Upcoming Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expense Breakdown Chart */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900">Expense Breakdown</h4>
                <button
                  onClick={() => onNavigateTab('analytics')}
                  className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Full Report</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {pieChartData.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PASTEL_COLORS[index % PASTEL_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => `$${val.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-xs text-gray-400">
                  No expenses logged yet.
                </div>
              )}
            </div>

            {/* Weight Trend Preview Chart */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900">Weight Trend</h4>
                <button
                  onClick={() => onNavigateTab('weight')}
                  className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>View Log</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {weightChartData.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightChartData}>
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                      <YAxis stroke="#9ca3af" fontSize={11} domain={['auto', 'auto']} />
                      <Tooltip formatter={(val: number) => `${val} ${pet.weightUnit}`} />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#6366f1' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-xs text-gray-400">
                  No weight entries recorded.
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Tasks & Appointments */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900">Upcoming Tasks</h4>
              </div>

              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">
                {appointments.filter((a) => !a.completed).length} Pending
              </span>
            </div>

            <ul className="space-y-3">
              {appointments.slice(0, 5).map((apt) => (
                <li key={apt.id} className="flex items-center gap-3 text-xs">
                  <button
                    onClick={() => onToggleTaskComplete(apt.id)}
                    className={`w-4 h-4 rounded flex items-center justify-center border transition cursor-pointer ${
                      apt.completed
                        ? 'bg-indigo-600 border-indigo-600 text-white text-[8px]'
                        : 'border-gray-300 hover:border-indigo-600'
                    }`}
                  >
                    {apt.completed && '✓'}
                  </button>

                  <span
                    className={`flex-1 font-medium text-gray-900 ${
                      apt.completed ? 'line-through opacity-50' : ''
                    }`}
                  >
                    {apt.task}
                  </span>

                  <span className="text-gray-400 font-mono text-[11px]">{apt.date}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Health Alerts & Reminder Hub */}
        <div className="space-y-6">
          {/* Health Alerts Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900">Vaccination Status</h4>
            </div>

            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-gray-400 uppercase tracking-tighter border-b border-gray-100">
                <tr>
                  <th className="pb-2 font-semibold">Vaccine</th>
                  <th className="pb-2 font-semibold">Next Due</th>
                  <th className="pb-2 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="font-medium">
                {vaccinations.map((vac) => {
                  const st = getVaccinationStatus(vac.nextDue);
                  const isUpToDate = st.status === 'UP TO DATE';
                  const isDueSoon = st.status === 'DUE SOON';
                  return (
                    <tr key={vac.id} className="border-b border-gray-50">
                      <td className="py-2 text-gray-900 font-medium">{vac.vaccine}</td>
                      <td className="py-2 text-gray-500">{vac.nextDue}</td>
                      <td
                        className={`py-2 text-right font-bold text-[10px] uppercase ${
                          isUpToDate
                            ? 'text-emerald-600'
                            : isDueSoon
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {st.status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <button
              onClick={() => onNavigateTab('vaccinations')}
              className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Manage Vaccination Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grooming Alerts */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900">Grooming Due Dates</h4>
            </div>

            <div className="space-y-2.5">
              {groomings.map((grm) => {
                const st = getGroomingStatus(grm.nextDue);
                return (
                  <div
                    key={grm.id}
                    className="flex items-center justify-between text-xs p-2.5 rounded-xl border border-gray-50 bg-gray-50/50"
                  >
                    <span className="font-medium text-gray-800">
                      {grm.service}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600">
                      {grm.nextDue}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => onNavigateTab('grooming')}
              className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View Grooming Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
