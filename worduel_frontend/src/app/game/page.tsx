"use client";

import React, { useState } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8000';

interface GuessHistoryEntry {
    guess: string;
    exact_matches: number;
    wrong_place: number;
  }

const GamePlay = () => {
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [guessHistory, setGuessHistory] = useState<GuessHistoryEntry[]>([]);
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);

  const handleGuessSubmit = async (event: React.FormEvent): Promise<void>  => {
    event.preventDefault();
    try {
      const response = await axios.post('/api/make_guess', { guess });
      const { exact_matches, wrong_place } = response.data;

      setGuessHistory([...guessHistory, { guess, exact_matches, wrong_place }]);
      setMessage(`Exact Matches: ${exact_matches}, Wrong Place: ${wrong_place}`);

      if (exact_matches === guess.length) {
        setScore(score + 1);
        setMessage(`You get one point! Current Score: ${score + 1}`);
      }

      if (response.data.message && response.data.message.includes('wins the game')) {
        setGameOver(true);
        setMessage(response.data.message);
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
      <h2>Game Play</h2>
      {gameOver ? (
        <div>
          <h3>Game Over</h3>
          <p>{message}</p>
        </div>
      ) : (
        <div>
          <form onSubmit={handleGuessSubmit}>
            <div>
              <label>Guess:</label>
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                required
              />
            </div>
            <button type="submit">Submit Guess</button>
          </form>
          <p>{message}</p>
          <h3>Score: {score}</h3>
          <h3>Guess History:</h3>
          <ul>
            {guessHistory.map((entry, index) => (
              <li key={index}>
                Guess: {entry.guess}, Exact Matches: {entry.exact_matches}, Wrong Place: {entry.wrong_place}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GamePlay;