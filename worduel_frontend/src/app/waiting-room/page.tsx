"use client";

import React, { useState } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8000';

const GameControl = () => {
  const [message, setMessage] = useState('');

  const handleReady = async () => {
    try {
      const response = await axios.post('/api/set_ready_status');
      setMessage(response.data.status || response.data.error);
    } catch (error: any) {
      if (error.response && error.response.status === 302) {
        window.location.href = error.response.headers.location;
      } else {
        setMessage('An unexpected error occurred');
        console.error(error);
      }
    }
  };

  const handleStartGame = async () => {
    try {
      const response = await axios.post('/api/start_game');
      setMessage(response.data.status || response.data.error);
    } catch (error: any) {
      if (error.response && error.response.status === 302) {
        window.location.href = error.response.headers.location;
      } else {
        setMessage('An unexpected error occurred');
        console.error(error);
      }
    }
  };

  return (
    <div>
      <h2>Game Control</h2>
      <button onClick={handleReady}>准备</button>
      <button onClick={handleStartGame}>开始游戏</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default GameControl;