import React, { useState } from 'react';
import { Share2, X, Download, Copy, Check, FileSpreadsheet, ExternalLink, Sparkles } from 'lucide-react';
import { Pet, Expense, HealthRecord, Vaccination } from '../types';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: Pet;
  expenses: Expense[];
  healthRecords: HealthRecord[];
  vaccinations: Vaccination[];
  onExportExcel: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  pet,
  expenses,
  healthRecords,
  vaccinations,
  onExportExcel,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate CSV representation for Google Sheets import
  const generateCSV = () => {
    let csv = `🐾 ULTIMATE PET TRACKER - ${pet.name.toUpperCase()}\n`;
    csv += `Pet Name,${pet.name},Species,${pet.species},Breed,${pet.breed}\n\n`;

    csv += `EXPENSE LEDGER (tblExpenses)\n`;
    csv += `Date,Category,Description,Amount ($),Payment Method,Notes\n`;
    expenses.forEach((e) => {
      csv += `"${e.date}","${e.category}","${e.description}",${e.amount},"${e.paymentMethod}","${e.notes}"\n`;
    });

    csv += `\nVACCINATION TRACKER (tblVaccinations)\n`;
    csv += `Vaccine,Date Given,Next Due,Vet,Batch #,Cost ($),Notes\n`;
    vaccinations.forEach((v) => {
      csv += `"${v.vaccine}","${v.dateGiven}","${v.nextDue}","${v.veterinarian}","${v.batchNumber}",${v.cost},"${v.notes}"\n`;
    });

    return csv;
  };

  const handleCopyCSV = () => {
    const csvContent = generateCSV();
    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative animate-scale-up space-y-5">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Google Sheets & Workspace Integration
            </h3>
            <p className="text-xs text-slate-500">
              Export and sync your 12-tab Pet Tracker data into Google Sheets seamlessly.
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Card 1: Direct .xlsx download compatible with Google Sheets */}
          <div className="bg-emerald-50/50 dark:bg-slate-800/80 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
              <Download className="w-4 h-4" />
              <span>Download .XLSX Workbook</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Generates a full 12-sheet Excel file with all formulas (<code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded">SUMIFS</code>, <code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded">IF</code>, <code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded">DATEDIF</code>). Open <strong className="text-slate-800 dark:text-white">Google Drive</strong> → File → Open → Upload.
            </p>
            <button
              onClick={() => {
                onExportExcel();
                onClose();
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Export 12-Sheet Workbook
            </button>
          </div>

          {/* Card 2: Copy CSV Data for direct paste */}
          <div className="bg-blue-50/50 dark:bg-slate-800/80 p-5 rounded-2xl border border-blue-200 dark:border-blue-800/50 space-y-3">
            <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-300 font-bold text-sm">
              <Copy className="w-4 h-4" />
              <span>Copy Sheet CSV Data</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Copies structured tabular CSV formatted text directly to your clipboard. Simply press <kbd className="px-1.5 py-0.5 bg-white border text-[10px] rounded font-mono">Ctrl + V</kbd> inside any Google Sheets cell.
            </p>
            <button
              onClick={handleCopyCSV}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Sheet Data</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Instructions Box */}
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>How to open in Google Sheets:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300">
            <li>Click <strong>"Export 12-Sheet Workbook"</strong> to save the <code className="font-mono text-[10px]">.xlsx</code> file.</li>
            <li>Go to <a href="https://sheets.google.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center">Google Sheets <ExternalLink className="w-3 h-3 ml-0.5" /></a>.</li>
            <li>Click <strong>Blank Spreadsheet</strong> → <strong>File</strong> → <strong>Import</strong> → <strong>Upload</strong>.</li>
            <li>All 12 interconnected tabs, colors, and formulas will load automatically!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
