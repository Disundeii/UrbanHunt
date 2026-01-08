import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot
} from 'firebase/firestore';
import { 
  ref, 
  set, 
  onDisconnect, 
  serverTimestamp, 
  onValue,
  get,
  remove
} from 'firebase/database';
import { db, realtimeDb } from '../firebase/config';

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
  
  // Check if player already exists (by name)
  const existingPlayer = players.find(p => p.name === playerName);
  let playerId;
  
  if (existingPlayer) {
    playerId = existingPlayer.id;
  } else {
    // Add new player
    playerId = `player_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const newPlayer = {
      id: playerId,
      name: playerName,
      joinedAt: new Date().toISOString(),
    };
    
    players.push(newPlayer);
    
    await updateDoc(roomRef, {
      players,
    });
  }
  
  // IMMEDIATELY set up presence tracking with onDisconnect
  // This must happen as soon as the player joins, before navigation
  await setupPlayerPresence(roomCode, playerId);
  
  return playerId;
};

// Set up player presence tracking with onDisconnect
export const setupPlayerPresence = async (roomCode, playerId) => {
  const presenceRef = ref(realtimeDb, `games/${roomCode}/players/${playerId}`);
  
  // CRITICAL: Set up onDisconnect BEFORE setting the value
  // This ensures the server handles disconnection even if browser crashes
  onDisconnect(presenceRef).remove();
  
  // Set the player as online (this must happen after onDisconnect is registered)
  await set(presenceRef, {
    online: true,
    lastSeen: serverTimestamp()
  });
  
  return presenceRef;
};

// Remove player presence (called when component unmounts)
export const removePlayerPresence = async (roomCode, playerId) => {
  const presenceRef = ref(realtimeDb, `games/${roomCode}/players/${playerId}`);
  await remove(presenceRef);
  
  // Also remove from Firestore player list
  const roomRef = doc(db, 'games', roomCode);
  const roomSnap = await getDoc(roomRef);
  
  if (roomSnap.exists()) {
    const roomData = roomSnap.data();
    const players = roomData.players || [];
    const updatedPlayers = players.filter(p => p.id !== playerId);
    
    await updateDoc(roomRef, {
      players: updatedPlayers,
    });
  }
};

// Remove player from game (kick function)
export const removePlayer = async (roomCode, playerId) => {
  // Remove from Firestore
  const roomRef = doc(db, 'games', roomCode);
  const roomSnap = await getDoc(roomRef);
  
  if (roomSnap.exists()) {
    const roomData = roomSnap.data();
    const players = roomData.players || [];
    const updatedPlayers = players.filter(p => p.id !== playerId);
    
    await updateDoc(roomRef, {
      players: updatedPlayers,
    });
  }
  
  // Remove from Realtime Database presence
  const presenceRef = ref(realtimeDb, `games/${roomCode}/players/${playerId}`);
  await remove(presenceRef);
};

// Check if player is still in the game (for kicked detection)
export const checkPlayerInGame = (roomCode, playerId, callback) => {
  const roomRef = doc(db, 'games', roomCode);
  
  const unsubscribe = onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const players = data.players || [];
      const playerExists = players.some(p => p.id === playerId);
      callback(playerExists);
    } else {
      callback(false);
    }
  });
  
  return unsubscribe;
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

// Listen to Realtime Database presence and sync to Firestore
// This should be called by the host to detect disconnections
export const subscribeToPresenceChanges = (roomCode, callback) => {
  const presenceRef = ref(realtimeDb, `games/${roomCode}/players`);
  
  const unsubscribe = onValue(presenceRef, (snapshot) => {
    const presenceData = snapshot.val();
    const presentPlayerIds = presenceData ? Object.keys(presenceData) : [];
    callback(presentPlayerIds);
  }, (error) => {
    console.error('Error listening to presence:', error);
    callback([]);
  });
  
  return unsubscribe;
};

// Sync Firestore players with Realtime Database presence
export const syncPlayersWithPresence = async (roomCode) => {
  try {
    // Get current Firestore players
    const roomRef = doc(db, 'games', roomCode);
    const roomSnap = await getDoc(roomRef);
    
    if (!roomSnap.exists()) return;
    
    // Get current Realtime Database presence (one-time read)
    const presenceRef = ref(realtimeDb, `games/${roomCode}/players`);
    const presenceSnapshot = await get(presenceRef);
    const presenceData = presenceSnapshot.val();
    const presentPlayerIds = presenceData ? Object.keys(presenceData) : [];
    
    const currentPlayers = roomSnap.data().players || [];
    
    // Filter out players who are no longer present
    const activePlayers = currentPlayers.filter(player => 
      presentPlayerIds.includes(player.id)
    );
    
    // Only update if there's a difference
    if (activePlayers.length !== currentPlayers.length) {
      await updateDoc(roomRef, {
        players: activePlayers,
      });
    }
  } catch (error) {
    console.error('Error syncing presence:', error);
  }
};

// Challenge array (hardcoded as requested)
export const CHALLENGES = [
  "Find a red object",
  "High five a stranger",
  "Take a selfie with something green",
  "Do 10 jumping jacks",
  "Find someone wearing the same color shirt as you",
  "Take a selfie with a stranger (ask permission!)",
  "Find a handheld object that is older than you.",
  "Film a 5-second video of your team doing a synchronized dance.",
  "Find something that starts with the first letter of your name.",
  "Take a creative photo of the sky."
];

