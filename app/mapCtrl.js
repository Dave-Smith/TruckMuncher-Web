angular.module('TruckMuncherApp').controller('mapCtrl',
    ['$scope', 'uiGmapGoogleMapApi', 'growl', '$modal', 'MenuService', 'colorService', 'SearchService', 'MarkerService', '$timeout', '$analytics',
        function ($scope, uiGmapGoogleMapApi, growl, $modal, MenuService, colorService, SearchService, MarkerService, $timeout, $analytics) {
            $scope.mapHeight = screen.height / 1.7 + 'px';
            $scope.loading = true;
            $scope.searchQuery = "";
            var lat;
            var lon;
            var allActiveTruckMarkers = [];
            $scope.displayedMarkers = [];
            $scope.infoWindow = {
                show: false,
                templateUrl: "/partials/map/infoWindow.jade",
                options: {
                    pixelOffset: {height: -20, width: 0}
                }
            };

            $scope.map = {
                center: {
                    latitude: 43.05,
                    longitude: -87.95
                },
                zoom: 12
            };

            $scope.currentPositionMarker = {};

            navigator.geolocation.getCurrentPosition(function (pos) {
                lat = pos.coords.latitude;
                lon = pos.coords.longitude;
                $scope.currentPositionMarker = {
                    id: 1,
                    icon: 'img/map_marker_green.png',
                    coords: {
                        latitude: lat,
                        longitude: lon
                    },
                    show: false
                };

                $scope.map.center = {latitude: lat, longitude: lon};

                getMarkers();
            }, function (error) {
                growl.addErrorMessage('Unable to get location: ' + error.message);
            });

            function getMarkers() {
                $scope.loading = true;
                allActiveTruckMarkers = [];
                MarkerService.getMarkers(lat, lon).then(function (markers) {
                    allActiveTruckMarkers = markers;
                    $scope.loading = false;
                    $scope.displayedMarkers = allActiveTruckMarkers;
                });
            }

            $scope.closeInfoWindow = function () {
                $scope.infoWindow.show = false;
            };

            $scope.onMarkerClicked = function (clickEvent) {
                showMarkerWindow(clickEvent.model);

                $analytics.eventTrack('MarkerClicked', {category: 'Map', label: clickEvent.model.truckProfile.name});
            };

            $scope.onProfileClicked = function (marker) {
                showMarkerWindow(marker);
                $analytics.eventTrack('ProfileClicked', {category: 'Map', label: marker.truckProfile.name});
            };

            function showMarkerWindow(marker) {
                $timeout(function () {
                    $scope.infoWindow.show = false;
                    $timeout(function () {
                        $scope.map.center = {latitude: marker.coords.latitude, longitude: marker.coords.longitude};

                        $scope.infoWindow.coords = marker.coords;
                        $scope.infoWindow.show = true;
                        $scope.infoWindow.templateParameter = {marker: marker, showMenuCallback: $scope.showMenuModal};
                    });
                });
            }

            $scope.showMenuModal = function (truckId) {
                var marker = _.find(allActiveTruckMarkers, function (marker) {
                    return marker.truckProfile.id === truckId;
                });
                var customMenuColors = colorService.getCustomMenuColorsForTruck(marker.truckProfile);
                MenuService.getMenu(truckId).then(function (response) {
                    launchModal(response, customMenuColors);
                });

                $analytics.eventTrack('ViewMenu', {category: 'Map', label: marker.truckProfile.name});
            };

            function launchModal(menu, customMenuColors) {
                var modalCtrl = ['$scope', 'menu', 'customMenuColors', '$modalInstance', function ($scope, menu, customMenuColors, $modalInstance) {
                    $scope.menu = menu;
                    $scope.customMenuColors = customMenuColors;

                    $scope.close = function () {
                        $modalInstance.close({});
                    };
                }];

                $scope.modalInstance = $modal.open({
                    templateUrl: "/partials/map/customer-menu.jade",
                    controller: modalCtrl,
                    resolve: {
                        menu: function () {
                            return menu;
                        },
                        customMenuColors: function () {
                            return customMenuColors;
                        }
                    }
                });
            }

            $scope.$watch('searchQuery', function () {
                if ($scope.searchQuery.length === 0 && $scope.displayedMarkers.length < allActiveTruckMarkers.length) {
                    $scope.displayedMarkers = allActiveTruckMarkers;

                    $analytics.eventTrack('SearchCleared', {category: 'Map'});
                }
            });

            $scope.simpleSearch = function (query) {
                $scope.displayedMarkers = [];
                $scope.loading = true;
                SearchService.simpleSearch(query, 20, 0).then(function (results) {
                    var resultTruckIds = _.map(results, function (r) {
                        return r.truck.id;
                    });
                    $scope.displayedMarkers = _.filter(allActiveTruckMarkers, function (marker) {
                        return _.contains(resultTruckIds, marker.truckProfile.id);
                    });
                    $scope.loading = false;
                });

                $analytics.eventTrack('SimpleSearch', {category: 'Map', label: query});
            };
        }]);

