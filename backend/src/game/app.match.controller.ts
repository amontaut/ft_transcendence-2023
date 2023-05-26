import { Controller, Post, Req, Res, Inject, Body } from '@nestjs/common';
import { MatchManager } from './app.match.manager';
import { UserManager, User } from 'src/user/app.user.manager';

@Controller("game")
export class GameController {
    constructor(@Inject(MatchManager) private matchManager: MatchManager, @Inject(UserManager) private userManager: UserManager) {}
    @Post("matchmaking")
	matchMaking(@Req() req: {MUser: User}, @Res() res, @Body() body) {
		if (!req.MUser.CanAction()) {
			res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
		}
		
		if (req.MUser.GetSpectate()) {
			req.MUser.GetSpectate().RemoveSpectator(req.MUser);
			res.status(200).send({statusCode: 200, message: "OK", status: 0});
		} else if (req.MUser.GetMatchMaking()) {
			if (req.MUser.GetMatch() && req.MUser.GetMatch().GetGameStarted()) {
				res.status(400).send({statusCode: 400, message: "Bad Request"});
				return
			}
			this.matchManager.matchMaking(req.MUser, true);
			res.status(200).send({statusCode: 200, message: "OK", status: 0});
		} else {
			if (body.type == null) {
				res.status(400).send({statusCode: 400, message: "Bad Request"});
				return
			}
			body.type = parseInt(body.type);
			if (body.type < 0 || body.type > 2) {
				res.status(400).send({statusCode: 400, message: "Bad Request"});
				return
			}
			const started = this.matchManager.matchMaking(req.MUser, false, body.type);
			res.status(200).send({statusCode: 200, message: "OK", status: started && 4 || 1});
		}
	}

	@Post("spectate")
	spectate(@Req() req, @Res() res, @Body() body) {
		if (!req.MUser.CanAction()) {
			res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
		}
		const userID = body.id;
		if (!userID) {
			res.status(400).send({statusCode: 400, message: "Bad Request"});
			return
		}

		if (req.MUser.GetMatchMaking() || req.MUser.GetSpectate() || req.MUser.GetMatch() || req.MUser.IsPlaying()) {
			res.status(400).send({statusCode: 400, message: "You are already in/spectating a match"});
			return
		}

		const user = this.userManager.GetUser(userID);
		if (!user) {
			res.status(404).send({statusCode: 404, message: "The user was not found"});
			return
		}
		const match = user.GetMatch();
		if (!match) {
			res.status(400).send({statusCode: 400, message: "The user is not in a match"});
			return
		} else if (req.MUser.GetMatchMaking() || req.MUser.GetSpectate()) {
			res.status(400).send({statusCode: 400, message: "You are already in/spectating a match"});
			return
		}
		match.AddSpectator(req.MUser);
		res.status(200).send({statusCode: 200, message: "OK"});
	}

	@Post("invite")
	invite(@Req() req: {MUser: User}, @Res() res, @Body() body) {
		if (!req.MUser.CanAction()) {
			res.status(401).send({statusCode: 401, message: "Unauthorized"});
			return
		} else if (!req.MUser.CanInvite()) {
			res.status(400).send({statusCode: 400, message: "You can't invite someone you are already in/spectating a match"});
			return
		}
		const userID = body.id;
		if (!userID) {
			res.status(400).send({statusCode: 400, message: "Bad Request"});
			return
		}

		const user = this.userManager.GetUser(userID);
		if (!user) {
			res.status(404).send({statusCode: 404, message: "Not Found"});
			return
		} else if (!user.CanInvite()) {
			res.status(400).send({statusCode: 400, message: "The user is already in/spectating a match"});
			return
		} else if (user.GetInvite()) {
			res.status(400).send({statusCode: 400, message: "The user is already invited"});
			return
		}
		user.SetInvite(req.MUser);
		res.status(200).send({statusCode: 200, message: "OK"});
	}

	@Post("accept")
	accept(@Req() req: {MUser: User}, @Res() res) {
		if (!req.MUser.CanAction()) {
			res.status(401).send({statusCode: 401, message: "Unauthorized"});
			return
		}
		const user = req.MUser.GetInvite();
		if (!user) {
			res.status(400).send({statusCode: 400, message: "Bad Request"});
			return
		} else if (!user.CanInvite() || !req.MUser.CanInvite()) {
			req.MUser.SetInvite(null);
			res.status(400).send({statusCode: 400, message: "This invite is no longer valid"});
			return
		}
		req.MUser.SetInvite(null);

		const match = this.matchManager.createMatch(user, 0, false);
		match.setOpponent(req.MUser);
		user.SetMatch(match);
		req.MUser.SetMatch(match);
		match.setGameStarted();

		res.status(200).send({statusCode: 200, message: "OK"});
	}

	@Post("decline")
	decline(@Req() req: {MUser: User}, @Res() res) {
		if (!req.MUser.CanAction()) {
			res.status(401).send({statusCode: 401, message: "Unauthorized"});
			return
		}
		const user = req.MUser.GetInvite();
		if (!user) {
			res.status(400).send({statusCode: 400, message: "No invitation available"});
			return
		}
		req.MUser.SetInvite(null);
		user.SetInvite(null);
		res.status(200).send({statusCode: 200, message: "OK"});
	}
}