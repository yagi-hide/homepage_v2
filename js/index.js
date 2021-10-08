// ready
$(document).ready(function(){
	$('#headerlogo-wrapper').fadeIn(2000);
	setTimeout(function(){
		$('#headerlogo-wrapper').fadeOut(200);
	}, 4000);
	setTimeout(function(){
		//document.getElementById("nav").style.visibility="visible";
		window.location.href = './home.html';
	}, 4200);
});

window.onunload = function() {
	window.scrollTo(0,0);
	var gifImage = document.getElementById("headerlogo");
	gifImage.src = "/images/logo2.gif?" + (new Date).getTime();
}
