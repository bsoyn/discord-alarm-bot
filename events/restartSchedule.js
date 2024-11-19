const { Events } = require("discord.js");
const { MessageScheduler } = require("../components/MessageScheduler");

const scheduler = new MessageScheduler();

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        try {
            await scheduler.handleServerRestart(client);
            // const channels = await scheduler.loadChannels();
            // for (const [channelId, channelData] of Object.entries(channels.channels)) {
            //     if (channelData.nextSchedule) {
            //         const nextTime = new Date(channelData.nextSchedule);
            //         if (nextTime > new Date()) {
            //             await scheduler.scheduleMessage(client, channelId, nextTime);
            //             console.log(`Restored schedule for channel ${channelId}`);
            //         } else {
            //         }
            //     }
            // }
        } catch (error) {
            console.error("Error restoring schedules:", error);
        }
    },
};
