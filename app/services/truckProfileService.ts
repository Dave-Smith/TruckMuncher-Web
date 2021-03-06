interface ITruckProfileService {
    updateTruckProfiles(): ng.IPromise<Array<ITruckProfile>>;
    tryGetTruckProfile(truckId:string): ng.IPromise<ITruckProfile>;
    allTrucksFromCache():Array<ITruckProfile>;
}
angular.module('TruckMuncherApp').factory('TruckProfileService', ['$q', 'httpHelperService', '$cacheFactory',
    ($q,  httpHelperService, $cacheFactory) => new TruckProfileService($q,  httpHelperService, $cacheFactory)]);

class TruckProfileService implements ITruckProfileService {
    private millisecondsInADay:number = 86400000;
    private millisecondsInAMinute:number = 60000;
    private milwaukeeLatitude:number = 43.05;
    private milwaukeeLongitude:number = -87.95;
    private myCache;

    constructor(private $q:ng.IQService,
                private httpHelperService:IHttpHelperService,
                $cacheFactory: ng.ICacheFactoryService) {
        this.myCache = $cacheFactory('myData');
    }

    updateTruckProfiles(): ng.IPromise<Array<ITruckProfile>> {
        var deferred = this.$q.defer();
        var url = this.httpHelperService.getApiUrl() + '/com.truckmuncher.api.trucks.TruckService/getTruckProfiles';

        if (this.profilesUpdatedInLastMinute()) deferred.resolve(this.allTrucksFromCache());
        else {
            this.httpHelperService.post(url, {
                'latitude': this.milwaukeeLatitude,
                'longitude': this.milwaukeeLongitude
            }).then((response:ITruckProfilesResponse)=> {
                this.myCache.put('truckProfiles', response.trucks);
                this.myCache.put('truckProfilesLastUpdatedDate', "" + Date.now());
                deferred.resolve(response.trucks);
            });
        }

        return deferred.promise;
    }

    private cacheNeedsUpdate():boolean {
        var lastUpdated = this.myCache.get('truckProfilesLastUpdatedDate');
        return _.isNull(lastUpdated) || _.isUndefined(lastUpdated) || _.isNaN(lastUpdated) || Date.now() - lastUpdated > this.millisecondsInADay;
    }

    private getTruckProfileFromCache(truckId:string):ITruckProfile {
        var profiles = this.allTrucksFromCache();
        return _.find(profiles, function (x) {
            return x.id === truckId;
        });
    }

    tryGetTruckProfile(truckId) {
        var deferred = this.$q.defer();

        if (this.cacheNeedsUpdate()) this.updateTruckProfiles();

        var truck = this.getTruckProfileFromCache(truckId);
        if (truck) deferred.resolve(truck);
        else {
            this.updateTruckProfiles().then((response:Array<ITruckProfile>) => {
                truck = _.find(response, function (t) {
                    return t.id === truckId;
                });

                if (truck) deferred.resolve(truck);
                else deferred.reject('not found');
            })
        }

        return deferred.promise;
    }

    private profilesUpdatedInLastMinute():boolean {
        var lastUpdated = this.myCache.get('truckProfilesLastUpdatedDate');
        if (_.isNull(lastUpdated) || _.isUndefined(lastUpdated) || _.isNaN(lastUpdated))return false
        else return Date.now() - lastUpdated < this.millisecondsInAMinute;
    }

    allTrucksFromCache():Array<ITruckProfile> {
        return this.myCache.get('truckProfiles');
    }
}
