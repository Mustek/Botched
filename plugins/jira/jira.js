/**
 Mojira plugin for Botched3
 Made by Mustek using NodeJS for #Minecraft on Freenode
 **/

var oop = require('oop-module');
var _super = oop.extends('../plugin.js');
var util = require('util');
var http = require('../../lib/httpRequest.js');
var googl = require('goo.gl');


var cmdListener = null;
var retryCount;

/***
 * Constructor for the plugin, required in every plugin and does not get inherited.
 */
exports.constructor = function () {
};

exports.onLoad = function () {
    loadConfig();
    cmdListener = _super.getBot().on('cmd', onCommand);
    _super.onLoad();
};

exports.onUnload = function () {
    _super.getBot().removeListener('cmd', onCommand);
    _super.onUnload();
};

var loadConfig = function(){
    googl.setKey(_super.getSetting('googl-api'));
    retryCount = _super.getSetting('retry-count');
};


var onCommand = function (command, nick, to, args) {
    if (command === 'bugs') {
        _super.getBot().say('Mojang Bugtracker: ' + _super.getSetting('jira-url'), to);
    }

    if (command === 'bug') {
        if (args.length !== 2 || !(/MC|MCAPI|MCL|MCPE\-[0-9]+/.test(args[1]))) {
            _super.getBot().say('Incorrect Usage: ' + _super.getManifest().usage, to);
            return;
        }

        fetchData(args[1], function (err, response) {
            if (err !== 0) {
                _super.getBot().say(response, to);

            } else if (err === 0) {
                var extra = (response.fixVersion !== '') ? ': ' + response.fixVersion : (response.dupeVersion !== '') ? ': ' + response.dupeVersion : '';
                var reply = util.format('\u0002[%s]\u000F %s | %s%s | %s', response.key, response.description, response.state, extra, response.shortUrl);
                _super.getBot().say(reply, to);
            }
        });

    }
};

var fetchData = function (bugCode, callback) {
    console.log(_super.getSetting('jira-api').replace('{bug}', bugCode));
    http.GET(_super.getSetting('jira-api').replace('{bug}', bugCode), 443, 5000, function (err, resp, body) {
        if (!err && resp.statusCode == 200) {

            body = JSON.parse(body);
            googl.shorten(_super.getSetting('jira-browse').replace('{bug}', body.key)).then(function(shorturl){
                var reply = {
                    key: body.key,
                    description: (body.fields.summary.length > 70) ? body.fields.summary.substring(0, 69) + '\u2026' : body.fields.summary,
                    state: (body.fields.resolution !== null) ? body.fields.resolution.name.replace('Works As Intended', 'Intended') : 'Open',
                    fixVersion: (body.fields.fixVersions[0] !== undefined) ? body.fields.fixVersions[0].name.replace('Minecraft ', '') : '',
                    dupeVersion: (body.fields.issuelinks[0] !== undefined && body.fields.issuelinks[0].outwardIssue !== undefined) ? body.fields.issuelinks[0].outwardIssue.key : '',
                    shortUrl: shorturl.id
                };
                callback(0, reply);
            }).catch(function(err){
                util.error("Error while shortening url: " + err.message);
            });
        } else if (resp.statusCode == 401) {
            callback(401, "This is a private bugreport.");
        } else if (resp.statusCode == 404) {
            callback(404, "This bugreport does not exist.");
        } else if (retryCount > 0) {
            retryCount--;
            fetchData(bugCode, callback);
        } else {
            callback(1, "Request timed out. Mojira might be down or slow.");
        }
    });
};