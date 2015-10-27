MetronicApp.controller('ResortNetworkViewController', ['ResortNetworkService', '$scope', '$stateParams', function (ResortNetworkService, $scope, $stateParams) {
    $scope.item = {};
    ResortNetworkService.get($stateParams.id).then(function(data){
        $scope.item = data;
    });
}]);