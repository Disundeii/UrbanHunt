# Social Scavenger Hunt 🎮

A mobile-friendly web app for playing a Jackbox-style social scavenger hunt game. Built with React, Vite, Tailwind CSS, and Firebase.

## Features

- **Host Mode**: Create a game room with a 4-letter code, see players join in real-time, and start the game
- **Player Mode**: Join games using a room code, see challenges as they appear
- **Real-time Updates**: Powered by Firebase Firestore for instant synchronization
- **Mobile-Friendly**: Responsive design that works on phones, tablets, and desktops

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Firebase** - Backend (Firestore for database)
- **React Router** - Client-side routing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Firebase project (see setup instructions below)

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase (see Firebase Configuration below)

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to the URL shown (usually `http://localhost:5173`)

## Firebase Configuration

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### Step 2: Enable Firestore Database

1. In your Firebase project, go to **Build** → **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development) or set up security rules
4. Select a location for your database
5. Click "Enable"

### Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Scroll down to "Your apps" section
4. Click the web icon `</>` to add a web app (or select existing)
5. Register your app with a nickname (e.g., "Social Scavenger Hunt")
6. Copy the `firebaseConfig` object

### Step 4: Configure the App

1. Open `src/firebase/config.js`
2. Replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 5: Set Up Firestore Security Rules (Recommended for Production)

In Firebase Console → Firestore Database → Rules, use these rules for development:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to games collection
    match /games/{gameId} {
      allow read, write: if true; // Allow all access for development
    }
  }
}
```

**⚠️ Important**: For production, implement proper security rules that restrict access appropriately.

## How to Play

### As a Host:

1. Go to the main page (root URL: `/`)
2. Click "Create Game" to generate a room code
3. Share the 4-letter room code with your players
4. Wait for players to join (minimum 2 required)
5. Click "Start Game" when ready
6. Players will see challenges appear on their screens

### As a Player:

1. Go to `/player` or click "Join Game" if you have a link
2. Enter the 4-letter room code from your host
3. Enter your name
4. Click "Join Game"
5. Wait for the host to start the game
6. Complete challenges as they appear!

## Game Structure

- **Challenges**: 5 hardcoded challenges are included in `src/services/gameService.js`
  - "Find a red object"
  - "High five a stranger"
  - "Take a selfie with something green"
  - "Do 10 jumping jacks"
  - "Find someone wearing the same color shirt as you"

You can easily modify this array to add more challenges or customize them.

## Project Structure

```
src/
├── firebase/
│   └── config.js          # Firebase configuration
├── pages/
│   ├── HostLanding.jsx    # Host mode: Create game
│   ├── HostLobby.jsx      # Host mode: Waiting room
│   ├── PlayerLanding.jsx  # Player mode: Join game
│   └── PlayerGame.jsx     # Player mode: Game screen
├── services/
│   └── gameService.js     # Game logic and Firebase operations
├── App.jsx                # Main app with routing
├── main.jsx               # Entry point
└── index.css              # Tailwind CSS imports
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Customization

### Adding More Challenges

Edit `src/services/gameService.js` and modify the `CHALLENGES` array:

```javascript
export const CHALLENGES = [
  "Find a red object",
  "High five a stranger",
  // Add your challenges here...
];
```

### Styling

The app uses Tailwind CSS. Modify the className props in components to change styling, or extend Tailwind in `tailwind.config.js`.

## Troubleshooting

### "Failed to create game" error
- Check that Firebase is properly configured in `src/firebase/config.js`
- Verify Firestore is enabled in your Firebase project
- Check browser console for detailed error messages

### Players can't join
- Verify the room code is correct (case-insensitive, but displayed in uppercase)
- Check Firestore security rules allow read/write access
- Ensure both host and players are using the same Firebase project

### Real-time updates not working
- Check Firebase console for any quota or billing issues
- Verify Firestore is in the correct region
- Check browser console for connection errors

## License

This project is open source and available for personal and educational use.

## Future Enhancements

- Multiple challenge rounds with scoring
- Timer for each challenge
- Photo submission for challenges
- Voting system for best submissions
- Player profiles and game history
- Custom challenge creation by hosts
