const Discord = require("discord.js");
const fs = require('fs');

const {
    prefix,
    token,
} = require('./config.json');
const client = new Discord.Client();


client.on("message", function (message) {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();


    var join = async () => {
        if (message.member.voice.channel || !message.member.hasPermission('CONNECT') || !message.member.hasPermission("SPEAK")) {
            try {
                return await message.member.voice.channel.join();
            } catch (e) {
                console.log("Error: " + e)
            }
        } else {
            message.reply('Du musst in einem Channel sein');
        }
    }

    var disconnect = () => {
        if (message.guild.me.voice.channel !== undefined) {
            message.guild.me.voice.channel.leave();
            console.log("Disconnected")
        }
        else {
            message.reply("Ich bin in keinem Voicechannel");
        }
    }

    async function radioexecute(connection) {
        console.log("Radio start")
        var radio = "";
        let formattedradio = "\n";

        if (connection) {
            fs.readFile('radio-list.json', 'utf8', (err, data) => {
                if (err) {
                    console.error(err)
                    return
                }
                radio = JSON.parse(data);
                for (var key in radio) {
                    formattedradio += Number(key) + Number(1) + ": " + radio[key].name + "\n";
                }

                if (args[0] != undefined) {
                    try {
                        const broadcast = client.voice.createBroadcast();
                        broadcast.play(radio[args[0] - 1].link);

                        broadcast.on('subscribe', dispatcher => {
                            message.reply("Spielt Radio: " + radio[args[0] - 1].name);
                            console.log(`Broadcast playing in ${dispatcher.player.voiceConnection.channel.name}`);
                        });
                        connection.play(broadcast);
                    } catch (e) {
                        console.log("Error: " + e);
                        message.reply("Dieses Radio Existiert nicht!");
                        message.reply("Versuche mit !radio 1 oder wähle eins aus der liste: \n" + formattedradio);
                    }
                } else {
                    message.reply("Wähle ein Radio z.B !radio 1")
                    message.reply(formattedradio);
                }
            })
        }
    }

    switch (command) {
        case "nextsale":
            message.reply('Hier ist der Counter https://steamdb.info/sales/history/');
            break;
        case "steamsales":
            // STEAMSALES
            message.reply('Hier eine Liste aller aktuell reduzieren Spiele https://store.steampowered.com/specials?l=german ')
            break;
        case "help":
        case "hilfe":
            message.reply("Für dich ist jede Hilfe zu spät")
            message.reply("Versuche trotzdem mit:\n !nextsale \n !steamsales \n !join \n !leave oder !stop \n !radio")
            break;
        case "join":
            join();
            break;
        case "leave":
        case "stop":
            disconnect();
            break;
        case "radio":
            (async () => {
                radioexecute(await join())
            })()
            break;
        default:
            message.reply("Dieses Command gibt es nicht!")
    }


});
client.login(token);
