// app.controller('bookingDetails',['$scope','$http',function($scope,$http){
  
//   $scope.bookingdetail = function(req,res){
//   	$http({
//                 method  : 'POST',
//                 url     : __appurl + "website/spacehistorydetails",
//                 data    : {status:"1"},
//                 headers : { 'Content-Type': 'application/json' }  
//             })
//             .success(function(data) { 
            	
//             	 $scope.getdetails = data.Searched_details;
             
              

//             });
    
//   },
//   $scope.cancelbooking = function(orderid)
//   {
//     alert(orderid);
//         $http({
//                 method  : 'POST',
//                 url     : __appurl + "website/cancelbooking",
//                 data    : {orderid:orderid},
//                 headers : { 'Content-Type': 'application/json' }  
//             })
//             .success(function(data) { 
//                 console.log(data);
             
              

//             });

//   },
//   $scope.extendbooking = function(final){
//      var end = $(final.currentTarget).attr('et');
    
//     $http({
//         method  : 'POST',
//         url     : __appurl + "website/getOrderId",
//     })
//     .success(function(data){
//         console.log(end);
//         var orderId = data.orderId;
//         var EndDate = end.substring(0,10);
//         var EndDate1 = [];
//         EndDate1[2] = EndDate[0] + EndDate[1] + EndDate[2] + EndDate[3];
//         EndDate1[1] = EndDate[5] + EndDate[6];
//         EndDate1[0] = EndDate[8] + EndDate[9];

//         // var EndDate1 = [EndDate[2],EndDate[1],EndDate[0]];
//         EndDate = EndDate1[0] + '-' + EndDate1[1] + '-' + EndDate1[2];
//         console.log(EndDate);
//         var EndTime = end.substring(11,19);
//         $http({
//                method  : 'POST',
//                 url     : __appurl + "website/extendBooking",
//                 data    : {OrderId:orderId,EndTime:EndTime,EndDate:EndDate},
//                 headers : { 'Content-Type': 'application/json' }  
//         })
//         .success(function(data){
//             console.log("Status"+data.status)
//             console.log(data);
//         })
//     })
 
//   },
//   $scope.signout = function(){

//         $http({
//                 method  : 'POST',
//                 url     : __appurl + "website/user_logout",
//                 data    : {status:"1"},
//                 headers : { 'Content-Type': 'application/json' }  
//             })
//             .success(function(data) {
//               if(data.status){
//                 window.location.href = 'login'
//               }
//             })
//             .error( function (data){
//                console.log(data) ;
//             });

//     }

// }]);