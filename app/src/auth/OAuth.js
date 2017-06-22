(function(){
    'use strict';
    
spoti.service('oauth', ['$q', '$location', OAuth]);
function OAuth($q, $location){

    var host = $location.host();
    var token;

    if (['spotiplay.github.io', 'garmoshka-mo.github.io', 'localhost', 'l.dub.ink'].indexOf(host) == -1)
        Rollbar.error('Unknown host: '+host);

    if ($location.port() == 5000) host += ':5000';


    function ajaxPromise(query) {
        var deferred = $q.defer();
        query.success = deferred.resolve;
        ajax(query);
        return deferred.promise;
    }

    function ajax(query) {
        get_token(function(token){
            query.headers = {'Authorization': 'Bearer ' + token};
            query.error = function (xhr, textStatus, thrownError) {
                if (xhr.status == 401) {
                    log('401: renewing token');
                    renew_token();
                } else
                    error('AJAX error: got non-401',
                        {xhr: xhr, textStatus:textStatus, thrownError:thrownError}
                    );
            };
            $.ajax(query);
        });
    }

    function get_token(callback) {
        if (token) return callback(token);

        token = localStorage.getItem('oauth_token');
        if (token) return callback(token);

        else renew_token();
    }

    function wipe_tokens() {
        token = false;
        localStorage.removeItem('oauth_token');
    }

    function set_user(uid) {
        user_id = uid;
        localStorage.setItem("user_id", uid);

    }

    function renew_token() {
        var params = {
            client_id: "b0759ecfe6794391869a66c0b732cd07",
            response_type: 'token',
            redirect_uri: "https://"+host+"/",
            scope: ["user-read-private",
                // "user-read-email",
                "playlist-read-private", 'playlist-read-collaborative',
                "playlist-modify-public", "playlist-modify-private",
                "user-library-read"].join(' '),
            state: generate_state()
        };

        var url = "https://accounts.spotify.com/authorize/?" +
            Object.keys(params).map(function(key){
                return key + '=' + encodeURIComponent(params[key]);
            }).join('&');

        localStorage.setItem('oauth_last_path', $location.path());

        window.location.href = url;
    }

    function generate_state() {
        var state = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
        localStorage.setItem('oauth_state', state);
        return state;
    }

    function check() {
        var x = $location.path();
        var urlParams = {};
        var match,
            pl     = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query  = x.substring(1);

        while (match = search.exec(query))
            urlParams[decode(match[1])] = decode(match[2]);

        if (!urlParams || !urlParams.access_token || !urlParams.state) return 'RESUME';

        if (localStorage.getItem('oauth_state') != urlParams.state) {
            error('wrong oAuth state', urlParams);
            //return 'WRONG_STATE';
        }

        localStorage.setItem('oauth_token', urlParams.access_token);

        var path = localStorage.getItem('oauth_last_path');
        log('Restore path: '+path);
        $location.path(path);

        return 'REDIRECT';
    }

    return {
        ajax: ajax,
        ajaxPromise: ajaxPromise,
        get_token: get_token,
        check_arrival_of_access_token: check,
        wipe_tokens: wipe_tokens,
        set_user: set_user
    };
}
    
})();