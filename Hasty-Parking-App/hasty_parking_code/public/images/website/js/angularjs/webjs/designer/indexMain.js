app.controller('indexMain',['$scope','$http',function($scope,$http){
    $scope.login = {};
    $scope.frgt = {};
    
    console.log("In indexmain Angular Working Fine.");
    
    $scope.designerLogin = function(isValid)
    {
        console.log(isValid + "User is Valid");
        console.log($scope.login);
        if(isValid)
        {
            $http({
                method  : 'POST',
                url     : __appurl + "website/index",
                data    : $scope.login,
                headers : { 'Content-Type': 'application/json' }  
            })
            .success(function(data) {
                console.log(data);
                if(data.status)
                {
                    //alert(data.user_id +"and" +data.token)
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user_id", data.user_id);
                    console.log("redirect");
                    window.location.href = 'userList';
                }
                else
                {
                 
                    console.log("Check your credentials again");
                }
            })
            .error( function (data){
               console.log(data);
            });

        }
    }
    $scope.designerForgotPassword = function(isValid)
    {
                console.log(isValid);
       
    }
}]);
