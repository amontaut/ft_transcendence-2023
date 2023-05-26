import { Logger, Inject } from "@nestjs/common";
import { retreiveDataBase } from "../app.database";
import { Socket } from "socket.io";
import { ChannelManager, Channel } from "src/channel/app.channel.manager";
import { Match } from "../game/app.match.manager";
import { NetsManager } from "src/app.nets.manager";
import { MessageManager } from "src/message/app.message.manager";
const authenticator = require("authenticator");

type Friend = {
    id: number;
    pending: boolean;
    invite: number;
    status: number;
    channel: number | null;
    nick: string;
}

type UserType = {
    id: number;
    nick: string;
    friends: { [key: number]: Friend };
}

type UserDatabaseType = {
    id: number;
    nick: string;
    friends: string;
    auth: string | null;
    blocked: string;
}

type TokenType = {
    session: string;
    id: number;
}

class FriendUser {
    private id: number;
    private pending: boolean;
    private invite: number;
    private friend: User;
    private status: number = 0;
    private channel: number | null = null;

    constructor(id: number, nick: string, pending: boolean, invite: number, friend: User, channel: number | null = null) {
        this.id = id;
        this.pending = pending;
        this.invite = invite;
        this.friend = friend;
        this.channel = channel;
    }

    SetPending(pending: boolean) {
        this.pending = pending;
    }

    GetPending() {
        return this.pending;
    }

    GetInvite() {
        return this.invite;
    }
}

class User {
    private id: number;
    private nick: string;
    //private socket: SocketIO.Socket;
    private status: number = 0;
    private friends: { [key: number]: FriendUser } = {};
    private friendsJSON: { [key: number]: Friend } = {};
    private userManager: UserManager;
    private stats = {};
    private history = {};
    private connected: boolean;
    private register: boolean;
    private socket: Socket;
    private match: Match;
    private score: number = 0;
    private inputs: { up: boolean, down: boolean } = { up: false, down: false }
    private matchmaking: boolean = false;
    private spectate: Match = null;
    private auth: string = null;
    private needAuth: boolean = false;
    private authTimeout: NodeJS.Timeout = null;
    private invite: User = null;
    private blocked: { [key: number]: boolean } = {};
    private tempAuth: string = null;

    constructor(id: number, nick: string, userManager: UserManager, connected: boolean = true, register: boolean = true) {
        this.id = id;
        this.nick = nick;
        this.userManager = userManager;
        this.connected = connected;
        this.register = register;
    }

    HasFriend(friend: User): boolean {
        return (this.friends[friend.GetID()] !== undefined);
    }

    CanAcceptFriend(friendUser: User): boolean {
        const friend = this.friends[friendUser.GetID()];
        //console.log(friend.GetPending(), friend.GetInvite(),  this.id);
        this.Log(`Accept Friend [${this.GetNick()}](id: ${this.GetID()}) -> [${friendUser.GetNick()}](id: ${friendUser.GetID()})) (invite: ${friend.GetInvite()})`)
        return friend.GetPending() && (friend.GetInvite() !== this.id);
    }

    Log(log: string) {
        this.userManager.Log(log);
    }

    GetID() {
        return this.id;
    }

    GetNick() {
        return this.nick;
    }

    GetFriends() {
        return this.friends;
    }

    GetUserManager() {
        return this.userManager;
    }

    GetFriendsJSON() {
        let friends = {} as { [key: number]: Friend };
        for (let key in this.friends) {
            const MUser = this.userManager.GetUser(key as unknown as number);
            friends[key] = {
                id: this.friendsJSON[key].id,
                pending: this.friendsJSON[key].pending,
                invite: this.friendsJSON[key].invite,
                status: MUser.GetStatus(),
                channel: this.friendsJSON[key].channel,
                nick: MUser.GetNick(),
            }
        }
        return friends;
    }

    GetOrignalFriendsJSON() {
        return this.friendsJSON;
    }

    IsRegister() {
        return this.register;
    }

    IsRegister42() {
        return this.connected;
    }

    CanAction() {
        return this.register && this.connected;
    }

    async Parse() {
        return {
            id: this.id,
            nick: this.nick,
            friends: this.GetFriendsJSON(),
            status: this.status,
            stats: this.stats,
            histories: await this.RetreiveHistory(),
            isConnected: this.connected,
            isRegister: this.register,
            auth: this.auth && true || false,
            blocked: this.blocked,
        }
    }

    async AddFriend(newFriend: User, self: boolean = true, channel: Channel | null = null) {
        const id = newFriend.GetID();

        const newChannel = (self && await this.userManager.channelManager.AddChannel("", 4, 0, "")) || channel;
        if (self) {
            await newChannel.AddUser(this.GetID(), false)
            await newChannel.AddUser(newFriend.GetID(), false)
        }

        this.friendsJSON[id] = {
            id: id,
            pending: true,
            invite: self ? this.id : newFriend.GetID(),
            status: newFriend.GetStatus(),
            channel: newChannel.GetID(),
            nick: newFriend.GetNick(),
        }

        this.friends[id] = new FriendUser(id, newFriend.GetNick(), true, this.friendsJSON[id].invite, this, newChannel.GetID());
        this.Log(`Add Friends [${this.nick}](${this.id}) -> [${newFriend.GetNick()}](${id}) (self: ${self}) (invite: ${this.friendsJSON[id].invite}))`)
        const dataBase = await retreiveDataBase()
        await dataBase.query("UPDATE users SET friends = $1 WHERE id = $2", [JSON.stringify(this.friendsJSON), this.id]);
        this.SendNet("FriendAdd", this.friendsJSON[id])
        if (!self) return
        newFriend.AddFriend(this, !self, newChannel);
    }

    async RemoveFriend(friend: User, self: boolean = true) {
        const id = friend.GetID();
        await this.userManager.channelManager.RemoveChannel(this.friendsJSON[id].channel)
        delete this.friends[id];
        delete this.friendsJSON[id];
        const dataBase = await retreiveDataBase()
        await dataBase.query("UPDATE users SET friends = $1 WHERE id = $2", [JSON.stringify(this.friendsJSON), this.id]);
        this.SendNet("FriendRemove", id)
        if (!self) return
        friend.RemoveFriend(this, !self);
    }

    async AccepteFriend(friend: User, self: boolean = true) {
        const id = friend.GetID();
        this.friends[id].SetPending(false);
        this.friendsJSON[id].pending = false;
        const dataBase = await retreiveDataBase()
        await dataBase.query("UPDATE users SET friends = $1 WHERE id = $2", [JSON.stringify(this.friendsJSON), this.id]);
        this.SendNet("FriendAccept", id)
        if (!self) return
        friend.AccepteFriend(this, !self);
    }

    async BlockUser(user: User, block: boolean) {
        this.blocked[user.GetID()] = block;
        const dataBase = await retreiveDataBase()
        await dataBase.query("UPDATE users SET blocked = $1 WHERE id = $2", [JSON.stringify(this.blocked), this.id]);
        this.SendNet("BlockUser", {id: user.GetID(), value: block})
    }

    IsBlocked(user: User) {
        return this.blocked[user.GetID()] || false;
    }

    SetSocket(socket: Socket) {
        this.socket = socket;
    }

    GetSocket() {
        return this.socket;
    }

    IsConnectedSocket() {
        return this.socket && this.socket.connected;
    }

    SendNet(event: string, args: any) {
        if (!this.socket || this.socket.disconnected)
            return;
        this.socket.emit("nets", { net: event, args: args });
    }

    Broadcast(net: string, args: any) {
        this.userManager.Broadcast(net, args);
    }

    SetStatus(status: number) {
        if (!this.IsConnectedSocket()) {
            status = 0;
        }
        this.status = status;
        this.Broadcast("Status", { UserID: this.GetID(), Status: status });
    }

    GetStatus() {
        return this.status;
    }

    SetMatch(match: Match) {
        this.match = match;
    }

    GetMatch() {
        return this.match;
    }

    SetScore(score: number) {
        this.score = score;
    }

    GetScore() {
        return this.score;
    }

    AddScore(score: number) {
        this.score += score;
    }

    SetInputs(inputs: { up: boolean, down: boolean }) {
        this.inputs = inputs;
    }

    GetInputs() {
        return this.inputs;
    }

    GetMatchMaking() {
        return this.matchmaking;
    }

    SetMatchMaking(matchmaking: boolean) {
        this.matchmaking = matchmaking;
    }

    GetSpectate() {
        return this.spectate;
    }

    SetSpectate(match: Match | null) {
        this.spectate = match;
        this.SetStatus(match ? 5 : 1);
    }

    IsPlaying() {
        return (this.match != null && (this.match.GetGameStarted() || this.match.GetIsStarting()));
    }

    CanInvite() {
        return !this.IsPlaying() && !this.GetMatchMaking() && !this.GetSpectate() && !this.GetMatch();
    }

    FetchFriends(channelManager: ChannelManager, friends: { [key: number]: Friend }) {
        // retrieve friends channel
        for (let key in friends) {
            const userID = parseInt(key) as number;
            const MUser = this.userManager.GetUser(userID);
            if (!MUser) continue;
            this.friends[userID] = new FriendUser(userID, MUser.GetNick(), friends[key].pending, friends[key].invite, this, friends[key].channel);
            this.friendsJSON[userID] = {
                id: userID,
                pending: friends[key].pending,
                invite: friends[key].invite,
                status: 0,
                channel: friends[key].channel,
                nick: MUser.GetNick()
            }
        }
    }

    FetchBlocked(blocked: { [key: number]: boolean }) {
        this.blocked = blocked;
    }

    /*
    await dataBase.query(`CREATE TABLE IF NOT EXISTS "history" (
        "id" INTEGER NOT NULL,
        "win" BOOLEAN NOT NULL,
        "date" TIMESTAMP NOT NULL,
        "ennemy" INTEGER NOT NULL,
        "score" INTEGER NOT NULL,
        "ennemyScore" INTEGER NOT NULL
    );`)*/

    async RetreiveHistory() {
        const dataBase = await retreiveDataBase()
        const result = await dataBase.query(`SELECT * FROM "history" WHERE "id" = $1;`, [this.id]);
        let history = [];
        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows[i];
            const ennemy = this.userManager.GetUser(row.ennemy);
            history.unshift({
                win: row.win,
                date: row.date,
                ennemy: row.ennemy,
                ennemyNick: (ennemy && ennemy.GetNick()) || "Inconnu",
                score: row.score,
                ennemyScore: row.ennemyScore
            })
        }
        return history;
    }

    async AddHistory(win: boolean, ennemy: User, score: number, ennemyScore: number) {
        const dataBase = await retreiveDataBase()
        this.SendNet("HistoryAdd", {
            win: win,
            date: Date.now(),
            ennemy: ennemy.GetID(),
            ennemyNick: ennemy.GetNick(),
            score: score,
            ennemyScore: ennemyScore
        })
        await dataBase.query(`INSERT INTO "history" ("id", "win", "date", "ennemy", "score", "ennemyScore") VALUES ($1, $2, $3, $4, $5, $6)`, [this.id, win, Date.now(), ennemy.GetID(), score, ennemyScore]);
    }

    GetAuth() {
        return this.auth;
    }

    SetAuth(auth: string | null = null, needAuth: boolean = false) {
        this.auth = auth;
        this.needAuth = needAuth;
        this.Log(`Set auth of ${this.nick} (${this.id}) to ${auth}`);
    }

    NeedAuth() {
        return this.needAuth && this.auth;
    }

    SetNeedAuth(needAuth: boolean) {
        this.needAuth = needAuth;
    }

    SetTempAuth(auth: string) {
        this.tempAuth = auth;
    }

    GetTempAuth() {
        return this.tempAuth;
    }

    StartAuthTimeout() {
        if (!this.auth) return;
        this.authTimeout = setTimeout(() => {
            this.SetAuth(this.auth, true);
        }, 2000);
    }

    StopAuthTimeout() {
        if (!this.authTimeout) return;
        clearTimeout(this.authTimeout);
    }

    SetInvite(user: User | null) {
        this.invite = user;
        this.SendNet("Invite", (user && user.GetNick()) || "");
    }

    GetInvite() {
        return this.invite;
    }

    async UpdateNick(nick: string) {
        this.nick = nick;
        const dataBase = await retreiveDataBase();
        await dataBase.query(`UPDATE "users" SET "nick" = $1 WHERE "id" = $2;`, [nick, this.id]);
        this.Broadcast("UpdateNick", { id: this.id, nick: nick });
        await this.userManager.messageManager.UpdateNameMessages(this.id, nick);
    }
}

interface UsersAndTokens {
    users: UserDatabaseType[];
    tokens: TokenType[];
}

class UserManager {
    private users: { [key: number]: User } = {};
    private tokens: { [key: string]: number } = {};
    public readonly CLogger = new Logger("UserManager");
    public readonly channelManager: ChannelManager;
    public netsManager: NetsManager;
    constructor(@Inject(ChannelManager) channelManager: ChannelManager, @Inject(MessageManager) public messageManager: MessageManager) {
        this.Log("Initialize");
        retreiveUsers().then(({ users, tokens }: UsersAndTokens) => {
            for (let i = 0; i < users.length; i++) {
                this.users[users[i].id] = new User(users[i].id, users[i].nick, this);
                this.users[users[i].id].SetAuth(users[i].auth, true);
            }
            for (let i = 0; i < users.length; i++) {
                if (users[i].friends) 
                    this.users[users[i].id].FetchFriends(channelManager, JSON.parse(users[i].friends));
                if (users[i].blocked) 
                    this.users[users[i].id].FetchBlocked(JSON.parse(users[i].blocked));
            }
            for (let i = 0; i < tokens.length; i++) {
                this.tokens[tokens[i].session] = tokens[i].id;
            }
            channelManager.SetUserManager(this);
            messageManager.SetUserManager(this);
            this.Log(`Initialize with ${users.length} users`);
        });

        this.channelManager = channelManager;
    }

    GetUser(id: number): User | undefined {
        return this.users[id];
    }

    ValidToken(token: string): number | undefined {
        return this.tokens[token]
    }

    GetUserByToken(token: string): User {
        return this.users[this.tokens[token]];
    }

    ParseUser(id: number) {
        return this.users[id].Parse()
    }

    Log(log: string): void {
        this.CLogger.log(log);
    }

    GetUserByNick(nick: string): User | false {
        for (let key in this.users) {
            if (this.users[key].GetNick() === nick) {
                return this.users[key];
            }
        }
        return false;
    }

    RegisterUser(id: number, nick: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            retreiveDataBase().then((dataBase) => {
                dataBase.query(`INSERT INTO "users" ("id", "nick", "register") VALUES ($1, $2, $3);`, [id, nick, true]).then(() => {
                    this.users[id] = new User(id, nick, this);
                    resolve(id);
                }).catch((error) => {
                    reject(error);
                });
            }).catch((error) => {
                reject(error);
            });
        });
    }

    AddUser(token: string, id: number) {
        return new Promise<number>((resolve, reject) => {
            retreiveDataBase().then((dataBase) => {
                dataBase.query(`INSERT INTO "sessions" ("session", "id") VALUES ($1, $2);`, [token, id]).then(() => {
                    this.tokens[token] = id;
                    resolve(id);
                }).catch((error) => {
                    reject(error);
                });
            }).catch((error) => {
                reject(error);
            });
        });
    }
    // Stauts > 0 = connected
    GetUsersConnected(): User[] {
        let users = [];
        for (let key in this.users) {
            if (this.users[key].GetStatus() > 0) {
                users.push(this.users[key]);
            }
        }
        return users;
    }

    async Generate2FA(user: User): Promise<string> {
        const formattedKey = authenticator.generateKey();
        const url = authenticator.generateTotpUri(formattedKey, user.GetID(), "Transendance", 'SHA1', 6, 30);
        user.SetTempAuth(formattedKey);
        user.SendNet("Auth", url)
        return url;
    }

    async Enable2FA(user: User, formattedKey: string): Promise<void> {
        const dataBase = await retreiveDataBase();
        await dataBase.query(`UPDATE "users" SET "auth" = $1 WHERE "id" = $2;`, [formattedKey, user.GetID()]);

        user.SetAuth(formattedKey);
        user.SetTempAuth("");
        user.SendNet("AuthStatus", true)
    };

    async Disable2FA(user: User): Promise<void> {
        const dataBase = await retreiveDataBase();
        await dataBase.query(`UPDATE "users" SET "auth" = $1 WHERE "id" = $2;`, [null, user.GetID()]);
        user.SetAuth(null);
        user.SendNet("AuthStatus", false)
    }

    SetNetManager(netsManager: NetsManager) {
        this.netsManager = netsManager;
    }

    Broadcast(net: string, data: any) {
        this.netsManager.Broadcast(net, data);
    }
}

function retreiveUsers() {
    return new Promise((resolve, reject) => {
        retreiveDataBase().then((dataBase) => {
            dataBase.query(`SELECT * FROM "users";`).then((result) => {
                const users = result.rows as [UserDatabaseType];
                dataBase.query(`SELECT * FROM "sessions"`).then((res) => {
                    const tokens = res.rows as [TokenType];
                    resolve({ users, tokens });
                });

            }).catch((error) => {
                reject(error);
            });
        }).catch((error) => {
            reject(error);
        });
    });
}

export { retreiveUsers, User, UserManager };