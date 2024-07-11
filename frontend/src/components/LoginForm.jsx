import React, { useState, useEffect } from 'react';

const LoginForm = ({ resetForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
      const response = await fetch('http://127.0.0.1:8000/api/login/', {
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

      window.location.href = '/next';
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
