// let progressBar = document.querySelector('.e-c-progress');
// let indicator = document.getElementById('e-indicator');
// let pointer = document.getElementById('e-pointer');
// let length = Math.PI * 2 * 100;
//
// progressBar.style.strokeDasharray = length;
//
// function update(value, timePercent) {
// 	var offset = - length - length * value / (timePercent);
// 	progressBar.style.strokeDashoffset = offset;
// 	pointer.style.transform = `rotate(${360 * value / (timePercent)}deg)`;
// };
//
// //circle ends
// const displayOutput = document.querySelector('.display-remain-time')
// const pauseBtn = document.getElementById('pause');
// const setterBtns = document.querySelectorAll('button[data-setter]');
//
// let intervalTimer;
// let timeLeft;
// let wholeTime = 0.5 * 60; // manage this to set the whole time
// let isPaused = false;
// let isStarted = false;
//
//
// update(wholeTime,wholeTime); //refreshes progress bar
// displayTimeLeft(wholeTime);
//
// function changeWholeTime(seconds){
//   if ((wholeTime + seconds) > 0){
//     wholeTime += seconds;
//     update(wholeTime,wholeTime);
//   }
// }
//
// for (var i = 0; i < setterBtns.length; i++) {
//     setterBtns[i].addEventListener("click", function(event) {
//         var param = this.dataset.setter;
//         switch (param) {
//             case 'minutes-plus':
//                 changeWholeTime(1 * 60);
//                 break;
//             case 'minutes-minus':
//                 changeWholeTime(-1 * 60);
//                 break;
//             case 'seconds-plus':
//                 changeWholeTime(1);
//                 break;
//             case 'seconds-minus':
//                 changeWholeTime(-1);
//                 break;
//         }
//       displayTimeLeft(wholeTime);
//     });
// }
//
// function timer (seconds){ //counts time, takes seconds
//   let remainTime = Date.now() + (seconds * 1000);
//   displayTimeLeft(seconds);
//
//   intervalTimer = setInterval(function(){
//     timeLeft = Math.round((remainTime - Date.now()) / 1000);
//     if(timeLeft < 0){
//       clearInterval(intervalTimer);
//       isStarted = false;
//       setterBtns.forEach(function(btn){
//         btn.disabled = false;
//         btn.style.opacity = 1;
//       });
//       displayTimeLeft(wholeTime);
//       pauseBtn.classList.remove('pause');
//       pauseBtn.classList.add('play');
//       return ;
//     }
//     displayTimeLeft(timeLeft);
//   }, 1000);
// }
// function pauseTimer(event){
//   if(isStarted === false){
//     timer(wholeTime);
//     isStarted = true;
//     this.classList.remove('play');
//     this.classList.add('pause');
//
//     setterBtns.forEach(function(btn){
//       btn.disabled = true;
//       btn.style.opacity = 0.5;
//     });
//
//   }else if(isPaused){
//     this.classList.remove('play');
//     this.classList.add('pause');
//     timer(timeLeft);
//     isPaused = isPaused ? false : true
//   }else{
//     this.classList.remove('pause');
//     this.classList.add('play');
//     clearInterval(intervalTimer);
//     isPaused = isPaused ? false : true ;
//   }
// }
//
// function displayTimeLeft (timeLeft){ //displays time on the input
//   let minutes = Math.floor(timeLeft / 60);
//   let seconds = timeLeft % 60;
//   let displayString = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
//   displayOutput.textContent = displayString;
//   update(timeLeft, wholeTime);
// }
//
// pauseBtn.addEventListener('click',pauseTimer);
//
// </script>
// <script>
//   (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
//   (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
//   m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
//   })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
//
//   ga('create', 'UA-46156385-1', 'cssscript.com');
//   ga('send', 'pageview');
//
//
//
// // function startTimer(seconds, container, oncomplete) {
// //     var startTime, timer, obj, ms = seconds*1000,
// //         display = document.getElementById(container);
// //     obj = {};
// //     obj.resume = function() {
// //         startTime = new Date().getTime();
// //         timer = setInterval(obj.step,250); // adjust this number to affect granularity
// //                             // lower numbers are more accurate, but more CPU-expensive
// //
// //     };
// //     obj.pause = function() {
// //         ms = obj.step();
// //         clearInterval(timer);
// //     };
// //     obj.step = function() {
// //         var now = Math.max(0,ms-(new Date().getTime()-startTime)),
// //             m = Math.floor(now/60000), s = Math.floor(now/1000)%60;
// //         s = (s < 10 ? "0" : "")+s;
// //         display.innerHTML = m+":"+s;
// //         if( now == 0) {
// //             clearInterval(timer);
// //             obj.resume = function() {};
// //             if( oncomplete) oncomplete();
// //         }
// //         return now;
// //     };
// //     obj.resume();
// //     return obj;
// // 		// start:
// // }
// // var timer = startTimer(5.25*60, "timer");
// // 		// pause:
// // 		timer.pause();
// 		// resume:
// 		// timer.resume();
//
//
// // 	$('button').on('click', function(){
// //     clearTimeout(timer);
// //     if ($(this).hasClass('restart')) {
// //         count = 0;
// //         paused = false;
// //         counter();
// //     } else {
// //         paused = !paused;
// //         if (!paused) {
// //             counter();
// //         }
// //     }
// // });
//
// //
// // var timerVar = setInterval(countTimer, 1000);
// // var totalSeconds = 0;
// // const running = true;
// //
// // document.getElementById("timer").innerHTML = "00:00";
// // function countTimer() {
// //    ++totalSeconds;
// //    var hour = Math.floor(totalSeconds /3600);
// //    var minute = Math.floor((totalSeconds - hour*3600)/60);
// //    var seconds = totalSeconds - (hour*3600 + minute*60);
// //    if(hour < 10)
// //      hour = "0"+hour;
// //    if(minute < 10)
// //      minute = "0"+minute;
// //    if(seconds < 10)
// //      seconds = "0"+seconds;
// //    document.getElementById("timer").innerHTML = minute + ":" + seconds;
// // }
// //
// // function stop() {
// // // document.getElementById("stop_timer").addEventListener("click", function(){
// // 	if (running === true){
// // 		clearInterval(timerVar);
// // 		running = false;
// // 	}
// // 	else{
// // 		setInterval(timerVar);
// // 		running = true;
// // 		countTimer();
// // 	}
// // }
// // // })
// // // stop();
// //
