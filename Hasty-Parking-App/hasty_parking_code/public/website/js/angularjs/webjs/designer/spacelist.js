app.controller('spacelist',['$scope','$http','$window',function($scope,$http){
   
    console.log("Inside Space List Controller")


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

    },

    $scope.getspaces = function() {
            

             $http({
                method  : 'POST',
                url     : __appurl + "website/getspacedetails",
                data    : {status:"1"},
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data)
            { 
                    console.log(data)
                if(data.status){
                    console.log("Inside Get Space")
                $scope.searchdetails = data.Searched_details.Searched_List;
                console.log($scope.searchdetails)
             // console.log($scope.searchdetails);
             // console.log($scope.searchdetails[0].LatLong);
                 }else{
                    console.log("Outside Get Space")
                     notif({
                                    type: "success",
                                    msg: data.message,
                                    position: "right"
                                  });
                            console.log("Fail to Sign Up...!!");
                 }

            });



      

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