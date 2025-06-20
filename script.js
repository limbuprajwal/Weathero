let cityInput = document.querySelector("#searchbar");

// Insert fetched weather data into the DOM
function InsertWeatherData(weather) {
  document.querySelector("#weatherStatus").innerHTML = weather.condition;
  document.querySelector("#temperature").innerHTML = Math.round(weather.temp) + "&deg";
  document.querySelector("#date").innerHTML = weather.date;
  document.querySelector("#location").innerHTML = weather.name;
  document.querySelector("#pressure").innerHTML = weather.pressure + "Pa";
  document.querySelector("#windSpeed").innerHTML = `${weather.windSpeed}m/s`;
  document.querySelector("#humidity").innerHTML = `${weather.humidity}%`;
  document.querySelector("#visibility").innerHTML = weather.visibility + "km" || "--";
  document.querySelector("#feelsLike").innerHTML = weather.feelslike + "&deg" || "--";
  document.querySelector("#windDirection").innerHTML = weather.windDirection + "&deg" || "--";
  document.querySelector("#windGust").innerHTML = weather.windGust || "--";
  document.querySelector("#sunrise").innerHTML = weather.sunrise || "--";
  document.querySelector("#sunset").innerHTML = weather.sunset || "--";
  document.querySelector("#weatherIcon").src = `https://openweathermap.org/img/w/${weather.icon}.png`;
}

// Handle enter key in search bar
function searchCity(event) {
  if (event.key === "Enter") {
    searchWeather();
  }
}

// Fetch and render weather data for the city
async function searchWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    console.error("City name is empty.");
    return;
  }

  if (navigator.onLine) {
    await fetchData(city);
  } else {
    const cachedWeatherData = localStorage.getItem(city);
    if (cachedWeatherData) {
      const weather = JSON.parse(cachedWeatherData);
      InsertWeatherData(weather);
    } else {
      console.error("City data not available offline.");
    }
  }

  cityInput.value = "";
}

// Call OpenWeather API
async function fetchData(city_name) {
  try {
    const apiKey = "cae6201b6cd9ee700bf84977a25d1c63";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city_name}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error("Failed to fetch data for:", city_name, response.statusText);
      return;
    }

    const { main, wind, weather, visibility, sys } = await response.json();
    const currentDate = new Date();
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const options = { year: "numeric", month: "short", day: "numeric" };

    const weatherData = {
      name: city_name,
      day: weekdays[currentDate.getDay()],
      date: currentDate.toLocaleDateString("en-US", options),
      condition: weather[0].description,
      icon: weather[0].icon,
      temp: main.temp,
      pressure: main.pressure,
      windSpeed: wind.speed,
      humidity: main.humidity,
      visibility: visibility ? visibility / 1000 : "--",
      feelslike: main.feels_like,
      windDirection: wind.deg,
      windGust: wind.gust,
      sunrise: sys?.sunrise ? new Date(sys.sunrise * 1000).toLocaleTimeString("en-US") : "--",
      sunset: sys?.sunset ? new Date(sys.sunset * 1000).toLocaleTimeString("en-US") : "--",
    };

    InsertWeatherData(weatherData);
    localStorage.setItem(city_name, JSON.stringify(weatherData));
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

// Theme toggle logic
const toggleBtn = document.getElementById("toggleTheme");
const themeIcon = document.getElementById("themeIcon");

const currentTheme = localStorage.getItem("theme");

if (currentTheme === "light") {
  document.body.classList.add("light");
  themeIcon.classList.remove("fa-moon");
  themeIcon.classList.add("fa-sun");
}

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");

  themeIcon.classList.toggle("fa-moon", !isLight);
  themeIcon.classList.toggle("fa-sun", isLight);

  localStorage.setItem("theme", isLight ? "light" : "dark");
});

// Default city
fetchData("Kathmandu");

// Search input listener
cityInput.addEventListener("keydown", searchCity);
