import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const api = axios.create({
  baseURL: 'https://127.0.0.1:5000',
  withCredentials: true,
});

const AdminRecordings = ({ isLoggedIn }) => {
  const [recordings, setRecordings] = useState([]);
  const [playing, setPlaying] = useState(null);
  const audioRef = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    fetchRecordings();

    socket.current = io('https://127.0.0.1:5000');

    socket.current.on('voice_message', (data) => {
      console.log('New voice message received:', data);
      fetchRecordings();
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  const fetchRecordings = async () => {
    try {
      const response = await api.get('/admin/recordings');
      if (response.status === 200) {
        setRecordings(response.data.recordings);
      } else {
        alert('Failed to fetch recordings.');
      }
    } catch (error) {
      alert('Error fetching recordings:', error);
    }
  };

  const togglePlayPause = (recording) => {
    if (playing === recording) {
      audioRef.current.pause();
      setPlaying(null);
    } else {
      audioRef.current.src = `https://127.0.0.1:5000/uploads/${recording}`;
      audioRef.current.play();
      setPlaying(recording);
    }
  };

  return (
    <div>
      <h1>Admin Recordings</h1>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {recordings.map((recording, index) => (
          <li key={index} style={{ marginBottom: '10px' }}>
            <span>{recording}</span>
            <button 
              onClick={() => togglePlayPause(recording)}
              style={{ marginLeft: '10px' }}
            >
              {playing === recording ? 'Pause' : 'Play'}
            </button>
            <a href={`https://127.0.0.1:5000/uploads/${recording}`} download>
              <button style={{ marginLeft: '10px' }}>Download</button>
            </a>
          </li>
        ))}
      </ul>
      <audio ref={audioRef} onEnded={() => setPlaying(null)} />
    </div>
  );
};

export default AdminRecordings;
