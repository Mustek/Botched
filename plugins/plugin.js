/**
 Main plugin class to be inherited by all plugins.
 Do not modify anything in here unless you know what you're doing!
 */

var logger = require('../lib/logger.js');

var manifest = null;
var bot = null;

exports.constructor = function () {
};

// Needs to be called when a plugin loads.
exports.onLoad = function () {
    logger.log(logger.INFO, 'PLUGIN', manifest.name + ' version ' + manifest.version + ' loaded.');
};

// Needs to be called when a plugin unloads.
exports.onUnload = function () {
    logger.log(logger.WARNING, 'PLUGIN', manifest.name + ' unloaded.');
};

// Gets the manifest from the plugincenter
exports.setManifest = function (_manifest) {
    manifest = _manifest;
};

// Returns the manifest contents
exports.getManifest = function () {
    return manifest;
};

// Sets the bot, used for channel interactivity
exports.setBot = function (_bot) {
    bot = _bot;
};

// Gets the bot's functions. For channel activity
exports.getBot = function () {
    return bot;
};

// Fetch a certain setting from the manifest file
exports.getSetting = function (_setting) {
    if (manifest.settings === undefined || manifest.settings[_setting] === undefined) {
        return null;
    } else return manifest.settings[_setting];
};

// Get subscribed channels from the manifest file. Handy for announcements
exports.getSubscribers = function () {
    if (manifest.subscriptions == undefined) {
        return null;
    } else {
        return manifest.subscriptions;
    }
};

// Throw an error (Not used as much as I'd like)
exports.throwError = function (err, channel, message) {
    if (err.message === 'usage') {
        bot.say('Incorrect usage. ' + manifest.usage, channel);
    } else {
        bot.say(message, channel);
    }
};
