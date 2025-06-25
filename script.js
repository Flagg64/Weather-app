const apiKey = "08a08fe2089f9f3f9384af301e350c94";

let unit = localStorage.getItem("unit") || "metric";
const unitSwitch = document.getElementById("unitSwitch");
const toggleBtn = document.getElementById("themeToggle");
const rotateIcon = document.getElementById("rotateIcon");

window.onload = () => {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    rotateIcon.textContent = "☀️";
    toggleBtn.lastChild.textContent = " Toggle Light Mode";
  }

  unitSwitch.checked = unit === "imperial";

  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    document.getElementById("cityInput").value = lastCity;
    getWeather();
  }
};

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");

  // Update only emoji and text without overwriting entire button
  rotateIcon.textContent = isDark ? "☀️" : "🌙";
  toggleBtn.lastChild.textContent = isDark ? " Toggle Light Mode" : " Toggle Dark Mode";

  localStorage.setItem("theme", isDark ? "dark" : "light");

  // Animate the emoji icon
  rotateIcon.classList.add("animate-flipBounce");
  setTimeout(() => rotateIcon.classList.remove("animate-flipBounce"), 600);
});

unitSwitch.addEventListener("change", () => {
  unit = unitSwitch.checked ? "imperial" : "metric";
  localStorage.setItem("unit", unit);

  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    document.getElementById("cityInput").value = lastCity;
    getWeather();
  }
});

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
  }, () => {
    alert("Location permission denied.");
  });
}

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

  weatherDiv.classList.remove("visible");
  void weatherDiv.offsetWidth;
  weatherDiv.classList.add("visible");

  const iconImg = document.getElementById("weatherIcon");
  iconImg.onload = () => iconImg.classList.add("loaded");

  function showRain() {
  const rainContainer = document.querySelector(".rain");
  rainContainer.innerHTML = ""; // clear previous drops

  const dropCount = 100;

  for (let i = 0; i < dropCount; i++) {
    const drop = document.createElement("div");
    drop.className = "rain-drop";

    const delay = Math.random() * 2; // seconds
    const duration = 1 + Math.random() * 1.5; // seconds
    const left = Math.random() * 100; // percent

    drop.style.left = `${left}%`;
    drop.style.animationDelay = `${delay}s`;
    drop.style.animationDuration = `${duration}s`;

    rainContainer.appendChild(drop);
  }
}

if (data.weather[0].main.toLowerCase().includes("rain")) {
  showRain();
} else {
  document.querySelector(".rain").innerHTML = "";
}

}
