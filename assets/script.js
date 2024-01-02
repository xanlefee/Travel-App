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
}

// Function to capitalize first letter of a string (used for Weather descriptions)
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
}

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

  // Fetch event data from the API
  fetch(eventsQueryURL)
    .then(response => response.json())
    .then(data => {
      $("#event").empty(); 
      if (data._embedded && Array.isArray(data._embedded.events)) {
        $("#event").append(generateEventCards(data._embedded.events));
      } else {
        $("#event").append("<p>No Events Found</p>");
      }
    })
    .catch(error => console.error('Error:', error));

  // Fetch weather data from the API
  fetch(weatherQueryURL)
    .then(response => response.json())
    .then(data => {
      const forecastDays = data.list.filter(forecast => 
        forecast.dt_txt.includes("12:00:00") 
      ).slice(0, 5); 
  
      const forecastContainer = $('#forecast');
      forecastContainer.empty();
      
      forecastDays.forEach(day => {
        const date = day.dt_txt.split(' ')[0];
        const temperature = (day.main.temp - 273.15).toFixed(2);
        const weatherDesc = capitalizeFirstLetter(day.weather[0].description);
        const weatherIcon = day.weather[0].icon;
    
        const forecastCard = $('<div class="weather-card forecast-weather-card"></div>'); 
        forecastCard.html(`
          <h6>${date}</h6>
          <img src="https://openweathermap.org/img/wn/${weatherIcon}.png" alt="${weatherDesc}">
          <p>${temperature}°C</p>
          <p>${weatherDesc}</p>
        `);

        forecastContainer.append(forecastCard);
    })
    .catch(error => console.error('Error:', error));
});
});

// Event listener that clears the local storage and empty the button view when "Clear History" is clicked
$("#clear-history").click(function(){
  localStorage.clear();
  $("#buttons-view").empty();
});

// Event listener that, when a city button is clicked, fetches and displays the weather and event data for that city
$('#buttons-view').on('click', 'button', function () {
  const cityChoice = $(this).attr("data-name");
  
  const eventsQueryURL = `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=GB&apikey=${apiKey2}&city=${cityChoice}&locale=en-GB`;
  const weatherQueryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityChoice}&appid=${apiKey}`;

  fetch(eventsQueryURL)
    .then(response => response.json())
    .then(data => {
      $("#event").empty(); 
      if (data._embedded && Array.isArray(data._embedded.events)) {
        $("#event").append(generateEventCards(data._embedded.events));
      } else {
        $("#event").append("<p>No Events Found</p>");
      }
    })
    .catch(error => console.error('Error:', error));

    fetch(weatherQueryURL)
  .then(response => response.json())
  .then(data => {
    const forecastDays = data.list.filter(forecast => 
      forecast.dt_txt.includes("12:00:00") 
    ).slice(0, 5); 
 
    const forecastContainer = $('#forecast');
    forecastContainer.empty();
    
    forecastDays.forEach(day => {
      const date = day.dt_txt.split(' ')[0];
      const temperature = (day.main.temp - 273.15).toFixed(2);
      const weatherDesc = capitalizeFirstLetter(day.weather[0].description);
      const weatherIcon = day.weather[0].icon;
  
      const forecastCard = $('<div class="weather-card forecast-weather-card"></div>'); 
      forecastCard.html(`
        <h6>${date}</h6>
        <img src="https://openweathermap.org/img/wn/${weatherIcon}.png" alt="${weatherDesc}">
        <p>${temperature}°C</p>
        <p>${weatherDesc}</p>
      `);
  
      forecastContainer.append(forecastCard);
    });
  })
.catch(error => console.error('Error:', error));
  }); 
  
  renderButtons();