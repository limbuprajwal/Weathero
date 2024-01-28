// Student Name: Prajwal Limbu
// Student ID: 2408429

let weatherData; //weatherData variable in the global scope

//this function handles city search on keydown
function searchCity(event) {
  if (event.key === "Enter") {
    const userInput = document.getElementById("searchbar").value;
    //this is to call a function to update weather data based on user input
    updateWeatherData(userInput);
  }
}

// this function is to update weather data based on the city
function updateWeatherData(city) {
  const apiKey = "cae6201b6cd9ee700bf84977a25d1c63"; // my personal api key which i got from OpenWeatherApi
  const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  //the url from where we retreive weatherData remains the same so we use constant variable declaration//
  fetch(weatherApiUrl) //fetching weather api
    .then((res) => res.json()) //retrives the data from array of the json file
    .then((data) => {
      weatherData = data;
      const { lat, lon } = weatherData.coord; //taking co-ordinates from weather data

      //using latitude and longitude of the userinput city to fetch wind data
      const windApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
      return fetch(windApiUrl);
    })
    .then((res) => res.json()) //retrives the data from array of the json file
    .then((windData) => {
      updateUI(windData);
    })
    .catch((error) => {
      console.error("Error fetching data:", error.message); //gives error fetching wind data when there is error in with windapi
    });
}
//updateUI updates the HTML elements with the received data from the api
function updateUI(windData) {
  // For temperature
  document.getElementById(
    "temperature"
  ).innerHTML = `${weatherData.main.temp}°C`; //updates the temperature received from the api

  //For weather description and icon
  const weatherDescription = weatherData.weather[0].description; //weather status
  const weatherIcon = weatherData.weather[0].icon; //weather description ko icon
  document.getElementById("weatherStatus").innerHTML = weatherDescription; // updates weather status in the UI
  document.getElementById(
    "weatherIcon"
  ).src = `https://openweathermap.org/img/w/${weatherIcon}.png`;

  //For date and day
  const currentDate = new Date();
  document.getElementById("date").innerHTML = currentDate.toDateString();

  //For location
  document.getElementById("location").innerHTML = weatherData.name;

  //For sunrise and sunset information
  document.getElementById("sunrise").innerHTML = convertUnixTimestamp(
    weatherData.sys.sunrise
  );
  document.getElementById("sunset").innerHTML = convertUnixTimestamp(
    weatherData.sys.sunset
  );

  //For weather highlights
  document.getElementById(
    "humidity"
  ).innerHTML = `${weatherData.main.humidity}%`;
  document.getElementById(
    "pressure"
  ).innerHTML = `${weatherData.main.pressure}hPa`;
  document.getElementById("visibility").innerHTML = `${
    weatherData.visibility / 1000
  }km`;
  document.getElementById(
    "feelsLike"
  ).innerHTML = `${weatherData.main.feels_like}°C`;

  ///For wind information
  if (windData.wind) {
    document.getElementById(
      "windSpeed"
    ).innerHTML = `${windData.wind.speed} m/s`;
    document.getElementById(
      "windDirection"
    ).innerHTML = `${windData.wind.deg}°`;
    document.getElementById("windGust").innerHTML = `${windData.wind.gust} m/s`;
  } else {
    console.error("Wind data not available.");
  }
}

//this function to converts Unix timestamp to formatted time (HH:mm)
function convertUnixTimestamp(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Initial call to fetch data for the default city (Haridwar)
updateWeatherData("Haridwar");
