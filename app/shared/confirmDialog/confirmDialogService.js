angular.module('TruckMuncherApp').factory('confirmDialogService', ['$modal', '$q', function ($modal, $q) {
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

            var deferred = $q.defer();
            modalInstance.result.then(function () {
                deferred.resolve(true);
            }, function () {
                deferred.resolve(false);
            });
            return deferred.promise;
        }
    };
}]);