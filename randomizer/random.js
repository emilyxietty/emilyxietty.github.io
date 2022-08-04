var stop1 = false;
var stop2 = false;
var example = [
		  "7DS",
			"Aot",
			"Banana Fish",
			"Beastars",
			"Black Clover",
			"Bunny Girl Senpai",
			"Code Geass",
			"Demon Slayer",
			"Domestic Girlfriend",
			"Evangelion",
			"Fairy Tail",
			"Fullmetal Alchemist",
			"Given",
			"Haikyuu!!",
			"Howl's Moving Castle",
			"Hunter x Hunter",
			"Inuyasha",
			"Jojo's Bizarre Adventure",
			"Jujutsu Kaisen",
			"My Hero Academia",
			"Naruto",
			"One Piece",
			"One Punch Man",
			"Ouran High School Host Club",
			"Spirited Away",
			"Sword Art Online",
			"Toilet Bound Hanako Kun",
			"Tokyo Ghoul",
			"Tokyo Revengers",
			"Violet Evergarden",
			"Your Lie in April",
			"Death Note",
			"A Silent Voice",
			"Bakemonogatori",
			"Re:Zero",
		];

textSequence(0);
function textSequence(i) {
		// if (stop1 == true){
		//
		// }
		if (example.length > i) {
				setTimeout(function() {
						document.getElementById("sequence").innerHTML = example[i];
						textSequence(++i);
				}, 150); // 1 second (in milliseconds)

		} else if (example.length == i) { // Loop
				textSequence(0);
		}

}

textSequence2(0);
function textSequence2(i) {

		if (example.length > i) {
				setTimeout(function() {
						document.getElementById("sequence2").innerHTML = example[i];
						textSequence2(++i);
				}, 175); // 1 second (in milliseconds)

		} else if (example.length == i) { // Loop
				textSequence2(0);
		}

}


function showhide() {
  var x = document.getElementById("sequence");
	var y = document.getElementById("anime1");
  if (x.style.display === "none") {
    x.style.display = "block";
		y.style.display="none";
  } else {
    x.style.display = "none";
		y.style.display="block";
  }
	// setInterval(showhide2, 5000);
	// var delayInMilliseconds = 2000; //1 second

	setTimeout(function() {
		  var x = document.getElementById("sequence2");
			var y = document.getElementById("anime2");
		  if (x.style.display === "none") {
		    x.style.display = "block";
				y.style.display="none";
		  } else {
		    x.style.display = "none";
				y.style.display="block";
		  }
	}, 3000);

}
// function showhide2() {
//   var x = document.getElementById("sequence2");
//   if (x.style.display === "none") {
//     x.style.display = "block";
//   } else {
//     x.style.display = "none";
//   }
//
// }
