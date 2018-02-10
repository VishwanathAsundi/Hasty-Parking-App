console.log("Angular Initilized");
var __appurl = "http://localhost:8080/"

angular.module('app', ['facebook'])

        .config(function(FacebookProvider) {
          FacebookProvider.init('258885121181842');
        })

        .controller('signupController', function ($http,$scope, Facebook) {
          $scope.loginStatus = 'disconnected';
          $scope.facebookIsReady = false;
          $scope.reg = {};
          $scope.wblogin = {};
          $scope.webLoginForm = {};
          $scope.searchInput = {};
          $scope.frgt = {};


//Header Form Controller begins

var token = localStorage.getItem("token"); 
console.log("Token"+token);

$scope.userProfile = function(){

$http({
                method  : 'POST',
                url     : __appurl + "website/getinfo",
                data    : {token:token},
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) {
                console.log("Status: " + data.status); 
                if(data.status)
                {
                    $scope.datas = data;                    
                }
                // else
                // {
                //     notif({
                //       type: "success",
                //       msg: data.message,
                //       position: "right"
                //     });
                //     console.log("Message: " + data.message);   
                // }
            })
            .error( function (data){
               console.log(data) ;
            });
},
//Header Form User Profile Controler Ends

//Sign up Form Controller begins
         $scope.signUp = function(isValid)
            {
              console.log($scope.reg)
                console.log("User is Valid"+ isValid);
            
                 if(isValid)
                {         
                    console.log("Inside SignUp Controller");
                    $http({
                        method  : 'POST',
                        url     : __appurl + "website/signup",
                        data    : $scope.reg,
                        headers : { 'Content-Type': 'application/json' }  
                    })
                    .success(function(data) {   
                        console.log(data);
                        console.log('hi Hello outside');
                        if(data.status==true)
                        {   
                            console.log(' hi hello '+data.status);
                            localStorage.setItem("token", data.token);
                            window.location.href = 'otp_signup';
                        }
                        else if(data.status == false)
                        {                
                            notif({
                                    type: "success",
                                    msg: data.message,
                                    position: "right"
                                  });
                            console.log("Fail to Sign Up...!!");
                        }
                    })
                    .error( function (data){
                       console.log(data);
                    });
                }
            },
// Sign Up Form Controller Ends

//Forget Password ControllervBegins
    $scope.forgetPass = function(isValid) {
        console.log("Inside Frgt Contoller");
         console.log($scope.frgt);

             $http({
                method  : 'POST',
                url     : __appurl + "website/forgot_password",
                data    : $scope.frgt,
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) { 
             if(data.status == true){
             console.log("Success")
             console.log(data)
             localStorage.getItem("token", data.token);
             console.log(data.token)
            window.location.href = 'otp';
          }
          else{
             notif({
                      type: "success",
                      msg: data.message,
                      position: "right"
                    });
                    console.log("false");            
              }
          });

        },
        $scope.otpMatch = function(isValid)
        {
         console.log($scope.otp);

             $http({
                method  : 'POST',
                url     : __appurl + "website/otp_confirm",
                data    : $scope.otp,
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) { 
              if(data.status == true){
              console.log("kkll"+data);
               window.location.href = 'resetpassword_signup'
            }else{
              notif({
                      type: "success",
                      msg: data.message,
                      position: "right"
                    });
                    console.log("false");
            }
            })
            .error(function(data, status)
            {
              console.log('otp not matched')
            });  


        },
        $scope.otpMatch_signup=function(isValid)
        {
         console.log($scope.otp);

             $http({
                method  : 'POST',
                url     : __appurl + "website/otp_confirm_signup",
                data    : $scope.otp,
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) { 
              if(data.status == true){
              console.log("kkll"+data);
               window.location.href = 'index';
            }else{
              notif({
                      type: "success",
                      msg: data.message,
                      position: "right"
                    });
                    console.log("false");
            }
            })
            .error(function(data, status)
            {
              console.log('otp not matched')
            });  


        },
//Forget Password Controller Ends

//Reset Password Controller Begins
         $scope.resetPass_signup= function(isValid) {
             console.log("Inside resetpassword Password Controller")
         console.log($scope.rstPass);

             $http({
                method  : 'POST',
                url     : __appurl + "website/resetpassword_signup",
                data    : $scope.rstPass,
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) {

            if(data.status == true){
                localStorage.getItem("token", data.token);
                console.log(data.token)
                notif({
                      type: "success",
                      msg: data.message,
                      position: "right"
                    });
              window.location.href = 'login'
              }else{
                notif({
                      type: "success",
                      msg: data.message,
                      position: "right"
                    });
                    console.log("false");
              }
            })
            .error( function (data){
               console.log(data) ;
            });
        },

     $scope.resetPass= function(isValid) {
     console.log("Inside resetpassword Password Controller")
 console.log($scope.rstPass);

     $http({
        method  : 'POST',
        url     : __appurl + "website/resetpassword",
        data    : $scope.rstPass,
        headers : { 'Content-Type': 'application/json' }  
    })
    .success(function(data) {

    if(data.status == true){
        localStorage.getItem("token", data.token);
        console.log(data.token)
        notif({
              type: "success",
              msg: data.message,
              position: "right"
            });
      window.location.href = 'index'
      }else{
        notif({
              type: "success",
              msg: data.message,
              position: "right"
            });
            console.log("false");
      }
    })
    .error( function (data){
       console.log(data) ;
    });
}
//Reset Password Controller  Ends

// Web Social Login Controller  
            $scope.webLogin = function(socialid,name){
                    console.log("Inside Angular login Call");
                    console.log(socialid + " and " + name);
                    var myobj = {}

                    if(name == "google")
                    {     console.log("Inside G+:");
                        myobj.googleId = socialid
                    }
                    else if (name == "facebook")
                    {   console.log("Inside FB:");
                        myobj.facebookId = socialid
                    }
                    console.log(myobj)
                    // if(isValid)
                    // {
                        $http({
                            method  : 'POST',
                            url     : __appurl + "website/login",
                            data    : myobj,
                            headers : {'Content-Type': 'application/json'}  
                        })

                        .success(function(data){
                            console.log(data);
                            if(data.status == true)
                            {

                    $scope.user_id = data.userdetails._id;
                    $scope.token = data.userdetails.token;


                    // alert(data.user_id +""+" and "+""+ +data.token)
                    localStorage.setItem("token", data.userdetails.token);
                    localStorage.setItem("email", data.userdetails.user_id);

                    console.log("Token:"+data.userdetails.token);
                    console.log(localStorage.getItem("token"));
                    window.location.href = 'index';
                            }
                            else if (data.status == false)
                            {    notif({
                                    type: "success",
                                    msg: data.message,
                                    position: "right"
                                  });
                            }
                        })
                        .error(function (data){
                            console.log("Error:"+data);
                        })
                    // }
            },
// Web Social & Normal Login Controller Ends

//Web Normal Login

$scope.webNormalLogin = function(isValid){

                    console.log("Inside Angular login Call");
                    console.log($scope.webLoginForm);
                    if(isValid)
                    {
                        $http({
                            method  : 'POST',
                            url     : __appurl + "website/login",
                            data    : $scope.webLoginForm,
                            headers : {'Content-Type': 'application/json'}  
                        })

                        .success(function(data){
                            console.log(data);
                            if(data.status == true)
                            {   localStorage.setItem("token", data.userdetails.token);
                                window.location.href = 'index';
                            }
                            else if (data.status == false)
                            {
                                notif({
                                    type: "success",
                                    msg: data.message,
                                    position: "right"
                                  });
                            }
                        })
                        .error(function (data){
                            console.log("Error:"+data);
                        })
                    // }
            }
              },
//Web Normal Login Ends

// Facebook SignUp API
                $scope.login = function () {
                  Facebook.login(function(response) {
                    $scope.loginStatus = response.status;
                      Facebook.api('me?fields=id,name,email,first_name,last_name', function(response) {
                       $scope.reg.fname = response.first_name;
                       $scope.reg.lname = response.last_name;
                       $scope.reg.email = response.email;
                       $scope.reg.facebookId = response.id;
                       console.log($scope.reg.facebookId);
                       $scope.$apply();
                      });
                  });
                };
//Facebook Web Sign Up Api Ends


        $scope.searchInput = function(isValid,latlng) {
        $scope.lat = $(latlng.currentTarget).attr('latitude');
        $scope.lng = $(latlng.currentTarget).attr('longitude');
        $scope.startdate = $(latlng.currentTarget).attr('st');
        $scope.enddate = $(latlng.currentTarget).attr('et');
        console.log("Inside Sign up Controller search input")
        if(isValid)
        {
            console.log('User'+isValid);
            console.log("SGF"+ $scope.lng);
            console.log("dhcv"+ $scope.startdate);
            console.log("asdas"+$scope.enddate);
            
            if(!$scope.lat || !$scope.lng)
            {
                notif({
                      type: "success",
                      msg: "Please Enter the Location",
                      position: "right"
                    });   
            }
            else if(!$scope.startdate)
            {
                notif({
                      type: "success",
                      msg: "Enter StartDate",
                      position: "right"
                    });
            }
            else if(!$scope.enddate)
            {
                notif({
                      type: "success",
                      msg: "Enter EndDate",
                      position: "right"
                    });   
            }
            else if($scope.enddate<=$scope.startdate) 
            {
                notif({
                      type: "success",
                      msg: "EndDate should be greater than StartDate",
                      position: "right"
                    });
            }
            else
            {
                $http({
                    method  : 'POST',
                    url     : __appurl + "website/findSpace",
                    data    : {lat:$scope.lat,lng:$scope.lng,startdate:$scope.startdate,enddate:$scope.enddate},
                    headers : { 'Content-Type': 'application/json' }  
                })
                .success(function(data) {     
                   if(data.status)
                   {
                        console.log("true");
                        window.location.href = 'searchresult'
                   }
                   else
                   {
                        console.log("SERVER SIDE");
                        notif({
                          type: "success",
                          msg: data.message,
                          position: "right"
                        });
                        console.log("false");
                   }
                });    
            }
            
       } else{
        console.log("No Data Sent from front-end")
       }
    },    
    
//Facebook Web Login Api
$scope.fblogin = function () {
                        Facebook.login(function(response) {
                            $scope.loginStatus = response.status;                           
                                 Facebook.api('/me', function(response) {
                                 $scope.wblogin.facebookId = response.id;                                
                                 console.log($scope.wblogin.facebookId);                                 
                                 $scope.webLogin($scope.wblogin.facebookId,"facebook");              
                                });
                            });
                        };
//Facebook Web Login Api Ends



//Google+ Web Login Api
$scope.onGoogleSignIn = function(response){
                          $scope.wblogin.googleId = response.w3.Eea;
                          console.log($scope.wblogin.googleId);
                          
                          $scope.webLogin($scope.wblogin.googleId,"google");                          
                          },
//Google+ Web Login Api Ends


//Google Sign up Api Begins
                  $scope.onSignIn = function(response){
                  $scope.reg.fname = response.w3.ofa;
                  $scope.reg.lname = response.w3.wea;
                  $scope.reg.email = response.w3.U3;
                  $scope.reg.googleId = response.w3.Eea;
                          $scope.$apply();
                  },

//Google Sign Up Api Ends
                
  $scope.signout = function(){
        $http({
                method  : 'POST',
                url     : __appurl + "website/user_logout",
                data    : {status:"1"},
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) {
                window.location.href = 'login'
            })
            .error( function (data){
               console.log(data) ;
            });
    }
 



            $scope.$watch(function() {
              return Facebook.isReady();
            }, function(newVal) {
              if (newVal) {
                $scope.facebookIsReady = true;
              }
            }
          );
        })

       .controller('dropdown', ['$scope', function ($scope) {

       }])

//Google+ Directive for SignUp
      .directive('googleSignInButton',function(){
                return {
                    scope:{
                        gClientId:'@',
                        callback: '&onSignIn'
                    },
                    template: '<br /><button ng-click="onSignInButtonClick()" class="btn btn-block btn-social btn-md btn-google" type="button"><i class="fa fa-google"></i> Google</button>',
                    controller: ['$scope','$attrs',function($scope, $attrs){
                        gapi.load('auth2', function() {      //load in the auth2 api's, without it gapi.auth2 will be undefined
                            gapi.auth2.init(
                                    {
                                        client_id: $attrs.gClientId
                                    }
                            );
                            var GoogleAuth  = gapi.auth2.getAuthInstance();//get's a GoogleAuth instance with your client-id, needs to be called after gapi.auth2.init
                            $scope.onSignInButtonClick=function(){//add a function to the controller so ng-click can bind to it
                                GoogleAuth.signIn().then(function(response){//request to sign in
                                    $scope.callback({response:response});
                                });
                            },

                                $scope.onGoogleSignIn=function(){//add a function to the controller so ng-click can bind to it
                                GoogleAuth.signIn().then(function(response){//request to sign in
                                $scope.callback({response:response});
                                });
                            };
                        });
                  }]
                };
            })

//Verify Password
 .directive('passwordVerify', function() {
   return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController
      link: function(scope, elem, attrs, ngModel) {
         //if (!ngModel) return; // do nothing if no ng-model

         // watch own value and re-validate on change
         scope.$watch(attrs.ngModel, function() {
            validate();
         });

         // observe the other value and re-validate on change
         attrs.$observe('passwordVerify', function(val) {
            validate();
         });

         var validate = function() {
            // values
            var val1 = ngModel.$viewValue;
            var val2 = attrs.passwordVerify;

           // set validity
           ngModel.$setValidity('passwordVerify', val1 === val2);
        };
      }
   };
});