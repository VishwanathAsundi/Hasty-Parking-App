var app=angular.module('app', ['uiGmapgoogle-maps']);

app.controller('dropdown_ctrl',['$scope','$http',function($scope,$http){
    var token = localStorage.getItem("token"); 
    console.log("Token"+token);
    console.log("Angular Working Fine.Angular Working Fine.+ dropdown_ctrl+profile json");

            $http({
                method  : 'POST',
                url     : __appurl + "website/getinfo",
                data    : {token:token},
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) {
                console.log("Status: " + data.status); 
                if(data.status)
                {
                    $scope.info= data;                    
                    console.log('Info-->'+$scope.info);
                }
                else
                {
                  console.log(data);
                    console.log("Message: " + data.message);   
                }
            })
            .error( function (data){
               console.log(data) ;
            });
}]);


app.factory('Scopes', function ($rootScope) {
      var mem = {};
   
      return {
          store: function (key, value) {
              mem[key] = value;
          },
          get: function (key) {
              return mem[key];
          }
      };
});


app.controller('mainCtrl', function($scope,Scopes) {
});



app.controller('profileDetails',['$scope','$http','Scopes',function($scope,$http,Scopes)
{

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
                if(data.status)
                {
                    $scope.datas = data;
                    console.log('called getinfo');
                    console.log(data);                    
                }
                else
                {
                    console.log("Message: " + data.message);   
                }
            });


              $scope.getpastbooking = function(req,res){
              console.log('getpastbooking');                

                $http({
                method  : 'POST',
                url     : __appurl + "website/getUpcomingPastDetails",
                data    : {status:"1"},
                headers : { 'Content-Type': 'application/json' }  
                 })
                .success(function(data) { 
                if(data.status)
                {
                    console.log(data);
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
                    console.log('hi');
                    console.log(data);
                         notif({
                          type: "success",
                          msg:data.message,
                          position: "right"
                        });
                   

                }
 
                
            });

        },
        $scope.getparkingid_past = function(placeid,orderId,startDate,endDate,amount)
        {
        console.log('getparkingid_past called');
        $http({
                method  : 'POST',
                url     : __appurl + "website/bookedhistory",
                data    : {placeid:placeid,orderId:orderId,startDate:startDate,endDate:endDate,totalamount:amount},
                headers : { 'Content-Type': 'application/json'}  
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
    $scope.getparkingid_receive = function(result,userdtls){
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
},

   $scope.receivebooking = function(){

                      $http({
                method  : 'POST',
                url     : __appurl + "website/getAllSpaces",
                data    : {token:token},
                headers : { 'Content-Type': 'application/json' }  
                 })
                .success(function(data)
              { 
                if(data.status)
                {
                    console.log(data);
                    console.log('hi hello receivebooking');

                    $scope.bookedupcoming=data.spaceListReceivedBooking.bookingListUpcoming; 
                    $scope.bookedpast=data.spaceListReceivedBooking.bookingListPast; 
                    console.log("hi hello receivebooking"+$scope.bookedupcoming);
                }
                else
                {
                    console.log('bye');
                    console.log(data);
                        notif({
                          type: "success",
                          msg:data.message,
                          position: "right"
                        });              

                } 
            });
        },
      $scope.getspaces = function() 
      { 
             console.log('inside the function');

             $http({
                method  : 'POST',
                url     : __appurl + "website/getAllSpaces",
                data    : {token:token},
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) 
            { 
              if(data.status)
              {
                  console.log('called getAllSpaces')
                  $scope.datas=data.mySpaceDetails;
                  Scopes.store('mySpaceList',$scope.datas);
                  console.log('get All Spaces-->'+$scope.datas[0].mySpaceName);
                  var centerpoint=$scope.datas[0].latLong.split(',');
                  for(var i=0;i<$scope.datas.length;i++)
                  {

                    var LatLong=$scope.datas[i].latLong.split(',');
                    $scope.datas[i].map= {center: {latitude: LatLong[1], longitude: LatLong[0]}, zoom: 16};
                    $scope.datas[i].options = {scrollwheel: false};
                    $scope.datas[i].coordsUpdates = 0;
                    $scope.datas[i].dynamicMoveCtr = 0;
                    $scope.datas[i].marker = 
                    {
                      id: i,
                      coords:
                      {
                        latitude: LatLong[1],
                        longitude: LatLong[0]
                      },
                      options: { draggable: false },
                      events:
                      {
                        dragend: function (marker, eventName, args) 
                        {
                          $log.log('marker dragend');
                          var lat = marker.getPosition().lat();
                          var lon = marker.getPosition().lng();
                          $log.log(lat);
                          $log.log(lon);

                          $scope.datas[i].marker.options = 
                          {
                            draggable: true,
                            labelContent: "lat: " + $scope.datas[i].marker.coords.latitude + ' ' + 'lon: ' + $scope.datas[i].marker.coords.longitude,
                            labelAnchor: "1000",
                            labelClass: "marker-labels"
                          };
                        }
                      }
                    };
                  }
              }
              else
              {
                  console.log('Hello');
                  console.log(data);
                  notif({
                          type: "success",
                          msg:data.message,
                          position: "right"
                        });              
              }
            })

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
  