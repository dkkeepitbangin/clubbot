const fs = require("fs");
const { Client, Collection, Intents, MessageActionRow, MessageButton, MessageEmbed } = require('discord.js'); //stole from stackoverflow can't use const discord = require("discord.js"); anymore :(
const client = new Client({ intents: [Intents.FLAGS.GUILDS],fetchAllMembers: true, }); //??????????!?!?! what are intents please help me
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

//get commands and put them in a collection
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
client.commands = new Collection();

const error1 = setTimeout(function () {
	console.log("\x1b[41m", "ERROR: UNABLE TO CONNECT TO DISCORD SERVER");
}, 10000);


//functions that are used in other places
function getGuild(id){
	return client.guilds.get(id)
}

function constructEmbed(colour, content, user) { //creates embed
	return ({
		embeds: [{
			color: colour,
			author: {
				name: user.username,
				icon_url: user.avatarURL(),
			},
			description: content
		}]
	})
}

function constructError(content, user) { //creates ephemeral error embed
	return ({
		embeds: [{
			color: "#db3e00",
			author: {
				name: user.username,
				icon_url: user.avatarURL(),
			},
			description: content
		}]
		, ephemeral: true
	})
}

function constructButtons(primaryText, secondaryText) { //self explanitory 
	return new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId(primaryText)
				.setLabel(primaryText)
				.setStyle('PRIMARY'),
			new MessageButton()
				.setCustomId(secondaryText)
				.setLabel(secondaryText)
				.setStyle('SECONDARY'),
		);
}


function start() { //on start sets user activity to whatever is in views/game.txt
	console.clear()
	console.log("Loading... Please wait");
	client.on("ready", () => {
		clearTimeout(error1);
		console.log(`Logged into ${client.guilds.cache.size} guilds`)
		console.log("");
		console.log("Log:");
		console.log("");
		client.user.setActivity(fs.readFileSync("views/game.txt", "utf8")); 
		profilePicture = client.user.avatarURL()
	});
	for (const file of commandFiles) { //initialize commands
		const command = require(`./commands/${file}`);
		client.commands.set(command.data.name, command);
	}

	client.on('interactionCreate', async interaction => { //run on interaction
		//if interaction was a command
		if (interaction.isCommand()) {
			const command = client.commands.get(interaction.commandName);
			if (!command) return;

			try {
				await command.execute(interaction); //run command
			} catch (error) {
				console.error(error);
				return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
		//buttons
	});
	client.login(process.env.DISCORD_TOKEN);
}
 
module.exports = { getGuild, constructEmbed, constructError, constructButtons, start };
