/**
 Botched3 -- Plugin Center
 Made by Mustek using NodeJS for #Minecraft on Freenode
 **/

var fs = require('fs');
var util = require('util');
var oop = require('oop-module');
var logger = require('../lib/logger.js');
var airbrake;

exports.pluginCenter = PluginCenter;

var botched = null;
var loadedPlugins = {};

function PluginCenter(client, config) {
    try {
        botched = client;
    } catch (error) {
        logger.system(logger.CRITICIAL, error);
    }

    logger.system(logger.SYSTEM, 'Plugincenter Loaded!');
    this.loadAllPlugins();

    botched.on('msg', function (nick, to, message) {
        logger.message(to, nick, message);
    });

    airbrake = require('airbrake').createClient(config.app.airbrakeKey);
    airbrake.env = config.app.environment;
    airbrake.serviceHost = config.app.airbrakeHost;
    airbrake.protocol = "https";

}

PluginCenter.prototype.say = function (to, text) {
    botched.say(text, to);
};

PluginCenter.prototype.loadAllPlugins = function (callback) {
    var self = this;
    fs.readdirSync('./plugins').forEach(function (file) {
        if (fs.lstatSync('./plugins/' + file).isDirectory()) {
            self.loadPlugin(file);

        }
    });

    if (typeof callback == 'function') callback();
};

PluginCenter.prototype.loadPlugin = function (directory) {
    var location = './plugins/' + directory + '/manifest.json';

    this.getManifest(location, function (manifest) {
        if (manifest !== undefined || manifest !== null) {
            try {
                var plugin = oop.class('../plugins/' + directory + '/' + manifest.mainConstruct + '.js');
                var name = manifest.name.toLocaleLowerCase();

                if (loadedPlugins[name] === undefined) {
                    loadedPlugins[name] = new plugin();         // Define the plugin
                    loadedPlugins[name].setManifest(manifest);  // Set the manifest file
                    loadedPlugins[name].setBot(botched);        // Insert the bot functions
                    loadedPlugins[name].onLoad();               // Load the plugin
                    loadedPlugins[name].directory = "../plugins/" + directory + "/" + manifest.mainConstruct + '.js';

                } else {    // Show error if the plugin happens to be loaded already.
                    logger.log(logger.ERROR, 'PLUGIN', util.format('%s is already loaded.', manifest.name));
                }

            } catch (err) { // Show error if a fatal error occurred on load
                logger.system(logger.ERROR, util.format('Plugin %s crashed and could not recover. ( %s)',manifest.name, err));
            }

        }
    });

};

PluginCenter.prototype.getManifest = function (location, callback) {
    fs.readFile(location, 'utf8', function (err, data) {
        if (err) {  // Error out if the manifest file is missing
            logger.system(logger.ERROR, util.format('Could not find a manifest file at %s. Plugin not loaded.', location));
            return;
        }
        callback(JSON.parse(data));
    });
};

process.on('uncaughtException', function(err) {
    console.log(err);
    airbrake.notify(err, handleError(err));
});


var handleError = function (err) {
    botched.say(util.format('Halp! I broke something :( (%s)', err.message));
};