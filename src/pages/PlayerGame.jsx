import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { subscribeToGame, checkPlayerInGame, setupPlayerPresence, removePlayerPresence, CHALLENGES } from '../services/gameService';

function PlayerGame() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [gameState, setGameState] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [wasKicked, setWasKicked] = useState(false);

  // Get playerId from location state (passed when joining)
  useEffect(() => {
    if (location.state?.playerId) {
      setPlayerId(location.state.playerId);
    } else {
      // If no playerId, redirect to join screen
      navigate('/player', { 
        state: { message: 'Please join the game first.' } 
      });
    }
  }, [location.state, navigate]);

  // Set up presence tracking and check for kicked status
  useEffect(() => {
    if (!playerId || !roomCode) return;

    // Presence is already set up in joinGame, but ensure it's active
    // Re-establish connection to ensure onDisconnect is active
    setupPlayerPresence(roomCode, playerId);

    // Check if player is still in the game (for kicked detection)
    const unsubscribePlayerCheck = checkPlayerInGame(roomCode, playerId, (isInGame) => {
      if (!isInGame) {
        setWasKicked(true);
      }
    });

    // Listen to game state
    const unsubscribeGame = subscribeToGame(roomCode, (game) => {
      if (game) {
        setGameState(game);
        
        // Check if player is still in the game
        const players = game.players || [];
        const playerExists = players.some(p => p.id === playerId);
        if (!playerExists) {
          setWasKicked(true);
          return;
        }
        
        // Set current challenge if game is playing
        if (game.status === 'playing' && game.currentChallengeIndex >= 0) {
          const challengeIndex = game.currentChallengeIndex;
          if (challengeIndex < CHALLENGES.length) {
            setCurrentChallenge({
              number: challengeIndex + 1,
              text: CHALLENGES[challengeIndex],
            });
          } else {
            setCurrentChallenge(null);
          }
        } else {
          setCurrentChallenge(null);
        }
      } else {
        setGameState(null);
        setCurrentChallenge(null);
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribeGame();
      unsubscribePlayerCheck();
      // Remove presence when component unmounts
      if (playerId) {
        removePlayerPresence(roomCode, playerId);
      }
    };
  }, [roomCode, playerId]);

  // Handle kicked state
  if (wasKicked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-pink-500 to-orange-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center max-w-md w-full">
          <div className="text-6xl mb-6">🚪</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            You were removed from the game
          </h2>
          <p className="text-gray-600 mb-8">
            The host has removed you from the game.
          </p>
          <button
            onClick={() => navigate('/player', { state: { roomCode } })}
            className="bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold py-3 px-8 rounded-xl text-lg hover:from-pink-700 hover:to-red-700 transition-all duration-200"
          >
            Join Again
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <p className="text-xl text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  if (gameState.status === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center max-w-md w-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Waiting for game to start...
          </h2>
          <p className="text-gray-600 text-lg mb-2">Room: {roomCode}</p>
          <p className="text-gray-500">
            {gameState.players?.length || 0} player(s) joined
          </p>
          <div className="mt-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.status === 'playing' && currentChallenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center max-w-2xl w-full">
          <div className="mb-6">
            <span className="inline-block bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              Challenge {currentChallenge.number} of {CHALLENGES.length}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8">
            {currentChallenge.text}
          </h2>
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl">
            <p className="text-gray-700 text-lg">
              Complete this challenge and wait for the next one!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.status === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center max-w-2xl w-full">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Game Over!
          </h2>
          <p className="text-gray-600 text-xl mb-8">
            Thanks for playing!
          </p>
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6">
            <p className="text-gray-700 text-lg">
              You completed all {CHALLENGES.length} challenges!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Game Status
        </h2>
        <p className="text-gray-600">
          Waiting...
        </p>
      </div>
    </div>
  );
}

export default PlayerGame;

