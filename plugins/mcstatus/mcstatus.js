/**
 Minecraft status plugin for Botched3
 Made by Mustek using NodeJS for #Minecraft on Freenode
 **/

var oop = require('oop-module');
var _super = oop.extends('../plugin.js');
var httpRequest = require('../../lib/httpRequest.js');
var logger = require('../../lib/logger.js');
var util = require('util');

var cmdListener = null;

var statusURL = null;
var statusText = {
    'down': '\u0002\u000305\u2718\u000f',
    'up': '\u000303\u2714\u000f',
    'problem': '\u0002\u000307\uFFFD\u000f'
};

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

    if (command === 'status') {

        httpRequest.getAPI(statusURL, function (success, data) {
            if (success) {
                var status = '';
                data = data.report;

                if (args[1] !== undefined && data[args[1].toLowerCase()] !== null) {
                    var smallData = data[args[1].toLowerCase()];
                    status = util.format('[%s] %s - Uptime: %s%%', args[1].toUpperCase(), smallData.title, smallData.uptime);
                } else {

                    var keys = getSortKey(data);
                    for (var i = 0; i < keys.length; i++) {
                        status += util.format('[%s: %s] ', initcaps(keys[i]), data[keys[i]].status);
                    }
                    status += 'www.goo.gl/q73C4';
                    status = status.replace(/up/g, statusText.up).replace(/down/g, statusText.down).replace(/problem/g, statusText.problem);
                }

                _super.getBot().say(status, to);

            } else _super.getBot().say('Everything broke, blame xpaw!', to);
        });
    }

};

var loadOptions = function () {
    statusURL = _super.getSetting('status-url');

    if (statusURL === null) {
        exports.onUnload();
        logger.log(logger.ERROR, _super.getManifest().tag, 'Missing status-url in manifest file. Stopping plugin.');

    }
};

// Replace initial lcase with ucase
var initcaps = function (s) {
    s = s.replace(/(\b\w)([a-zA-Z0-9]+)/gi, function (t, a, b) {
        return a.toUpperCase() + b.toLowerCase();
    });
    return s;
};

// Sort the array
var getSortKey = function (object) {
    var keys = [];

    for (var k in object) {
        if (object.hasOwnProperty(k)) keys.push(k);
    }

    return keys.sort();
};