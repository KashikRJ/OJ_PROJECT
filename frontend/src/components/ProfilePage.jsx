import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProfilePage = () => {
  const [name, setName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState('');
  const [problemsSolved, setProblemsSolved] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      axios.get(`${API_BASE_URL}/profile/${userId}/`)
        .then(response => {
          const { name, email, problemsSolved, totalScore } = response.data;
          setName(name);
          setEmail(email);
          setProblemsSolved(problemsSolved);
          setTotalScore(totalScore);
        })
        .catch(error => {
          console.error("There was an error fetching the profile data!", error);
          if (error.response && error.response.status === 401) {
            navigate('/');
          }
        });
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const saveName = () => {
    const userId = localStorage.getItem('user_id');
    axios.post(`${API_BASE_URL}/profile/${userId}/`, { name })
      .then(response => {
        setIsEditing(false);
      })
      .catch(error => {
        console.error("There was an error updating the name!", error);
      });
  };

  const handleLogout = () => {
    axios.post(`${API_BASE_URL}/logout/`)
      .then(() => {
        clearCookies();
        navigate('/');
      })
      .catch(error => {
        console.error("There was an error logging out!", error);
      });
  };

  const clearCookies = () => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    localStorage.removeItem('user_id');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-neutral-300 to-stone-400 dark:from-slate-900 dark:to-slate-700 text-gray-800 dark:text-gray-100 p-8">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 font-mono">Profile</h2>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300">Name:</label>
          {isEditing ? (
            <div className="flex items-center">
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 mr-2 flex-1"
              />
              <button onClick={saveName} className="bg-blue-500 text-white rounded px-4 py-2">Save</button>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="text-xl">{name}</span>
              <button onClick={toggleEditing} className="ml-2 text-blue-500">Edit</button>
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300">Email ID:</label>
          <span className="text-xl">{email}</span>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300">Problems Solved:</label>
          <ul className="list-disc list-inside">
            {problemsSolved.map((problem, index) => (
              <li key={index}>{problem}</li>
            ))}
          </ul>
        </div>
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Total Score:</label>
          <span className="text-xl">{totalScore}</span>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <button onClick={handleLogout} className="bg-red-500 text-white rounded px-4 py-2">Logout</button>
      </div>
    </div>
  );
};

export default ProfilePage;
