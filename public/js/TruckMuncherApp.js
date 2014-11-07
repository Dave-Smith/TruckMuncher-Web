var app = angular.module('TruckMuncherApp', ['ui.router', 'localytics.directives', 'ui.bootstrap', 'angular-growl', 'ngAnimate', 'ngTagsInput']);

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("home");

    $stateProvider
        .state('home', {
            url: "/home",
            authenticate: false
        })
        .state('login', {
            url: "/login",
            templateUrl: "partials/login.jade",
            authenticate: false
        })
        .state('map', {
            url: "/map",
            templateUrl: "partials/map.jade",
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
        });
}]);


app.factory('myInterceptor', [ 'httpInterceptor', function (httpInterceptor) {
    return httpInterceptor;
}]);

app.config(['$httpProvider' , function ($httpProvider) {
    $httpProvider.interceptors.push('myInterceptor');
}]);

app.config(['growlProvider', function(growlProvider) {
    growlProvider.globalTimeToLive(3000);
    growlProvider.onlyUniqueMessages(false);
}]);

app.run(function ($rootScope, $state, TokenService) {

    $rootScope.$on("$stateChangeStart",
        function (event, toState) {
            if (toState.authenticate && !TokenService.getToken()) {
                $state.go("login");
                event.preventDefault();
            }
        });
});

;/** Requires base64.js from base-64 package*/
angular.module('TruckMuncherApp').factory('TokenService', function () {
    var session_token = null;
    return {
        setToken: function (sessionToken) {
            session_token = sessionToken;
        },
        getToken: function () {
            return session_token;
        }
    };
});

app.factory('TimestampAndNonceService', function () {
    function twoDigitNumber(n) {
        return n < 10 ? '0' + n : '' + n;
    }

    var guid = (function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return function () {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        };
    })();

    return{
        getTimestamp: function () {
            var d = new Date(new Date().getTime());
            return d.getUTCFullYear() + '-' +
                twoDigitNumber(d.getUTCMonth() + 1) + '-' +
                twoDigitNumber(d.getUTCDate()) + 'T' +
                twoDigitNumber(d.getUTCHours()) + ':' +
                twoDigitNumber(d.getUTCMinutes()) + ':' +
                twoDigitNumber(d.getUTCSeconds()) + 'Z';
        },
        getNonce: function () {
            var uuid = guid();
            var _32randomChars = uuid.replace(/-/gi, '');
            return base64.encode(_32randomChars);
        }
    };
});


app.factory('httpInterceptor', ['TokenService', 'TimestampAndNonceService', '$location', '$q', 'growl',
    function (TokenService, TimestampAndNonceService, $location, $q, growl) {
        return{
            request: function (config) {
                // oauth headers
                if (TokenService.getToken()) {
                    config.headers.Authorization = 'session_token=' + TokenService.getToken();
                }

                //nonce and timestamp headers
                config.headers['X-Timestamp'] = TimestampAndNonceService.getTimestamp();
                config.headers['X-Nonce'] = TimestampAndNonceService.getNonce();

                //configure cross domain
                delete config['X-Requested-With'];
                config.crossDomain = true;

                // json headers
                config.headers.Accept = 'application/json';
                config.headers['Content-Type'] = 'application/json';

                return config;
            },
            responseError: function (rejection) {
                if (rejection.status === 401) {
                    $location.path('/login');
                }
                return $q.reject(rejection);
            }
        };
    }]);



;angular.module('TruckMuncherApp').controller('cssCtrl', ['$scope', '$rootScope',
    function ($scope, $rootScope) {
        $scope.showMenu = false;

        $rootScope.$on('menuItemClicked', function () {
            $scope.showMenu = false;
        });

        $rootScope.$on('toggleMenu', function(){
            $scope.showMenu = !$scope.showMenu;
        });
    }]);
;angular.module('TruckMuncherApp').directive('focusInvalidForm', function () {
    var link = function (scope, elem) {
        elem.on('submit', function () {
            var invalidElements = elem.find('.ng-invalid');
            if (invalidElements && invalidElements.length > 0) {
                var firstInvalid = $(invalidElements[0]);
                focusElement(firstInvalid);
            }
        });

        function focusElement(element) {
            if (elementIsChosenSelect(element)) {
                var idOfChosenDivForElement = element.attr("id") + "_chosen";
                $('#' + idOfChosenDivForElement).find(".chosen-single").focus();
            } else {
                element[0].focus();
            }
        }

        function elementIsChosenSelect(element) {
            return element.attr("data-chosen") === "";
        }

    };

    return {
        retrict: 'A',
        link: link
    };
});
;var FLOAT_REGEXP = /^\-?\d+((\.|\,)\d{1,2})?$/;
angular.module('TruckMuncherApp').directive('smartPrice', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {
                if (FLOAT_REGEXP.test(viewValue)) {
                    ctrl.$setValidity('float', true);
                    return parseFloat(viewValue.replace(',', '.'));
                } else {
                    ctrl.$setValidity('float', false);
                    return undefined;
                }
            });
        }
    };
});;angular.module('TruckMuncherApp').controller('headerCtrl', ['$scope', '$rootScope', 'TokenService',
    function ($scope, $rootScope, TokenService) {
        $scope.toggleMenu = function(){
            $rootScope.$emit('toggleMenu');
        };

        $scope.loggedIn = function(){
            return !_.isNull(TokenService.getToken());
        };
    }]);
;angular.module('TruckMuncherApp')
    .factory('httpHelperService', ['$http', '$q', 'growl', function ($http, $q, growl) {
        return {
            post: function (url, data, responseDataName) {
                var deferred = $q.defer();
                $http({
                    method: 'POST',
                    url: url,
                    data: data,
                    crossDomain: true
                }).then(function (response) {
                    if (responseDataName) deferred.resolve(response.data[responseDataName]);
                    else deferred.resolve(response.data);
                }, function (error) {
                    if(error.data && error.data.userMessage){
                        growl.addErrorMessage('Error: ' + error.data.userMessage);
                    }else{
                        growl.addErrorMessage('An unknown error occurred');
                    }
                    deferred.reject(error);
                });
                return deferred.promise;
            }
        };
    }]);;angular.module('TruckMuncherApp').controller('initCtrl', ['$scope', 'TokenService',
    function ($scope, TokenService) {
        $scope.initializeToken = function (sessionToken) {
            if (sessionToken !== 'undefined' && sessionToken !== 'null') {
                TokenService.setToken(sessionToken);
            } else {
                TokenService.setToken(null);
            }
        };
    }
]);;angular.module('TruckMuncherApp')
    .factory('MenuService', ['httpHelperService', function (httpHelperService) {
        return {
            getFullMenus: function (latitude, longitude, includeAvailability) {
                var url = 'https://api.truckmuncher.com:8443/com.truckmuncher.api.menu.MenuService/getFullMenus';
                var data = {'latitude': latitude, 'longitude': longitude, 'includeAvailability': includeAvailability};
                return httpHelperService.post(url, data);
            },
            getMenu: function (truckId) {
                var url = 'https://api.truckmuncher.com:8443/com.truckmuncher.api.menu.MenuService/getMenu';
                var data = {'truckId': truckId};
                return httpHelperService.post(url, data, 'menu');
            },
            getItem: function (itemId) {
                var url = 'https://api.truckmuncher.com:8443/com.truckmuncher.api.menuadmin.MenuAdminService/getMenuItem';
                var data = {'menuItemId': itemId};
                return httpHelperService.post(url, data, 'menuItem');
            },
            getCategory: function (categoryId) {
                var url = 'https://api.truckmuncher.com:8443/com.truckmuncher.api.menuadmin.MenuAdminService/getCategory';
                var data = {'categoryId': categoryId};
                return httpHelperService.post(url, data, 'category');
            },
            addOrUpdateCategory: function (category, truckId) {
                return this.addOrUpdateCategories([category], truckId);
            },
            addOrUpdateCategories: function(categories, truckId){
                var url = 'https://api.truckmuncher.com:8443/com.truckmuncher.api.menuadmin.MenuAdminService/modifyCategory';
                var data = {'categories': categories, 'truckId': truckId};
                return httpHelperService.post(url, data, 'menu');
            },
            addOrUpdateItem: function (item, truckId, categoryId) {
                return this.addOrUpdateItems([item], truckId, categoryId);
            },
            addOrUpdateItems: function (items, truckId, categoryId) {
                var url = 'https://api.truckmuncher.com:8443/com.truckmuncher.api.menuadmin.MenuAdminService/modifyMenuItem';
                var data = {'menuItems': items, 'truckId': truckId, 'categoryId': categoryId};
                return httpHelperService.post(url, data, 'menu');
            },
            deleteCategory: function (truckId, categoryId) {
                var url = 'https://api.truckmuncher.com:8443/com.truckmuncher.api.menuadmin.MenuAdminService/deleteCategory';
                var data = {'truckId': truckId, 'categoryId': categoryId};
                return httpHelperService.post(url, data, 'menu');
            },
            deleteItem: function (truckId, menuItemId) {
                var url = 'https://api.truckmuncher.com:8443/com.truckmuncher.api.menuadmin.MenuAdminService/deleteMenuItem';
                var data = {'truckId': truckId, 'menuItemId': menuItemId};
                return httpHelperService.post(url, data, 'menu');
            },
            getTags: function () {
                var url = 'https://api.truckmuncher.com:8443/com.truckmuncher.api.menuadmin.MenuAdminService/getValidMenuItemTags';
                var data = {};
                return httpHelperService.post(url, data, 'tags');
            }
        };
    }]);;angular.module('TruckMuncherApp').controller('navCtrl', ['$scope', '$rootScope', 'TokenService',
    function ($scope, $rootScope, TokenService) {
        $scope.loggedIn = function () {
            return !_.isNull(TokenService.getToken());
        };
    }]);
;angular.module('TruckMuncherApp').controller('confirmDialogCtrl', function ($scope, $modalInstance, dialogInfo) {
    $scope.dialogInfo = dialogInfo;

    $scope.ok = function () {
        $modalInstance.close({});
    };

    $scope.cancel = function () {
        $modalInstance.dismiss({});
    };
});;angular.module('TruckMuncherApp').factory('confirmDialogService', ['$modal', '$q', function ($modal, $q) {
    return{
        launch: function (size, title, body, acceptText, rejectText) {

            var modalInstance = $modal.open({
                templateUrl: '/partials/shared/confirmDialog.jade',
                controller: 'confirmDialogCtrl',
                size: size,
                resolve: {
                    dialogInfo: function () {
                        return {
                            title: title,
                            body: body,
                            acceptText: acceptText,
                            rejectText: rejectText
                        };
                    }
                }
            });

            return modalInstance.result;
        }
    };
}]);;angular.module('TruckMuncherApp')
    .factory('TruckService', ['httpHelperService', function (httpHelperService) {
        return {
            getTrucksForVendor: function () {
                var url = 'https://api.truckmuncher.com:8443/com.truckmuncher.api.trucks.TruckService/getTrucksForVendor';
                return httpHelperService.post(url, {}, 'trucks');
            },
            modifyTruckProfile: function (truckId, name, imageUrl, keywords) {
                var url = 'https://api.truckmuncher.com:8443/com.truckmuncher.api.trucks.TruckService/modifyTruckProfile';
                return httpHelperService.post(url, {id: truckId, name: name, imageUrl: imageUrl, keywords: keywords});
            }
        };
    }]);
;angular.module('TruckMuncherApp').controller('addOrEditCategoryModalCtrl', ['$scope', '$modalInstance', '$stateParams', '$state', 'MenuService',
    function ($scope, $modalInstance, $stateParams, $state, MenuService) {
        $scope.category = {};
        $scope.requestInProgress = false;

        (function () {
            if ($state.current.name === 'menu.editCategory') {
                MenuService.getCategory($stateParams.categoryId).then(function (response) {
                    $scope.category = response;
                });
            }
        })();

        $scope.submit = function () {
            if (!$scope.requestInProgress) {
                $scope.requestInProgress = true;
                var categoryClone = _.clone($scope.category);
                delete categoryClone.menuItems;

                MenuService.addOrUpdateCategory(categoryClone, $stateParams.truckId).then(function (response) {
                    $modalInstance.close(response);
                }, function () {
                    $scope.requestInProgress = false;
                });
            }
        };

        $scope.$on('$stateChangeSuccess', function () {
            $modalInstance.dismiss('dismissFromStateChange');
        });
    }]);
;angular.module('TruckMuncherApp').controller('addOrEditItemModalCtrl', ['$scope', 'MenuService', '$modalInstance', '$stateParams', '$state',
    function ($scope, MenuService, $modalInstance, $stateParams, $state) {
        $scope.item = {};
        $scope.requestInProgress = false;

<<<<<<< HEAD
        MenuService.getTags().then(function (response) {
            $scope.allTags = response;
            console.log($scope.allTags);
        });
=======
        (function () {

            MenuService.getTags().then(function (response) {
                $scope.allTags = response;
                $scope.item.tags = [];


            });
>>>>>>> master

        (function () {
            if ($state.current.name === 'menu.editItem') {
                MenuService.getItem($stateParams.itemId).then(function (response) {
                    $scope.item = response;
                });


            }
        })();


        $scope.submit = function () {
            if (!$scope.requestInProgress) {
                $scope.requestInProgress = true;
                MenuService.addOrUpdateItem(
                    $scope.item,
                    $stateParams.truckId,
                    $stateParams.categoryId).then(function (response) {
                        $modalInstance.close(response);
                    }, function () {
                        $scope.requestInProgress = false;
                    });
            }
        };

        $scope.$on('$stateChangeSuccess', function () {
            $modalInstance.dismiss('dismissFromStateChange');
        });
    }]);;angular.module('TruckMuncherApp').controller('menuActionModalCtrl', ['$scope', '$stateParams', '$modal', '$state',
    function ($scope, $stateParams, $modal, $state) {

        $scope.openModal = function () {
            $scope.modalInstance = $modal.open({
                templateUrl: $state.current.data.templateUrl,
                controller: $state.current.data.controller
            });

            $scope.modalInstance.result.then(function (response) {
                $scope.$emit('menuUpdated', response);
                $state.go('menu');
            }, function (response) {
                if ($state.current.name !== 'menu' && response !== 'dismissFromStateChange') {
                    $state.go('menu');
                }
            });
        };

        $scope.openModal();
    }

]);
;angular.module('TruckMuncherApp').controller('vendorMenuCtrl', ['$scope', 'MenuService', 'TruckService', '$state', 'confirmDialogService',
    function ($scope, MenuService, TruckService, $state, confirmDialog) {
        $scope.selectedTruck = null;
        $scope.menu = {};

        TruckService.getTrucksForVendor().then(function (response) {
            $scope.trucks = response;
            if ($scope.trucks.length > 0) {
                $scope.selectedTruck = $scope.trucks[0].id;
            }
        });

        $scope.$watch('selectedTruck', function () {
            if ($scope.selectedTruck && $scope.menu.truckId !== $scope.selectedTruck) {
                MenuService.getMenu($scope.selectedTruck).then(function (response) {
                    $scope.menu = response;
                });
            }
        });

        $scope.deleteItem = function (itemId) {
            var body = 'Are you sure you want to delete this item?';
            confirmDialog.launch(null, 'Delete Item', body, 'Yes', 'No').then(function () {
                MenuService.deleteItem($scope.selectedTruck, itemId).then(function (response) {
                    $scope.menu = response;
                });
            });
        };

        $scope.moveItemDown = function (categoryId, index) {
            moveItem(categoryId, index, 1);
        };

        $scope.moveItemUp = function (categoryId, index) {
            moveItem(categoryId, index, -1);
        };

        function moveItem(categoryId, indexOfItem, swapLocationFromIndex) {
            var sortedItems = getSortedItems(categoryId);
            var theItem = _.clone(sortedItems[indexOfItem]);
            var otherItem = _.clone(sortedItems[indexOfItem + swapLocationFromIndex]);
            theItem.orderInCategory = indexOfItem + swapLocationFromIndex;
            otherItem.orderInCategory = indexOfItem;

            MenuService.addOrUpdateItems([theItem, otherItem], $scope.selectedTruck, categoryId).then(function (response) {
                $scope.menu = response;
            });
        }

        function getSortedItems(categoryId) {
            var category = _.find($scope.menu.categories, function (c) {
                return c.id === categoryId;
            });
            return  _.sortBy(category.menuItems, function (i) {
                return i.orderInCategory;
            });
        }

        $scope.moveCategoryUp = function (index) {
            moveCategory(index, -1);
        };

        $scope.moveCategoryDown = function (index) {
            moveCategory(index, 1);
        };

        function moveCategory(indexOfCategory, swapLocationFromIndex) {
            var sorted = getSortedCategories();
            var theCategory = _.clone(sorted[indexOfCategory]);
            var otherCategory = _.clone(sorted[indexOfCategory + swapLocationFromIndex]);
            theCategory.orderInMenu = indexOfCategory + swapLocationFromIndex;
            otherCategory.orderInMenu = indexOfCategory;

            delete theCategory.menuItems;
            delete otherCategory.menuItems;
            MenuService.addOrUpdateCategories([theCategory, otherCategory], $scope.selectedTruck).then(function (response) {
                $scope.menu = response;
            });
        }

        function getSortedCategories() {
            return _.sortBy($scope.menu.categories, function (c) {
                return c.orderInMenu;
            });
        }

        $scope.deleteCategory = function (categoryId) {
            var body = 'Are you sure you want to delete this category? All items in the category will also be deleted.';
            confirmDialog.launch(null, 'Delete Category', body, 'Yes', 'No').then(function () {
                MenuService.deleteCategory($scope.selectedTruck, categoryId).then(function (response) {
                    $scope.menu = response;
                });
            });
        };

        $scope.$on('menuUpdated', function (event, data) {
            $scope.menu = data;
            $scope.selectedTruck = $scope.menu.truckId;
        });

        $scope.addItem = function (truckId, categoryId) {
            $state.go('.addItem', {truckId: truckId, categoryId: categoryId});
        };
    }
]);;angular.module('TruckMuncherApp').controller('vendorProfileCtrl', ['$scope', 'TruckService', 'growl',
    function ($scope, TruckService, growl) {
        $scope.trucks = [];
        $scope.selectedTruck = {};
        $scope.tags = [];

        $scope.createTruck = function () {
            $scope.requestInProgress = true;
            TruckService.modifyTruckProfile(null, 'New Truck', null, []).then(function (response) {
                $scope.requestInProgress = false;
                growl.addSuccessMessage('Profile Updated Successfully');
                $scope.trucks.push(response);
                refreshTruck(response);
            }, function () {
                $scope.requestInProgress = false;
            });
        };

        $scope.submit = function () {
            var keywords = _.map($scope.tags, function (tag) {
                return tag.text;
            });

            $scope.requestInProgress = true;
            TruckService.modifyTruckProfile(
                $scope.selectedTruck.id,
                $scope.selectedTruck.name,
                $scope.selectedTruck.imageUrl,
                keywords).then(function (response) {
                    $scope.requestInProgress = false;
                    growl.addSuccessMessage('Profile Updated Successfully');
                    refreshTruck(response);
                }, function () {
                    $scope.requestInProgress = false;
                });
        };

        function refreshTruck(truck) {
            var index = _.findIndex($scope.trucks, function (t) {
                return t.id === truck.id;
            });
            if (index >= 0) {
                $scope.trucks[index] = truck;
                $scope.selectedTruck = truck;
            }
        }

        TruckService.getTrucksForVendor().then(function (response) {
            $scope.trucks = response;
            if ($scope.trucks.length > 0) {
                $scope.selectedTruck = $scope.trucks[0];
            }
        });

        $scope.$watch('selectedTruck', function () {
            $scope.tags = _.map($scope.selectedTruck.keywords, function (keyword) {
                return {text: keyword};
            });
        });
    }]);
