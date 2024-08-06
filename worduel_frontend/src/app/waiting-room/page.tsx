"use client";

import React, { useState } from 'react';
import axios from 'axios';

const GameControl = () => {
  const [message, setMessage] = useState('');

  const handleReady = async () => {
    try {
      const response = await axios.post('/set_ready_status');
      setMessage(response.data.status || response.data.error);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(error.response.data.error);
      } else {
        setMessage('An unexpected error occurred');
      }
    }
  };

  const handleStartGame = async () => {
    try {
      const response = await axios.post('/start_game');
      setMessage(response.data.status || response.data.error);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(error.response.data.error);
      } else {
        setMessage('An unexpected error occurred');
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