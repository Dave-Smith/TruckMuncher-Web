angular.module('TruckMuncherApp').controller('vendorProfileCtrl', ['$scope', 'TruckService', 'growl', '$timeout',
    function ($scope, TruckService, growl, $timeout) {
        $scope.trucks = [];
        $scope.selectedTruck = {};
        $scope.tags = [];

        $scope.submit = function () {
            var keywords = _.map($scope.tags, function (tag) {
                return tag.text;
            });

            TruckService.modifyTruckProfile(
                $scope.selectedTruck.id,
                $scope.selectedTruck.name,
                $scope.selectedTruck.imageUrl,
                keywords).then(function (response) {
                    growl.addSuccessMessage('Profile Updated Successfully', {ttl: 3000});
                    refreshTruck(response);
                }, function (error) {
                    growl.addErrorMessage('Error: profile was not saved', {ttl: 3000});
                });
        };

        function refreshTruck(truck) {
            var index = _.findIndex($scope.trucks, function (t) {
                return t.id === truck.id;
            });
            if (index >= 0) {
                $scope.trucks[index] = truck;
            }
        }

        TruckService.getTrucksForVendor().then(function (response) {
            $scope.trucks = response;
            if ($scope.trucks.length > 0) {
                $scope.selectedTruck = $scope.trucks[0];
            }
        }, function () {
            growl.addErrorMessage('Error: could not retrieve vendor trucks', {ttl: 3000});
        });

        $scope.$watch('selectedTruck', function () {
            $scope.tags = _.map($scope.selectedTruck.keywords, function (keyword) {
                return {text: keyword};
            });
        });
    }]);
