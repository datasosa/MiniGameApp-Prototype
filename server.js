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
        return JSON.parse(data);
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

// Default route for your index.html (though express.static usually handles this)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Basic Login Route Example
// Your frontend (script.js) would POST username/password to this
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDb();
    
    // --- IMPORTANT: For a demo, ensure db.json has a test user ---
    // Example in your db.json:
    // {
    //   "users": [
    //     { "id": 1, "username": "demo", "password": "password123" }
    //   ],
    //   "gameData": []
    // }
    const user = db.users.find(u => u.username === username && u.password === password);

    if (user) {
        console.log(`Login successful for user: ${username}`);
        // In a real app, you'd send a token or session ID
        res.status(200).json({ message: 'Login successful', user: { id: user.id, username: user.username } });
    } else {
        console.log(`Login failed for user: ${username}`);
        res.status(401).json({ message: 'Invalid username or password' });
    }
});

// --- *** SOLUTION FOR DEMO: GUEST LOGIN / BYPASS LOGIN *** ---
// This route allows your frontend to simply request access without credentials.
// Your script.js can call this endpoint to get into the game immediately.
app.post('/guest-login', (req, res) => {
    console.log('Guest login requested. Granting access.');
    // Send back a mock user object, or just a success message
    res.status(200).json({ message: 'Guest login successful', user: { id: 'guest', username: 'GuestPlayer' } });
});


// Example API route to get/save game data
app.get('/api/game', (req, res) => {
    const db = readDb();
    res.json(db.gameData);
});

app.post('/api/game', (req, res) => {
    const newData = req.body;
    const db = readDb();
    db.gameData.push(newData); // Add new data
    writeDb(db); // Save changes
    res.status(201).json({ message: 'Game data added', data: newData });
});


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`Deployed URL: https://minigameapp-prototype.onrender.co (check Render.com for actual URL)`);
});

