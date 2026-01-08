import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinGame } from '../services/gameService';

function PlayerLanding() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    
    if (!roomCode || !playerName) {
      alert('Please enter both room code and your name');
      return;
    }

    if (roomCode.length !== 4) {
      alert('Room code must be 4 letters');
      return;
    }

    setIsJoining(true);
    try {
      await joinGame(roomCode.toUpperCase(), playerName.trim());
      navigate(`/player/${roomCode.toUpperCase()}`);
    } catch (error) {
      console.error('Error joining game:', error);
      alert(error.message || 'Failed to join game. Please check the room code.');
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2 text-center">
          Join Game
        </h1>
        <p className="text-gray-600 mb-8 text-center text-lg">
          Enter the room code from your host
        </p>
        
        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label htmlFor="roomCode" className="block text-gray-700 font-semibold mb-2">
              Room Code
            </label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ABCD"
              maxLength={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-2xl font-bold text-center tracking-widest uppercase focus:border-purple-500 focus:outline-none"
              disabled={isJoining}
            />
          </div>
          
          <div>
            <label htmlFor="playerName" className="block text-gray-700 font-semibold mb-2">
              Your Name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-lg focus:border-purple-500 focus:outline-none"
              disabled={isJoining}
            />
          </div>
          
          <button
            type="submit"
            disabled={isJoining}
            className={`w-full py-4 px-8 rounded-xl text-xl font-bold text-white shadow-lg transition-all duration-200 ${
              isJoining
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 transform hover:scale-105'
            }`}
          >
            {isJoining ? 'Joining...' : 'Join Game'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PlayerLanding;

