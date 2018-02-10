app.controller('spacedetails',['$scope','$http',function($scope,$http){
      $scope.getDetails = function() {
       

             $http({
                method  : 'POST',
                url     : __appurl + "website/getparkingdetails",
                data    : {status:"1"},
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) { 
              // console.log(data.Searched_details);
              //console.log(data); 
//              console.log('akanksha'+data.Searched_details[0]);
        
            console.log(data.Searched_details);
               $scope.getdetails = data.Searched_details;
               $scope.startdate = data.startdate;
               $scope.enddate = data.enddate;
               console.log($scope.getdetails);
            
            });
        },
        $scope.bookingId = function() {


        	$http({
                method  : 'POST',
                url     : __appurl + "website/getparkingId",
                data    : {status:"1"},
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) { 

                window.location.href = 'spacebooking';

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

    },
    $scope.getpastbooking = function()
    {
        // alert("testinnnnng"+userid);
        //  $http({
        //         method  : 'POST',
        //         url     : __appurl + "website/getUpcomingPastDetails",
        //         data    : {status:"1"},
        //         headers : { 'Content-Type': 'application/json' }  
        //     })
        //     .success(function(data) {

        //         console.log("testing"+data);
                window.location.href = 'bookedhistory';
            // })
            // .error( function (data){
            //    console.log(data) ;
            // });

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
            })
            .error( function (data){
               console.log(data) ;
            });

    }


    

 }]);