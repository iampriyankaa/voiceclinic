import React, { useState } from 'react';
import axios from 'axios';

function AdminRegister() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('https://127.0.0.1:5000/admin/register', {
        username,
        password,
        pin,
      });

      if (response.data) {
        setSuccess(response.data.message);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="text-center mb-4">Admin Register</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username:</label>
                  <input type="text" className="form-control" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password:</label>
                  <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label htmlFor="pin" className="form-label">Admin PIN:</label>
                  <input type="text" className="form-control" id="pin" value={pin} onChange={(e) => setPin(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary w-100">Register</button>
              </form>
              {error && <p className="text-danger mt-3">{error}</p>}
              {success && <p className="text-success mt-3">{success}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;
