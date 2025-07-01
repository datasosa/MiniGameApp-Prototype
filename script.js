// --- DOM Elements ---
const mainAppContainer = document.getElementById('main-app-container');
const authModal = document.getElementById('authModal');
const authCloseBtn = document.getElementById('authCloseBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toggleRegister = document.getElementById('toggleRegister');
const toggleLogin = document.getElementById('toggleLogin');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const guestButton = document.getElementById('guestButton');
const authMessage = document.getElementById('authMessage');

const loginUsernameInput = document.getElementById('loginUsername');
const loginPasswordInput = document.getElementById('loginPassword'); // Ensure this is the correct ID for the password input
const registerUsernameInput = document.getElementById('registerUsername');
const registerPasswordInput = document.getElementById('registerPassword'); // Ensure this is the correct ID for the password input

const userAvatarSpan = document.querySelector('.user-avatar span');
const scoreSpan = document.getElementById('score');
const levelSpan = document.getElementById('level');
const coinsSpan = document.getElementById('coins');

const playBtn = document.getElementById('playBtn'); // Example for game start

// --- API Base URL ---
// Use the Render.com URL for production, localhost for local development
const API_BASE_URL = 'https://minigameapp-prototype.onrender.com';
// const API_BASE_URL = 'http://localhost:3000'; // For local testing

// --- State Variables ---
let currentUser = null;
let gameStats = { score: 0, level: 1, coins: 0 };

// --- Helper Functions ---

function showAuthMessage(message, type = 'error') {
    authMessage.textContent = message;
    authMessage.className = `auth-message ${type}`; // 'error' or 'success'
}

function clearAuthMessage() {
    authMessage.textContent = '';
    authMessage.className = 'auth-message';
}

function updateGameUI() {
    if (currentUser) {
        userAvatarSpan.textContent = currentUser.avatarInitial || currentUser.username.charAt(0);
    }
    scoreSpan.textContent = gameStats.score;
    levelSpan.textContent = gameStats.level;
    coinsSpan.textContent = gameStats.coins;
}

function showMainApp() {
    if (mainAppContainer) {
        mainAppContainer.style.display = 'block';
    }
    if (authModal) {
        authModal.style.display = 'none';
    }
    // Remove the debugging !important styles after successful login/guest
    if (mainAppContainer) mainAppContainer.style.removeProperty('display');
    if (authModal) authModal.style.removeProperty('display');
}

function showAuthModal() {
    if (mainAppContainer) {
        mainAppContainer.style.display = 'none';
    }
    if (authModal) {
        authModal.style.display = 'flex';
    }
    // Remove the debugging !important styles
    if (mainAppContainer) mainAppContainer.style.removeProperty('display');
    if (authModal) authModal.style.removeProperty('display');
}

// --- API Calls ---

async function fetchInitialGameData(username = 'GuestPlayer') {
    try {
        const response = await fetch(`${API_BASE_URL}/api/game/initial-data`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Initial game data fetched:', data); // Log to console
        gameStats.score = data.score;
        gameStats.level = data.level;
        gameStats.coins = data.coins;

        // If data includes user info, update currentUser
        if (data.user) {
            currentUser = data.user;
        } else {
             // Fallback for initial-data if user isn't explicit
            currentUser = { id: 'guest', username: 'GuestPlayer', avatarInitial: 'G' };
        }
        updateGameUI();
        showMainApp(); // Show the main app after fetching data
        return data;
    } catch (error) {
        console.error('Error fetching initial game data:', error); // Log to console
        showAuthMessage('Failed to load game data. Please try again later.');
        // Show auth modal if game data load fails
        showAuthModal();
    }
}

async function updateGameStats() {
    if (!currentUser || !currentUser.username) {
        console.error('Cannot update stats: No current user or username defined.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/game/update-stats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: currentUser.username,
                score: gameStats.score,
                level: gameStats.level,
                coins: gameStats.coins,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Game stats updated:', data); // Log to console
    } catch (error) {
        console.error('Error updating game stats:', error); // Log to console
    }
}

// --- Event Handlers ---

// Toggle between login and register forms
if (toggleRegister) {
    toggleRegister.addEventListener('click', (e) => {
        e.preventDefault();
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
        clearAuthMessage();
    });
} else {
    console.warn("toggleRegister element not found.");
}


if (toggleLogin) {
    toggleLogin.addEventListener('click', (e) => {
        e.preventDefault();
        if (registerForm) registerForm.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
        clearAuthMessage();
    });
} else {
    console.warn("toggleLogin element not found.");
}


// Login Button Handler
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const username = loginUsernameInput ? loginUsernameInput.value : '';
        const password = loginPasswordInput ? loginPasswordInput.value : '';

        if (!username || !password) {
            showAuthMessage('Please enter both username and password.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (response.ok) {
                showAuthMessage(data.message, 'success');
                currentUser = data.user;
                // Fetch user-specific game data after successful login
                await fetchInitialGameData(currentUser.username); // Pass username to fetch specific data if needed
                // The showMainApp is now handled by fetchInitialGameData's success
            } else {
                showAuthMessage(data.message);
            }
        } catch (error) {
            console.error('Login error:', error); // Log to console
            showAuthMessage('An error occurred during login. Please try again.');
        }
    });
} else {
    console.warn("loginBtn element not found.");
}

// Register Button Handler
if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
        const username = registerUsernameInput ? registerUsernameInput.value : '';
        const password = registerPasswordInput ? registerPasswordInput.value : '';

        if (!username || !password) {
            showAuthMessage('Please choose a username and password.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (response.ok) {
                showAuthMessage(data.message + " You can now log in.", 'success');
                // Switch back to login form after successful registration
                if (registerForm) registerForm.style.display = 'none';
                if (loginForm) loginForm.style.display = 'block';
                // Clear inputs for security
                if (registerUsernameInput) registerUsernameInput.value = '';
                if (registerPasswordInput) registerPasswordInput.value = '';
            } else {
                showAuthMessage(data.message);
            }
        } catch (error) {
            console.error('Registration error:', error); // Log to console
            showAuthMessage('An error occurred during registration. Please try again.');
        }
    });
} else {
    console.warn("registerBtn element not found.");
}

// Guest Login Button Handler
if (guestButton) {
    guestButton.addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/guest-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            if (response.ok) {
                showAuthMessage(data.message, 'success');
                currentUser = data.user;
                // Fetch game data for guest
                await fetchInitialGameData(currentUser.username); // Pass username to fetch specific data if needed
                // The showMainApp is now handled by fetchInitialGameData's success
            } else {
                showAuthMessage(data.message || 'Failed to log in as guest.');
            }
        } catch (error) {
            console.error('Guest login error:', error); // Log to console
            showAuthMessage('An error occurred during guest login. Please try again.');
        }
    });
} else {
    console.warn("guestButton element not found.");
}

// Close Auth Modal (if you decide to implement a close button logic for the modal)
// Note: In your current flow, the modal is hidden on successful login/guest.
if (authCloseBtn) {
    authCloseBtn.addEventListener('click', () => {
        // This button might not be directly functional if modal is only hidden on success.
        // If you want it to explicitly close and show main app regardless of login, add logic here.
        // For now, let's keep it simple and assume modal is hidden by successful auth.
    });
} else {
    console.warn("authCloseBtn element not found.");
}


// --- Game Play Example (not fully implemented, just for testing interactions) ---
if (playBtn) {
    playBtn.addEventListener('click', () => {
        gameStats.score += 10;
        gameStats.coins += 1;
        if (gameStats.score % 50 === 0) { // Example: level up every 50 score
            gameStats.level++;
        }
        updateGameUI();
        updateGameStats(); // Send updated stats to backend
    });
} else {
    console.warn("playBtn element not found.");
}

// --- Initial Load Logic ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded. Initializing app."); // Log to console

    // Force display both for debugging, then script will try to hide/show
    // This is primarily for the `display: !important` we added to HTML.
    // The functions below will try to set display correctly.

    // If there's no current user (i.e., not logged in from a previous session),
    // always show the authentication modal first.
    // On app start, there is no 'currentUser' yet.
    // So, we want to start with the auth modal visible.
    // The `fetchInitialGameData` is called *after* a successful login/guest to
    // populate the game UI.
    showAuthModal(); // Start by showing the authentication modal


    // Important: Re-check element references here because of the `password` tag in `index.html`
    // Ensure you are using <input type="password"> NOT <password>
    const loginPasswordElement = document.getElementById('loginPassword');
    const registerPasswordElement = document.getElementById('registerPassword');

    if (loginPasswordElement && loginPasswordElement.tagName !== 'INPUT') {
        console.error("Critical: loginPassword element is not an <input> tag. It should be <input type='password'>");
        showAuthMessage("Configuration Error: Please check index.html for login password input.", "error");
    }
    if (registerPasswordElement && registerPasswordElement.tagName !== 'INPUT') {
        console.error("Critical: registerPassword element is not an <input> tag. It should be <input type='password'>");
        showAuthMessage("Configuration Error: Please check index.html for register password input.", "error");
    }
    // If these warnings appear in your browser's console (if you can get remote debugging working),
    // it's a huge clue.
});

// Particles.js (if you still use it, ensure particles.min.js is linked in HTML)
// Otherwise, remove this block if you're handling particles with pure CSS or another method.
/*
if (typeof particlesJS !== 'undefined') {
    particlesJS('particles', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#ffffff' },
            shape: { type: 'circle', stroke: { width: 0, color: '#000000' }, polygon: { nb_sides: 5 }, image: { src: 'img/github.svg', width: 100, height: 100 } },
            opacity: { value: 0.5, random: false, anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false } },
            size: { value: 3, random: true, anim: { enable: false, speed: 40, size_min: 0.1, sync: false } },
            line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
            move: { enable: true, speed: 6, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false, attract: { enable: false, judicious_force: true, distance: 200 } }
        },
        interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
            modes: { grab: { distance: 140, line_linked: { opacity: 1 } }, bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 }, repulse: { distance: 200, duration: 0.4 }, push: { particles_nb: 4 }, remove: { particles_nb: 2 } }
        },
        retina_detect: true
    });
} else {
    console.warn("particlesJS not found. Ensure particles.min.js is correctly linked in index.html.");
}
*/

