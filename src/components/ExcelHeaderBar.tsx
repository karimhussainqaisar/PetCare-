import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Calculator,
  Plus,
  PawPrint,
  CheckCircle2,
  Table,
  Share2,
} from 'lucide-react';
import { Pet, TabKey, TabConfig } from '../types';

interface ExcelHeaderBarProps {
  pets: Pet[];
  activePetId: string;
  onSelectPet: (petId: string) => void;
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  showFormulas: boolean;
  onToggleFormulas: () => void;
  onExportExcel: () => void;
  onOpenGoogleSheetsModal: () => void;
  onOpenAddPetModal: () => void;
}

export const TABS_CONFIG: TabConfig[] = [
  { key: 'dashboard', label: '1. Dashboard', excelTabName: 'Dashboard', iconName: 'LayoutDashboard' },
  { key: 'profile', label: '2. Pet Profile', excelTabName: 'Pet Profile', iconName: 'User' },
  { key: 'health', label: '3. Health Records', excelTabName: 'tblHealth', iconName: 'Stethoscope' },
  { key: 'vaccinations', label: '4. Vaccinations', excelTabName: 'tblVaccinations', iconName: 'Syringe', badge: 'Alerts' },
  { key: 'medications', label: '5. Medications', excelTabName: 'tblMedications', iconName: 'Pill' },
  { key: 'expenses', label: '6. Expense Tracker', excelTabName: 'tblExpenses', iconName: 'Receipt' },
  { key: 'budget', label: '7. Pet Budget', excelTabName: 'tblBudget', iconName: 'PiggyBank' },
  { key: 'weight', label: '8. Weight Tracker', excelTabName: 'tblWeight', iconName: 'Scale' },
  { key: 'feeding', label: '9. Feeding Log', excelTabName: 'tblFeeding', iconName: 'Utensils' },
  { key: 'grooming', label: '10. Grooming', excelTabName: 'tblGrooming', iconName: 'Scissors' },
  { key: 'appointments', label: '11. Calendar & Tasks', excelTabName: 'tblAppointments', iconName: 'Calendar' },
  { key: 'analytics', label: '12. Reports & Charts', excelTabName: 'tblReports', iconName: 'BarChart3' },
];

export const ExcelHeaderBar: React.FC<ExcelHeaderBarProps> = ({
  pets,
  activePetId,
  onSelectPet,
  activeTab,
  onSelectTab,
  showFormulas,
  onToggleFormulas,
  onExportExcel,
  onOpenGoogleSheetsModal,
  onOpenAddPetModal,
}) => {
  const activePet = pets.find((p) => p.id === activePetId) || pets[0];

  return (
    <header id="excel-header-ribbon" className="bg-white text-gray-800 border-b border-gray-200 shadow-sm sticky top-0 z-30">
      {/* Top Banner Ribbon */}
      <div className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 flex items-center justify-center font-bold text-xl shadow-xs">
            🐾
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-lg tracking-tight text-gray-900 flex items-center gap-2">
                <span>PET TRACKER</span>
                <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  EXCEL SYSTEM
                </span>
              </h1>
            </div>
            <p className="text-xs text-gray-400 font-medium flex items-center gap-2 mt-0.5">
              <span>Connected Data Model</span>
              <span>•</span>
              <span className="text-indigo-600 font-semibold">tblExpenses, tblHealth, tblVaccinations</span>
            </p>
          </div>
        </div>

        {/* Pet Switcher & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Pet Selector Dropdown */}
          <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 px-3 py-1.5 shadow-xs">
            <PawPrint className="w-4 h-4 text-indigo-600 mr-2" />
            <select
              value={activePetId}
              onChange={(e) => onSelectPet(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-800 focus:outline-none cursor-pointer py-0.5 pr-2"
              aria-label="Select active pet"
            >
              {pets.map((p) => (
                <option key={p.id} value={p.id} className="bg-white text-gray-800">
                  {p.name} ({p.species} - {p.breed})
                </option>
              ))}
            </select>
            <button
              onClick={onOpenAddPetModal}
              title="Add another pet"
              className="ml-1 p-1 hover:bg-gray-200 rounded-lg text-gray-600 hover:text-gray-900 transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Excel Formula Inspector Toggle */}
          <button
            onClick={onToggleFormulas}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              showFormulas
                ? 'bg-amber-50 text-amber-800 border-amber-200 shadow-xs'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
            title="Toggle display of Excel formulas like =SUMIFS, =IF, =DATEDIF"
          >
            <Calculator className="w-3.5 h-3.5 text-indigo-600" />
            <span>{showFormulas ? 'Formulas On' : 'Formulas'}</span>
          </button>

          {/* Export to Excel .xlsx */}
          <button
            onClick={onExportExcel}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
            title="Download full 12-sheet Excel Workbook (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .xlsx</span>
          </button>

          {/* Google Sheets Sync */}
          <button
            onClick={onOpenGoogleSheetsModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
            title="Google Sheets & Workspace Integration"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Google Sheets</span>
          </button>
        </div>
      </div>

      {/* Excel Sheet Tabs Toolbar */}
      <div className="px-4 py-2 overflow-x-auto scrollbar-none flex items-center space-x-1.5 bg-gray-50/50 border-t border-gray-100">
        <div className="flex items-center px-2 py-1 text-[11px] font-bold text-gray-400 border-r border-gray-200 pr-3 mr-1 tracking-wider uppercase">
          <Table className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
          <span>SHEETS:</span>
        </div>
        {TABS_CONFIG.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-[13px] font-semibold rounded-lg whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100/70 hover:text-gray-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
