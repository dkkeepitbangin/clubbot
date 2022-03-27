const { SlashCommandBuilder } = require('@discordjs/builders');
const functions = require("../functions");
const bot = require("../bot")
const db = require("../database")
module.exports = {
  //set up slash command
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription("Shows a leaderboard of people's balances"),
	async execute(interaction) {
        const data = await db.getAll()//get all users on DB
        const unsortedTable = new Map() //create a table
        let leaderboardString =""; //declare leaderboard string
          for (const row in data){ //for each user in DB
            if (!await interaction.guild.members.fetch(data[row].discordid)) continue //if user is in server
            unsortedTable.set(data[row].username,data[row].value)
        }
        const sortedTable = new Map([...unsortedTable.entries()].sort((a, b) => b[1] - a[1])); //sort the table in ascending order
        sortedTable.forEach((value, username) => { 
            leaderboardString = leaderboardString + `${username}: ${functions.addCommas(value)}\n`
          });
          //send embed
        return interaction.reply({
          embeds: [{
            color: "00c8b2",
            author: {
              name:  `Leaderboard`,
              icon_url: 'https://github.com/keitannunes/clubbot/blob/master/views/leaderboard.png?raw=true',
            },
            description: leaderboardString
          }]
        })
	},
};