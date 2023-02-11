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



// var audio = new Audio("https://dl.dropboxusercontent.com/s/1cdwpm3gca9mlo0/kick.mp3");

var tickAudio = new Audio('https://soundjax.com/reddo/56895%5EDING.mp3');

function startTimer() {
	if (!running) {
		startTime = new Date().getTime();
		tInterval = setInterval(getShowTime, 1);
		paused = 0;
		running = 1;
		document.getElementById("playpauseicon").src = "https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/pause-icon-18-256.png";
	}
}

function pauseTimer() {
	if (!running) {
		startTime = new Date().getTime();
		tInterval = setInterval(getShowTime, 1);
		paused = 0;
		running = 1;
		document.getElementById("playpauseicon").src = "https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/pause-icon-18-256.png";
		timerDisplay.style.color = "white";
	} else if (!paused) {
		clearInterval(tInterval);
		savedTime = difference;
		paused = 1;
		running = 0;
		document.getElementById("playpauseicon").src = "https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/play-icon-18-256.png";
		timerDisplay.style.color = "#444";

	} else {
		startTimer();
	}

}

function resetTimer() {
	clearInterval(tInterval);
	savedTime = 0;
	difference = 0;
	paused = 0;
	running = 0;
	document.getElementById("playpauseicon").src = "https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/play-icon-18-256.png";
	timerDisplay.style.color = "white";

	timerDisplay.innerHTML = '00:00';
	document.body.style.background = "#465994";
	document.getElementById("infotext").innerHTML = "";
	startTimerButton.classList.remove('lighter');
	pauseTimerButton.classList.remove('lighter');


}

function addTen() {
	if (!running) {

		savedTime = savedTime + 10000;
		pauseTimer();
	} else if (!paused) {
		startTime = startTime - 10000;
		startTimer();
	}
}

function minusTen() {
	if (difference <= 10000) {
		resetTimer();
	}
	if (!running) {
		savedTime = savedTime - 10000;
		pauseTimer();
	} else if (!paused) {
		startTime = startTime + 10000;
		startTimer();
	}
}
var protimeend = 1;
var protimestart = 1;
var gracestart = 2;
var graceend = 3;
var dings = 0;

function getSound() {
	if (difference <= 30000) {
		protimeend = 1;
	}
	if (difference >= 30000) {
		if (protimeend > 0) {
			tickAudio.play();
			protimeend = protimeend - 1;
		}
		if (difference <= 270000) {
			protimestart = 1;
		}
	}
	if (difference >= 270000) {
		if (protimestart > 0) {
			tickAudio.play();
			protimestart = protimestart - 1;
		}
		if (difference <= 300000) {
			gracestart = 2;
		}
	}
	if (difference >= 300000) {
		if (gracestart > 1) {
			tickAudio.play();
			gracestart = gracestart - 1;
		}
	}
	if (difference >= 301000) {
		if (gracestart > 0) {
			tickAudio.play();
			gracestart = gracestart - 1;
		}
		if (difference <= 315000) {
			graceend = 3;
		}
	}
	if (difference >= 315000 && graceend > 2) {
		tickAudio.play();
		graceend = graceend - 1;
	}
	if (difference >= 316000 && graceend > 1) {
		tickAudio.play();
		graceend = graceend - 1;
	}
	if (difference >= 317000 && graceend > 0) {
		tickAudio.play();
		graceend = graceend - 1;
	}
}

function getShowTime() {
	updatedTime = new Date().getTime();
	if (savedTime) {
		difference = (updatedTime - startTime) + savedTime;
	} else {
		difference = updatedTime - startTime;
	}

	if (30000 > difference) { // blue
		timerDisplay.style.color = "white";

		document.body.style.background = "#6fa8e4";
		document.getElementById("infotext").innerHTML = "protected time. POIs may not be offered.";
		// document.getElementById("speaker").style.background = "linear-gradient(145deg, #4e97c5, #5db4ea)";
	} else if (270000 > difference) { // green
		timerDisplay.style.color = "white";

		document.body.style.background = "#0aca83";
		document.getElementById("infotext").innerHTML = "protected time over. POIs may be offered.";
	} else if (300000 > difference) { // blue
		timerDisplay.style.color = "white";

		document.body.style.background = "#6fa8e4";
		document.getElementById("infotext").innerHTML = "protected time starts again. POIs may not be offered.";

	} else if (315000 > difference) { // red 5-5:15
		timerDisplay.style.color = "white";
		document.body.style.background = "#df4d51";
		document.getElementById("infotext").innerHTML = "15 seconds grace time. speech will end at 5:15.";


	} else if (difference > 315000) { // black
		document.body.style.background = "#2d3436";
		timerDisplay.style.color = "#d63031";
		document.getElementById("infotext").innerHTML = "red";
	}

	var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
	var seconds = Math.floor((difference % (1000 * 60)) / 1000);

	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;
	timerDisplay.innerHTML = minutes + ':' + seconds;
	getSound();
}
