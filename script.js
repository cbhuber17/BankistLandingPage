'use strict';

// ---------------------------------------------------------------
// Modal window

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const btnScrollTo = document.querySelector('.btn--scroll-to');
const nav = document.querySelector('.nav');
const tabs = document.querySelectorAll('operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');

const openModal = function (e) {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

// ---------------------------------------------------------------
// Modal Operations

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

// ---------------------------------------------------------------
// Page navigation

const section1 = document.querySelector('#section--1');

// Smooth scrolling to section 1
btnScrollTo.addEventListener('click', function (e) {
  section1.scrollIntoView({ behavior: 'smooth' });
});

// Smooth scrolling from navbar
// Problematic because a function is being called for each navbar button
// this causes performance issues
// See steps and function below to solve this
// document.querySelectorAll('.nav__link').forEach(function (el) {
//   el.addEventListener('click', function (e) {
//     e.preventDefault();

//     const id = this.getAttribute('href');

//     document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
//   });
// });

// 1. Add event listener to common parent element
// 2. Determine what element originated the event

document.querySelector('.nav__links').addEventListener('click', function (e) {
  // Matching strategy
  if (e.target.classList.contains('nav__link')) {
    e.preventDefault();

    const id = e.target.getAttribute('href');
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});

// ---------------------------------------------------------------
// Tabs

// Grab the parent component rather than the child for performance reasons
tabsContainer.addEventListener('click', function (e) {
  const clicked = e.target.closest('.operations__tab');

  // Guard clause for NULL cases
  if (!clicked) return;

  // Deactivate other tabs and content
  tabs.forEach(t => t.classList.remove('operations__tab--active'));
  tabsContent.forEach(c => c.classList.remove('operations__content--active'));

  // Activate tab
  clicked.classList.add('operations__tab--active');

  // Activate content area
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});

// ---------------------------------------------------------------
// Menu fade effect

const handleHover = function (e) {
  // Target parent
  if (e.target.classList.contains('nav__link')) {
    const link = e.target;

    // Get siblings of childs of nav__link parent
    const siblings = link.closest('.nav').querySelectorAll('.nav__link');
    const logo = link.closest('.nav').querySelector('img');

    siblings.forEach(el => {
      if (el !== link) el.style.opacity = this;
    });

    logo.style.opacity = this;
  }
};

// mouseenter does not bubble to parent, so will use mouseover
// Ensure to do something after mouse leaves
// Passing "argument" into handler
nav.addEventListener('mouseover', handleHover.bind(0.5));
nav.addEventListener('mouseout', handleHover.bind(1));

// Equivalent code to binding here:
// nav.addEventListener('mouseover', function (e) {
//   handleHover(e, 0.5);
// });
// nav.addEventListener('mouseout', function (e) {
//   handleHover(e, 1);
// });

// ---------------------------------------------------------------
// Sticky nav bar (stays at top once scrolling down a little)

// Code below is a traditional way
// const initialCoords = section1.getBoundingClientRect();

// window.addEventListener('scroll', function (e) {
//   // Not performance optimal since window.scrollY fires every time scrolling happens
//   if (window.scrollY > initialCoords.top) nav.classList.add('sticky');
//   else nav.classList.remove('sticky');
// });

// ---------------------------------------------------------------

// Sticky nav bar: Intersection Observer API
// Playing below
// const obsCallback = function (entries, observer) {
//   entries.forEach(entry => )
// };

// const obsOptions = {
//   // Root is element target (e.g. section1) is intersecting
//   // Looking for the viewport when root is null
//   root: null,
//   threshold: 0.1, // Percentage of intersection callback will be called
//   // threshold: [0, 0.2], // Out of view, or 20% in view will trigger the callback
//   // So this basically means when 10% of section 1 is in view, call the
//   // callback function.
// };

// const observer = new IntersectionObserver(obsCallback, obsOptions);
// observer.observe(section1);

const header = document.querySelector('.header');
const navHeight = nav.getBoundingClientRect().height;

const stickyNav = function (entries) {
  const [entry] = entries; // Same as entries[0]

  // Add sticky navbar when observer is not intersecting
  // with the target.
  if (!entry.isIntersecting) {
    nav.classList.add('sticky');
  }
};

const obsOptions = {
  root: null, // Interested in entire viewport
  threshold: 0, // 0% header visible, call callback
  rootMargin: `-${navHeight}px`, // 90px added margin to root box
  // i.e. the threshold appears 90 px before the threshold happens
};

const headerObserver = new IntersectionObserver(stickyNav, obsOptions);

headerObserver.observe(header);

// ---------------------------------------------------------------
// Reveal sections

// Get all sections
const allSections = document.querySelectorAll('.section');

const revealSection = function (entries, observer) {
  const [entry] = entries;

  // Guard clause
  if (!entry) return;

  entry.target.classList.remove('section--hidden');

  // Stop observing to prevent excessive event firing
  observer.unobserve(entry.target);
};

const revealOptions = {
  root: null,
  threshold: 0.15,
};

const sectionObserver = new IntersectionObserver(revealSection, revealOptions);

allSections.forEach(function (section) {
  sectionObserver.observe(section);
  section.classList.add('section--hidden');
});

// ---------------------------------------------------------------
// Lazy loading images
// Capture all elements that have the property "data-src"
const imgTargets = document.querySelectorAll('img[data-src]');

const loadImg = function (entries, observer) {
  const [entry] = entries;

  if (!entry.isIntersecting) return;

  // Replace src with data-src
  entry.target.src = entry.target.dataset.src;

  // Listen for load event and act on it
  entry.target.addEventListener('load', function () {
    // Remove blur filter
    entry.target.classList.remove('lazy-img');
  });

  observer.unobserve(entry.target);
};

const imgOptions = {
  root: null,
  threshold: 0,
  rootMargin: '200px', // Make sure images are loaded before approaching them
};

const imgObserver = new IntersectionObserver(loadImg, imgOptions);

imgTargets.forEach(img => imgObserver.observe(img));

// ---------------------------------------------------------------
// Slider with images and paragraph

const slides = document.querySelectorAll('.slide');
const btnLeft = document.querySelector('.slider__btn--left');
const btnRight = document.querySelector('.slider__btn--right');
const dotContainer = document.querySelector('.dots');

let curSlide = 0;
const maxSlide = slides.length;

const createDots = function () {
  slides.forEach(function (_, i) {
    dotContainer.insertAdjacentHTML(
      'beforeend',
      `<button class="dots__dot" data-slide="${i}"></button>`
    );
  });
};

createDots();

const activateDot = function (slide) {
  document
    .querySelectorAll('.dots__dot')
    .forEach(dot => dot.classList.remove('dots__dot--active'));

  document
    .querySelector(`.dots__dot[data-slide="${slide}"]`)
    .classList.add('dots__dot--active');
};

activateDot(0);

const slider = document.querySelector('.slider');

const goToSlide = function (slide) {
  slides.forEach(
    (s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`)
  );
};

goToSlide(0);

const nextSlide = function () {
  // Go back to first slide when reaching the end
  if (curSlide === maxSlide - 1) {
    curSlide = 0;
  } else {
    curSlide++;
  }

  goToSlide(curSlide);
  activateDot(curSlide);
};

const prevSlide = function () {
  // Go to the end slide when reaching past the beginning
  if (curSlide === 0) {
    curSlide = maxSlide - 1;
  } else {
    curSlide--;
  }

  goToSlide(curSlide);
  activateDot(curSlide);
};

// Next slide
btnRight.addEventListener('click', nextSlide);
btnLeft.addEventListener('click', nextSlide);

// Also arrow keys to move slides
document.addEventListener('keydown', function (e) {
  if (e.key === 'ArrowLeft') prevSlide();
  if (e.key === 'ArrowRight') nextSlide();
});

dotContainer.addEventListener('click', function (e) {
  if (e.target.classList.contains('dots__dot')) {
    const { slide } = e.target.dataset;

    goToSlide(slide);
    activateDot(slide);
  }
});
