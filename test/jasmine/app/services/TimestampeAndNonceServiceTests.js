describe('TimestampAndNonceService', function () {
    beforeEach(module('TruckMuncherApp', function ($httpProvider) {
        $httpProvider.interceptors.push('httpInterceptor');
    }));

    beforeEach(module(function ($urlRouterProvider) {
        $urlRouterProvider.otherwise(function () {return false;});
    }));

    var service;

    beforeEach(inject(function (TimestampAndNonceService) {
        service = TimestampAndNonceService;
    }));

    describe('getTimestamp', function () {
        it('should return a time in the format yyyy-mm-ddT##:##:##Z', function () {
            var actual = service.getTimestamp();
            var regexPattern = new RegExp('^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$');

            expect(regexPattern.test(actual)).toBe(true, 'Date not in correct format: ' + actual);
        });
    });

    describe('getNonce', function () {
        it('return an encoded 32 byte thingy', function () {
            var actual = service.getNonce();

            expect(base64.decode(actual).length).toBe(32);
        });
    });
});