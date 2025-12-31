# Tucnox Weather App

## Overview
- Responsive weather dashboard using OpenWeather for data and Gemini for chatbot responses.
- Pages: Dashboard (current + 5-day charts), Table (3-hour forecast + chatbot), World View (global map).
- Built with HTML, CSS, and JavaScript; no build step required.

## Features
- City search with unit toggle (°C/°F) and geolocation for default location.
- Multiple charts (Bar, Doughnut, Polar, Radar, Scatter) via Chart.js.
- Chatbot that can answer general questions and basic weather queries.

## Tech Stack
- HTML5, CSS3, JavaScript
- OpenWeather API, Gemini API
- Chart.js

## Quick Start
1) Clone the repository
   - `git clone https://github.com/haiderrrrrrr/Tucnox-Weather-App.git`
   - `cd Tucnox-Weather-App`

2) Configure API keys with `.env` and the runtime loader
   - Create a `.env` file in the repo root (use `.env.example` for reference):
     ```
     OPENWEATHER_API_KEY=<your_openweather_api_key>
     GEMINI_API_KEY=<your_gemini_api_key>
     ```

3) Run locally
   - Open `index.html` directly in a browser, or
   - Serve with a static server (e.g., VS Code Live Server, `npx serve`, or any simple HTTP server).

## Getting API Keys
### OpenWeather
- Sign up: https://home.openweathermap.org/users/sign_up
- Generate an API key (appid) from your account.
- Use the key for `OPENWEATHER_API_KEY`.

### Gemini (Google AI Studio)
- Go to: https://aistudio.google.com/app/apikey
- Create a new API key and use it for `GEMINI_API_KEY`.

## Usage
- `index.html` → Welcome page → Click “Get Started”.
- `dashboard.html` → Search a city; toggle units; use default location.
- `table.html` → Detailed 5-day forecast (3-hour intervals) + chatbot.
- `worldview.html` → Global weather map.

## Project Structure
```
├── .env 
├── README.md
├── assets/
├── css/
├── js/
│   ├── chatbot.js
│   ├── env.js
│   └── weather.js
├── dashboard.html
├── index.html
├── table.html
└── worldview.html
```