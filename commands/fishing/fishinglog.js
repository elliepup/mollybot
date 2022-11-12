const { SlashCommandBuilder } = require('@discordjs/builders');
const { User } = require('../../models/User');
const FishingData  = require('../../models/FishingProfile');
const { rarityInfo } = require('../../models/Fish');
const { MessageEmbed, MessageButton } = require('discord.js');
const paginationEmbed = require('discordjs-button-pagination')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fishinglog')
        .setDescription('Displays the fishing log of the target.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The person whose fishing log you want to see.')),
    async execute(interaction) {

        const target = interaction.options.getUser("target") || interaction.user;
        const targetUser = await User.findOne({ userId: target.id }) || await User.create({ userId: target.id });
        const userFishing = await FishingData.findOne({ user: targetUser }) || await FishingData.create({ user: targetUser });
        const fish = require('../../data/fishdata.js').filter(fish => fish.form != 'Loot');
        const fishingLog = userFishing.fishingLog;

        const fishCaught = fish.filter(fish => fishingLog.find(log => log.fishNo == fish.fishNo));
        
        const fishToDisplay = [];

        for(let i = 0; i < fish.length; i++){
            if(fishingLog.find(log => log.fishNo == fish[i].fishNo)){
                fishToDisplay.push({name: fish[i].name, rarity: fish[i].rarity, time: fish[i].time, location: fish[i].type});
            } else {
                fishToDisplay.push({name: '???'});
            }
        
        }     
        const pages = [];
        const buttons = [];
        const timeout = '60000';
        const maxItemsPerPage = 10;

        if(!userFishing.fishingLog) return interaction.reply({
            content: "This user has no fishing log data.",
            ephemeral: true,
        })

        const findFish = fish.filter(fish => fishingLog.find(log => log.fishNo == fish.fishNo));
        const chunks = sliceIntoChunks(fishToDisplay, maxItemsPerPage);
        for (let i = 0; i < Math.ceil(fishToDisplay.length / maxItemsPerPage); i++) {
            const embed = new MessageEmbed()
                .setColor('#03fc84')
                .setTitle(`${target.username}'s Fishing Log`)
                .addField(`${userFishing.fishingLog.length}/${fish.length}`, chunks[i].map((k, index) => `**#${i * maxItemsPerPage + index + 1}:** ` + 
                `${(k.name != '???') ? `\`${rarityInfo.find(obj => obj.rarity === k.rarity).stars}\` · \`${k.name}\` · \`${k.time}\` · \`${k.location}\``
            : `\`???\` · \`???\` · \`???\` · \`???\``}`).join(`\n`))
            pages.push(embed)
        }

        const leftButton = new MessageButton()
            .setCustomId('previousbtn')
            .setLabel('◀')
            .setStyle('SECONDARY');
        const rightButton = new MessageButton()
            .setCustomId('nextbtn')
            .setLabel('▶')
            .setStyle('SECONDARY');
        buttons.push(leftButton, rightButton)

        paginationEmbed(interaction, pages, buttons, timeout)



    }
}

function sliceIntoChunks(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}