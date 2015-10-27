MetronicApp.controller('UserEditController', ['UserService', '$scope', '$stateParams', '$state', 'RoleService', '$timeout',
    function (UserService, $scope, $stateParams, $state, RoleService, $timeout) {
        $scope.user = {};
        $scope.roles = [];
        UserService.get($stateParams.id).then(function (data) {
            $scope.user = data;
        });

        RoleService.getAll().then(function(data) {
            for(var i = 0; i < data.length; i++) {
                if(data[i]['type'] == 1) {
                    $scope.roles.push(data[i]);
                }
            }
        });

        $scope.update = function () {
            UserService.update($scope.user.id, {username: $scope.user.username}).then(function(){
                var type = 'role';
                var params = $scope.credentials.role;
                if(params.length < 1) {
                    type = 'permission';
                    params = [];
                    for(var permission in $scope.credentials.permissions) {
                        if($scope.credentials.permissions[permission] == 1) {
                            params.push(permission);
                        }
                    }
                }
                UserService.setPermissions(type, params, $scope.user.id).then(function () {
                    $state.go('app.user');
                });
            });
        };
        $scope.roles = [];
        $scope.permissions = [];
        $scope.credentials = {
            role: '',
            permissions: {}
        };
        RoleService.getAll().then(function (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i]['type'] == 1) {
                    $scope.roles.push(data[i]);
                } else if (data[i]['type'] == 2) {
                    $scope.permissions.push(data[i]);
                }
            }
        });


        RoleService.getUser($stateParams.id).then(function(response) {
            var key = '';
            if(response.roles.length > 0) {
                for (key in response.roles) {
                    $scope.credentials.role = response.roles[key]['name'];
                }
            }
            $scope.credentials.permissions = {};
            if($scope.credentials.role.length < 1) {
                for (key in response.permissions) {
                    $scope.credentials.permissions[response.permissions[key]['name']] = 1;
                }
            }
        });
        $scope.$watch('credentials.role', function () {
            if ($scope.credentials.role.length > 0) {
                $scope.credentials.permissions = {};
                RoleService.get($scope.credentials.role).then(function (data) {
                    for (var key in data) {
                        $scope.credentials.permissions[data[key]['name']] = 1;
                    }
                });
            }
        });
        $scope.cleanRole = function () {
            $scope.credentials.role = '';
        }
    }]);