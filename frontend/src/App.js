import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import { ThemeProvider } from './contexts/ThemeContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Live from './pages/Live';
import Earnings from './pages/Earnings';
import About from './pages/About';
import Terms from './pages/Terms';
import Settings from './pages/Settings';
import Help from './pages/Help';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateCurrentUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
      <Routes>
          {/* Public Routes */}
          <Route path="/" element={!currentUser ? <Landing /> : <Navigate to="/feed" />} />
          <Route path="/login" element={!currentUser ? <Login onLogin={handleLogin} /> : <Navigate to="/feed" />} />
          <Route path="/register" element={!currentUser ? <Register onLogin={handleLogin} /> : <Navigate to="/feed" />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* Admin Routes (Separate - No App Layout) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminPanel />} />
          
          {/* Protected User Routes */}
          <Route path="/feed" element={currentUser ? <Feed currentUser={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/profile" element={currentUser ? <Profile currentUser={currentUser} onLogout={handleLogout} updateUser={updateCurrentUser} /> : <Navigate to="/" />} />
          <Route path="/messages" element={currentUser ? <Messages currentUser={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/live" element={currentUser ? <Live currentUser={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/earnings" element={currentUser ? <Earnings currentUser={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/settings" element={currentUser ? <Settings currentUser={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/help" element={currentUser ? <Help currentUser={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
