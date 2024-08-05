"use client";

import Link from 'next/link';

const Home = () => {
  return (
    <div>
      <h1>Word Game</h1>
      <nav>
        <ul>
          <li><Link href="/create-room">Create Room</Link></li>
          <li><Link href="/join-room">Join Room</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;