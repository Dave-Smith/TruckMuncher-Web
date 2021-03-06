var request = require('request'),
    q = require('q'),
    guid = require('./guid');

var apiUrl = process.env.API_URL;

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
        var uuid = guid.gen();
        var _32randomChars = uuid.replace(/-/gi, '');
        return (new Buffer(_32randomChars).toString('base64'));
    }
};

function makeRequest(url, method, header) {
    var options = {
        url: url,
        method: method,
        body: JSON.stringify({}),
        strictSSL: true,
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

function buildHeader() {
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Nonce': nonceAndTimestampHelper.getNonce(),
        'X-Timestamp': nonceAndTimestampHelper.getTimestamp()
    }
}

var api = {
    login: function (twitter_token, twitter_secret, facebook_token) {
        var host = (process.env.VCAP_APP_HOST || 'localhost');
        var header = buildHeader();
        if (twitter_token) {
            header.Authorization = 'oauth_token=' + twitter_token + ', oauth_secret=' + twitter_secret;
        }
        if (facebook_token) {
            header.Authorization = 'access_token=' + facebook_token;
        }
        if (host === 'localhost') {
            header.Authorization =  'oauth_token=tw985c9758-e11b-4d02-9b39-98aa8d00d429, oauth_secret=munch';
        }
        return makeRequest(apiUrl + '/com.truckmuncher.api.auth.AuthService/getAuth', 'POST', header);
    },
    logout: function (sessionToken) {
        var header = buildHeader();
        header.session_token = sessionToken;
        return makeRequest(apiUrl + '/com.truckmuncher.api.auth.AuthService/deleteAuth', 'POST', header);
    }, link: function (twitter_token, twitter_secret, facebook_token) {
        var header = buildHeader();
        if (twitter_token) {
            header.Authorization = 'oauth_token=' + twitter_token + ', oauth_secret=' + twitter_secret;
        }
        if (facebook_token) {
            header.Authorization = 'access_token=' + facebook_token;
        }
        return makeRequest(apiUrl + '/com.truckmuncher.api.user.UserService/linkAccount', 'POST', header);
    }
};

module.exports = api;