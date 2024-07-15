import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ThemeSwitcher from './ThemeSwitcher';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProblemPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('Python');
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [verdict, setVerdict] = useState('');
  const [showConsole, setShowConsole] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState('');
  const [showSuggestionButton, setShowSuggestionButton] = useState(false);

  useEffect(() => {
    fetchProblem();
  }, []);

  const fetchProblem = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/problem/${id}/`);
      setProblem(response.data);
    } catch (error) {
      console.error('Error fetching problem:', error);
    }
  };

  const handleRunCode = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/run_code/`, {
        code,
        language,
        input
      });
      setOutput(response.data.output);
      setVerdict(response.data.verdict);
    } catch (error) {
      console.error('Error running code:', error);
      setOutput('Error');
      setVerdict('Error');
    }
  };

  const handleSubmitCode = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        setOutput('Error');
        setVerdict('User not logged in');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/submit_code/`, {
        user_id: userId,
        problem_id: id,
        code,
        language
      });

      setOutput(response.data.output || '');
      setVerdict(response.data.verdict || 'Success');

      if (response.data.status === 'failed') {
        getSuggestions();
      } else {
        setShowSuggestionButton(false);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error submitting code:', error.response || error);
      setOutput('Error');
      setVerdict('Error');
    }
  };

  const getSuggestions = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/get_code_suggestions/`, {
           code  
        });

        const suggestionText = response.data.suggestion;

        const explanationMatch = suggestionText.match(/Explanation:\s*([\s\S]*?)\n\nCorrected Code:/);
        const codeMatch = suggestionText.match(/Corrected Code:\s*([\s\S]*)/);

        const explanation = explanationMatch ? explanationMatch[1].trim() : 'No explanation provided.';
        const correctedCode = codeMatch ? codeMatch[1].trim() : 'No corrected code provided.';

        const formattedSuggestions = (
            <>
                <div className="mb-4">
                    <h3 className="text-lg font-bold mb-2">Explanation:</h3>
                    <p>{explanation}</p>
                </div>
                <h3 className="text-lg font-bold mb-2">Corrected Code:</h3>
                <div className="relative mb-4">
                    <pre className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded p-4 overflow-auto">
                        <code>{correctedCode}</code>
                    </pre>
                    <button
                        className="absolute top-2 right-2 bg-blue-500 text-white rounded px-2 py-1"
                        onClick={(e) => handleCopy(e, correctedCode)}
                    >
                        Copy
                    </button>
                </div>
            </>
        );

        setSuggestions(formattedSuggestions);
        setShowSuggestionButton(true);
    } catch (error) {
        console.error('Error fetching suggestions:', error.response || error);
    }
};


  const handleCopy = (e, text) => {
    navigator.clipboard.writeText(text);
    const button = e.target;
    button.textContent = "Copied";
    setTimeout(() => {
      button.textContent = "Copy";
    }, 2000);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setCode('');  // Clear the code editor when language changes
  };

  if (!problem) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-neutral-300 to-stone-400 dark:from-slate-900 dark:to-slate-700 text-gray-800 dark:text-gray-100 p-8 relative">
      <div className="flex justify-between items-center p-4">
        <ThemeSwitcher />
      </div>
      <div className="flex flex-row space-x-4">
        {/* First Section */}
        <div className="w-1/2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-y-auto">
          <h1 className="text-3xl font-bold mb-4">{problem.title}</h1>
          <div className="flex space-x-2 mb-4">
            <span className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full px-2 py-1">{problem.difficulty}</span>
            {problem.categories.map((category, index) => (
              <span key={index} className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full px-2 py-1">{category}</span>
            ))}
          </div>
          <div dangerouslySetInnerHTML={{ __html: problem.description }}></div>
        </div>
        {/* Second Section */}
        <div className="w-1/2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col space-y-4">
          <select 
            value={language} 
            onChange={handleLanguageChange} 
            className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
          >
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="C++">C++</option>
          </select>
          <textarea 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your code here..."
            className="flex-1 p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded resize-none"
            rows="15"
          ></textarea>
          {showConsole && (
            <div className="flex space-x-4">
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Input"
                className="flex-1 p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded resize-none"
              ></textarea>
              <textarea 
                value={output}
                readOnly
                placeholder="Output"
                className="flex-1 p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded resize-none"
              ></textarea>
              <textarea 
                value={verdict}
                readOnly
                placeholder="Verdict"
                className="flex-1 p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded resize-none"
              ></textarea>
            </div>
          )}
          <div className="flex justify-between">
            <button 
              onClick={() => setShowConsole(!showConsole)}
              className="bg-blue-500 text-white rounded px-4 py-2"
            >
              Console
            </button>
            <button 
              onClick={handleRunCode}
              className="bg-green-500 text-white rounded px-4 py-2"
            >
              Run
            </button>
            <button 
              onClick={handleSubmitCode}
              className="bg-red-500 text-white rounded px-4 py-2"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      {showSuggestionButton && (
        <button 
          className="absolute top-16 left-0 bg-yellow-500 text-white rounded-full w-12 h-12 flex items-center justify-center animate-pulse"
          onClick={() => setShowSuggestions(true)}
        >
          !
        </button>
      )}
      {showSuggestions && (
        <div className="absolute top-20 left-16 w-1/3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-y-auto max-h-screen text-gray-800 dark:text-gray-200"style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
          <button
            onClick={() => setShowSuggestions(false)}
            className="bg-red-500 text-white rounded px-4 py-2 mb-4"
          >
            Close
          </button>
          <h2 className="text-2xl font-bold mb-4">Code Suggestions</h2>
          <div >{suggestions}</div>
        </div>
      )}
    </div>
  );
};

export default ProblemPage;
