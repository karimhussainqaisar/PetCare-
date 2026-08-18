import React from 'react';
import { Code2 } from 'lucide-react';

interface FormulaTooltipProps {
  formula: string;
  showAlways?: boolean;
}

export const FormulaTooltip: React.FC<FormulaTooltipProps> = ({ formula, showAlways = false }) => {
  if (!showAlways) return null;

  return (
    <div className="mt-1 inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300 font-mono text-[11px] border border-amber-500/30">
      <Code2 className="w-3 h-3 text-amber-600 shrink-0" />
      <span className="truncate">{formula}</span>
    </div>
  );
};
