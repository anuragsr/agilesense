var l = console.log.bind(window.console)
var scrollTo = function(className, offset){
	$('html, body').animate({
    scrollTop: className?($(className).offset().top + offset):className
  }, 1000, 'easeOutCubic')
}

$(function() {
	$("div.up").click(function(e) {
    scrollTo(0);
	})

	$(window).on("scroll", function(){
		var scr = $(window).scrollTop();
		if(scr > 200){
			$("div.up").css("opacity", 1);
			$("div.up").css("z-index", 2);
		}else{
			$("div.up").css("opacity", 0);
			$("div.up").css("z-index", -1);
		}
	})
})