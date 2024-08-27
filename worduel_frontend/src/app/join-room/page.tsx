"use client";

import React, { useState } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8000';

const JoinRoom = () => {
  const [roomNumber, setRoomNumber] = useState('');
  const [password, setPassword] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent): Promise<void>  => {
    event.preventDefault();
    try {
      const response = await axios.post('/api/join_room', {
        room_number: roomNumber,
        password,
        player_name: playerName,
      });

      if (response.data.status === 'joined') {
        setMessage(`Successfully joined room ${response.data.room_number}`);
      }
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
      <h2>Join Room</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Room Number:</label>
          <input
            type="number"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Player Name:</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </div>
        <button type="submit">Join Room</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default JoinRoom;