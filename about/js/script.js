$(function() {
  var scrollTo = function(className, offset){
  	$('html, body').animate({
      scrollTop: className?($(className).offset().top + offset):className
    }, 1000, 'easeOutCubic')
  }

	$("a#clients").click(function(e) {
		scrollTo(".s-cl", 0);
	})

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

	if(location.hash && location.hash.length){
   	var hash = decodeURIComponent(location.hash.substr(1));
   	console.log(hash)
   	switch(hash){
   		case 'clients':
   			scrollTo(".s-cl", 0);
   		break;

   		case 'testimonials':
   			scrollTo(".s-testi", 0);
   		break;
   	}
  }

  $("div.testi-main").hide();
  $($("div.testi-main")[0]).show();
  
  $('.carousel').carousel({
  	interval: false
  });

  $('.carousel').on('slide.bs.carousel', function (e) {
  	$($("div.testi-main")[e.from]).fadeOut();
  	$($("div.testi-main")[e.to]).fadeIn();
	  // console.log($($("div.testi-main")[e.to]))
	})
	// $(window).on("load", function(){
	// })
})