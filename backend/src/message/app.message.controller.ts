import { Controller, Res, Req, Get, Post, Body, Param, Delete, Put, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { MessageManager } from './app.message.manager';
import { ChannelManager } from 'src/channel/app.channel.manager';
import { User } from 'src/user/app.user.manager';

@Controller("message")
export class MessageController {
    constructor(@Inject(MessageManager) private messageManager: MessageManager, @Inject(ChannelManager) private channelManager: ChannelManager) {}

    /*@Post("send")
    async SendMessage(@Body() body, @Res() res, @Req() req: {MUser: User}) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }
        this.messageManager.Log("Message send request by " + req.MUser.GetID());
        const channelID = body.channel;
        const message = body.message;
        if (channelID === undefined || message === undefined || message === "") {
            res.status(400).send({statusCode: 400, message: "Bad request"});
            return
        }
        const channel = this.channelManager.GetChannel(channelID);
        if (channel === undefined) {
            res.status(404).send({statusCode: 404, message: "Channel not found"});
            return
        }
        else if (!channel.HasUser(req.MUser.GetID())) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }
        
        await this.messageManager.SendMessage(channel, message, req.MUser)
    }*/

    @Post("fetch/:id")
    async FetchMessages(@Param() params, @Res() res, @Body() body, @Req() req: {MUser: User}) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }
        this.messageManager.Log("Message fetch request by " + req.MUser.GetID());
        const channelID = params.id;
        const min = body.min;
        if (channelID === undefined || min === undefined) {
            res.status(400).send({statusCode: 400, message: "Bad request"});
            return
        }
        const channel = this.channelManager.GetChannel(channelID);
        if (channel === undefined) {
            res.status(404).send({statusCode: 404, message: "Channel not found"});
            return
        }
        else if (!channel.HasUser(req.MUser.GetID())) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }
        const messages = await this.messageManager.GetMessages(channel, min, min + 10);
        res.status(200).send({statusCode: 200, message: "OK", messages: messages});
    }
}