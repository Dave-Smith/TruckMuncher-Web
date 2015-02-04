interface ITruckProfileService {
    updateTruckProfiles(latitude:number, longitude:number): ng.IPromise<ITrucksResponse>;
    cookieNeedsUpdate(): boolean;
    allTrucksInStoredProfiles(trucks:Array < {id:string} >): boolean;
    getTruckProfile(truckId:string): ITruckProfile;
}

angular.module('TruckMuncherApp').factory('TruckProfileService', ['TruckService', '$q', '$cookieStore',
    (TruckService, $q, $cookieStore) => new TruckProfileService(TruckService, $q, $cookieStore)]);

class TruckProfileService implements ITruckProfileService {
    private millisecondsInADay:number = 86400000;

    constructor(private TruckService:ITruckService, private  $q:ng.IQService, private $cookieStore:ng.cookies.ICookieStoreService) {
    }

    updateTruckProfiles(latitude:number, longitude:number):ng.IPromise<ITrucksResponse> {
        var deferred = this.$q.defer();
        this.TruckService.getTruckProfiles(latitude, longitude).then((response)=> {
            this.$cookieStore.put('truckProfiles', response.trucks);
            this.$cookieStore.put('truckProfilesLastUpdatedDate', "" + Date.now());
            deferred.resolve(response);
        });
        return deferred.promise;
    }

    cookieNeedsUpdate():boolean {
        var lastUpdated = this.$cookieStore.get('truckProfilesLastUpdatedDate');
        return _.isNull(lastUpdated) || _.isUndefined(lastUpdated) || _.isNaN(lastUpdated) || Date.now() - lastUpdated > this.millisecondsInADay;
    }

    allTrucksInStoredProfiles(trucks:Array<{id:string} >):boolean {
        var storedTrucks = this.$cookieStore.get('truckProfiles');
        if (_.isNull(storedTrucks) || _.isUndefined(storedTrucks) || _.isNull(trucks) || _.isUndefined(trucks))
            return false;

        for (var i = 0; i < trucks.length; i++) {
            if (!_.some(storedTrucks, {'id': trucks[i].id}))
                return false;
        }

        return true;
    }

    getTruckProfile(truckId:string):ITruckProfile {
        var profiles = this.getTruckProfilesFromCookie();
        return _.find(profiles, function (x) {
            return x.id === truckId;
        });
    }

    private getTruckProfilesFromCookie():Array<ITruckProfile> {
        return this.$cookieStore.get('truckProfiles');

    }

}