$(function(){
	$('a[href^="#"]').click(function(){
		var speed = 400;
		var href= $(this).attr("href");
		var target = $(href == "#" || href == "" ? 'html' : href);
		var position = target.offset().top;
		$("html, body").animate({scrollTop:position}, speed, "swing");
		return false;
	});
});

function addNavigationEvents(){
	$('#toggle-menu-button').click(function(){
		var navbar = $('#navbar');
		if (navbar.hasClass('active')) {
			navbar.removeClass('active');
		}else{
			navbar.addClass('active');
		}
		return false;
	});
}
