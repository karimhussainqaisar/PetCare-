import React, { useState } from 'react';
import {
  Share2,
  X,
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  ExternalLink,
  Sparkles,
  FileText,
  Layers,
  Table2,
} from 'lucide-react';
import {
  Pet,
  Expense,
  HealthRecord,
  Vaccination,
  Medication,
  BudgetItem,
  WeightRecord,
  GroomingRecord,
  AppointmentTask,
} from '../types';
import {
  generatePetTrackerCsv,
  downloadPetTrackerCsv,
  calculatePetFinancialMetrics,
} from '../utils/petCalculations';
import { motion, AnimatePresence } from 'motion/react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: Pet;
  expenses: Expense[];
  healthRecords: HealthRecord[];
  vaccinations: Vaccination[];
  medications?: Medication[];
  budgets?: BudgetItem[];
  weights?: WeightRecord[];
  groomings?: GroomingRecord[];
  appointments?: AppointmentTask[];
  onExportExcel: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  pet,
  expenses = [],
  healthRecords = [],
  vaccinations = [],
  medications = [],
  budgets = [],
  weights = [],
  groomings = [],
  appointments = [],
  onExportExcel,
}) => {
  const [copiedMaster, setCopiedMaster] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'all' | 'expenses' | 'vaccines' | 'health'>('all');

  if (!isOpen) return null;

  const metrics = calculatePetFinancialMetrics(
    pet.id,
    expenses,
    vaccinations,
    medications,
    healthRecords
  );

  const fullCsvText = generatePetTrackerCsv(
    pet,
    healthRecords,
    vaccinations,
    medications,
    expenses,
    budgets,
    weights,
    groomings,
    appointments
  );

  const handleCopyMasterCSV = () => {
    navigator.clipboard.writeText(fullCsvText);
    setCopiedMaster(true);
    setTimeout(() => setCopiedMaster(false), 2500);
  };

  const handleDownloadCSV = () => {
    downloadPetTrackerCsv(
      pet,
      healthRecords,
      vaccinations,
      medications,
      expenses,
      budgets,
      weights,
      groomings,
      appointments
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative my-8 space-y-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close export dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center space-x-3.5 pr-8">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Google Sheets & CSV Export Center
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Fully Synced
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Export synchronized data for {pet.name} formatted with formulas, separated medical metrics, and clean headers.
              </p>
            </div>
          </div>

          {/* 3 Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Action 1: 12-Sheet Excel (.xlsx) */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                  12-Sheet Excel (.xlsx)
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Full workbook with native formulas (<code className="font-mono text-[9px] bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">SUMIFS</code>, <code className="font-mono text-[9px] bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">IF</code>).
                </p>
              </div>

              <button
                onClick={() => {
                  onExportExcel();
                  onClose();
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .xlsx</span>
              </button>
            </motion.div>

            {/* Action 2: Direct CSV (.csv) */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                  Master CSV Export (.csv)
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Clean structured CSV with isolated Vet vs. Vaccine metrics & tables.
                </p>
              </div>

              <button
                onClick={handleDownloadCSV}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .csv</span>
              </button>
            </motion.div>

            {/* Action 3: Copy for Google Sheets */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Copy className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                  Copy for Google Sheets
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Paste directly into any Google Sheets cell with <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 text-[9px] rounded font-mono">Ctrl + V</kbd>.
                </p>
              </div>

              <button
                onClick={handleCopyMasterCSV}
                className={`w-full py-2 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  copiedMaster
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {copiedMaster ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Sheet Data</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>

          {/* Synchronized Metrics Preview Strip */}
          <div className="bg-slate-100/60 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 text-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Synchronized Export Data Summary</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">
                {metrics.unified.length} Ledger Items
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Total Combined</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  ${metrics.totalAllExpenses.toFixed(2)}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Vet & Health Visits</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  ${metrics.healthRecordsTotal.toFixed(2)}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Vaccinations Only</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  ${metrics.vaccinationTotal.toFixed(2)}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Medications Only</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  ${metrics.medicationTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Google Sheets Step-by-Step Guide */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>How to import into Google Sheets:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              <li>Click <strong>"Export .xlsx"</strong> above to download the multi-tab workbook.</li>
              <li>Open <a href="https://sheets.google.com" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center">Google Sheets <ExternalLink className="w-3 h-3 ml-0.5" /></a> and create a blank sheet.</li>
              <li>Navigate to <strong>File</strong> → <strong>Import</strong> → <strong>Upload</strong> and drag your downloaded file.</li>
              <li>All 12 sheets, formulas, and isolated metrics will be preserved.</li>
            </ol>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
