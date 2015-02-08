interface IMarkerService {
    getMarkers(lat:number, lon:number):ng.IPromise<Array<ITruckMarker>>;
}

angular.module('TruckMuncherApp').factory('MarkerService', ['TruckService', 'TruckProfileService', '$q',
    (TruckService, TruckProfileService, $q) => new MarkerService(TruckService, TruckProfileService, $q)]);

class MarkerService implements IMarkerService {

    constructor(private TruckService:ITruckService, private TruckProfileService:ITruckProfileService, private $q:ng.IQService) {
    }

    getMarkers(lat:number, lon:number):ng.IPromise<Array<ITruckMarker>> {
        var deferred = this.$q.defer();
        var markers = [];
        this.TruckService.getActiveTrucks(lat, lon).then((trucksResponse) => {
            var trucks = trucksResponse.trucks;
            if (this.TruckProfileService.allTrucksInStoredProfiles(trucks) && !this.TruckProfileService.cookieNeedsUpdate()) {
                for (var i = 0; i < trucks.length; i++) {
                    var marker = this.populateMarker(trucks[i]);
                    markers.push(marker);
                }
            } else {
                this.TruckProfileService.updateTruckProfiles(lat, lon).then(() => {
                    for (var i = 0; i < trucks.length; i++) {
                        var marker = this.populateMarker(trucks[i]);
                        markers.push(marker);
                    }
                });
            }
            deferred.resolve(markers);
        });
        return deferred.promise;
    }

    private populateMarker(truck:IActiveTruck) {
        var truckProfile = this.TruckProfileService.getTruckProfile(truck.id);
        var marker = {
            id: truck.id,
            icon: 'img/SingleTruckAnnotationIcon.png',
            coords: {
                latitude: truck.latitude,
                longitude: truck.longitude
            },
            truckProfile: {}
        };

        if (!_.isNull(truckProfile) && !_.isUndefined(truckProfile)) {
            marker.truckProfile = truckProfile;
        } else {
            marker.truckProfile = {name: "Could not find profile for truck"};
        }

        return marker;
    }
}
