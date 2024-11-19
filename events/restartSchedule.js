const { Events } = require("discord.js");
const scheduler = require("../components/MessageScheduler.js");

// const scheduler = new MessageScheduler();

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        try {
            console.log("restart bot");
            await scheduler.handleServerRestart(client);
        } catch (error) {
            console.error("Error restoring schedules:", error);
        }
    },
};
