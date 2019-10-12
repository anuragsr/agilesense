var l = console.log.bind(window.console)
function initMap(){	
	var center = {lat: -33.832500, lng: 18.647499}
	, map = new google.maps.Map(document.getElementById('map'), {
	  center: center,
	  zoom: 14
	})
	, marker = new google.maps.Marker({
	  position: center,
	  map: map
	})
}

function scrollTo(className, offset){
	$('html, body').animate({
    scrollTop: className?($(className).offset().top + offset):className
  }, 1000, 'easeOutCubic')
}

function recaptchaCallback() {
  $('#hiddenRecaptcha').valid();
}

function uploadComplete(evt){
	$(".loader-ol").hide();
  l(evt.target.response)
  var res = JSON.parse(evt.target.response)
  l(res)
  
  if(res.result){
		$(".modal-su").modal("show")
  }else{
		$(".modal-fa").modal("show")
  }
}

function uploadFailed(evt) {
  l("There was an error attempting to upload the file.")
}

function uploadCanceled(evt) {
  l("The upload has been canceled by the user or the browser dropped the connection.")
}

$(function() {
	$(".loader-ol").hide();

  $("a#services").click(function(e){
		scrollTo(".s-services", 0);
	})

	$("a#clients").click(function(e){
		scrollTo(".s-cl", 0);
	})

	$("a#discussion").click(function(e){
		scrollTo(".s-dis", 5);
	})

	$("a#contact").click(function(e){
		scrollTo(".s-contact", 5);
	})

  $("#contactForm").validate({
  	ignore: ".ignore",
  	submitHandler: function(form) {
  		$(".loader-ol").show();
			var data = {};
	    var fd = new FormData()
      var xhr = new XMLHttpRequest()
	  	var url = "services/common/email.php";

			data.t = "contact";
			data.d = $(form).serializeArray().reduce(function(a, x) { 
	    	if(x.name != "g-recaptcha-response")
	    		a[x.name] = x.value;
	    	return a; 
	    }, {});

      fd.append("params", JSON.stringify(data))

      xhr.addEventListener("load", uploadComplete, false)
      xhr.addEventListener("error", uploadFailed, false)
      xhr.addEventListener("abort", uploadCanceled, false)
      xhr.open("POST", url)
      xhr.send(fd)

	  },
	  rules: {
      name: {
        required: true,
        minlength: 2
      },
      email: {
        required: true,
        email: true
      },
      ph: {
        required: true,
      },
      title: {
        required: true,
      },
      org: {
        required: true,
      },
      message: {
        required: true,
        minlength: 10
      },
	    hiddenRecaptcha: {
	      required: function () {
	        if (grecaptcha.getResponse() == '') {
	          return true;
	        } else {
	          return false;
	        }
	      }
	    }
  	}
  })

	$("div.up").click(function(e){
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
   	// console.log(hash)
   	switch(hash){
   		case 'services':
   			scrollTo(".s-services", 0);
   		break;

   		case 'clients':
   			scrollTo(".s-cl", 0);
   		break;

   		case 'discussion':
   			scrollTo(".s-dis", 5);
   		break;

   		case 'contact':
   			scrollTo(".s-contact", 5);
   		break;
   	}
  }
})