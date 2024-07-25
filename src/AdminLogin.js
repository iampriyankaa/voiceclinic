import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const AdminLogin = ({ setUser, setAuthToken, updateLoginStatus }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('https://127.0.0.1:5000/admin/login', {
        username,
        password,
      });
      setUser(response.data.user);
      setAuthToken(response.data.token);
      updateLoginStatus(true);
      setMessage(response.data.message);
      navigate('/admin/recordings');
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title text-center mb-4">Admin Login</h3>
              <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <div className="mb-3">
                  <label htmlFor="adminUsername" className="form-label">Username:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="adminUsername"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="adminPassword" className="form-label">Password:</label>
                  <input
                    type="password"
                    className="form-control"
                    id="adminPassword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">Login</button>
                </div>
              </form>
              {message && <p className="mt-3 text-center">{message}</p>}
              <hr className="my-4" />
              <div className="text-center">
                <p>Don't have an account? <Link to="/admin/register">Register</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
