interface IMarkerService {
    getMarkers(userPosition:ICoordinates):ng.IPromise<Array<ITruckMarker>>;
}

angular.module('TruckMuncherApp').factory('MarkerService', ['TruckService', 'TruckProfileService', '$q',
    (TruckService, TruckProfileService, $q) => new MarkerService(TruckService, TruckProfileService, $q)]);

class MarkerService implements IMarkerService {

    constructor(private TruckService:ITruckService, private TruckProfileService:ITruckProfileService, private $q:ng.IQService) {
    }

    getMarkers(userPosition:ICoordinates):ng.IPromise<Array<ITruckMarker>> {
        var deferred = this.$q.defer();
        var markers = [];
        this.TruckService.getActiveTrucks().then((trucksResponse) => {
            var trucks = trucksResponse.trucks;
            for (var i = 0; i < trucks.length; i++) {
                var marker = this.populateMarker(trucks[i], userPosition);
                markers.push(marker);
            }
            deferred.resolve(markers);
        });
        return deferred.promise;
    }

    private populateMarker(truck:IActiveTruck, userPosition:ICoordinates):ITruckMarker {
        var truckCoordinates = {latitude: truck.latitude, longitude: truck.longitude};
        var marker:ITruckMarker = {
            id: truck.id,
            icon: 'img/SingleTruckAnnotationIcon.png',
            coords: truckCoordinates,
            metersFromUser: MarkerService.getDistance(userPosition, truckCoordinates),
            truckProfile: new TruckProfile()
        };

        this.TruckProfileService.tryGetTruckProfile(truck.id).then(function (response) {
            marker.truckProfile = response
        }, function () {
            marker.truckProfile.name = "Could not find profile for truck";
        });

        return marker;
    }

    private static rad(x:number):number {
        return x * Math.PI / 180;
    }

    private static getDistance(p1:ICoordinates, p2:ICoordinates) {
        var R = 6378137; // Earth’s mean radius in meter
        var dLat = MarkerService.rad(p2.latitude - p1.latitude);
        var dLong = MarkerService.rad(p2.longitude - p1.longitude);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(MarkerService.rad(p1.latitude)) * Math.cos(MarkerService.rad(p2.latitude)) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // returns the distance in meter
    }
}
