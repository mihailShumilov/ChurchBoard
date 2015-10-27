/***
 Metronic AngularJS App Main Script
 ***/

/* Metronic App */
var MetronicApp = angular.module("MetronicApp", [
    "ui.router",
    "ui.bootstrap",
    "oc.lazyLoad",
    "ngSanitize",
    'restangular',
    'angular-confirm'
]);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
MetronicApp.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        cssFilesInsertBefore: 'ng_load_plugins_before' // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
    });
}]);

MetronicApp.config(['RestangularProvider', function (RestangularProvider) {
    RestangularProvider.setBaseUrl('PLACE_BASE_URL');
}]);

/********************************************
 BEGIN: BREAKING CHANGE in AngularJS v1.3.x:
 *********************************************/
/**
 `$controller` will no longer look for controllers on `window`.
 The old behavior of looking on `window` for controllers was originally intended
 for use in examples, demos, and toy apps. We found that allowing global controller
 functions encouraged poor practices, so we resolved to disable this behavior by
 default.

 To migrate, register your controllers with modules rather than exposing them
 as globals:

 Before:

 ```javascript
 function MyController() {
  // ...
}
 ```

 After:

 ```javascript
 angular.module('myApp', []).controller('MyController', [function() {
  // ...
}]);

 Although it's not recommended, you can re-enable the old behavior like this:

 ```javascript
 angular.module('myModule').config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);
 **/

//AngularJS v1.3.x workaround for old style controller declarition in HTML
MetronicApp.config(['$controllerProvider', '$httpProvider', function ($controllerProvider, $httpProvider) {
    // this option might be handy for migrating old apps, but please don't use it
    // in new ones!
    $controllerProvider.allowGlobals();
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.interceptors.push([
        '$window',
        function ($window) {
            return {
                request: function (config) {
                    $httpProvider.defaults.headers.common['Authorization'] = 'Bearer ' + $window.localStorage.getItem('access_token');
                    return config;
                }
            };
        }
    ]);
}]);

/********************************************
 END: BREAKING CHANGE in AngularJS v1.3.x:
 *********************************************/

/* Setup global settings */
MetronicApp.factory('settings', ['$rootScope', function ($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        layoutImgPath: Metronic.getAssetsPath() + 'img/',
        layoutCssPath: Metronic.getAssetsPath() + 'css/'
    };

    $rootScope.settings = settings;

    return settings;
}]);

/* Setup App Main Controller */
MetronicApp.controller('AppController', ['$scope', '$rootScope', '$ocLazyLoad', '$window', '$state',
    function ($scope, $rootScope, $ocLazyLoad, $window, $state) {
        $scope.$on('$viewContentLoaded', function () {
            Metronic.initComponents();
            $ocLazyLoad.load([
                'js/services/LoginService.js'
            ]);
        });
    }]);

/***
 Layout Partials.
 By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial
 initialization can be disabled and Layout.init() should be called on page load complete as explained above.
 ***/

/* Setup Layout Part - Header */
MetronicApp.controller('HeaderController', ['$scope', 'LoginService', '$window', 'UserService', 'AccessService',
    function ($scope, LoginService, $window, UserService, AccessService) {
        $scope.isLogged = LoginService.isLogged();
        if ($scope.isLogged) {
            $scope.user = {};
            UserService.get($window.localStorage.getItem('user_id')).then(function (data) {
                $scope.user = data;
            });
            if (AccessService.userAccessRights === null) {
                UserService.getPermissions().then(function (data) {
                    AccessService.userAccessRights = data;
                });
            }
        }
        $scope.$on('$includeContentLoaded', function () {
            Layout.initHeader(); // init header
        });
        $scope.logout = function () {
            LoginService.logout();
        };

    }]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', ['$scope', 'AccessService', function ($scope, AccessService) {
    $scope.isAllowed = function(rule) {
        return AccessService.isAllowed(rule);
    };
    $scope.$on('$includeContentLoaded', function () {
        Layout.initSidebar(); // init sidebar
    });
}]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('PageHeadController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Demo.init(); // init theme panel
    });
}]);

/* Setup Layout Part - Footer */
MetronicApp.controller('FooterController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        Layout.initFooter(); // init footer
    });
}]);

/* Setup Rounting For All Pages */
MetronicApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    // Redirect any unmatched url
    $urlRouterProvider.otherwise(function () {
        return "/app/dashboard";
    });

    $urlRouterProvider.when('', '/app/dashboard');
    $urlRouterProvider.when('/', '/app/dashboard');


    $stateProvider
        //logged layout
        .state('app', {
            abstract: true,
            url: '/app',
            templateUrl: 'tpl/app.html',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        files: [
                            'js/services/LoginService.js'
                        ]
                    });
                }]
            }
        })
        //Not logged layout
        .state('appl', {
            abstract: true,
            url: '/appl',
            templateUrl: 'tpl/appl.html',
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        files: [
                            'js/services/LoginService.js'
                        ]
                    });
                }]
            }
        })
        //Login
        .state('appl.login', {
            url: "/login",
            templateUrl: "views/login.html",
            data: {pageTitle: 'Login', requireLogin: false},
            controller: "LoginController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        files: [
                            'js/controllers/LoginController.js'
                        ]
                    });
                }]
            }
        })
        .state('appl.reset', {
            url: "/reset",
            templateUrl: "views/reset.html",
            data: {pageTitle: 'Forgot my password', requireLogin: false},
            controller: "ResetPasswordController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetroncApp',
                        files: [
                            'js/controllers/ResetPasswordController.js'
                        ]
                    })
                }]
            }
        })
        .state('appl.registration', {
            url: "/registration",
            templateUrl: "views/registration.html",
            data: {pageTitle: 'Login', requireLogin: false},
            controller: "RegistrationController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        files: [
                            'js/controllers/RegistrationController.js'
                        ]
                    });
                }]
            }
        })
        .state('app.dashboard', {
            url: "/dashboard",
            templateUrl: "views/dashboard.html",
            data: {
                pageTitle: 'Dashboard',
                requireLogin: true,
            },
            controller: "DashboardController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/controllers/DashboardController.js'
                        ]
                    });
                }]
            }
        })
        .state('app.resortNetwork', {
            url: "/resortNetwork",
            templateUrl: "views/resortNetwork/list.html",
            data: {
                pageTitle: 'Resort Network',
                requireLogin: true,
                access: 'resort_network:list'
            },
            controller: "ResortNetworkController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/controllers/ResortNetworkController.js',
                            'js/services/ResortNetworkService.js',
                            'js/scripts/table-advanced.js'
                        ]
                    });
                }]
            }
        })
        .state('app.resortNetworkCreate', {
            url: "/resortNetwork/create",
            templateUrl: "views/resortNetwork/create.html",
            data: {
                pageTitle: 'Resort Network',
                requireLogin: true,
                access: 'resort_network:create'
            },
            controller: "ResortNetworkCreateController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/controllers/ResortNetworkCreateController.js',
                            'js/services/ResortNetworkService.js'
                        ]
                    });
                }]
            }
        })
        .state('app.resortNetworkEdit', {
            url: "/resortNetwork/edit/:id",
            templateUrl: "views/resortNetwork/edit.html",
            data: {
                pageTitle: 'Resort Network',
                requireLogin: true,
                access: 'resort_network:update'
            },
            controller: "ResortNetworkEditController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/controllers/ResortNetworkEditController.js',
                            'js/services/ResortNetworkService.js'
                        ]
                    });
                }]
            }
        })
        .state('app.resortNetworkView', {
            url: "/resortNetwork/view/:id",
            templateUrl: "views/resortNetwork/view.html",
            data: {
                pageTitle: 'Resort Network',
                requireLogin: true,
                access: 'resort_network:view'
            },
            controller: "ResortNetworkViewController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/controllers/ResortNetworkViewController.js',
                            'js/services/ResortNetworkService.js'
                        ]
                    });
                }]
            }
        })
        .state('app.resort', {
            url: "/resort",
            templateUrl: "views/resort/list.html",
            data: {
                pageTitle: 'Resort',
                requireLogin: true,
                access: 'resort:list'
            },
            controller: "ResortController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/controllers/ResortController.js',
                            'js/services/ResortService.js',
                            'js/scripts/table-advanced.js'
                        ]
                    });
                }]
            }
        })
        .state('app.resortEdit', {
            url: "/resort/edit/:id",
            templateUrl: "views/resort/edit.html",
            data: {
                pageTitle: 'Resort',
                requireLogin: true,
                access: 'resort:update'
            },
            controller: "ResortEditController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/controllers/ResortEditController.js',
                            'js/services/ResortService.js',
                            'js/services/ResortNetworkService.js'
                        ]
                    });
                }]
            }
        })
        .state('app.resortCreate', {
            url: "/resort/create",
            templateUrl: "views/resort/create.html",
            data: {
                pageTitle: 'Resort',
                requireLogin: true,
                access: 'resort:create'
            },
            controller: "ResortCreateController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/controllers/ResortCreateController.js',
                            'js/services/ResortService.js',
                            'js/services/ResortNetworkService.js'
                        ]
                    });
                }]
            }
        })
        .state('app.resortView', {
            url: "/resort/view/:id",
            templateUrl: "views/resort/view.html",
            data: {
                pageTitle: 'Resort',
                requireLogin: true,
                access: 'resort:view'
            },
            controller: "ResortViewController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/controllers/ResortViewController.js',
                            'js/services/ResortService.js',
                            'js/services/ResortNetworkService.js'
                        ]
                    });
                }]
            }
        })
        .state('app.user', {
            url: "/user",
            templateUrl: "views/user/list.html",
            data: {
                pageTitle: 'User',
                requireLogin: true,
                access: 'user:list'
            },
            controller: "UserController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/controllers/UserController.js',
                            'js/scripts/table-advanced.js'
                        ]
                    });
                }]
            }
        })
        .state('app.userEdit', {
            url: "/user/edit/:id",
            templateUrl: "views/user/edit.html",
            data: {
                pageTitle: 'User',
                requireLogin: true,
                access: 'user:update'
            },
            controller: "UserEditController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/controllers/UserEditController.js',
                            'js/services/RoleService.js'
                        ]
                    });
                }]
            }
        })
        .state('app.userCreate', {
            url: "/user/create",
            templateUrl: "views/user/create.html",
            data: {
                pageTitle: 'User',
                requireLogin: true,
                access: 'user:create'
            },
            controller: "UserCreateController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/controllers/UserCreateController.js',
                            'js/services/RoleService.js'
                        ]
                    });
                }]
            }
        })
        .state('app.userView', {
            url: "/user/view/:id",
            templateUrl: "views/user/view.html",
            data: {
                pageTitle: 'User',
                requireLogin: true,
                access: 'user:view'
            },
            controller: "UserViewController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/controllers/UserViewController.js'
                        ]
                    });
                }]
            }
        })
        .state('app.inventory', {
            url: "/inventory",
            templateUrl: "views/inventory/list.html",
            data: {
                pageTitle: 'Inventory',
                requireLogin: true,
                access: 'inventory:list'
            },
            controller: "InventoryController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/controllers/InventoryController.js',
                            'js/services/InventoriesService.js',
                            'js/scripts/table-advanced.js'
                        ]
                    });
                }]
            }
        })
        .state('app.inventoryView', {
            url: "/inventory/view/:id",
            templateUrl: "views/inventory/view.html",
            data: {
                pageTitle: 'Inventory',
                requireLogin: true,
                access: 'inventory:view'
            },
            controller: "InventoryViewController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/controllers/InventoryViewController.js',
                            'js/services/InventoriesService.js',
                            'js/services/ResortService.js'
                        ]
                    });
                }]
            }
        })
        .state('app.inventoryEdit', {
            url: "/inventory/edit/:id",
            templateUrl: "views/inventory/edit.html",
            data: {
                pageTitle: 'Inventory',
                requireLogin: true,
                access: 'inventory:update'
            },
            controller: "InventoryEditController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/controllers/InventoryEditController.js',
                            'js/services/InventoriesService.js',
                            'js/services/ResortService.js'
                        ]
                    });
                }]
            }
        })
        .state('app.inventoryCreate', {
            url: "/inventory/create/:id",
            templateUrl: "views/inventory/create.html",
            data: {
                pageTitle: 'Inventory',
                requireLogin: true,
                access: 'inventory:create'
            },
            controller: "InventoryCreateController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/controllers/InventoryCreateController.js',
                            'js/services/InventoriesService.js',
                            'js/services/ResortService.js'
                        ]
                    });
                }]
            }
        })
        .state('app.roleCreate', {
            url: "/role/create/:id",
            templateUrl: "views/role/create.html",
            data: {
                pageTitle: 'Role',
                requireLogin: true,
                access: 'rbac_role:create'
            },
            controller: "RoleCreateController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/controllers/RoleCreateController.js',
                            'js/services/RoleService.js'
                        ]
                    });
                }]
            }
        })
        .state('app.role', {
            url: "/role",
            templateUrl: "views/role/list.html",
            data: {
                pageTitle: 'Role',
                requireLogin: true,
                access: 'rbac_role:list'
            },
            controller: "RoleController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            'js/services/RoleService.js',
                            'js/controllers/RoleController.js',
                            'js/scripts/table-advanced.js'
                        ]
                    });
                }]
            }
        });
}]);

/* Init global settings and run the app */
MetronicApp.run(["$rootScope", "settings", "$state", '$window', '$location', 'AccessService', 'UserService', '$interval',
    function ($rootScope, settings, $state, $window, $location, AccessService, UserService, $interval) {
        $rootScope.$state = $state; // state to be accessed from view


        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            var requireLogin = toState.data.requireLogin;
            var token = $window.localStorage.getItem('access_token');
            var access = toState.data.access;
            var stop = $interval(function () {
                if (AccessService.userAccessRights != null) {
                    $interval.cancel(stop);
                    if (typeof access !== 'undefined' && toState.url !== 'dashboard' && !AccessService.isAllowed(access)) {
                        $location.path('/app/dashboard');
                        $state.go('app.dashboard');
                    }
                }
            }, 100);
            if (requireLogin && token == null) {
                $location.path('/appl/login');
                $state.go('appl.login');
            }

            if (!requireLogin && token !== null) {
                $location.path('/app/dashboard');
                $state.go('app.dashboard');
            }
        });
    }]);
