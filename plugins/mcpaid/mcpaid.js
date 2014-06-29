/**
 Minecraft Paid plugin for Botched3
 Made by Mustek using NodeJS for #Minecraft on Freenode
 **/

var oop = require('oop-module');
var _super = oop.extends('../plugin.js');
var http = require('../../lib/httpRequest.js');
var util = require('util');
var color = require('../../lib/irccolors.js');
var logger = require('../../lib/logger.js');

var cmdListener = null;
var url = null;

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
    if (command === 'paid') {
        var query = args[1];

        fetchData(command, query, function (result) {
            if (result == 'usage') {
                _super.getBot().say('Incorrect Usage: ' + _super.getManifest().usage, to);
            } else if (result == 'error') {
                _super.getBot().say('There was a problem. Try again later.', to);
            } else if (result) {
                _super.getBot().say(util.format('%s%s\u2713%s The account %s is premium.',color.GREEN, color.BOLD, color.RESET, query), to);
            } else {
                _super.getBot().say(util.format('%s%s\u2718%s The account %s is not premium.',color.RED, color.BOLD, color.RESET, query), to);
            }
        });

    }
};

var loadOptions = function(){
    url = _super.getSetting('source-url');

    if (url === null) {
        exports.onUnload();
        logger.log(logger.ERROR, _super.getManifest().tag, 'Missing source-url in manifest file. Stopping plugin.');

    }
};

var fetchData = function (_location, query, callback) {
    if (query !== undefined) {
        http.GET(url + query, 443, 7000, function (err, resp, body) {
            if (!err && resp.statusCode == 200) callback(JSON.parse(body));
            else callback('error');
        });
    } else callback('usage');
};