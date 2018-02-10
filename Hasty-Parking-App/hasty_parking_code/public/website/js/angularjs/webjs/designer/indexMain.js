app.controller('indexMain',['$scope','$http',function($scope,$http){
    
        $scope.searchInput = function(isValid,latlng) {
        $scope.lat = $(latlng.currentTarget).attr('latitude');
        $scope.lng = $(latlng.currentTarget).attr('longitude');
        $scope.startdate = $(latlng.currentTarget).attr('st');
        $scope.enddate = $(latlng.currentTarget).attr('et');


         
     
        if(isValid)
        {
            console.log(isValid);
            console.log($scope.lng);
            console.log($scope.startdate);
              
            $http({
                method  : 'POST',
                url     : __appurl + "website/findSpace",
                data    : {lat:$scope.lat,lng:$scope.lng,startdate:$scope.startdate,enddate:$scope.enddate},
                headers : { 'Content-Type': 'application/json' }  
            })
           .success(function(data) {     
               if(data.status == true)
               {
                    console.log("true");
                    window.location.href = 'searchresult'
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
            });
       } else{
        console.log("No Data Sent from front-end")
       }
    },
    
    
    $scope.webLogin = function(isValid)
    {
        console.log(isValid + "User is Valid"+" ");
        
        if(isValid)
        {
            $http({
                method  : 'POST',
                url     : __appurl + "website/login",
                data    : $scope.login,
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) {
                
                if(data.status ==true)
                {
                    
                    $scope.user_id = data.userdetails._id;
                    $scope.token = data.userdetails.token;
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

 }]);