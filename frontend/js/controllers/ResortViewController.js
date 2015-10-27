MetronicApp.controller('ResortViewController', ['ResortService', '$scope', '$stateParams', 'ResortNetworkService',
    function (ResortService, $scope, $stateParams, ResortNetworkService) {
    $scope.item = {};
    ResortService.get($stateParams.id).then(function(data){
        $scope.item = data;
        $scope.item.resortNetwork = {};
        ResortNetworkService.get($scope.item.resort_network_id).then(function(data){
            $scope.item.resortNetwork = data;
        });
    });
}]);