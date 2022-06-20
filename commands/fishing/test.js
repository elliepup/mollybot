const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const Canvas = require('@napi-rs/canvas')
const { readFile } = require('fs/promises');
const { request } = require('undici');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('A command for testing purposes'),
    async execute(interaction) {

        const canvas = Canvas.createCanvas(700, 250);
        const context = canvas.getContext('2d');

        const backgroundFile = await readFile("./extras/background.jpg")
        const background = new Canvas.Image();
        background.src = backgroundFile;

        context.drawImage(background, 0, 0, canvas.width, canvas.height);
        
        context.beginPath();
		context.arc(125, 125, 100, 0, Math.PI * 2, true);
		context.closePath();
		context.clip();

        const { body } = await request(interaction.user.displayAvatarURL({format: 'jpg'}));
        const avatar = new Canvas.Image();
        avatar.src = Buffer.from(await body.arrayBuffer());
        context.drawImage(avatar, 25, 25, 200, 200);
        const attachment = new MessageAttachment(canvas.toBuffer('image/png'), 'user-image.png');

        interaction.reply({ files: [attachment] });
    }

}
