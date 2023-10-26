const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('filter')
    .setDescription('Apply a filter to the queue.')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('The type of audio filter.')
        .setRequired(true)
        .setAutocomplete(true)),
  autocompleteOptions: ["none", "bassboost_low", "bassboost", "bassboost_high", "vaporwave", "nightcore", "normalizer", "normalizer2", "reverse", "earrape", "tremolo",
    "vibrato", "surrounding", "pulsator", "subboost", "gate", "haas", "mono", "compressor", "expander", "softlimiter", "chorus", "chorus2d"],
  async execute(interaction) {
    const client = interaction.client;
    const queue = client.player.getQueue(interaction.guild);

    if (!queue || !queue.current) return await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#FC0000')
          .setTitle("<:yukinon:839338263214030859> No Songs in Queue")
          .setDescription("There are no songs in the queue.")
      ]
    })

      const option = interaction.options.getString('type');
      
    if (!this.autocompleteOptions.find(x => x == option)) {
      return await interaction.reply({
          content: "The filter you have entered does not exist. Please use one of the autocomplete options.",
          ephemeral: true,
      })
  }

  if (option == "none") {
    await queue.setFilters({ "bassboost_low": false });
    return await interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor('#00B6FF ')
                .setTitle("🎶Filter Removed")
                .setDescription(`<@${interaction.user.id}> has removed all filters from the current song queue.`)
                .setFooter({text: `It is normal for the bot to pause for a few seconds to apply a filter. There is no way around this for now.`})
        ]
    })
}

await queue.setFilters({ [option]: true });

await interaction.reply({
    embeds: [
        new EmbedBuilder()
            .setColor('#00B6FF ')
            .setTitle("🎶Filter Applied🎶")
            .setDescription(`<@${interaction.user.id}> has applied a filter to the current song queue.`)
            .addFields({
                name: "Filter",
                value: option,
            })
            .setFooter({text: `It is normal for the bot to pause for a few seconds to apply a filter. There is no way around this for now.`})
    ]
})


  }
}