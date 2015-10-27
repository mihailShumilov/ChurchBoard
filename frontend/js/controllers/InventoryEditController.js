MetronicApp.controller('InventoryEditController', ['InventoriesService', '$scope', '$stateParams', '$state', 'ResortService',
    function (InventoriesService, $scope, $stateParams, $state, ResortService) {
        $scope.item = {};
        $scope.resorts = {};

        ResortService.getAll().then(function (data) {
            $scope.resorts = data;
        });
        InventoriesService.get($stateParams.id).then(function (data) {
            $scope.item = data;
        });
        $scope.update = function () {
            InventoriesService.update($scope.item.id, $scope.item).then(function () {
                $state.go('app.inventory');
            });
        }
    }]);