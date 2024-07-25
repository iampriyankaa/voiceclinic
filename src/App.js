import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import Register from './Register';
import About from './About';
import Recorder from './Recorder';
import Homepage from './Homepage';
import AdminRecordings from './AdminRecordings';
import AdminLogin from './AdminLogin';
import AdminRegister from './AdminRegister';
import Footer from './Footer';
import Record from './Record';
import './App.css';

const api = axios.create({
  baseURL: 'https://127.0.0.1:5000',
  withCredentials: true,
});

function App() {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/current_user');
        const { user, role } = response.data;
        setUser(user);
        setAuthToken(response.data.token);
        setIsLoggedIn(true);
        setIsAdmin(role === 'admin');
      } catch (error) {
        console.error('Error fetching current user:', error);
        setUser(null);
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLogout = () => {
    api.post('/logout')
      .then(() => {
        setUser(null);
        setAuthToken(null);
        setIsLoggedIn(false);
        setIsAdmin(false);
        window.location.href = '/';
      })
      .catch(error => console.error('Logout error:', error));
  };

  const updateLoginStatus = (status) => {
    setIsLoggedIn(status);
  };
  
  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-light bg-white">
          <div className="container-fluid">
            <Link className="navbar-brand text-primary" to="/">VoiceClinic</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                {isLoggedIn && user ? (
                  <>
                    <li className="nav-item">
                      <button className="btn btn-link nav-link text-primary" onClick={handleLogout}>Logout</button>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-primary" to="/about">About</Link>
                    </li>
                    {isAdmin && (
                      <li className="nav-item">
                        <Link className="nav-link text-success" to="/admin/recordings">Admin Recordings</Link>
                      </li>
                    )}
                  </>
                ) : (
                  <>
                    <li className="nav-item dropdown">
                      <Link className="nav-link dropdown-toggle text-primary" to="#" id="patientDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        For Patient
                      </Link>
                      <ul className="dropdown-menu" aria-labelledby="patientDropdown">
                        <li><Link className="dropdown-item" to="/login">Patient Login</Link></li>
                        <li><Link className="dropdown-item" to="/register">Patient Register</Link></li>
                      </ul>
                    </li>
                    <li className="nav-item dropdown">
                      <Link className="nav-link dropdown-toggle text-primary" to="#" id="adminDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        For Admin
                      </Link>
                      <ul className="dropdown-menu" aria-labelledby="adminDropdown">
                        <li><Link className="dropdown-item" to="/admin/login">Admin Login</Link></li>
                        <li><Link className="dropdown-item" to="/admin/register">Admin Register</Link></li>
                      </ul>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-primary" to="/about">About</Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login setUser={setUser} setAuthToken={setAuthToken} updateLoginStatus={updateLoginStatus} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin/login" element={<AdminLogin setUser={setUser} setAuthToken={setAuthToken} updateLoginStatus={updateLoginStatus} />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/record" element={<Record authToken={authToken} isLoggedIn={isLoggedIn}  />} />
          <Route path="/recorder" element={<Recorder authToken={authToken} isLoggedIn={isLoggedIn} />} />
          <Route path="/admin/recordings" element={<AdminRecordings authToken={authToken} isLoggedIn={isLoggedIn} isAdmin={true} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer/>
      </div>
    </Router>
  );
}

export default App;
