// server.js

// Import necessary modules
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Low } = require('lowdb'); // For LowDB
const { JSONFile } = require('lowdb/node'); // For LowDB file adapter
const bcrypt = require('bcryptjs'); // For password hashing

// Initialize the Express application
const app = express();

// --- LowDB Setup ---
// Define the path to your database file
const dbFilePath = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbFilePath);
// Define your default data structure
const defaultData = { users: [] };

// Initialize LowDB with the adapter and default data
const db = new Low(adapter, defaultData);

// Function to initialize the database
async function initializeDatabase() {
    console.log('--- Initializing database ---');
    console.log(`Attempting to read from: ${dbFilePath}`);
    try {
        await db.read(); // Read data from db.json. If file doesn't exist or is empty, defaultData will be used.
        console.log('Database read attempt completed.');
    } catch (error) {
        console.error('Error during db.read():', error);
        // This catch block might not be strictly necessary with defaultData, but good for robust error logging.
    }


    // Ensure 'db.data' is not null/undefined even if defaultData was provided but overwritten somehow
    // This line becomes less critical for initial setup but good for resilience if data gets corrupted
    // You could also add a more sophisticated check here if you want to enforce specific schema on existing files.
    if (!db.data || Object.keys(db.data).length === 0) {
        db.data = { users: [] }; // Re-apply if somehow empty
        console.log('Database was empty after read, ensuring default structure.');
    } else {
        console.log('Database already contains data.');
    }


    // Check if 'testuser' exists, if not, add it with a hashed password
    const testUserExists = db.data.users.some(user => user.username === 'testuser');
    if (!testUserExists) {
        console.log('Testuser not found, preparing to add.');
        const hashedPassword = await bcrypt.hash('password', 10); // Hash 'password' with salt rounds
        db.data.users.push({
            id: 'user123',
            username: 'testuser',
            password: hashedPassword, // Store hashed password
            avatarInitial: 'T',
            score: 1500,
            level: 15,
            coins: 600
        });
        console.log('Testuser data prepared. Attempting to write to db.json...');
        await db.write(); // Save the default user to the file
        console.log('Default testuser added and db.json written successfully!');
    } else {
        console.log('db.json loaded. Test user already exists.');
    }
    console.log('--- Database initialization complete ---');
}

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Endpoints ---

// Simple GET endpoint for checking server status
app.get('/api/status', (req, res) => {
    res.status(200).json({ message: 'Server is running smoothly!', timestamp: new Date().toISOString() });
});

// Endpoint to get initial game data for a user
app.get('/api/game/initial-data', async (req, res) => {
    await db.read(); // Ensure latest data is read

    // In a real app, you'd use a session or token to identify the logged-in user.
    // For this prototype, we'll just fetch 'testuser' data if available,
    // or return default guest data.
    const currentUser = db.data.users.find(user => user.username === 'testuser'); // Example: Fetch by a known user

    if (currentUser) {
        res.status(200).json({
            score: currentUser.score,
            level: currentUser.level,
            coins: currentUser.coins,
            user: {
                id: currentUser.id,
                username: currentUser.username,
                avatarInitial: currentUser.avatarInitial
            }
        });
    } else {
        // Default guest data if no specific user is 'logged in' or found
        res.status(200).json({
            score: 0,
            level: 1,
            coins: 0,
            user: {
                id: null,
                username: 'Guest',
                avatarInitial: 'G'
            }
        });
    }
});


// Endpoint for updating game stats
app.post('/api/game/update-stats', async (req, res) => {
    const { username, score, level, coins } = req.body; // Expect username to identify user
    console.log(`Received update for ${username}: Score: ${score}, Level: ${level}, Coins: ${coins}`);

    await db.read(); // Read current state

    const userToUpdate = db.data.users.find(user => user.username === username);

    if (userToUpdate) {
        userToUpdate.score = score;
        userToUpdate.level = level;
        userToUpdate.coins = coins;
        await db.write(); // Persist changes
        res.status(200).json({
            success: true,
            message: `Stats for ${username} updated successfully!`,
            updatedStats: { score, level, coins }
        });
    } else {
        res.status(404).json({ success: false, message: 'User not found for stat update.' });
    }
});

// Endpoint for user login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt: ${username}`);

    await db.read(); // Read current state

    const user = db.data.users.find(u => u.username === username);

    if (user) {
        // Compare provided password with hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.status(200).json({
                success: true,
                message: 'Login successful!',
                user: { id: user.id, username: user.username, avatarInitial: user.avatarInitial },
                token: 'mock_jwt_token_12345' // In a real app, generate a JWT here
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
});

// Endpoint for user registration
app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Registration attempt for: ${username}`);

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    await db.read(); // Read current state

    // Check if username already exists
    const userExists = db.data.users.some(u => u.username === username);
    if (userExists) {
        return res.status(409).json({ success: false, message: 'Username already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Generate a simple unique ID (in a real app, use UUIDs or DB auto-increment)
    const newUserId = `user_${Date.now()}`;

    // Create new user object
    const newUser = {
        id: newUserId,
        username: username,
        password: hashedPassword, // Store hashed password
        avatarInitial: username.charAt(0).toUpperCase(),
        score: 0,
        level: 1,
        coins: 0
    };

    // Add new user to the users array
    db.data.users.push(newUser);

    // Write changes back to the database file
    await db.write();

    console.log(`User registered and saved: ${username}`);
    res.status(201).json({ success: true, message: 'Registration successful! You can now log in.' });
});

// --- Serve Static Frontend Files ---
// Serve files from the 'MiniGameAppPrototype' directory (where index.html, script.js, style.css are)
app.use(express.static(path.join(__dirname)));

// For Single-Page Applications, handle all other routes by serving index.html
// This ensures direct access to paths like /profile will still load your app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// --- Start the server ---
const PORT = process.env.PORT || 3000;

// Call initializeDatabase before starting the server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Access backend status at: http://localhost:${PORT}/api/status`);
        console.log(`Access your game frontend at: http://localhost:${PORT}/`); // NEW: Instruction for frontend
        console.log(`Login with: testuser / password (or any newly registered user)`);
        console.log(`Database file: ${dbFilePath}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1); // Exit if DB init fails
});

