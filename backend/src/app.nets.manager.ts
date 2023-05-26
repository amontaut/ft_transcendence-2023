import { Inject, Logger } from "@nestjs/common";
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Socket } from "socket.io";
import { MatchManager, Match } from "./game/app.match.manager";
import { UserManager, User } from "./user/app.user.manager";
import { ChannelManager, Channel } from "./channel/app.channel.manager";
import { MessageManager } from "./message/app.message.manager";

const NetworkString = {
    ["UpdateInput"]: true,
    ["NewMessage"]: true,
}

class NetsManager {
    private readonly logger = new Logger(NetsManager.name);
    private nets: any = {};
    private connectedUsers: any = {};
    constructor(@Inject(UserManager) private userManager: UserManager, @Inject(MessageManager) private messageManager: MessageManager, @Inject(MatchManager) private matchManager: MatchManager, @Inject(ChannelManager) private channelManager: ChannelManager) {
        userManager.SetNetManager(this);
    }

    netIncoming(client: Socket, name: string, args: any = {}) {
        const MUser = client["User"] as User;
        if (name == "connected") {
            this.userConnected(client);
        } else if (name == "disconnected") {
            this.userDisconnected(client);
        } else if (MUser && MUser.CanAction()) {
            //console.log("Net: " + name, args);
            //this.Log("Receive Net: " + name + " " + MUser.GetNick());
            if (!NetworkString[name]) {
                return
            }
            this[name](MUser, args);
        }
    }

    UpdateInput(user: User, args: any) { // Ici tu recois les inputs du joueur
        user.SetInputs(args);
    }

    NewMessage(MUser: User, args: any) {
        if (!MUser.CanAction()) {
            //res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }
        this.messageManager.Log("Message send request by " + MUser.GetID());
        const channelID = args.channel;
        const message = args.message;
        if (channelID === undefined || message === undefined || message === "") {
            //res.status(400).send({statusCode: 400, message: "Bad request"});
            return
        }
        const channel = this.channelManager.GetChannel(channelID);
        if (channel === undefined) {
            //res.status(404).send({statusCode: 404, message: "Channel not found"});
            return
        }
        const CUser = channel.GetUser(MUser.GetID());
        if (!CUser) {
            //res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        } else if (CUser.IsMute()) {
            return
        } else if (CUser.IsBan()) {
            return
        }
        
        this.messageManager.SendMessage(channel, message, MUser)
    }

    /*MuteUser(MUser: User, args: any) {
        if (!MUser.CanAction()) {
            return
        }
        const channelID = args.channel;
        const IDTarget = args.user;
        if (channelID === undefined || IDTarget === undefined) {
            return
        }
        const channel = this.channelManager.GetChannel(channelID);
        if (channel === undefined) {
            return
        }

        const CUser = channel.GetUser(MUser.GetID());
        if (!CUser) {
            return
        } else if (!CUser.IsAdmin()) {
            return
        }

        const MTarget = this.userManager.GetUser(IDTarget);
        if (!MTarget) {
            return
        }
        const CTarget = channel.GetUser(IDTarget);
        if (!CTarget) {
            return
        }
        CTarget.SetMute(true);
    }*/

    userConnected(Client: Socket) {
        let cookies = {};
        (Client.handshake.headers.cookie || "").split(";").forEach((cookie) => {
            let parts = cookie.split("=");
            cookies[parts[0].trim()] = (parts[1] || "").trim();
        });
        if (!cookies["session"]) {
            return;
        }
        const User: User = this.userManager.GetUserByToken(cookies["session"])
        if (!User) { return }
        if (User.GetSocket() && User.GetSocket().connected) { // Il est sur 2 pages ??
            Client.disconnect(true)
            //this.Log("User already connected: " + User.GetNick());
            return
        }
        
        User.SetSocket(Client);
        User.SetStatus(1);
        User.StopAuthTimeout();
        const match = User.GetMatch();
        if (match) {
            User.SendNet("StartGame", match.GetGameSpecatorInfo());
        } else if (User.GetSpectate()) {
            User.SendNet("StartGame", User.GetSpectate().GetGameSpecatorInfo());
        }
        Client["User"] = User;
        //this.Log("User connected: " + User.GetNick());
    }

    userDisconnected(Client: Socket) {
        let cookies = {};
        (Client.handshake.headers.cookie || "").split(";").forEach((cookie) => {
            let parts = cookie.split("=");
            cookies[parts[0].trim()] = (parts[1] || "").trim();
        });
        const MUser = this.userManager.GetUserByToken(cookies["session"])
        if (!MUser) { return }
        if (MUser.GetMatchMaking() && !MUser.IsPlaying()) {
            this.matchManager.matchMaking(MUser, true)
        }
        MUser.SetSocket(null);
        MUser.SetStatus(0);
        MUser.StartAuthTimeout();
        //this.Log("User disconnected: " + MUser.GetNick());
    }

    Send(MUser: User, net: string, args: any = {}) {
        MUser.GetSocket().emit("nets", { net: net, args: args });
    }

    Broadcast(net: string, args: any = {}) {
        this.userManager.GetUsersConnected().forEach((MUser) => {
            MUser.SendNet(net, args);
        });
    }

    Log(text: string) {
        this.logger.log(text);
    }
}

export { NetsManager };