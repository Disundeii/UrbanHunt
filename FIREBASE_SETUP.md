# Firebase Setup Guide

Quick reference for setting up Firebase for this project.

## Step-by-Step Instructions

### 1. Create Firebase Project

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "social-scavenger-hunt")
4. Disable Google Analytics (optional) or enable if you want it
5. Click "Create project"

### 2. Enable Firestore Database

1. In your Firebase project dashboard, click **Build** → **Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** (for development)
   - ⚠️ Note: This allows anyone to read/write. Change rules for production!
4. Choose a location closest to your users
5. Click **Enable**

### 3. Get Your Configuration

1. Click the gear icon ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Scroll to "Your apps" section
4. If you don't have a web app yet:
   - Click the web icon `</>`
   - Register app with a nickname
   - Click "Register app"
5. Copy the `firebaseConfig` object

### 4. Configure the App

Open `src/firebase/config.js` and replace:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",                    // ← Replace this
  authDomain: "YOUR_AUTH_DOMAIN",            // ← Replace this
  databaseURL: "YOUR_DATABASE_URL",          // ← Replace this
  projectId: "YOUR_PROJECT_ID",              // ← Replace this
  storageBucket: "YOUR_STORAGE_BUCKET",      // ← Replace this
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // ← Replace this
  appId: "YOUR_APP_ID"                       // ← Replace this
};
```

### 5. Security Rules (Development)

In Firebase Console → Firestore Database → Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      allow read, write: if true;
    }
  }
}
```

Click **Publish**.

### 6. Test the Setup

1. Run `npm run dev`
2. Go to `http://localhost:5173`
3. Click "Create Game"
4. If successful, you should see a room code!

If you see errors, check:
- Browser console for error messages
- Firebase config values are correct
- Firestore is enabled
- Security rules are published

## Production Considerations

For production, you'll want to:

1. **Update Security Rules**: Restrict access to authorized users only
2. **Enable Authentication**: Use Firebase Auth to verify users
3. **Set up Billing**: Free tier has limits (50K reads/day, 20K writes/day)
4. **Monitor Usage**: Check Firebase Console for usage stats

Example production security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      // Only allow authenticated users
      allow read, write: if request.auth != null;
      
      // Or implement custom logic:
      // allow read: if true; // Anyone can read
      // allow write: if request.auth != null; // Only authenticated can write
    }
  }
}
```

## Troubleshooting

**"Firebase: Error (auth/invalid-api-key)"**
- Double-check your `apiKey` in config.js
- Make sure there are no extra spaces or quotes

**"Failed to create game"**
- Verify Firestore is enabled
- Check security rules allow writes
- Look at browser console for detailed errors

**"Room not found" when joining**
- Ensure the room code matches exactly (case-insensitive but check spelling)
- Verify Firestore connection is working
- Check if the game was created successfully

