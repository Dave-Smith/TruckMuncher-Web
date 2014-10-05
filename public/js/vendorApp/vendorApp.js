var app = angular.module('vendorApp', ['ui.router', 'truckmuncher.headerHelpers']);

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/menu");

    $stateProvider
        .state('menu', {
            url: "/menu",
            templateUrl: "/partials/vendors/_vendorMenu.jade",
            controller: 'vendorMenuCtrl'
        })
        .state('itemDetails', {
            url: "/itemDetails",
            templateUrl: "/partials/vendors/_itemDetails.jade",
            controller: 'itemDetailsCtrl'
        })
}]);


app.factory('myInterceptor', [ 'httpInterceptor',
    function (httpInterceptor) {
        return{
            request: function (config) {
               return httpInterceptor.request(config);
            }
        }
    }]);

app.config(['$httpProvider' , function ($httpProvider) {
    $httpProvider.interceptors.push('myInterceptor');
}]);