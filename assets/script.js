// Define the API keys
const apiKey = "947c7ef8f4775424300be7866e5163a0";
const apiKey2 = "8S0LAjCe1DJJvedyTZ8puLytZGAPDGGy";

// Function to render buttons for each city stored in local storage
const renderButtons = function() {
  const cityData = JSON.parse(localStorage.getItem("City")) || [];
  $("#buttons-view").empty();

  cityData.forEach(city => {
    // Creates a new button for each city
    const btnCity = $("<button>")
      .addClass("City")
      .attr("data-name", city)
      .text(city.charAt(0).toUpperCase() + city.slice(1));

    $("#buttons-view").append(btnCity);
  });
};

// Function to capitalize first letter of a string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to create multiple event cards using data fetched from the API
function generateEventCards(events) {
  let eventHTML = events.map((event, i) => {
    return `
      <div class="card">
        <h3 class="event-name-${i}">${event.name}</h3>
        <p class="event-date-${i}">${event.dates.start.localDate}</p>
        <p class="event-time-${i}">${event.dates.start.localTime}</p>
        <a class="event-url-${i}" href="${event.url}">Event Link</a>
        <img class="event-pic-${i}" src="${event.images[0]?.url}" alt="Event Image">
      </div>`;
  }).join("");
  return eventHTML;
};

// Function to create forecast cards using data fetched from the API
function generateForecastCards(day) { 
  const date = day.dt_txt.split(' ')[0];
  const temperature = (day.main.temp - 273.15).toFixed(2);
  const weatherDesc = capitalizeFirstLetter(day.weather[0].description);
  const weatherIcon = day.weather[0].icon;

  const forecastHTML = `
    <div class="weather-card forecast-weather-card">
      <h6>${date}</h6>
      <img src="https://openweathermap.org/img/wn/${weatherIcon}.png" alt="${weatherDesc}">
      <p>${temperature}°C</p>
      <p>${weatherDesc}</p>
    </div>`;
  
  return forecastHTML;
};

// Event listener that triggers when the Search button is clicked
$("#search-button").click(function(event) {
  event.preventDefault();

  // Gets the city name from the input field
  const city = $("#search-input").val();
  
  const eventsQueryURL = `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=GB&apikey=${apiKey2}&city=${city}&locale=en-GB`;
  const weatherQueryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

  let cityWeatherArray = JSON.parse(localStorage.getItem("City")) || [];

  // If the city name doesn't already exist in the array, add it, then render the new set of buttons
  if (!cityWeatherArray.includes(city)) { 
    cityWeatherArray.push(city);
    localStorage.setItem("City", JSON.stringify(cityWeatherArray));
    renderButtons();
    $("#search-input").val('');
  }

  // Fetch data from the API, and create cards for the event and the forecast
  fetch(eventsQueryURL)
    .then(response => response.json())
    .then(data => {
      $("#event").empty(); 
      if (data._embedded && Array.isArray(data._embedded.events)) {
        let eventHTML = generateEventCards(data._embedded.events);
        $("#event").append(eventHTML);
      } else {
        $("#event").append("<p>No Events Found</p>");
      }
    })
    .catch(error => console.error('Error:', error));

  fetch(weatherQueryURL)
    .then(response => response.json())
    .then(data => {
      let weatherArray = data.list.filter(obj => obj.dt_txt.includes("12:00:00")).slice(0, 5);
      // Empty the forecast container and generate forecast cards for each element in the array
      $("#forecast").empty();
      weatherArray.forEach(day => {
        let forecastHTML = generateForecastCards(day);
        $("#forecast").append(forecastHTML);
      });
    })
    .catch(error => console.error('Error:', error));
});

// Event listener that clears the local storage and empty the button view when "Clear History" is clicked
$("#clear-history").click(function(){
  localStorage.clear();
  $("#buttons-view").empty();
});

// Event listener to fetch weather and events data when a city button is clicked
$('#buttons-view').on('click', 'button', function () {
  const cityChoice = $(this).attr("data-name");
  
  const eventsQueryURL = `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=GB&apikey=${apiKey2}&city=${cityChoice}&locale=en-GB`;
  const weatherQueryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityChoice}&appid=${apiKey}`;

  // Fetch event data from the API and create cards
  fetch(eventsQueryURL)
    .then(response => response.json())
    .then(data => {
      $("#event").empty();
      if (data._embedded && Array.isArray(data._embedded.events)) {
        let eventHTML = generateEventCards(data._embedded.events);
        $("#event").append(eventHTML);
      } else {
        $("#event").append("<p>No Events Found</p>");
      }
    })
    .catch(error => console.error('Error:', error));

  // Fetch weather data from the API and create forecast cards
  fetch(weatherQueryURL)
    .then(response => response.json())
    .then(data => {
      let weatherArray = data.list.filter(obj => obj.dt_txt.includes("12:00:00")).slice(0, 5);
      $("#forecast").empty();
      weatherArray.forEach(day => {
        let forecastHTML = generateForecastCards(day);
        $("#forecast").append(forecastHTML);
      });
    })
    .catch(error => console.error('Error:', error));
});

// Call the renderButtons function to display buttons for already searched cities from local storage
renderButtons();