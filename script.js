
const countriesContainer = document.getElementById("countries");
const searchInput = document.getElementById("search");
const regionSelect = document.getElementById("region");
const statusText = document.getElementById("status");
const retryButton = document.getElementById("retry");

let countries = [];

// Fetch countries from World Bank API
async function getCountries() {

    statusText.textContent = "Loading countries...";
    countriesContainer.innerHTML = "";
    retryButton.hidden = true;

    try {

        const response = await fetch(
            "https://api.worldbank.org/v2/country?format=json&per_page=500"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch countries");
        }

        const data = await response.json();

        if (!data || !Array.isArray(data[1])) {
            throw new Error("Invalid API response");
        }

        // Remove regional and income-level aggregates
        countries = data[1].filter(country =>
            country.region.id !== "" &&
            country.capitalCity !== ""
        );

        countries.sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        showCountries();

    } catch (error) {

        statusText.textContent =
            "Unable to load countries. Please try again.";

        retryButton.hidden = false;
        console.error(error);

    }
}

// Display countries
function showCountries() {

    const searchValue = searchInput.value.toLowerCase();
    const selectedRegion = regionSelect.value;

    const filteredCountries = countries.filter(country => {

        const matchesSearch =
            country.name.toLowerCase().includes(searchValue);

        const region = country.region.value;

        const matchesRegion =
            selectedRegion === "All" ||
            region.toLowerCase().includes(
                selectedRegion.toLowerCase()
            );

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

        const flag = country.iso2Code
            ? `https://flagcdn.com/w320/${country.iso2Code.toLowerCase()}.png`
            : "";

        card.innerHTML = `
            <img src="${flag}" alt="Country flag">

            <div class="card-info">
                <h3>${country.name}</h3>

                <p><b>Capital:</b>
                ${country.capitalCity || "Not available"}</p>

                <p><b>Region:</b>
                ${country.region.value}</p>

                <p><b>Country Code:</b>
                ${country.id}</p>
            </div>
        `;

        countriesContainer.appendChild(card);
    });
}

// Search countries
searchInput.addEventListener("input", showCountries);

// Filter countries
regionSelect.addEventListener("change", showCountries);

// Retry API request
retryButton.addEventListener("click", getCountries);

// Start application
getCountries();
