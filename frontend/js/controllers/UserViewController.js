MetronicApp.controller('UserViewController', ['UserService', '$scope', '$stateParams', function (UserService, $scope, $stateParams) {
    $scope.user = {};
    UserService.get($stateParams.id).then(function(data){
        console.log(data);
        $scope.user = data;
    });
}]);