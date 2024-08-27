"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

axios.defaults.baseURL = 'http://localhost:8000';

const CreateRoom = () => {
  const [roomNumber, setRoomNumber] = useState<number | null>(null);
  const [password, setPassword] = useState('');
  const [playerName, setPlayerName] = useState('host_player');
  const [wordLength, setWordLength] = useState(5);
  const [wordListName, setWordListName] = useState('考研');
  const [score, setScore] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent): Promise<void>  => {
    event.preventDefault();
    setError(null);

    try {
      const response = await axios.post('/api/create_room/', {
        room_number: roomNumber,
        password,
        player_name: playerName,
        word_length: wordLength,
        word_list_name: wordListName,
        score,
      });
      
      alert(`response ${response}`);
      if (response.status === 201) {
        router.push(`/room/${response.data.room_number}`);
      } else if (response.status === 302) {
        console.log('Redirecting to:', response.headers.location);
        window.location.href = response.headers.location;
      }
    } catch (error: any) {
      console.error('Error response:', error.response);
      setError('Failed to create room');
      console.error('Error details:', error);
    }
  };

  return (
    <div>
      <h1>Create Room</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Room Number (optional):</label>
          <input
            type="number"
            value={roomNumber ?? ''}
            onChange={(e) => setRoomNumber(e.target.value ? parseInt(e.target.value) : null)}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        <div>
          <label>Word Length:</label>
          <input
            type="number"
            value={wordLength}
            onChange={(e) => setWordLength(parseInt(e.target.value))}
          />
        </div>
        <div>
          <label>Word List Name:</label>
          <input
            type="text"
            value={wordListName}
            onChange={(e) => setWordListName(e.target.value)}
          />
        </div>
        <div>
          <label>Score:</label>
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value))}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Create Room</button>
      </form>
    </div>
  );
};

export default CreateRoom;