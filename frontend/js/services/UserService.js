MetronicApp.service('UserService', ['Restangular', '$q', '$window', function(Restangular, $q, $window) {
    return {
        getAll: function () {
            var deferred = $q.defer();
            var request = Restangular.all('').withHttpConfig({cache: false});
            request.get('users').then(function (response) {
                deferred.resolve(response.data);
            }, function () {
                deferred.reject();
            });
            return deferred.promise;
        },
        get: function(id) {
            var deferred = $q.defer();
            var request = Restangular.all('users');
            request.get(id).then(function (response) {
                deferred.resolve(response);
            }, function () {
                deferred.reject();
            });
            return deferred.promise;
        },
        update: function(id, params) {
            var deferred = $q.defer();
            var request = Restangular.all('users/'+id);
            request.customPUT(params).then(function (response) {
                deferred.resolve();
            }, function () {
                deferred.reject();
            });
            return deferred.promise;
        },
        create: function (params) {
            var deferred = $q.defer();
            var login = Restangular.all('users').withHttpConfig({cache: false});
            login.post(params).then(function (response) {
                deferred.resolve(response);
            }, function (response) {
                deferred.reject(response.data);
            });
            return deferred.promise;
        },
        delete: function(id) {
            var deferred = $q.defer();
            var request = Restangular.all('users/'+id);
            request.remove().then(function (response) {
                deferred.resolve();
            }, function () {
                deferred.reject();
            });
            return deferred.promise;
        },
        getPermissions: function() {
            var deferred = $q.defer();
            var request = Restangular.all('users');
            request.get('get-permissions', '', {
                'Authorization': 'Bearer ' + $window.localStorage.getItem('access_token')
            }).then(function (response) {
                deferred.resolve(response.data);
            }, function () {
                deferred.reject();
            });
            return deferred.promise;
        },
        setPermissions: function (type, params, userId) {
            var deferred = $q.defer();
            var request = Restangular.all('credentials/user/'+userId);
            request.customPUT({type: type, items: params}).then(function () {
                deferred.resolve();
            }, function () {
                deferred.reject();
            });
            return deferred.promise;
        }
    }
}]);