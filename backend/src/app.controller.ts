import { Controller, Get, Post, Redirect, Query, Res, Req, Body, StreamableFile, Param, Inject } from "@nestjs/common";
import { MatchManager } from "./game/app.match.manager";
import { User, UserManager } from "./user/app.user.manager";
const path = require('path')
const fs = require('fs')

@Controller()
export class AppController {
	constructor(@Inject(MatchManager) private matchManager: MatchManager, @Inject(UserManager) private userManager: UserManager) {}

	@Get("connect")
	@Redirect()
	getConnect(@Req() request) {
		if (request.MUser.IsRegister()) {
			return {url: process.env.IP + process.env.PORT_FRONT}
		} else {
			return {url: process.env.AUTH_42_REDIRECT_URI}
		}
	}

	@Post("logout")
	logout(@Req() request: {MUser: User}, @Res({ passthrough: true }) response) {
		if (!request.MUser.CanAction()) {
			response.status(401).send({statusCode: 401, message: "Unauthorized"});
			return
		}
		request.MUser.SetStatus(0);
		response.clearCookie("session");
		response.status(200).send({statusCode: 200, message: "OK"});
	}
}