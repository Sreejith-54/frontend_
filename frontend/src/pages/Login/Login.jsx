import React, { useState } from 'react';
import logo from '../../logo.png';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx'; // Import the hook

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth(); // Get the login function from context
    
    // Using 'email' to match your backend schema
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // 1. Update the Global Auth Context
                // data.token and data.role come from your express res.json({ token, role })
                login(data.token, data.role);

                alert('Login Successful');

                // 2. Redirect based on role
                if (data.role === 'admin') {
                    navigate('/admin');
                } else if (data.role === 'faculty') {
                    navigate('/Faculty');
                } else if (data.role === 'cr') {
                    navigate('/cr');
                }
            } else {
                // Show the specific error from backend (e.g., "Wrong password")
                alert(data.error || 'Login Failed');
            }
        } catch (error) {
            console.error('Login Error:', error);
            alert('Server is not responding. Please try again later.');
        } finally {
            setLoading(false);
            setPassword('');
        }
    }

    return (
        <div className='login-page'>
            <header style={{ backgroundColor: '#AD3A3C', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '30px', fontSize: '20px', fontWeight: 'bold' }}>
                    <img src={logo} alt="Logo" style={{ height: '10vh', marginRight: '10px', padding: '20px' }} />
                </div>
            </header>
            <div className='login-container' style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#AD3A3C', height: '60vh', border: '2px solid black', borderRadius: '10px', margin: 'auto', marginTop: '10vh', padding: '20px', color: 'white' }}>
                <h2 style={{ margin: '20px 0px', fontSize: '5vh', textAlign: 'center', fontFamily: 'ui-sans-serif' }}>Login Page</h2>
                
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '2vh', margin: '5vh auto', width: '80%' }}>
                    <label>Email Address</label>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder='Enter email' 
                        required
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ padding: '10px', borderRadius: '5px' }}
                    />
                    
                    <label>Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        placeholder='Enter password' 
                        required
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '10px', borderRadius: '5px' }}
                    />
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            width: '100%', 
                            padding: '1.5vh', 
                            borderRadius: '1vh', 
                            margin: '3vh auto',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            backgroundColor: loading ? '#ccc' : 'white',
                            color: 'black',
                            fontWeight: 'bold'
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;