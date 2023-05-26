import { Controller, Get, Param, Req, Post, Body, Put, Delete, Request, Res, OnApplicationBootstrap, Injectable, Redirect, Query, Inject } from '@nestjs/common';
import { retreiveUsers, User, UserManager } from './app.user.manager';
import { GetTotalMatch } from 'src/game/app.match.manager';

const axios = require("axios");

async function getUserInfo(token) {
	let res = await axios.get("https://api.intra.42.fr/v2/me", {
		headers: {
			Authorization: `Bearer ${token}`
		}
	})
	return res.data;
}

const charList = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function generateRandomToken(userManager: UserManager) {
	let token = "";
	for (let i = 0; i < 50; i++) {
		token += charList[Math.floor(Math.random() * charList.length)];
	}
	if (userManager.ValidToken(token)) {
		return generateRandomToken(userManager);
	}
	return token;
}

@Controller("user")
@Injectable()
export class UserController implements OnApplicationBootstrap {
    constructor(@Inject(UserManager) private userManager: UserManager) {}

    onApplicationBootstrap() {
        
    }

    @Get("connected")
	@Redirect(process.env.IP + process.env.PORT_FRONT, 302)
	async getConnected(@Query("code") code, @Res({ passthrough: true }) response, @Req() request) {
		if (request.MUser.IsRegister()) {
            response.status(200).send({statusCode: 200, message: "OK"});
            return;
		}
		if (!code) {
            response.status(401).send({statusCode: 400, message: "Bad request"});
			return;
		}
		try {
			let res = await axios.post("https://api.intra.42.fr/oauth/token", {
				grant_type: "authorization_code",
				client_id: process.env.CLIENT_KEY,
				client_secret: process.env.SECRET_KEY,
				code: code,
				redirect_uri: process.env.IP + process.env.PORT_BACK + "/user/connected",
			})

			const user = await getUserInfo(res.data.access_token);
			const token = generateRandomToken(this.userManager);
			this.userManager.AddUser(token, user.id)
			response.cookie("session", token, {httpOnly: true});
            return;
		} catch(err) {
            return {statusCode: 401, message: "Unauthorized"}
		}
	}

    @Post("me")
	async getMe(@Req() req, @Res() res)  {
        if (!req.MUser.IsRegister42()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }
        if (req.MUser.CanAction()) {
            res.status(200).send(await req.MUser.Parse());
        } else {
            console.log("User " + req.MUser.GetID() + " is not connected")
            return res.status(200).send({
                id: req.MUser.GetID(),
                isConnected: true
            })
        }
	}

    @Get("fetch/:id")
    async getUser(@Param("id") id: number, @Res() res) {
        if (this.userManager.GetUser(id)) {
            res.status(200).send({statusCode: 200, message: "OK", user: await this.userManager.ParseUser(id)}); 
            return
        }
        res.status(404).send({statusCode: 404, message: "User not found"});
    }

    @Get("stats/:id")
    async getStats(@Param("id") id: number, @Res() res) {
        const user = this.userManager.GetUser(id);
        if (user) {
            res.status(200).send({statusCode: 200, message: "OK", history: await user.RetreiveHistory(), totalMatch: GetTotalMatch()}); 
            return
        }
        res.status(404).send({statusCode: 404, message: "User not found"});
    }

    @Post("register")
	async registerUser(@Body() body, @Req() req, @Res({ passthrough: true }) res): Promise<any> {
		if (!req.MUser.IsRegister42() || req.MUser.IsRegister()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
			return
		}
		
		const nick = body.nick;
        if (!nick) {
            res.status(400).send({statusCode: 400, message: "Invalid nick"});
            return
        } else if (this.userManager.GetUserByNick(nick)) {
            res.status(400).send({statusCode: 400, message: "Nick already taken"});
            return
        }
        await this.userManager.RegisterUser(req.MConnected, nick);
        res.status(200).send({statusCode: 200, message: "OK"});
	}

    //Update nick
    @Post("update")
    async UpdateUser(@Body() body, @Req() req: {MUser: User}, @Res() res) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }

        const nick = body.nick;
        if (!nick) {
            res.status(400).send({statusCode: 400, message: "Invalid nick"});
            return
        } else if (this.userManager.GetUserByNick(nick)) {
            res.status(400).send({statusCode: 400, message: "Nick already taken"});
            return
        }

        await req.MUser.UpdateNick(nick);
        res.status(200).send({statusCode: 200, message: "OK"});
    }


    @Post("add")
    async AddUser(@Body() body, @Res() res, @Req() req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        } else if (!body.nick) {
            res.status(400).send({statusCode: 400, message: "Invalid nick"});
            return
        }

        const friend = this.userManager.GetUserByNick(body.nick) as User;
        if (!friend || !friend.CanAction()) {
            res.status(404).send({statusCode: 404, message: "User not found"});
            return
        } else if (friend.GetID() == req.MUser.GetID()) {
            res.status(400).send({statusCode: 400, message: "You can't add yourself"});
            return
        } else if (req.MUser.HasFriend(friend)) {
            res.status(400).send({statusCode: 400, message: "User already friend"});
            return
        }
        await req.MUser.AddFriend(friend);
        this.userManager.Log("User " + req.MUser.GetNick() + " add " + friend.GetNick());
        res.status(200).send({statusCode: 200, message: "OK"});
    }

    @Post("remove")
    async RemoveUser(@Body() body, @Res() res, @Req() req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        } else if (!body.id) {
            res.status(400).send({statusCode: 400, message: "Invalid id"});
            return
        }

        const friend = this.userManager.GetUser(body.id);
        if (!friend || !friend.CanAction()) {
            res.status(404).send({statusCode: 404, message: "User not found"});
            return
        } else if (!req.MUser.HasFriend(friend)) {
            res.status(400).send({statusCode: 400, message: "User not friend"});
            return
        }
        await req.MUser.RemoveFriend(friend);
        this.userManager.Log("User " + req.MUser.GetNick() + " remove " + friend.GetNick());
        res.status(200).send({statusCode: 200, message: "OK"});
    }

    @Post("accept")
    async AcceptUser(@Body() body, @Res() res, @Req() req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        } else if (!body.id) {
            res.status(400).send({statusCode: 400, message: "Invalid id"});
            return
        }

        const friend = this.userManager.GetUser(body.id);
        if (!friend || !friend.CanAction()) {
            res.status(404).send({statusCode: 404, message: "User not found"});
            return
        } else if (!req.MUser.HasFriend(friend)) {
            res.status(400).send({statusCode: 400, message: "User not friend"});
            return
        } else if (!req.MUser.CanAcceptFriend(friend)) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }
        await req.MUser.AccepteFriend(friend);
        this.userManager.Log("User " + req.MUser.GetNick() + " accept " + friend.GetNick());
        res.status(200).send({statusCode: 200, message: "OK"});
    }

    @Post("block")
    async BlockUser(@Body() body, @Res() res, @Req() req: {MUser: User}) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        } else if (!body.id) {
            res.status(400).send({statusCode: 400, message: "Invalid id"});
            return
        }

        const friend = this.userManager.GetUser(body.id);
        if (!friend || !friend.CanAction()) {
            res.status(404).send({statusCode: 404, message: "User not found"});
            return
        } else if (!req.MUser.HasFriend(friend)) {
            res.status(400).send({statusCode: 400, message: "User not friend"});
            return
        }
        await req.MUser.BlockUser(friend, !req.MUser.IsBlocked(friend))
        this.userManager.Log("User " + req.MUser.GetNick() + " block " + friend.GetNick() + " : " + req.MUser.IsBlocked(friend));
        res.status(200).send({statusCode: 200, message: "OK"});
    }
}