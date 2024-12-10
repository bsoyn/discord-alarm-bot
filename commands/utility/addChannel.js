const { SlashCommandBuilder } = require("discord.js");
const fs = require("node:fs").promises;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addchannel")
        .setDescription("select channel which apply this bot")
        .addChannelOption(option => option.setName("target").setDescription("select channel").setRequired(true)),

    async execute(interaction) {
        try {
            const channel = interaction.options.getChannel("target");

            const data = await fs.readFile("./data/channels.json", "utf8");
            const jsondata = JSON.parse(data);

            if (jsondata.channels[channel.id]) {
                await interaction.reply({
                    content: `이미 등록된 채널입니다.`,
                    ephemeral: true,
                });
                return;
            }

            jsondata.channels[channel.id] = {
                channelId: channel.id,
                targetUserId: null,
                nextSchedule: null,
                lastMessageId: null,
            };

            await fs.writeFile("./data/channels.json", JSON.stringify(jsondata, null, 2));
            await interaction.reply({
                content: `다음 채널을 추가합니다: ${channel.name}`,
                ephemeral: true,
            });
        } catch (error) {
            console.log(error);
            await interaction.reply({
                content: `오류가 발생했습니다.`,
                ephemeral: true,
            });
        }
    },
};
