const error = document.querySelector(".error");
const group = document.querySelectorAll(".group");
let city_name = document.getElementById("searchbar").value || "Haridwar";

function InsertWeatherData(weather) {
  document.querySelector("#weatherStatus").innerHTML = weather.condition;
  document.querySelector("#temperature").innerHTML =
    Math.round(weather.temp) + "&deg";
  document.querySelector("#date").innerHTML = weather.date;
  document.querySelector("#location").innerHTML = weather.name;
  document.querySelector("#pressure").innerHTML = weather.pressure + "Pa";
  document.querySelector("#windSpeed").innerHTML = `${weather.windSpeed}m/s`;
  document.querySelector("#humidity").innerHTML = `${weather.humidity}%`;
  document.querySelector("#visibility").innerHTML =
    weather.visibility + "km" || "--";
  document.querySelector("#feelsLike").innerHTML =
    weather.feelslike + "&deg" || "--";
  document.querySelector("#windDirection").innerHTML =
    weather.windDirection + "&deg" || "--";
  document.querySelector("#windGust").innerHTML = weather.windGust || "--";
  document.querySelector("#sunrise").innerHTML = weather.sunrise || "--";
  document.querySelector("#sunset").innerHTML = weather.sunset || "--";
  document.querySelector(
    "#weatherIcon"
  ).src = `https://openweathermap.org/img/w/${weather.icon}.png`;
}

function searchCity(event) {
  if (event.key === "Enter") {
    searchWeather();
  }
}

async function searchWeather() {
  const cityInput = document.querySelector("#searchbar");
  const city = cityInput.value.trim(); // Use the entered city, not the default

  if (city !== "") {
    if (navigator.onLine) {
      fetchData(city); // Use the entered city here as well
    } else {
      // If offline, fetch from local storage
      const cachedWeatherData = localStorage.getItem(city);
      if (cachedWeatherData) {
        const weather = JSON.parse(cachedWeatherData);
        InsertWeatherData(weather);
      } else {
        console.error("City data not available offline.");
      }
    }
  } else {
    console.error("City name is empty.");
  }

  cityInput.value = "";
}

async function fetchData(city_name) {
  try {
    const apiKey = "cae6201b6cd9ee700bf84977a25d1c63";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city_name}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      error.classList.remove("hide");
      group.forEach((node) => node.classList.add("hide"));
    } else {
      error.classList.add("hide");
      group.forEach((node) => node.classList.remove("hide"));

      const { main, wind, weather, visibility, sys } = await response.json();
      console.log("Received Data:", { main, wind, weather, visibility, sys });

      const currentDate = new Date();
      const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
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
        visibility: visibility ? visibility / 1000 : undefined,
        feelslike: main.feels_like,
        windDirection: wind.deg,
        windGust: wind.gust,
        sunrise:
          sys && sys.sunrise
            ? new Date(sys.sunrise * 1000).toLocaleTimeString("en-US")
            : undefined,
        sunset:
          sys && sys.sunset
            ? new Date(sys.sunset * 1000).toLocaleTimeString("en-US")
            : undefined,
      };

      InsertWeatherData(weatherData);

      // Store weather data for the current city in local storage
      const storedData = localStorage.getItem(city_name) || "[]";
      const data1 = JSON.parse(storedData);
      data1.unshift(weatherData); // Add new data to the beginning of the array
      localStorage.setItem(city_name, JSON.stringify(data1));
    }
  } catch (error) {
    console.error(error);
    error.classList.remove("hide");
    group.forEach((node) => node.classList.add("hide"));
    alert(
      "An error occurred while fetching weather data. Please try again later."
    );
  }
}

// Fetch weather data for the default city
fetchData(city_name);

const cachedWeatherData = localStorage.getItem(city_name);
if (cachedWeatherData) {
  const weather = JSON.parse(cachedWeatherData);
  InsertWeatherData(weather);
}

const cityInput = document.querySelector("#searchbar");
cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchWeather();
  }
});

async function pastWeatherData() {
  try {
    let url2 = `http://prajwallimbuweatherapp.free.nf/main.php?city_name=${city_name}`;
    document.querySelector("#title").innerText = city_name + " Past Weather";

    let response2 = await fetch(url2);

    if (!response2.ok) {
      throw new Error(`HTTP error! status: ${response2.status}`);
    } else {
      let data2 = await response2.json();
      let weekBoxHTML = "";
      data2.reverse();
      console.log(data2);
      localStorage.setItem("pastData", JSON.stringify(data2));

      for (let i = 0; i < data2.length; i++) {
        const weather = data2[i];
        const iconCode = data2[i].Weather_Icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
        weekBoxHTML += `
                <div class="week-box">
                    <div class ="past_weather_box">
                        <div class="date">${weather.Day_and_Date}</div>
                        <div class="past_weather_info">
                            <span class="past_infos">${weather.Day_of_Week}</span>
                            <span><img alt="${weather.description}icon" id="weather_icon" src="${iconUrl}" height="100"></span>
                            <span class="past_infos">${weather.Temperature}°</span>
                            <span class="past_infos">Humidity:${weather.Humidity}%</span>
                            <span class="past_infos">Pressure:${weather.Pressure}Pa</span>
                            <span class="past_infos">Wind Speed:${weather.Wind_Speed}m/s</span>
                        </div>
                    </div>
                </div>
                <hr>
            `;
      }
      document.getElementById("weekContainer").innerHTML = weekBoxHTML;
    }
  } catch (error) {
    console.error(error);
  }
}
pastWeatherData();
searchWeather();

