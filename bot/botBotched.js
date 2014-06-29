/**
 Botched3 -- Bot Engine
 Made by Mustek using NodeJS for #Minecraft on Freenode
 **/

var EventEmitter = require('events').EventEmitter;

var logger = require('../lib/logger.js');
var irc = require('irc');
var util = require('util');

var config = null;
var lastChannel = null;

exports.Botched = Botched;

function Botched(config) {
    var self = this;
    this.config = config;

    var options = {
        realname: config.bot.username,
        password: config.server.password,
        port: config.server.port,
        autoConnect: config.server.autoConnect,
        debug: true,
        directory: __dirname
    };

    this.client = new irc.Client(config.server.host, config.bot.nickname, options);

    // IRC errors
    this.client.on('error', function (message) {

        console.log(clid.getData());
        self.client.say(lastChannel, 'I\'m sorry... (' + message.args[2] + ')');
    });
}

util.inherits(Botched, EventEmitter);

/* Connect to server */
Botched.prototype.connect = function (retryCount, callback) {
    var self = this;

    logger.system(logger.SYSTEM, 'Connecting to host: ' + this.config.server.host);
    self.client.connect(3, callback);

    /* EVENT EMITTERS */
    self.client.on('message', function (nick, to, text, message) {
        var args = text.split(' ');
        if (args[0][0] === self.config.bot.command) {
            to = (to[0] == '#') ? to : nick;
            self.emit('cmd', args[0].substr(1).toLowerCase(), nick, to, args, message);
        }
        lastChannel = to;
        self.emit('msg', nick, to, text);

    });
};

/* Disconnect from server */
Botched.prototype.disconnect = function (message) {
    message = (message = "") ? "Goodbye" : message;
    this.client.disconnect(message);
    logger.system(logger.SYSTEM, 'Disconnecting from server');
};

/* Join a channel */
Botched.prototype.join = function (channel) {
    this.client.join(channel);
    logger.system(logger.SYSTEM, 'Joining channel ' + channel);
};

/* Part a channel */
Botched.prototype.part = function (channel) {
    if (this.client.chans[channel.toLowerCase()]) {
        this.client.part(channel);
        logger.system(logger.SYSTEM, 'Parting channel ' + channel);
    } else {
        logger.system(logger.WARNING, "Unable to part unjoined channel.");
    }
};

/* Say something */
Botched.prototype.say = function (message, to) {
    to = to || lastChannel;
    this.client.say(to, message);
};

/* Do something */
Botched.prototype.doAction = function (message, to) {
    to = to || lastChannel;
    this.client.action(to, message);
};

/* Send RAW command */
Botched.prototype.send = function (command, argument) {
    logger.system(logger.NORMAL, argument);
    this.client.send(command, argument);
};