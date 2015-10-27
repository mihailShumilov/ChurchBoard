MetronicApp.controller('InventoryViewController', ['InventoriesService', '$scope', '$stateParams', 'ResortService',
    function (InventoriesService, $scope, $stateParams, ResortService) {
    $scope.item = {};
    InventoriesService.get($stateParams.id).then(function(data){
        $scope.item = data;
        $scope.item.resort = {};
        ResortService.get($scope.item.resort_id).then(function(data) {
            $scope.item.resort = data;
        });

    });
}]);