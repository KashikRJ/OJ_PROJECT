import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  
  useEffect(() => {
    axios.get(`${API_BASE_URL}/problems/`)
      .then(response => {
        setProblems(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the problems!", error);
      });
  }, []);

  return (
    <div className="p-4">
      <table className="w-full text-left table-auto font-mono shadow-lg rounded-lg overflow-hidden">
        <thead className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          <tr className="rounded-t-lg">
            <th className="px-4 py-2">Problems</th>
            <th className="px-4 py-2">Difficulty</th>
            <th className="px-4 py-2">Acceptance</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem, index) => (
            <tr key={problem.id} className={`hover:bg-gray-100 dark:hover:bg-gray-800 ${index % 2 === 0 ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-600'} text-gray-800 dark:text-gray-200`}>
              <td className="border-b dark:border-gray-700 px-4 py-2">
                <a href={`/problem/${problem.id}`} className="text-blue-500 dark:text-blue-300">
                  {problem.title}
                </a>
                <div className="flex flex-wrap mt-1">
                  {problem.categories.map((category, index) => (
                    <span key={index} className="text-sm bg-gray-300 dark:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-full px-2 py-1 m-1">
                      {category}
                    </span>
                  ))}
                </div>
              </td>
              <td className="border-b dark:border-gray-700 px-4 py-2">{problem.difficulty}</td>
              <td className="border-b dark:border-gray-700 px-4 py-2">{problem.acceptance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProblemList;

