import React from 'react';
import { useNavigate } from 'react-router-dom';
import MonochromeLogin from '../components/MonochromeLogin';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (user) => {
    // Navigate to the protected workspace upon successful authentication
    // Note: ensure /dashboard exists or update to correct authenticateroute
    console.log("Logged in user:", user);
    navigate('/dashboard'); 
  };

  return (
    <div className="relative z-10 w-full min-h-screen flex items-center justify-center p-6 bg-transparent">
       <MonochromeLogin onLogin={handleLogin} />
    </div>
  );
};

export default Login;
