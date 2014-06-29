/**
 Admin plugin for Botched3
 Made by Mustek using NodeJS for #Minecraft on Freenode
 **/

var oop = require('oop-module');
var _super = oop.extends('../plugin.js');
var util = require('util');
var pluginCenter = null;

var access;
var err;

/***
 * Constructor for the plugin, required in every plugin and does not get inherited.
 */

exports.constructor = function () {
    access = 0;
    err = null;
};

exports.onLoad = function () {
    _super.onLoad();
    _super.getBot().on('cmd', onCommand);
};

exports.setPluginCenter = function (_pluginCenter) {
    pluginCenter = _pluginCenter;
};

function onCommand(command, nick, to, args, message) {
    access = _super.getManifest().permissions[message.host];
    err = null;

    switch (command) {
        case 'nick':
            changeNick(args[1]);
            return;
        case 'quit':
            botDisconnect(to, nick, args);
            return;
        case 'part':
            botPart(to, args);
            return;
        case 'join':
            botJoin(to, args);
            return;
        case 'say':
            sayTo(to, args);
            return;
        case 'do':
            doTo(to, args);
            return;
    }
}

// 2 - Change nickname
function changeNick(args) {
    if (access == 2) {
        if (!/[^A-Za-z0-9_]/ig.test(args)) {
            _super.getBot().send("NICK", args);
        }
    } else err = 1;
}

// 2 - Shut down bot
function botDisconnect(to, nick, args) {
    if (access == 2) {
        args.splice(0, 1);
        var reason = args.join(' ');

        _super.getBot().say(util.format("Stopping process. Requested by %s (%s)", nick, reason), to);
        _super.getBot().disconnect(reason);
    } else err = 1;
}

// 1 - Part a channel
function botPart(to, args) {
    if (access >= 1) {
        var channel = (args[1]) ? args[1] : to;
        _super.getBot().part(channel);
    } else err = 1;
}

// 1 - Join a channel
function botJoin(to, args) {
    if (access == 2) {
        var channel = (args[1]) ? args[1] : to;
        _super.getBot().join(channel);
    } else err = 1;
}

// 1 - Say something
function sayTo(to, args) {
    if (access >= 1) {
        var channel = to;

        if (args[1][0] == '#') {
            channel = args[1];
            args.splice(0, 2);
        } else args.splice(0, 1);

        _super.getBot().say(args.join(" "), channel);


    } else err = 1;
}

// 1 - Do something
function doTo(to, args) {
    if (access >= 1) {
        var channel = to;

        if (args[1][0] == '#') {
            channel = args[1];
            args.splice(0, 2);
        } else args.splice(0, 1);

        _super.getBot().doAction(args.join(" "), channel);


    } else err = 1;
}