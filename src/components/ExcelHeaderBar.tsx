import React, { useRef, useEffect } from 'react';
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
  const activeTabRef = useRef<HTMLButtonElement | null>(null);

  // Auto-scroll active tab into view on mobile/desktop
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeTab]);

  return (
    <header id="excel-header-ribbon" className="bg-white text-gray-800 border-b border-gray-200 shadow-xs sticky top-0 z-30">
      {/* Top Banner Ribbon: Ultra-compact on mobile, spacious ribbon on desktop */}
      <div className="px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3.5 flex items-center justify-between gap-2 md:gap-4 border-b border-gray-100 bg-white">
        
        {/* Left: Brand Identity & Title */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-indigo-50 text-indigo-600 rounded-lg sm:rounded-xl border border-indigo-100 flex items-center justify-center font-bold text-base sm:text-lg md:text-xl shadow-xs shrink-0">
            🐾
          </div>
          <div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <h1 className="font-extrabold text-sm sm:text-base md:text-lg tracking-tight text-gray-900 flex items-center gap-1.5 sm:gap-2">
                <span>PET TRACKER</span>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-1.5 sm:px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  EXCEL
                </span>
              </h1>
            </div>
            <p className="hidden md:flex text-xs text-gray-400 font-medium items-center gap-2 mt-0.5">
              <span>Connected Data Model</span>
              <span>•</span>
              <span className="text-indigo-600 font-semibold">tblExpenses, tblHealth, tblVaccinations</span>
            </p>
          </div>
        </div>

        {/* Right: Pet Switcher & Responsive Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
          {/* Active Pet Selector Dropdown */}
          <div className="flex items-center bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 px-2 py-1 sm:px-3 sm:py-1.5 shadow-xs max-w-[130px] sm:max-w-[180px] md:max-w-none">
            <PawPrint className="w-3.5 h-3.5 text-indigo-600 mr-1 sm:mr-1.5 shrink-0" />
            <select
              value={activePetId}
              onChange={(e) => onSelectPet(e.target.value)}
              className="bg-transparent text-[11px] sm:text-xs font-bold text-gray-800 focus:outline-none cursor-pointer py-0.5 truncate w-full"
              aria-label="Select active pet"
            >
              {pets.map((p) => (
                <option key={p.id} value={p.id} className="bg-white text-gray-800">
                  {p.name} ({p.species})
                </option>
              ))}
            </select>
            <button
              onClick={onOpenAddPetModal}
              title="Add another pet"
              className="ml-1 p-0.5 sm:p-1 hover:bg-gray-200 rounded-md sm:rounded-lg text-gray-600 hover:text-gray-900 transition shrink-0"
              aria-label="Add pet"
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          {/* Excel Formula Inspector Toggle */}
          <button
            onClick={onToggleFormulas}
            className={`flex items-center justify-center space-x-1 p-1.5 sm:px-2.5 sm:py-1.5 md:px-3 md:py-2 rounded-lg sm:rounded-xl text-xs font-semibold border transition shrink-0 ${
              showFormulas
                ? 'bg-amber-50 text-amber-800 border-amber-200 shadow-xs'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
            title={showFormulas ? 'Formulas active (showing Excel syntax)' : 'Show Excel formulas (=SUMIFS, =IF)'}
          >
            <Calculator className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="hidden sm:inline">{showFormulas ? 'Formulas On' : 'Formulas'}</span>
          </button>

          {/* Export to Excel .xlsx */}
          <button
            onClick={onExportExcel}
            className="flex items-center justify-center space-x-1 p-1.5 sm:px-3 sm:py-1.5 md:px-3.5 md:py-2 rounded-lg sm:rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition shrink-0"
            title="Download full 12-sheet Excel Workbook (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">.xlsx</span>
            <span className="hidden md:inline">Export</span>
          </button>

          {/* Google Sheets Sync */}
          <button
            onClick={onOpenGoogleSheetsModal}
            className="flex items-center justify-center space-x-1 p-1.5 sm:px-3 sm:py-1.5 md:px-3.5 md:py-2 rounded-lg sm:rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition shrink-0"
            title="Google Sheets & Workspace Integration"
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Sheets</span>
          </button>
        </div>
      </div>

      {/* Excel Sheet Tabs Toolbar: Streamlined & maximized space on mobile */}
      <div className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 overflow-x-auto scrollbar-none flex items-center space-x-1 sm:space-x-1.5 bg-gray-50/70 border-t border-gray-100">
        <div className="flex items-center px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-gray-400 border-r border-gray-200 pr-2 sm:pr-3 mr-0.5 sm:mr-1 tracking-wider uppercase shrink-0">
          <Table className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-indigo-500 shrink-0" />
          <span className="hidden sm:inline">SHEETS:</span>
        </div>
        {TABS_CONFIG.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              ref={isActive ? activeTabRef : null}
              onClick={() => onSelectTab(tab.key)}
              className={`flex items-center space-x-1 px-2 py-1 sm:px-2.5 sm:py-1.5 md:px-3 text-[11px] sm:text-xs md:text-[13px] font-semibold rounded-md sm:rounded-lg whitespace-nowrap transition cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs font-bold'
                  : 'text-gray-600 hover:bg-gray-100/70 hover:text-gray-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="bg-amber-100 text-amber-800 text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.2 rounded-full">
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

