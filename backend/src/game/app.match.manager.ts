const left = -1;
const right = 1;
const height = 328;
const width = 748;
const grid = 15;
const paddleHeight = grid * 5;
const maxPaddleY = height - paddleHeight;
const paddleSpeed = 3;
const ballSpeed = 2;
const gameModes = 2;
const leftPaddleToplimit = {
	x: 0.8111595 * ballSpeed,
	y: -1.1584559 * ballSpeed,
}
const leftPaddleBottomlimit = {
	x: 0.8111595 * ballSpeed,
	y: 1.1584559 * ballSpeed,
}
const rightPaddleToplimit = {
	x: -0.8111595 * ballSpeed,
	y: -1.1584559 * ballSpeed,
}
const rightPaddleBottomlimit = {
	x: -0.8111595 * ballSpeed,
	y: 1.1584559 * ballSpeed,
}

import { Logger } from "@nestjs/common";
import { User } from "../user/app.user.manager";
import { retreiveDataBase } from "src/app.database";

var nTotalMatches = 0;

const Gamemode = [
	{
		nMultiSpeedBall: 1,
		nMultiPaddleSpeed: 1,
		gameTime: 100,
	},
	{
		nMultiSpeedBall: 2,
		nMultiPaddleSpeed: 2,
		gameTime: 50,
	}
]

class Match {
	private log = new Logger("Match");
	private id: number;
	private player1: User;
	private player2: User;
	private spectators: User[] = [];
	private leftPaddle = { "y": height / 2 - paddleHeight / 2 };
	private rightPaddle = { "y": height / 2 - paddleHeight / 2 };
	private gameStarted = false;
	private matchManager: MatchManager;
	private acceleration = 1.00;
	private type: number = 0;
	private isStarting: boolean = false;
	private gameData = {
		id: "",
		rightPaddle: {
			y: 0,
		},
		leftPaddle: {
			y: 0,
		},
		ball: {
			x: width / 2,
			y: height / 2,
			speedX: ballSpeed,
			speedY: ballSpeed,
		},
		score: {
			left: 0,
			right: 0,
		}
	}
	private tickTimer: NodeJS.Timeout;
	private endTimer: NodeJS.Timeout;
	private endTime: number = 0;
	private GameSpecatorInfo: { time: number, userID1: number, userID2: number, nick1: string, nick2: string, StartTimer?: number | null, type: number } = { time: 0, userID1: 0, userID2: 0, nick1: "", nick2: "", StartTimer: null, type: 0 };

	constructor(id: number, player1: User, matchManager: MatchManager, type: number) {
		this.type = type;
		this.id = id;
		this.player1 = player1;
		this.tickTimer = setInterval(() => {
			if (this.gameStarted)
				this.update();
		}, 1000 / 60);
		this.matchManager = matchManager;
	}

	isLeftFrom(a: { x: number, y: number }, b: { x: number, y: number }) {
		var dot = a.x * b.y + -a.y * b.x;
		return dot > 0;
	}

	rotation(angle: number) {
		let x = this.gameData.ball.speedX;
		let y = this.gameData.ball.speedY;
		this.gameData.ball.speedX = x * Math.cos(angle) - y * Math.sin(angle);
		this.gameData.ball.speedY = x * Math.sin(angle) + y * Math.cos(angle);
	}

	ballRotationFromHittingPaddle(paddle: { y: number }) {
		let side = this.gameData.ball.speedX > 0 ? 1 : -1;
		let paddleCenter = paddle.y + paddleHeight / 2;
		let ballCenter = this.gameData.ball.y;
		let angle = (ballCenter - paddleCenter) / (paddleHeight / 2) * side * (Math.PI / 4 + Math.PI / 18);
		
		this.rotation(angle);
		if(side === left && this.gameData.ball.speedY < 0) {

			if(!this.isLeftFrom({x: this.gameData.ball.speedX, y: this.gameData.ball.speedY}, {x:rightPaddleToplimit.x, y: rightPaddleToplimit.y})) {
				this.gameData.ball.speedX = rightPaddleToplimit.x;
				this.gameData.ball.speedY = rightPaddleToplimit.y;
			}
		}
		else if(this.gameData.ball.speedX < 0 && this.gameData.ball.speedY > 0) {
			if(this.isLeftFrom({x: this.gameData.ball.speedX, y: this.gameData.ball.speedY}, {x:rightPaddleBottomlimit.x, y: rightPaddleBottomlimit.y})) {
				this.gameData.ball.speedX = rightPaddleBottomlimit.x;
				this.gameData.ball.speedY = rightPaddleBottomlimit.y;
			}
		}
		else if(this.gameData.ball.speedX > 0 && this.gameData.ball.speedY < 0) {
			if(this.isLeftFrom({x: this.gameData.ball.speedX, y: this.gameData.ball.speedY}, {x:leftPaddleToplimit.x, y: leftPaddleToplimit.y})) {
				this.gameData.ball.speedX = leftPaddleToplimit.x;
				this.gameData.ball.speedY = leftPaddleToplimit.y;
			}
		}
		else if(this.gameData.ball.speedX > 0 && this.gameData.ball.speedY > 0) {
			if(!this.isLeftFrom({x: this.gameData.ball.speedX, y: this.gameData.ball.speedY}, {x:leftPaddleBottomlimit.x, y: leftPaddleBottomlimit.y})) {
				this.gameData.ball.speedX = leftPaddleBottomlimit.x;
				this.gameData.ball.speedY = leftPaddleBottomlimit.y;
			}
			
		}
	}

	updatePaddle(player: User) {
		let paddle = player == this.player1 ? this.leftPaddle : this.rightPaddle;
		let inputs = player.GetInputs();
		if (inputs.up) { paddle.y -= (paddleSpeed * Gamemode[this.type].nMultiPaddleSpeed); }
		if (inputs.down) { paddle.y += (paddleSpeed * Gamemode[this.type].nMultiPaddleSpeed); }
		if (paddle.y < grid * 1.5) { paddle.y = grid * 1.5; }
		else if (paddle.y > maxPaddleY - grid * 1.5) { paddle.y = maxPaddleY - grid * 1.5; }
	}

	updateBall() {
		// init vars
		let ball = this.gameData.ball;
		let leftPaddle = this.leftPaddle;
		let rightPaddle = this.rightPaddle;

		// has the ball hit a paddle ?
		let leftPaddleHit = ball.x - grid / 2 < grid && ball.y > leftPaddle.y && ball.y < leftPaddle.y + paddleHeight;
		let rightPaddleHit = ball.x + grid / 2 > width - grid && ball.y >= rightPaddle.y && ball.y <= rightPaddle.y + paddleHeight;
		if (leftPaddleHit && this.gameData.ball.speedX < 0 || rightPaddleHit && this.gameData.ball.speedX > 0) {
			this.gameData.ball.speedX *= -1.00;
			this.ballRotationFromHittingPaddle(leftPaddleHit ? leftPaddle : rightPaddle);
			this.acceleration += 0.1;
		}

		// has a player scored ?
		if (ball.x < 0) {
			this.gameData.score.right++;
			ball.speedX = -ballSpeed;
			ball.speedY = ballSpeed;
			ball.x = width / 2;
			ball.y = height / 2;
			this.player2.SetScore(this.gameData.score.right);
			this.SendNet("Goal", "");
			this.acceleration = 1;

		} else if (ball.x > width) {
			this.gameData.score.left++;
			ball.speedX = -ballSpeed;
			ball.speedY = ballSpeed;
			ball.x = width / 2;
			ball.y = height / 2;
			this.player1.SetScore(this.gameData.score.left);
			this.SendNet("Goal", "");
			this.acceleration = 1;
		}

		// has the ball hit a wall ?
		if (ball.y < 0 + grid / 2 && this.gameData.ball.speedY < 0 || ball.y > height - grid / 2 && this.gameData.ball.speedY > 0) {
			this.gameData.ball.speedY *= -1;
		}

		// move the ball
		ball.x += this.gameData.ball.speedX * this.acceleration * Gamemode[this.type].nMultiSpeedBall;
		ball.y += this.gameData.ball.speedY * this.acceleration * Gamemode[this.type].nMultiSpeedBall;
	}


	update() {
		if (this.player1 && this.player2) {
			this.updatePaddle(this.player1);
			this.updatePaddle(this.player2);
			this.updateBall();
			this.gameData.leftPaddle.y = this.leftPaddle.y;
			this.gameData.rightPaddle.y = this.rightPaddle.y;
			this.gameData.score.left = this.player1.GetScore();
			this.gameData.score.right = this.player2.GetScore()
			this.SendNet('gameData', this.gameData);
		}
	}

	SendNet(event: string, data: any) {
		this.player1.SendNet(event, data);
		this.player2.SendNet(event, data);
		for (let spectator of this.spectators) {
			spectator.SendNet(event, data);
		}
	}

	getPlayer(id: number) {
		if (this.player1.GetID() == id) {
			return this.player1;
		} else if (this.player2.GetID() == id) {
			return this.player2;
		}
		return null;
	}

	getOpponent(player: User) {
		return player == this.player1 ? this.player2 : this.player1;
	}

	setOpponent(player: User) {
		if (this.player1 == null) {
			this.player1 = player;
		} else if (this.player2 == null) {
			this.player2 = player;
		}
	}

	GetIsStarting() {
		return this.isStarting;
	}

	getGameData() {
		return this.gameData;
	}

	setGameStarted() {
		this.endTime = Date.now() + Gamemode[this.type].gameTime * 1000 + 3000;
		this.player1.SetScore(0);
		this.player2.SetScore(0);

		this.player1.SetStatus(4)
		this.player2.SetStatus(4)

		this.GameSpecatorInfo = {
			time: this.endTime,
			userID1: this.player1.GetID(),
			userID2: this.player2.GetID(),
			nick1: this.player1.GetNick(),
			nick2: this.player2.GetNick(),
			type: this.type,
		}
		this.SendNet("StartGame", this.GameSpecatorInfo);
		this.isStarting = true;

		setTimeout(() => {
			this.gameStarted = true;
			this.GameSpecatorInfo.StartTimer = -1;
			this.endTimer = setTimeout(async () => {
				const winner = this.player1.GetScore() > this.player2.GetScore() ? true : false;
				this.player1.AddHistory(winner, this.player2, this.player1.GetScore(), this.player2.GetScore());
				this.player2.AddHistory(!winner, this.player1, this.player2.GetScore(), this.player1.GetScore());

				nTotalMatches++;

				this.player1.SetStatus(1)
				this.player2.SetStatus(1)

				this.SendNet("EndGame", false);

				this.player1.SendNet("NewHistory", await this.player1.RetreiveHistory());
				this.player2.SendNet("NewHistory", await this.player2.RetreiveHistory());
				this.matchManager.RemoveMatch(this);
			}, Gamemode[this.type].gameTime * 1000);
		}, 3000);
	}

	GetGameStarted() {
		return this.gameStarted;
	}

	AddSpectator(user: User) {
		this.spectators.push(user);
		user.SendNet("StartGame", this.GameSpecatorInfo);
		user.SetSpectate(this)
	}

	RemoveSpectator(user: User) {
		let index = this.spectators.indexOf(user);
		this.spectators[index].SetSpectate(null);
		if (index > -1) {
			this.spectators.splice(index, 1);
		}
	}

	RemoveMatch() {
		clearInterval(this.tickTimer);
		clearTimeout(this.endTimer);
		this.RemoveAllSpectators();
		this.RemovePlayers();
	}

	RemoveAllSpectators() {
		for (let spectator of this.spectators) {
			spectator.SetSpectate(null);
		}
		this.spectators = [];
	}

	RemovePlayers() {
		if (this.player1) {
			this.player1.SetMatchMaking(false);
			this.player1.SetMatch(null);
			this.player1 = null;
		}
		if (this.player2) {
			this.player2.SetMatchMaking(false);
			this.player2.SetMatch(null);
			this.player2 = null;
		}
	}

	GetGameSpecatorInfo() {
		return this.GameSpecatorInfo;
	}

	GetType() {
		return this.type;
	}
}

export function GetTotalMatch() {
	return nTotalMatches;
}

class MatchManager {
	private lastId: number = 0;
	private matches: Match[][] = [
		[],
		[],
	];
	private lastMatch: Match[] = [];
	private CLogger = new Logger("MatchManager");

	constructor() {
		console.log('MatchManager created');

		const dataBase = retreiveDataBase().then((dataBase) => {
			nTotalMatches = 0;
			dataBase.query(`SELECT COUNT(*) FROM "history";`, (err, result) => {
				if (err) {
					console.log(err);
				} else {
					nTotalMatches = (result.rows[0].count) / 2;
				}
			});
		});
	}

	Log(msg: string) {
		this.CLogger.log(msg);
	}

	createMatch(player1: User, type: number, updateLastMatch: boolean = true) {
		let match = new Match(this.lastId, player1, this, type);
		this.matches[type].push(match);
		this.lastId++;
		if (updateLastMatch) {
			this.lastMatch[type] = match;
		}
		return match;
	}

	deleteMatch(id: number, type: number) {
		if (id < 0 || id >= this.matches[type].length) {
			return;
		}
		this.matches[type][id].RemoveMatch();
		const match = this.matches[type].splice(id, 1)[0];
		if (match == this.lastMatch[type]) {
			this.lastMatch[type] = null;
		}
	}

	RemoveMatch(match: Match) {
		let index = this.matches[match.GetType()].indexOf(match);
		this.deleteMatch(index, match.GetType());
	}

	matchMaking(user: User, leave: boolean, type?: number) {
		if (leave) {
			user.SetStatus(1)
			user.SetMatchMaking(false);
			let match = user.GetMatch();
			if (match) {
				this.RemoveMatch(match);
			}
			this.Log(`User ${user.GetID()} left matchmaking`);
			return;
		}

		if (type == null) {
			this.Log(`User ${user.GetID()} tried to join matchmaking without type`);
			return;
		}
		user.SetMatchMaking(true);
		if (this.lastMatch[type]) {
			this.lastMatch[type].setOpponent(user);
			user.SetMatch(this.lastMatch[type]);
			this.lastMatch[type].setGameStarted();
			this.lastMatch[type] = null;
			return true;
		}
		this.lastMatch[type] = this.createMatch(user, type);
		user.SetMatch(this.lastMatch[type]);
		user.SetStatus(6)

		return false;
	}

	getMatch(player: User, type: number) {
		for (let i = 0; i < this.matches[type].length; i++) {
			if (this.matches[type][i].getOpponent(player) != null) {
				return this.matches[type][i];
			}
		}
	}

	getMatches() {
		return this.matches;
	}
}

export { MatchManager, Match };