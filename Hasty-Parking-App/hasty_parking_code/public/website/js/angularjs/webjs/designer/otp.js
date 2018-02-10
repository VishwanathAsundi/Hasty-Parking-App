app.controller('otpController',['$scope','$http',function($scope,$http){

  
      $scope.otpMatch = function(isValid) {
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
            .error(function(data, status)
            {
              console.log('otp not matched')
            });  


        } ,
        $scope.signout = function(){

        $http({
                method  : 'POST',
                url     : __appurl + "website/user_logout",
                data    : {status:"1"},
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) {
              if(data.status){
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

    }
    

    

 }]);