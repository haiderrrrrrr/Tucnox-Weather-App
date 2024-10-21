const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null;
const inputInitHeight = chatInput.scrollHeight;

// Gemini API configuration
const GEMINI_API_KEY = "AIzaSyBjQuSCqxbIut7f7r1sOlIW4-GPTbbH7O0";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// OpenWeather API configuration
const WEATHER_API_KEY = "b91f6a85871abbb4a82078d84ccdca11";
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/forecast";

// Helper function to create chat messages
const createChatLi = (message, className) => {
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", `${className}`);
  let chatContent =
    className === "outgoing"
      ? `<p></p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector("p").textContent = message;
  return chatLi;
};

// Helper functions for temperature conversions
const convertToFahrenheit = (tempCelsius) => (tempCelsius * 9) / 5 + 32;
const convertToCelsius = (tempFahrenheit) => ((tempFahrenheit - 32) * 5) / 9;

// Function to fetch weather data from OpenWeather API
const fetchWeatherData = async (city) => {
  try {
    const response = await fetch(
      `${WEATHER_API_URL}?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
    );
    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

// Function to handle user intent and generate a weather-related response
const processWeatherQuery = async (message) => {
  const celsiusMatch = message.match(/(\d+\.?\d*)\s?(fah?r?e?n?heit|celsius)/i);
  if (celsiusMatch) {
    const value = parseFloat(celsiusMatch[1]);
    const unit = celsiusMatch[2].toLowerCase();

    if (unit.includes("fahrenheit")) {
      const result = convertToCelsius(value);
      return `${value}°F is approximately ${result.toFixed(2)}°C.`;
    } else {
      const result = convertToFahrenheit(value);
      return `${value}°C is approximately ${result.toFixed(2)}°F.`;
    }
  }

  // Extracting city name for weather data
  const cityMatch = message.trim().split(" ").pop();
  const city = cityMatch ? cityMatch.trim() : null;
  if (!city) return "Please specify a city in your query.";

  const weatherData = await fetchWeatherData(city);
  if (!weatherData)
    return `I couldn't find the weather information for "${city}".`;

  const forecast = weatherData.list[0];
  const description = forecast.weather[0].description;
  const tempCelsius = forecast.main.temp;
  const tempFahrenheit = convertToFahrenheit(tempCelsius);
  const humidity = forecast.main.humidity;
  const windSpeed = forecast.wind.speed;
  const pressure = forecast.main.pressure;

  // Check if user is asking for specific weather info
  if (/temperature|temp/i.test(message)) {
    return `The temperature in ${city} is ${tempCelsius}°C (${tempFahrenheit.toFixed(
      2
    )}°F).`;
  } else if (/wind/i.test(message)) {
    return `The wind speed in ${city} is ${windSpeed} m/s.`;
  } else if (/humidity/i.test(message)) {
    return `The humidity level in ${city} is ${humidity}%.`;
  } else if (/pressure/i.test(message)) {
    return `The atmospheric pressure in ${city} is ${pressure} hPa.`;
  } else if (/5 days|forecast/i.test(message)) {
    let forecastMessage = `Here is the 5-day forecast for ${city}:
`;
    for (let i = 0; i < 5; i++) {
      const dayForecast = weatherData.list[i * 8];
      const date = new Date(dayForecast.dt_txt).toLocaleDateString();
      const temp = dayForecast.main.temp;
      forecastMessage += `${date}: ${temp}°C (${convertToFahrenheit(
        temp
      ).toFixed(2)}°F), ${dayForecast.weather[0].description}.
`;
    }
    return forecastMessage;
  } else if (/rainy|cloudy|clear|sunny/i.test(message)) {
    return `The current weather in ${city} is ${description}.`;
  } else {
    return `The current weather in ${city} is ${description}, with a temperature of ${tempCelsius}°C (${tempFahrenheit.toFixed(
      2
    )}°F), humidity at ${humidity}%, wind speed of ${windSpeed} m/s, and atmospheric pressure at ${pressure} hPa.`;
  }
};

// Function to generate the chatbots response
const generateResponse = async (chatElement) => {
  const messageElement = chatElement.querySelector("p");

  // Handling weather queries
  if (
    /weather|temperature|wind|humidity|forecast|rain|5 days|pressure|cloudy|sunny|clear/i.test(
      userMessage
    )
  ) {
    const weatherResponse = await processWeatherQuery(userMessage);
    messageElement.textContent = weatherResponse;
    return;
  }

  // Defining properties and message for the Gemini API request
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
    }),
  };

  // Sending POST request to Gemini API and getting respons
  try {
    const response = await fetch(GEMINI_API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);
    messageElement.textContent =
      data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1");
  } catch (error) {
    messageElement.classList.add("error");
    messageElement.textContent = error.message;
  } finally {
    chatbox.scrollTo(0, chatbox.scrollHeight);
  }
};

// Function to handle chat input
const handleChat = () => {
  userMessage = chatInput.value.trim();
  if (!userMessage) return;
  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
};

// Event listeners
chatInput.addEventListener("input", () => {
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () =>
  document.body.classList.remove("show-chatbot")
);

chatbotToggler.addEventListener("click", () => {
  document.body.classList.toggle("hide-chatbot");
});
