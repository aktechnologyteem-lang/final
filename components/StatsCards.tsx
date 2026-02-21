
import React from 'react';
import { Mail, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { VerificationStats } from '../types';

interface StatsCardsProps {
  stats: VerificationStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    { 
      label: 'Total', 
      value: stats.total, 
      icon: <Mail className="text-slate-500" size={18} />, 
      color: 'bg-slate-100 dark:bg-slate-800' 
    },
    { 
      label: 'Valid', 
      value: stats.valid, 
      icon: <CheckCircle className="text-emerald-500" size={18} />, 
      color: 'bg-emerald-100/50 dark:bg-emerald-500/10' 
    },
    { 
      label: 'Invalid', 
      value: stats.invalid, 
      icon: <XCircle className="text-rose-500" size={18} />, 
      color: 'bg-rose-100/50 dark:bg-rose-500/10' 
    },
    { 
      label: 'Risky', 
      value: stats.risky, 
      icon: <AlertTriangle className="text-amber-500" size={18} />, 
      color: 'bg-amber-100/50 dark:bg-amber-500/10' 
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card) => (
        <div 
          key={card.label} 
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-xl ${card.color}`}>
              {card.icon}
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {card.label}
          </p>
          <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
