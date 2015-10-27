MetronicApp.controller('ResortNetworkCreateController', ['ResortNetworkService', '$scope', '$stateParams', '$state', function (ResortNetworkService, $scope, $stateParams, $state) {
    $scope.item = {};

    $scope.create = function() {
        ResortNetworkService.create({name: $scope.item.name}).then(function() {
            $state.go('app.resortNetwork');
        });
    }
}]);