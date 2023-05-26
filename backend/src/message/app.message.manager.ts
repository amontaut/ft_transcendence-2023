import { Inject, Logger } from '@nestjs/common';
import { User, UserManager } from 'src/user/app.user.manager';
import { Channel, ChannelManager } from '../channel/app.channel.manager';
import { retreiveDataBase } from 'src/app.database';

/*
await dataBase.query(`CREATE TABLE "messages" (
    "id" INTEGER NOT NULL,
    "channel" INTEGER NOT NULL,
    "author" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "date" TIMESTAMP NOT NULL
);`)
*/
class MessageManager {
    private lastMessageID: number = 0;
    private CLogger = new Logger("MessageManager");
    private userManager: UserManager;
    constructor(@Inject(ChannelManager) private channelManager: ChannelManager) {
        this.Log("Initialize");
        retreiveDataBase().then((dataBase) => {
            dataBase.query(`SELECT * FROM "messages" ORDER BY "id" DESC LIMIT 1;`).then((result) => {
                if (result.rows[0] === undefined) return
                this.lastMessageID = result.rows[0].id;
            });
        });
        this.channelManager.SetMessageManager(this);
    }

    SetUserManager(userManager: UserManager) {
        this.userManager = userManager;
    }

    async SendMessage(channel: Channel, message: string, user: User) {
        const channelID = channel.GetID();
        const authorID = user.GetID();
        const authorNick = user.GetNick();
        const messageID = this.lastMessageID + 1;
        this.lastMessageID = messageID;

        const dataBase = await retreiveDataBase();
        await dataBase.query(`INSERT INTO "messages" ("id", "channel", "author", "nick", "content", "date") VALUES ($1, $2, $3, $4, $5, $6);`, [messageID, channelID, authorID, authorNick, message, Date.now()]);
        this.Log(`Send message ${messageID} in channel ${channelID} from user ${authorID} with content ${message} at ${Date.now()}`)
    
        for (const userID in channel.GetUsers()) {
            const userSend = this.userManager.GetUser(userID as unknown as number);
            if (!userSend) continue;
            this.Log(`Send websocket message to user ${userSend.GetNick()}[${userSend.GetID()}]`);
            userSend.SendNet("NewMessage", {
                id: messageID,
                nick: authorNick,
                channel: channelID,
                author: authorID,
                content: message,
                date: Date.now(),
            });
        }
    }

    // Get messages from a channel in a range of start and end like (5 last messages to 10 last messages)
    async GetMessages(channel: Channel, start: number, end: number) {
        this.Log(start + " " + end)
        const channelID = channel.GetID();
        const dataBase = await retreiveDataBase();
        const result = await dataBase.query(`SELECT * FROM "messages" WHERE "channel" = $1 ORDER BY "id" DESC LIMIT $2 OFFSET $3;`, [channelID, end - start, start]);
        //result.rows.reverse();
        return result.rows;
    }

    async DeleteMessages(id: number) {
        const dataBase = await retreiveDataBase();
        await dataBase.query(`DELETE FROM "messages" WHERE "channel" = $1;`, [id]);
    }

    async UpdateNameMessages(id: number, nick: string) {
        const dataBase = await retreiveDataBase();
        await dataBase.query(`UPDATE "messages" SET "nick" = $1 WHERE "author" = $2;`, [nick, id]);
    }

    Log(message: string) {
        this.CLogger.log(message);
    }
}

export { MessageManager };