import { Controller, Get, Param, Post, Body, Put, Delete, Request, Response, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { Channel, ChannelManager, encrypt } from './app.channel.manager';
import { User } from '../user/app.user.manager';
import { NetsManager } from 'src/app.nets.manager';

@Controller("channel")
export class ChannelController {
    constructor(@Inject(ChannelManager) private channelManager: ChannelManager, @Inject(NetsManager) private netsManager: NetsManager) {
        channelManager.SetNetManager(netsManager);
    }

    // Tout les users d'un channel
    @Get(":id/users")
    async GetUsers(@Param() params, @Response() res) {
        const channelID = params.id;
        const channel = this.channelManager.GetChannel(channelID);
        if (channel === undefined) {
            res.status(404).send({statusCode: 404, message: "Channel not found"});
            return
        }
        res.status(200).send({statusCode: 200, message: "OK", users: channel.ParseUsers()});
    }

    // Tout les channels d'un user
    @Get("user/:id")
    async GetChannelsUser(@Param() params, @Response() res) {
        const userID = params.id;
        const channels = this.channelManager.GetChannelsUser(userID);
        if (channels === undefined) {
            res.status(404).send({statusCode: 404, message: "User not found"});
            return
        }
        res.status(200).send({statusCode: 200, message: "OK", channels: channels});
    }

    @Post("creation")
    async CreateChannel(@Body() body, @Response() res, @Request() req: {MUser: User}) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }

        const name = body.name;
        const type = body.type;
        const owner = req.MUser.GetID();
        this.channelManager.Log(name + " " + type + " " + owner);
        const password = (type == 3 && body.password) || "";
        if (!name || !type || !owner) {
            res.status(400).send({statusCode: 400, message: "Bad request"});
            return
        }
        
        if (type == 3) {
            this.channelManager.Log("Channel creation request by " + req.MUser.GetNick() + " (" + req.MUser.GetID() + ") with password " + password);
        } else {
            this.channelManager.Log("Channel creation request by " + req.MUser.GetNick() + " (" + req.MUser.GetID() + ")");
        }
        await this.channelManager.AddChannel(name, type, owner, encrypt(password))
        res.status(200).send({statusCode: 200, message: "OK"});
    }

    @Delete("delete/:id")
    async DeleteChannel(@Param() params, @Response() res, @Request() req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }
        const channelID = params.id;
        const channel = this.channelManager.GetChannel(channelID);
        this.channelManager.Log("Channel deletion request by " + req.MRegistered + " (" + req.MUserID + ")");
        if (channel === undefined) {
            res.status(404).send({statusCode: 404, message: "Channel not found"});
            return
        }
        if (channel.GetOwner() != req.MUser.GetID()) {
            res.status(403).send({statusCode: 403, message: "You are not the owner"});
            return
        }
        await this.channelManager.RemoveChannel(channelID);
        res.status(200).send({statusCode: 200, message: "OK"});
    }

    @Post("leave/:id")
    async LeaveChannel(@Param() params, @Response() res, @Request() req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }
        const channelID = params.id;
        const channel = this.channelManager.GetChannel(channelID);
        const UserID = req.MUser.GetID()
        this.channelManager.Log("Channel leave request by " + req.MUser.GetNick() + " (" + UserID + ")");
        if (channel === undefined) {
            res.status(404).send({statusCode: 404, message: "Channel not found"});
            return
        }
        console.log(channel.GetUser(UserID).GetBan() > Date.now()/1000)
        if (!channel.HasUser(UserID)) {
            res.status(403).send({statusCode: 403, message: "Forbidden"});
            return
        } else if (channel.GetUser(UserID).GetBan() > Date.now()/1000) {
            res.status(403).send({statusCode: 403, message: "You are banned"});
            return
        }
        await channel.RemoveUser(UserID);
        res.status(200).send({statusCode: 200, message: "OK"});
    }

    @Post("join/:id")
    async JoinChannel(@Param() params, @Body() body, @Response() res, @Request() req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }

        const channelID = params.id;
        let channel = this.channelManager.GetChannel(channelID);
        const UserID = req.MUser.GetID()
        this.channelManager.Log("Channel join request by " + req.MUser.GetNick() + " (" + UserID + ")");
        if (channel === undefined) {
            channel = this.channelManager.GetChannelInvite(channelID);
            if (channel === undefined) {
                res.status(404).send({statusCode: 404, message: "Channel not found"});
                return
            }
        }
        const password = body.password;
        if (!channel.CanJoin(UserID, password, channelID)) {
            res.status(403).send({statusCode: 403, message: "You can't join this channel"});
            return
        }
        channel.AddUser(UserID, false);
        res.status(200).send({statusCode: 200, message: "OK"});
    }

    @Post("/mute")
    async MuteUser(@Body() body, @Response() res, @Request() req: {MUser: User}) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }
        const channelID = body.channel;
        const targetID = body.id;
        if (!targetID || !channelID) {
            res.status(400).send({statusCode: 400, message: "Bad request"});
            return
        } else if (targetID == req.MUser.GetID()) {
            res.status(403).send({statusCode: 403, message: "You can't mute yourself"});
            return
        }

        const channel = this.channelManager.GetChannel(channelID);
        if (!channel) {
            res.status(404).send({statusCode: 404, message: "Channel not found"});
            return
        }

        const CUser = channel.GetUser(req.MUser.GetID());
        if (!CUser || !CUser.IsAdmin()) {
            res.status(403).send({statusCode: 403, message: "You are not admin"});
            return
        }

        const CTargetUser = channel.GetUser(targetID);
        if (!CTargetUser) {
            res.status(404).send({statusCode: 404, message: "User not found"});
            return
        } else if (CTargetUser.IsAdmin() && !CUser.IsOwner()) {
            res.status(403).send({statusCode: 403, message: "Forbidden"});
            return
        }
    
        let muteLenght = 0;
        if (!CTargetUser.IsMute() && !body.lenght && body.lenght !== 0) {
            res.status(400).send({statusCode: 400, message: "Bad request"});
            return
        } else if (!CTargetUser.IsMute()) {
            muteLenght = Math.min(Math.max(0, parseInt(body.lenght)), 60 * 24 * 7);
            if (isNaN(muteLenght)) {
                res.status(400).send({statusCode: 400, message: "Bad request"});
                return
            }
        }
        
        channel.MuteUser(CTargetUser, !CTargetUser.IsMute(), muteLenght);
        res.status(200).send({statusCode: 200, message: "OK"});
    }
    
    @Post("/kick")
    async KickUser(@Body() body, @Response() res, @Request() req: {MUser: User}) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }
        const channelID = body.channel;
        const targetID = body.id;
        if (!targetID || !channelID) {
            res.status(400).send({statusCode: 400, message: "Bad request"});
            return
        } else if (targetID == req.MUser.GetID()) {
            res.status(403).send({statusCode: 403, message: "You can't kick yourself"});
            return
        }

        const channel = this.channelManager.GetChannel(channelID);
        if (!channel) {
            res.status(404).send({statusCode: 404, message: "Channel not found"});
            return
        }

        const CUser = channel.GetUser(req.MUser.GetID());
        if (!CUser || !CUser.IsAdmin()) {
            res.status(403).send({statusCode: 403, message: "You are not admin"});
            return
        }

        const CTargetUser = channel.GetUser(targetID);
        if (!CTargetUser) {
            res.status(404).send({statusCode: 404, message: "User not found"});
            return
        } else if (CTargetUser.IsAdmin() && !CUser.IsOwner()) {
            res.status(403).send({statusCode: 403, message: "You can't kick an admin"});
            return
        }
        
        channel.RemoveUser(CTargetUser.GetID());
        res.status(200).send({statusCode: 200, message: "OK"});
    }

    @Post("/promote")
    async PromoteUser(@Body() body, @Response() res, @Request() req: {MUser: User}) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }
        const channelID = body.channel;
        const targetID = body.id;
        if (!targetID || !channelID) {
            res.status(400).send({statusCode: 400, message: "Bad request"});
            return
        }else if (targetID == req.MUser.GetID()) {
            res.status(403).send({statusCode: 403, message: "You can't promote yourself"});
            return
        }
        
        const channel = this.channelManager.GetChannel(channelID);
        if (!channel) {
            res.status(404).send({statusCode: 404, message: "Channel not found"});
            return
        }

        const CUser = channel.GetUser(req.MUser.GetID());
        if (!CUser || !CUser.IsAdmin()) {
            console.log(CUser)
            res.status(403).send({statusCode: 403, message: "You are not admin"});
            return
        }

        const CTargetUser = channel.GetUser(targetID);
        if (!CTargetUser) {
            res.status(404).send({statusCode: 404, message: "User not found"});
            return
        } 
        channel.PromoteUser(CTargetUser, !CTargetUser.IsAdmin())
        res.status(200).send({statusCode: 200, message: "OK"});
    }

    @Post("/ban")
    async BanUser(@Body() body, @Response() res, @Request() req: {MUser: User}) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }
        const channelID = body.channel;
        const targetID = body.id;
        if (!targetID || !channelID) {
            res.status(400).send({statusCode: 400, message: "Bad request"});
            return
        } else if (targetID == req.MUser.GetID()) {
            res.status(403).send({statusCode: 403, message: "You can't ban yourself"});
            return
        }
        

        const channel = this.channelManager.GetChannel(channelID);
        if (!channel) {
            res.status(404).send({statusCode: 404, message: "Channel not found"});
            return
        }

        const CUser = channel.GetUser(req.MUser.GetID());
        if (!CUser || !CUser.IsAdmin()) {
            res.status(403).send({statusCode: 403, message: "You are not an admin"});
            return
        }

        const CTargetUser = channel.GetUser(targetID);
        if (!CTargetUser) {
            res.status(404).send({statusCode: 404, message: "User not found"});
            return
        }
        if (CTargetUser.IsAdmin() && !CUser.IsOwner()) {
            res.status(403).send({statusCode: 403, message: "You can't ban an admin"});
            return
        }
        let banLenght = 0;
        if (!CTargetUser.IsBan() && !body.lenght) {
            res.status(400).send({statusCode: 400, message: "Bad request"});
            return
        } else if (!CTargetUser.IsBan()) {
            banLenght = Math.min(Math.max(0, parseInt(body.lenght)), 60 * 24 * 7);
            if (isNaN(banLenght)) {
                res.status(400).send({statusCode: 400, message: "Bad request"});
                return
            }
        }
        channel.BanUser(CTargetUser, !CTargetUser.IsBan(), banLenght);
        res.status(200).send({statusCode: 200, message: "OK"});
    }
    
    @Post("pwd/remove/:id")
    async RemovePassword(@Param("id") id, @Response() res, @Request() req: {MUser: User}) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }
        const channel = this.channelManager.GetChannel(id);
        if (!channel) {
            res.status(404).send({statusCode: 404, message: "Channel not found"});
            return
        } else if (channel.GetType() !== 3) {
            res.status(400).send({statusCode: 400, message: "Bad request"});
            return
        }

        const CUser = channel.GetUser(req.MUser.GetID());
        if (!CUser || !CUser.IsOwner()) {
            res.status(403).send({statusCode: 403, message: "You are not the owner"});
            return
        }

        await this.channelManager.UpdateChannel(channel.GetID(), "password", "");
        await this.channelManager.UpdateChannel(channel.GetID(), "type", 1);
        this.channelManager.Broadcast("UpdateChannel", {id: channel.GetID(), type: 1});
        res.status(200).send({statusCode: 200, message: "OK"});
    }

    @Post("pwd/set/:id")
    async SetPassword(@Param("id") id, @Body() body, @Response() res, @Request() req: {MUser: User}) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }
        const channel = this.channelManager.GetChannel(id);
        if (!channel) {
            res.status(404).send({statusCode: 404, message: "Channel not found"});
            return
        } else if (channel.GetType() !== 1 && channel.GetType() !== 3) {
            res.status(400).send({statusCode: 400, message: "Bad request"});
            return
        }

        const CUser = channel.GetUser(req.MUser.GetID());
        if (!CUser || !CUser.IsOwner()) {
            res.status(403).send({statusCode: 403, message: "You are not the owner"});
            return
        }

        if (!body.password) {
            res.status(400).send({statusCode: 400, message: "Bad request"});
            return
        }
        
        await this.channelManager.UpdateChannel(channel.GetID(), "password", encrypt(body.password));
        await this.channelManager.UpdateChannel(channel.GetID(), "type", 3);
        this.channelManager.Broadcast("UpdateChannel", {id: channel.GetID(), type: 3});
        res.status(200).send({statusCode: 200, message: "OK"});
    }
}