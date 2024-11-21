const schedule = require("node-schedule");
const fs = require("fs").promises;

class MessageScheduler {
    constructor() {
        this.channelsPath = "./data/channels.json";
        this.jobs = new Map(); // Store schedules
    }

    //channel 불러오기 (channel Id, message author, reminder time)
    async loadChannels() {
        try {
            const data = await fs.readFile(this.channelsPath, "utf8");
            return JSON.parse(data);
        } catch (error) {
            console.error("Error loading channels:", error);
            return { channels: {} };
        }
    }

    //channel save 하기
    async saveChannels(data) {
        await fs.writeFile(this.channelsPath, JSON.stringify(data, null, 2));
    }

    isSleepTime(date) {
        const hour = date.getHours();
        return hour >= 0 && hour < 8;
    }
    // Add method to get next available time
    getNextAvailableTime(date) {
        if (this.isSleepTime(date)) {
            // If current time is in quiet hours, set time to 8:00 AM
            const nextTime = new Date(date);
            nextTime.setHours(8, 0, 0, 0);
            return nextTime;
        }
        return date;
    }

    //send dm method
    async sendDM(client, channelId, userId) {
        try {
            const user = await client.users.fetch(userId);
            await user.send(`Time to check messages in <#${channelId}>!`);
            console.log(`DM sent to user ${user.id} for channel ${channelId}`);
        } catch (error) {
            console.error(`Error sending DM to user ${userId}:`, error);
        }
    }

    async scheduleMessage(client, channelId, scheduleTime) {
        // 이미 job이 존재한다면 취소 = 이전에 했던 schedule을 취소
        if (this.jobs.has(channelId)) {
            this.jobs.get(channelId).cancel();
            console.log("cancel job");
        }
        // Create schedule job
        const job = schedule.scheduleJob(scheduleTime, async () => {
            try {
                const channels = await this.loadChannels();
                const channel = channels.channels[channelId];

                if (channel && channel.lastMessageAuthor) {
                    const currentTime = scheduleTime;

                    if (this.isSleepTime(scheduleTime)) {
                        const nextTime = this.getNextAvailableTime(scheduleTime);
                        channel.nextSchedule = nextTime.toISOString();
                        await this.saveChannels(channels);
                        this.scheduleMessage(client, channelId, nextTime);
                        console.log(`Message rescheduled to ${nextTime} due to sleep hours`);
                        return;
                    }

                    await this.sendDM(client, channelId, channel.lastMessageAuthor);

                    //Update the next schedule time
                    const nexttime = new Date();
                    nexttime.setHours(nexttime.getHours() + 4); //시간 수정
                    channel.nextSchedule = nexttime.toISOString();
                    console.log(nexttime);
                    await this.saveChannels(channels);
                    this.scheduleMessage(client, channelId, nexttime);
                }
            } catch (error) {
                console.error("Failed to send scheduled DM:", error);
            }
        });

        this.jobs.set(channelId, job);
    }

    async updateSchedule(client, channelId, targetUserId, message) {
        //메세지 작성 시간에서 시간 더하기
        let nextTime = message.createdAt;
        nextTime.setHours(nextTime.getHours() + 4); // Schedule 2 hours from now 시간 수정

        nextTime = this.getNextAvailableTime(nextTime);

        const channels = await this.loadChannels();
        if (!channels.channels[channelId]) {
            channels.channels[channelId] = {};
        }

        channels.channels[channelId].lastMessageAuthor = targetUserId;
        channels.channels[channelId].nextSchedule = nextTime.toISOString();
        channels.channels[channelId].lastMessageId = message.id; //save message id
        console.log(channels);

        await this.saveChannels(channels);
        await this.scheduleMessage(client, channelId, nextTime);

        console.log(`Next message scheduled for: ${nextTime}`);
    }

    async cancelSchedule(channelId) {
        try {
            // Cancel the scheduled job
            console.log(this.jobs);
            if (this.jobs.has(channelId)) {
                this.jobs.get(channelId).cancel();
                this.jobs.delete(channelId);
            }

            // Update channels.json
            const channels = await this.loadChannels();
            if (channels.channels[channelId]) {
                delete channels.channels[channelId].lastMessageAuthor;
                delete channels.channels[channelId].nextSchedule;
                delete channels.channels[channelId].lastMessageId;
                await this.saveChannels(channels);
            }

            console.log(`Schedule cancelled for channel ${channelId}`);
        } catch (error) {
            console.error("Error cancelling schedule:", error);
        }
    }

    async handleServerRestart(client) {
        try {
            const channels = await this.loadChannels();
            const currentTime = new Date();

            for (const [channelId, channelData] of Object.entries(channels.channels)) {
                if (!channelData.nextSchedule || !channelData.lastMessageAuthor) continue;

                let scheduledTime = new Date(channelData.nextSchedule);

                if (scheduledTime <= currentTime) {
                    if (this.isSleepTime(currentTime)) {
                        scheduledTime = this.getNextAvailableTime(currentTime);
                    } else {
                        // If schedule has passed, send DM immediately and create new schedule
                        await this.sendDM(client, channelId, channelData.lastMessageAuthor);

                        // Create new schedule
                        scheduledTime = new Date();
                        scheduledTime.setHours(scheduledTime.getHours() + 3); //시간 수정
                        scheduledTime = this.getNextAvailableTime(scheduledTime);
                    }
                } else {
                    //아직 dm 시간 이전이면, sleep 시간이 아닌지 확인
                    scheduledTime = this.getNextAvailableTime(scheduledTime);
                }
                channelData.nextSchedule = scheduledTime.toISOString();
                // If schedule is in future, just restore it
                await this.scheduleMessage(client, channelId, scheduledTime);

                console.log(`schedule restart complete`);
            }

            // Save updated schedules
            await this.saveChannels(channels);
        } catch (error) {
            console.error("Error handling server restart:", error);
        }
    }
}

const schedulerInstance = new MessageScheduler();
module.exports = schedulerInstance;
