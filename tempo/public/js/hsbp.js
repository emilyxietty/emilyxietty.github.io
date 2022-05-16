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

var tickAudio = new Audio('http://soundjax.com/reddo/56895%5EDING.mp3');

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

// window.addEventListener("keypress", function (evt) {
//     var SPACEBAR = 32;
//     if (evt.which === SPACEBAR) {
//         pauseTimer();
//         // evt.preventDefault();
//     }
// });

// document.body.onkeyup = function(e){
//     if(e.keyCode == 32){
//       pauseTimer();
//     }
// }

function resetTimer() {
	clearInterval(tInterval);
	savedTime = 0;
	difference = 0;
	paused = 0;
	running = 0;
	document.getElementById("playpauseicon").src = "https://iconsplace.com/wp-content/uploads/_icons/ffffff/256/png/play-icon-18-256.png";
	timerDisplay.style.color = "white";

	timerDisplay.innerHTML = '00:00';
	document.body.style.background = "#5e66a1";
	document.getElementById("infotext").innerHTML = "";
	document.getElementById("speaker").style.boxShadow = "20px 20px 60px #505789,-20px -20px 60px #6c75b9";
	document.getElementById("speaker").style.background = "linear-gradient(145deg, #555c91, #656dac)";
	document.getElementById("circle").style.boxShadow = "inset 20px 20px 60px #505789,inset -20px -20px 60px #6c75b9";

	document.getElementById("bar").style.boxShadow = "inset 5px 5px 15px #4b5281,inset -5px -5px 15px #717ac1";
	document.getElementById("minusTen").style.background = "linear-gradient(145deg, #555c91, #656dac)";
	document.getElementById("minusTen").style.boxShadow = "5px 5px 10px #505789,-5px -5px 10px #6c75b9";
	document.getElementById("resetTimer").style.background = "linear-gradient(145deg, #555c91, #656dac)";
	document.getElementById("resetTimer").style.boxShadow = "5px 5px 10px #505789,-5px -5px 10px #6c75b9";
	document.getElementById("addTen").style.background = "linear-gradient(145deg, #555c91, #656dac)";
	document.getElementById("addTen").style.boxShadow = "5px 5px 10px #505789,-5px -5px 10px #6c75b9";

	document.getElementById("backbtn").style.background = "linear-gradient(145deg, #555c91, #656dac)";
	document.getElementById("backbtn").style.boxShadow = "5px 5px 10px #505789,-5px -5px 10px #6c75b9";
	document.getElementById("backbtn2").style.background = "linear-gradient(145deg, #555c91, #656dac)";
	document.getElementById("backbtn2").style.boxShadow = "5px 5px 10px #505789,-5px -5px 10px #6c75b9";

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
	// tickAudio.play();
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

	if (30000 > difference) {
		timerDisplay.style.color = "white";

		document.body.style.background = "radial-gradient(circle, #6f86d6 0%, #48c6ef 100%)";
		document.getElementById("infotext").innerHTML = "protected time. POIs may not be offered.";
		document.getElementById("speaker").style.boxShadow = "20px 20px 60px #4a8fba,-20px -20px 60px #64c1fc";
		document.getElementById("speaker").style.background = "linear-gradient(145deg, #4e97c5, #5db4ea)";
		document.getElementById("circle").style.boxShadow = "inset 12px 12px 24px #4a8fba,inset -12px -12px 24px #64c1fc";

		document.getElementById("bar").style.boxShadow = "inset 12px 12px 24px #4a8fba,inset -12px -12px 24px #64c1fc";
		document.getElementById("minusTen").style.background = "linear-gradient(145deg, #4e97c5, #5db4ea)";
		document.getElementById("minusTen").style.boxShadow = "5px 5px 10px #4c94c1,-5px -5px 10px #509ac9";
		document.getElementById("resetTimer").style.background = "linear-gradient(145deg, #4e97c5, #5db4ea)";
		document.getElementById("resetTimer").style.boxShadow = "5px 5px 10px #4c94c1,-5px -5px 10px #509ac9";
		document.getElementById("addTen").style.background = "linear-gradient(145deg, #4e97c5, #5db4ea)";
		document.getElementById("addTen").style.boxShadow = "5px 5px 10px #4c94c1,-5px -5px 10px #509ac9";

		document.getElementById("backbtn").style.background = "linear-gradient(145deg, #4e97c5, #5db4ea)";
		document.getElementById("backbtn").style.boxShadow = "5px 5px 10px #4c94c1,-5px -5px 10px #509ac9";
		document.getElementById("backbtn2").style.background = "linear-gradient(145deg, #4e97c5, #5db4ea)";
		document.getElementById("backbtn2").style.boxShadow = "5px 5px 10px #4c94c1,-5px -5px 10px #509ac9";

	} else if (270000 > difference) {
		timerDisplay.style.color = "white";

		document.body.style.background = "radial-gradient(circle, #329d9c 0%, #56c596 100%)";
		document.getElementById("infotext").innerHTML = "protected time over. POIs may be offered.";
		document.getElementById("speaker").style.boxShadow = "20px 20px 60px #47ab8d,-20px -20px 60px #61e7bf";
		document.getElementById("speaker").style.background = "linear-gradient(145deg, #4cb595, #5ad7b2)";
		document.getElementById("circle").style.boxShadow = "inset 12px 12px 24px #33836b,inset -12px -12px 24px #45b191";

		document.getElementById("bar").style.boxShadow = "inset 12px 12px 24px #33836b,inset -12px -12px 24px #45b191";
		document.getElementById("minusTen").style.background = "linear-gradient(145deg, #4cb595, #5ad7b2)";
		document.getElementById("minusTen").style.boxShadow = "5px 5px 5px #4ab192,-5px -5px 5px #4eb998";
		document.getElementById("resetTimer").style.background = "linear-gradient(145deg, #4cb595, #5ad7b2)";
		document.getElementById("resetTimer").style.boxShadow = "5px 5px 5px #4ab192,-5px -5px 5px #4eb998";
		document.getElementById("addTen").style.background = "linear-gradient(145deg, #4cb595, #5ad7b2)";
		document.getElementById("addTen").style.boxShadow = "5px 5px 5px #4ab192,-5px -5px 5px #4eb998";

		document.getElementById("backbtn").style.background = "linear-gradient(145deg, #4cb595, #5ad7b2)";
		document.getElementById("backbtn").style.boxShadow = "5px 5px 5px #4ab192,-5px -5px 5px #4eb998";
		document.getElementById("backbtn2").style.background = "linear-gradient(145deg, #4cb595, #5ad7b2)";
		document.getElementById("backbtn2").style.boxShadow = "5px 5px 5px #4ab192,-5px -5px 5px #4eb998";

	} else if (300000 > difference) {
		timerDisplay.style.color = "white";

		document.body.style.background = "radial-gradient(circle, #6f86d6 0%, #48c6ef 100%)";
		document.getElementById("infotext").innerHTML = "protected time starts again. POIs may not be offered.";
		document.getElementById("speaker").style.boxShadow = "20px 20px 60px #4a8fba,-20px -20px 60px #64c1fc";
		document.getElementById("speaker").style.background = "linear-gradient(145deg, #4e97c5, #5db4ea)";
		document.getElementById("circle").style.boxShadow = "inset 12px 12px 24px #4a8fba,inset -12px -12px 24px #64c1fc";

		document.getElementById("bar").style.boxShadow = "inset 12px 12px 24px #4a8fba,inset -12px -12px 24px #64c1fc";
		document.getElementById("minusTen").style.background = "linear-gradient(145deg, #4e97c5, #5db4ea)";
		document.getElementById("minusTen").style.boxShadow = "5px 5px 10px #4c94c1,-5px -5px 10px #509ac9";
		document.getElementById("resetTimer").style.background = "linear-gradient(145deg, #4e97c5, #5db4ea)";
		document.getElementById("resetTimer").style.boxShadow = "5px 5px 10px #4c94c1,-5px -5px 10px #509ac9";
		document.getElementById("addTen").style.background = "linear-gradient(145deg, #4e97c5, #5db4ea)";
		document.getElementById("addTen").style.boxShadow = "5px 5px 10px #4c94c1,-5px -5px 10px #509ac9";

		document.getElementById("backbtn").style.background = "linear-gradient(145deg, #4e97c5, #5db4ea)";
		document.getElementById("backbtn").style.boxShadow = "5px 5px 10px #4c94c1,-5px -5px 10px #509ac9";
		document.getElementById("backbtn2").style.background = "linear-gradient(145deg, #4e97c5, #5db4ea)";
		document.getElementById("backbtn2").style.boxShadow = "5px 5px 10px #4c94c1,-5px -5px 10px #509ac9";

	} else if (315000 > difference) {
		timerDisplay.style.color = "white";

		document.body.style.background = "radial-gradient(circle, #d0484c 0%, #ff9a9e 100%)";
		document.getElementById("infotext").innerHTML = "15 seconds grace time. speech will end at 5:15.";
		document.getElementById("speaker").style.boxShadow = "20px 20px 60px #b13d41,-20px -20px 60px #ef5357";
		document.getElementById("speaker").style.background = "linear-gradient(145deg, #bb4144, #df4d51)";
		document.getElementById("circle").style.boxShadow = "inset 12px 12px 24px #b13d41,inset -12px -12px 24px #ef5357";

		document.getElementById("bar").style.boxShadow = "inset 12px 12px 24px #b13d41,inset -12px -12px 24px #ef5357";
		document.getElementById("minusTen").style.background = "linear-gradient(145deg, #c1464a, #a23b3e)";
		document.getElementById("minusTen").style.boxShadow = "5px 5px 10px #cc474a,-5px -5px 10px #d4494e";
		document.getElementById("resetTimer").style.background = "linear-gradient(145deg, #c1464a, #a23b3e)";
		document.getElementById("resetTimer").style.boxShadow = "5px 5px 10px #cc474a,-5px -5px 10px #d4494e";
		document.getElementById("addTen").style.background = "linear-gradient(145deg, #c1464a, #a23b3e)";
		document.getElementById("addTen").style.boxShadow = "5px 5px 10px #cc474a,-5px -5px 10px #d4494e";

		document.getElementById("backbtn").style.background = "linear-gradient(145deg, #c1464a, #a23b3e)";
		document.getElementById("backbtn").style.boxShadow = "5px 5px 10px #cc474a,-5px -5px 10px #d4494e";
		document.getElementById("backbtn2").style.background = "linear-gradient(145deg, #c1464a, #a23b3e)";
		document.getElementById("backbtn2").style.boxShadow = "5px 5px 10px #cc474a,-5px -5px 10px #d4494e";


	} else if (difference > 315000) {
		document.body.style.background = "#2d3436";
		timerDisplay.style.color = "#d63031";
		document.getElementById("infotext").innerHTML = "time is over. end speech now.";
		document.getElementById("speaker").style.boxShadow = "20px 20px 60px #262c2e,-20px -20px 60px #343c3e";
		document.getElementById("speaker").style.background = "linear-gradient(145deg, #292f31, #30383a)";
		document.getElementById("circle").style.boxShadow = "inset 12px 12px 24px #262c2e,inset -12px -12px 24px #343c3e";

		document.getElementById("bar").style.boxShadow = "inset 12px 12px 24px #262c2e,inset -12px -12px 24px #343c3e";
		document.getElementById("minusTen").style.background = "linear-gradient(145deg, #292f31, #30383a)";
		document.getElementById("minusTen").style.boxShadow = "5px 5px 10px #262c2e,-5px -5px 10px #343c3e";
		document.getElementById("resetTimer").style.background = "linear-gradient(145deg, #292f31, #30383a)";
		document.getElementById("resetTimer").style.boxShadow = "5px 5px 10px #262c2e,-5px -5px 10px #343c3e";
		document.getElementById("addTen").style.background = "linear-gradient(145deg, #292f31, #30383a)";
		document.getElementById("addTen").style.boxShadow = "5px 5px 10px #262c2e,-5px -5px 10px #343c3e";

		document.getElementById("backbtn").style.background = "linear-gradient(145deg, #292f31, #30383a)";
		document.getElementById("backbtn").style.boxShadow = "5px 5px 10px #262c2e,-5px -5px 10px #343c3e";
		document.getElementById("backbtn2").style.background = "linear-gradient(145deg, #292f31, #30383a)";
		document.getElementById("backbtn2").style.boxShadow = "5px 5px 10px #262c2e,-5px -5px 10px #343c3e";

	}

	var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
	var seconds = Math.floor((difference % (1000 * 60)) / 1000);

	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;
	timerDisplay.innerHTML = minutes + ':' + seconds;
	getSound();
}
