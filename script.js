// API constants
const API_KEY = '9b08aedf4c4966336dd083b0bf5175fe';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const postContainer = document.getElementById('post-container');
const chooseCategory = document.getElementById('choose-category');
const movieList = document.getElementById('movie-lists');
const searchInput = document.getElementById('search');

// Overlay elements
const overlay = document.getElementById('movie-overlay');
const closeOverlay = document.getElementById('close-overlay');
const overlayImg = document.getElementById('overlay-img');
const overlayTitle = document.getElementById('overlay-title');
const overlayDescription = document.getElementById('overlay-description');

// Hamburger menu elements
const hamburger = document.querySelector(".hamburger");
const menu = document.querySelector(".nav-container");

// Navigation links
const navLinks = document.querySelectorAll('.nav-list a');

// Header sticky toggle
const header = document.querySelector('header');
const heroSection = document.querySelector('.hero-section');

function toggleStickyHeader() {
  const heroBottom = heroSection.getBoundingClientRect().bottom;
  if (heroBottom <= 0) {
    header.classList.add('sticky');
  } else {
    header.classList.remove('sticky');
  }
}

// Fetch genre map from TMDB
async function fetchGenres() {
  const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`);
  const data = await res.json();
  const genreMap = {};
  data.genres.forEach(genre => {
    genreMap[genre.id] = genre.name;
  });
  return genreMap;
}

// Function to setup click events for overlay
function setupMovieClickEvents(movieBoxes, movieDataList) {
  movieBoxes.forEach((box, index) => {
    box.addEventListener('click', () => {
      const movie = movieDataList[index];
      overlayImg.src = IMG_BASE_URL + movie.poster_path;
      overlayTitle.textContent = movie.title;
      overlayDescription.textContent = movie.overview || "No description available.";
      overlay.classList.remove('hidden');
    });
  });
}

// Close overlay
closeOverlay.addEventListener('click', () => {
  overlay.classList.add('hidden');
});

// Load general movies
async function fetchMovies() {
  try {
    const genreMap = await fetchGenres();
    const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=4`);
    const data = await res.json();

    postContainer.innerHTML = '';

    data.results.slice(0, 8).forEach(movie => {
      const { title, release_date, vote_average, poster_path, genre_ids } = movie;
      const genreNames = genre_ids.map(id => genreMap[id]).filter(Boolean);
      const genreHTML = genreNames.map(name => `<a href="#">${name}</a>`).join(', ');

      const movieHTML = `
        <div class="post-box" data-category="${genreNames.join(',').toLowerCase()}">
          <div class="post-img">
            <img src="${IMG_BASE_URL + poster_path}" alt="${title}" />
          </div>
          <div class="main-slider-text">
            <span class="quality">Full HD</span>
            <div class="bottom-text">
              <div class="movie-name">
                <span>${release_date ? release_date.split('-')[0] : 'N/A'}</span>
                <a href="#">${title}</a>
              </div>
              <div class="category-rating">
                <div class="category">${genreHTML}</div>
                <div class="rating">${vote_average.toFixed(1)} <img alt="IMDb" src="img/IMDb-icon.png" /></div>
              </div>
            </div>
          </div>
        </div>
      `;

      postContainer.innerHTML += movieHTML;
    });

    setupMovieClickEvents(postContainer.querySelectorAll('.post-box'), data.results.slice(0, 8));
  } catch (error) {
    console.error(error);
  }
}

// Load genre-based movies
async function chooseByCategory() {
  const genreMap = await fetchGenres();
  const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=3`);
  const dataResponse = await response.json();

  chooseCategory.innerHTML = ''; // Clear old content

  dataResponse.results.slice(0, 9).forEach((movie) => {
    const { title, release_date, vote_average, poster_path, genre_ids } = movie;

    const genreNames = genre_ids.map(id => genreMap[id]).filter(Boolean);
    const genreHTML = genreNames.map(name => `<a href="#">${name}</a>`).join(', ');

    const categoryMovieHtml = `
      <div class="post-box" data-category="${genreNames.join(',').toLowerCase()}">
        <div class="post-img">
          <img src="${IMG_BASE_URL + poster_path}" alt="${title}" />
        </div>
        <div class="main-slider-text">
          <span class="quality">Full HD</span>
          <div class="bottom-text">
            <div class="movie-name">
              <span>${release_date ? release_date.slice(0, 4) : 'N/A'}</span>
              <a href="#">${title}</a>
            </div>
            <div class="category-rating">
              <div class="category">${genreHTML}</div>
              <div class="rating">${vote_average.toFixed(1)}<img alt="IMDb" src="img/IMDb-icon.png" /></div>
            </div>
          </div>
        </div>
        <div class="main-slider-overlay">
          <i class="fas fa-play"></i>
        </div>
      </div>
    `;

    chooseCategory.innerHTML += categoryMovieHtml;
  });

  setupMovieClickEvents(chooseCategory.querySelectorAll('.post-box'), dataResponse.results.slice(0, 9));
}

// Filter genre movies
const movieUl = document.getElementById('movie-list');
const movieLinks = movieUl.querySelectorAll('li a');

function removeActiveLinks() {
  movieLinks.forEach(link => link.parentElement.classList.remove("active"));
}

movieLinks.forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const selectedCategory = link.getAttribute('data-category').toLowerCase();
    removeActiveLinks();
    link.parentElement.classList.add("active");

    const postBoxes = document.querySelectorAll('#genre-movies .post-box');
    postBoxes.forEach(post => {
      const categories = post.getAttribute('data-category').split(',').map(cat => cat.trim().toLowerCase());
      if (selectedCategory === 'all' || categories.includes(selectedCategory)) {
        post.classList.remove('hidden');
      } else {
        post.classList.add('hidden');
      }
    });

    // Smooth scroll to genre-movies section
    const genreSection = document.getElementById('genre-movies');
    genreSection.scrollIntoView({ behavior: 'smooth' });
  });
});

// Coming Soon Movie Carousel
async function ComingSoonMovie() {
  const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=3`);
  const dataResponse = await response.json();

  movieList.innerHTML = '';

  dataResponse.results.slice(0, 7).forEach((movie) => {
    const { title, poster_path } = movie;

    const ComingSoonHtml = `
      <div class="movie-list-item">
        <img class="movie-list-item-img" src="${IMG_BASE_URL + poster_path}" alt="${title}" />
        <span class="movie-list-item-title">${title}</span>
      </div>
    `;

    movieList.innerHTML += ComingSoonHtml;
  });
}

// Carousel Scroll Arrows
const arrows = document.querySelectorAll(".arrow");
const movieLists = document.querySelectorAll(".movie-list");

document.querySelectorAll(".arrow").forEach(arrow => {
  const movieList = arrow.closest(".movie-list-wrapper").querySelector(".movie-list");
  let clickCount = 0;

  arrow.addEventListener("click", () => {
    const items = movieList.querySelectorAll(".movie-list-item");
    const itemCount = items.length;
    const visibleItems = 4;
    const itemWidth = 325;

    clickCount++;

    if (itemCount - (visibleItems + clickCount) >= 0) {
      movieList.style.transform = `translateX(-${clickCount * itemWidth}px)`;
    } else {
      movieList.style.transform = `translateX(0px)`;
      clickCount = 0;
    }
  });
});

// Hamburger menu toggle
hamburger.addEventListener("click", () => {
  console.log("Hamburger clicked"); // Debugging
  hamburger.classList.toggle("active");
  menu.classList.toggle("active");
});

// Close menu on nav link click and update active class
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    menu.classList.remove('active');
    navLinks.forEach(l => l.parentElement.classList.remove('active'));
    link.parentElement.classList.add('active');
  });
});

// Handle window resize to reset menu state
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    hamburger.classList.remove('active');
    menu.classList.remove('active');
  }
});

// Scroll event listener for active nav link and sticky header
function handleScroll() {
  toggleStickyHeader();

  const sections = ['home', 'latest', 'genre-movies', 'coming-soon', 'about-us', 'contact-us'];
  let currentSection = '';

  sections.forEach(section => {
    const element = document.getElementById(section);
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        currentSection = section;
      }
    }
  });

  navLinks.forEach(link => {
    link.parentElement.classList.remove('active');
    if (link.getAttribute('href').slice(1) === currentSection) {
      link.parentElement.classList.add('active');
    }
  });
}

window.addEventListener('scroll', handleScroll);

// Init
fetchMovies();
chooseByCategory();
ComingSoonMovie();