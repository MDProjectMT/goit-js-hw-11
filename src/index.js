import axios from 'axios';
import Notiflix from 'notiflix';
// Opisany w dokumentacji
import SimpleLightbox from 'simplelightbox';
// Dodatkowy import stylów
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '43730025-556a074af91fe19755533a54c'; // Podmień na swój klucz do API Pixabay
const API_URL = 'https://pixabay.com/api/';
const gallery = document.querySelector('.gallery');
const lightbox = new SimpleLightbox('.gallery a', {
  /* options */
});
let currentPage = 1;
let currentQuery = '';

function searchImages(query, page = 1) {
  const params = {
    key: API_KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page,
  };
  return axios.get(API_URL, { params });
}
function createPhotoCard({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  const card = document.createElement('div');
  card.className = 'photo-card';

  card.innerHTML = `
    <a href="${webformatURL}" title="${tags}">
    <img src="${webformatURL}" alt="${tags}" loading="lazy" />
    </a>
    <div class="info">
      <p class="info-item"><b>Likes:</b> ${likes}</p>
      <p class="info-item"><b>Views:</b> ${views}</p>
      <p class="info-item"><b>Comments:</b> ${comments}</p>
      <p class="info-item"><b>Downloads:</b> ${downloads}</p>
    </div>
  `;

  return card;
}

document
  .getElementById('search-form')
  .addEventListener('submit', function (event) {
    event.preventDefault();
    const query = this.elements.searchQuery.value.trim();
    if (!query) {
      Notiflix.Notify.failure('Please enter a search term.');
      return;
    }

    currentQuery = query;
    currentPage = 1;
    searchImages(query, currentPage)
      .then(response => {
        const { hits, totalHits } = response.data;

        updateGallery(hits);
        toggleLoadMoreButton(hits.length, totalHits);
        Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
      })
      .catch(error => {
        console.error('Search failed:', error);
        Notiflix.Notify.failure('Failed to fetch images.');
      });
  });

document.querySelector('.load-more').addEventListener('click', function () {
  currentPage += 1;
  searchImages(currentQuery, currentPage)
    .then(response => {
      const { hits, totalHits } = response.data;
      updateGallery(hits, true);
      toggleLoadMoreButton(gallery.children.length, totalHits);
      if (hits.length > 0) {
        const { height: cardHeight } = document
          .querySelector('.gallery')
          .firstElementChild.getBoundingClientRect();
        alert(cardHeight);
        window.scrollBy({
          top: cardHeight * 2,
          behavior: 'smooth',
        });
      }
    })
    .catch(error => {
      console.error('Failed to load more images:', error);
      Notiflix.Notify.failure('Failed to load more images.');
    });
});

function toggleLoadMoreButton(displayedCount, totalHits) {
  const loadMoreBtn = document.querySelector('.load-more');
  if (displayedCount < totalHits) {
    loadMoreBtn.style.display = 'block';
  } else {
    loadMoreBtn.style.display = 'none';
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

function updateGallery(images, append = false) {
  const gallery = document.querySelector('.gallery');
  if (!append) {
    gallery.innerHTML = '';
  }

  images.forEach(image => {
    gallery.appendChild(createPhotoCard(image));
  });
}
