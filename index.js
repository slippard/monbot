const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require('./config.json');
const mongoose = require('mongoose');
mongoose.connect(config.dburl);
const User = require('./models/user');
const fs = require('fs');
const db = mongoose.connection;
bot.commands = new Discord.Collection();
var Roll = require('roll'),
    roll = new Roll();

db.on('error', function (err) {
    console.log('Something went wrong: ' + err);
});

db.once('open', function () {
    console.log('Connected to mongo database.');
})

fs.readdir('./commands/', (err, files) => {
    if (err) console.error(err);
    var jsfiles = files.filter(f => f.split('.').pop() === 'js');
    if (jsfiles.length <= 0) {
        return console.log('No commands found...')
    } else {
        console.log(jsfiles.length + ' commands loaded.')
    }
    jsfiles.forEach((f, i) => {
        var cmds = require(`./commands/${f}`);
        bot.commands.set(cmds.config.command, cmds);
    })
})

bot.on('message', message => {
    let prefix = config.prefix;
    let sender = message.author;
    let cont = message.content.slice(prefix.length).split(" ");
    let args = cont.slice(1);
    let cmd = bot.commands.get(cont[0]);
    if (cmd) cmd.run(bot, message, args);
    if (bot.user.id === message.author.id) { return };
    if (!message.content.startsWith(prefix)) {
        checkProfile(sender);
    }
});


bot.on('ready', () => {
    console.log('Bot ready...');
    bot.user.setStatus('available')
    bot.user.setPresence({
        game: {
            name: ' Online',
            type: 0,
        }
    });
});


function checkProfile(sender) {
    User.findOne({userId: sender.id}, function (err, record) {
        if (err) {
            console.log(err.stack);
        }
        if (!record) {
            let user = new User();
            user.username = sender.username;
            user.userId = sender.id;
            user.messageCount = 0;
            user.save(function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(sender.username + ' added to the database.');
                }
            })
        } else {
            User.update({userId: sender.id}, {$inc: {messageCount: 1}}).then(function () {
                console.log('message count incremented for ' + record.username);
            })
        }
    })
}

bot.login(config.token);