MetronicApp.controller('InventoryCreateController', ['InventoriesService', '$scope', '$stateParams', '$state', 'ResortService',
    function (InventoriesService, $scope, $stateParams, $state, ResortService) {
        $scope.item = {};
        $scope.resorts = {};
        ResortService.getAll().then(function(data) {
            $scope.resorts = data;
        });

        $scope.create = function () {
            InventoriesService.create($scope.item).then(function () {
                $state.go('app.inventory');
            });
        }
    }]);