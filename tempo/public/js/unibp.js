var startTimerButton = document.querySelector('.startTimer');
var pauseTimerButton = document.querySelector('.pauseTimer');
var timerDisplay = document.querySelector('.timer');
var startTime;
var updatedTime;
var difference;
var tInterval;
var savedTime;
var paused = 0;
var running = 0;

function startTimer(){
  if(!running){
    startTime = new Date().getTime();
    tInterval = setInterval(getShowTime, 1);
    paused = 0;
    running = 1;
    document.getElementById("playpauseicon").src="https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/pause-icon-18-256.png";
    // background: #5e66a1;
    // document.getElementById("pauseTimer").style.boxShadow="inset 6px 6px 12px #4c5382,inset -6px -6px 12px #7079c0";
    timerDisplay.style.background = "transparent";
    timerDisplay.style.cursor = "auto";
    timerDisplay.style.color = "white";
    startTimerButton.classList.add('lighter');
    pauseTimerButton.classList.remove('lighter');
    startTimerButton.style.cursor = "auto";
    pauseTimerButton.style.cursor = "pointer";

  }
}

function pauseTimer(){
	if(!running){
    startTime = new Date().getTime();
    tInterval = setInterval(getShowTime, 1);
    paused = 0;
    running = 1;
    document.getElementById("playpauseicon").src="https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/pause-icon-18-256.png";

    timerDisplay.style.background = "transparent";
    timerDisplay.style.cursor = "auto";
    timerDisplay.style.color = "white";
    startTimerButton.classList.add('lighter');
    pauseTimerButton.classList.remove('lighter');
    startTimerButton.style.cursor = "auto";
    pauseTimerButton.style.cursor = "pointer";
  }
  if (!difference){
    // if timer never started, don't allow pause button to do anything
  } else if (!paused) {
    clearInterval(tInterval);
    savedTime = difference;
    paused = 1;
    running = 0;
    document.getElementById("playpauseicon").src="https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/play-icon-18-256.png";

    timerDisplay.style.background = "transparent";
    timerDisplay.style.color = "#444";
    timerDisplay.style.cursor = "pointer";
    startTimerButton.classList.remove('lighter');
    pauseTimerButton.classList.add('lighter');
    startTimerButton.style.cursor = "pointer";
    pauseTimerButton.style.cursor = "auto";


  } else {
    startTimer();
  }

}

function resetTimer(){
  clearInterval(tInterval);
  savedTime = 0;
  difference = 0;
  paused = 0;
  running = 0;
  document.getElementById("playpauseicon").src="https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/play-icon-18-256.png";
  timerDisplay.innerHTML = '00:00';
  // timerDisplay.style.background = "transparent";
  // timerDisplay.style.color = "white";
  // timerDisplay.style.cursor = "pointer";
  startTimerButton.classList.remove('lighter');
  pauseTimerButton.classList.remove('lighter');
  // startTimerButton.style.cursor = "pointer";
  // pauseTimerButton.style.cursor = "auto";
}

function getShowTime(){
  updatedTime = new Date().getTime();
  if (savedTime){
    difference = (updatedTime - startTime) + savedTime;
  } else {
    difference =  updatedTime - startTime;
  }

// uni BP
	if (60000>difference){
    document.body.style.background = "radial-gradient(circle, #6f86d6 0%, #48c6ef 100%)";
    // document.body.style.background = "#3596c0";

		document.getElementById("infotext").innerHTML = "protected time. POIs may not be offered.";
    // document.getElementById("infotext").style.boxShadow = "20px 20px 60px #5e72b6,-20px -20px 60px #809af6";
    // document.getElementById("infotext").style.boxShadow = "inset 12px 12px 24px #5668a6,inset -12px -12px 24px #667cc6";

    document.getElementById("circle").style.boxShadow="inset 12px 12px 24px #5668a6,inset -12px -12px 24px #667cc6";
    // document.getElementById("backbtn").style.boxShadow="inset 3px 3px 6px #687ec9, inset -3px -3px 6px #768ee3";

	}
	else if (360000>difference){
    document.body.style.background = "radial-gradient(circle, #329d9c 0%, #56c596 100%)";
		document.getElementById("infotext").innerHTML = "protected time over. POIs may be offered.";
    // document.getElementById("infotext").style.boxShadow = "20px 20px 60px #2b8585,-20px -20px 60px #3ab5b3";
    document.getElementById("circle").style.boxShadow="inset 12px 12px 24px #2e8f8e,inset -12px -12px 24px #37abaa";
    // document.getElementById("backbtn").style.boxShadow="inset 5px 5px 10px #4daf86,inset -5px -5px 10px #5fdba7";

	}
	else if (420000>difference){
    document.body.style.background = "radial-gradient(circle, #6f86d6 0%, #48c6ef 100%)";
		document.getElementById("infotext").innerHTML = "protected time starts again. POIs may not be offered.";
    // document.getElementById("infotext").style.boxShadow = "20px 20px 60px #5e72b6,-20px -20px 60px #809af6";
    document.getElementById("circle").style.boxShadow="inset 12px 12px 24px #657ac3,inset -12px -12px 24px #7992e9";
    // document.getElementById("backbtn").style.boxShadow="inset 5px 5px 10px #40b0d5,inset -5px -5px 10px #50dcff";


	}
	else if (435000>difference){
    document.body.style.background = "radial-gradient(circle, #d0484c 0%, #ff9a9e 100%)";
		document.getElementById("infotext").innerHTML = "15 seconds grace time. speech will end at 5:15.";
    // document.getElementById("infotext").style.boxShadow = "20px 20px 60px #b13d41,-20px -20px 60px #ef5357";
    document.getElementById("circle").style.boxShadow="inset 12px 12px 24px #bd4245,inset -12px -12px 24px #e34e53";
    // document.getElementById("backbtn").style.boxShadow="inset 5px 5px 10px #e3898d,inset -5px -5px 10px #ffabaf";



	}
	else if (difference>435000){
		document.body.style.background = "#2d3436";
		timerDisplay.style.color = "#d63031";
		document.getElementById("infotext").innerHTML = "time is over. end speed now.";
    document.getElementById("circle").style.boxShadow="inset 12px 12px 24px #292f31,inset -12px -12px 24px #31393b";
    // document.getElementById("backbtn").style.boxShadow="inset 5px 5px 10px #292f31,inset -5px -5px 10px #31393b";




	}

  // var days = Math.floor(difference / (1000 * 60 * 60 * 24));
  // var hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((difference % (1000 * 60)) / 1000);
  // var milliseconds = Math.floor((difference % (1000 * 60)) / 100);

  // hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;
  // milliseconds = (milliseconds < 100) ? (milliseconds < 10) ? "00" + milliseconds : "0" + milliseconds : milliseconds;
  timerDisplay.innerHTML = minutes + ':' + seconds;
}
