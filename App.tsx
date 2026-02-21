
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
      <Dashboard toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
    </div>
  );
};

export default App;
