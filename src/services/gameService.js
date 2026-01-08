import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Generate a random 4-letter room code
export const generateRoomCode = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return code;
};

// Create a new game room
export const createGame = async (roomCode) => {
  const roomRef = doc(db, 'games', roomCode);
  await setDoc(roomRef, {
    roomCode,
    status: 'waiting', // waiting, playing, finished
    players: [],
    currentChallengeIndex: -1,
    createdAt: new Date().toISOString(),
  });
  return roomCode;
};

// Add a player to a game room
export const joinGame = async (roomCode, playerName) => {
  const roomRef = doc(db, 'games', roomCode);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const roomData = roomSnap.data();
  const players = roomData.players || [];
  
  // Check if player already exists
  const existingPlayer = players.find(p => p.name === playerName);
  if (existingPlayer) {
    return existingPlayer.id;
  }
  
  // Add new player
  const playerId = `player_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const newPlayer = {
    id: playerId,
    name: playerName,
    joinedAt: new Date().toISOString(),
  };
  
  players.push(newPlayer);
  
  await updateDoc(roomRef, {
    players,
  });
  
  return playerId;
};

// Start the game
export const startGame = async (roomCode) => {
  const roomRef = doc(db, 'games', roomCode);
  await updateDoc(roomRef, {
    status: 'playing',
    currentChallengeIndex: 0,
    startedAt: new Date().toISOString(),
  });
};

// Advance to next challenge
export const nextChallenge = async (roomCode) => {
  const roomRef = doc(db, 'games', roomCode);
  const roomSnap = await getDoc(roomRef);
  
  if (!roomSnap.exists()) {
    throw new Error('Room not found');
  }
  
  const roomData = roomSnap.data();
  const currentIndex = roomData.currentChallengeIndex || 0;
  const nextIndex = currentIndex + 1;
  
  // Check if this is the last challenge
  if (nextIndex >= CHALLENGES.length) {
    // Game over
    await updateDoc(roomRef, {
      status: 'finished',
      currentChallengeIndex: -1,
      finishedAt: new Date().toISOString(),
    });
  } else {
    // Move to next challenge
    await updateDoc(roomRef, {
      currentChallengeIndex: nextIndex,
    });
  }
};

// Listen to game state changes
export const subscribeToGame = (roomCode, callback) => {
  const roomRef = doc(db, 'games', roomCode);
  
  const unsubscribe = onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      callback(null);
    }
  });
  
  return unsubscribe;
};

// Listen to player list changes
export const subscribeToPlayers = (roomCode, callback) => {
  const roomRef = doc(db, 'games', roomCode);
  
  const unsubscribe = onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback(data.players || []);
    } else {
      callback([]);
    }
  });
  
  return unsubscribe;
};

// Challenge array (hardcoded as requested)
export const CHALLENGES = [
  "Find a red object",
  "High five a stranger",
  "Take a selfie with something green",
  "Do 10 jumping jacks",
  "Find someone wearing the same color shirt as you"
];

