import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-16 max-w-2xl w-full text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
          🎮 Social Scavenger Hunt
        </h1>
        <p className="text-gray-600 mb-12 text-xl">
          Gather your friends and complete fun challenges together!
        </p>
        
        <div className="space-y-6">
          <button
            onClick={() => navigate('/host/create')}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-6 px-8 rounded-xl text-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🎯 Host a Game
          </button>
          
          <button
            onClick={() => navigate('/player')}
            className="w-full bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold py-6 px-8 rounded-xl text-2xl hover:from-pink-700 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            📱 Join a Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;

