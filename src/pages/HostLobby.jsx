import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCode } from 'react-qr-code';
import { subscribeToPlayers, subscribeToGame, subscribeToPresenceChanges, syncPlayersWithPresence, startGame, nextChallenge, removePlayer, CHALLENGES } from '../services/gameService';

function HostLobby() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  useEffect(() => {
    const unsubscribePlayers = subscribeToPlayers(roomCode, (playerList) => {
      setPlayers(playerList);
    });

    const unsubscribeGame = subscribeToGame(roomCode, (game) => {
      setGameState(game);
    });

    // Listen to Realtime Database presence changes and sync to Firestore
    const unsubscribePresence = subscribeToPresenceChanges(roomCode, async (presentPlayerIds) => {
      // Sync Firestore players with presence every time presence changes
      await syncPlayersWithPresence(roomCode);
    });

    // Initial sync
    syncPlayersWithPresence(roomCode);

    return () => {
      unsubscribePlayers();
      unsubscribeGame();
      unsubscribePresence();
    };
  }, [roomCode]);

  const handleStartGame = async () => {
    if (players.length < 2) {
      alert('You need at least 2 players to start the game!');
      return;
    }

    setIsStarting(true);
    try {
      await startGame(roomCode);
      // Game started - state will update via subscription
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
      setIsStarting(false);
    }
  };

  const handleNextChallenge = async () => {
    setIsAdvancing(true);
    try {
      await nextChallenge(roomCode);
      // State will update via subscription
    } catch (error) {
      console.error('Error advancing challenge:', error);
      alert('Failed to advance challenge. Please try again.');
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleKickPlayer = async (playerId, playerName) => {
    if (!window.confirm(`Remove ${playerName} from the game?`)) {
      return;
    }

    try {
      await removePlayer(roomCode, playerId);
    } catch (error) {
      console.error('Error removing player:', error);
      alert('Failed to remove player. Please try again.');
    }
  };

  // Get current challenge if game is playing
  const currentChallengeIndex = gameState?.currentChallengeIndex ?? -1;
  const currentChallenge = currentChallengeIndex >= 0 && currentChallengeIndex < CHALLENGES.length
    ? CHALLENGES[currentChallengeIndex]
    : null;
  const isGamePlaying = gameState?.status === 'playing';
  const isGameFinished = gameState?.status === 'finished';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Room Code Display */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-6 text-center">
          <h2 className="text-2xl text-gray-600 mb-4">Room Code</h2>
          <div className="text-6xl font-bold text-gray-800 tracking-wider mb-6">
            {roomCode}
          </div>
          
          {/* QR Code */}
          {gameState?.status === 'waiting' && (
            <div className="flex justify-center mb-4">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <QRCode
                  value={`${window.location.origin}/?room=${roomCode}`}
                  size={256}
                  level="H"
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
              </div>
            </div>
          )}
          
          <p className="text-gray-500 text-lg">
            Share this code with your players or have them scan the QR code
          </p>
        </div>

        {/* Players List */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Players ({players.length})
          </h3>
          {players.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Waiting for players to join...
            </p>
          ) : (
            <div className="space-y-3">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      {index + 1}
                    </div>
                    <span className="text-lg font-semibold text-gray-800">
                      {player.name}
                    </span>
                  </div>
                  {gameState?.status === 'waiting' && (
                    <button
                      onClick={() => handleKickPlayer(player.id, player.name)}
                      className="ml-4 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-bold transition-colors duration-200"
                      title="Remove player"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Game Over Screen */}
        {isGameFinished && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-6 text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">🎉 Game Over!</h2>
            <p className="text-gray-600 text-xl mb-6">
              Thanks for playing!
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-8 rounded-xl text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Current Challenge Display (when playing) */}
        {isGamePlaying && currentChallenge && (
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl shadow-2xl p-8 md:p-12 mb-6 text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
              <p className="text-sm font-semibold text-white/80 mb-2 uppercase tracking-wide">
                Current Challenge ({currentChallengeIndex + 1} of {CHALLENGES.length})
              </p>
              <h3 className="text-3xl md:text-4xl font-bold text-white">
                {currentChallenge}
              </h3>
            </div>
            <button
              onClick={handleNextChallenge}
              disabled={isAdvancing}
              className={`w-full py-4 px-8 rounded-xl text-xl font-bold text-white shadow-lg transition-all duration-200 ${
                isAdvancing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transform hover:scale-105 cursor-pointer'
              }`}
            >
              {isAdvancing 
                ? 'Loading...' 
                : currentChallengeIndex + 1 >= CHALLENGES.length 
                  ? 'Finish Game' 
                  : 'Next Challenge →'
              }
            </button>
          </div>
        )}

        {/* Start Game Button (only show when waiting) */}
        {gameState?.status === 'waiting' && (
          <button
            onClick={handleStartGame}
            disabled={players.length < 2 || isStarting}
            className={`w-full py-4 px-8 rounded-xl text-xl font-bold text-white shadow-lg transition-all duration-200 ${
              players.length >= 2 && !isStarting
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isStarting ? 'Starting...' : `Start Game (${players.length}/2+)`}
          </button>
        )}
      </div>
    </div>
  );
}

export default HostLobby;

