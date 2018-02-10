app.controller('web_login_ctrl',['$scope','$http',function($scope,$http){
    $scope.login = {};
    $scope.frgt = {};
    $scope.signup = {};
    
    console.log("Angular Working Fine......");
    
       $scope.webLogin = function(isValid)
    {
        console.log("User Valid: " + " " +isValid);
        
        if(isValid)
        {
            $http({
                method  : 'POST',
                url     : __appurl + "website/login",
                data    : $scope.login,
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) {
                
                if(data.status)
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
                else
                {
                    notif({
                      type: "success",
                      msg: data.message,
                      position: "right"
                    });
                }
            })
            .error( function (data){
               console.log(data);
            });

        }
    },
    $scope.signUp = function(isValid)
    {
        console.log("User is Valid"+ isValid);
    
         if(isValid)
        {
            console.log("ahsdla");
            $http({
                method  : 'POST',
                url     : __appurl + "website/signup",
                data    : $scope.signup,
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) {   
                console.log("Return data"+data);
                if(data.status)
                {
                    // alert(data.user_id)
                    localStorage.setItem("token", data.token);                   
                    window.location.href = 'otp';
                }
                else
                {
                 
                   notif({
                      type: "success",
                      msg: data.message,
                      position: "right"
                    });
                    console.log("false");
                }
            })
            .error( function (data){
               console.log(data);
            });
        }
    },
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
}]);
