app.controller('dropdown_ctrl',['$scope','$http',function($scope,$http){


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
              }
              else{
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

    var token = localStorage.getItem("token"); 
    console.log("Token"+token);
    console.log("Angular Working Fine.");

            $http({
                method  : 'POST',
                url     : __appurl + "website/getinfo",
                data    : {token:token},
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) {
                console.log("Status: " + data.status); 
                if(data.status == true)
                {
                    $scope.datas = data;                    
                }
                else if(data.status == false)
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
               console.log(data) ;
            });
}]);
