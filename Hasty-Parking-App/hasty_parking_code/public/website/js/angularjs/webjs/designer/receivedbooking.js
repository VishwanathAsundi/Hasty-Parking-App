app.controller('receivedbooking',['$scope','$http','$window',function($scope,$http){
            
            console.log('called receivedbooking');
            var token = localStorage.getItem("token"); 
            console.log("receivedbooking Token"+token);

    $scope.getpastbooking= function(req,res){
                console.log('getreceivebooking called');
                $http({
                method  : 'POST',
                url     : __appurl + "website/getAllSpaces",
                data    : {token:token},
                headers : { 'Content-Type': 'application/json' }  
                 })
                .success(function(data) { 
                console.log(data);
                console.log('upcoming-->'+data.spaceListReceivedBooking.bookingListUpcoming);
                console.log('Past-->'+data.spaceListReceivedBooking.bookingListPast);
                console.log('called get all spaces');                
                $scope.bookedhistory = data.spaceListReceivedBooking.bookingListPast;
                $scope.upcoming=data.spaceListReceivedBooking.bookingListUpcoming;
                
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
     $scope.getparkingid = function(result,userdtls)
     {
      console.log('getparkingid_receive called');
      console.log('Details-->'+result.mySpaceId+' '+result.bookingId+' '+result.start+''+result.end+''+result.paidAmount+''+result.duration+' '+userdtls.userName);
      $http({
                method  : 'POST',
                url     : __appurl + "website/bookedhistory",
                data    : {placeid:result.mySpaceId,orderId:result.bookingId,startDate:result.start,endDate:result.end,totalamount:result.paidAmount,totalhours:result.duration,userdetails:userdtls,cardetails:result},
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) { 
          
   
        });
      }

 
}]);