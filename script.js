
// =====================================
// SHOW EXPLORER - TVMAZE API
// =====================================

// API URL
const API_URL = "https://api.tvmaze.com";

// Get HTML elements
const searchForm = document.getElementById("searchForm");
const movieInput = document.getElementById("movieInput");
const typeFilter = document.getElementById("typeFilter");
const yearFilter = document.getElementById("yearFilter");

const clearBtn = document.getElementById("clearBtn");
const movieContainer = document.getElementById("movieContainer");
const statusText = document.getElementById("status");
const resultCount = document.getElementById("resultCount");

const movieModal = document.getElementById("movieModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

// Store API data
let allShows = [];
let requestNumber = 0;

// =====================================
// SEARCH SHOWS USING API
// =====================================

async function searchShows() {

    const searchTerm = movieInput.value.trim();

    if (searchTerm === "") {
        showMessage("Please enter a show name.");
        return;
    }

    // Prevent older requests from overwriting newer results
    const thisRequest = ++requestNumber;

    movieContainer.innerHTML = "";
    resultCount.textContent = "";

    showMessage("Searching shows...");

    try {

        // Create API URL
        const url = `${API_URL}/search/shows?q=${encodeURIComponent(searchTerm)}`;

        // Fetch data
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Unable to connect to the API.");
        }

        // Convert response into JSON
        const data = await response.json();

        if (thisRequest !== requestNumber) return;

        allShows = data.map(item => item.show);

        // Apply filters
        displayShows();

    } catch (error) {

        if (thisRequest !== requestNumber) return;

        showMessage(
            "Something went wrong. Please check your internet connection."
        );

        console.error("API Error:", error);

    }
}

// =====================================
// FILTER AND DISPLAY SHOWS
// =====================================

function displayShows() {

    movieContainer.innerHTML = "";

    const selectedGenre = typeFilter.value;
    const selectedYear = yearFilter.value.trim();

    // Filter shows
    const filteredShows = allShows.filter(show => {

        const matchesGenre =
            selectedGenre === "all" ||
            show.genres.includes(selectedGenre);

        const releaseYear = show.premiered
            ? show.premiered.substring(0, 4)
            : "";

        const matchesYear =
            selectedYear === "" ||
            releaseYear === selectedYear;

        return matchesGenre && matchesYear;

    });

    // Show result count
    resultCount.textContent =
        `${filteredShows.length} results found`;

    if (filteredShows.length === 0) {

        showMessage("No shows found. Try another search or filter.");
        return;

    }

    showMessage("");

    // Create show cards
    filteredShows.forEach(show => {

        const card = document.createElement("div");
        card.className = "movie-card";

        // Poster
        const poster = document.createElement("img");

        poster.src = show.image
            ? show.image.medium
            : "https://placehold.co/300x450/20212a/ffffff?text=No+Poster";

        poster.alt = show.name + " poster";
        poster.loading = "lazy";

        // Show information
        const info = document.createElement("div");
        info.className = "movie-info";

        const title = document.createElement("h3");
        title.textContent = show.name;

        const year = document.createElement("p");

        year.textContent = "Year: " +
            (show.premiered
                ? show.premiered.substring(0, 4)
                : "Unknown");

        const genre = document.createElement("p");

        genre.textContent = "Genre: " +
            (show.genres.length
                ? show.genres.slice(0, 2).join(", ")
                : "Not available");

        const rating = document.createElement("p");

        rating.textContent = "Rating: " +
            (show.rating && show.rating.average !== null
                ? show.rating.average + "/10"
                : "Not available");

        // Details button
        const detailsButton = document.createElement("button");

        detailsButton.textContent = "View Details";

        detailsButton.addEventListener("click", () => {
            getShowDetails(show.id);
        });

        info.append(
            title,
            year,
            genre,
            rating,
            detailsButton
        );

        card.append(poster, info);

        movieContainer.appendChild(card);

    });

}

// =====================================
// FETCH INDIVIDUAL SHOW DETAILS
// =====================================

async function getShowDetails(id) {

    movieModal.hidden = false;

    modalBody.textContent = "Loading show details...";

    try {

        const response = await fetch(
            `${API_URL}/shows/${id}`
        );

        if (!response.ok) {
            throw new Error("Unable to load show details.");
        }

        const show = await response.json();

        // Create modal elements
        const details = document.createElement("div");
        details.className = "modal-details";

        // Show poster
        const poster = document.createElement("img");

        poster.src = show.image
            ? show.image.medium
            : "https://placehold.co/300x450/20212a/ffffff?text=No+Poster";

        poster.alt = show.name + " poster";

        // Show information
        const text = document.createElement("div");
        text.className = "modal-text";

        const heading = document.createElement("h2");

        heading.textContent = show.name;

        // Remove HTML tags from API summary
        const summary = show.summary
            ? show.summary.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
            : "Description not available.";

        const fields = [
            "Language: " + (show.language || "Unknown"),
            "Genre: " + (show.genres.join(", ") || "Unknown"),
            "Status: " + (show.status || "Unknown"),
            "Premiered: " + (show.premiered || "Unknown"),
            "Rating: " + (
                show.rating && show.rating.average !== null
                    ? show.rating.average + "/10"
                    : "Not available"
            ),
            "Runtime: " + (show.averageRuntime || "Unknown") + " minutes",
            "Summary: " + summary
        ];

        text.appendChild(heading);

        fields.forEach(item => {

            const paragraph = document.createElement("p");

            paragraph.textContent = item;

            text.appendChild(paragraph);

        });

        details.append(poster, text);

        modalBody.replaceChildren(details);

    } catch (error) {

        modalBody.textContent =
            "Unable to load details. Please try again.";

        console.error("Details Error:", error);

    }

}

// =====================================
// DISPLAY MESSAGES
// =====================================

function showMessage(message) {

    statusText.textContent = message;

}

// =====================================
// EVENT LISTENERS
// =====================================

// Search button
searchForm.addEventListener("submit", function(event) {

    event.preventDefault();

    searchShows();

});

// Genre filter
typeFilter.addEventListener("change", displayShows);

// Year filter
yearFilter.addEventListener("input", displayShows);

// Clear filters
clearBtn.addEventListener("click", function() {

    typeFilter.value = "all";
    yearFilter.value = "";

    movieInput.value = "";

    allShows = [];

    movieContainer.innerHTML = "";

    resultCount.textContent = "";

    showMessage("Search for your favourite TV show!");

});

// Close modal
closeModal.addEventListener("click", function() {

    movieModal.hidden = true;

});

// Close modal by clicking outside
movieModal.addEventListener("click", function(event) {

    if (event.target === movieModal) {

        movieModal.hidden = true;

    }

});

// Close modal using Escape key
document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {

        movieModal.hidden = true;

    }

});

// Initial message
showMessage("Search for your favourite TV show!");
