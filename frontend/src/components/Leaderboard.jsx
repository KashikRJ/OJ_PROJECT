
import React, { useEffect, useState } from 'react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leaderboard/`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    }
  };

  return (
    <div className="p-4">
      <table className="w-full text-left table-auto font-mono shadow-lg rounded-lg overflow-hidden">
        <thead className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          <tr className="rounded-t-lg">
            <th className="px-4 py-2">User</th>
            <th className="px-4 py-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr key={index} className={`hover:bg-gray-100 dark:hover:bg-gray-800 ${index % 2 === 0 ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-600'} text-gray-800 dark:text-gray-200`}>
              <td className="border-b dark:border-gray-700 px-4 py-2">{entry.name}</td>
              <td className="border-b dark:border-gray-700 px-4 py-2">{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
