MetronicApp.controller('UserController', ['UserService', '$scope', '$timeout', 'AccessService', '$confirm',
    function (UserService, $scope, $timeout, AccessService, $confirm) {
    Metronic.startPageLoading({animate: true});
    $scope.users = [];
    UserService.getAll().then(function (data) {
        $scope.users = data;
        $timeout(function(){
            TableAdvanced.init();
            Metronic.stopPageLoading();
        }, 700);
    });

    $scope.delete = function (id) {
        $confirm({text: 'Are you sure you want to delete?', title: 'Delete it', ok: 'Yes', cancel: 'No'}).then(function() {
            UserService.delete(id).then(function () {
                for (var i = 0; i < $scope.users.length; i++) {
                    if ($scope.users[i]['id'] == id) {
                        delete $scope.users[i];
                    }
                }
            });
        });
    };

    $scope.isAllowed = function (rule) {
        return AccessService.isAllowed(rule);
    }
}]);