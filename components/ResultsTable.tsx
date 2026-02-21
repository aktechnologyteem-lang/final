
import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter, 
  Check,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';
import { EmailResult, EmailStatus } from '../types';

interface ResultsTableProps {
  results: EmailResult[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EmailStatus | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof EmailResult; direction: 'asc' | 'desc' } | null>(null);

  const filteredResults = useMemo(() => {
    let temp = [...results];

    if (searchTerm) {
      temp = temp.filter(r => r.email.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (statusFilter !== 'all') {
      temp = temp.filter(r => r.status === statusFilter);
    }

    if (sortConfig) {
      temp.sort((a, b) => {
        const valA = (a[sortConfig.key] ?? '').toString();
        const valB = (b[sortConfig.key] ?? '').toString();
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return temp;
  }, [results, searchTerm, statusFilter, sortConfig]);

  const requestSort = (key: keyof EmailResult) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const BooleanIcon = ({ value }: { value: boolean }) => (
    value 
      ? <Check size={16} className="text-emerald-500 mx-auto" strokeWidth={3} /> 
      : <X size={16} className="text-rose-500 mx-auto" strokeWidth={3} />
  );

  const ColumnHeader = ({ label, subLabel, sortKey }: { label: string, subLabel: string, sortKey: keyof EmailResult }) => (
    <th 
      className="px-4 py-4 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group border-r border-slate-100 dark:border-slate-800 last:border-0"
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
          {label}
          {sortConfig?.key === sortKey && (
            sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-indigo-500" /> : <ChevronDown size={12} className="text-indigo-500" />
          )}
        </div>
        <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 lowercase">
          {subLabel}
        </div>
      </div>
    </th>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Table Controls */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
          >
            <option value="all">All Result Mapping</option>
            <option value="valid">Valid Only</option>
            <option value="invalid">Invalid Only</option>
            <option value="risky">Risky Only</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-4 w-10 text-[11px] font-bold text-slate-400 uppercase border-r border-slate-100 dark:border-slate-800 text-center">#</th>
              <ColumnHeader label="Email" subLabel="email" sortKey="email" />
              <ColumnHeader label="Quality" subLabel="quality" sortKey="quality" />
              <ColumnHeader label="Result" subLabel="result" sortKey="result" />
              <ColumnHeader label="Result Code" subLabel="resultcode" sortKey="resultCode" />
              <ColumnHeader label="Sub Result" subLabel="subresult" sortKey="subResult" />
              <th className="px-4 py-4 text-center border-r border-slate-100 dark:border-slate-800">
                 <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Free</div>
                 <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 lowercase">free</div>
              </th>
              <th className="px-4 py-4 text-center border-r border-slate-100 dark:border-slate-800">
                 <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Role</div>
                 <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 lowercase">role</div>
              </th>
              <ColumnHeader label="Did You Mean" subLabel="didyoumean" sortKey="didYouMean" />
              <ColumnHeader label="Error" subLabel="error" sortKey="error" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredResults.length > 0 ? (
              filteredResults.map((result, idx) => (
                <tr key={result.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-2 py-3 text-[11px] font-medium text-slate-400 text-center border-r border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/40">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px] border-r border-slate-100 dark:border-slate-800">
                    {result.email}
                  </td>
                  <td className="px-4 py-3 text-[13px] border-r border-slate-100 dark:border-slate-800">
                    <span className={`font-semibold ${
                      result.quality.toLowerCase() === 'good' ? 'text-emerald-600 dark:text-emerald-400' : 
                      result.quality.toLowerCase() === 'bad' ? 'text-rose-600 dark:text-rose-400' : 
                      'text-slate-500'
                    }`}>
                      {result.quality}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                    {result.result}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">
                    {result.resultCode}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">
                    {result.subResult}
                  </td>
                  <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800">
                    <BooleanIcon value={result.free} />
                  </td>
                  <td className="px-4 py-3 border-r border-slate-100 dark:border-slate-800">
                    <BooleanIcon value={result.role} />
                  </td>
                  <td className="px-4 py-3 text-[12px] text-indigo-600 dark:text-indigo-400 italic border-r border-slate-100 dark:border-slate-800">
                    {result.didYouMean || '-'}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-rose-500 dark:text-rose-400 truncate max-w-[150px]">
                    {result.error || '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic">
                  <div className="flex flex-col items-center gap-2">
                    <Info size={32} className="opacity-20" />
                    <span>No verification data available. Paste emails to get started.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
