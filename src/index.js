import './css/styles.css';
import galleryTmplt from './templates/gallery-markup.hbs';
import { Notify } from 'notiflix';
import PicturesApiService from './js/pictures-Api.js';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  inputForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

refs.inputForm.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', onPicturesFetchAndMarkup);

// -----по клику на сабмит читает значение поиска, запускае фун-ю поиска и встраивания галереи---
function onFormSubmit(e) {
  e.preventDefault();

  picturesApiService.searchQuery = e.currentTarget.elements.searchQuery.value;
  console.log(picturesApiService.searchQuery);

  if (picturesApiService.searchQuery === '') {
    return Notify.failure('please enter your request');
  }

  picturesApiService.resetPage();
  clearContainer();

  onPicturesFetchAndMarkup();
  showLoadMoreBtn();
}

const picturesApiService = new PicturesApiService();
console.log('picturesApiService before build  ', picturesApiService);

// -----------находит картинки и запускает фун-ю добавления галереи------------
async function onPicturesFetchAndMarkup() {
  await picturesApiService.fetchPictures().then(appendPicturesMarkup);
}

// ------------------добавляет найденное в разметку галереи-----------
//--------проверяет нашел/не нашел/конец страницы--------
function appendPicturesMarkup(dataReceived) {
  OnInputCheck(dataReceived);

  Notify.success(`Hooray! We found ${dataReceived.totalHits} images`);
  refs.gallery.insertAdjacentHTML('beforeend', galleryTmplt(dataReceived.hits));
  //   bigPicture();
  //   smoothScroll();
  onSearchFinishCheck(dataReceived);
}

function clearContainer() {
  refs.gallery.innerHTML = '';
}

function showLoadMoreBtn() {
  refs.loadMoreBtn.classList.remove('hidden');
}

function hideLoadMoreBtn() {
  refs.loadMoreBtn.classList.add('hidden');
}

function OnInputCheck(dataReceived) {
  if (dataReceived.totalHits === 0) {
    clearContainer();
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again',
    );
  }
}

function onSearchFinishCheck(dataReceived) {
  if (
    picturesApiService.page ===
    1 + Math.ceil(dataReceived.totalHits / picturesApiService.per_page)
  ) {
    hideLoadMoreBtn();
    return Notify.warning("That's it! You've reached the end of search results");
  }
}
