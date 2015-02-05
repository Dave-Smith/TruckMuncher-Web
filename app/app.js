var app = angular.module('TruckMuncherApp',
    [
        'ui.router',
        'localytics.directives',
        'ui.bootstrap',
        'angular-growl',
        'ngAnimate',
        'ngTagsInput',
        'angularFileUpload',
        'ngCookies',
        'uiGmapgoogle-maps',
        'angularSpectrumColorpicker',
        'angulartics',
        'angulartics.google.analytics'
    ]);

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("map");

    $stateProvider
        .state('login', {
            url: "/login",
            templateUrl: "partials/login.jade",
            authenticate: false
        })
        .state('map', {
            url: "/map",

            templateUrl: "partials/map/map.jade",
            controller: 'mapCtrl',
            authenticate: false
        })
        .state('menu', {
            url: "/vendors/menu",
            templateUrl: "/partials/vendors/vendorMenu.jade",
            controller: 'vendorMenuCtrl',
            authenticate: true
        })
        .state('menu.editItem', {
            url: "/:truckId/category/:categoryId/item/:itemId",
            data: {
                templateUrl: '/partials/vendors/itemDetails.jade',
                controller: 'addOrEditItemModalCtrl'
            },
            controller: 'menuActionModalCtrl',
            authenticate: true
        })
        .state('menu.addItem', {
            url: '/:truckId/category/:categoryId/item',
            data: {
                templateUrl: 'partials/vendors/itemDetails.jade',
                controller: 'addOrEditItemModalCtrl'
            },
            controller: 'menuActionModalCtrl',
            authenticate: true
        })
        .state('menu.editCategory', {
            url: "/:truckId/category/:categoryId",
            data: {
                templateUrl: 'partials/vendors/categoryDetails.jade',
                controller: 'addOrEditCategoryModalCtrl'
            },
            controller: 'menuActionModalCtrl',
            authenticate: true
        })
        .state('menu.addCategory', {
            url: "/:truckId/category",
            data: {
                templateUrl: 'partials/vendors/categoryDetails.jade',
                controller: 'addOrEditCategoryModalCtrl'
            },
            controller: 'menuActionModalCtrl',
            authenticate: true
        })
        .state('vendorProfile', {
            url: "/vendors/profile",
            templateUrl: "/partials/vendors/profile.jade",
            controller: 'vendorProfileCtrl',
            authenticate: true
        })
        .state('truckProfile', {
            url: "/truckProfile",
            templateUrl: "/partials/truckProfile.jade",
            controller: 'truckProfileCtrl',
            authenticate: false
        });
}]);


app.factory('myInterceptor', ['httpInterceptor', function (httpInterceptor) {
    return httpInterceptor;
}]);

app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('myInterceptor');
}]);

app.config(['growlProvider', function (growlProvider) {
    growlProvider.globalTimeToLive(3000);
    growlProvider.onlyUniqueMessages(false);
}]);

app.config(function ($analyticsProvider) {
    $analyticsProvider.firstPageview(true); /* Records pages that don't use $state or $route */
    $analyticsProvider.withAutoBase(true);  /* Records full path */
});

app.run(function ($rootScope, $state, TokenService) {

    $rootScope.$on("$stateChangeStart",
        function (event, toState) {
            if (toState.authenticate && !TokenService.getToken()) {
                $state.go("login");
                event.preventDefault();
            }
        });
});

