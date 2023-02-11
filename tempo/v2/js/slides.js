const slider = document.querySelector('.slider');
const prev = document.querySelector('.slider-prev');
const next = document.querySelector('.slider-next');

let index = 0;

next.addEventListener('click', () => {
  index++;
  slider.style.transform = `translateX(-${index * 100}%)`;
});

prev.addEventListener('click', () => {
  index--;
  slider.style.transform = `translateX(-${index * 100}%)`;
});