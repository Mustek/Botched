/**
 Botched3, Codename Bree
 Made by Mustek using NodeJS for #Minecraft on Freenode
 **/

var botched = require('./bot/botBotched.js');
var pluginCenter = require('./bot/pluginCenter.js');
var fs = require("fs");

if(!fs.existsSync("config.json")){
    console.error("[CRITICAL] config.json is missing. Stopping application.");
    process.exit(1);
}

var config = require("./config.json");

var bot = new botched.Botched(config);

bot.connect(3, function () {
    var pc = new pluginCenter.pluginCenter(bot, config);
});