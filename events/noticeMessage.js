const { Events } = require("discord.js");
const scheduler = require("../components/MessageScheduler");
const fs = require("node:fs").promises;

// const scheduler = new MessageScheduler();

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        try {
            console.log("detect message");
            const client = message.client;
            const channel = message.channel;
            //json불러오기
            const data = await fs.readFile("./data/channels.json", "utf8");
            const jsondata = JSON.parse(data);

            //봇의 메세지거나 대상 채널이 아니면 return
            if (message.author.bot || !jsondata.channels[channel.id]) return;

            //jsondata 정정
            jsondata.channels[channel.id] = {
                channelId: channel.id,
                lastMessageAuthor: message.author.id,
                nextSchedule: message.createdAt,
            };
            // Get channel members
            const channelMembers = await message.guild.members.fetch();
            // if (channelMembers.size !== 2) {
            //     console.log(channelMembers);
            //     console.log("return");
            //     return;
            // }
            // Find the other user
            const otherUser = channelMembers.find(member => member.id !== message.author.id)?.user;
            if (!otherUser) return;
            if (otherUser) {
                await scheduler.updateSchedule(client, message.channel.id, otherUser.id, message);
                console.log(`Schedule updated for channel ${message.channel.name}`);
            }
        } catch (error) {
            console.log(error);
        }

        console.log(`From user: ${message.author.username}`);
        console.log(`In channel: ${message.channel.name}`);
        console.log(`Timestamp: ${message.createdAt}`);
    },
};
