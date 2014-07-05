/**
 Ping plugin for Botched3
 Made by Mustek using NodeJS for #Minecraft on Freenode
 **/

var oop = require('oop-module');
var _super = oop.extends('../plugin.js');

var cmdListener = null;

/***
 * Constructor for the plugin, required in every plugin and does not get inherited.
 */
exports.constructor = function () {
};

exports.onLoad = function () {
    cmdListener = _super.getBot().on('cmd', onCommand);
    _super.onLoad();
};

exports.onUnload = function () {
    _super.getBot().removeListener('cmd', onCommand);
    _super.onUnload();
};

var onCommand = function (command, nick, to) {
    switch (command) {
        case 'ping':
            _super.getBot().say("Pong!", to);
            return;
        case 'pong':
            _super.getBot().say("Ping?", to);
            return;
        case 'ding':
            _super.getBot().say("Dong!", to);
            return;
        case 'dong':
            _super.getBot().say('Hey! Don\'t touch that!', to);
            return;
        case 'sing':
            _super.getBot().say('\u266B\u266ANever gonna give you up!\u266B', to);
            return;
        case 'song':
            _super.getBot().say('\u266ANever gonna let you down!\u266A\u266B', to);
            return;
        case 'bing':
            _super.getBot().say('1 results for "boobs": (.y.)', to);
            return;
        case 'bong':
            _super.getBot().doAction('smokes an egg.', to);
    }
};