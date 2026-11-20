
const API_URL = "https://api.tvmaze.com";

// Getting HTML elements
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");
const yearFilter = document.getElementById("yearFilter");
const clearBtn = document.getElementById("clearBtn");

const showContainer = document.getElementById("showContainer");
const status = document.getElementById("status");
const resultCount = document.getElementById("resultCount");

const showModal = document.getElementById("showModal");
const closeModal = document.getElementById("closeModal");
const modalBody = document.getElementById("modalBody");

let allShows = [];

// Search shows using API
async function searchShows(searchTerm) {

    showContainer.innerHTML = "";
    resultCount.textContent = "";
    status.textContent = "Loading shows...";
    status.className = "status loading";

    try {
        const response = await fetch(
            `${API_URL}/search/shows?q=${encodeURIComponent(searchTerm)}`
        );

        if (!response.ok) {
            throw new Error("Unable to fetch shows.");
        }

        const data = await response.json();

        allShows = data.map(item => item.show);

        status.className = "status";

        displayShows();

    } catch (error) {
        allShows = [];
        showContainer.innerHTML = "";
        resultCount.textContent = "";
        status.className = "status";
        status.textContent =
            "Something went wrong. Please check your internet connection and try again.";

        console.error("API Error:", error);
    }
}

// Display shows on webpage
function displayShows() {

    showContainer.innerHTML = "";

    const selectedGenre = genreFilter.value;
    const selectedYear = yearFilter.value.trim();

    const filteredShows = allShows.filter(show => {

        const genreMatch =
            !selectedGenre || show.genres.includes(selectedGenre);

        const showYear = show.premiered
            ? show.premiered.substring(0, 4)
            : "";

        const yearMatch =
            !selectedYear || showYear === selectedYear;

        return genreMatch && yearMatch;
    });

    resultCount.textContent =
        `${filteredShows.length} show(s) found`;

    if (filteredShows.length === 0) {
        status.textContent = "No shows found. Try another search or filter.";
        return;
    }

    status.textContent = "";

    filteredShows.forEach(show => {

        const card = document.createElement("div");
        card.className = "show-card";

        const poster = document.createElement("img");
        poster.src = show.image
            ? show.image.medium
            : "https://placehold.co/300x420?text=No+Image";
        poster.alt = `${show.name} poster`;
        poster.loading = "lazy";

        const info = document.createElement("div");
        info.className = "card-info";

        const title = document.createElement("h3");
        title.textContent = show.name;

        const genre = document.createElement("p");
        genre.textContent = show.genres.length
            ? show.genres.join(", ")
            : "Genre not available";

        const rating = document.createElement("p");
        rating.className = "rating";
        rating.textContent = show.rating.average
            ? `★ ${show.rating.average}/10`
            : "Rating not available";

        const year = document.createElement("p");
        year.textContent = show.premiered
            ? `Year: ${show.premiered.substring(0, 4)}`
            : "Year: Unknown";

        const detailsBtn = document.createElement("button");
        detailsBtn.className = "details-btn";
        detailsBtn.textContent = "View Details";

        detailsBtn.addEventListener("click", () => {
            getShowDetails(show.id);
        });

        info.append(title, genre, rating, year, detailsBtn);
        card.append(poster, info);

        showContainer.appendChild(card);
    });
}

// Get complete show details
async function getShowDetails(id) {

    modalBody.textContent = "Loading details...";
    showModal.hidden = false;

    try {
        const response = await fetch(`${API_URL}/shows/${id}`);

        if (!response.ok) {
            throw new Error("Unable to load show details.");
        }

        const show = await response.json();

        modalBody.innerHTML = "";

        const title = document.createElement("h2");
        title.id = "modalTitle";
        title.textContent = show.name;

        modalBody.appendChild(title);

        if (show.image) {
            const poster = document.createElement("img");
            poster.src = show.image.medium;
            poster.alt = `${show.name} poster`;
            poster.className = "modal-poster";
            modalBody.appendChild(poster);
        }

        const details = [
            `Genres: ${show.genres.join(", ") || "Not available"}`,
            `Language: ${show.language || "Not available"}`,
            `Premiered: ${show.premiered || "Not available"}`,
            `Rating: ${show.rating.average || "Not available"}`,
            `Status: ${show.status || "Not available"}`,
            `Network: ${show.network?.name || "Not available"}`
        ];

        details.forEach(detail => {
            const paragraph = document.createElement("p");
            paragraph.textContent = detail;
            modalBody.appendChild(paragraph);
        });

        const summary = document.createElement("p");
        summary.textContent = show.summary
            ? show.summary.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
            : "No description available.";

        modalBody.appendChild(summary);

    } catch (error) {
        modalBody.textContent =
            "Unable to load details. Please try again.";

        console.error("Details Error:", error);
    }
}

// Close modal function
function closeShowModal() {
    showModal.hidden = true;
}

// Search form event
searchForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const searchTerm = searchInput.value.trim();

    if (searchTerm !== "") {
        searchShows(searchTerm);
    }
});

// Genre filter event
genreFilter.addEventListener("change", displayShows);

// Year filter event
yearFilter.addEventListener("input", displayShows);

// Clear filters and search
clearBtn.addEventListener("click", function() {

    searchInput.value = "";
    genreFilter.value = "";
    yearFilter.value = "";

    allShows = [];

    showContainer.innerHTML = "";
    resultCount.textContent = "";
    status.textContent = "Search for a TV show to get started.";

    closeShowModal();
});

// Close using cross button
closeModal.addEventListener("click", closeShowModal);

// Close by clicking outside popup
showModal.addEventListener("click", function(event) {

    if (event.target === showModal) {
        closeShowModal();
    }
});

// Close using Escape key
document.addEventListener("keydown", function(event) {

    if (event.key === "Escape" && !showModal.hidden) {
        closeShowModal();
    }
});
