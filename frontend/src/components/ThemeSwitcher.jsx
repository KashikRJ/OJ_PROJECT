import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/solid';

const ThemeSwitcher = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="absolute top-4 right-4 flex items-center">
      <label className="relative inline-flex items-center mx-2 cursor-pointer">
        <input type="checkbox" checked={darkMode} onChange={toggleTheme} className="sr-only" />
        <div className="w-11 h-5 bg-gray-200 rounded-full dark:bg-gray-700">
          <div
            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
              darkMode ? 'translate-x-6' : ''
            } flex items-center justify-center`}
          >
            {darkMode ? <MoonIcon className="w-4 h-4 text-gray-800" /> : <SunIcon className="w-4 h-4 text-yellow-500" />}
          </div>
        </div>
      </label>
    </div>
  );
};

export default ThemeSwitcher;
