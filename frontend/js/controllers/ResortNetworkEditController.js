MetronicApp.controller('ResortNetworkEditController', ['ResortNetworkService', '$scope', '$stateParams', '$state', function (ResortNetworkService, $scope, $stateParams, $state) {
    $scope.item = {};
    ResortNetworkService.get($stateParams.id).then(function(data){
        $scope.item = data;
    });

    $scope.update = function() {
        ResortNetworkService.update($scope.item.id, $scope.item).then(function() {
            $state.go('app.resortNetwork');
        });
    }
}]);