/*
RUN THIS WHEN JOINING A NEW SERVER OR UPDATING SLASH COMMANDS
*/
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { domainToASCII } = require('url');
require('dotenv').config();

const commands = []; //commands array that we gonna push files into
const commandFiles = fs.readdirSync('./commands')

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	console.log(command.data.name)
	commands.push(command.data.toJSON());
}
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
    rest.put(Routes.applicationGuildCommands(process.env.CLIENTID, "PUT ID HERE"), { body: commands }) //replace the ID with the server ID
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

	


