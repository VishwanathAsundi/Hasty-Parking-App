app.controller('myspacelist',['$scope','$http',function($scope,$http){
    var token = localStorage.getItem("token"); 
    console.log("Token"+token);
    console.log("Angular Working Fine.");
  
      $scope.getspaces = function() {
      

             $http({
                method  : 'POST',
                url     : __appurl + "website/getAllSpaces",
                data    : {token:token},
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) { 
              if(data.status){
             // alert(data);
              $scope.datas = data.mySpaceDetails;
              console.log($scope.datas);
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


        }  ,
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