const { SlashCommandBuilder } = require("discord.js");
const fs = require("node:fs").promises;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removechannel")
        .setDescription("봇을 적용할 채널 목록에서 삭제")
        .addChannelOption((option) =>
            option
                .setName("target")
                .setDescription("select channel")
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            //선택한 channel 불러오기
            const channel = interaction.options.getChannel("target");

            //json불러오기
            const data = await fs.readFile("./data/channels.json", "utf8");
            const jsondata = JSON.parse(data);

            if (!jsondata.channels[channel.id]) {
                await interaction.reply({
                    content: `등록되지 않은 채널입니다.`,
                    ephemeral: true,
                });
                return;
            }

            delete jsondata.channels[channel.id];

            await fs.writeFile(
                "./data/channels.json",
                JSON.stringify(jsondata, null, 2)
            );
            await interaction.reply({
                content: "채널을 제외했습니다.",
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
