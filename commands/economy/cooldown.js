const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders')
const { MessageEmbed, MessageButton } = require('discord.js')

const { getEconProfile } = require('../../extras/econFunctions')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cooldown')
        .setDescription('See how much time is left on your cooldown(s).'),
    async execute(interaction) {

        const econProfile = await getEconProfile(interaction.user.id);
        const timeToWork = 20 * 60;
        const userCooldown = econProfile.workCooldown;
        const cooldownProgress = (userCooldown == 0) ? timeToWork + 1 : Math.abs((new Date().getTime() - userCooldown) / 1000);
        
        interaction.reply({
            embeds: [
                new MessageEmbed()
                .setColor('#3DBDFF')
                .setTitle(`${interaction.user.username}'s cooldowns`)
                .addField(`/Work`, (cooldownProgress > timeToWork) ? `✅ **Work** is ready`: `❌ **Work** in \`${formatTime(Math.ceil(timeToWork - cooldownProgress))}\``, true)
                .addField(`/Fish`, "*Fishing coming soon :)*", true)
            ]
        })
    }

}


const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds - (minutes * 60);

    return (minutes == 0) ? `${remainingSeconds} second(s).` : `${minutes} minute(s) and ${remainingSeconds} second(s).`
}