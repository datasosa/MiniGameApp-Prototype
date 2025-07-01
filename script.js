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
const loginPasswordInput = document.getElementById('loginPassword');
const registerUsernameInput = document.getElementById('registerUsername');
const registerPasswordInput = document.getElementById('registerPassword');

const userAvatarSpan = document.querySelector('.user-avatar span');
const scoreSpan = document.getElementById('score');
const levelSpan = document.getElementById('level');
const coinsSpan = document.getElementById('coins');

const playBtn = document.getElementById('playBtn'); // Example for game start

// --- API Base URL ---
const API_BASE_URL = 'https://minigameapp-prototype.onrender.com';
// const API_BASE_URL = 'http://localhost:3000'; // For local testing

// --- State Variables ---
let currentUser = null;
let gameStats = { score: 0, level: 1, coins: 0 };

// --- Helper Functions ---

function showAuthMessage(message, type = 'error') {
    if (authMessage) {
        authMessage.textContent = message;
        authMessage.className = `auth-message ${type}`; // 'error' or 'success'
    }
}

function clearAuthMessage() {
    if (authMessage) {
        authMessage.textContent = '';
        authMessage.className = 'auth-message';
    }
}

function updateGameUI() {
    if (currentUser) {
        userAvatarSpan.textContent = currentUser.avatarInitial || currentUser.username.charAt(0).toUpperCase();
    }
    if (scoreSpan) scoreSpan.textContent = gameStats.score;
    if (levelSpan) levelSpan.textContent = gameStats.level;
    if (coinsSpan) coinsSpan.textContent = gameStats.coins;
}

// Adjusted display functions
function showMainApp() {
    console.log("Attempting to show main app and hide auth modal.");
    if (mainAppContainer) {
        mainAppContainer.style.display = 'block';
    }
    if (authModal) {
        authModal.style.display = 'none';
    }
}

function showAuthModal() {
    console.log("Attempting to show auth modal and hide main app.");
    if (mainAppContainer) {
        mainAppContainer.style.display = 'none';
    }
    if (authModal) {
        authModal.style.display = 'flex';
        // Ensure login form is visible by default when modal appears
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
    }
}

// --- API Calls ---

async function fetchInitialGameData(username = 'GuestPlayer') {
    try {
        const response = await fetch(`${API_BASE_URL}/api/game/initial-data`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Initial game data fetched:', data);
        gameStats.score = data.score;
        gameStats.level = data.level;
        gameStats.coins = data.coins;

        if (data.user) {
            currentUser = data.user;
        } else {
             currentUser = { id: 'guest', username: 'GuestPlayer', avatarInitial: 'G' };
        }
        updateGameUI();
        showMainApp(); // Show the main app after fetching data
        return data;
    } catch (error) {
        console.error('Error fetching initial game data:', error);
        showAuthMessage('Failed to load game data. Please try again later.');
        showAuthModal(); // Fallback to auth modal if data load fails
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
        console.log('Game stats updated:', data);
    } catch (error) {
        console.error('Error updating game stats:', error);
    }
}

// --- Event Handlers ---

if (toggleRegister) {
    toggleRegister.addEventListener('click', (e) => {
        e.preventDefault();
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
        clearAuthMessage();
    });
}

if (toggleLogin) {
    toggleLogin.addEventListener('click', (e) => {
        e.preventDefault();
        if (registerForm) registerForm.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
        clearAuthMessage();
    });
}

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
                await fetchInitialGameData(currentUser.username);
            } else {
                showAuthMessage(data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            showAuthMessage('An error occurred during login. Please try again.');
        }
    });
}

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
                if (registerForm) registerForm.style.display = 'none';
                if (loginForm) loginForm.style.display = 'block';
                if (registerUsernameInput) registerUsernameInput.value = '';
                if (registerPasswordInput) registerPasswordInput.value = '';
            } else {
                showAuthMessage(data.message);
            }
        } catch (error) {
            console.error('Registration error:', error);
            showAuthMessage('An error occurred during registration. Please try again.');
        }
    });
}

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
                await fetchInitialGameData(currentUser.username);
            } else {
                showAuthMessage(data.message || 'Failed to log in as guest.');
            }
        } catch (error) {
            console.error('Guest login error:', error);
            showAuthMessage('An error occurred during guest login. Please try again.');
        }
    });
}

if (playBtn) {
    playBtn.addEventListener('click', () => {
        gameStats.score += 10;
        gameStats.coins += 1;
        if (gameStats.score % 50 === 0) {
            gameStats.level++;
        }
        updateGameUI();
        updateGameStats();
    });
}

// --- Initial Load Logic ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded. Initializing app.");

    // Ensure initial display state is correct
    showAuthModal(); // Always start by showing the authentication modal

    // Add a check for the user avatar span initial
    if (userAvatarSpan && currentUser) {
        userAvatarSpan.textContent = currentUser.avatarInitial || currentUser.username.charAt(0).toUpperCase();
    } else if (userAvatarSpan) {
        // Default for initial load before any user is set
        userAvatarSpan.textContent = 'G';
    }
});

// Particles.js (if you still use it, ensure particles.min.js is linked in HTML)
// Make sure particles.min.js is present in your project's root directory.
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

