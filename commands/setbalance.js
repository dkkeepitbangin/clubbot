const { SlashCommandBuilder } = require('@discordjs/builders');
const db = require("../database");
const functions = require("../functions")
module.exports = {
	data: new SlashCommandBuilder()
	//set up slash command
		.setName('setbalance')
		.setDescription('Sets balance (keifun only)')
        .setDefaultPermission(true)
        .addUserOption(option => option.setName('user').setDescription('The user\'s balance to set').setRequired(true))
		.addNumberOption(option => option.setName('amount').setDescription('Enter the amount to set').setRequired(true)),
	async execute(interaction) {
		const user = interaction.options.getUser('user'); //get user argument
		const amount = functions.roundCents(interaction.options.getNumber('amount')); //get amount argument
		if (interaction.user.id !== "842033218873327666" && interaction.user.id !== "883722477585449000") return interaction.reply({content: "You don't have permissions to use this command", ephemeral: true}); //check if user has perms
		db.setBalance(user.id,amount); //set balance
		return interaction.reply(`${user.username} has been credited with ${amount}.`)
	
	},
};
