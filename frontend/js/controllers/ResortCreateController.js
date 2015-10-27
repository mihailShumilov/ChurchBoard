MetronicApp.controller('ResortCreateController', ['ResortService', '$scope', '$stateParams', '$state', 'ResortNetworkService',
    function (ResortService, $scope, $stateParams, $state, ResortNetworkService) {
        $scope.item = {};
        $scope.resortNetworks = [];

        ResortNetworkService.getAll().then(function(data) {
            $scope.resortNetworks = data;
        });

        $scope.create = function () {
            ResortService.create($scope.item).then(function () {
                $state.go('app.resort');
            });
        }
    }]);