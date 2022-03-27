const { SlashCommandBuilder } = require('@discordjs/builders');
const { createClient } = require("@supabase/supabase-js");
const functions = require("../functions");
const bot = require("../bot")
const db = require ("../database")
module.exports = {
    //set up slash command
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Get the balance of the selected user, or your own balance.')
        .addUserOption(option => option.setName('user').setDescription('The user\'s balance to show')),
    async execute(interaction) { //run when /balance
        const user = interaction.options.getUser('user'); //get user argument
        if (user) { //if user argument exsists
            if (await db.signedUp(user.id)) { //if user is signed up
                    return interaction.reply(bot.constructEmbed("#00c8b2",`${user.username}'s bank balance is: $${functions.addCommas(functions.roundCents(await db.getBalance(user.id)).toFixed(2))}`, user))
            } else {
                return interaction.reply("This user has not signed up yet")
            }
        } else {
            if (await db.signedUp(interaction.user.id)) {//if user exsists
                return interaction.reply(bot.constructEmbed("#00c8b2",`Your bank balance is: $${functions.addCommas(functions.roundCents(await db.getBalance(interaction.user.id)).toFixed(2))}`, interaction.user))
            } else {
                return interaction.reply(bot.constructError('You are not signed up (use ,signup to signup)', interaction.user))
            }
        }

    },
};
