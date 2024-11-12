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
        const targetChannel = interaction.options.getChannel('target');
        if (targetChannels.has(targetChannel.id)){
            await interaction.reply({
                content: "이미 등록된 채널입니다.",
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
            content: `다음 채널을 추가합니다: ${targetChannel.name}`,
            ephemeral: true
        });
    }
}