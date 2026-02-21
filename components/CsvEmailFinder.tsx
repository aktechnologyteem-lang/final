import React, { useState } from 'react';
import Papa from 'papaparse';
import { Upload, Loader2, Download, Check, X, AlertCircle } from 'lucide-react';
import { backendProxy } from '../services/backendProxy';
import { VerificationJob, EmailResult } from '../types';

interface CsvRow {
  firstName: string;
  lastName: string;
  domain: string;
}

interface ResultRow {
  firstName: string;
  lastName: string;
  domain: string;
  foundEmail: string;
  status: 'pending' | 'processing' | 'complete';
  permutations?: {
    email: string;
    status: 'pending' | 'processing' | 'valid' | 'invalid' | 'risky';
    quality: string;
    result: string;
  }[];
}

interface CsvEmailFinderProps {
  onFileParsed: (data: CsvRow[]) => void;
  results: ResultRow[];
  isLoading: boolean;
  onVerifySelected: (selected: CsvRow[]) => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'valid':
      return <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full"><Check size={12} /> Valid</span>;
    case 'invalid':
      return <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-rose-700 bg-rose-100 rounded-full"><X size={12} /> Invalid</span>;
    case 'risky':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-amber-700 bg-amber-100 rounded-full"><AlertCircle size={12} /> Risky</span>;
    case 'processing':
      return <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-slate-700 bg-slate-100 rounded-full"><Loader2 size={12} className="animate-spin"/> Processing</span>;
    case 'pending':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-slate-500 bg-slate-100 rounded-full">Pending</span>;
    case 'complete':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-indigo-700 bg-indigo-100 rounded-full">Complete</span>;
    default:
      return null;
  }
};

const CsvEmailFinder: React.FC<CsvEmailFinderProps> = ({ onFileParsed, results, isLoading, onVerifySelected }) => {
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);


    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim().replace(/\s+/g, '').toLowerCase(),
      complete: (parsed) => {
        const required = ['firstname', 'lastname', 'domain'];
        const missing = required.filter(h => !parsed.meta.fields?.map(f => f.toLowerCase()).includes(h));
        
        if (missing.length > 0) {
          setError(`Missing required columns: ${missing.join(', ')}`);

          return;
        }

        const renamedData = parsed.data.map(d => ({
          firstName: d.firstname,
          lastName: d.lastname,
          domain: d.domain
        }));

        onFileParsed(renamedData);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setError('Failed to parse CSV file.');
      }
    });
  };


  
  const downloadCsv = () => {
    const dataToExport = results.map(row => ({
      'First Name': row.firstName,
      'Last Name': row.lastName,
      'Domain': row.domain,
      'Found Email': row.foundEmail,
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'verified_emails.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold flex items-center gap-3 mb-4">
          <Upload className="w-6 h-6 text-indigo-500" />
          <span>Bulk Email Finder</span>
        </h2>
        <div className="max-w-xl">
          <p className="text-slate-500 dark:text-slate-400 mb-4">Upload a CSV with columns: <strong>firstName</strong>, <strong>lastName</strong>, <strong>domain</strong>. We'll find the correct email.</p>
          {error && <p className="text-rose-500 font-bold mb-4">{error}</p>}
          <input 
            type="file" 
            accept=".csv"
            onChange={handleFileChange}
            disabled={isLoading}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50" 
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 flex justify-between items-center">
           <h2 className="text-xl font-bold">Results</h2>
           <div className="flex items-center gap-2">
            <button onClick={() => onVerifySelected(selectedRows.map(i => results[i]))} disabled={selectedRows.length === 0 || isLoading} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-indigo-500 text-white disabled:bg-slate-200 disabled:text-slate-400">
              <Check size={16} />
              Find Emails for Selected ({selectedRows.length})
            </button>
            <button onClick={downloadCsv} disabled={results.length === 0 || isLoading} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-emerald-500 text-white disabled:bg-slate-200 disabled:text-slate-400">
              <Download size={16} />
              Export CSV
            </button>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="p-4 text-xs font-bold uppercase text-slate-500">
                  <input 
                    type="checkbox" 
                    onChange={e => setSelectedRows(e.target.checked ? results.map((_, i) => i) : [])}
                    checked={selectedRows.length === results.length && results.length > 0}
                  />
                </th>
                <th className="p-4 text-xs font-bold uppercase text-slate-500">First Name</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-500">Last Name</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-500">Domain</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-500">Found Email</th>
                <th className="p-4 text-xs font-bold uppercase text-slate-500 text-center">Status</th>
                {Array.from({ length: 8 }).map((_, i) => (
                  <React.Fragment key={i}>
                    <th className="p-4 text-xs font-bold uppercase text-slate-500 whitespace-nowrap">{i + 1}st Email</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-500">Quality</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-500">Result</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, index) => (
                <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      checked={selectedRows.includes(index)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedRows([...selectedRows, index]);
                        } else {
                          setSelectedRows(selectedRows.filter(i => i !== index));
                        }
                      }}
                    />
                  </td>
                  <td className="p-4 font-medium">{row.firstName}</td>
                  <td className="p-4 font-medium">{row.lastName}</td>
                  <td className="p-4 font-medium">{row.domain}</td>
                  <td className="p-4 font-mono text-sm">{row.foundEmail}</td>
                  <td className="p-4 text-center">
                    <StatusBadge status={row.status} />
                  </td>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <React.Fragment key={i}>
                      <td className="p-4 font-mono text-sm">{row.permutations?.[i]?.email || ''}</td>
                      <td className="p-4 text-sm">{row.permutations?.[i]?.quality || ''}</td>
                      <td className="p-4 text-sm">{row.permutations?.[i]?.result || ''}</td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CsvEmailFinder;
