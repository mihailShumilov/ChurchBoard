MetronicApp.controller('ResortController', ['ResortService', '$scope', '$timeout', 'AccessService', '$confirm',
    function (ResortService, $scope, $timeout, AccessService, $confirm){
    Metronic.startPageLoading({animate: true});
    $scope.items = [];
    ResortService.getAll().then(function (data) {
        $scope.items = data;
        $timeout(function(){
            TableAdvanced.init();
            Metronic.stopPageLoading();
        }, 700);
    });

    $scope.delete = function (id) {
        $confirm({text: 'Are you sure you want to delete?', title: 'Delete it', ok: 'Yes', cancel: 'No'}).then(function() {
            ResortService.delete(id).then(function () {
                for (var i = 0; i < $scope.items.length; i++) {
                    if ($scope.items[i]['id'] == id) {
                        delete $scope.items[i];
                    }
                }
            });
        });
    };
    $scope.isAllowed = function (rule) {
        return AccessService.isAllowed(rule);
    }
}]);