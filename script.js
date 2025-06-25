const apiKey = "08a08fe2089f9f3f9384af301e350c94";

let unit = localStorage.getItem("unit") || "metric";
const unitSwitch = document.getElementById("unitSwitch");

// Theme setup
const toggleBtn = document.getElementById("themeToggle");
window.onload = () => {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    toggleBtn.textContent = "☀️ Toggle Light Mode";
  }

  unitSwitch.checked = unit === "imperial";

  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    document.getElementById("cityInput").value = lastCity;
    getWeather();
  }
};

// Theme toggle
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  toggleBtn.textContent = isDark ? "☀️ Toggle Light Mode" : "🌙 Toggle Dark Mode";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Unit toggle
unitSwitch.addEventListener("change", () => {
  unit = unitSwitch.checked ? "imperial" : "metric";
  localStorage.setItem("unit", unit);

  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    document.getElementById("cityInput").value = lastCity;
    getWeather();
  }
});

// Get weather by city
async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return;

  localStorage.setItem("lastCity", city);
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod === 200) {
      showWeather(data);
    } else {
      document.getElementById("weatherResult").innerText = "City not found.";
    }
  } catch (error) {
    console.error("Error fetching weather:", error);
    document.getElementById("weatherResult").innerText = "Error retrieving weather.";
  }
}

// Get weather by geolocation
async function getWeatherByLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.cod === 200) {
        document.getElementById("cityInput").value = data.name;
        localStorage.setItem("lastCity", data.name);
        showWeather(data);
      } else {
        document.getElementById("weatherResult").innerText = "Unable to get weather.";
      }
    } catch (error) {
      console.error("Geolocation fetch failed:", error);
      document.getElementById("weatherResult").innerText = "Error getting location weather.";
    }
  }, (err) => {
    alert("Location permission denied.");
  });
}

// Show weather and animate
function showWeather(data) {
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  const result = `
    <h2>${data.name}</h2>
    <img id="weatherIcon" src="${iconUrl}" alt="Weather icon" />
    <p><strong>Temperature:</strong> ${data.main.temp}°${unit === "imperial" ? "F" : "C"}</p>
    <p><strong>Weather:</strong> ${data.weather[0].main}</p>
    <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
    <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
  `;

  const weatherDiv = document.getElementById("weatherResult");
  weatherDiv.innerHTML = result;

  // Animate weather result
  weatherDiv.classList.remove("visible");
  void weatherDiv.offsetWidth; // trigger reflow
  weatherDiv.classList.add("visible");

  // Animate icon
  const iconImg = document.getElementById("weatherIcon");
  iconImg.onload = () => iconImg.classList.add("loaded");
}
