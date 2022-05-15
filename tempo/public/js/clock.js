const circle = document.getElementById('circle2');
const button = document.getElementById('button');
const reset = document.getElementById('reset')
const length = circle.getTotalLength();
const minute = document.getElementById('minute');
const second = document.getElementById('second');

circle.style.strokeDasharray = length;
circle.style.strokeDashoffset = length;

let count = 0;
let timer;
let isPlaying = false;

button.addEventListener('click',
  function() {
  isPlaying = !isPlaying;
  if(isPlaying){
    startTimer();
  }else{
    stopTimer();
  }
}
);

reset.addEventListener('click', resetTimer);
