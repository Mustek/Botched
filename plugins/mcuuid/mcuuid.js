/**
 Minecraft UUID plugin for Botched3
 Made by Mustek using NodeJS for #Minecraft on Freenode
 **/

var oop = require('oop-module');
var _super = oop.extends('../plugin.js');
var http = require('../../lib/httpRequest.js');
var util = require('util');
var logger = require('../../lib/logger.js');


var cmdListener = null;
var urlUUID = null;
var urlNick = null;

/***
 * Constructor for the plugin, required in every plugin and does not get inherited.
 */
exports.constructor = function () {
};

exports.onLoad = function () {
    loadOptions();
    cmdListener = _super.getBot().on('cmd', onCommand);
    _super.onLoad();
};

exports.onUnload = function () {
    _super.getBot().removeListener('cmd', onCommand);
    _super.onUnload();
};


var onCommand = function (command, nick, to, args) {
    var query = args[1];

    if (command === 'uuid') {

        if (args[1].length < 32) {

            fetchUUID(command, query, function (result) {
                if (result[0] !== undefined && result != 'usage' && result != 'error') {
                    _super.getBot().say(util.format("'%s': %s", result[0].name, result[0].id));
                } else if (result == 'usage') {
                    _super.getBot().say('Incorrect Usage: ' + _super.getManifest().usage, to);
                } else if (result == 'error') {
                    _super.getBot().say('There was a problem processing your request. Please try again later.', to);
                } else {
                    _super.getBot().say(util.format("'%s' is not a valid name.", args[1]));
                }
            });
        } else {

            fetchNick(command, query, function (result) {
                if (result !== undefined && result != 'usage' && result != 'error') {
                    _super.getBot().say(util.format("'%s': %s", result.name, result.id));
                } else if (result == 'usage') {
                    _super.getBot().say('Incorrect Usage: ' + _super.getManifest().usage, to);
                } else if (result == 'error') {
                    _super.getBot().say('I could not find a nickname for that UUID', to);
                } else {
                    _super.getBot().say(util.format("'%s' is not a valid UUID.", args[1]));
                }
            });
        }
    }

};

var loadOptions = function(){
    urlUUID = _super.getSetting('uuid-url');
    urlNick = _super.getSetting('nick-url');

    if(urlUUID === null || urlNick === null){
        exports.onUnload();
        logger.log(logger.ERROR, _super.getManifest().tag, 'Missing uuid-url or nick-url in manifest file. Stopping plugin.');
    }
};

var fetchUUID = function (_location, query, callback) {

    var body = util.format('["%s"]', query);


    if (query !== undefined) {
        http.POST(urlUUID, 443, 7000, body, function (err, resp, body) {
            if (!err && resp.statusCode == 200) callback(JSON.parse(body));
            else callback('error');
        });
    } else callback('usage');
};

var fetchNick = function (_location, query, callback) {
    console.log(urlNick + query);
    if (query !== undefined) {
        http.GET(urlNick + query, 443, 7000, function (err, resp, body) {
            if (!err && resp.statusCode == 200) callback(JSON.parse(body));
            else callback('error');
        });
    } else callback('usage');
};