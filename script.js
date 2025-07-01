Document.addEventListener('DOMContentLoaded', function() {
    // --- Global Game State Management ---
    const gameState = {
        score: 0,
        level: 1,
        coins: 0,
        user: {
            id: null,
            username: 'Guest', // Default until logged in
            avatarInitial: 'G'
        },
        activeGame: null
    };

    // --- DOM Elements ---
    const particlesContainer = document.getElementById('particles');
    const playBtn = document.getElementById('playBtn');
    const userAvatar = document.querySelector('.user-avatar');
    let userAvatarText = userAvatar.querySelector('span');
    const logoEl = document.querySelector('.logo');
    const scoreEl = document.getElementById('score');
    const levelEl = document.getElementById('level');
    const coinsEl = document.getElementById('coins');
    const gameCanvas = document.querySelector('.game-canvas'); // This is where the game will eventually render
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuItems = document.querySelectorAll('.menu-item');

    // --- Auth Modal DOM Elements (Your existing elements) ---
    const authModal = document.getElementById('authModal');
    const authCloseBtn = document.getElementById('authCloseBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginUsernameInput = document.getElementById('loginUsername');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');
    const registerUsernameInput = document.getElementById('registerUsername');
    const registerPasswordInput = document.getElementById('registerPassword');
    const registerBtn = document.getElementById('registerBtn');
    const toggleLoginLink = document.getElementById('toggleLogin');
    const toggleRegisterLink = document.getElementById('toggleRegister');
    const authMessage = document.getElementById('authMessage');

    // --- NEW: Elements for main app and guest login ---
    const mainAppContainer = document.getElementById('main-app-container'); // The main content area
    const guestButton = document.getElementById('guestButton'); // The "Play as Guest" button added to authModal


    // --- Utility Functions ---

    /**
     * Updates the user avatar text and accessibility label.
     * @param {string} initial - The initial letter for the avatar.
     * @param {string} username - The full username for accessibility.
     */
    function updateAvatar(initial, username) {
        if (!userAvatarText) {
            // If the span doesn't exist, create it dynamically
            userAvatarText = document.createElement('span');
            userAvatar.appendChild(userAvatarText);
        }
        userAvatarText.textContent = initial.toUpperCase();
        userAvatar.setAttribute('aria-label', `User Profile for ${username}`);
    }

    /**
     * Renders the current game state (score, level, coins, avatar) to the DOM.
     * This function will be called whenever gameState changes.
     */
    function renderGameState() {
        scoreEl.textContent = gameState.score;
        levelEl.textContent = gameState.level;
        coinsEl.textContent = gameState.coins;
        updateAvatar(gameState.user.avatarInitial, gameState.user.username);
    }

    // --- Screen Visibility Control Functions ---
    // These functions replace/augment your existing modal display logic
    function showAuthModalScreen() {
        if (authModal) authModal.style.display = 'flex'; // Use flex to center the modal
        if (mainAppContainer) mainAppContainer.style.display = 'none'; // Hide main app content
        // Reset to login form by default when opening
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
        clearAuthMessages();
        // Clear input fields
        if (loginUsernameInput) loginUsernameInput.value = '';
        if (loginPasswordInput) loginPasswordInput.value = '';
        if (registerUsernameInput) registerUsernameInput.value = '';
        if (registerPasswordInput) registerPasswordInput.value = '';
    }

    function showMainAppScreen(username) {
        if (authModal) authModal.style.display = 'none'; // Hide the auth modal
        if (mainAppContainer) mainAppContainer.style.display = 'block'; // Show main app content
        console.log(`Welcome, ${username}! Main game UI displayed.`);
        // Call your game's initialization function here if it's not already running
        // For example: initMyGame(username);
        // The playBtn click already handles loading animations; actual game logic needs to be triggered there or via another event.
    }

    function clearAuthMessages() {
        if (authMessage) authMessage.textContent = '';
    }

    function displayAuthMessage(message, isError = true) {
        if (authMessage) {
            authMessage.textContent = message;
            authMessage.style.color = isError ? 'red' : 'green';
        }
    }


    // --- REAL API Service (Interacts with your Node.js backend) ---
    // WARNING: Ensure your server.js routes match these BASE_URL + endpoint paths.
    // My previous server.js had /login and /guest-login directly at the root,
    // and /api/game. You might need to adjust server.js to /api/auth/login, /api/game/initial-data etc.
    const BASE_URL = 'http://localhost:3000'; // Adjusted to root, will rely on full paths below

    const apiService = {
        /**
         * Fetches initial game data for a user from the backend.
         * @returns {Promise<object>} A promise resolving with user's game data.
         */
        fetchInitialGameData: async function() {
            try {
                // This assumes your server has an endpoint like /api/game/initial-data
                const response = await fetch(`${BASE_URL}/api/game/initial-data`); // Your original endpoint
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Error fetching initial game data:', error);
                // Return default guest data on failure
                return {
                    score: 0,
                    level: 1,
                    coins: 0,
                    user: { id: null, username: 'Guest', avatarInitial: 'G' }
                };
            }
        },

        /**
         * Updates game stats on the backend.
         * @param {object} stats - The stats to update (username, score, level, coins).
         * @returns {Promise<object>} A promise resolving with the updated data.
         */
        updateGameStats: async function(stats) {
            try {
                // This assumes your server has an endpoint like /api/game/update-stats
                const response = await fetch(`${BASE_URL}/api/game/update-stats`, { // Your original endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Authorization': `Bearer ${localStorage.getItem('userToken')}` // Example for authentication
                    },
                    body: JSON.stringify(stats)
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Error updating game stats:', error);
                return { success: false, message: 'Failed to update stats' };
            }
        },

        /**
         * Attempts user login on the backend.
         * @param {string} username
         * @param {string} password
         * @returns {Promise<object>} A promise resolving with user data on success, or error.
         */
        login: async function(username, password) {
            try {
                // This assumes your server has an endpoint like /api/auth/login
                const response = await fetch(`${BASE_URL}/api/auth/login`, { // Your original endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || `HTTP error! status: ${response.status}`);
                }
                return { success: true, user: data.user, message: data.message };

            } catch (error) {
                console.error('Login error:', error);
                return { success: false, message: error.message || 'Login failed due to network error.' };
            }
        },

        /**
         * Attempts user registration on the backend.
         * @param {string} username
         * @param {string} password
         * @returns {Promise<object>} A promise resolving with registration status.
         */
        register: async function(username, password) {
            try {
                // This assumes your server has an endpoint like /api/auth/register
                const response = await fetch(`${BASE_URL}/api/auth/register`, { // Your original endpoint
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || `HTTP error! status: ${response.status}`);
                }

                return { success: true, message: data.message || 'Registration successful! Please log in.' };

            } catch (error) {
                console.error('Registration error:', error);
                return { success: false, message: error.message || 'Registration failed. Backend endpoint not implemented or network error.' };
            }
        },

        /**
         * Simulates a guest login (new endpoint).
         * @returns {Promise<object>} A promise resolving with guest user data.
         */
        guestLogin: async function() {
            try {
                // This assumes your server has an endpoint like /guest-login
                // Make sure your server.js has this route: app.post('/guest-login', ...)
                const response = await fetch(`${BASE_URL}/guest-login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || `HTTP error! status: ${response.status}`);
                }
                return { success: true, user: data.user, message: data.message };
            } catch (error) {
                console.error('Guest login error:', error);
                return { success: false, message: error.message || 'Guest login failed due to network error.' };
            }
        }
    };


    // --- Event Listeners and Initial Setup ---

    // Initial page load logic: Hide everything, then determine what to show
    // based on user's potential session or default to auth modal.
    if (mainAppContainer) mainAppContainer.style.display = 'none';
    if (authModal) authModal.style.display = 'none';

    apiService.fetchInitialGameData()
        .then(data => {
            if (data.user && data.user.id) { // Check if a user ID is returned, implying a session
                Object.assign(gameState.user, data.user);
                showMainAppScreen(gameState.user.username); // Show main app if user found
            } else {
                // No logged-in user, show the authentication modal
                showAuthModalScreen();
            }

            // Update global gameState with fetched data (or defaults)
            gameState.score = data.score || 0;
            gameState.level = data.level || 1;
            gameState.coins = data.coins || 0;
            renderGameState(); // Render initial state (avatar, stats)
        })
        .catch(error => {
            console.error('Failed to fetch initial game data:', error);
            // Fallback to default guest state if API fails
            gameState.user = { id: null, username: 'Guest', avatarInitial: 'G' };
            gameState.score = 0;
            gameState.level = 1;
            gameState.coins = 0;
            renderGameState();
            showAuthModalScreen(); // Always show auth modal if initial fetch fails
        });


    // Particle effects (your original code, kept as is)
    const particleCount = window.innerWidth < 768 ? 30 : 50;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const size = Math.random() * 5 + 2;
        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * window.innerHeight;
        const delay = Math.random() * 5;
        const duration = Math.random() * 10 + 10;
        const opacity = Math.random() * 0.5 + 0.1;
        const hue = Math.random() * 60 + 240;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
        particle.style.opacity = opacity;
        particle.style.backgroundColor = `hsla(${hue}, 70%, 70%, ${opacity})`;
        particle.dataset.initialOpacity = opacity;

        particlesContainer.appendChild(particle);
        particles.push(particle);
    }

    document.addEventListener('mousemove', function(e) {
        particles.forEach(particle => {
            const rect = particle.getBoundingClientRect();
            const particleCenterX = rect.left + rect.width / 2;
            const particleCenterY = rect.top + rect.height / 2;

            const distanceX = e.clientX - particleCenterX;
            const distanceY = e.clientY - particleCenterY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            const maxDistance = 150;
            if (distance < maxDistance) {
                const influence = 1 - (distance / maxDistance);
                particle.style.opacity = parseFloat(particle.dataset.initialOpacity) + (0.5 * influence);
                particle.style.transform = `translateY(${distanceY * 0.2 * -influence}px) translateX(${distanceX * 0.2 * -influence}px) scale(${1 + 0.5 * influence})`;
            } else {
                particle.style.opacity = particle.dataset.initialOpacity;
                particle.style.transform = 'translateY(0px) translateX(0px) scale(1)';
            }
        });
    });


    // Play button animation and game loading sequence (your original code, kept as is)
    // You might want to trigger your actual game logic / canvas setup here
    playBtn.addEventListener('click', function(e) {
        e.preventDefault();

        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear forwards';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '1';

        const rect = playBtn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.5;
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size/2}px`;
        ripple.style.top = `${e.clientY - rect.top - size/2}px`;

        playBtn.appendChild(ripple);

        gameCanvas.innerHTML = '<i class="fas fa-spinner fa-spin fa-3x"></i>';
        gameCanvas.style.animation = 'pulse 1s infinite';
        gameCanvas.style.background = 'linear-gradient(45deg, var(--primary), var(--secondary))';
        gameCanvas.style.color = 'white';

        gameCanvas.setAttribute('aria-live', 'polite');
        gameCanvas.setAttribute('aria-label', 'Game loading, please wait');

        // Simulate game loading. In a real scenario, this would be an API call to start a game.
        setTimeout(() => {
            gameCanvas.style.animation = '';
            gameCanvas.style.background = 'rgba(0,0,0,0.3)';
            gameCanvas.style.color = 'var(--secondary)';
            gameCanvas.innerHTML = `
                <i class="fas fa-play-circle fa-3x" style="animation: pulse 2s infinite"></i>
                <p style="margin-top:10px; animation: fadeIn 1s ease-out">Tap to continue</p>
            `;
            gameCanvas.setAttribute('aria-label', 'Game ready. Tap to continue.');

            createConfetti();

            // --- You might want to trigger your actual game logic to start here ---
            // Example:
            // if (typeof initMyGame === 'function') {
            //     initMyGame(gameState.user.username); // Pass username to your game if needed
            // }

        }, 1500);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });

    // User Avatar Interaction (now opens login modal or shows welcome)
    userAvatar.setAttribute('role', 'button');
    userAvatar.setAttribute('aria-label', `User Profile for ${gameState.user.username}`);
    userAvatar.addEventListener('click', async function() {
        if (gameState.user.id) { // If user is logged in (has an ID)
            alert(`Welcome, ${gameState.user.username}! Your current score is ${gameState.score}.`);
        } else { // If user is a guest or not logged in, show the login/register modal
            showAuthModalScreen();
        }
    });

    // --- Auth Modal Event Listeners (Your original code + new guest button) ---
    authCloseBtn.addEventListener('click', showMainAppScreen); // Close button now reveals main app

    // Close modal if user clicks outside of it
    window.addEventListener('click', function(event) {
        if (event.target == authModal) {
            showMainAppScreen(); // Clicking outside modal also reveals main app
        }
    });

    toggleLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        clearAuthMessages();
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });

    toggleRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        clearAuthMessages();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });

    loginBtn.addEventListener('click', async function() {
        clearAuthMessages();
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value.trim();

        if (!username || !password) {
            displayAuthMessage('Please enter both username and password.');
            return;
        }

        const loginResult = await apiService.login(username, password);

        if (loginResult.success) {
            displayAuthMessage(loginResult.message, false); // Green message for success
            Object.assign(gameState.user, loginResult.user); // Update user info in gameState
            
            // After successful login, show the main app screen
            showMainAppScreen(gameState.user.username);

            // Fetch the real game data for this logged-in user
            apiService.fetchInitialGameData()
                .then(data => {
                    gameState.score = data.score || 0;
                    gameState.level = data.level || 1;
                    gameState.coins = data.coins || 0;
                    renderGameState(); // Update the UI with real user data
                    createLevelUpEffect('Welcome!'); // Show a welcome effect
                })
                .catch(err => {
                    console.error('Failed to load user game data after login:', err);
                    displayAuthMessage('Failed to load user game data.', true);
                });
        } else {
            displayAuthMessage(loginResult.message); // Red message for error
        }
    });

    registerBtn.addEventListener('click', async function() {
        clearAuthMessages();
        const username = registerUsernameInput.value.trim();
        const password = registerPasswordInput.value.trim();

        if (!username || !password) {
            displayAuthMessage('Please enter both username and password.');
            return;
        }

        const registerResult = await apiService.register(username, password);

        if (registerResult.success) {
            displayAuthMessage(registerResult.message + ' You can now login.', false);
            // After successful registration, show the login form
            if (loginForm) loginForm.style.display = 'block';
            if (registerForm) registerForm.style.display = 'none';
        } else {
            displayAuthMessage(registerResult.message);
        }
    });

    // --- NEW: Play as Guest Button Event Listener ---
    if (guestButton) {
        guestButton.addEventListener('click', async () => {
            clearAuthMessages();
            const guestLoginResult = await apiService.guestLogin(); // Call the new guestLogin API service
            
            if (guestLoginResult.success) {
                displayAuthMessage(guestLoginResult.message, false);
                Object.assign(gameState.user, guestLoginResult.user); // Update gameState with guest user info
                showMainAppScreen(gameState.user.username); // Show main app for guest
                renderGameState(); // Update avatar etc.
                createLevelUpEffect('Welcome, Guest!'); // Show a guest welcome effect
            } else {
                displayAuthMessage(guestLoginResult.message);
            }
        });
    }


    // Accessibility for dynamically updating stats (your original code, kept as is)
    scoreEl.setAttribute('aria-live', 'polite');
    scoreEl.setAttribute('aria-atomic', 'true');
    levelEl.setAttribute('aria-live', 'polite');
    levelEl.setAttribute('aria-atomic', 'true');
    coinsEl.setAttribute('aria-live', 'polite');
    coinsEl.setAttribute('aria-atomic', 'true');

    // Simulate score and level updates (your original code, kept as is)
    setInterval(() => {
        const increment = Math.floor(Math.random() * 5) + 1;
        gameState.score += increment;

        scoreEl.style.animation = 'none';
        void scoreEl.offsetWidth;
        scoreEl.style.animation = 'pop 0.3s ease-out';

        if (gameState.score % 100 === 0 && gameState.score !== 0) {
            gameState.level++;
            levelEl.style.animation = 'none';
            void levelEl.offsetWidth;
            levelEl.style.animation = 'pulse 0.6s ease-out';
            createLevelUpEffect();
        }

        // Send updated stats to the REAL backend
        apiService.updateGameStats({
            username: gameState.user.username,
            score: gameState.score,
            level: gameState.level,
            coins: gameState.coins
        })
            .then(response => {
                if (response.success) {
                    // console.log("Stats updated on backend:", response.updatedStats);
                } else {
                    console.warn("Backend reported failure to update stats:", response.message);
                }
            })
            .catch(error => console.error("Failed to update stats via API:", error));

        renderGameState();
    }, 3000);

    // Mobile menu interaction (your original code, kept as is)
    menuItems.forEach(item => {
        item.setAttribute('role', 'link');
        item.addEventListener('click', function(e) {
            e.preventDefault();

            menuItems.forEach(i => {
                i.classList.remove('active');
                i.querySelector('i').style.animation = '';
                i.setAttribute('aria-current', 'false');
            });

            this.classList.add('active');
            this.setAttribute('aria-current', 'page');
            const icon = this.querySelector('i');
            icon.style.animation = 'popIn 0.4s ease-out';

            mobileMenu.style.animation = 'menuBounce 0.3s ease-out';
            setTimeout(() => {
                mobileMenu.style.animation = '';
            }, 300);

            setTimeout(() => {
                icon.style.animation = '';
            }, 400);

            const menuItemText = this.querySelector('span').textContent;
            console.log(`${menuItemText} menu item clicked!`);
        });
    });

    // Simulate coin collection on general document click (your original code, kept as is)
    document.addEventListener('click', function(e) {
        // Only trigger coin collection if not clicking inside the auth modal
        if (!authModal.contains(e.target) && Math.random() > 0.7) {
            const coinIncrement = Math.floor(Math.random() * 3) + 1;
            gameState.coins += coinIncrement;

            coinsEl.style.animation = 'none';
            void coinsEl.offsetWidth;
            coinsEl.style.animation = 'pop 0.3s ease-out';

            createCoinEffect(e.clientX, e.clientY, coinIncrement);

            // Send updated coins to the REAL backend
            apiService.updateGameStats({
                username: gameState.user.username,
                score: gameState.score,
                level: gameState.level,
                coins: gameState.coins
            })
                .then(response => {
                    if (response.success) {
                        // console.log("Coins updated on backend:", response.updatedStats);
                    } else {
                        console.warn("Backend reported failure to update coins:", response.message);
                    }
                })
                .catch(error => console.error("Failed to update coins via API:", error));

            renderGameState();
        }
    });

    // Dynamically add common animation keyframes (your original code, kept as is)
    const dynamicStyle = document.createElement('style');
    dynamicStyle.textContent = `
        @keyframes menuBounce {
            0% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
            100% { transform: translateY(0); }
        }

        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        @keyframes pop {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
        @keyframes fadeUp {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-50px); }
        }
        @keyframes popIn {
            0% { transform: scale(0); opacity: 0; }
            80% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        /* For auth modal fade-in */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(dynamicStyle);

    // Helper function to create coin collection visual effect (your original code, kept as is)
    function createCoinEffect(x, y, amount) {
        for (let i = 0; i < amount; i++) {
            const coin = document.createElement('div');
            coin.innerHTML = '<i class="fas fa-coins" style="color:gold;"></i>';
            coin.style.position = 'fixed';
            coin.style.left = `${x}px`;
            coin.style.top = `${y}px`;
            coin.style.fontSize = `${Math.random() * 10 + 10}px`;
            coin.style.opacity = '1';
            coin.style.transform = 'translate(-50%, -50%) scale(0)';
            coin.style.animation = `coinFloat${i} 1s ease-out forwards`;
            coin.style.zIndex = '1000';
            coin.style.pointerEvents = 'none';

            const coinAnim = document.createElement('style');
            coinAnim.textContent = `
                @keyframes coinFloat${i} {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    20% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    100% {
                        transform: translate(
                            ${(Math.random() - 0.5) * 100 - 50}%,
                            ${-Math.random() * 100 - 50}%
                        ) scale(0);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(coinAnim);

            document.body.appendChild(coin);
            setTimeout(() => {
                coin.remove();
                coinAnim.remove();
            }, 1000);
        }
    }

    // Helper function to create confetti effect (your original code, kept as is)
    function createConfetti() {
        const confettiCount = 50;
        const container = document.querySelector('.game-canvas'); // Assuming game-canvas is the target for confetti

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.innerHTML = ['🎉', '✨', '🎊', '⭐', '🏆'][Math.floor(Math.random() * 5)];
            confetti.style.position = 'absolute';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = `${Math.random() * 100}%`;
            confetti.style.fontSize = `${Math.random() * 10 + 10}px`;
            confetti.style.opacity = '0';
            confetti.style.transform = 'translate(-50%, -50%) scale(0)';
            confetti.style.animation = `confetti${i} 1.5s ease-out forwards`;
            confetti.style.zIndex = '10';
            confetti.style.pointerEvents = 'none';
            const confettiAnim = document.createElement('style');
            confettiAnim.textContent = `
                @keyframes confetti${i} {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    20% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    100% {
                        transform: translate(
                            ${(Math.random() - 0.5) * 100}%,
                            ${Math.random() * 100 + 100}%
                        ) rotate(${Math.random() * 360}deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(confettiAnim);
            container.appendChild(confetti);

            setTimeout(() => {
                confetti.remove();
                confettiAnim.remove();
            }, 1500);
        }
    }

    // Helper function for level up visual effect (your original code, kept as is)
    function createLevelUpEffect(message = 'LEVEL UP!') {
        const levelUp = document.createElement('div');
        levelUp.innerHTML = message;
        levelUp.style.position = 'fixed';
        levelUp.style.top = '50%';
        levelUp.style.left = '50%';
        levelUp.style.transform = 'translate(-50%, -50%)';
        levelUp.style.fontSize = '2rem';
        levelUp.style.fontWeight = 'bold';
        levelUp.style.color = 'var(--accent)';
        levelUp.style.textShadow = '0 0 10px rgba(253, 121, 168, 0.8)';
        levelUp.style.opacity = '0';
        levelUp.style.animation = 'levelUpAnim 1.5s ease-out forwards';
        levelUp.style.zIndex = '1000';
        levelUp.style.pointerEvents = 'none';
        const levelUpAnim = document.createElement('style');
        levelUpAnim.textContent = `
            @keyframes levelUpAnim {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
            }
        `;
        document.head.appendChild(levelUpAnim);

        document.body.appendChild(levelUp);

        setTimeout(() => {
            levelUp.remove();
            levelUpAnim.remove();
        }, 1500);

        if (message === 'LEVEL UP!') {
            createFireworks();
        }
    }

    // Helper function to create fireworks effect (your original code, kept as is)
    function createFireworks() {
        const fireworksCount = 5;
        const container = document.querySelector('#main-app-container'); // Changed target to the main container

        for (let i = 0; i < fireworksCount; i++) {
            setTimeout(() => {
                const x = Math.random() * 80 + 10;
                const y = Math.random() * 50 + 10;
                const firework = document.createElement('div');
                firework.style.position = 'absolute';
                firework.style.left = `${x}%`;
                firework.style.top = `${y}%`;
                firework.style.width = '4px';
                firework.style.height = '4px';
                firework.style.backgroundColor = ['#fd79a8', '#6c5ce7', '#00b894', '#fdcb6e', '#e17055'][i % 5];
                firework.style.borderRadius = '50%';
                firework.style.boxShadow = `0 0 10px 2px ${firework.style.backgroundColor}`;
                firework.style.opacity = '0';
                firework.style.animation = `firework${i} 1s ease-out forwards`;
                firework.style.zIndex = '100';
                firework.style.pointerEvents = 'none';

                const fireworkAnim = document.createElement('style');
                fireworkAnim.textContent = `
                    @keyframes firework${i} {
                        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                        10% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                        100% {
                            transform: translate(-50%, -50%) scale(0);
                            opacity: 0;
                            box-shadow:
                                0 0 0 10px rgba(253, 121, 168, 0),
                                0 0 0 20px rgba(253, 121, 168, 0),
                                0 0 0 30px rgba(253, 121, 168, 0);
                        }
                    }
                `;
                document.head.appendChild(fireworkAnim);
                container.appendChild(firework);

                setTimeout(() => {
                    firework.remove();
                    fireworkAnim.remove();
                }, 1000);
            }, i * 200);
        }
    }
});

