var request = require('request'),
    q = require('q');

var apiUrl = 'https://api.truckmuncher.com:8443/com.truckmuncher.api.auth.AuthService/';

var nonceAndTimestampHelper = {
        getTimestamp: function () {
            function twoDigitNumber(n) {
                return n < 10 ? '0' + n : '' + n;
            }

            var d = new Date(new Date().getTime());
            return d.getUTCFullYear() + '-' +
                twoDigitNumber(d.getUTCMonth() + 1) + '-' +
                twoDigitNumber(d.getUTCDate()) + 'T' +
                twoDigitNumber(d.getUTCHours()) + ':' +
                twoDigitNumber(d.getUTCMinutes()) + ':' +
                twoDigitNumber(d.getUTCSeconds()) + 'Z';
        },
        getNonce: function () {
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
            var uuid = guid();
            var _32randomChars = uuid.replace(/-/gi, '');
            return (new Buffer(_32randomChars).toString('base64'));
        }
};

function makeRequest(url, method, header) {
    var options = {
        url: url,
        method: method,
        body: JSON.stringify({}),
        //TODO: DON'T DO THIS
        strictSSL: false,
        headers: header
    };

    var deferred = q.defer();
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            deferred.resolve(JSON.parse(body));
        } else {
            deferred.reject(error);
        }
    });

    return deferred.promise;
}

function buildTwitterHeader(twitter_token, twitter_secret) {
    return {
        'Authorization': 'oauth_token=' + twitter_token + ', oauth_secret=' + twitter_secret,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Nonce': nonceAndTimestampHelper.getNonce(),
        'X-Timestamp': nonceAndTimestampHelper.getTimestamp()
    }
}

function buildFacebookHeader(facebook_token) {
    return {
        'Authorization': 'access_token=' + facebook_token,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Nonce': nonceAndTimestampHelper.getNonce(),
        'X-Timestamp': nonceAndTimestampHelper.getTimestamp()
    }
}

var api = {
    login: function (twitter_token, twitter_secret, facebook_token) {
        if (twitter_token) {
            return makeRequest(apiUrl + 'getAuth', 'POST', buildTwitterHeader(twitter_token, twitter_secret));
        }

        if (facebook_token) {
            return makeRequest(apiUrl + 'getAuth', 'POST', buildFacebookHeader(facebook_token));
        }
    },
    logout: function (sessionToken) {
        return makeRequest(apiUrl + 'deleteAuth', 'POST', {'session_token': sessionToken, 'Accept': 'application/json'});
    }
};

module.exports = api;