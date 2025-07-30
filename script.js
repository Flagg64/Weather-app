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
  setAmbientEffect(data.weather[0].main);

  weatherDiv.classList.remove("visible");
  void weatherDiv.offsetWidth;
  weatherDiv.classList.add("visible");

  const iconImg = document.getElementById("weatherIcon");
  iconImg.onload = () => iconImg.classList.add("loaded");

  updateRadar(data.coord.lat, data.coord.lon, data.weather[0].main);
}

function setAmbientEffect(type) {
  // Hide all
  ["cloudEffect", "rainEffect", "snowEffect", "sunnyEffect"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  const lower = type.toLowerCase();
  if (lower.includes("thunderstorm")) {
    startClouds("storm");
    startRain();
    document.getElementById("cloudEffect").style.display = "block";
    document.getElementById("rainEffect").style.display = "block";
    startLightning(); // optional
  } else if (lower.includes("rain")) {
    startClouds("rain");
    document.getElementById("cloudEffect").style.display = "block";
    document.getElementById("rainEffect").style.display = "block";
    startRain();
  } else if (lower.includes("cloud") || lower.includes("overcast")) {
    startClouds("cloudy");
    document.getElementById("cloudEffect").style.display = "block";
  } else if (lower.includes("snow")) {
    document.getElementById("snowEffect").style.display = "block";
    startSnow();
  } else if (lower.includes("clear") || lower.includes("sun")) {
    document.getElementById("sunnyEffect").style.display = "block";
  }
}

function startSnow() {
  const container = document.getElementById("snowEffect");
  if (!container) return;

  container.innerHTML = "";
  for (let i = 0; i < 50; i++) {
    const snow = document.createElement("div");
    snow.classList.add("snowflake");
    snow.textContent = "❄";
    snow.style.left = `${Math.random() * 100}vw`;
    snow.style.fontSize = `${Math.random() * 10 + 10}px`;
    snow.style.animationDuration = `${Math.random() * 3 + 2}s`;
    snow.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(snow);
  }
}

function startRain() {
  const container = document.getElementById("rainEffect");
  if (!container) return;

  container.innerHTML = "";
  for (let i = 0; i < 100; i++) {
    const drop = document.createElement("div");
    drop.classList.add("raindrop");

    drop.style.left = `${Math.random() * 100}vw`;

    // Random top position, so some drops are mid-air
    drop.style.top = `-${Math.random() * 100}vh`;

    // No animation delay, all fall immediately
    drop.style.animationDuration = `${Math.random() * 0.5 + 0.3}s`;

    container.appendChild(drop);
  }
}

function startClouds(type = "cloudy") {
  const container = document.getElementById("cloudEffect");
  container.innerHTML = "";

  const cloudCount = 5;

  for (let i = 0; i < cloudCount; i++) {
    const wrapper = document.createElement("div");
    wrapper.className = "cloud-wrapper";
    wrapper.style.top = `${Math.random() * 50}vh`;
    wrapper.style.left = `-${200 + i * 100}px`;
    wrapper.style.animationDuration = `${40 + i * 10}s`;

    const cloud = document.createElement("div");
    cloud.className = "cloud";

    if (type === "rain") {
      cloud.classList.add("rain-cloud");
    } else if (type === "storm") {
      cloud.classList.add("storm-cloud");
    }

    const large = document.createElement("div");
    large.className = "circle large";
    const medium = document.createElement("div");
    medium.className = "circle medium";
    const small = document.createElement("div");
    small.className = "circle small";

    cloud.appendChild(large);
    cloud.appendChild(medium);
    cloud.appendChild(small);
    wrapper.appendChild(cloud);
    container.appendChild(wrapper);
  }

  container.style.display = "block";
}

function startLightning() {
  const lightning = document.getElementById("lightningEffect");

  function flash() {
    // Flash the background
    lightning.style.animation = "none";
    void lightning.offsetWidth;
    lightning.style.animation = "flash 0.3s ease";

    // Create a bolt
    const bolt = document.createElement("div");
    bolt.classList.add("lightning-bolt");
    bolt.style.left = `${Math.random() * 80 + 10}vw`; // between 10% and 90% of screen
    bolt.style.top = `${Math.random() * 40 + 10}vh`; // top 10–50%

    lightning.appendChild(bolt);

    // Remove bolt after animation
    setTimeout(() => bolt.remove(), 300);

    // Next lightning strike
    const delay = Math.random() * 5000 + 2000; // 2–7 seconds
    setTimeout(flash, delay);
  }

  flash();
}

async function getRadarCoordinates() {
  const city = document.getElementById("radarCityInput").value.trim();
  if (!city) return;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.cod === 200) {
      const lat = data.coord.lat;
      const lon = data.coord.lon;
      document.getElementById("radarFrame").src =
        `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=7&level=radar&overlay=radar`;
    } else {
      alert("City not found.");
    }
  } catch (error) {
    alert("Failed to load radar.");
    console.error(error);
  }
}

function updateRadar(lat, lon, weatherType) {
  const overlay = determineOverlay(weatherType);
  const radarUrl = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=9&level=surface&overlay=${overlay}&menu=&message=true`;

  const frame = document.getElementById("radarFrame");
  if (frame) {
    frame.src = radarUrl;
  }
}

function determineOverlay(weatherType) {
  const type = weatherType.toLowerCase();
  if (type.includes("rain") || type.includes("drizzle") || type.includes("thunder")) {
    return "rain";
  } else if (type.includes("snow")) {
    return "snow";
  } else if (type.includes("cloud") || type.includes("overcast")) {
    return "clouds";
  } else if (type.includes("wind")) {
    return "wind";
  } else if (type.includes("fog") || type.includes("mist") || type.includes("haze")) {
    return "fog";
  } else {
    return "temp"; // default to temperature
  }
}

function setOverlay(type) {
  const iframe = document.getElementById("radarFrame");
  const url = new URL(iframe.src);

  url.searchParams.set("overlay", type);

  // Optional: keep current lat/lon if already set
  const lat = url.searchParams.get("lat") || "40.7";
  const lon = url.searchParams.get("lon") || "-74.0";
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lon);
  url.searchParams.set("detailLat", lat);
  url.searchParams.set("detailLon", lon);

  iframe.src = url.toString();
}
