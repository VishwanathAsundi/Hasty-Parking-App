app.controller('mybooking',['$scope','$http',function($scope,$http){

$scope.getparkingid = function(placeid,orderId){
    
    
    $http({
                method  : 'POST',
                url     : __appurl + "website/bookedhistory",
                data    : {placeid:placeid,orderId:orderId},
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) { 
              
           });
      },
    
         $scope.getpastbooking = function(req,res){
                

                $http({
                method  : 'POST',
                url     : __appurl + "website/getUpcomingPastDetails",
                data    : {status:"1"},
                headers : { 'Content-Type': 'application/json' }  
                 })
                .success(function(data) { 
                    console.log(data);
                 console.log('Status-->'+data.status+' message-->'+data.message);
                console.log('called getpastbooking');
                console.log('result-->'+data.bookingDetails);
                console.log('called getpastbooking'); 
                if(data.status)
                {
                    if(data.bookingDetails.bookingListPast.length!=0 && data.bookingDetails.bookingListUpcoming.length!=0)
                    {
                    $scope.bookedhistory = data.bookingDetails.bookingListPast;
                    $scope.upcoming=data.bookingDetails.bookingListUpcoming;
                    console.log('Upcoming-->'+$scope.upcoming[0].bookingId);
                    }
                    else if(data.bookingDetails.bookingListPast.length!=0)
                    {
                        $scope.bookedhistory = data.bookingDetails.bookingListPast;
                    }
                    else if(data.bookingDetails.bookingListUpcoming.length!=0)
                    {
                        $scope.upcoming=data.bookingDetails.bookingListUpcoming;
                    }
                    else
                    {
                      notif({
                          type: "success",
                          msg:'no result found',
                          position: "right"
                        });
                    }
                }
                else
                {
                         notif({
                          type: "success",
                          msg:data.message,
                          position: "right"
                        });
                   

                }
                
                                
            });
        },
        $scope.getparkingid = function(placeid,orderId,startDate,endDate,amount)
        {
    
    // alert('lllll'+placeid);
    // // alert('orderId'+orderId);
    // alert(startDate);
    // alert(endDate);
    $http({
                method  : 'POST',
                url     : __appurl + "website/bookedhistory",
                data    : {placeid:placeid,orderId:orderId,startDate:startDate,endDate:endDate,totalamount:amount},
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) { 
              
              
              //alert(data);

              // if(data.status){
             
             //  $scope.bookedhistory = data.bookingDetails.bookingListPast;
             //  console.log($scope.bookedhistory);

              

            //window.location.href = 'resetpassword';
       // }
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