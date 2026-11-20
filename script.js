
// API configuration
const API_KEY = "YOUR_OMDB_API_KEY";
const API_URL = "https://www.omdbapi.com/";

// Get HTML elements
const searchForm = document.getElementById("searchForm");
const movieInput = document.getElementById("movieInput");
const typeFilter = document.getElementById("typeFilter");
const yearFilter = document.getElementById("yearFilter");
const clearBtn = document.getElementById("clearBtn");
const movieContainer = document.getElementById("movieContainer");
const statusText = document.getElementById("status");
const resultCount = document.getElementById("resultCount");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const movieModal = document.getElementById("movieModal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

// Store search information
let currentPage = 1;
let currentSearch = "";
let totalResults = 0;
let isLoading = false;

// Search movies
async function searchMovies(page = 1) {

    const searchTerm = movieInput.value.trim();

    if (!searchTerm) {
        showMessage("Please enter a movie name.");
        return;
    }

    if (isLoading) return;

    // Reset results for a new search
    if (page === 1) {
        currentSearch = searchTerm;
        currentPage = 1;
        movieContainer.innerHTML = "";
        resultCount.textContent = "";
    }

    isLoading = true;
    loadMoreBtn.hidden = true;
    statusText.textContent = "Searching movies...";

    try {

        let url = `${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(currentSearch)}&page=${page}`;

        // Apply type filter
        if (typeFilter.value !== "all") {
            url += `&type=${typeFilter.value}`;
        }

        // Apply year filter
        if (yearFilter.value) {
            url += `&y=${yearFilter.value}`;
        }

        // Fetch API data
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Network error. Please try again.");
        }

        const data = await response.json();

        // Check API response
        if (data.Response === "False") {

            if (page === 1) {
                movieContainer.innerHTML = "";
                showMessage(data.Error || "No movies found.");
                resultCount.textContent = "";
            }

            loadMoreBtn.hidden = true;
            return;
        }

        // Store total results
        totalResults = Number(data.totalResults);

        // Display movies
        displayMovies(data.Search);

        currentPage = page;

        const shown = movieContainer.children.length;

        resultCount.textContent =
            `${shown} of ${totalResults} results`;

        statusText.textContent = "";

        // Show load more button if results remain
        loadMoreBtn.hidden =
            shown >= totalResults || page >= 10;

    } catch (error) {

        showMessage(error.message);
        console.error("API Error:", error);

    } finally {

        isLoading = false;

    }
}

// Display movie cards
function displayMovies(movies) {

    movies.forEach(movie => {

        const card = document.createElement("div");
        card.className = "movie-card";

        const poster = document.createElement("img");

        poster.src = movie.Poster !== "N/A"
            ? movie.Poster
            : "https://placehold.co/300x450/20212a/ffffff?text=No+Poster";

        poster.alt = movie.Title + " poster";
        poster.loading = "lazy";

        const info = document.createElement("div");
        info.className = "movie-info";

        const title = document.createElement("h3");
        title.textContent = movie.Title;

        const year = document.createElement("p");
        year.textContent = "Year: " + movie.Year;

        const type = document.createElement("p");
        type.textContent = "Type: " + movie.Type;

        const button = document.createElement("button");
        button.textContent = "View Details";

        button.addEventListener("click", () => {
            getMovieDetails(movie.imdbID);
        });

        info.append(title, year, type, button);
        card.append(poster, info);

        movieContainer.appendChild(card);

    });

}

// Fetch individual movie details
async function getMovieDetails(id) {

    movieModal.hidden = false;
    modalBody.textContent = "Loading movie details...";

    try {

        const url =
            `${API_URL}?apikey=${API_KEY}&i=${encodeURIComponent(id)}&plot=full`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Unable to load movie details.");
        }

        const movie = await response.json();

        if (movie.Response === "False") {
            throw new Error(movie.Error);
        }

        // Create modal content safely
        const details = document.createElement("div");
        details.className = "modal-details";

        const poster = document.createElement("img");

        poster.src = movie.Poster !== "N/A"
            ? movie.Poster
            : "https://placehold.co/300x450/20212a/ffffff?text=No+Poster";

        poster.alt = movie.Title + " poster";

        const text = document.createElement("div");
        text.className = "modal-text";

        const heading = document.createElement("h2");
        heading.textContent = movie.Title;

        const fields = [
            "Year: " + movie.Year,
            "Genre: " + movie.Genre,
            "Director: " + movie.Director,
            "Actors: " + movie.Actors,
            "IMDb Rating: " + movie.imdbRating,
            "Runtime: " + movie.Runtime,
            "Plot: " + movie.Plot
        ];

        text.appendChild(heading);

        fields.forEach(item => {
            const p = document.createElement("p");
            p.textContent = item;
            text.appendChild(p);
        });

        details.append(poster, text);

        modalBody.replaceChildren(details);

    } catch (error) {

        modalBody.textContent =
            "Could not load details: " + error.message;

        console.error(error);

    }
}

// Show messages
function showMessage(message) {

    statusText.textContent = message;
}

// Search form event
searchForm.addEventListener("submit", function(event) {

    event.preventDefault();
    searchMovies(1);

});

// Change filters and search again
typeFilter.addEventListener("change", () => {
    if (movieInput.value.trim()) {
        searchMovies(1);
    }
});

yearFilter.addEventListener("change", () => {
    if (movieInput.value.trim()) {
        searchMovies(1);
    }
});

// Clear filters
clearBtn.addEventListener("click", () => {

    typeFilter.value = "movie";
    yearFilter.value = "";

    if (movieInput.value.trim()) {
        searchMovies(1);
    } else {
        movieContainer.innerHTML = "";
        resultCount.textContent = "";
        statusText.textContent = "Search for a movie to get started.";
    }

});

// Load more movies
loadMoreBtn.addEventListener("click", () => {
    if (!isLoading) {
        searchMovies(currentPage + 1);
    }
});

// Close modal
closeModal.addEventListener("click", () => {
    movieModal.hidden = true;
});

// Close modal by clicking outside
movieModal.addEventListener("click", (event) => {
    if (event.target === movieModal) {
        movieModal.hidden = true;
    }
});

// Close modal using Escape key
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        movieModal.hidden = true;
    }
});

// Initial message
showMessage("Search for your favourite movie!");
