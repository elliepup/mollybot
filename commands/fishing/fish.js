const { SlashCommandBuilder, EmbedBuilder, blockQuote, codeBlock, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const LootTable = require('loot-table');
const wait = require('node:timers/promises').setTimeout;
const { getTieredCoins } = require('../../functions/data/economy.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fish')
    .setDescription('The sea is a dangerous place. Use this command to fish.')
    .addStringOption(option =>
      option.setName('location')
        .setDescription('If you want to choose a specific location, use this option.')
        .setRequired(false)
        .setAutocomplete(true)),
  autocompleteOptions: ['sea', 'river']
  ,
  async execute(interaction) {

    let splitBaitString = function(bait){
        return bait.split('_')[0];
    }

    let fishBit = false;
    let failed = false;
    let hooked = false;
    let randomFish;

    const userId = interaction.user.id;

    //get user's fishing profile
    let { data } = await interaction.client.supabase
      .rpc('get_fishing_profile', {
        user_id_in: userId
      })

    //if no bait
    if (data.tier1_bait === 0 && data.tier2_bait === 0 && data.tier3_bait === 0 && data.tier4_bait === 0 && data.tier5_bait === 0) {
      return interaction.reply({
        content: `You don't have any bait!`,
        ephemeral: true
      })
    }

    const fishingCooldown = 0 * 60 * 1000; //5 minutes
    //convert last_fished from string to ms
    let lastFished = data.last_fished;
    //check if able to fish
    const { ableToFish, timeLeft } = checkIfAbleToFish(data.last_fished, fishingCooldown);

    if (!ableToFish) {
      const timeComponents = timeLeft.split(':');
      const minutes = parseInt(timeComponents[0]);
      const seconds = parseInt(timeComponents[1]);
      const formattedTimeLeft = `${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}`;    
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle('You are too tired to fish!')
            .setDescription(`You need to wait \`${formattedTimeLeft}\` before you can fish again.`)
            .addFields(
              { 
                name: "Last fished", 
                value: `<t:${Math.floor(new Date(lastFished).getTime() / 1000)}:T>`, 
                inline: true 
              },
              { 
                name: "Cooldown", 
                value: `<t:${Math.floor((new Date(lastFished).getTime() + fishingCooldown) / 1000)}:T>`, 
                inline: true 
              })     
        ]
      })
    }

    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username} has started fishing!`)
      .setColor("#82E4FF")
      .setDescription(blockQuote(`Please select the type of bait that you would like to use.`))
      .setFooter({ text: `This feature is currently in early access. Bugs are to be expected.` })

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('fishing_bait')
      .setPlaceholder('Select a bait')

    //for each bait type that the user has, add a select option
    for (const [i, bait] of Object.entries(data)) {
      if (i.startsWith('tier') && bait > 0) {
        const tier = i.slice(4);
        selectMenu.addOptions({
          label: `Tier ${splitBaitString(tier)} Bait`,
          value: tier,
          description: `x${bait}`,
          emoji: '🐟',
        });
      }
    }    

    const row = new ActionRowBuilder()
      .addComponents(selectMenu)

    const msg = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    })

    //create collector
    const filter = i => i.user.id === interaction.user.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 120000 });

    let baitChoice = null;

    collector.on('collect', async i => {

      const cancelButton = new ButtonBuilder()
        .setCustomId('cancel_fishing')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('✖')
      const confirmButton = new ButtonBuilder()
        .setCustomId('confirm_fishing')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✔')
      const hookButton = new ButtonBuilder()
        .setCustomId('hook')
        .setLabel('Hook')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🎣')
      const row = new ActionRowBuilder()
      //if user selects a bait
      if (i.isStringSelectMenu()) {
        baitChoice = i.values[0];
        row.addComponents(cancelButton, confirmButton)
        //update embed
        embed.setDescription(`Are you sure you want to use **Tier ${splitBaitString(i.values[0])} bait**?\n${blockQuote(`Please note that after clicking confirm, ` +
          ` you will be placed into the fishing minigame. There will be a **Hook Fish** button that you must click to catch the fish when ` +
          `it bites. Don't click too early or you'll scare it away!`)}`)

        await i.update({
          embeds: [embed],
          components: [row]
        })
      } else {
        if (i.customId === 'cancel_fishing') {
          embed
            .setColor('#3F3F3F')
            .setDescription(`${interaction.user.username} has decided not to fish.`)
          row.setComponents(cancelButton, confirmButton)
          row.components.forEach((button) => button.setDisabled(true));

          collector.stop();
          return await i.update({
            embeds: [embed],
            components: [row]
          })

        }
        if (i.customId === 'confirm_fishing') {
          //make sure not on cooldown

          //refresh fishing profile
          data = await interaction.client.supabase
            .rpc('get_fishing_profile', {
              user_id_in: userId
            })

          const updatedFishingProfile = data.data;
          const { ableToFish, timeLeft } = checkIfAbleToFish(updatedFishingProfile.last_fished, fishingCooldown);

          if (!ableToFish) {

            //update embed
            embed
              .setColor('#3F3F3F')
              .setDescription(`You can't fish yet. You need to wait ${timeLeft} more seconds.`)
            row.setComponents(cancelButton, confirmButton)
            row.components.forEach((button) => button.setDisabled(true));

            collector.stop();
            return await i.update({
              embeds: [embed],
              components: [row]
            })

          }

          //confirm user has bait
          if (updatedFishingProfile[`tier${baitChoice}_bait`] === 0) {
            //update embed
            embed
              .setColor('#3F3F3F')
              .setDescription(`You can't fish with that bait! You don't have any tier ${baitChoice} bait. You ought to go buy some more, boy!`)
            row.setComponents(cancelButton, confirmButton)
            row.components.forEach((button) => button.setDisabled(true));

            collector.stop();
            return await i.update({
              embeds: [embed],
              components: [row]
            })

          }

          //generate random fish
          data = await interaction.client.supabase
            .rpc('get_available_fish')
          let fish = data.data;

          const lootTable = new LootTable();

          const lootInfo = [
            { rarity: 'Common', tableTotal: 400, amount: fish.filter(x => x.rarity == 'Common').length }, { rarity: 'Uncommon', tableTotal: 275, amount: fish.filter(x => x.rarity == 'Uncommon').length },
            { rarity: 'Rare', tableTotal: 150, amount: fish.filter(x => x.rarity == 'Rare').length }, { rarity: 'Epic', tableTotal: 80, amount: fish.filter(x => x.rarity == 'Epic').length },
            { rarity: 'Legendary', tableTotal: 25, amount: fish.filter(x => x.rarity == 'Legendary').length }, { rarity: 'Mythical', tableTotal: 2, amount: fish.filter(x => x.rarity == 'Mythical').length },
          ]

          switch (splitBaitString(baitChoice)) {
            case '5':
              fish = fish.filter(x => { return x.rarity != 'Epic' })
            case '4':
              fish = fish.filter(x => { return x.rarity != 'Rare' })
            case '3':
              fish = fish.filter(x => { return x.rarity != 'Uncommon' })
            case '2':
              fish = fish.filter(x => { return x.rarity != 'Common' })
          }

          // filter by location
          let location = interaction.options.getString('location');
          if(location){
            let tempLocation = location == 'sea' ? 'Saltwater' : 'Freshwater';
            fish = fish.filter(x => { return x.location != tempLocation })
          }      
          console.log(`location: ${location}`)

          // filter by time of day
          const dayMap = {
            'Morning': [5, 11],
            'Afternoon': [12, 17],
            'Evening': [18, 21],
            'Night': [22, 4]
          };
          
          const currentHour = new Date().getHours();
          
          let timeOfDay = Object.keys(dayMap).find(period => {
            const [start, end] = dayMap[period];
            if (currentHour >= start && currentHour <= end) {
              return true;
            }
            // Special condition for night period where end is smaller than start
            if (start > end && (currentHour >= start || currentHour <= end)) {
              return true;
            }
            return false;
          });

          //filter fish by time of day or if the fish is available all day
          fish = fish.filter(x => { return x.time_available == timeOfDay || x.time_available == 'All' })

          for (let i = 0; i < fish.length; i++) {
            for (let j = 0; j < lootInfo.length; j++) {
              if (fish[i].rarity == lootInfo[j].rarity) {
                lootTable.add(fish[i], lootInfo[j].tableTotal / lootInfo[j].amount)
              }
            }
          }

          randomFish = lootTable.choose();

          if (!randomFish) {
            failed = true;
            embed
              .setColor('#FC0000')
              .setDescription(blockQuote(`There doesn't appear to be much activity in the water. You decide to call it a day.`))
              .setFooter({ text: 'You can fish again in 5 minutes.' })
            row.setComponents(hookButton.setDisabled(true))
            collector.stop();
            return await i.update({
              embeds: [embed],
              components: [row]
            })
          }

          //update fishing profile
          data = await interaction.client.supabase
            .rpc('set_last_fished', {
              user_id_in: userId,
              time_in: new Date().toISOString()
            })

          //update bait
          await interaction.client.supabase
            .rpc(`increment_tier${splitBaitString(baitChoice)}_bait`, {
              amount_in: -1,
              user_id_in: userId
            })

          row.setComponents(hookButton)
          embed
            .setDescription(blockQuote(`You cast your line and begin fishing. Please wait for a fish to bite.` +
              ` When a fish bites, click the **Hook Fish** button to catch it! Don't click too early or you'll scare it away!`))
            .setColor('#d9d9d9')

          await i.update({
            embeds: [embed],
            components: [row]
          })

          //wait for 5 to 15 seconds
          const randomTime = 0 * Math.floor(Math.random() * 10000) + 5000;
          await wait(randomTime);
          if (failed) return;

          await interaction.editReply({
            embeds: [
              embed
                .setColor(`FFFA05`)
                .setDescription(blockQuote(`**A fish bit the line!** Quickly, click the **Hook** button to catch it before it gets away!`))
            ], components: [row]
          })

          fishBit = true;
          const baseTime = 15000 + (Math.floor(Math.random() * 100) + 800);
          const modifableTime = Math.floor(Math.random() * 200) + 500;
          const fishDifficultyFactor = 1 - (randomFish.difficulty / 20);

          const timeToHook = Math.floor(baseTime + (modifableTime * fishDifficultyFactor));

          await wait(timeToHook);
          fishBit = false;
          collector.stop();
          row.setComponents(hookButton.setDisabled(true));
          if (!hooked) {
            await interaction.editReply({
              embeds: [
                embed
                  .setColor(`#FC0000`)
                  .setDescription(blockQuote(`The fish got away! It has stolen the bait! A pity, but you can fish again in 5 minutes.`))
              ], components: [row]
            })
          }
        }
      }


      if (i.customId === 'hook') {
        row.setComponents(hookButton.setDisabled(true));
        collector.stop();
        if (!fishBit) {
          failed = true;
          return await i.update({
            embeds: [
              embed
                .setColor(`#FC0000`)
                .setDescription(blockQuote(`You scared the fish away, but that didn't stop it from stealing the bait! A pity, but you can fish again in 5 minutes.`))
            ], components: [row]
          })
        }

        if (fishBit) {
          hooked = true;
          row.setComponents(hookButton.setDisabled(true))

          const shinyRate = 1 / 4096;
          let shiny = Math.random() < shinyRate;
          let vMult = shiny ? 100 : 1;

          const length = randomFish.fish_length - randomFish.length_variance + (Math.floor(Math.random() * randomFish.length_variance * 2 + 1))
          const weight = (randomFish.fish_weight * (length / randomFish.fish_length)).toFixed(1)
          const value = Math.floor((weight / randomFish.fish_weight) * randomFish.value * vMult)

          const rarityInfo = [
            { rarity: "Common", hex: "#919191", stars: "☆☆☆☆☆" }, { rarity: "Uncommon", hex: "#FFFFFF", stars: "★☆☆☆☆" }, { rarity: "Rare", hex: "#82FDFF", stars: "★★☆☆☆" },
            { rarity: "Epic", hex: "#6B00FD", stars: "★★★☆☆" }, { rarity: "Legendary", hex: "#FBFF00", stars: "★★★★☆" }, { rarity: "Mythical", hex: "#FF00E0", stars: "★★★★★" },
            { rarity: "Event", hex: "#03FC90", stars: "<a:CongratsWinnerConfetti:993186391628468244>" }
          ]

          const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
          let uniqueId = "";
          const lengthOfId = 6;
            

            do {
                uniqueId = "";
                for (let i = 0; i < lengthOfId; i++) {
                    uniqueId += characters.charAt(Math.floor(Math.random() * characters.length));
                }
            } while (await interaction.client.supabase.from('fish').select().eq('identifier', uniqueId).single().then(x => x.data))
              
            data = await interaction.client.supabase
                .rpc('upsert_fish', {
                    current_owner_in: userId,
                    original_owner_in: userId,
                    fish_id_in: uniqueId,
                    fish_length_in: length,
                    fish_weight_in: weight,
                    fish_number_in: randomFish.fish_number,
                    shiny_in: shiny,
                    value_in: value,
                    locked_in: false
                })

          await i.update({
            embeds: [
              embed
                .setColor((!shiny) ? rarityInfo.find(x => x.rarity == randomFish.rarity).hex : '#FFD700')
                .setDescription((!shiny) ? `${interaction.user.username} has reeled in a **${randomFish.name}**!` : `${interaction.user.username} has reeled in a *** ⭐Shiny ${randomFish.name}⭐***!`)
                .setThumbnail((!shiny) ? `https://media.discordapp.net/attachments/1049015764830666843/${randomFish.image.toString()}/${randomFish.fish_number}.png` : `https://media.discordapp.net/attachments/1049018284298752080/${randomFish.image_shiny.toString()}/${randomFish.fish_number}.png`)
                .addFields({ name: 'Bait', value: `Tier ${splitBaitString(baitChoice)} bait`, inline: true },
                  { name: 'Rarity', value: `${rarityInfo.find(x => x.rarity == randomFish.rarity).stars}`, inline: true },
                  { name: 'Length', value: (length > 24) ? `*${(length / 12).toFixed(1)} ft*` : `*${length} in*`, inline: true },
                  { name: 'Weight', value: (weight > 4000) ? `*${(weight / 2000).toFixed(1)} tons*` : `*${weight.toString()} lb*`, inline: true },
                  { name: 'Color', value: `${randomFish.color}`, inline: true },
                  { name: 'Selling Price', value: getTieredCoins(value), inline: true },
                  { name: 'Identifier', value: `\`${uniqueId}\``, inline: true },
                  { name: 'Number', value: `\`#${data.data[0].number_caught}\``, inline: true}
                )
            ], components: [row]
          })
          
        }
      }
    })

  }
}


/**
 * Checks whether a user is able to fish based on their last fishing time and the fishing cooldown.
 * @param {Date} lastFished The last time the user fished.
 * @param {number} fishingCooldown The duration of the fishing cooldown in milliseconds.
 * @returns {object} An object with properties `ableToFish` and `timeLeft` (optional).
 */
function checkIfAbleToFish(lastFished, fishingCooldown) {
  const lastWorkedMs = lastFished ? new Date(lastFished).getTime() : 0;
  const timeLeftMs = lastWorkedMs + fishingCooldown - Date.now();

  if (timeLeftMs > 0) {
    const timeLeftMinutes = Math.floor(timeLeftMs / 60000);
    const timeLeftSeconds = ((timeLeftMs % 60000) / 1000).toFixed(0);

    return {
      ableToFish: false,
      // Format the time left as a string (MM:SS)
      timeLeft: `${timeLeftMinutes}:${timeLeftSeconds < 10 ? '0' : ''}${timeLeftSeconds}`
    };
  } else {
    return {
      ableToFish: true
    };
  }
}