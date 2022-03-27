const { SlashCommandBuilder } = require('@discordjs/builders');
const functions = require("../functions");
const bot = require("../bot")
const db = require("../database")
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    //set up slash command
    data: new SlashCommandBuilder()
        .setName('bet')
        .setDescription('bet on a coin flip')
        .addNumberOption(option => option.setName('amount').setDescription('Enter the bet amount').setRequired(true))
        .addStringOption(option => option.setName("decision").setDescription('Either heads or tails').setRequired(true).addChoice('Heads', 'Heads').addChoice('Tails', 'Tails')), //this is awesome
    async execute(interaction) {//when /bet
        //set up arguments
        const bet = functions.roundCents(interaction.options.getNumber('amount'));// amoutbet
        let decision = interaction.options.getString('decision'); //Heads, tails


        if (!await db.signedUp(interaction.user.id)) { //if initiator is not signed up
            return interaction.reply(bot.constructError('You are not signed up (use /signup to signup)', interaction.user));
        } else {//if signed up
            const oldBalance = await db.getBalance(interaction.user.id);
            if (bet <= 0) {//if player bets a negative number
                return interaction.reply(bot.constructError(`Please bet a positive integer`, interaction.user));
            } else if (bet > oldBalance) { //if player does not have sufficient funds
                return interaction.reply(bot.constructError(`You have insufficient funds!`, interaction.user));
            } else {
                //create button
                const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('joinBtn')
                            .setLabel('Join')
                            .setStyle('PRIMARY'),
                    );
                //reply to initial interaction
                interaction.reply({ content: "Game starting...", ephemeral: true })
                //send message with embed and buttons
                const msg = await interaction.channel.send({
                    embeds: [{
                        color: "00c8b2",
                        author: {
                            name: `Coinflip`,
                            icon_url: interaction.user.avatarURL(),
                        },
                        description: `${interaction.user.username} has started a $${functions.addCommas(bet)} game! Join them now!`
                    }], components: [row] //buttons
                });

                const collector = msg.createMessageComponentCollector({ componentType: 'BUTTON', time: 1000 * 60 * 3, max:1 }); //create button collector that lasts 3 mins with max 1 use

                collector.on('collect', async i => { //run when button pressed
                    if (i.user.id === interaction.user.id) { //if user pressed is person initiating
                        return i.reply({content: `You cannot join your own game!`, ephemeral: true});
                    }

                    if (!await db.signedUp(i.user.id)) { //if 2nd person is not signed up
                        return i.reply(`Game failed: ${i.user.username} is not signed up`);
                    }
                    else {
                        const participantOldBalance = await db.getBalance(i.user.id); //participant's orginal balance
                        if (bet > participantOldBalance) { //if player does not have sufficient funds
                            return i.reply(`Game failed: ${i.user.username} does not have sufficient funds`);
                        } else {
                            const startGame = async () => { //function run after the 5 seconds
                                //convert heads/tails to boolean values
                                const roll = Math.random() > 0.5; //choose rng TRUE = HEADS, FALSE = TAILS
                                if (decision == 'Heads') choice = true //IF initiator wins
                                else { //if initiator loses
                                    choice = false
                                    if (decision === "Heads"){
                                        decision = 'Tails';
                                    } else {
                                        decision = 'Heads'; 
                                    }
                                }
                                //declare win amounts for Daniel and Winner
                                const winAmount = bet*0.9; 
                                const danAmount = bet*0.1;
                                if (roll == choice) { //if initiator wins
                                    await db.setBalance(interaction.user.id, oldBalance + winAmount); // add winnings to initiator balance 
                                    await db.setBalance(i.user.id, participantOldBalance - bet); // deduct losses to participant balance 
                                    await db.setBalance(process.env.DANID, await db.getBalance(process.env.DANID) + danAmount); //add winnings to daniel
                                    return msg.reply(bot.constructEmbed("#008000", `${interaction.user.username} guessed ${decision} correctly! They won $${functions.addCommas(bet)}!`, interaction.user));
                                } else { //if participant wins
                                    await db.setBalance(interaction.user.id, oldBalance - bet); // deduct losses from initiator balance
                                    await db.setBalance(i.user.id, participantOldBalance + winAmount); // add winnings to participant balance 
                                    await db.setBalance(process.env.DANID, await db.getBalance(process.env.DANID) + danAmount); //add winnings to daniel
                                    return msg.reply(bot.constructEmbed("#008000", `${i.user.username} guessed ${decision} correctly! They won $${functions.addCommas(bet)}!`, i.user))
                                }
                            }
                            i.reply(`${i.user.username} has joined the game. Starting in 5 seconds...`);
                            setTimeout(startGame, 5000) //wait 5 seconds and run startGame
                            
                        }

                    }
                });

                collector.on('end', collected => { //run when collector ends (button press or time run out)
                    if (collected.size === 0) { //if no one pressed
                        i.reply({content: "No one joined your game", ephemeral:true})
                    }
                });

            }
        }
    }
}