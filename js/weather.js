const apiKey = "b91f6a85871abbb4a82078d84ccdca11";
let lastFetchedCity = "";
let isFahrenheit = JSON.parse(localStorage.getItem("isFahrenheit")) || false; // For Tracking the unit (false = Celsius, true = Fahrenheit)
let barChartInstance, // For making Charts Instances
  doughnutChartInstance,
  lineChartInstance,
  polarAreaChartInstance,
  radarChartInstance,
  scatterChartInstance;
let currentPage = 1;
const entriesPerPage = 10;
let forecastData = [];
let locationDisabled = false;

// Function to display error message
function showError(message) {
  $("#error-message").html(message).fadeIn();
  setTimeout(() => {
    $("#error-message").fadeOut();
  }, 3000);
}

// Function to update the background of the weather card based on weather condition
function updateWeatherCardBackground(weatherCondition) {
  const weatherCard = document.getElementById("weather-card");
  let gradient = "";

  switch (weatherCondition.toLowerCase()) {
    case "clear":
      gradient = "linear-gradient(to top, #f9d976, #f39c12)";
      break;
    case "clouds":
      gradient = "linear-gradient(to top, #b0b0b0, #8d8d8d)";
      break;
    case "rain":
      gradient = "linear-gradient(to top, #4a90e2, #334d80)";
      break;
    case "snow":
      gradient = "linear-gradient(to top, #e0eafc, #cfdef3)";
      break;
    case "thunderstorm":
      gradient = "linear-gradient(to top, #3a3d40, #181818)";
      break;
    case "drizzle":
      gradient = "linear-gradient(to top, #b2fefa, #66a6ff)";
      break;
    case "mist":
    case "fog":
      gradient = "linear-gradient(to top, #e6e9f0, #cfd9df)";
      break;
    case "night-clear":
      gradient = "linear-gradient(to top, #2c3e50, #4ca1af)";
      break;
    case "night-clouds":
      gradient = "linear-gradient(to top, #525252, #b0b0b0)";
      break;
    default:
      gradient = "linear-gradient(to top, #dfe9f3, #ffffff)";
      break;
  }

  weatherCard.style.background = gradient;
  weatherCard.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
}

// Function to fetch current weather
function fetchWeather(city) {
  if (!city) {
    showError("Please enter a valid city name!");
    return;
  }
  const units = isFahrenheit ? "imperial" : "metric";
  const unitSymbol = isFahrenheit ? "&deg;F" : "&deg;C";
  $("#loader").show();

  $.ajax({
    url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`,
    method: "GET",
    success: function (data) {
      $("#loader").hide();
      const temperature = Math.round(data.main.temp);
      const humidity = data.main.humidity;
      const pressure = data.main.pressure;
      const windSpeed = data.wind.speed;
      const weatherDescription = data.weather[0].description;
      const iconCode = data.weather[0].icon;
      const currentTime = new Date();
      const day = currentTime.toLocaleDateString("en-US", { weekday: "long" });
      const time = currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Determining if it is day or night
      const isNight = iconCode.includes("n");
      const mainCondition = data.weather[0].main.toLowerCase();
      const weatherCondition = isNight
        ? `night-${mainCondition}`
        : mainCondition;

      // Updating weather widget
      $("#temperature").html(`${temperature}${unitSymbol}`);
      $("#humidity").html(`${humidity}%`);
      $("#wind-speed").html(`${windSpeed} ${isFahrenheit ? "mph" : "km/h"}`);
      $("#pressure").html(`${pressure} mB`);
      $("#weather-description").html(
        weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)
      );
      $("#weather-icon").attr(
        "src",
        `https://openweathermap.org/img/wn/${iconCode}@2x.png`
      );
      $("#city-name").html(data.name);
      $("#day-time").html(`${day}, ${time}`);
      // Updating weather card background based on weather condition
      updateWeatherCardBackground(weatherCondition);
      // Fetching 5-day forecast
      fetchForecastcard(city);
      lastFetchedCity = city;
      $("#error-message").hide();
      // Fetching 5-day forecast Card and Table
      fetchForecast(city);
      lastFetchedCity = city;
      localStorage.setItem("lastFetchedCity", lastFetchedCity);
      localStorage.setItem("humidity", humidity);
      $("#error-message").hide();
    },
    error: function () {
      $("#loader").hide();
      showError("City not found! Please enter a valid city name!");
    },
  });
}

// Function to fetch 5-day forecast with pagination
function fetchForecast(city) {
  if (!city) {
    showError("Please enter a valid city name!");
    return;
  }
  const units = isFahrenheit ? "imperial" : "metric";
  const unitSymbol = isFahrenheit ? "&deg;F" : "&deg;C";

  $.ajax({
    url: `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}`,
    method: "GET",
    success: function (data) {
      forecastData = data.list.map((forecast) => {
        const date = new Date(forecast.dt_txt);
        return {
          day: date.toLocaleDateString("en-US", { weekday: "long" }),
          time: date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          temp: Math.round(forecast.main.temp),
          weather: forecast.weather[0].description,
          windSpeed: forecast.wind.speed,
          humidity: forecast.main.humidity,
          pressure: forecast.main.pressure,
        };
      });

      localStorage.setItem("forecastData", JSON.stringify(forecastData));
      renderTable();
      updatePaginationControls();
      // Render charts using the data for every 8th forecast (i.e., every 24 hours)
      renderCharts(forecastData.filter((_, index) => index % 8 === 0));
      $("#error-message").hide();
    },
    error: function () {
      showError("Error fetching forecast! Please try again later!!");
      $("#loader").hide();
    },
  });
}

// Function to fetch 5-day forecast Card
function fetchForecastcard(city) {
  const units = isFahrenheit ? "imperial" : "metric";
  const unitSymbol = isFahrenheit ? "&deg;F" : "&deg;C";

  $.ajax({
    url: `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}`,
    method: "GET",
    success: function (data) {
      const forecastContainer = $("#forecast");
      forecastContainer.empty();
      // Getting todays date and calculate the next 5 days correctly
      const today = new Date();
      const forecastData = [];
      // Loop through every 8th item in the list (i.e., every 24 hours)
      for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const date = new Date(forecast.dt_txt);
        const dayOfWeek = (today.getDay() + i / 8) % 7;
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const day = dayNames[dayOfWeek];
        const temp = Math.round(forecast.main.temp);
        const weatherCondition = forecast.weather[0].main;

        forecastContainer.append(`
          <div class="p-4 d-flex flex-column justify-content-center align-items-center">
            <span>${day}</span>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="Weather Icon">
            <span>${temp}${unitSymbol}</span>
          </div>
        `);

        // Collecting data for the charts
        forecastData.push({
          day: day,
          temp: temp,
          weather: weatherCondition,
        });
      }
      // Rendering the charts
      renderCharts(forecastData);
      $("#error-message").hide();
    },
    error: function () {
      showError("Error fetching forecast! Please try again later!!");
    },
  });
}

// Filter functionality
$(document).on("click", ".filter-dropdown .slide li", function () {
  const filterType = $(this).text().trim();
  let filteredData = forecastData;

  switch (filterType) {
    case "Highest Temp Day":
      const maxTemp = Math.max(...forecastData.map((entry) => entry.temp));
      filteredData = forecastData.filter((entry) => entry.temp === maxTemp);
      if (filteredData.length > 1) {
        filteredData = [filteredData[0]];
      }
      break;
    case "Days without Rain":
      filteredData = forecastData.filter(
        (entry) =>
          !entry.weather.toLowerCase().includes("rain") &&
          !entry.weather.toLowerCase().includes("thunderstorm")
      );
      break;
    case "Ascending Temp":
      filteredData = [...forecastData].sort((a, b) => a.temp - b.temp);
      break;
    case "Descending Temp":
      filteredData = [...forecastData].sort((a, b) => b.temp - a.temp);
      break;
  }

  renderTable(filteredData);
});

// Function to render forecast table
function renderTable(data = forecastData) {
  if (locationDisabled && !lastFetchedCity) {
    $("#forecast-table tbody").empty();
    return;
  }

  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedData = data.slice(startIndex, endIndex);
  const forecastTable = $("#forecast-table tbody");
  forecastTable.empty();
  paginatedData.forEach((entry) => {
    forecastTable.append(`
      <tr>
        <td>${entry.day}</td>
        <td>${entry.time}</td>
        <td>${entry.temp}${isFahrenheit ? "&deg;F" : "&deg;C"}</td>
        <td>${entry.weather}</td>
        <td>${entry.windSpeed} ${isFahrenheit ? "mph" : "km/h"}</td>
        <td>${entry.humidity}%</td>
        <td>${entry.pressure} mB</td>
      </tr>
    `);
  });

  // Updating pagination buttons and info
  $("#page-info").text(`Page ${currentPage}`);
  $("#prev-page").prop("disabled", currentPage === 1);
  $("#next-page").prop("disabled", endIndex >= data.length);
}

// Updating pagination controls
function updatePaginationControls() {
  $("#pagination").empty();
  const totalPages = Math.ceil(forecastData.length / entriesPerPage);
  for (let i = 1; i <= totalPages; i++) {
    $("#pagination").append(
      `<button class="page-btn" data-page="${i}">${i}</button>`
    );
  }
}

// Event listeners for pagination buttons
$(document).on("click", ".page-btn", function () {
  currentPage = $(this).data("page");
  renderTable();
});

$("#prev-page").on("click", function () {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});

$("#next-page").on("click", function () {
  if (currentPage * entriesPerPage < forecastData.length) {
    currentPage++;
    renderTable();
  }
});

// Function to render charts using Chart.js
function renderCharts(forecastData) {
  if (locationDisabled && !lastFetchedCity) {
    return;
  }
  // Extracting temperature and weather descriptions from forecast data
  const labels = forecastData.map((day) => day.day);
  const temperatures = forecastData.map((day) => day.temp);
  const humidityValues = forecastData.map((day) => day.humidity);
  const windSpeeds = forecastData.map((day) => day.windSpeed);
  destroyCharts();
  const colorPalette = ["#00B0F0", "#FF637D", "#4CAF50", "#FFA74D", "#A573E4"];

  // Vertical Bar Chart (Temperature over 5 days)
  barChartInstance = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Temperature",
          data: temperatures,
          backgroundColor: colorPalette.slice(0, 5),
          borderWidth: 1,
        },
      ],
    },
    options: {
      animation: {
        delay: 500,
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  // Doughnut Chart (Weather Conditions over 5 days)
  const weatherCounts = forecastData.reduce((acc, curr) => {
    acc[curr.weather] = (acc[curr.weather] || 0) + 1;
    return acc;
  }, {});

  doughnutChartInstance = new Chart(document.getElementById("doughnutChart"), {
    type: "doughnut",
    data: {
      labels: Object.keys(weatherCounts),
      datasets: [
        {
          data: Object.values(weatherCounts),
          backgroundColor: ["#A573E4", "#FFA74D", "#4CAF50"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      animation: {
        delay: 500,
      },
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });

  // Line Chart (Temperature Changes over 5 days)
  lineChartInstance = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Temperature",
          data: temperatures,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "#36a2eb",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      animation: {
        easing: "easeInBounce",
        duration: 1500,
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  // Polar Area Chart (Humidity Levels over 5 days)
  polarAreaChartInstance = new Chart(
    document.getElementById("polarAreaChart"),
    {
      type: "polarArea",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Humidity",
            data: humidityValues,
            backgroundColor: colorPalette,
            borderColor: "transparent",
            borderWidth: 0,
          },
        ],
      },
      options: {
        scales: {
          r: {
            ticks: {
              backdropColor: "transparent",
            },
          },
        },
        plugins: {
          legend: {
            position: "right",
          },
        },
      },
    }
  );

  // Radar Chart (Temperature and Wind Speed Comparison)
  radarChartInstance = new Chart(document.getElementById("radarChart"), {
    type: "radar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Temperature",
          data: temperatures,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "#ff6384",
        },
        {
          label: "Wind Speed",
          data: windSpeeds,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "#36a2eb",
        },
      ],
    },
    options: {
      scales: {
        r: {
          ticks: {
            backdropColor: "transparent",
          },
          beginAtZero: true,
        },
      },
    },
  });

  // Scatter Chart (Temperature vs Humidity)
  scatterChartInstance = new Chart(document.getElementById("scatterChart"), {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Temp vs Humidity",
          data: forecastData.map((day) => ({ x: day.temp, y: day.humidity })),
          backgroundColor: "#4CAF50",
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          title: {
            display: true,
            text: "Temperature",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Humidity",
          },
        },
      },
    },
  });
}

// Function to destroy previous chart instances before creating new ones
function destroyCharts() {
  if (barChartInstance) {
    barChartInstance.destroy();
  }
  if (doughnutChartInstance) {
    doughnutChartInstance.destroy();
  }
  if (lineChartInstance) {
    lineChartInstance.destroy();
  }
  if (polarAreaChartInstance) {
    polarAreaChartInstance.destroy();
  }
  if (radarChartInstance) {
    radarChartInstance.destroy();
  }
  if (scatterChartInstance) {
    scatterChartInstance.destroy();
  }
}

// Fetch weather for user's location when the page loads
$(document).ready(function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const units = isFahrenheit ? "imperial" : "metric";
        $("#loader").show();

        $.ajax({
          url: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`,
          method: "GET",
          success: function (data) {
            fetchWeather(data.name);
          },
          error: function () {
            $("#loader").hide();
            locationDisabled = true;
            showError("Error fetching weather for your location!");
          },
        });
      },
      function () {
        locationDisabled = true;
        showError(
          "Geolocation is disabled! Enable it to fetch your current location!!"
        );
      }
    );
  } else {
    locationDisabled = true;
    showError("Geolocation is not supported by this browser!");
  }

  // Load last fetched city and forecast data from local storage
  const storedCity = localStorage.getItem("lastFetchedCity");
  const storedForecastData = localStorage.getItem("forecastData");
  if (storedCity) {
    lastFetchedCity = storedCity;
    if (storedForecastData) {
      forecastData = JSON.parse(storedForecastData);
      renderTable();
      updatePaginationControls();
    }
  }

  $("#temp-toggle").prop("checked", isFahrenheit);
  const storedHumidity = localStorage.getItem("humidity");
  if (storedHumidity && !locationDisabled) {
    $("#humidity").html(`${storedHumidity}%`);
  }
});

// Event listener for toggle button
$("#temp-toggle").on("change", function () {
  isFahrenheit = this.checked;
  localStorage.setItem("isFahrenheit", JSON.stringify(isFahrenheit));
  forecastData = forecastData.map((entry) => {
    if (isFahrenheit) {
      entry.temp = Math.round((entry.temp * 9) / 5 + 32);
      entry.windSpeed = Math.round(entry.windSpeed * 0.621371);
    } else {
      entry.temp = Math.round(((entry.temp - 32) * 5) / 9);
      entry.windSpeed = Math.round(entry.windSpeed / 0.621371);
    }
    return entry;
  });

  renderTable();

  if (lastFetchedCity) {
    fetchWeather(lastFetchedCity);
  }
});

// Event listener for search button
$("#search-button").on("click", function () {
  const city = $("#city-input").val().trim();
  if (city && city !== lastFetchedCity) {
    fetchWeather(city);
  } else if (!city) {
    showError("Please enter a city name!");
  }

  if (window.location.pathname.includes("table.html")) {
    fetchForecast(city);
  }
});

// Event listener for default location button
$("#default-location").on("click", function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const units = isFahrenheit ? "imperial" : "metric";
        $("#loader").show();

        $.ajax({
          url: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`,
          method: "GET",
          success: function (data) {
            $("#city-input").val(data.name);
            fetchWeather(data.name);
          },
          error: function () {
            $("#loader").hide();
            showError("Error fetching weather for your location!");
          },
        });
      },
      function () {
        showError(
          "Geolocation is disabled! Enable it to fetch your current location!!"
        );
      }
    );
  } else {
    showError("Geolocation is not supported by this browser!");
  }
});
