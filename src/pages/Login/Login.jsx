import React, { useState, useEffect } from 'react';
import logo from '../../logo.png';
import './Login.css';

import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [userRole, setUserRole] = useState('');

  // Clear tokens on page load
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.role);
        setUserRole(data.role);
        setShowSuccess(true);

        // ⏱ GPay-style delay
        setTimeout(() => {
          if (data.role === 'admin') navigate('/admin');
          else if (data.role === 'faculty') navigate('/Faculty');
          else if (data.role === 'cr') navigate('/cr');
        }, 1100);
      } else {
        alert(data.error || 'Login Failed');
      }
    } catch (err) {
      alert('Server not responding');
    } finally {
      setLoading(false);
      setPassword('');
    }
  }

  return (
    <>
      {/* 🔥 SUCCESS ANIMATION OVERLAY */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-box">
            <svg className="checkmark" viewBox="0 0 52 52">
              <circle
                className="checkmark-circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className="checkmark-check"
                fill="none"
                d="M14 27 l7 7 l17 -17"
              />
            </svg>
            <p>Login Successful</p>
          </div>
        </div>
      )}

      {/* 🔹 LOGIN PAGE */}
      <div className="login-page">
        <header
          style={{
            backgroundColor: '#AD3A3C',
            color: 'white',
            display: 'flex',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '30px',
              fontSize: '20px',
              fontWeight: 'bold',
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{ height: '10vh', padding: '20px' }}
            />
          </div>
        </header>

        <div
          className="login-container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#AD3A3C',
            height: '60vh',
            border: '2px solid black',
            borderRadius: '10px',
            margin: 'auto',
            marginTop: '10vh',
            padding: '20px',
            color: 'white',
          }}
        >
          <h2
            style={{
              margin: '20px 0px',
              fontSize: '5vh',
              textAlign: 'center',
            }}
          >
            Login Page
          </h2>

          <form
            onSubmit={handleLogin}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2vh',
              margin: '5vh auto',
              width: '80%',
            }}
          >
            <label>Email Address</label>
            <input
              type="email"
              required
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Password</label>
            <input
              type="password"
              required
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" disabled={loading} className='boxy'>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;