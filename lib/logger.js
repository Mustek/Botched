/**
 Botched3 -- Logging Library
 Made by Mustek using NodeJS for #Minecraft on Freenode
 **/

// Imports
var util = require('util'),
    color = require('./colors.js');


exports.NORMAL = {id: 0, color: color.WHITE};
exports.INFO = {id: 1, color: color.CYAN};
exports.WARNING = {id: 2, color: color.YELLOW};
exports.ERROR = {id: 3, color: color.RED};
exports.CRITICIAL = {id: 4, color: color.MAGENTA};
exports.SYSTEM = {id: 4, color: color.BLUE};


/***
 * Function to log messages to console.
 * @param channel Channel Name
 * @param name Nickname
 * @param message Sent message
 */
exports.message = function (channel, name, message) {
    var date = new Date();
    date = util.format("%02i:%02i:%02i", date.getHours(), date.getMinutes(), date.getSeconds());
    console.log(util.format("%s %s[%s] %s: %s%s", date, color.WHITE, channel.toUpperCase(), name, message, color.RESET));

};

/***
 * Function to log straight to console, useful for debugging
 * @param type Log type, see logger.LOGTYPE
 * @param tag Tag text, appears between brackets
 * @param message Message to log
 */
exports.log = function (type, tag, message) {
    util.log(util.format("%s[%s] %s%s", type.color, tag.toUpperCase(), message, color.RESET));
};

/**
 * Function to log system messages, do not use for plugins!
 * @param type
 * @param message
 */
exports.system = function (type, message) {
    util.log(util.format("%s[SYS] %s%s", type.color, message, color.RESET));
};


/**
 *
 * @param to
 * @param message
 */
exports.response = function (to, message) {
    util.log(util.format("%s[%s] %s%s",  color.GREEN, to, message, color.RESET));
};

/**
 * Function to post debug messages. Should not be visible in the end.
 * @param message Message to log to console
 */
exports.debug = function (message) {
    // TODO: Add some kind of toggle switch in the settings
    util.debug(message);
};