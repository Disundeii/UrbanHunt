import { useNavigate } from 'react-router-dom';
import { createGame, generateRoomCode } from '../services/gameService';

function HostLanding() {
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    try {
      const roomCode = generateRoomCode();
      await createGame(roomCode);
      navigate(`/host/${roomCode}`);
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game. Please check your Firebase configuration.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Social Scavenger Hunt
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Host a game and invite your friends!
        </p>
        <button
          onClick={handleCreateGame}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-8 rounded-xl text-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Create Game
        </button>
      </div>
    </div>
  );
}

export default HostLanding;

