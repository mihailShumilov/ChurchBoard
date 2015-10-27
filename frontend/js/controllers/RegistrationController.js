MetronicApp.controller('RegistrationController', ['$scope', 'UserService', '$state', function($scope, UserService, $state) {
    $scope.username = '';
    $scope.email = '';
    $scope.password = '';
    $scope.errors = [];

    $scope.register = function () {
        $scope.errors = [];
        UserService.create({
            username: $scope.username,
            email: $scope.email,
            password: $scope.password
        }).then(function() {
            $state.go('app.dashboard');
        }, function(data) {
            $scope.errors = data;
        });
    };
}]);