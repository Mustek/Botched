/**
 MC Version plugin for Botched3
 Made by Mustek using NodeJS for #Minecraft on Freenode
 **/

var oop = require('oop-module');
var _super = oop.extends('../plugin.js');
var request = require('request');
var util = require('util');
var COLOR = require('../../lib/irccolors.js');

var cmdListener = null;

var versions = {etag: '', release: '', snapshot: ''};
var latest = {};
var options = {};

/***
 * Constructor for the plugin, required in every plugin and does not get inherited.
 */
exports.constructor = function () {
};

exports.onLoad = function () {
    _super.onLoad();
    cmdListener = _super.getBot().on('cmd', onCommand);

    loadOptions();
    populateFields();
    setInterval(checkNew, _super.getSetting('check-interval') * 1000);
};

exports.onUnload = function () {
    _super.getBot().removeListener('cmd', onCommand);
    _super.onUnload();
};


var onCommand = function (command, nick, to) {
    if (command == 'version') {
        var snapshotType = (versions.snapshot[1] === '.') ? 'Pre-Release' : 'Snapshot';

        if (versions.release !== versions.snapshot) {
            _super.getBot().say(util.format('Minecraft Versions: [Stable: %s] [%s: %s]',
                versions.release, snapshotType, versions.snapshot), to);

        } else {
            _super.getBot().say(util.format('Minecraft Versions: [Stable: %s]',
                versions.release), to);
        }
    }
};

var loadOptions = function () {
    options.url = _super.getSetting('source-url');
    options.headers = {'user-agent': _super.getSetting('user-agent')};
    options.port = _super.getSetting('source-port');
    options.method = _super.getSetting('source-method');
};

// Check for newer versions
var checkNew = function () {
    getEtag(function (_etag) {
        if (_etag != versions.etag) {
            versions.etag = _etag;
            getVersions(checkUpdates);
        }
    });
};

// Check if a new version is out, return etag
var getEtag = function (callback) {
    request.head(options, function (err, resp) {
        if (resp !== undefined && resp.headers.etag !== undefined) {
            callback(resp.headers.etag);
        }
    });
};

// Return object (.release, .snapshot)
var getVersions = function (callback) {
    options.method = 'GET';
    request.get(options, function (error, response, body) {
        callback(JSON.parse(body));
    });
};

var populateFields = function () {
    getEtag(function (_etag) {
        versions.etag = _etag;
    });

    getVersions(function (versionList) {
        versions.release = versionList.latest.release;
        versions.snapshot = versionList.latest.snapshot;

        latest = versionList.versions;
    });
};

var checkUpdates = function (versionList) {
    var newVersion = [];
    var changedVersion = [];

    for (var keyA in versionList.versions) {
        if (versionList.versions.hasOwnProperty(keyA)) {
            var verOne = versionList.versions[keyA];
            var isNew = true;

            for (var keyB in latest) {
                if (latest.hasOwnProperty(keyB)) {
                    var verTwo = latest[keyB];

                    if (verOne.id == verTwo.id) {
                        isNew = false;
                        if (verOne.time != verTwo.time) {
                            changedVersion.push(verTwo.id + ',' + verTwo.type);
                        }
                    }
                }
            }
            if (isNew) newVersion.push(verOne.id + ',' + verOne.type);
        }
    }


    latest = versionList.versions;
    versions.release = versionList.latest.release;
    versions.snapshot = versionList.latest.snapshot;
    announceChanges(newVersion, changedVersion);
};

var announceChanges = function (_newVersion, _changedVersion) {
    var subscribers = _super.getSubscribers();
    for (var sub in subscribers) {
        if (subscribers.hasOwnProperty(sub)) {

            // A new version has been released
            if (_newVersion.length == 1) {
                _super.getBot().say(util.format('%s%s[Version] Minecraft %s %s has been released!\u000F',
                    COLOR.BOLD, COLOR.RED, _newVersion[0].split(',')[1], _newVersion[0].split(',')[0]), subscribers[sub]);
                // Multiple new versions have been released
            } else if (_newVersion.length > 1) {
                var newString = "";
                for (var nversion in _newVersion) {
                    if (_newVersion.hasOwnProperty(nversion)) {
                        newString = newString + (util.format('[%s %s] ', _newVersion[nversion].split(',')[1], _newVersion[nversion].split(',')[0]));
                    }
                }
                _super.getBot().say(util.format('%s%s[Version] Multiple new versions have been released! %s\u000F',
                    COLOR.BOLD, COLOR.RED, newString), subscribers[sub]);
            }

            // An existing version has been updated
            if (_changedVersion.length == 1) {
                _super.getBot().say(util.format('%s[Version] Minecraft %s %s has been updated!\u000F',
                    COLOR.BROWN, _changedVersion[0].split(',')[1], _changedVersion[0].split(',')[0]), subscribers[sub]);
                // Multiple exisiting versions have been updated
            } else if (_changedVersion.length > 1) {
                var updateString = "";
                for (var cversion in _changedVersion) {
                    if (_changedVersion.hasOwnProperty(cversion)) {
                        updateString = updateString + (util.format('[%s %s] ', _changedVersion[cversion].split(',')[1], _changedVersion[cversion].split(',')[0]));
                    }
                }
                _super.getBot().say(util.format('%s[Version] Multiple versions have been updated! %s\u000F',
                    COLOR.BROWN, updateString), subscribers[sub]);
            }
        }
    }
};