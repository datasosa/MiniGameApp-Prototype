const express = require('express');
const cors = require('cors'); // Import the CORS middleware
const path = require('path'); // For resolving file paths
const fs = require('fs');     // For file system operations (like reading/writing db.json)

const app = express();
const PORT = process.env.PORT || 3000; // Use environment variable for port in production, default to 3000

// --- Middleware ---
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors());         // Enable CORS for all origins. IMPORTANT for deployed apps!

// Serve static files (your frontend HTML, CSS, JS)
// Assumes index.html, script.js, style.css are in the same directory as server.js
app.use(express.static(__dirname));

// --- db.json File Handling ---
const DB_PATH = path.join(__dirname, 'db.json');

// Helper function to read data from db.json
const readDb = () => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        const db = JSON.parse(data);
        // Ensure default structure if parts are missing
        if (!db.users) db.users = [];
        if (!db.gameData) db.gameData = [];
        return db;
    } catch (error) {
        // If db.json doesn't exist or is invalid, return a default empty structure
        console.warn(`db.json not found or invalid. Initializing with default structure. Error: ${error.message}`);
        return { users: [], gameData: [] };
    }
};

// Helper function to write data to db.json
const writeDb = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8'); // null, 2 for pretty printing
    } catch (error) {
        console.error('Error writing to db.json:', error.message);
    }
};

// --- API Routes ---

// Default route for your index.html (express.static handles this, but explicitly good)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- AUTHENTICATION ROUTES ---

// Login Route (now /api/auth/login)
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDb();

    const user = db.users.find(u => u.username === username && u.password === password);

    if (user) {
        console.log(`Login successful for user: ${username}`);
        // In a real app, you'd send a token or session ID
        res.status(200).json({
            message: 'Login successful',
            user: { id: user.id, username: user.username, avatarInitial: user.username.charAt(0) }
        });
    } else {
        console.log(`Login failed for user: ${username}`);
        res.status(401).json({ message: 'Invalid username or password' });
    }
});

// Register Route (new: /api/auth/register)
app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    const db = readDb();

    if (db.users.find(u => u.username === username)) {
        return res.status(409).json({ message: 'Username already taken' });
    }

    const newUserId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
    const newUser = { id: newUserId, username, password };
    db.users.push(newUser);

    // Initialize game data for the new user
    db.gameData.push({
        userId: newUserId,
        username: username,
        score: 0,
        level: 1,
        coins: 0
    });

    writeDb(db);
    console.log(`User registered: ${username}`);
    res.status(201).json({ message: 'Registration successful! Please log in.', user: { id: newUserId, username: username } });
});

// Guest Login Route (matches script.js expectation)
app.post('/guest-login', (req, res) => {
    console.log('Guest login requested. Granting access.');
    const db = readDb();

    // Ensure a guest gameData entry exists or create it
    let guestGameData = db.gameData.find(g => g.username === 'GuestPlayer' && g.userId === 'guest');
    if (!guestGameData) {
        guestGameData = { userId: 'guest', username: 'GuestPlayer', score: 0, level: 1, coins: 0 };
        db.gameData.push(guestGameData);
        writeDb(db);
    }

    res.status(200).json({
        message: 'Guest login successful',
        user: { id: 'guest', username: 'GuestPlayer', avatarInitial: 'G' }
    });
});

// --- GAME DATA ROUTES ---

// Get Initial Game Data Route (now /api/game/initial-data)
app.get('/api/game/initial-data', (req, res) => {
    const db = readDb();
    // In a real app, you'd get user ID from session/token
    // For this demo, let's return the gameData for 'GuestPlayer' by default,
    // or you could make it specific if a user is 'conceptually' logged in
    const guestGameData = db.gameData.find(g => g.username === 'GuestPlayer');

    if (guestGameData) {
        res.json({
            score: guestGameData.score,
            level: guestGameData.level,
            coins: guestGameData.coins,
            user: { id: 'guest', username: 'GuestPlayer', avatarInitial: 'G' } // Always return guest user for initial fetch without credentials
        });
    } else {
        // If even guest data doesn't exist, return defaults
        res.json({
            score: 0,
            level: 1,
            coins: 0,
            user: { id: null, username: 'Guest', avatarInitial: 'G' }
        });
    }
});

// Update Game Stats Route (now /api/game/update-stats)
app.post('/api/game/update-stats', (req, res) => {
    const { username, score, level, coins } = req.body;
    const db = readDb();

    let userGameData = db.gameData.find(data => data.username === username);

    if (userGameData) {
        // Update existing data
        userGameData.score = score;
        userGameData.level = level;
        userGameData.coins = coins;
    } else {
        // If no data exists for this user (e.g., new guest or newly registered user before first stat update)
        // Note: For registered users, data is initialized on registration. This path is mostly for new guests.
        const userId = db.users.find(u => u.username === username)?.id || 'guest'; // Assign ID if user exists, else 'guest'
        db.gameData.push({
            userId: userId,
            username: username,
            score: score,
            level: level,
            coins: coins
        });
    }

    writeDb(db);
    console.log(`Updated stats for ${username}: Score ${score}, Level ${level}, Coins ${coins}`);
    res.status(200).json({ success: true, message: 'Stats updated', updatedStats: { username, score, level, coins } });
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`Deployed URL: https://minigameapp-prototype.onrender.com (check Render.com for actual URL)`);
});

