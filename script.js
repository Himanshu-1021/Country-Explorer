
const countriesContainer = document.getElementById("countries");
const searchInput = document.getElementById("search");
const regionSelect = document.getElementById("region");
const statusText = document.getElementById("status");
const retryButton = document.getElementById("retry");

let countries = [];

// Fetch countries from API
async function getCountries() {

    statusText.textContent = "Loading countries...";
    countriesContainer.innerHTML = "";
    retryButton.hidden = true;

    try {
        const response = await fetch(
            "https://restcountries.com/v3.1/all?fields=name,capital,region,population,flags,cca3"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch countries");
        }

        countries = await response.json();

        countries.sort((a, b) =>
            a.name.common.localeCompare(b.name.common)
        );

        showCountries();

    } catch (error) {

        statusText.textContent =
            "Something went wrong! Please check your internet connection.";

        retryButton.hidden = false;
        console.log(error);
    }
}

// Display countries
function showCountries() {

    const searchValue = searchInput.value.toLowerCase();
    const selectedRegion = regionSelect.value;

    const filteredCountries = countries.filter(country => {

        const matchesSearch =
            country.name.common.toLowerCase().includes(searchValue);

        const matchesRegion =
            selectedRegion === "All" ||
            country.region === selectedRegion;

        return matchesSearch && matchesRegion;
    });

    countriesContainer.innerHTML = "";

    statusText.textContent =
        filteredCountries.length + " countries found";

    if (filteredCountries.length === 0) {
        statusText.textContent = "No countries found!";
        return;
    }

    filteredCountries.forEach(country => {

        const card = document.createElement("div");
        card.className = "card";

        const capital = country.capital
            ? country.capital.join(", ")
            : "Not available";

        const flag = country.flags?.png || "";

        card.innerHTML = `
            <img src="${flag}" alt="Flag of ${country.name.common}">

            <div class="card-info">
                <h3>${country.name.common}</h3>

                <p><b>Capital:</b> ${capital}</p>

                <p><b>Region:</b> ${country.region}</p>

                <p><b>Population:</b>
                ${country.population.toLocaleString("en-IN")}</p>
            </div>
        `;

        countriesContainer.appendChild(card);
    });
}

// Search countries
searchInput.addEventListener("input", showCountries);

// Filter by region
regionSelect.addEventListener("change", showCountries);

// Retry if API fails
retryButton.addEventListener("click", getCountries);

// Start application
getCountries();
