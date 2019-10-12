<?php
  include('db.php');
	// Common::respond($params, "", true);
	if( Common::sendEmail($params["t"], $params["d"]) ){
		Common::respond("", "Your request has been received. We will get back to you soon.", true);
	}else{
		Common::respond("", "There was a problem submitting the form. Please try again later.", false);
	}
?>