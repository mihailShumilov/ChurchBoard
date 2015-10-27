MetronicApp.service('LoginService', ['Restangular', '$q', '$window', '$state', function (Restangular, $q, $window, $state) {
    return {
        login: function (email, password) {
            var deferred = $q.defer();
            var login = Restangular.all('users/login').withHttpConfig({cache: false});
            login.post({
                email: email,
                password: password
            }).then(function (response) {
                $window.localStorage.setItem('access_token', response.access_token);
                $window.localStorage.setItem('user_id', response.user_id);
                deferred.resolve();
            }, function (response) {
                deferred.reject(response.data[0]);
            });
            return deferred.promise;
        },
        logout: function () {
            $window.localStorage.removeItem('access_token');
            $state.go('appl.login');
        },
        isLogged: function() {
            var token = $window.localStorage.getItem('access_token');
            return (typeof token == 'string' && token.length > 0);
        }
    }
}]);