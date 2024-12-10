const scheduler = require("../components/MessageScheduler");
const { Events } = require("discord.js");

// const scheduler = new MessageScheduler();

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        try {
            // Fetch partial reaction if needed
            if (reaction.partial) {
                await reaction.fetch();
            }
            console.log("detect reaction...");
            //load channel data
            const channels = await scheduler.loadChannels();
            const channelId = reaction.message.channel.id;
            const channelData = channels.channels[channelId];

            //message가 schedule된 last message인지 확인
            if (channelData && channelData.lastMessageId === reaction.message.id) {
                await scheduler.cancelSchedule(channelId);
                console.log("stop sending dm");
            }
        } catch (error) {
            console.error("Error handling reaction: ", error);
        }
    },
};
