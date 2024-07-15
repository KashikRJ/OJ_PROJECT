
import React, { useEffect, useState } from 'react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/latest_submissions/`);
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  return (
    <div className="p-4">
      <table className="w-full text-left table-auto font-mono shadow-lg rounded-lg overflow-hidden">
        <thead className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          <tr className="rounded-t-lg">
            <th className="px-4 py-2">User</th>
            <th className="px-4 py-2">Problem</th>
            <th className="px-4 py-2">Result</th>
            <th className="px-4 py-2">Runtime</th>
            <th className="px-4 py-2">Language</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission, index) => (
            <tr key={index} className={`hover:bg-gray-100 dark:hover:bg-gray-800 ${index % 2 === 0 ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-600'} ${submission.status === "success" ? "text-green-500 dark:text-green-300" : "text-red-500 dark:text-red-300"}`}>
              <td className="border-b dark:border-gray-700 px-4 py-2">{submission.user}</td>
              <td className="border-b dark:border-gray-700 px-4 py-2">{submission.problem}</td>
              <td className="border-b dark:border-gray-700 px-4 py-2">{submission.result}</td>
              <td className="border-b dark:border-gray-700 px-4 py-2">{submission.runtime}</td>
              <td className="border-b dark:border-gray-700 px-4 py-2">{submission.language}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Submissions;
