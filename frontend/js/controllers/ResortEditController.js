MetronicApp.controller('ResortEditController', ['ResortService', '$scope', '$stateParams', '$state', 'ResortNetworkService',
    function (ResortService, $scope, $stateParams, $state, ResortNetworkService) {
        $scope.item = {};
        $scope.resortNetworks = {};
        ResortNetworkService.getAll().then(function(data){
            $scope.resortNetworks = data;
        });
        ResortService.get($stateParams.id).then(function (data) {
            $scope.item = data;
        });

        $scope.update = function () {
            ResortService.update($scope.item.id, $scope.item).then(function () {
                $state.go('app.resort');
            });
        }
    }]);