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

angular
.module('careers', ['ui.router', 'ui.router.title', 'ngTable'])
.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/home");
  $stateProvider
  .state('home', {
    url: "/home",
    templateUrl: "templates/home.html",
    controller: 'hmCtrl',
    resolve: {
      $title: function() { return 'Agile Sense | Careers Home'; }
    }
  })
  .state('signup', {
    url: "/signup",
    templateUrl: "templates/signup.html",
    controller: 'signupCtrl',
    resolve: {
      $title: function() { return 'Agile Sense | Sign Up'; }
    }
  })
  .state('login', {
    url: "/login",
    templateUrl: "templates/login.html",
    controller: 'loginCtrl',
    resolve: {
      $title: function() { return 'Agile Sense | Login'; }
    }
  })
  .state('user', {
    url: "/user",
    templateUrl: "templates/user.html",
    controller: 'userCtrl',
    params: { u: null },
    resolve: {
      $title: function() { return 'Agile Sense | User Home'; }
    }
  })
  .state('jobs', {
    url: "/jobs",
    templateUrl: "templates/jobs.html",
    controller: 'jobsCtrl',
    resolve: {
      $title: function() { return 'Agile Sense | Jobs'; }
    }
  })
  .state('job', {
    url: "/job/:jobId",
    params: { user: null },
    templateUrl: "templates/job.html",
    controller: 'jobCtrl',
    resolve: {
      $title: function() { return 'Agile Sense | Job'; }
    }
  })
  .state('adminLogin', {
    url: "/admin",
    templateUrl: "templates/adminLogin.html",
    controller: 'admLoginCtrl',
    resolve: {
      $title: function() { return 'Agile Sense | Admin Login'; }
    }
  })
  .state('adminHome', {
    url: "/admin/home",
    templateUrl: "templates/adminHome.html",
    controller: 'admHomeCtrl',
    params: { u: null },
    resolve: {
      $title: function() { return 'Agile Sense | Admin Home'; }
    }
  })
})
.factory('utils', function($http, $q, $rootScope) {
	var def;
  return {
  	openModal: function(){
			$(".modal").modal("show")
		},
  	closeModal: function(){
			$(".modal").modal("hide");
		},
		download: function(file){
	  	var url = window.location.origin + window.location.pathname + file.dlPath;
	   	var link = document.createElement("a")
	    document.body.appendChild(link)  	
	    link.target = '_blank';
	    link.href = url;
	    link.download = file.name;
	    link.click()
	    document.body.removeChild(link)
		},
	  uploadProgress: function(evt){
	  	if (evt.lengthComputable) {
	  		var prog = Math.round(evt.loaded * 100 / evt.total)
	  		$rootScope.$broadcast("progress", { prog: prog })
      } else {
	  		$rootScope.$broadcast("progress", { prog: 0 })
      }
	  },
		uploadComplete: function(evt){
	    // l(evt.target.response)
	    var res = JSON.parse(evt.target.response)
	    // l(res);
	    def.resolve(res)
	  },
	  uploadFailed: function(evt) {
	    l("There was an error attempting to upload the file.")
	  },
	  uploadCanceled: function(evt) {
	    l("The upload has been canceled by the user or the browser dropped the connection.")
	  },
    post: function(url, data, files){
    	// l(data, files)

    	def = $q.defer()
      var fd = new FormData()
      var xhr = new XMLHttpRequest()

    	fd.append("params", angular.toJson(data))    	
    	if(files){
	      Object.keys(files).forEach(function(x){
	        fd.append("files[]", files[x])
	      })
    	}

      xhr.upload.addEventListener("progress", this.uploadProgress, false)
      xhr.addEventListener("load", this.uploadComplete, false)
      xhr.addEventListener("error", this.uploadFailed, false)
      xhr.addEventListener("abort", this.uploadCanceled, false)
      xhr.open("POST", url)
      xhr.send(fd)

    	return def.promise;
    }
  }
})
.controller('hmCtrl', function(){})
.controller('signupCtrl', function($scope, $timeout, $state, utils){
  scrollTo(0);

	// $scope.obj = { n:"a", e:"a@a", p:"a", cp:"a" };
	$scope.obj = { n:"", e:"", p:"", cp:"" };

	$scope.closeModal = function(){
		utils.closeModal()
	}
	
	$('.modal').on('hidden.bs.modal', function () {
    $scope.$apply(function(){    	
			if($scope.res.result){ $state.go('login') }
    })
	})

	$scope.signUp = function(){
		$scope.showLoader = true;
		if($scope.obj.p !== $scope.obj.cp){
			$scope.showLoader = false;
			$scope.res = {message: "Passwords do not match!"};
			utils.openModal()
		}else{		
			utils
			.post("backend/users.php", { t: "signup", d: $scope.obj })
			.then(function(res){
				$scope.showLoader = false;
				$scope.res = res;
				utils.openModal()
			})
		}
	}
})
.controller('loginCtrl', function($scope, $state, utils){
	scrollTo(0);
	// $scope.obj = { e:"a@a", p:"a", r: "usr" };
	$scope.obj = { e:"", p:"", r: "usr" };
	
	$scope.login = function(){
		$scope.showLoader = true;
		utils
		.post("backend/users.php", { t: "login", d: $scope.obj })
		.then(function(res){
			// l(res)
			$scope.showLoader = false;
			$scope.res = res;
			if(!res.result){
				utils.openModal()
			}else{
				$state.go('user', { u: res.data })
			}
		})
	}

	$scope.closeModal = function(){
		utils.closeModal()
	}
})
.controller('userCtrl', function($scope, $state, $stateParams, $filter, utils){
  scrollTo(0);
  $scope.opts = {
  	drop: [
	  	{ id: 0, value: "Actively Seeking" },
	  	{ id: 1, value: "Available" },
	  	{ id: 2, value: "Not at the Moment" },
	  	{ id: 3, value: "Don't Know" },
	  ],
	  skills: [
	  	{ id: 0, value: "Scrum Master" },
	  	{ id: 1, value: "Product Owner" },
	  	{ id: 2, value: "Agile Coach" },
	  	{ id: 3, value: "Agile Trainer" },
	  	{ id: 4, value: "Agile Project Manager" },
	  	{ id: 5, value: "Agile Programme Manager" },
	  	{ id: 6, value: "DevOps Engineer" },
	  	{ id: 7, value: "Project IQA (Independent Quality Assurance)" },
	  ],
	  files: []
  }
	
	function resetRef(){	
	  $scope.ref = {
	  	r_name: "",
	  	r_email: "",
	  	r_ph: "",
	  	r_hw: "",
	  	r_knw: 1
	  }
	}

  function setUser(usr){
		$scope.user = usr;
		$scope.user.dispName = angular.copy($scope.user.u_name);
		$scope.user.av = $filter('filter')($scope.opts.drop, {id: $scope.user.u_avail})[0];
  	delete $scope.opts.files;
  }

  $scope.download = function(file) {
  	utils.download(file) 	
	}

  $scope.refer = function() {
  	// l($scope.ref)
		$scope.showLoader = true;
  	$scope.ref.by = $scope.user.u_id;
  	$scope.ref.u_name = $scope.user.u_name;
  	utils
		.post("backend/users.php", { t:"refer", d: $scope.ref })
		.then(function(res){
			// l(res)
			$scope.showLoader = false;
			$scope.res = res;
			utils.openModal()
			if(res.result){
				resetRef()
			}
		})
  }

  $scope.update = function() {
		$scope.showLoader = true;
  	utils
		.post("backend/users.php", { t:"update", d: $scope.user }, $scope.opts.files)
		.then(function(res){
			// l(res)
			$scope.showLoader = false;
			$scope.res = res;
			utils.openModal()

			if(res.result){
				setUser(res.data)
			}
		})
  }

  $scope.$on("progress", function(e, data){
		l(data.prog)
		$scope.$apply(function(){
			$scope.progress = data.prog;
		})
  })

  if($stateParams.u == null){
    $state.go('login')
  }else{
  	resetRef()
		setUser($stateParams.u)
  }
})
.controller('jobsCtrl', function($scope, utils, NgTableParams){
	scrollTo(0);
	// l("jobsCtrl")
	$scope.showLoader = true;
	$scope.titleFilter = {
    j_title: {
      id: "text",
      placeholder: "Filter by Job Title",
    }
  }
  $scope.locFilter = {
    j_loc: {
      id: "text",
      placeholder: "Filter by Location",
    }
  }
  $scope.typeFilter = {
    j_type: {
      id: "select",
      placeholder: "Filter by Job Type",
    }
  }
  $scope.filterTypes = [
  	{
	    id: '',
	    title: 'Filter by Job Type'
	  },{
	    id: 'Permanent',
	    title: 'Permanent'
	  },{
	    id: 'Contract',
	    title: 'Contract'
	  }
  ]

	function getAllJobs(){		
		utils
		.post("backend/jobs.php", { t: "getAllJobs" })
		.then(function(res){
			// l(res)
			$scope.showLoader = false;
    	$scope.tableParams = new NgTableParams({filter: { j_type: ""}}, { dataset: res.data });		
		})
	}

	getAllJobs();
})
.controller('jobCtrl', function($scope, $state, $stateParams, utils){
	scrollTo(0);
	// l($stateParams)
	
	$scope.showLoader = true;

	function getJob(id){
		utils
		.post("backend/jobs.php", { t: "getJob", d: id })
		.then(function(res){
			// l(res)
			$scope.showLoader = false;
			$scope.job = res.data;
		})
	}

	$scope.back = function(){
		l("back")
		if($scope.user != null){
			// If admin -> back to admin page
			$state.go('adminHome', { u: $scope.user })
		}else{
			// Else job list
			$state.go('jobs')			
		}
	}

  if($stateParams.jobId == null){
    $state.go('jobs');
  }else{
  	$scope.user = $stateParams.user;
		getJob($stateParams.jobId);
  }
})
.controller('admLoginCtrl', function($scope, $state, utils){
	scrollTo(0);
	// l("admLoginCtrl")
	// $scope.obj = { e:"admin1", p:"admin1", r: "adm" };
	$scope.obj = { e:"", p:"", r: "adm" };
	
	$scope.login = function(){
		$scope.showLoader = true;
		utils
		.post("backend/users.php", { t: "login", d: $scope.obj })		
		.then(function(res){
			// l(res)
			$scope.showLoader = false;
			$scope.res = res;
			if(!res.result){
				utils.openModal()
			}else{
				$state.go('adminHome', { u: res.data })
			}
		})
	}

	$scope.closeModal = function(){
		utils.closeModal()
	}
})
.controller('admHomeCtrl', function($scope, $state, $stateParams, utils, NgTableParams){
	scrollTo(0);
	// l("admHomeCtrl")
	$scope.showLoader = true;
	// $scope.opts = {}
	// $scope.currJob = {
	// 	j_code: "J90901",
	// 	j_title: "Sampe Test Job",
	// 	j_desc: "Sample desciprtion Sample desciprtion",
	// 	j_loc: "Brackenfell",
	// 	j_type: "Permanent",
	// }
	$scope.currJob = {
		j_code: "",
		j_title: "",
		j_desc: "",
		j_loc: "",
		j_type: "Permanent",
	}

	$scope.titleFilter = {
    j_title: {
      id: "text",
      placeholder: "Filter by Job Title",
    }
  }

	$scope.deleteJob = function(id){
		// l(id)
		$scope.showLoader = true;
		utils
		.post("backend/jobs.php", { t: "deleteJob", d: id })
		.then(function(res){
			// l(res)
			$scope.showLoader = false;
			$scope.res = res;
			utils.openModal()
			if(res.result){
				// $scope.opts.jobs = res.data;
      	$scope.tableParams = new NgTableParams({}, { dataset: res.data });				
			}
		})
	}

	$scope.action = function(){
		$scope.showLoader = true;
		utils
		.post("backend/jobs.php", { t: "addJob", d: $scope.currJob })
		.then(function(res){
			// l(res)
			$scope.showLoader = false;
			$scope.res = res;
			utils.openModal()
			if(res.result){
				// $scope.opts.jobs = res.data;
      	$scope.tableParams = new NgTableParams({}, { dataset: res.data });				
			}
		})
	}

	function getAllJobs(){		
		utils
		.post("backend/jobs.php", { t: "getAllJobs" })
		.then(function(res){
			// l(res)
			$scope.showLoader = false;
			// $scope.opts.jobs = res.data;
      $scope.tableParams = new NgTableParams({}, { dataset: res.data });			
		})
	}

	if($stateParams.u == null){
    $state.go('adminLogin');
  }else{
		$scope.user = $stateParams.u;
		getAllJobs();
  }
})
.directive('fileModel', function ($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function(){
        scope.$apply(function(){          
          modelSetter(scope, element[0].files);
        });
      });
    }
  }
})