var request = require('request');

var options = {
    method: 'GET',
    headers: {'user-agent': 'Botched-Clone'},
    timeout: 7 * 1000
};

/**
 * Get JSON response from a url
 * @param _url - Url to get data from
 * @param _port - Port of the url to get data from
 * @param _timeout - Optional: Timeout
 * @param callback - Callback, returns JSON or error
 * @constructor
 */
exports.GET = function (_url, _port, _timeout, callback) {
    options.uri = _url;
    options.port = _port;
    options.method = 'GET';
    options.body = '';

    if(typeof _timeout == 'number'){
        options.timeout = _timeout;
    }else{
        callback = _timeout;
    }

    request.get(options, function(error, response, body){
            callback(error, response, body);
    })
};


exports.POST = function (_url, _port, _timeout, _body, callback){
    options.uri = _url;
    options.port = _port;
    options.method = 'POST';
    options.body = _body;
    options.contentType = "application/json";

    if(typeof _timeout == 'number'){
        options.timeout = _timeout;
    }else{
        callback = _timeout;
    }

    request.post(options, function(error, response, body){
        callback(error, response, body);
    })


};


/**
 * Get HEAD of webpage in JSON
 * @param _url - Url to get headers from
 * @param _port - Port of the url
 * @param _timeout - Optional: Timeout
 * @param callback - Callback, headers
 * @constructor
 */
exports.GETHEAD = function (_url, _port, _timeout, callback) {
    options.uri = _url;
    options.port = _port;

    request.head(options, function(error, response){
        callback(error, response.headers);
    })
};

/**
 * Returns a JSON data store from an API location
 * @param _url - Required: Direct URL to the api location
 * @param callback - Callback, Boolean success, JSON data store
 */
exports.getAPI = function (_url, callback){

    this.GET(_url, 80, 7000, function(err, resp, body){
        if(!err && resp.statusCode === 200 && body !== ''){
            callback(true, JSON.parse(body));
        }else{
            callback(false, null);
        }
    });
};