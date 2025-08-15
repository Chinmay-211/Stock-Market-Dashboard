Stock Market Dashboard (React + Express)
This is a full-stack web application built for the JarNox internship assignment. It provides a real-time stock market dashboard with historical data, technical indicators, and an AI-based price forecast. The entire application is containerized with Docker for easy setup and deployment.

Features
Dynamic Frontend: A clean, responsive UI built with ReactJS.

Robust Backend: A RESTful API powered by Node.js and Express.

Live Stock Data: Fetches real-time and historical data from the Yahoo Finance API.

Interactive Charting: Displays stock prices on a fully interactive chart using Chart.js.

Technical Analysis: Automatically calculates and plots the 50-Day Simple Moving Average (SMA) for any selected stock.

AI-Powered Prediction: Includes a simple linear regression model to forecast the next day's stock price.

Key Metrics: Shows essential data points including 52-week high/low and 3-month average trading volume.

Dockerized: The entire application (frontend and backend) is containerized using Docker and managed with Docker Compose for one-command setup.

Tech Stack
Backend: Node.js, Express.js, yahoo-finance2, simple-statistics

Frontend: ReactJS, Axios, Chart.js, react-chartjs-2

Containerization: Docker, Docker Compose

How to Run
You can run this project in two ways: using Docker (recommended) or locally with Node.js.

Method 1: Running with Docker (Recommended)
Prerequisites: Docker Desktop installed and running.

From the project's root directory, run the build and start command:

docker-compose up --build

Once the containers are running, open your browser and navigate to:
http://localhost:3000

Method 2: Running Locally
Prerequisites: Node.js and npm installed.

Run the Backend Server:

# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Start the server
npm start
# Backend will run on http://localhost:5000

Run the Frontend Application (in a new terminal):

# Navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Start the React app
npm start
# Application will open at http://localhost:3000

Docker Commands
Here are some common commands for managing the application with Docker Compose.

Stop and Remove Containers: To completely stop the application and remove the containers, run the following command from the project's root directory:

docker-compose down

Restart Containers: If the containers are already running and you want to quickly restart them without rebuilding the images, use:

docker-compose restart

Rebuild and Restart: If you have made changes to the code in either the frontend or backend directories, you will need to rebuild the images. Use this command to stop, rebuild, and restart the application:

docker-compose up --build -d

(The -d flag runs the containers in the background.)