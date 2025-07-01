// --- DOM Elements (Adjust these IDs/Classes to match your actual index.html) ---
const loginContainer = document.getElementById('login-container'); // The div holding your login form
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginMessage = document.getElementById('login-message'); // For displaying messages (success/error)
const guestButton = document.getElementById('guest-button');   // The "Play as Guest" button

const gameContainer = document.getElementById('game-container'); // The div that holds your game's content
const playerDisplayName = document.getElementById('player-display-name'); // Optional: for showing player name

// --- Initial Setup ---
// When the page loads, ensure the login screen is shown initially
document.addEventListener('DOMContentLoaded', () => {
    showLoginScreen();
});

// --- UI Toggle Functions ---
// These functions hide/show the login and game sections
function showLoginScreen() {
    if (loginContainer) loginContainer.style.display = 'block';
    if (gameContainer) gameContainer.style.display = 'none';
    if (loginMessage) loginMessage.textContent = ''; // Clear any previous messages
}

function showGameScreen(username = 'Guest') { // Default to 'Guest' if no username provided
    if (loginContainer) loginContainer.style.display = 'none';
    if (gameContainer) gameContainer.style.display = 'block';
    
    console.log(`Welcome, ${username}! Game initialized.`);
    if (playerDisplayName) {
        playerDisplayName.textContent = `Player: ${username}`;
    }

    // *** IMPORTANT: CALL YOUR ACTUAL GAME INITIALIZATION FUNCTION HERE ***
    // If you have a function like 'startGame()' or 'initGameLogic()', call it here.
    // Example: initGame(username);
}

// --- Event Listeners ---

// Handle the submission of the standard login form
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission (page reload)

        const username = usernameInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch('/login', { // Send login data to your server.js
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json(); // Parse the JSON response from the server

            if (response.ok) { // Check if the HTTP status code is 2xx (e.g., 200 OK)
                if (loginMessage) loginMessage.textContent = data.message;
                showGameScreen(data.user.username); // Show game and pass username
            } else {
                // Login failed (e.g., 401 Unauthorized)
                if (loginMessage) loginMessage.textContent = data.message || 'Login failed: Invalid credentials.';
            }
        } catch (error) {
            console.error('Login request failed:', error);
            if (loginMessage) loginMessage.textContent = 'Network error or server is unavailable.';
        }
    });
}

// Handle the "Play as Guest" button click
if (guestButton) {
    guestButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/guest-login', { // Call the guest login endpoint
                method: 'POST', // Use POST as defined in server.js
                headers: {
                    'Content-Type': 'application/json'
                }
                // No body needed for guest login as per server.js
            });

            const data = await response.json();

            if (response.ok) {
                if (loginMessage) loginMessage.textContent = data.message;
                showGameScreen(data.user.username); // Show game, assuming guest-login returns a 'GuestPlayer' user
            } else {
                if (loginMessage) loginMessage.textContent = data.message || 'Guest login failed.';
            }
        } catch (error) {
            console.error('Guest login request failed:', error);
            if (loginMessage) loginMessage.textContent = 'Network error or server unavailable for guest login.';
        }
    });
}


// --- Your Existing Game Logic Goes Below Here ---
// If you have functions that manage your game's state, drawing, input, etc.,
// paste them here or ensure they are called by the 'showGameScreen' function
// or your main game loop initializer.

/*
// Example placeholder for your game logic:
let gameScore = 0;
function initGame(player) {
    console.log(`${player}'s game session started!`);
    // Setup your canvas, game loop, initial game state here
    // Example: const canvas = document.getElementById('gameCanvas');
    // const ctx = canvas.getContext('2d');
    // Start game loop: requestAnimationFrame(gameLoop);
}

function gameLoop() {
    // Update game state
    // Draw game elements
    // requestAnimationFrame(gameLoop);
}

// Example: Function to update score (called from your game)
function updateScore(points) {
    gameScore += points;
    console.log(`Current Score: ${gameScore}`);
    // Update score display in your HTML
}
*/

