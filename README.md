# Arcade Ascend: A Mini-Game Web App Prototype

A full-stack web application prototype for a mini-game, showcasing user authentication, game data management, and a responsive frontend.

## Live Demo

Experience the app live on Render: [https://minigameapp-prototype.onrender.com](https://minigameapp-prototype.onrender.com)

## Current State & Implemented Features

This prototype demonstrates the foundational elements of a web-based mini-game application. Key implemented features include:

* **User Authentication Flow:**
    * **Guest Access:** Users can immediately "Play as Guest" to explore the game interface without registration.
    * **User Registration:** New users can register for an account.
    * **User Login:** Registered users can log in to access the game.
* **Dynamic UI Management:** The application seamlessly switches between the authentication modal and the main game interface upon successful login or guest access.
* **Game User Interface (UI):** A clean and responsive UI displays core game elements like user avatar, score, level, and coins.
* **Basic Game Stats Tracking:** Users' scores, levels, and coins are updated in the UI and persisted to the backend when the "PLAY" button is clicked.
* **Full-Stack Deployment:** The application is deployed and hosted on Render.com, demonstrating a complete development lifecycle from code to live service.

## Technologies Used

* **Frontend:** HTML5, CSS3, JavaScript
* **Backend:** Node.js (Express.js)
* **Database:** Local JSON file (`db.json`) for simplified data persistence
* **Deployment:** Render.com
* **Version Control:** Git & GitHub

## Future Development Considerations

While the core framework is established, several exciting features and improvements are planned or could be implemented in future iterations:

* **Implement Core Mini-Game Logic:** Develop an actual interactive mini-game instead of the current placeholder.
* **User-Specific Game Data:** Enhance backend logic to retrieve and display specific game data for logged-in registered users (beyond the current guest data default).
* **Robust Session Management:** Implement JWT (JSON Web Tokens) or similar for secure and scalable user sessions.
* **Database Migration:** Transition from a flat-file `db.json` to a more robust database system (e.g., MongoDB, PostgreSQL) for better data management and scalability.
* **Leaderboard Functionality:** Make the leaderboard dynamic, fetching actual top scores from the database.
* **Shop System:** Develop a functional in-game shop where players can spend coins.
* **Sound Effects & Music:** Integrate audio for a more immersive gaming experience.
* **Enhanced Error Handling & UI Feedback:** Provide more comprehensive error messages and visual cues for user actions.
* **Responsive Design Improvements:** Further optimize the UI for various screen sizes and orientations.

## Getting Started (Local Development)

To run this project locally:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/datasosa/MiniGameApp-Prototype.git](https://github.com/datasosa/MiniGameApp-Prototype.git)
    cd MiniGameApp-Prototype
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the server:**
    ```bash
    node server.js
    ```
4.  **Open in browser:**
    Navigate to `http://localhost:3000` in your web browser.
