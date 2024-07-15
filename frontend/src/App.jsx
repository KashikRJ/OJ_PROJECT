
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ThemeSwitcher from './components/ThemeSwitcher';
import GithubIcon from './components/GithubIcon';
import TitleText from './components/TitleText';
import SlideControls from './components/SlideControls';
import FormContainer from './components/FormContainer';
import ProblemsPage from './components/ProblemsPage';
import ProfilePage from './components/ProfilePage';
import ProblemPage from './components/ProblemPage'; // Import ProblemPage

const App = () => {
  const [resetForm, setResetForm] = useState(false);

  React.useEffect(() => {
    document.title = "Online Judge";
  }, []);

  const handleSlideChange = (event) => {
    const loginForm = document.querySelector("form.login");
    const loginText = document.querySelector(".title-text .login");

    if (event.target.id === "signup") {
      loginForm.style.marginLeft = "-50%";
      loginText.style.marginLeft = "-50%";
    } else {
      loginForm.style.marginLeft = "0%";
      loginText.style.marginLeft = "0%";
    }

    setResetForm(true);
    setTimeout(() => setResetForm(false), 0); // Trigger re-render
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-neutral-300 to-stone-400 dark:from-slate-900 dark:to-slate-700">
              <ThemeSwitcher />
              <a href="https://github.com/KashikRJ/OJ_PROJECT" target="_blank" rel="noopener noreferrer" className="absolute top-4 left-4">
                <GithubIcon className="w-6 h-6 text-white" />
              </a>
              <h1 className="text-6xl font-bold mb-10 text-gray-800 dark:text-white font-mono">Online Judge</h1>
              <div className="wrapper">
                <TitleText />
                <SlideControls handleSlideChange={handleSlideChange} />
                <FormContainer resetForm={resetForm} />
              </div>
            </div>
          }
        />
        <Route path="/dashboard" element={<ProblemsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/problem/:id" element={<ProblemPage />} /> {/* Add ProblemPage Route */}
      </Routes>
    </Router>
  );
};

export default App;
