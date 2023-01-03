/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { signup } from './signup';
import { submitReview, updateReview, deleteReview } from './review';

// SELECTING DOM ELEMENTS FOR MAIPULATION
const mapBox = document.getElementById('map');
const signUpForm = document.querySelector('.form--signup');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const reviewForm = document.querySelector('.form--review');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

const reviewPage = document.getElementById('review__page');

// INTEGRATING MAPBOX HERE...
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

// MANIPULATING SIGNUP FORM
if (signUpForm)
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    console.log('pepe');
    signup(name, email, password, passwordConfirm);
  });

// MANIPULATING LOGIN FORM
if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

// MANIPULATING LOGOUT BUTTON
if (logOutBtn) logOutBtn.addEventListener('click', logout);

// MANIPULATING USER DATA (INCLUDING USER PROFILE PICTURE) FORM FOR USER DATA UPDATE FEATURE
if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });

// MANIPULATING USER PASSWORD FORM FOR USER PASSWORD UPDATE FEATURE
if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // LOADER..
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    // SETTING BACK THE FIELDS EMPTY
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

if (reviewForm) {
  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rating = document.getElementById('rating').value;
    const review = document.getElementById('review').value;
    const tourId = header.dataset.tourId;
    submitReview(rating, review, tourId);
  });
}

if (reviewPage) {
  const btnDelete = document.querySelectorAll('.btn-delete');
  const btnUpdate = document.querySelectorAll('.btn-update');
  const rating = document.querySelectorAll('#rating');
  const review = document.querySelectorAll('#review');
  console.log({ rating, review });
  btnUpdate.forEach((btn, i) => {
    btn.addEventListener('click', (e) => {
      btn.textContent = 'Save';
      rating[i].disabled = false;
      review[i].disabled = false;
      btn.addEventListener('click', (e) => {
        const reviewId = btn.dataset.reviewId;
        console.log(rating[i].value);
        btn.disabled = true;
        btn.textContent = 'Saving...';
        updateReview(reviewId, rating[i].value, review[i].value);
      });
    });
  });

  btnDelete.forEach((btn, i) => {
    btn.addEventListener('click', (e) => {
      const reviewId = btn.dataset.reviewId;
      btn.textContent = 'Removing...';
      btn.disabled = true;
      deleteReview(reviewId);
    });
  });
}
