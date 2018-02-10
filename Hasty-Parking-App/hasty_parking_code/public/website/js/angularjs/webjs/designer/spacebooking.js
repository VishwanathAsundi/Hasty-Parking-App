app.controller('spacebooking',['$scope','$http',function($scope,$http){

      $scope.bookingDetails = function() {
       

             $http({
                method  : 'POST',
                url     : __appurl + "website/getbookingdetails",
                data    : {status:"1"},
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) { 
              
               console.log(data.startdate); 
              
               $scope.startdate = data.startdate;
               $scope.enddate = data.enddate;
               $scope.userid =data.userid;
               
              
        
              });
          },
          $scope.addVehicle = function() {
        
          
            console.log($scope.space);

             $http({
                method  : 'POST',
                url     : __appurl + "website/addvehicle",
                data    : $scope.space,
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) { 
    
               
              $scope.vehicleNumber = data.vehicleN;
               $scope.insuranceNumber = data.insuranceN;
               $scope.modelNumber = data.modelN;
               
              });

          },
          $scope.addCard = function(isValid,latlng){
             $scope.expiryDate= $(latlng.currentTarget).attr('et');

            alert('Card Added');
          
            console.log($scope.card)
            if(isValid)
            {
          

             $http({
                method  : 'POST',
                url     : __appurl + "website/addcard",
                data    : $scope.card,
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) { 
            
               
            });
          }
          else{
             console.log("No Data Sent from front-end");
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
                window.location.href = 'login'
            })
            .error( function (data){
               console.log(data) ;
            });

    }
     }]);