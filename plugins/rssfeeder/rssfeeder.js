var oop = require('oop-module');
var _super = oop.extends('../plugin.js');
var logger = require('../../lib/logger.js');
var http = require('request');
var util = require('util');
var COLOR = require('../../lib/irccolors.js');
var googl = require('goo.gl');

var cmdListener = null;
var feed = null;
var lastPost = null;

exports.constructor = function () {

};

exports.onLoad = function () {
    _super.onLoad();
    cmdListener = _super.getBot().on('cmd', onCommand);
    googl.setKey(_super.getSetting("googl-key"));   // Set googl API-Key (Manifest file)
    loadFeed();
    setInterval(feedNewCheck, 60 * 1000);
};

exports.onUnload = function () {
    _super.getBot().removeListener('cmd', onCommand);
    _super.onUnload();
};

var onCommand = function (command, nick, to) {
    if (command == 'rss' || command == 'blog') {
        http.get({url: feed}, function (err, resp, body) {
            var entry = JSON.parse(body).responseData.feed.entries[0];
            var entryDate = new Date(Date.parse(entry.publishedDate));
            googl.shorten(entry.link, function (shorturl) {
                console.log(shorturl);
                _super.getBot().say(util.format('%s%s%s | %s%d-%d-%d%s | %s%s%s',
                    COLOR.BOLD, entry.title, COLOR.RESET,
                    COLOR.LIGHT_GRAY, entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate(), COLOR.RESET,
                    COLOR.LIGHT_GRAY, shorturl.id, COLOR.RESET), to);
            });
        });
    }

};

// Load the feed with the required checks
var loadFeed = function () {
    var pattern = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[{};:'".,<>?«»“”‘’]|\]|\?))/ig;
    var error = false;
    var sourceUrl = _super.getSetting("source-url");

    if (sourceUrl === null) {
        error = true;
    } else if (!sourceUrl.match(pattern)) {
        error = true;
    }

    if (error) {
        logger.log(logger.ERROR, _super.getManifest().tag, 'Missing source-url in manifest file. Stopping plugin.');
        exports.onUnload();
    } else {
        feed = sourceUrl;
    }
};

// Announce changes to subscribers
var announce = function (entry) {
    var subscribers = _super.getSubscribers();
    googl.shorten(entry.link, function (shorturl) {
        for (var sub in subscribers) {
            if (subscribers.hasOwnProperty(sub)) {
                _super.getBot().say(util.format('%sNew Blogpost:%s %s | %s%s%s',
                    COLOR.BOLD, COLOR.RESET, entry.title, COLOR.LIGHT_GRAY, shorturl.id, COLOR.RESET),
                    subscribers[sub]);
            }
        }
    });
};

// Check if the feed contains new content and announce that content
var feedNewCheck = function () {
    http.get({url: feed}, function (err, resp, body) {
        var entry = JSON.parse(body).responseData.feed.entries[0];
        var entryDate = new Date(Date.parse(entry.publishedDate));
        if (lastPost !== null && lastPost < entryDate.getTime()) {

            announce(entry);
        }
        lastPost = entryDate;
    });
};
