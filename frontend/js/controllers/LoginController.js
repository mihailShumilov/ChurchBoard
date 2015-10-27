MetronicApp.controller('LoginController', ['$scope', 'LoginService', '$window', '$state', function($scope, LoginService, $window, $state) {
    $scope.email = '';
    $scope.password = '';
    $scope.error = {
        msg: ''
    };

    $scope.login = function () {
        $scope.error.msg = '';
        LoginService.login($scope.email, $scope.password).then(function() {
            $state.go('app.dashboard');
        }, function(data) {
            $scope.error.msg = data.message;
        });
    };
}]);