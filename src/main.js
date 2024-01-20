'use strict'

import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const form = document.querySelector('.search-form');
const galleryBox = document.querySelector('.gallery');
const loader = document.querySelector('.loader-container');
const loadMoreBtn = document.querySelector(".load-more");

const instance = axios.create({
    method: 'get',
    baseURL: 'https://pixabay.com/api/',
    params: {
        key: '41837495-d070c30be5c0243a4bb3b397a',
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
    }
});

let page = 1;
const pageOfQuery = () => {
    page++;
}

let gallery = new SimpleLightbox('.gallery a', { 
    captionsData: 'alt',
    captionDelay: 250
});

let value;

let mess;

form.addEventListener("submit", async event => {
    event.preventDefault();
    
    page = 1;
    
    loaderToShow();
    
    galleryBox.innerHTML = '';
    gallery.refresh();
    
    value = form.elements['keywords'].value;
    
    try {
        const images = await instance({
            params: {
                q: value,
                page
            }
        });
        console.log(images.data.total);
        mess = images.data.total
        imagesFound();
        innerImages(images.data);
    } catch(error) {
        showUError();
    }
    loaderToHide();
    form.reset();
});

loadMoreBtn.addEventListener('click', async () => {
    pageOfQuery();
    try {
        const images = await instance({
            params: {
                q: value,
                page,
            }
        });

        addImagesBot(images.data);
        scrollPage();
    } catch (error) {
        showEmError();
        scrollPage();
    }
});

const addImages = images => {
    return images.hits.map(({ largeImageURL, webformatURL, tags, likes, views, comments, downloads }) => `
    <li class="img">
       <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}"></a>
      <ul class="img-info">
        <li class="img-info-item"><span>Likes</span> ${likes}</li>
        <li class="img-info-item"><span>Views</span> ${views}</li>
        <li class="img-info-item"><span>Comments</span> ${comments}</li>
        <li class="img-info-item"><span>Downloads</span> ${downloads}</li>
      </ul>
    </li>`).join('');
}

const innerImages = images => {
    if (images.hits.length === 0) throw new Error(images.status);

    galleryBox.innerHTML = addImages(images);

    loadMoreToShow();

    if (Math.ceil(images.total / 40) <= page) {
        showEmError();
    }

    gallery.refresh();
}

const addImagesBot = images => {
    if (Math.ceil(images.total / 40) <= page) {

        galleryBox.insertAdjacentHTML('beforeend', addImages(images));
        gallery.refresh();
        throw new Error(images.status);
    }

    galleryBox.insertAdjacentHTML('beforeend', addImages(images));

    gallery.refresh();
}

const showUError = (message = "An error occurred.") => {
    iziToast.show({
        message: message,
        maxWidth: 432,
        iconUrl: './img/error-icon.svg',
        iconColor: '#FFFFFF',
        backgroundColor: '#EF4040',
        messageColor: '#FFFFFF',
        position: 'topRight'
    });
    galleryBox.innerHTML = '';
}

const showEmError = () => {
    iziToast.show({
        message: `We're sorry, but you've reached the end of search results.`,
        maxWidth: 432,
        iconUrl: './img/error-icon.svg',
        iconColor: '#FFFFFF',
        backgroundColor: '#87CEEB',
        messageColor: '#FFFFFF',
        position: 'topRight'
    });
    loadMoreToHide();
}

const imagesFound = () => {
    iziToast.show({
        message: `We found ${mess} images.`,
        maxWidth: 432,
        backgroundColor: 'green',
        messageColor: '#FFFFFF',
        position: 'topRight'
    });
}

const scrollPage = () => {
    const height = document.querySelector(".img").getBoundingClientRect().height * 2
    window.scrollBy({
        top: height,
        behavior: "smooth",
    });
}

const loaderToShow = () => {
  loader.style.display = 'block';
}
const loaderToHide = () => {
  loader.style.display = 'none';
}
const loadMoreToShow = () => {
    loadMoreBtn.style.display = 'block';
}
const loadMoreToHide = () => {
    loadMoreBtn.style.display = 'none';
}
