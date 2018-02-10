app.controller('rent_space_ctrl',['$scope','$http',function($scope,$http){
    $scope.space = [];
    console.log("Angular Working Fine....");
    var token = localStorage.getItem("token");
    console.log("asd"+token);
    console.log($scope.space);

$scope.stripeCallback = function (code, result) {
    if (result.error) {
        window.alert('it failed! error: ' + result.error.message);
    } else {
        window.alert('success! token: ' + result.id);
    }
};

    $scope.rentSpace = function(latlng)
    {
        console.log($scope.space)
        $scope.space.lat = $(latlng.currentTarget).attr('latitude');
        $scope.space.lng = $(latlng.currentTarget).attr('longitude');
        
        console.log("LATLONG CONSOLE DISPLAY:");
        console.log( $scope.space.lat);
        console.log($scope.space.lng);
        // if($scope.space.terms)
        // { 
        //     if(!$scope.space.cityState)
        //     {
        //          notif({
        //               type: "success",
        //               msg: "Please Enter Your City",
        //               position: "right"
        //             });
        //             console.log("City Field Empty");
        //     }
        //     else if(!$scope.space.markerType)
        //     {
        //         notif({
        //               type: "success",
        //               msg: "Select Your Marker Price",
        //               position: "right"
        //             });
        //             console.log("Marker Not Choose");
        //     }
        //     else if(!$scope.space.cityState3)
        //     {
        //         notif({
        //               type: "success",
        //               msg: "Select Your State",
        //               position: "right"
        //             });
        //             console.log("State Not Selected");
        //     }
        //     else if(!scope.space.zip2)
        //     {
        //         notif({
        //               type: "success",
        //               msg: "Enter your Zipcode",
        //               position: "right"
        //             });
        //             console.log("Zipcode not Entered");
        //     }

        console.log($scope.space);
        $scope.space.token = token;
        console.log("AMENITEIS:")
        var amenities="";
        console.log($scope.space.amenities)
        if($scope.space.amenities.cctv)
        {
            amenities+="cctv,";
        }
        if($scope.space.amenities.indoor)
        {
            amenities+="indoor,";
        }
        if($scope.space.amenities.outdoor)
        {
            amenities+="outdoor,";
        }
        if($scope.space.amenities.covered)
        {
            amenities+="covered.";
        }
            $http({
                method  : 'POST',
                url     : __appurl + "website/rentspaces",
                data    :  { Title: $scope.space.Title, Description: $scope.space.Description, location: $scope.space.location, lat:$scope.space.lat, lng:$scope.space.lng, token:token, cityState:$scope.space.cityState, city: $scope.space.city, zipcode:$scope.space.zipcode, OwnerType:$scope.space.OwnerType, SpaceType:$scope.space.SpaceType.space,
                numberOfSpace:$scope.space.nspaces, parkingType:$scope.space.parkingType.park, SpaceDelinated:$scope.space.SpaceDelinated.delinated, amenities: amenities,
                material: $scope.space.material.material, HeightRestriction: $scope.space.HeightRestriction,  Hourly:$scope.space.Hourly, Daily:$scope.space.Daily, Weekly:$scope.space.Weekly, Monthly:$scope.space.Monthly, rpv:$scope.space.rpv, paidFor: $scope.space.markerType, deliveryAddress:$scope.space.deliveryAddress,dimensionOfSpace: $scope.space.dimensionOfSpace,
                deliveryState: $scope.space.cityState3.state, deliveryZip:$scope.space.zip2},
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) {
                console.log("Status: " + data.status); 
                if(data.status)
                {
                    console.log("Done!");
                    console.log("Message: " + data.message);
                    window.location.href= 'rentspace_payment';
                }
                else
                {
                    console.log("Status is false!");
                    console.log("Message: " + data.message);   
                }
            })
            .error( function (data){
               console.log(data) ;
            });
        
        // else
        // {
        //     console.log("Please Tick the terms and conditions");
        // }
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

//Selector options for States
    $scope.selectState = [
        {
            Id: 1,
            state: "Alabama"
        },
        {
            Id: 2,
            state: "Alaska"
        },
        {
            Id: 3,
            state: "Arizona"
        },
        {
            Id: 4,
            state: "Arkansas"
        },
        {
            Id: 5,
            state: "California"            
        },
        {
            Id: 6,
            state: "Colorado"
        },
        {
            Id: 7,
            state: "Connecticut"
        },
        {
            Id: 8,
            state: "Delaware"
        },
        {
            Id: 9,
            state: "District Of Columbia"
        },
        {
            Id: 10,
            state: "Florida" 
        },
        {
            Id: 11,
            state: "Georgia"
        },
        {
            Id: 12,
            state: "Hawaii"
        },
        {
            Id: 13,
            state: "Idaho"
        },
        {
            Id: 14,
            state: "Illinois"
        },
        {
            Id: 15,
            state: "Indiana"
        },
        {
            Id: 16,
            state: "Iowa"
        },
        {
            Id: 17,
            state: "Kansas"
        },
        {
            Id: 18,
            state: "Kentucky"
        },
        {
            Id: 19,
            state: "Louisiana"
        },
        {
            Id: 20,
            state: "Maine"
        },
        {
            Id: 21,
            state: "Maryland"
        },
        {
            Id: 22,
            state: "Massachusetts"
        },
        {
            Id: 23,
            state: "Michigan"
        },
        {
            Id: 24,
            state: "Minnesota"
        },
        {
            Id: 25,
            state: "Mississippi"
        },
        {
            Id: 26,
            state: "Missouri"
        },
        {
            Id: 27,
            state: "Montana"
        },
        {
            Id: 28,
            state: "Nebraska"
        },
        {
            Id: 29,
            state: "Nevada"
        },
        {
            Id: 30,
            state: "New Hampshire"
        },
        {
            Id: 31,
            state: "New Jersey"
        },
        {
            Id: 32,
            state: "New Mexico"
        },
        {
            Id: 33,
            state: "New York"
        },
        {
            Id: 34,
            state: "North Carolina"
        },
        {
            Id: 35,
            state: "North Dakota"
        },
        {
            Id: 36,
            state: "Ohio"
        },
        {
            Id: 37,
            state: "Oklahoma"
        },
        {
            Id: 38,
            state: "Oregon"
        },
        {
            Id: 39,
            state: "Pennsylvania"
        },
        {
            Id: 40,
            state: "Rhode Island"
        },
        {
            Id: 41,
            state: "South Carolina"
        },
        {
            Id: 42,
            state: "South Dakota"            
        },
        {
            Id: 43,
            state: "Tennessee"
        },
        {
            Id: 44,
            state: "Texas"
        },
        {
            Id: 45,
            state: "Utah"
        },
        {
            Id: 46,
            state: "Vermont"
        },
        {
            Id: 47,
            state: "Virginia"
        },
        {
            Id: 48,
            state: "Washington"
        },
        {
            Id: 49,
            state: "West Virginia"
        },
        {
            Id: 50,
            state: "Wisconsin"
        },
        {
            Id: 51,
            state: "Wyoming"
        }
    ];

//Selector options for Owner Type    

    $scope.ownerType = [
        {
            Id: 1,
            owner: "Individual"
        },
        {
            Id: 2,
            owner: "business"
        }
    ];

//Selector options for Space Type

    $scope.spaceType = [
        {
            Id: 1,
            space: "single"
        },
        {
            Id: 2,
            space: "multiple"
        }
    ];

//Selector options for Parking Type 

    $scope.parkingType = [
        {
            Id: 1,
            park: "Tandem"
        },
        {
            Id: 2,
            park: "Driveway"
        },
        {
            Id: 3,
            park: "Parking Lot"
        },
        {
            Id: 4,
            park: "Garage"
        },
        {
            Id: 5,
            park: "Other"
        }
    ];

//Selector options for Space Delinated    

    $scope.spaceDelinated = [
        {
            Id: 1,
            delinated: "Yes"
        },
        {
            Id: 2,
            delinated: "No"
        }
    ];

//Selector options for Amenities    

    $scope.Amenities = [
        {
            Id: 1,
            amenities: "Indoor"
        },
        {
            Id: 2,
            amenities: "Outdoor"
        },
        {
            Id: 3,
            amenities: "Covered"
        },
        {
            Id: 4,
            amenities: "CCTV"
        }
    ];

$scope.example14settings = {
        scrollableHeight: '200px',
        scrollable: true,
        enableSearch: true
    };

$scope.space.min = 2;
$scope.space.val = 1;

//Selector options for Surface Material    

    $scope.surfaceMaterial = [
        {
            Id: 1,
            material: "Asphalt"
        },
        {
            Id: 2,
            material: "Brick"
        },
        {
            Id: 3,
            material: "Concrete"
        },
        {
            Id: 4,
            material: "Gravel"
        },
        {
            Id: 5,
            material: "Dirt"
        },
        {
            Id: 6,
            material: "Lawn"
        },
        {
            Id: 7,
            material: "Other"
        }
    ];

}]);