import React, { useState, useRef } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  withCredentials: true,
});

const Recorder = ({ authToken, isLoggedIn }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [audioURL, setAudioURL] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleStartRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = event => {
          chunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
          const url = URL.createObjectURL(blob);
          setAudioURL(url);
          chunksRef.current = [];
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      })
      .catch(error => {
        console.error('Error accessing microphone:', error);
      });
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, `audio_${Date.now()}.wav`);

    api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${authToken}`
      },
    })
      .then(response => {
        console.log('File uploaded:', response.data);
        alert('Audio recorded and uploaded successfully!');
      })
      .catch(error => {
        console.error('Error uploading file:', error);
        alert('Error uploading audio. Please try again.');
      });
  };

  const handleSendRecording = () => {
    if (!isLoggedIn) {
      alert('Please log in or register to send recordings.');
      return;
    }
    if (!audioURL) {
      alert('Please record audio first.');
      return;
    }
    fetch(audioURL)
      .then(res => res.blob())
      .then(blob => {
        uploadAudio(blob);
      })
      .catch(err => {
        console.error('Error fetching audio blob:', err);
      });
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadFile = () => {
    if (!isLoggedIn) {
      alert('Please log in or register to upload recordings.');
      return;
    }
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);

    api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${authToken}`
      },
    })
      .then(response => {
        console.log('File uploaded:', response.data);
        alert('File uploaded successfully!');
      })
      .catch(error => {
        console.error('Error uploading file:', error);
        alert('Error uploading file. Please try again.');
      });
  };

  return (
    <div>
      <h1>Recorder</h1>
      <p>{isLoggedIn ? 'You are logged in. Record and send audio below.' : 'Please log in to record and send audio.'}</p>
      {isRecording ? (
        <button onClick={handleStopRecording}>Stop Recording</button>
      ) : (
        <button onClick={handleStartRecording}>Start Recording</button>
      )}
      {audioURL && (
        <div>
          <h2>Recorded Audio</h2>
          <audio controls src={audioURL}></audio>
          <br />
          <button onClick={handleSendRecording} disabled={!isLoggedIn}>Send Recording</button>
        </div>
      )}
      <div>
        <h2>Upload Audio File</h2>
        <input type="file" accept="audio/*" onChange={handleFileChange} />
        <br />
        <button onClick={handleUploadFile} disabled={!isLoggedIn}>Upload File</button>
      </div>
    </div>
  );
};

export default Recorder;
