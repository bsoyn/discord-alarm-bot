const { SlashCommandBuilder } = require("discord.js");
const { fs } = require('node:fs');
const channels = require('../../data/channelStorage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removechannel')
        .setDescription('봇을 적용할 채널 목록에서 삭제')
        .addChannelOption(option =>
            option.setName('target')
                .setDescription('select channel')
                .setRequired(true)
        ),

    async execute(interaction) {
        const targetChannel = interaction.options.getChannel('target');
        if (!channels.has(targetChannel.id)){
            await interaction.reply({
                content: "대상 채널이 아닙니다.",
                ephemeral: true
            });
            return;
        }
        channels.delete(targetChannel.id);
        await interaction.reply({
            content: "채널을 제외했습니다.",
            ephemeral: true
        });
    }
}
