
let unit = localStorage.getItem("unit") || "metric"; // Default to Celsius
const unitSwitch = document.getElementById("unitSwitch");

// Set switch on load
window.onload = () => {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    document.getElementById("themeToggle").textContent = "☀️ Toggle Light Mode";
  }

  unitSwitch.checked = unit === "imperial";
};
async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
if (!city) return;
localStorage.setItem("lastCity", city);
  const apiKey = "08a08fe2089f9f3f9384af301e350c94"; // keep your actual key here
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("API response:", data); // for debugging

    if (data.cod === 200) {
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
      document.getElementById("weatherResult").innerHTML = result;

      // Add animation once image loads
      const iconImage = document.getElementById("weatherIcon");
      iconImage.onload = () => iconImage.classList.add("loaded");
    } else {
      document.getElementById("weatherResult").innerText = `Error: ${data.message}`;
    }
  } catch (error) {
    document.getElementById("weatherResult").innerText = "Error fetching data.";
    console.error("Fetch error:", error);
  }
}
async function getWeatherByLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const apiKey = "08a08fe2089f9f3f9384af301e350c94";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.cod === 200) {
        document.getElementById("cityInput").value = data.name;
        localStorage.setItem("lastCity", data.name);

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
        document.getElementById("weatherResult").innerHTML = result;

        const iconImg = document.getElementById("weatherIcon");
        iconImg.onload = () => iconImg.classList.add("loaded");
      } else {
        document.getElementById("weatherResult").innerText = "Unable to get weather.";
      }
    } catch (error) {
      console.error("Geolocation fetch failed:", error);
      document.getElementById("weatherResult").innerText = "Error getting weather.";
    }
  }, () => {
    alert("Permission to access location was denied.");
  });
}
const toggleBtn = document.getElementById("themeToggle");

// Load theme from localStorage when the page starts
window.onload = () => {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    toggleBtn.textContent = "☀️ Toggle Light Mode";
  }
  const lastCity = localStorage.getItem("lastCity");
if (lastCity) {
  document.getElementById("cityInput").value = lastCity;
  getWeather();
}
};

// Toggle dark/light mode and save to localStorage
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  const isDark = document.body.classList.contains("dark-mode");
  toggleBtn.textContent = isDark ? "☀️ Toggle Light Mode" : "🌙 Toggle Dark Mode";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

unitSwitch.addEventListener("change", () => {
  unit = unitSwitch.checked ? "imperial" : "metric";
  localStorage.setItem("unit", unit);

  // If there's a last city, re-fetch the weather
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    document.getElementById("cityInput").value = lastCity;
    getWeather();
  }
});;