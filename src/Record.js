import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./Record.css"; 

const Record = ({ authToken, isLoggedIn }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const socket = useRef(null);
  const analyser = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null); 

  useEffect(() => {
    socket.current = io("https://127.0.0.1:5000", {
      transports: ["websocket"],
      auth: { token: authToken },
      autoConnect: false,
    });

    socket.current.connect();

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [authToken]);

  const startRecording = async () => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          initiateRecording();
        }
        return prev - 1;
      });
    }, 1000);
  };

  const initiateRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        const audioURL = URL.createObjectURL(audioBlob);
        setAudioURL(audioURL);
      };

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      analyser.current = audioContext.createAnalyser();
      analyser.current.fftSize = 256;
      source.connect(analyser.current);

      drawEqualizer();

      mediaRecorder.current.start();
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const drawEqualizer = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyser.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      analyser.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const barWidth = (WIDTH / bufferLength) * 2.5;
      let x = 0;

      dataArray.forEach((item) => {
        const barHeight = (item / 255) * HEIGHT;

        ctx.fillStyle = `rgb(0, 0, ${item})`;
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      });


      animationFrameId.current = requestAnimationFrame(draw);
    };
    draw();
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();
    setIsRecording(false);
    cancelAnimationFrame(animationFrameId.current);
  };

  const pauseRecording = () => {
    if (isPaused) {
      mediaRecorder.current.resume();
      setIsPaused(false);
      cancelAnimationFrame(animationFrameId.current);
      drawEqualizer();

    } else {
      mediaRecorder.current.pause();
      setIsPaused(true);
      cancelAnimationFrame(animationFrameId.current);
    }
  };

  const sendRecording = () => {
    cancelAnimationFrame(animationFrameId.current);
    const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
    const now = new Date();
    const formattedDate = `${now.getFullYear()}_${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}_${now.getDate().toString().padStart(2, "0")}_${now
      .getHours()
      .toString()
      .padStart(2, "0")}_${now.getMinutes().toString().padStart(2, "0")}`;
    const filename = `record_${formattedDate}.wav`;

    const formData = new FormData();
    formData.append("file", audioBlob, filename);

    fetch("https://127.0.0.1:5000/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        alert('File uploaded successfully');
        console.log("File uploaded successfully:", data);
        audioChunks.current = [];
        setAudioURL(null);
        
      })
      .catch((error) => {
        alert('Error uploading file')
        console.error("Error uploading file:", error);
        
      });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    fetch("https://127.0.0.1:5000/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("File uploaded successfully:", data);
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
      });
  };

  return (
    <div className="container mt-4">
      {isLoggedIn ? (
        <>
          {countdown > 0 && <p>Recording starts in: {countdown}</p>}
          <canvas ref={canvasRef} className="equalizer mt-3"></canvas>
          <button className="btn btn-primary mr-2" onClick={startRecording}>
            Start Recording
          </button>
          <button className="btn btn-danger mr-2" onClick={stopRecording} disabled={!isRecording}>
            Stop Recording
          </button>
          <button className="btn btn-warning mr-2" onClick={pauseRecording} disabled={!isRecording}>
            {isPaused ? "Resume Recording" : "Pause Recording"}
          </button>
          <br/>
          <input type="file" className="form-control-file mt-2" onChange={handleFileUpload} accept="audio/*" />
          <br/>
          {audioURL && (
            <>
              <audio controls className="mt-3" src={audioURL}></audio>
              <button className="btn btn-success mt-3" onClick={sendRecording}>
                Send Recording
              </button>
            </>
          )}
        </>
      ) : (
        <p>Please log in to record audio.</p>
      )}
    </div>
  );
};

export default Record;
