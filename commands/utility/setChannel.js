const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');

const targetChannels = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchannel')
        .setDescription('select channel which apply this bot')
        .addChannelOption(option => 
            option.setName('target')
            .setDescription('select channel')
            .setRequired(true)
        ),
    async execute(interaction) {
        let channelName = "";
        let channelID = "";
        const targetChannel = interaction.options.getChannel('target');
        channelName = targetChannel.name;
        channelID = targetChannel.id;
        if (targetChannels.has(targetChannel.id)){
            await interaction.reply({
                content: "ephemeral reply",
                ephemeral: true
            });
            console.log(targetChannels);
            return;
        }
        targetChannels.set(targetChannel.id, {
            channelId: targetChannel.id,
            lastMessageAuthor: null,
            reminderInterval: null
        });
        await interaction.reply({
            content: `This command was used in channel: ${channelName}`,
            ephemeral: true
        });
    }
}