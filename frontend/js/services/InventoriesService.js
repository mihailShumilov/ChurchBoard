MetronicApp.service('InventoriesService', ['Restangular', '$q', function(Restangular, $q) {
    return {
        getAll: function () {
            var deferred = $q.defer();
            var request = Restangular.all('');
            request.get('inventories').then(function (response) {
                deferred.resolve(response.data);
            }, function () {
                deferred.reject();
            });
            return deferred.promise;
        },
        get: function(id) {
            var deferred = $q.defer();
            var request = Restangular.all('inventories');
            request.get(id).then(function (response) {
                deferred.resolve(response);
            }, function () {
                deferred.reject();
            });
            return deferred.promise;
        },
        update: function(id, params) {
            var deferred = $q.defer();
            var request = Restangular.all('inventories/'+id);
            request.customPUT(params).then(function (response) {
                deferred.resolve();
            }, function () {
                deferred.reject();
            });
            return deferred.promise;
        },
        create: function (params) {
            var deferred = $q.defer();
            var login = Restangular.all('inventories').withHttpConfig({cache: false});
            login.post(params).then(function (response) {
                deferred.resolve();
            }, function (response) {
                deferred.reject(response.data);
            });
            return deferred.promise;
        },
        delete: function(id) {
            var deferred = $q.defer();
            var request = Restangular.all('inventories/'+id);
            request.remove().then(function (response) {
                deferred.resolve();
            }, function () {
                deferred.reject();
            });
            return deferred.promise;
        }
    }
}]);