import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LoginForm = ({ resetForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (resetForm) {
      setEmail('');
      setPassword('');
      setError('');
    }
  }, [resetForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Something went wrong!');
        return;
      }

      localStorage.setItem('user_id', data.user_id);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <form id="loginForm" action="#" className="login" onSubmit={handleSubmit}>
      <div className="field">
        <input 
          type="text" 
          placeholder="Email Address" 
          required 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
      </div>
      <div className="field">
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
      </div>
      <div className="field btn">
        <div className="btn-layer"></div>
        <input type="submit" value="Login" />
      </div>
      <div className="signup-link">Not a member? <a href="" onClick={(e) => { e.preventDefault(); document.getElementById('signup').click(); }}>Signup now</a></div>
    </form>
  );
};

export default LoginForm;
