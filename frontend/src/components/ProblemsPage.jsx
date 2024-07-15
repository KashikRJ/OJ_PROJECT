import React, { useState } from 'react';
import ProblemList from './ProblemList';
import Submissions from './Submissions';
import Leaderboard from './Leaderboard';
import ThemeSwitcher from './ThemeSwitcher';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

const ProblemsPage = () => {
  const [activeTab, setActiveTab] = useState('problems');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'problems':
        return <ProblemList />;
      case 'submissions':
        return <Submissions />;
      case 'leaderboard':
        return <Leaderboard />;
      default:
        return <ProblemList />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-neutral-300 to-stone-400 dark:from-slate-900 dark:to-slate-700 text-gray-800 dark:text-gray-100">
      <div className="flex justify-between items-center p-4">
        <Link to="/profile" className="text-xl">
          <FaUserCircle className="w-8 h-8 text-gray-800 dark:text-gray-100" />
        </Link>
        <ThemeSwitcher />
      </div>
      <div className="p-4">
        <div className="flex justify-center mb-4">
          <button
            className={`py-2 px-4 mx-2 font-mono rounded-t-lg ${activeTab === 'problems' ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-100'}`}
            onClick={() => setActiveTab('problems')}
          >
            Problems
          </button>
          <button
            className={`py-2 px-4 mx-2 font-mono rounded-t-lg ${activeTab === 'submissions' ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-100'}`}
            onClick={() => setActiveTab('submissions')}
          >
            Submissions
          </button>
          <button
            className={`py-2 px-4 mx-2 font-mono rounded-t-lg ${activeTab === 'leaderboard' ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-100'}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Leaderboard
          </button>
        </div>
        <div>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ProblemsPage;
