import { Client, Player } from '../Wrapper';
import Server from '../Server';
import * as config from './config.json';
import * as masterBlacklist from './masterBlacklist.json';
import * as gtaModel from './gtaModel.json';

import fs = require("fs");
import path = require('path');
import Discord = require('discord.js');
import logger = require('winston');
import cheerio = require('cheerio');
import moment = require('moment');
import axios from 'axios';
import { Vehicle } from '../Wrapper/structures/Vehicle';

process.on('unhandledRejection', console.error);

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console);
logger.level = 'debug';

const server = new Server(3000, path.resolve(__dirname, '../Server/Endpoints'));
server.on('error', (e: any) => console.error(`Error at ${new Date()}\n`, e));
server.on('disconnected', (e: any) => console.error('Disconnected!', e))
server.on('ready', () => {
    console.log('WebServer ready!')
    initializeClient();
});

function initializeClient(): void {
    // Make sure you enter the same SocialClub username as the Server is logged in
    const client = new Client(config.SC_NICKNAME, 3000);
    client.on('ready', () => {
        console.log('Ready!');
        initializeDiscordClient(client);
    });
    client.on('error', console.error);
}

function initializeDiscordClient(client: Client): void {
    const discordClient = new Discord.Client();

    class DiscordCommand {
        name: string;
        syntax: string;
        description: string;
        allowedRoles: string[];
    }

    discordClient.on('message', async function(message) {	
        if (message.content.substring(0, 1) == '.') {        
            var args: string[] = message.content.substring(1).split(' ');
            var cmd: DiscordCommand = config.COMMANDS.find(c => c.name === args[0].toLowerCase());
            var nsfwCmd: DiscordCommand = config.NSFW_COMMANDS.find(c => c.name === args[0].toLowerCase());
            args = args.splice(1);

            if (cmd !== undefined) {
                switch (cmd.name) {
                    case 'commands':
                        commands(message, cmd, args);
                        break;
                    case 'rid':
                        rid(message, cmd, args);
                        break;
                    case 'sc':
                        sc(message, cmd, args);
                        break;
                    case 'garage':
                        garage(message, cmd, args);
                        break;
                    case 'finances':
                        finances(message, cmd, args);
                        break;
                    case 'modder':
                        modder(message, cmd, args);
                        break;
                    case 'crime':
                        crime(message, cmd, args);
                        break;
                    case 'rename':
                        rename(message, cmd, args);
                        break;
                    case 'verify':
                        verify(message, cmd, args);
                        break;
                    case 'crew':
                        crew(message, cmd, args);
                        break;
                    case 'botmessage':
                        botmessage(message, cmd, args);
                        break;
                    case 'allow':
                        allow(message, cmd, args);
                        break;
                    case 'deny':
                        deny(message, cmd, args);
                        break;
                    case 'report':
                        report(message, cmd, args);
                        break;
                    case 'blacklist':
                        blacklist(message, cmd, args);
                        break;
                    case 'unblacklist':
                        unblacklist(message, cmd, args);
                        break;
                    case 'check':
                        check(message, cmd, args);
                        break;
                    case 'blistluna':
                        blistluna(message, cmd, args);
                        break;
                    case 'blistpara':
                        blistpara(message, cmd, args);
                        break;
                    case 'blistimp':
                        blistimp(message, cmd, args);
                        break;
                    case 'blistcherax':
                        blistcherax(message, cmd, args);
                        break;
                    case 'suggest':
                        suggest(message, cmd, args);
                        break;
                }
            }

            if (nsfwCmd !== undefined) {
                const nsfwChannel = discordClient.channels.cache.find(ch => (<Discord.TextChannel>ch).name.toLowerCase() === "nsfw");
                if (message.channel.id !== nsfwChannel.id) {
                    message.reply('This command can only be used in the nsfw channel.');
                } else {
                    switch (nsfwCmd.name) {
                        case 'boobs':
                            boobs(message, nsfwCmd, args);
                            break;
                        case 'ass':
                            ass(message, nsfwCmd, args);
                            break;
                        case 'rule34':
                            rule34(message, nsfwCmd, args);
                            break;
                    }
                }
            }
        }
    });

    function commands(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        const embed = new Discord.MessageEmbed()
        .setColor('#00ff00')
        .setAuthor(`${message.author.username} has requested a list of usable commands`, `${message.author.displayAvatarURL()}`)
        
        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            config.COMMANDS.forEach(command => {
                embed.addField(`.${command.name}`, `Syntax: \`${command.syntax}\`\nDescription: \`${command.description}\`\nAllowed Roles: \`${command.allowedRoles.join(', ')}\``, false);
            });
        } else {
            embed.setDescription(`<@${message.author.id}> does not have permission to do that`);
        }
        embed.setTimestamp();
        message.channel.send(embed);
    }

    async function rid(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        const embed = new Discord.MessageEmbed()
            .setColor('#00ff00')
            .setAuthor(`${message.author.username} requested an RID Lookup`, `${message.author.displayAvatarURL()}`)

        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {			
            if (args.length > 0) {					
                const player = await client.players.byName(args[0]).catch(() => null);
                if (!player) {
                    embed.setDescription(`Player \`${args[0]}\` does not appear to exist`);
                } else {
                    embed.setDescription(`<@${message.author.id}> requested an RID Lookup for \`${player.name}\``)
                        .addFields(
                            { name: 'SC Name', value: `\`${player.name}\``, inline: true },
                            { name: 'RID', value: `\`${player.id}\``, inline: true },
                        )
                    if (player.avatarURL) {
                        embed.setThumbnail(player.avatarURL);
                    }
                }
            } else {
                embed.setDescription(`<@${message.author.id}> you must provide a SC Username for Rockstar ID Lookup`);
            }
        } else {
            embed.setDescription(`<@${message.author.id}> does not have permission to do that`);				
        }
        embed.setTimestamp();
        message.channel.send(embed);
    }

    async function sc(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        const embed = new Discord.MessageEmbed()
            .setColor('#00ff00')
            .setAuthor(`${message.author.username} requested an SC Lookup`, `${message.author.displayAvatarURL()}`)

        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {			
            if (args.length > 0) {
                    const playerObj = await client.players.findById(+args[0]).catch(() => null);
                    if (!playerObj) {
                        embed.setDescription(`Rockstar ID \`${args[0]}\` does not exist or their profile is private`)
                    } else {
                        const player = await client.players.byName(playerObj.name, true).catch(() => null);
                        embed.setDescription(`<@${message.author.id}> requested an SC Lookup for \`${player.id}\``)
                            .addFields(
                                { name: 'RID', value: `\`${player.id}\``, inline: true },
                                { name: 'SC Name', value: `\`${player.name}\``, inline: true },
                            )
                        if (player.avatarURL) {
                            embed.setThumbnail(player.avatarURL);
                        }
                    }
                } else {
                    embed.setDescription(`<@${message.author.id}> you must provide a Rockstar ID for SC Lookup`);
                }
        } else {
            embed.setDescription(`<@${message.author.id}> does not have permission to do that`);				
        }
        embed.setTimestamp();
        message.channel.send(embed);
    }

    async function finances(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        const embed = new Discord.MessageEmbed()
            .setColor('#00ff00')
            .setAuthor(`${message.author.username} requested a Finances Report`, `${message.author.displayAvatarURL()}`)
        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            if (args.length > 0) {				
                const player = await client.players.byName(args[0]).catch(() => null);
                if (!player) {
                    embed.setDescription(`Player \`${args[0]}\` does not appear to exist`);
                } else {
                    var stats = await client.records.financialRecord(player.name).catch(() => 'That profile is private. That information cannot be accessed');
                    embed.setDescription(`<@${message.author.id}> requested a Finances Report for \`${player.name}\``)
                        .addField(`\`${player.name}\`'s Finances`, stats);
                }
            } else {
                embed.setDescription(`<@${message.author.id}> you must provide a SC Username for a Finances Report`);
            }
        } else {
            embed.setDescription(`<@${message.author.id}> does not have permission to do that`);				
        }
        embed.setTimestamp();
        message.channel.send(embed);
    }

    async function modder(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        const embed = new Discord.MessageEmbed()
            .setColor('#00ff00')
            .setAuthor(`${message.author.username} requested a Modder Likelihood Report`, `${message.author.displayAvatarURL()}`)
        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            if (args.length > 0) {
                    const player = await client.players.byName(args[0]).catch(() => null);
                    if (!player) {
                        embed.setDescription(`Player \`${args[0]}\` does not appear to exist`);
                    } else {
                        var stats = await client.records.modderRecord(player.name).catch(() => 'That profile is private. That information cannot be accessed');
                        embed.setDescription(`<@${message.author.id}> requested a Modder Likelihood Report for \`${player.name}\``)
                            .addField(`\`${player.name}\`'s Modder Likelihood`, stats);
                    }
            } else {
                embed.setDescription(`<@${message.author.id}> you must provide a SC Username for a Modder Likelihood Report`);
            }
        } else {
            embed.setDescription(`<@${message.author.id}> does not have permission to do that`);
        }
        embed.setTimestamp();
        message.channel.send(embed);
    }

    async function crime(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        const embed = new Discord.MessageEmbed()
            .setColor('#00ff00')
            .setAuthor(`${message.author.username} requested a Criminal Report`, `${message.author.displayAvatarURL()}`)
        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            if (args.length > 0) {
                    const player = await client.players.byName(args[0]).catch(() => null);
                    if (!player) {
                        embed.setDescription(`Player \`${args[0]}\` does not appear to exist`);
                    } else {
                        var stats = await client.records.criminalRecord(player.name).catch(() => 'That profile is private. That information cannot be accessed');
                        embed.setDescription(`<@${message.author.id}> requested a Criminal Report for \`${player.name}\``)
                            .addField(`\`${player.name}\`'s Criminal Report`, stats);
                    }
            } else {
                embed.setDescription(`<@${message.author.id}> you must provide a SC Username for a Criminal Report`);
            }
        } else {
            embed.setDescription(`<@${message.author.id}> does not have permission to do that`);
        }
        embed.setTimestamp();
        message.channel.send(embed);
    }

    async function garage(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        const embed = new Discord.MessageEmbed()
                    .setColor('#00ff00')
                    .setAuthor(`${message.author.username} requested Garage Lookup`, `${message.author.displayAvatarURL()}`)

        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            if (args.length > 0) {
                const player: Player = await client.players.byName(args[0]).catch(() => null);
                if (!player) {
                    embed.setDescription(`Player \`${args[0]}\` does not appear to exist`);
                } else {
                    if (player.profileHidden) {
                        embed.setDescription('That profile is private. That information cannot be accessed');
                    } else {
                        const vehicles = await client.records.garageRecord(player.name).catch(() => []);

                        if (vehicles.length === 0) {
                            embed.setDescription(`\`${player.name}\` does not appear to have any vehicles in their active garage`);
                        } else {
                            embed.setDescription(`<@${message.author.id}> requested a Garage Lookup for \`${player.name}\``);
                            vehicles.forEach((vehicle: Vehicle) => {
                                const primaryColor = gtaModel.colors.find(c => c.colorHex.toLowerCase() === vehicle.PrimaryColour.toLowerCase());
                                const secondaryColor = gtaModel.colors.find(c => c.colorHex.toLowerCase() === vehicle.SecondaryColour.toLowerCase());
                                const vehicleData = `Name: ${vehicle.Name}
                                Vehicle Archetype: ${vehicle.VehicleType}
                                Vehicle Type: ${vehicle.VehicleImage}
                                Primary Color: ${primaryColor != null ? primaryColor.colorName : vehicle.PrimaryColour + " (Couldn't find a match for that hex)"}
                                Secondary Color: ${secondaryColor != null ? secondaryColor.colorName : vehicle.SecondaryColour + " (Couldn't find a match for that hex)"}`;
                                embed.addField(`Vehicle ${vehicle.Index + 1}`, vehicleData, false);
                            });
                        }
                    }
                }
            } else {
                embed.setDescription(`<@${message.author.id}> you must provide a SC Username for Crew Lookup`);
            }
        } else {
            embed.setDescription(`<@${message.author.id}> does not have permission to do that`);
        }
        embed.setTimestamp();
        message.channel.send(embed);
    }

    function rename(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            const user = message.mentions.users.first();
            if (user) {
                // Now we get the member from the user
                const member = message.guild.member(user);
                // If the member is in the guild
                if (member) {
                    const currentName = user.tag;
                    const newName = args.slice(1).join(' ');
                    member
                    .setNickname(newName, `${message.member.user.username} renamed ${currentName} to ${newName}`)
                    .then(() => {
                        message.reply(`Renamed ${currentName} to ${newName}.`);
                    })
                    .catch(err => {
                        message.reply('I was unable to rename that member.');
                        // Log the error
                        console.error(err);
                    });
                } else {
                    message.reply("that user doesn't exist.");
                }
            } else {
            message.reply("you didn't mention the user to rename!");
            }
        } else {
            message.reply('you do not have permission to do that.');
        }
    }

    function verify(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            const user = message.mentions.users.first();
            if (user) {
                // Now we get the member from the user
                const member = message.guild.member(user);
                // If the member is in the guild
                if (member) {
                    var role = message.guild.roles.cache.find(role => role.name === "GTA V");
                    member
                    .roles.add(role)
                    .then(() => {
                        message.reply(`Verified ${user.tag}`);
                    })
                    .catch(err => {
                        message.reply('I was unable to verify that member.');
                        // Log the error
                        console.error(err);
                    });
                } else {
                    message.reply("that user doesn't exist.");
                }
            } else {
            message.reply("you didn't mention the user to verify!");
            }
        } else {
            message.reply('you do not have permission to do that.');
        }
    }

    async function crew(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        const embed = new Discord.MessageEmbed()
                    .setColor('#00ff00')
                    .setAuthor(`${message.author.username} requested Crew Lookup`, `${message.author.displayAvatarURL()}`)

        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            if (args.length > 0) {
                const player = await client.players.byName(args[0]).catch(() => null);
                if (!player) {
                    embed.setDescription(`Player \`${args[0]}\` does not appear to exist`);
                } else {
                    if (player.profileHidden) {
                        embed.setDescription('That profile is private. That information cannot be accessed');
                    } else if (player.crews.array().length === 0) {
                        embed.setDescription(`\`${player.name}\` does not appear to belong to a crew`);
                    } else {
                        embed.setDescription(`<@${message.author.id}> requested a Crew Lookup for \`${player.name}\``);
                        player.crews.array().forEach((crew: any) => {
                            embed.addFields(
                                { name: 'Crew Name', value: `\`${crew.name}\``, inline: true },
                                { name: 'Crew Tag', value: `\`${crew.tag}\``, inline: true },
                                { name: 'Member Count', value: `\`${crew.memberCount}\``, inline: true },
                            )
                        });
                    }
                }
            } else {
                embed.setDescription(`<@${message.author.id}> you must provide a SC Username for Crew Lookup`);
            }
        } else {
            embed.setDescription(`<@${message.author.id}> does not have permission to do that`);
        }
        embed.setTimestamp();
        message.channel.send(embed);
    }

    function botmessage(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            if (args.length > 1) {
                const messageText = args.slice(1).join(' ');
                const channel = discordClient.channels.cache.find(ch => (<Discord.TextChannel>ch).name === args[0].replace('#', ''));
                if (!channel) {
                    message.reply("unable to find channel specified");
                } else {
                    message.delete();
                    (<Discord.TextChannel>channel).send(messageText);
                }
            } else {
                message.reply(`you haven't given enough arguments, command syntax is \`${cmd.syntax}\``);
            }
        } else {
            message.reply('you do not have permission to do that');
        }
    }

    function allow(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            if (args.length > 1) {
                const commandToUpdate = config.COMMANDS.find(c => c.name === args[0].toLowerCase());
                if (commandToUpdate) {
                    const roleToAdd = args[1].toLowerCase();
                    var index = commandToUpdate.allowedRoles.indexOf(roleToAdd);
                    if (index !== -1) {
                        message.reply(`role ${args[1]} already has permission to the ${args[0]} command`);
                    } else {
                        commandToUpdate.allowedRoles.push(roleToAdd.toLowerCase());
                        fs.writeFile(path.join(__dirname, 'config.json'), JSON.stringify(config, null, 2), () => {
                            message.reply(`role ${args[1]} now has access to the ${args[0]} command`);
                        });
                    }
                } else {
                    message.reply(`command ${args[0]} not found`);
                }					
            } else {
                message.reply(`you haven't given enough arguments, command syntax is \`${cmd.syntax}\``);
            }
        } else {
            message.reply('you do not have permission to do that');
        }
    }

    function deny(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            if (args.length > 1) {
                const commandToUpdate = config.COMMANDS.find(c => c.name === args[0].toLowerCase());
                if (commandToUpdate) {
                    const roleToRemove = args[1].toLowerCase();
                    var index = commandToUpdate.allowedRoles.indexOf(roleToRemove);
                    if (index === -1) {
                        message.reply(`role ${args[1]} does not currently have permission to the ${args[0]} command`);
                    } else {
                        commandToUpdate.allowedRoles.splice(index, 1);
                        fs.writeFile(path.join(__dirname, 'config.json'), JSON.stringify(config, null, 2), () => {
                            message.reply(`role ${args[1]} no longer has access to the ${args[0]} command`);
                        });
                    }
                } else {
                    message.reply(`command ${args[0]} not found`);
                }					
            } else {
                message.reply(`you haven't given enough arguments, command syntax is \`${cmd.syntax}\``);
            }
        } else {
            message.reply('you do not have permission to do that');
        }
    }

    async function report(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            if (args.length > 1) {
                const channel = discordClient.channels.cache.find(ch => (<Discord.TextChannel>ch).name === 'blacklist-reports');
                if (!channel) {
                    message.reply("unable to find blacklist-reports channel");
                } else {
                    const player = await client.players.byName(args[0]).catch(() => null);
                    if (!player) {
                        message.reply(`Player \`${args[0]}\` does not appear to exist`);
                    } else {
                        const crew = player.getPrimaryCrew();
                        const currentDate = new Date();
                        const messageText = `**Submission from ${message.author.username} on ${currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}**\n`
                        + `\`sc:\` ${args[0]}\n\`tag:\` ${crew != null ? crew.tag : "none"}\n\`rid:\` ${player.id}\n\`reason:\` ${args.slice(1).join(' ')}`;
                        (<Discord.TextChannel>channel).send(messageText);
                    }
                }
            } else {
                message.reply(`you haven't given enough arguments, command syntax is \`${cmd.syntax}\``);
            }
        } else {
            message.reply('you do not have permission to do that');
        }
    }

    async function blacklist(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            if (args.length > 1) {
                if (!masterBlacklist.some((user) => user.sc.toLowerCase() === args[0].toLowerCase())) {
                    const channel = discordClient.channels.cache.find(ch => (<Discord.TextChannel>ch).name === 'blacklist');
                    if (!channel) {
                        message.reply("unable to find blacklist channel");
                    } else {
                        const player = await client.players.byName(args[0]).catch(() => null);
                        if (!player) {
                            message.reply(`Player \`${args[0]}\` does not appear to exist`);
                        } else {
                            const crew = player.getPrimaryCrew();
                            const currentDate = new Date();
                            const messageText = `**Submission from ${currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}**\n`
                            + `\`sc:\` ${args[0]}\n\`tag:\` ${crew != null ? crew.tag : "none"}\n\`rid:\` ${player.id}\n\`reason:\` ${args.slice(1).join(' ')}`;
                            
                            masterBlacklist.push({
                                "date": new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000))
                                            .toISOString()
                                            .split("T")[0],
                                "sc": args[0],
                                "tag": crew != null ? crew.tag : "none",
                                "rid": player.id.toString(),
                                "reason": args.slice(1).join(' ')
                            });
                            
                            fs.writeFile(path.join(__dirname, 'masterBlacklist.json'), JSON.stringify(masterBlacklist, null, 2), () => {
                                (<Discord.TextChannel>channel).send(messageText);
                            });
                        }
                    }
                } else {
                    message.reply(`Player \`${args[0]}\` is already on the blacklist`);
                }
            } else {
                message.reply(`you haven't given enough arguments, command syntax is \`${cmd.syntax}\``);
            }
        } else {
            message.reply('you do not have permission to do that');
        }
    }

    function unblacklist(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            if (args.length > 0) {
                if (!masterBlacklist.some((user) => user.sc.toLowerCase() === args[0].toLowerCase())) {
                    message.reply(`Player \`${args[0]}\` is not currently on the blacklist`);
                } else {
                    const filteredBlacklist = masterBlacklist.filter((user) => user.sc.toLowerCase() !== args[0].toLowerCase());
                    
                    fs.writeFile(path.join(__dirname, 'masterBlacklist.json'), JSON.stringify(filteredBlacklist, null, 2), () => {
                        message.reply(`Player \`${args[0]}\` has been removed from the blacklist`);
                    });
                }
            } else {
                message.reply(`you haven't given enough arguments, command syntax is \`${cmd.syntax}\``)
            }
        } else {
            message.reply('you do not have permission to do that');
        }
    }

    async function check(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        const embed = new Discord.MessageEmbed()
                    .setColor('#00ff00')
                    .setAuthor(`${message.author.username} requested Blacklist Check`, `${message.author.displayAvatarURL()}`)

        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            if (args.length > 0) {
                embed.setDescription(`<@${message.author.id}> requested a Blacklist Check for \`${args[0]}\``);
                if (masterBlacklist.some(user => user.sc.toLowerCase() === args[0].toLowerCase())) {
                    const blacklistEntry = masterBlacklist.filter(entry => entry.sc.toLowerCase() === args[0].toLowerCase())[0];
                    embed.addFields(
                        { name: 'Blacklist Status', value: `:red_circle:Player \`${blacklistEntry.sc}\` is currently on the blacklist:red_circle:`, inline: true },
                        { name: 'Blacklist Reason', value: `\`${blacklistEntry.reason}\``, inline: true },
                        { name: 'Blacklist Date', value: `\`${blacklistEntry.date}\``, inline: true },
                    )
                } else {
                    embed.addField('Blacklist Status', `Player \`${args[0]}\` is not on the blacklist`, true);
                }
                const player = await client.players.byName(args[0]).catch(() => null);
                if (!player) {
                    embed.addField('RID', `Player \`${args[0]}\` does not appear to exist`, true);
                } else {
                    embed.addField('RID', `\`${player.id}\``, true)
                    if (player.avatarURL) {
                        embed.setThumbnail(player.avatarURL);
                    }
                }
            } else {
                embed.setDescription(`<@${message.author.id}>you haven't given enough arguments, command syntax is \`${cmd.syntax}\``);
            }
        } else {
            message.reply(`<@${message.author.id}> does not have permission to do that`);
        }
        embed.setTimestamp();
        message.channel.send(embed);
    }

    function blistluna(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            var lunaBlacklistFormat: any = {};
            masterBlacklist.forEach((user) => {
                lunaBlacklistFormat[user.rid] = [`${user.sc}`];
            });

            fs.writeFile(path.join(__dirname, 'blacklists', 'luna', 'blacklist.json'), JSON.stringify(lunaBlacklistFormat, null, 4), () => {
                message.channel.send("Luna Blacklist", { files: [path.join(__dirname, 'blacklists', 'luna', 'blacklist.json')] });
            });
        } else {
            message.reply('you do not have permission to do that');
        }
    }

    function blistpara(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            var paraBlacklistFormat: any = {};
            masterBlacklist.forEach((user) => {
                var dateAdded = moment(user.date);
                paraBlacklistFormat[user.rid] = {
                    "Action": 7,
                    "Added On": dateAdded.format('dddd DD/MM/YYYY hh:mm:ss'),
                    "Last Seen": dateAdded.format('dddd DD/MM/YYYY hh:mm:ss'),
                    "Name": user.sc,
                    "Reason": user.reason
                };
            });
            
            fs.writeFile(path.join(__dirname, 'blacklists', 'paragon', 'Players.json'), JSON.stringify(paraBlacklistFormat, null, 4), () => {
                message.channel.send("Paragon Blacklist", { files: [path.join(__dirname, 'blacklists', 'paragon', 'Players.json')] });
            });
        } else {
            message.reply('you do not have permission to do that');
        }
    }

    function blistimp(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            var impulseBlacklistFormat: object[] = [];
            masterBlacklist.forEach((user) => {
                impulseBlacklistFormat.push([
                    user.sc,
                    1,
                    0,
                    0,
                    0,
                    0,
                    0,
                    `R*ID: ${user.rid}`
                ]);
            });
            
            fs.writeFile(path.join(__dirname, 'blacklists', 'impulse', 'overseerconfig.json'), JSON.stringify(impulseBlacklistFormat, null, 4), () => {
                message.channel.send("Impulse Blacklist", { files: [path.join(__dirname, 'blacklists', 'impulse', 'overseerconfig.json')] });
            });
        } else {
            message.reply('you do not have permission to do that');
        }
    }

    function blistcherax(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            var cheraxBlacklistFormat: string = "";
            masterBlacklist.forEach((user) => {
                cheraxBlacklistFormat += `${Math.round(new Date().getTime() / 1000)}##${user.sc}##${user.rid}##0.0.0.0\r\n`;
            });
            
            fs.writeFile(path.join(__dirname, 'blacklists', 'cherax', 'Saved Players.txt'), cheraxBlacklistFormat, () => {
                message.channel.send("Cherax Blacklist", { files: [path.join(__dirname, 'blacklists', 'cherax', 'Saved Players.txt')] });
            });
        } else {
            message.reply('you do not have permission to do that');
        }
    }

    async function suggest(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
            const embed = new Discord.MessageEmbed()
            .setColor('#00ff00')
            .setAuthor(`${message.author.username} has submitted a suggestion for the server`, `${message.author.displayAvatarURL()}`);
            if (cmd.allowedRoles.includes('everyone') || message.member.roles.cache.some(role => cmd.allowedRoles.includes(role.name.toLowerCase()))) {
                if (args.length > 0) {
                    const channel = discordClient.channels.cache.find(ch => (<Discord.TextChannel>ch).name === 'suggestions');
                    if (!channel) {
                        embed.setDescription('Unable to find suggestions channel');
                        message.channel.send(embed);
                    } else {
                        embed.addField('Server Suggestion:', args.join(' '), false);
                        embed.setTimestamp();
                        (<Discord.TextChannel>channel).send(embed).then((embed) => {
                            embed.react('✅')
                                .then(() => embed.react('❌'));
                        });
                    }
                } else {
                    embed.setDescription(`<@${message.author.id}> you must provide text for your suggestion`);
                    message.channel.send(embed);
                }
            } else {
                embed.setDescription(`<@${message.author.id}> does not have permission to do that`);
                message.channel.send(embed);
            }
        }
    }

    async function boobs(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        let randomIndex = Math.floor(Math.random() * 15338) + 1;
        console.log(randomIndex);
        axios.get(`http://api.oboobs.ru/boobs/${randomIndex}`).then((response) => {
            console.log(response.data[0].preview);
            const channel = discordClient.channels.cache.get(message.channel.id);
            (<Discord.TextChannel>channel).send("", {files: [`http://media.oboobs.ru/${response.data[0].preview}`]});
        });
    }

    async function ass(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        let randomIndex = Math.floor(Math.random() * 8080) + 1;
        console.log(randomIndex);
        axios.get(`http://api.obutts.ru/butts/${randomIndex}`).then((response) => {
            console.log(response.data[0].preview);
            const channel = discordClient.channels.cache.get(message.channel.id);
            (<Discord.TextChannel>channel).send("", {files: [`http://media.obutts.ru/${response.data[0].preview}`]});
        });
    }

    async function rule34(message: Discord.Message, cmd: DiscordCommand, args: string[]) {
        axios.get('http://rule34.xxx/index.php?page=post&s=random').then((response) => {
            const $ = cheerio.load(response.data);
            const channel = discordClient.channels.cache.get(message.channel.id);
            (<Discord.TextChannel>channel).send("", {files: [$("#image")[0].attribs["src"]]});
        });
    }

    discordClient.login(config.BOT_TOKEN);
}