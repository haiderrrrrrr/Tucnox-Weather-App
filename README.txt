 -------------------------------------
|                                     |
|    Tucnox Weather App - README      |
|                                     |
 -------------------------------------

----------
Live URL: |
----------
https://haiderrrrrrr.github.io/Tucnox-Weather-App/


------------------
Project Overview: |
------------------
This project is a fully responsive weather dashboard built using HTML, CSS, and JavaScript, with the following features:
    - World Weather View Page: Displays global weather conditions
    - Dashboard: Shows the current weather and a 5-day weather forecast with animated charts
    - Table Page with Chatbot: Displays a detailed forecast for the next 5 days in the selected city with weather data updated every 3 hours, alongside an interactive chatbot
    - The application utilizes OpenWeather API for real-time weather data, Gemini API for chatbot functionality, and Chart.js for weather data visualizations


----------
Features: |
----------
1. Starting Page:
Displays an overview of global weather data
2. Dashboard:
Displays current weather conditions based on the selected city including:
    - Temperature
    - Humidity
    - Wind speed
    - Weather description (with dynamic background based on weather conditions)
3. Animated Charts for 5-day weather forecast using Chart.js:
    - Vertical Bar Chart: Shows temperatures over the next 5 days
    - Doughnut Chart: Displays weather condition percentages (e.g., sunny, cloudy, rainy)
    - Line Chart: Visualizes temperature changes over the next 5 days
    - Polar Area Chart: Visualizes Humidity Levels over 5 days
    - Radar Chart: Visualizes Temperature and Wind Speed Comparison 
    - Scatter Chart: Visualizes Temperature vs Humidity 
4. Table Page:
    - Displays a detailed 5-day weather forecast table with pagination
    - Chatbot integrated using Gemini API, handling both general queries and weather-specific requests
    - 5-day forecast is updated every 3 hours for the selected city
5. Responsive Design:
Designed using CSS Flexbox/Grid for mobile, tablet, and desktop views


---------------------
Key Functionalities: |
---------------------
1. Weather Dashboard:
    - Enter a city name to display the current weather and 5-day forecast
    - Background dynamically changes based on weather conditions
2. Chart Animations:
    - Vertical Bar Chart and Doughnut Chart have a delay animation
    - Line Chart uses a drop animation
3. Table Page:
    - Detailed 5-day forecast updated every 3 hours
    - Pagination for improved user experience
4. Chatbot:
    - Detects weather-related questions and provides relevant data using OpenWeather API
    - Handles general queries with Gemini API


---------------------
Additional Features: |
---------------------
- Unit conversion toggle (Celsius/Fahrenheit)
- Geolocation-based weather display for user's current location
- Loading spinner while fetching weather data
- Error handling for invalid city names or API errors
- Polar Area Chart for visualizing Humidity Levels over 5 days
- Radar Chart for visualizing Temperature and Wind Speed Comparison 
- Scatter Chart for visualizing Temperature vs Humidity 


-------------------
Technologies Used: |
-------------------
    - HTML5: Structure of the pages
    - CSS3: Styling, responsive design
    - JavaScript: Core functionality, API integration, and data handling
    - OpenWeather API: Fetches real-time weather data
    - Gemini API: Chatbot for handling user queries
    - Chart.js: Data visualizations for weather charts


-----------------
API Integration: |
-----------------
1. OpenWeather API:
Handles Weather related Queries
    - Current weather data API: /data/2.5/weather?q={city_name}&appid={API_key}
    - 5-day forecast API: /data/2.5/forecast?q={city_name}&appid={API_key}
2. Gemini API:
Handles non-weather-related queries and enhances chatbot interaction for user queries


--------------------
Setup Instructions: |
--------------------
1. Prerequisites:
    OpenWeather API Key and Gemini API Key From their setup Pages
2. Steps to Setup:
    - Clone the repository 
        git clone "https://github.com/haiderrrrrrr/Tucnox-Weather-App.git"
    - Navigate to the project directory
        cd Tucnox Weather App
    - Run the index.html file in your browser
3. API Key Setup:
    Replace {API_key} placeholders in the JavaScript file with your own OpenWeather and Gemini API keys

