/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var __resourceQuery = "?100";
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
/*globals __resourceQuery */
if (true) {
	var hotPollInterval = +__resourceQuery.slice(1) || 0;
	var log = __webpack_require__(1);

	var checkForUpdate = function checkForUpdate(fromUpdate) {
		if (module.hot.status() === "idle") {
			module.hot
				.check(true)
				.then(function (updatedModules) {
					if (!updatedModules) {
						if (fromUpdate) log("info", "[HMR] Update applied.");
						return;
					}
					__webpack_require__(2)(updatedModules, updatedModules);
					checkForUpdate(true);
				})
				.catch(function (err) {
					var status = module.hot.status();
					if (["abort", "fail"].indexOf(status) >= 0) {
						log("warning", "[HMR] Cannot apply update.");
						log("warning", "[HMR] " + log.formatError(err));
						log("warning", "[HMR] You need to restart the application!");
					} else {
						log("warning", "[HMR] Update failed: " + log.formatError(err));
					}
				});
		}
	};
	setInterval(checkForUpdate, hotPollInterval);
} else {}


/***/ }),
/* 1 */
/***/ ((module) => {

var logLevel = "info";

function dummy() {}

function shouldLog(level) {
	var shouldLog =
		(logLevel === "info" && level === "info") ||
		(["info", "warning"].indexOf(logLevel) >= 0 && level === "warning") ||
		(["info", "warning", "error"].indexOf(logLevel) >= 0 && level === "error");
	return shouldLog;
}

function logGroup(logFn) {
	return function (level, msg) {
		if (shouldLog(level)) {
			logFn(msg);
		}
	};
}

module.exports = function (level, msg) {
	if (shouldLog(level)) {
		if (level === "info") {
			console.log(msg);
		} else if (level === "warning") {
			console.warn(msg);
		} else if (level === "error") {
			console.error(msg);
		}
	}
};

/* eslint-disable node/no-unsupported-features/node-builtins */
var group = console.group || dummy;
var groupCollapsed = console.groupCollapsed || dummy;
var groupEnd = console.groupEnd || dummy;
/* eslint-enable node/no-unsupported-features/node-builtins */

module.exports.group = logGroup(group);

module.exports.groupCollapsed = logGroup(groupCollapsed);

module.exports.groupEnd = logGroup(groupEnd);

module.exports.setLogLevel = function (level) {
	logLevel = level;
};

module.exports.formatError = function (err) {
	var message = err.message;
	var stack = err.stack;
	if (!stack) {
		return message;
	} else if (stack.indexOf(message) < 0) {
		return message + "\n" + stack;
	} else {
		return stack;
	}
};


/***/ }),
/* 2 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
module.exports = function (updatedModules, renewedModules) {
	var unacceptedModules = updatedModules.filter(function (moduleId) {
		return renewedModules && renewedModules.indexOf(moduleId) < 0;
	});
	var log = __webpack_require__(1);

	if (unacceptedModules.length > 0) {
		log(
			"warning",
			"[HMR] The following modules couldn't be hot updated: (They would need a full reload!)"
		);
		unacceptedModules.forEach(function (moduleId) {
			log("warning", "[HMR]  - " + moduleId);
		});
	}

	if (!renewedModules || renewedModules.length === 0) {
		log("info", "[HMR] Nothing hot updated.");
	} else {
		log("info", "[HMR] Updated modules:");
		renewedModules.forEach(function (moduleId) {
			if (typeof moduleId === "string" && moduleId.indexOf("!") !== -1) {
				var parts = moduleId.split("!");
				log.groupCollapsed("info", "[HMR]  - " + parts.pop());
				log("info", "[HMR]  - " + moduleId);
				log.groupEnd("info");
			} else {
				log("info", "[HMR]  - " + moduleId);
			}
		});
		var numberIds = renewedModules.every(function (moduleId) {
			return typeof moduleId === "number";
		});
		if (numberIds)
			log(
				"info",
				'[HMR] Consider using the optimization.moduleIds: "named" for module names.'
			);
	}
};


/***/ }),
/* 3 */
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(4);
const app_module_1 = __webpack_require__(5);
const app_service_1 = __webpack_require__(31);
const app_database_1 = __webpack_require__(9);
const app_user_manager_1 = __webpack_require__(12);
const cookieParser = __webpack_require__(32);
const bodyParser = __webpack_require__(33);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        rawBody: true
    });
    app.useGlobalInterceptors(new app_service_1.LoggingInterceptor(app.get(app_user_manager_1.UserManager)));
    app.use(cookieParser());
    app.use(bodyParser.json());
    await (0, app_database_1.retreiveDataBase)();
    app.enableCors({
        origin: process.env.IP + process.env.PORT_FRONT,
        credentials: true
    });
    if (true) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
    await app.listen(8080);
    console.log("Server is running", process.env.IP);
}
bootstrap();


/***/ }),
/* 4 */
/***/ ((module) => {

"use strict";
module.exports = require("@nestjs/core");

/***/ }),
/* 5 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(6);
const app_controller_1 = __webpack_require__(7);
const app_socket_manager_1 = __webpack_require__(19);
const nestjs_form_data_1 = __webpack_require__(23);
const app_avatar_1 = __webpack_require__(24);
const app_channel_controller_1 = __webpack_require__(25);
const app_user_controller_1 = __webpack_require__(26);
const app_match_manager_1 = __webpack_require__(8);
const app_user_manager_1 = __webpack_require__(12);
const app_channel_manager_1 = __webpack_require__(13);
const app_nets_manager_1 = __webpack_require__(22);
const app_message_controller_1 = __webpack_require__(28);
const app_message_manager_1 = __webpack_require__(15);
const app_auth_controller_1 = __webpack_require__(29);
const app_match_controller_1 = __webpack_require__(30);
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_form_data_1.NestjsFormDataModule,
        ],
        controllers: [app_controller_1.AppController, app_avatar_1.AvatarController, app_channel_controller_1.ChannelController, app_user_controller_1.UserController, app_message_controller_1.MessageController, app_auth_controller_1.AuthController, app_match_controller_1.GameController],
        providers: [app_channel_manager_1.ChannelManager, app_user_manager_1.UserManager, app_match_manager_1.MatchManager, app_nets_manager_1.NetsManager, app_message_manager_1.MessageManager, app_socket_manager_1.AppSocket],
    })
], AppModule);
exports.AppModule = AppModule;


/***/ }),
/* 6 */
/***/ ((module) => {

"use strict";
module.exports = require("@nestjs/common");

/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const common_1 = __webpack_require__(6);
const app_match_manager_1 = __webpack_require__(8);
const app_user_manager_1 = __webpack_require__(12);
const path = __webpack_require__(17);
const fs = __webpack_require__(18);
let AppController = class AppController {
    constructor(matchManager, userManager) {
        this.matchManager = matchManager;
        this.userManager = userManager;
    }
    getConnect(request) {
        if (request.MUser.IsRegister()) {
            return { url: process.env.IP + process.env.PORT_FRONT };
        }
        else {
            return { url: process.env.AUTH_42_REDIRECT_URI };
        }
    }
    logout(request, response) {
        if (!request.MUser.CanAction()) {
            response.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        request.MUser.SetStatus(0);
        response.clearCookie("session");
        response.status(200).send({ statusCode: 200, message: "OK" });
    }
};
__decorate([
    (0, common_1.Get)("connect"),
    (0, common_1.Redirect)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getConnect", null);
__decorate([
    (0, common_1.Post)("logout"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "logout", null);
AppController = __decorate([
    (0, common_1.Controller)(),
    __param(0, (0, common_1.Inject)(app_match_manager_1.MatchManager)),
    __param(1, (0, common_1.Inject)(app_user_manager_1.UserManager)),
    __metadata("design:paramtypes", [typeof (_a = typeof app_match_manager_1.MatchManager !== "undefined" && app_match_manager_1.MatchManager) === "function" ? _a : Object, typeof (_b = typeof app_user_manager_1.UserManager !== "undefined" && app_user_manager_1.UserManager) === "function" ? _b : Object])
], AppController);
exports.AppController = AppController;


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Match = exports.MatchManager = exports.GetTotalMatch = void 0;
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
};
const leftPaddleBottomlimit = {
    x: 0.8111595 * ballSpeed,
    y: 1.1584559 * ballSpeed,
};
const rightPaddleToplimit = {
    x: -0.8111595 * ballSpeed,
    y: -1.1584559 * ballSpeed,
};
const rightPaddleBottomlimit = {
    x: -0.8111595 * ballSpeed,
    y: 1.1584559 * ballSpeed,
};
const common_1 = __webpack_require__(6);
const app_database_1 = __webpack_require__(9);
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
];
class Match {
    constructor(id, player1, matchManager, type) {
        this.log = new common_1.Logger("Match");
        this.spectators = [];
        this.leftPaddle = { "y": height / 2 - paddleHeight / 2 };
        this.rightPaddle = { "y": height / 2 - paddleHeight / 2 };
        this.gameStarted = false;
        this.acceleration = 1.00;
        this.type = 0;
        this.isStarting = false;
        this.gameData = {
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
        };
        this.endTime = 0;
        this.GameSpecatorInfo = { time: 0, userID1: 0, userID2: 0, nick1: "", nick2: "", StartTimer: null, type: 0 };
        this.type = type;
        this.id = id;
        this.player1 = player1;
        this.tickTimer = setInterval(() => {
            if (this.gameStarted)
                this.update();
        }, 1000 / 60);
        this.matchManager = matchManager;
    }
    isLeftFrom(a, b) {
        var dot = a.x * b.y + -a.y * b.x;
        return dot > 0;
    }
    rotation(angle) {
        let x = this.gameData.ball.speedX;
        let y = this.gameData.ball.speedY;
        this.gameData.ball.speedX = x * Math.cos(angle) - y * Math.sin(angle);
        this.gameData.ball.speedY = x * Math.sin(angle) + y * Math.cos(angle);
    }
    ballRotationFromHittingPaddle(paddle) {
        let side = this.gameData.ball.speedX > 0 ? 1 : -1;
        let paddleCenter = paddle.y + paddleHeight / 2;
        let ballCenter = this.gameData.ball.y;
        let angle = (ballCenter - paddleCenter) / (paddleHeight / 2) * side * (Math.PI / 4 + Math.PI / 18);
        this.rotation(angle);
        if (side === left && this.gameData.ball.speedY < 0) {
            if (!this.isLeftFrom({ x: this.gameData.ball.speedX, y: this.gameData.ball.speedY }, { x: rightPaddleToplimit.x, y: rightPaddleToplimit.y })) {
                this.gameData.ball.speedX = rightPaddleToplimit.x;
                this.gameData.ball.speedY = rightPaddleToplimit.y;
            }
        }
        else if (this.gameData.ball.speedX < 0 && this.gameData.ball.speedY > 0) {
            if (this.isLeftFrom({ x: this.gameData.ball.speedX, y: this.gameData.ball.speedY }, { x: rightPaddleBottomlimit.x, y: rightPaddleBottomlimit.y })) {
                this.gameData.ball.speedX = rightPaddleBottomlimit.x;
                this.gameData.ball.speedY = rightPaddleBottomlimit.y;
            }
        }
        else if (this.gameData.ball.speedX > 0 && this.gameData.ball.speedY < 0) {
            if (this.isLeftFrom({ x: this.gameData.ball.speedX, y: this.gameData.ball.speedY }, { x: leftPaddleToplimit.x, y: leftPaddleToplimit.y })) {
                this.gameData.ball.speedX = leftPaddleToplimit.x;
                this.gameData.ball.speedY = leftPaddleToplimit.y;
            }
        }
        else if (this.gameData.ball.speedX > 0 && this.gameData.ball.speedY > 0) {
            if (!this.isLeftFrom({ x: this.gameData.ball.speedX, y: this.gameData.ball.speedY }, { x: leftPaddleBottomlimit.x, y: leftPaddleBottomlimit.y })) {
                this.gameData.ball.speedX = leftPaddleBottomlimit.x;
                this.gameData.ball.speedY = leftPaddleBottomlimit.y;
            }
        }
    }
    updatePaddle(player) {
        let paddle = player == this.player1 ? this.leftPaddle : this.rightPaddle;
        let inputs = player.GetInputs();
        if (inputs.up) {
            paddle.y -= (paddleSpeed * Gamemode[this.type].nMultiPaddleSpeed);
        }
        if (inputs.down) {
            paddle.y += (paddleSpeed * Gamemode[this.type].nMultiPaddleSpeed);
        }
        if (paddle.y < grid * 1.5) {
            paddle.y = grid * 1.5;
        }
        else if (paddle.y > maxPaddleY - grid * 1.5) {
            paddle.y = maxPaddleY - grid * 1.5;
        }
    }
    updateBall() {
        let ball = this.gameData.ball;
        let leftPaddle = this.leftPaddle;
        let rightPaddle = this.rightPaddle;
        let leftPaddleHit = ball.x - grid / 2 < grid && ball.y > leftPaddle.y && ball.y < leftPaddle.y + paddleHeight;
        let rightPaddleHit = ball.x + grid / 2 > width - grid && ball.y >= rightPaddle.y && ball.y <= rightPaddle.y + paddleHeight;
        if (leftPaddleHit && this.gameData.ball.speedX < 0 || rightPaddleHit && this.gameData.ball.speedX > 0) {
            this.gameData.ball.speedX *= -1.00;
            this.ballRotationFromHittingPaddle(leftPaddleHit ? leftPaddle : rightPaddle);
            this.acceleration += 0.1;
        }
        if (ball.x < 0) {
            this.gameData.score.right++;
            ball.speedX = -ballSpeed;
            ball.speedY = ballSpeed;
            ball.x = width / 2;
            ball.y = height / 2;
            this.player2.SetScore(this.gameData.score.right);
            this.SendNet("Goal", "");
            this.acceleration = 1;
        }
        else if (ball.x > width) {
            this.gameData.score.left++;
            ball.speedX = -ballSpeed;
            ball.speedY = ballSpeed;
            ball.x = width / 2;
            ball.y = height / 2;
            this.player1.SetScore(this.gameData.score.left);
            this.SendNet("Goal", "");
            this.acceleration = 1;
        }
        if (ball.y < 0 + grid / 2 && this.gameData.ball.speedY < 0 || ball.y > height - grid / 2 && this.gameData.ball.speedY > 0) {
            this.gameData.ball.speedY *= -1;
        }
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
            this.gameData.score.right = this.player2.GetScore();
            this.SendNet('gameData', this.gameData);
        }
    }
    SendNet(event, data) {
        this.player1.SendNet(event, data);
        this.player2.SendNet(event, data);
        for (let spectator of this.spectators) {
            spectator.SendNet(event, data);
        }
    }
    getPlayer(id) {
        if (this.player1.GetID() == id) {
            return this.player1;
        }
        else if (this.player2.GetID() == id) {
            return this.player2;
        }
        return null;
    }
    getOpponent(player) {
        return player == this.player1 ? this.player2 : this.player1;
    }
    setOpponent(player) {
        if (this.player1 == null) {
            this.player1 = player;
        }
        else if (this.player2 == null) {
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
        this.player1.SetStatus(4);
        this.player2.SetStatus(4);
        this.GameSpecatorInfo = {
            time: this.endTime,
            userID1: this.player1.GetID(),
            userID2: this.player2.GetID(),
            nick1: this.player1.GetNick(),
            nick2: this.player2.GetNick(),
            type: this.type,
        };
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
                this.player1.SetStatus(1);
                this.player2.SetStatus(1);
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
    AddSpectator(user) {
        this.spectators.push(user);
        user.SendNet("StartGame", this.GameSpecatorInfo);
        user.SetSpectate(this);
    }
    RemoveSpectator(user) {
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
exports.Match = Match;
function GetTotalMatch() {
    return nTotalMatches;
}
exports.GetTotalMatch = GetTotalMatch;
class MatchManager {
    constructor() {
        this.lastId = 0;
        this.matches = [
            [],
            [],
        ];
        this.lastMatch = [];
        this.CLogger = new common_1.Logger("MatchManager");
        console.log('MatchManager created');
        const dataBase = (0, app_database_1.retreiveDataBase)().then((dataBase) => {
            nTotalMatches = 0;
            dataBase.query(`SELECT COUNT(*) FROM "history";`, (err, result) => {
                if (err) {
                    console.log(err);
                }
                else {
                    nTotalMatches = (result.rows[0].count) / 2;
                }
            });
        });
    }
    Log(msg) {
        this.CLogger.log(msg);
    }
    createMatch(player1, type, updateLastMatch = true) {
        let match = new Match(this.lastId, player1, this, type);
        this.matches[type].push(match);
        this.lastId++;
        if (updateLastMatch) {
            this.lastMatch[type] = match;
        }
        return match;
    }
    deleteMatch(id, type) {
        if (id < 0 || id >= this.matches[type].length) {
            return;
        }
        this.matches[type][id].RemoveMatch();
        const match = this.matches[type].splice(id, 1)[0];
        if (match == this.lastMatch[type]) {
            this.lastMatch[type] = null;
        }
    }
    RemoveMatch(match) {
        let index = this.matches[match.GetType()].indexOf(match);
        this.deleteMatch(index, match.GetType());
    }
    matchMaking(user, leave, type) {
        if (leave) {
            user.SetStatus(1);
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
        user.SetStatus(6);
        return false;
    }
    getMatch(player, type) {
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
exports.MatchManager = MatchManager;


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.retreiveDataBase = void 0;
const postgres = __webpack_require__(10);
(__webpack_require__(11).config)();
async function retreiveConnectionSQL() {
    const dataBase = new postgres.Client({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_IP,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: process.env.POSTGRES_PORT,
    });
    await dataBase.connect();
    await dataBase.query(`CREATE TABLE IF NOT EXISTS "sessions" (
        "session" CHAR(50) NOT NULL,
        "id" INTEGER NOT NULL
    );`);
    await dataBase.query(`CREATE TABLE IF NOT EXISTS "users" (
        "id" INTEGER NOT NULL,
        "register" BOOLEAN NOT NULL,
        "nick" VARCHAR(50) NOT NULL,
        "friends" TEXT NOT NULL DEFAULT '{}',
        "auth" TEXT NULL,
        "blocked" TEXT NOT NULL DEFAULT '{}'
    );`);
    await dataBase.query(`CREATE TABLE IF NOT EXISTS "history" (
        "id" INTEGER NOT NULL,
        "win" BOOLEAN NOT NULL,
        "date" BIGINT NOT NULL,
        "ennemy" INTEGER NOT NULL,
        "score" INTEGER NOT NULL,
        "ennemyScore" INTEGER NOT NULL
    );`);
    await dataBase.query(`CREATE TABLE IF NOT EXISTS "channels" (
        "id" INTEGER NOT NULL,
        "name" VARCHAR(50) NOT NULL,
        "owner" INTEGER NOT NULL,
        "users" TEXT NOT NULL DEFAULT '{}',
        "password" TEXT NOT NULL DEFAULT '',
        "type" SMALLINT NOT NULL,
        "invite" VARCHAR(50) NOT NULL
    );`);
    await dataBase.query(`CREATE TABLE IF NOT EXISTS "messages" (
        "id" INTEGER NOT NULL,
        "channel" INTEGER NOT NULL,
        "author" INTEGER NOT NULL,
        "nick" VARCHAR(50) NOT NULL,
        "content" TEXT NOT NULL,
        "date" BIGINT NOT NULL
    );`);
    return dataBase;
}
let isFetching = false;
let dataBase;
async function retreiveDataBase() {
    if (!dataBase && !isFetching) {
        isFetching = true;
        return new Promise(async (resolve, reject) => {
            try {
                dataBase = await retreiveConnectionSQL();
                resolve(dataBase);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    else if (dataBase) {
        return dataBase;
    }
    else {
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (dataBase) {
                    clearInterval(interval);
                    resolve(dataBase);
                }
            }, 100);
        });
    }
}
exports.retreiveDataBase = retreiveDataBase;


/***/ }),
/* 10 */
/***/ ((module) => {

"use strict";
module.exports = require("pg");

/***/ }),
/* 11 */
/***/ ((module) => {

"use strict";
module.exports = require("dotenv");

/***/ }),
/* 12 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserManager = exports.User = exports.retreiveUsers = void 0;
const common_1 = __webpack_require__(6);
const app_database_1 = __webpack_require__(9);
const app_channel_manager_1 = __webpack_require__(13);
const app_message_manager_1 = __webpack_require__(15);
const authenticator = __webpack_require__(16);
class FriendUser {
    constructor(id, nick, pending, invite, friend, channel = null) {
        this.status = 0;
        this.channel = null;
        this.id = id;
        this.pending = pending;
        this.invite = invite;
        this.friend = friend;
        this.channel = channel;
    }
    SetPending(pending) {
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
    constructor(id, nick, userManager, connected = true, register = true) {
        this.status = 0;
        this.friends = {};
        this.friendsJSON = {};
        this.stats = {};
        this.history = {};
        this.score = 0;
        this.inputs = { up: false, down: false };
        this.matchmaking = false;
        this.spectate = null;
        this.auth = null;
        this.needAuth = false;
        this.authTimeout = null;
        this.invite = null;
        this.blocked = {};
        this.tempAuth = null;
        this.id = id;
        this.nick = nick;
        this.userManager = userManager;
        this.connected = connected;
        this.register = register;
    }
    HasFriend(friend) {
        return (this.friends[friend.GetID()] !== undefined);
    }
    CanAcceptFriend(friendUser) {
        const friend = this.friends[friendUser.GetID()];
        this.Log(`Accept Friend [${this.GetNick()}](id: ${this.GetID()}) -> [${friendUser.GetNick()}](id: ${friendUser.GetID()})) (invite: ${friend.GetInvite()})`);
        return friend.GetPending() && (friend.GetInvite() !== this.id);
    }
    Log(log) {
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
        let friends = {};
        for (let key in this.friends) {
            const MUser = this.userManager.GetUser(key);
            friends[key] = {
                id: this.friendsJSON[key].id,
                pending: this.friendsJSON[key].pending,
                invite: this.friendsJSON[key].invite,
                status: MUser.GetStatus(),
                channel: this.friendsJSON[key].channel,
                nick: MUser.GetNick(),
            };
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
        };
    }
    async AddFriend(newFriend, self = true, channel = null) {
        const id = newFriend.GetID();
        const newChannel = (self && await this.userManager.channelManager.AddChannel("", 4, 0, "")) || channel;
        if (self) {
            await newChannel.AddUser(this.GetID(), false);
            await newChannel.AddUser(newFriend.GetID(), false);
        }
        this.friendsJSON[id] = {
            id: id,
            pending: true,
            invite: self ? this.id : newFriend.GetID(),
            status: newFriend.GetStatus(),
            channel: newChannel.GetID(),
            nick: newFriend.GetNick(),
        };
        this.friends[id] = new FriendUser(id, newFriend.GetNick(), true, this.friendsJSON[id].invite, this, newChannel.GetID());
        this.Log(`Add Friends [${this.nick}](${this.id}) -> [${newFriend.GetNick()}](${id}) (self: ${self}) (invite: ${this.friendsJSON[id].invite}))`);
        const dataBase = await (0, app_database_1.retreiveDataBase)();
        await dataBase.query("UPDATE users SET friends = $1 WHERE id = $2", [JSON.stringify(this.friendsJSON), this.id]);
        this.SendNet("FriendAdd", this.friendsJSON[id]);
        if (!self)
            return;
        newFriend.AddFriend(this, !self, newChannel);
    }
    async RemoveFriend(friend, self = true) {
        const id = friend.GetID();
        await this.userManager.channelManager.RemoveChannel(this.friendsJSON[id].channel);
        delete this.friends[id];
        delete this.friendsJSON[id];
        const dataBase = await (0, app_database_1.retreiveDataBase)();
        await dataBase.query("UPDATE users SET friends = $1 WHERE id = $2", [JSON.stringify(this.friendsJSON), this.id]);
        this.SendNet("FriendRemove", id);
        if (!self)
            return;
        friend.RemoveFriend(this, !self);
    }
    async AccepteFriend(friend, self = true) {
        const id = friend.GetID();
        this.friends[id].SetPending(false);
        this.friendsJSON[id].pending = false;
        const dataBase = await (0, app_database_1.retreiveDataBase)();
        await dataBase.query("UPDATE users SET friends = $1 WHERE id = $2", [JSON.stringify(this.friendsJSON), this.id]);
        this.SendNet("FriendAccept", id);
        if (!self)
            return;
        friend.AccepteFriend(this, !self);
    }
    async BlockUser(user, block) {
        this.blocked[user.GetID()] = block;
        const dataBase = await (0, app_database_1.retreiveDataBase)();
        await dataBase.query("UPDATE users SET blocked = $1 WHERE id = $2", [JSON.stringify(this.blocked), this.id]);
        this.SendNet("BlockUser", { id: user.GetID(), value: block });
    }
    IsBlocked(user) {
        return this.blocked[user.GetID()] || false;
    }
    SetSocket(socket) {
        this.socket = socket;
    }
    GetSocket() {
        return this.socket;
    }
    IsConnectedSocket() {
        return this.socket && this.socket.connected;
    }
    SendNet(event, args) {
        if (!this.socket || this.socket.disconnected)
            return;
        this.socket.emit("nets", { net: event, args: args });
    }
    Broadcast(net, args) {
        this.userManager.Broadcast(net, args);
    }
    SetStatus(status) {
        if (!this.IsConnectedSocket()) {
            status = 0;
        }
        this.status = status;
        this.Broadcast("Status", { UserID: this.GetID(), Status: status });
    }
    GetStatus() {
        return this.status;
    }
    SetMatch(match) {
        this.match = match;
    }
    GetMatch() {
        return this.match;
    }
    SetScore(score) {
        this.score = score;
    }
    GetScore() {
        return this.score;
    }
    AddScore(score) {
        this.score += score;
    }
    SetInputs(inputs) {
        this.inputs = inputs;
    }
    GetInputs() {
        return this.inputs;
    }
    GetMatchMaking() {
        return this.matchmaking;
    }
    SetMatchMaking(matchmaking) {
        this.matchmaking = matchmaking;
    }
    GetSpectate() {
        return this.spectate;
    }
    SetSpectate(match) {
        this.spectate = match;
        this.SetStatus(match ? 5 : 1);
    }
    IsPlaying() {
        return (this.match != null && (this.match.GetGameStarted() || this.match.GetIsStarting()));
    }
    CanInvite() {
        return !this.IsPlaying() && !this.GetMatchMaking() && !this.GetSpectate() && !this.GetMatch();
    }
    FetchFriends(channelManager, friends) {
        for (let key in friends) {
            const userID = parseInt(key);
            const MUser = this.userManager.GetUser(userID);
            if (!MUser)
                continue;
            this.friends[userID] = new FriendUser(userID, MUser.GetNick(), friends[key].pending, friends[key].invite, this, friends[key].channel);
            this.friendsJSON[userID] = {
                id: userID,
                pending: friends[key].pending,
                invite: friends[key].invite,
                status: 0,
                channel: friends[key].channel,
                nick: MUser.GetNick()
            };
        }
    }
    FetchBlocked(blocked) {
        this.blocked = blocked;
    }
    async RetreiveHistory() {
        const dataBase = await (0, app_database_1.retreiveDataBase)();
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
            });
        }
        return history;
    }
    async AddHistory(win, ennemy, score, ennemyScore) {
        const dataBase = await (0, app_database_1.retreiveDataBase)();
        this.SendNet("HistoryAdd", {
            win: win,
            date: Date.now(),
            ennemy: ennemy.GetID(),
            ennemyNick: ennemy.GetNick(),
            score: score,
            ennemyScore: ennemyScore
        });
        await dataBase.query(`INSERT INTO "history" ("id", "win", "date", "ennemy", "score", "ennemyScore") VALUES ($1, $2, $3, $4, $5, $6)`, [this.id, win, Date.now(), ennemy.GetID(), score, ennemyScore]);
    }
    GetAuth() {
        return this.auth;
    }
    SetAuth(auth = null, needAuth = false) {
        this.auth = auth;
        this.needAuth = needAuth;
        this.Log(`Set auth of ${this.nick} (${this.id}) to ${auth}`);
    }
    NeedAuth() {
        return this.needAuth && this.auth;
    }
    SetNeedAuth(needAuth) {
        this.needAuth = needAuth;
    }
    SetTempAuth(auth) {
        this.tempAuth = auth;
    }
    GetTempAuth() {
        return this.tempAuth;
    }
    StartAuthTimeout() {
        if (!this.auth)
            return;
        this.authTimeout = setTimeout(() => {
            this.SetAuth(this.auth, true);
        }, 2000);
    }
    StopAuthTimeout() {
        if (!this.authTimeout)
            return;
        clearTimeout(this.authTimeout);
    }
    SetInvite(user) {
        this.invite = user;
        this.SendNet("Invite", (user && user.GetNick()) || "");
    }
    GetInvite() {
        return this.invite;
    }
    async UpdateNick(nick) {
        this.nick = nick;
        const dataBase = await (0, app_database_1.retreiveDataBase)();
        await dataBase.query(`UPDATE "users" SET "nick" = $1 WHERE "id" = $2;`, [nick, this.id]);
        this.Broadcast("UpdateNick", { id: this.id, nick: nick });
        await this.userManager.messageManager.UpdateNameMessages(this.id, nick);
    }
}
exports.User = User;
let UserManager = class UserManager {
    constructor(channelManager, messageManager) {
        this.messageManager = messageManager;
        this.users = {};
        this.tokens = {};
        this.CLogger = new common_1.Logger("UserManager");
        this.Log("Initialize");
        retreiveUsers().then(({ users, tokens }) => {
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
    GetUser(id) {
        return this.users[id];
    }
    ValidToken(token) {
        return this.tokens[token];
    }
    GetUserByToken(token) {
        return this.users[this.tokens[token]];
    }
    ParseUser(id) {
        return this.users[id].Parse();
    }
    Log(log) {
        this.CLogger.log(log);
    }
    GetUserByNick(nick) {
        for (let key in this.users) {
            if (this.users[key].GetNick() === nick) {
                return this.users[key];
            }
        }
        return false;
    }
    RegisterUser(id, nick) {
        return new Promise((resolve, reject) => {
            (0, app_database_1.retreiveDataBase)().then((dataBase) => {
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
    AddUser(token, id) {
        return new Promise((resolve, reject) => {
            (0, app_database_1.retreiveDataBase)().then((dataBase) => {
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
    GetUsersConnected() {
        let users = [];
        for (let key in this.users) {
            if (this.users[key].GetStatus() > 0) {
                users.push(this.users[key]);
            }
        }
        return users;
    }
    async Generate2FA(user) {
        const formattedKey = authenticator.generateKey();
        const url = authenticator.generateTotpUri(formattedKey, user.GetID(), "Transendance", 'SHA1', 6, 30);
        user.SetTempAuth(formattedKey);
        user.SendNet("Auth", url);
        return url;
    }
    async Enable2FA(user, formattedKey) {
        const dataBase = await (0, app_database_1.retreiveDataBase)();
        await dataBase.query(`UPDATE "users" SET "auth" = $1 WHERE "id" = $2;`, [formattedKey, user.GetID()]);
        user.SetAuth(formattedKey);
        user.SetTempAuth("");
        user.SendNet("AuthStatus", true);
    }
    ;
    async Disable2FA(user) {
        const dataBase = await (0, app_database_1.retreiveDataBase)();
        await dataBase.query(`UPDATE "users" SET "auth" = $1 WHERE "id" = $2;`, [null, user.GetID()]);
        user.SetAuth(null);
        user.SendNet("AuthStatus", false);
    }
    SetNetManager(netsManager) {
        this.netsManager = netsManager;
    }
    Broadcast(net, data) {
        this.netsManager.Broadcast(net, data);
    }
};
UserManager = __decorate([
    __param(0, (0, common_1.Inject)(app_channel_manager_1.ChannelManager)),
    __param(1, (0, common_1.Inject)(app_message_manager_1.MessageManager)),
    __metadata("design:paramtypes", [typeof (_a = typeof app_channel_manager_1.ChannelManager !== "undefined" && app_channel_manager_1.ChannelManager) === "function" ? _a : Object, typeof (_b = typeof app_message_manager_1.MessageManager !== "undefined" && app_message_manager_1.MessageManager) === "function" ? _b : Object])
], UserManager);
exports.UserManager = UserManager;
function retreiveUsers() {
    return new Promise((resolve, reject) => {
        (0, app_database_1.retreiveDataBase)().then((dataBase) => {
            dataBase.query(`SELECT * FROM "users";`).then((result) => {
                const users = result.rows;
                dataBase.query(`SELECT * FROM "sessions"`).then((res) => {
                    const tokens = res.rows;
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
exports.retreiveUsers = retreiveUsers;


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserChannel = exports.Channel = exports.ChannelManager = exports.encrypt = void 0;
const app_database_1 = __webpack_require__(9);
const common_1 = __webpack_require__(6);
class UserChannel {
    constructor(channel, id, owner, admin, mute, ban) {
        this.id = id;
        this.owner = owner;
        this.admin = admin;
        this.channel = channel;
        this.mute = mute;
        this.ban = ban;
        this.channel = channel;
    }
    GetID() {
        return this.id;
    }
    IsAdmin() {
        return this.admin;
    }
    IsOwner() {
        return this.owner;
    }
    SetOwner(owner) {
        this.owner = owner;
    }
    SetAdmin(admin) {
        this.admin = admin;
    }
    SetMute(mute, time = 0) {
        if (mute) {
            if (time <= 0) {
                time = 60 * 24 * 365 * 100;
            }
            this.mute = (Date.now() / 1000) + time * 60;
        }
        else {
            this.mute = 0;
        }
    }
    IsMute() {
        return this.mute > (Date.now() / 1000);
    }
    GetMute() {
        return this.mute;
    }
    SetBan(ban, time = 0) {
        if (ban) {
            if (time <= 0) {
                time = 60 * 24 * 365 * 100;
            }
            this.ban = (Date.now() / 1000) + time * 60;
        }
        else {
            this.ban = 0;
        }
    }
    GetBan() {
        return this.ban;
    }
    IsBan() {
        return this.ban > (Date.now() / 1000);
    }
}
exports.UserChannel = UserChannel;
const crypto = __webpack_require__(14);
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
function encrypt(text) {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
}
exports.encrypt = encrypt;
class Channel {
    constructor(channelManager, id, name, type, owner, users, password, invite) {
        this.users = {};
        this.id = id;
        this.name = name;
        this.type = type;
        this.owner = owner;
        this.password = password;
        this.channelManager = channelManager;
        this.invite = invite;
        this.channelJSON = {
            id: this.id,
            name: this.name,
            type: this.type,
            owner: this.owner,
            users: {},
            password: "hidden",
            invite: this.invite,
        };
        this.users = {};
        this.channelJSON.users = {};
        for (const key in users) {
            const value = users[key];
            this.users[key] = new UserChannel(this, value.id, value.owner, value.admin, value.mute, value.ban);
            this.channelJSON.users[key] = {
                id: value.id,
                owner: value.owner,
                admin: value.admin,
                mute: value.mute,
                ban: value.ban,
            };
        }
    }
    ExecUsers() {
        for (const [key, value] of Object.entries(this.users)) {
            if (value.IsBan()) {
                this.BanUser(value, true, (value.GetBan() - (Date.now() / 1000)) / 60);
            }
            if (value.IsMute()) {
                this.MuteUser(value, true, (value.GetMute() - (Date.now() / 1000)) / 60);
            }
        }
    }
    async AddUser(id, admin) {
        this.users[id] = new UserChannel(this, id, false, admin, 0, 0);
        await this.channelManager.UpdateChannel(this.id, "users", this.ParseUsers());
        this.SendNet("ContextChannel", { channel: this.id, id: id, index: "add", value: {
                id: id,
                owner: false,
                admin: admin,
                mute: 0,
                ban: 0,
            } });
        this.Log(`User ${id} added to channel ${this.id}`);
    }
    async RemoveUser(id) {
        const size = Object.keys(this.users).length;
        if (size <= 1) {
            await this.channelManager.RemoveChannel(this.id);
        }
        else {
            if (this.users[id].IsOwner()) {
                let newOwner = Object.keys(this.users)[0];
                if (newOwner === id.toString()) {
                    newOwner = Object.keys(this.users)[1];
                }
                newOwner = parseInt(newOwner);
                this.Log(`User ${newOwner} is new owner of channel ${this.id}`);
                this.users[newOwner].SetOwner(true);
                this.users[newOwner].SetAdmin(true);
                await this.channelManager.UpdateChannel(this.id, "owner", newOwner);
                this.SendNet("ContextChannel", { channel: this.id, id: newOwner, index: "owner", value: null });
            }
            this.SendNet("ContextChannel", { channel: this.id, id: id, index: "remove", value: null });
            delete this.users[id];
            await this.channelManager.UpdateChannel(this.id, "users", this.ParseUsers());
        }
        this.Log(`User ${id} removed from channel ${this.id}`);
    }
    GetUser(id) {
        return this.users[id];
    }
    HasUser(id) {
        return this.users[id] !== undefined;
    }
    ParseUsers() {
        const users = {};
        for (const [key, value] of Object.entries(this.users)) {
            users[key] = {
                id: value.GetID(),
                owner: value.IsOwner(),
                admin: value.IsAdmin(),
                mute: value.GetMute(),
                ban: value.GetBan(),
            };
        }
        return users;
    }
    Log(log) {
        this.channelManager.CLogger.log(log);
    }
    GetOwner() {
        return this.owner;
    }
    GetUsers() {
        return this.users;
    }
    GetID() {
        return this.id;
    }
    GetChannelJSON() {
        return this.channelJSON;
    }
    UpdateChannel(key, value) {
        if (key !== "users") {
            this[key] = value;
        }
        this.channelJSON[key] = value;
        this.Log(`Update channel ${this.id} with ${key} = ${value}`);
    }
    CanJoin(userID, password, invite) {
        if (this.HasUser(userID)) {
            return false;
        }
        else if (this.type === 1) {
            return true;
        }
        else if (this.type === 2 && invite) {
            return this.invite === invite;
        }
        else if (this.type === 3 && this.password !== encrypt(password || "")) {
            return false;
        }
        return true;
    }
    async MuteUser(user, mute, time) {
        user.SetMute(mute, time);
        this.SendNet("ContextChannel", { channel: this.id, id: user.GetID(), index: "mute", value: user.GetMute() });
        if (user.muteTimer) {
            clearTimeout(user.muteTimer);
        }
        await this.channelManager.UpdateChannel(this.id, "users", this.ParseUsers());
        if (!mute)
            return;
        user.muteTimer = setTimeout(() => {
            if ((user.GetMute() * 1000) - Date.now() > 0) {
                this.MuteUser(user, true, (user.GetMute() - Date.now()) / 60000);
                return;
            }
            this.SendNet("ContextChannel", { channel: this.id, id: user.GetID(), index: "mute", value: 0 });
        }, Math.min((user.GetMute() * 1000) - Date.now(), 2147483647));
    }
    async PromoteUser(user, promote) {
        user.SetAdmin(promote);
        this.SendNet("ContextChannel", { channel: this.id, id: user.GetID(), index: "admin", value: promote });
        await this.channelManager.UpdateChannel(this.id, "users", this.ParseUsers());
    }
    async BanUser(user, ban, time) {
        user.SetBan(ban, time);
        this.SendNet("ContextChannel", { channel: this.id, id: user.GetID(), index: "ban", value: user.GetBan() });
        if (user.banTimer) {
            clearTimeout(user.banTimer);
        }
        await this.channelManager.UpdateChannel(this.id, "users", this.ParseUsers());
        if (!ban)
            return;
        user.banTimer = setTimeout(() => {
            if ((user.GetBan() * 1000) - Date.now() > 0) {
                this.BanUser(user, true, (user.GetBan() - Date.now()) / 60000);
                return;
            }
            this.SendNet("ContextChannel", { channel: this.id, id: user.GetID(), index: "ban", value: 0 });
        }, Math.min((user.GetBan() * 1000) - Date.now(), 2147483647));
    }
    SendNet(net, data) {
        this.channelManager.SendNet(this, net, data);
    }
    GetType() {
        return this.type;
    }
    Broadcast(net, data) {
        this.channelManager.Broadcast(net, data);
    }
}
exports.Channel = Channel;
class ChannelManager {
    constructor() {
        this.channels = {};
        this.lastID = 0;
        this.invite = {};
        this.CLogger = new common_1.Logger("ChannelManager");
        retreiveChannels().then((channels) => {
            for (let channel of channels) {
                this.channels[channel.id] = new Channel(this, channel.id, channel.name, channel.type, channel.owner, JSON.parse(channel.users), channel.password, channel.invite);
                this.invite[channel.invite] = this.channels[channel.id];
                this.lastID = channel.id;
            }
            this.Log(`Initialize with ${channels.length} channels`);
        });
    }
    GenerateInvite() {
        let invite = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 10; i++) {
            invite += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        if (this.invite[invite] !== undefined) {
            return this.GenerateInvite();
        }
        return invite;
    }
    async AddChannel(name, type, owner, password) {
        this.lastID++;
        const users = {
            [owner]: {
                id: owner,
                owner: true,
                admin: true,
                mute: 0,
                ban: 0,
            }
        };
        const invite = this.GenerateInvite();
        this.channels[this.lastID] = new Channel(this, this.lastID, name, type, owner, users, password, invite);
        this.invite[invite] = this.channels[this.lastID];
        const dataBase = await (0, app_database_1.retreiveDataBase)();
        await dataBase.query(`INSERT INTO "channels" ("id", "name", "type", "owner", "users", "password", "invite") VALUES ($1, $2, $3, $4, $5, $6, $7);`, [this.lastID, name, type, owner, JSON.stringify(users), password, invite]);
        this.Log(`Channel ${name} created (id: ${this.lastID}`);
        if (type === 4) {
            this.channels[this.lastID].SendNet("AddChannel", this.channels[this.lastID].GetChannelJSON());
        }
        else if (type !== 2) {
            this.Broadcast("AddChannel", this.channels[this.lastID].GetChannelJSON());
        }
        return this.channels[this.lastID];
    }
    async RemoveChannel(id) {
        if (!this.channels[id])
            return;
        const dataBase = await (0, app_database_1.retreiveDataBase)();
        this.Log(`Channel ${id} deleted`);
        if (this.channels[id].GetType() !== 2) {
            this.Broadcast("RemoveChannel", id);
        }
        await this.messageManager.DeleteMessages(id);
        delete this.channels[id];
        await dataBase.query(`DELETE FROM "channels" WHERE "id" = $1;`, [id]);
    }
    async UpdateChannel(id, key, value) {
        this.channels[id].UpdateChannel(key, value);
        const dataBase = await (0, app_database_1.retreiveDataBase)();
        value = (typeof value === "object") ? JSON.stringify(value) : value;
        await dataBase.query(`UPDATE "channels" SET "${key}" = $1 WHERE "id" = $2;`, [value, id]);
    }
    GetChannelsUser(id) {
        const channels = {};
        for (const [key, value] of Object.entries(this.channels)) {
            if (value.HasUser(id) || value.GetType() === 1 || value.GetType() === 3) {
                channels[value.GetID()] = value.GetChannelJSON();
            }
        }
        return channels;
    }
    GetChannel(id) {
        return this.channels[id];
    }
    GetChannels() {
        return this.channels;
    }
    GetChannelInvite(invite) {
        return this.invite[invite];
    }
    Log(log) {
        this.CLogger.log(log);
    }
    SetUserManager(userManager) {
        this.userManager = userManager;
        for (const [key, channel] of Object.entries(this.channels)) {
            channel.ExecUsers();
        }
    }
    SetMessageManager(messageManager) {
        this.messageManager = messageManager;
    }
    SetNetManager(netsManager) {
        this.netsManager = netsManager;
    }
    SendNet(channel, net, data) {
        for (const [key, value] of Object.entries(channel.GetUsers())) {
            const MUser = this.userManager.GetUser(value.GetID());
            if (!MUser)
                continue;
            MUser.SendNet(net, data);
        }
    }
    Broadcast(net, data) {
        this.netsManager.Broadcast(net, data);
    }
}
exports.ChannelManager = ChannelManager;
function retreiveChannels() {
    return new Promise((resolve, reject) => {
        (0, app_database_1.retreiveDataBase)().then((dataBase) => {
            dataBase.query(`SELECT * FROM "channels";`).then((result) => {
                const channels = result.rows;
                resolve(channels);
            }).catch((error) => {
                reject(error);
            });
        }).catch((error) => {
            reject(error);
        });
    });
}


/***/ }),
/* 14 */
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),
/* 15 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MessageManager = void 0;
const common_1 = __webpack_require__(6);
const app_channel_manager_1 = __webpack_require__(13);
const app_database_1 = __webpack_require__(9);
let MessageManager = class MessageManager {
    constructor(channelManager) {
        this.channelManager = channelManager;
        this.lastMessageID = 0;
        this.CLogger = new common_1.Logger("MessageManager");
        this.Log("Initialize");
        (0, app_database_1.retreiveDataBase)().then((dataBase) => {
            dataBase.query(`SELECT * FROM "messages" ORDER BY "id" DESC LIMIT 1;`).then((result) => {
                if (result.rows[0] === undefined)
                    return;
                this.lastMessageID = result.rows[0].id;
            });
        });
        this.channelManager.SetMessageManager(this);
    }
    SetUserManager(userManager) {
        this.userManager = userManager;
    }
    async SendMessage(channel, message, user) {
        const channelID = channel.GetID();
        const authorID = user.GetID();
        const authorNick = user.GetNick();
        const messageID = this.lastMessageID + 1;
        this.lastMessageID = messageID;
        const dataBase = await (0, app_database_1.retreiveDataBase)();
        await dataBase.query(`INSERT INTO "messages" ("id", "channel", "author", "nick", "content", "date") VALUES ($1, $2, $3, $4, $5, $6);`, [messageID, channelID, authorID, authorNick, message, Date.now()]);
        this.Log(`Send message ${messageID} in channel ${channelID} from user ${authorID} with content ${message} at ${Date.now()}`);
        for (const userID in channel.GetUsers()) {
            const userSend = this.userManager.GetUser(userID);
            if (!userSend)
                continue;
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
    async GetMessages(channel, start, end) {
        this.Log(start + " " + end);
        const channelID = channel.GetID();
        const dataBase = await (0, app_database_1.retreiveDataBase)();
        const result = await dataBase.query(`SELECT * FROM "messages" WHERE "channel" = $1 ORDER BY "id" DESC LIMIT $2 OFFSET $3;`, [channelID, end - start, start]);
        return result.rows;
    }
    async DeleteMessages(id) {
        const dataBase = await (0, app_database_1.retreiveDataBase)();
        await dataBase.query(`DELETE FROM "messages" WHERE "channel" = $1;`, [id]);
    }
    async UpdateNameMessages(id, nick) {
        const dataBase = await (0, app_database_1.retreiveDataBase)();
        await dataBase.query(`UPDATE "messages" SET "nick" = $1 WHERE "author" = $2;`, [nick, id]);
    }
    Log(message) {
        this.CLogger.log(message);
    }
};
MessageManager = __decorate([
    __param(0, (0, common_1.Inject)(app_channel_manager_1.ChannelManager)),
    __metadata("design:paramtypes", [typeof (_a = typeof app_channel_manager_1.ChannelManager !== "undefined" && app_channel_manager_1.ChannelManager) === "function" ? _a : Object])
], MessageManager);
exports.MessageManager = MessageManager;


/***/ }),
/* 16 */
/***/ ((module) => {

"use strict";
module.exports = require("authenticator");

/***/ }),
/* 17 */
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),
/* 18 */
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),
/* 19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AppSocket_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppSocket = void 0;
const websockets_1 = __webpack_require__(20);
const common_1 = __webpack_require__(6);
const socket_io_1 = __webpack_require__(21);
const app_nets_manager_1 = __webpack_require__(22);
let AppSocket = AppSocket_1 = class AppSocket {
    constructor(nets) {
        this.nets = nets;
        this.logger = new common_1.Logger(AppSocket_1.name);
        this.users = 0;
    }
    afterInit() {
        this.logger.log("Initialize");
    }
    handleConnection(Client) {
        this.nets.netIncoming(Client, "connected");
    }
    handleDisconnect(Client) {
        this.nets.netIncoming(Client, "disconnected");
    }
    handleEvent(data = {}, Client) {
        if (!data.net) {
            return;
        }
        this.nets.netIncoming(Client, data.net, data.args || {});
    }
};
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], AppSocket.prototype, "handleConnection", null);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _c : Object]),
    __metadata("design:returntype", void 0)
], AppSocket.prototype, "handleDisconnect", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("nets"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_d = typeof socket_io_1.Socket !== "undefined" && socket_io_1.Socket) === "function" ? _d : Object]),
    __metadata("design:returntype", void 0)
], AppSocket.prototype, "handleEvent", null);
AppSocket = AppSocket_1 = __decorate([
    (0, websockets_1.WebSocketGateway)(3001, {
        cors: {
            origin: process.env.IP + process.env.PORT_FRONT,
            methods: ["GET", "POST"],
            credentials: true
        }
    }),
    __param(0, (0, common_1.Inject)(app_nets_manager_1.NetsManager)),
    __metadata("design:paramtypes", [typeof (_a = typeof app_nets_manager_1.NetsManager !== "undefined" && app_nets_manager_1.NetsManager) === "function" ? _a : Object])
], AppSocket);
exports.AppSocket = AppSocket;


/***/ }),
/* 20 */
/***/ ((module) => {

"use strict";
module.exports = require("@nestjs/websockets");

/***/ }),
/* 21 */
/***/ ((module) => {

"use strict";
module.exports = require("socket.io");

/***/ }),
/* 22 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NetsManager = void 0;
const common_1 = __webpack_require__(6);
const app_match_manager_1 = __webpack_require__(8);
const app_user_manager_1 = __webpack_require__(12);
const app_channel_manager_1 = __webpack_require__(13);
const app_message_manager_1 = __webpack_require__(15);
const NetworkString = {
    ["UpdateInput"]: true,
    ["NewMessage"]: true,
};
let NetsManager = class NetsManager {
    constructor(userManager, messageManager, matchManager, channelManager) {
        this.userManager = userManager;
        this.messageManager = messageManager;
        this.matchManager = matchManager;
        this.channelManager = channelManager;
        this.logger = new common_1.Logger(NetsManager.name);
        this.nets = {};
        this.connectedUsers = {};
        userManager.SetNetManager(this);
    }
    netIncoming(client, name, args = {}) {
        const MUser = client["User"];
        if (name == "connected") {
            this.userConnected(client);
        }
        else if (name == "disconnected") {
            this.userDisconnected(client);
        }
        else if (MUser && MUser.CanAction()) {
            if (!NetworkString[name]) {
                return;
            }
            this[name](MUser, args);
        }
    }
    UpdateInput(user, args) {
        user.SetInputs(args);
    }
    NewMessage(MUser, args) {
        if (!MUser.CanAction()) {
            return;
        }
        this.messageManager.Log("Message send request by " + MUser.GetID());
        const channelID = args.channel;
        const message = args.message;
        if (channelID === undefined || message === undefined || message === "") {
            return;
        }
        const channel = this.channelManager.GetChannel(channelID);
        if (channel === undefined) {
            return;
        }
        const CUser = channel.GetUser(MUser.GetID());
        if (!CUser) {
            return;
        }
        else if (CUser.IsMute()) {
            return;
        }
        else if (CUser.IsBan()) {
            return;
        }
        this.messageManager.SendMessage(channel, message, MUser);
    }
    userConnected(Client) {
        let cookies = {};
        (Client.handshake.headers.cookie || "").split(";").forEach((cookie) => {
            let parts = cookie.split("=");
            cookies[parts[0].trim()] = (parts[1] || "").trim();
        });
        if (!cookies["session"]) {
            return;
        }
        const User = this.userManager.GetUserByToken(cookies["session"]);
        if (!User) {
            return;
        }
        if (User.GetSocket() && User.GetSocket().connected) {
            Client.disconnect(true);
            return;
        }
        User.SetSocket(Client);
        User.SetStatus(1);
        User.StopAuthTimeout();
        const match = User.GetMatch();
        if (match) {
            User.SendNet("StartGame", match.GetGameSpecatorInfo());
        }
        else if (User.GetSpectate()) {
            User.SendNet("StartGame", User.GetSpectate().GetGameSpecatorInfo());
        }
        Client["User"] = User;
    }
    userDisconnected(Client) {
        let cookies = {};
        (Client.handshake.headers.cookie || "").split(";").forEach((cookie) => {
            let parts = cookie.split("=");
            cookies[parts[0].trim()] = (parts[1] || "").trim();
        });
        const MUser = this.userManager.GetUserByToken(cookies["session"]);
        if (!MUser) {
            return;
        }
        if (MUser.GetMatchMaking() && !MUser.IsPlaying()) {
            this.matchManager.matchMaking(MUser, true);
        }
        MUser.SetSocket(null);
        MUser.SetStatus(0);
        MUser.StartAuthTimeout();
    }
    Send(MUser, net, args = {}) {
        MUser.GetSocket().emit("nets", { net: net, args: args });
    }
    Broadcast(net, args = {}) {
        this.userManager.GetUsersConnected().forEach((MUser) => {
            MUser.SendNet(net, args);
        });
    }
    Log(text) {
        this.logger.log(text);
    }
};
NetsManager = __decorate([
    __param(0, (0, common_1.Inject)(app_user_manager_1.UserManager)),
    __param(1, (0, common_1.Inject)(app_message_manager_1.MessageManager)),
    __param(2, (0, common_1.Inject)(app_match_manager_1.MatchManager)),
    __param(3, (0, common_1.Inject)(app_channel_manager_1.ChannelManager)),
    __metadata("design:paramtypes", [typeof (_a = typeof app_user_manager_1.UserManager !== "undefined" && app_user_manager_1.UserManager) === "function" ? _a : Object, typeof (_b = typeof app_message_manager_1.MessageManager !== "undefined" && app_message_manager_1.MessageManager) === "function" ? _b : Object, typeof (_c = typeof app_match_manager_1.MatchManager !== "undefined" && app_match_manager_1.MatchManager) === "function" ? _c : Object, typeof (_d = typeof app_channel_manager_1.ChannelManager !== "undefined" && app_channel_manager_1.ChannelManager) === "function" ? _d : Object])
], NetsManager);
exports.NetsManager = NetsManager;


/***/ }),
/* 23 */
/***/ ((module) => {

"use strict";
module.exports = require("nestjs-form-data");

/***/ }),
/* 24 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AvatarController = void 0;
const common_1 = __webpack_require__(6);
const nestjs_form_data_1 = __webpack_require__(23);
const path = __webpack_require__(17);
const fs = __webpack_require__(18);
class FormAvatarData {
}
__decorate([
    (0, nestjs_form_data_1.IsFile)(),
    (0, nestjs_form_data_1.MaxFileSize)(1e6),
    (0, nestjs_form_data_1.HasMimeType)(['image/jpeg', 'image/png']),
    __metadata("design:type", typeof (_a = typeof nestjs_form_data_1.MemoryStoredFile !== "undefined" && nestjs_form_data_1.MemoryStoredFile) === "function" ? _a : Object)
], FormAvatarData.prototype, "avatar", void 0);
let AvatarController = class AvatarController {
    constructor() { }
    async uploadAvatar(avatar, req, response) {
        if (!req.MUser.CanAction()) {
            response.status(403).send({ statusCode: 403, message: "Forbidden" });
            return;
        }
        const avatarPath = `./assets/avatars/${req.MUser.GetID()}.png`;
        let writer = fs.createWriteStream(avatarPath);
        writer.write(avatar["image"]["buffer"]);
        const oldNick = req.MUser.GetNick();
        await req.MUser.UpdateNick(req.MUser.GetNick());
        response.status(200).send({ statusCode: 200, message: "OK" });
        return;
    }
    readFile(path, response) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) {
                    return reject(err);
                }
                response.writeHead(200, {
                    'Content-Type': "image/png",
                    'Content-Length': data.length,
                });
                return resolve(data);
            });
        });
    }
    async SendDefaultAvatar(res) {
        const avatarPath = `assets/avatars/default.png`;
        const absolutePath = path.join(__dirname, "..", avatarPath);
        if (!fs.existsSync(absolutePath)) {
            res.status(404).send('Avatar not found');
            return;
        }
        const fileData = await this.readFile(absolutePath, res);
        res.write(fileData);
        res.end();
    }
    async getAvatar(req, res, params) {
        const id = params.id;
        if (!id || id === "") {
            await this.SendDefaultAvatar(res);
            return;
        }
        const avatarPath = `assets/avatars/${id}.png`;
        const absolutePath = path.join(__dirname, "..", avatarPath);
        if (!fs.existsSync(absolutePath)) {
            await this.SendDefaultAvatar(res);
            return;
        }
        const fileData = await this.readFile(absolutePath, res);
        res.write(fileData);
        res.end();
    }
};
__decorate([
    (0, common_1.Post)("upload"),
    (0, nestjs_form_data_1.FormDataRequest)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [FormAvatarData, Object, Object]),
    __metadata("design:returntype", Promise)
], AvatarController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Get)(":id.png"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AvatarController.prototype, "getAvatar", null);
AvatarController = __decorate([
    (0, common_1.Controller)("avatar"),
    __metadata("design:paramtypes", [])
], AvatarController);
exports.AvatarController = AvatarController;


/***/ }),
/* 25 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChannelController = void 0;
const common_1 = __webpack_require__(6);
const app_channel_manager_1 = __webpack_require__(13);
const app_nets_manager_1 = __webpack_require__(22);
let ChannelController = class ChannelController {
    constructor(channelManager, netsManager) {
        this.channelManager = channelManager;
        this.netsManager = netsManager;
        channelManager.SetNetManager(netsManager);
    }
    async GetUsers(params, res) {
        const channelID = params.id;
        const channel = this.channelManager.GetChannel(channelID);
        if (channel === undefined) {
            res.status(404).send({ statusCode: 404, message: "Channel not found" });
            return;
        }
        res.status(200).send({ statusCode: 200, message: "OK", users: channel.ParseUsers() });
    }
    async GetChannelsUser(params, res) {
        const userID = params.id;
        const channels = this.channelManager.GetChannelsUser(userID);
        if (channels === undefined) {
            res.status(404).send({ statusCode: 404, message: "User not found" });
            return;
        }
        res.status(200).send({ statusCode: 200, message: "OK", channels: channels });
    }
    async CreateChannel(body, res, req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        const name = body.name;
        const type = body.type;
        const owner = req.MUser.GetID();
        this.channelManager.Log(name + " " + type + " " + owner);
        const password = (type == 3 && body.password) || "";
        if (!name || !type || !owner) {
            res.status(400).send({ statusCode: 400, message: "Bad request" });
            return;
        }
        if (type == 3) {
            this.channelManager.Log("Channel creation request by " + req.MUser.GetNick() + " (" + req.MUser.GetID() + ") with password " + password);
        }
        else {
            this.channelManager.Log("Channel creation request by " + req.MUser.GetNick() + " (" + req.MUser.GetID() + ")");
        }
        await this.channelManager.AddChannel(name, type, owner, (0, app_channel_manager_1.encrypt)(password));
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
    async DeleteChannel(params, res, req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        const channelID = params.id;
        const channel = this.channelManager.GetChannel(channelID);
        this.channelManager.Log("Channel deletion request by " + req.MRegistered + " (" + req.MUserID + ")");
        if (channel === undefined) {
            res.status(404).send({ statusCode: 404, message: "Channel not found" });
            return;
        }
        if (channel.GetOwner() != req.MUser.GetID()) {
            res.status(403).send({ statusCode: 403, message: "You are not the owner" });
            return;
        }
        await this.channelManager.RemoveChannel(channelID);
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
    async LeaveChannel(params, res, req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        const channelID = params.id;
        const channel = this.channelManager.GetChannel(channelID);
        const UserID = req.MUser.GetID();
        this.channelManager.Log("Channel leave request by " + req.MUser.GetNick() + " (" + UserID + ")");
        if (channel === undefined) {
            res.status(404).send({ statusCode: 404, message: "Channel not found" });
            return;
        }
        console.log(channel.GetUser(UserID).GetBan() > Date.now() / 1000);
        if (!channel.HasUser(UserID)) {
            res.status(403).send({ statusCode: 403, message: "Forbidden" });
            return;
        }
        else if (channel.GetUser(UserID).GetBan() > Date.now() / 1000) {
            res.status(403).send({ statusCode: 403, message: "You are banned" });
            return;
        }
        await channel.RemoveUser(UserID);
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
    async JoinChannel(params, body, res, req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        const channelID = params.id;
        let channel = this.channelManager.GetChannel(channelID);
        const UserID = req.MUser.GetID();
        this.channelManager.Log("Channel join request by " + req.MUser.GetNick() + " (" + UserID + ")");
        if (channel === undefined) {
            channel = this.channelManager.GetChannelInvite(channelID);
            if (channel === undefined) {
                res.status(404).send({ statusCode: 404, message: "Channel not found" });
                return;
            }
        }
        const password = body.password;
        if (!channel.CanJoin(UserID, password, channelID)) {
            res.status(403).send({ statusCode: 403, message: "You can't join this channel" });
            return;
        }
        channel.AddUser(UserID, false);
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
    async MuteUser(body, res, req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        const channelID = body.channel;
        const targetID = body.id;
        if (!targetID || !channelID) {
            res.status(400).send({ statusCode: 400, message: "Bad request" });
            return;
        }
        else if (targetID == req.MUser.GetID()) {
            res.status(403).send({ statusCode: 403, message: "You can't mute yourself" });
            return;
        }
        const channel = this.channelManager.GetChannel(channelID);
        if (!channel) {
            res.status(404).send({ statusCode: 404, message: "Channel not found" });
            return;
        }
        const CUser = channel.GetUser(req.MUser.GetID());
        if (!CUser || !CUser.IsAdmin()) {
            res.status(403).send({ statusCode: 403, message: "You are not admin" });
            return;
        }
        const CTargetUser = channel.GetUser(targetID);
        if (!CTargetUser) {
            res.status(404).send({ statusCode: 404, message: "User not found" });
            return;
        }
        else if (CTargetUser.IsAdmin() && !CUser.IsOwner()) {
            res.status(403).send({ statusCode: 403, message: "Forbidden" });
            return;
        }
        let muteLenght = 0;
        if (!CTargetUser.IsMute() && !body.lenght && body.lenght !== 0) {
            res.status(400).send({ statusCode: 400, message: "Bad request" });
            return;
        }
        else if (!CTargetUser.IsMute()) {
            muteLenght = Math.min(Math.max(0, parseInt(body.lenght)), 60 * 24 * 7);
            if (isNaN(muteLenght)) {
                res.status(400).send({ statusCode: 400, message: "Bad request" });
                return;
            }
        }
        channel.MuteUser(CTargetUser, !CTargetUser.IsMute(), muteLenght);
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
    async KickUser(body, res, req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        const channelID = body.channel;
        const targetID = body.id;
        if (!targetID || !channelID) {
            res.status(400).send({ statusCode: 400, message: "Bad request" });
            return;
        }
        else if (targetID == req.MUser.GetID()) {
            res.status(403).send({ statusCode: 403, message: "You can't kick yourself" });
            return;
        }
        const channel = this.channelManager.GetChannel(channelID);
        if (!channel) {
            res.status(404).send({ statusCode: 404, message: "Channel not found" });
            return;
        }
        const CUser = channel.GetUser(req.MUser.GetID());
        if (!CUser || !CUser.IsAdmin()) {
            res.status(403).send({ statusCode: 403, message: "You are not admin" });
            return;
        }
        const CTargetUser = channel.GetUser(targetID);
        if (!CTargetUser) {
            res.status(404).send({ statusCode: 404, message: "User not found" });
            return;
        }
        else if (CTargetUser.IsAdmin() && !CUser.IsOwner()) {
            res.status(403).send({ statusCode: 403, message: "You can't kick an admin" });
            return;
        }
        channel.RemoveUser(CTargetUser.GetID());
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
    async PromoteUser(body, res, req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        const channelID = body.channel;
        const targetID = body.id;
        if (!targetID || !channelID) {
            res.status(400).send({ statusCode: 400, message: "Bad request" });
            return;
        }
        else if (targetID == req.MUser.GetID()) {
            res.status(403).send({ statusCode: 403, message: "You can't promote yourself" });
            return;
        }
        const channel = this.channelManager.GetChannel(channelID);
        if (!channel) {
            res.status(404).send({ statusCode: 404, message: "Channel not found" });
            return;
        }
        const CUser = channel.GetUser(req.MUser.GetID());
        if (!CUser || !CUser.IsAdmin()) {
            console.log(CUser);
            res.status(403).send({ statusCode: 403, message: "You are not admin" });
            return;
        }
        const CTargetUser = channel.GetUser(targetID);
        if (!CTargetUser) {
            res.status(404).send({ statusCode: 404, message: "User not found" });
            return;
        }
        channel.PromoteUser(CTargetUser, !CTargetUser.IsAdmin());
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
    async BanUser(body, res, req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        const channelID = body.channel;
        const targetID = body.id;
        if (!targetID || !channelID) {
            res.status(400).send({ statusCode: 400, message: "Bad request" });
            return;
        }
        else if (targetID == req.MUser.GetID()) {
            res.status(403).send({ statusCode: 403, message: "You can't ban yourself" });
            return;
        }
        const channel = this.channelManager.GetChannel(channelID);
        if (!channel) {
            res.status(404).send({ statusCode: 404, message: "Channel not found" });
            return;
        }
        const CUser = channel.GetUser(req.MUser.GetID());
        if (!CUser || !CUser.IsAdmin()) {
            res.status(403).send({ statusCode: 403, message: "You are not an admin" });
            return;
        }
        const CTargetUser = channel.GetUser(targetID);
        if (!CTargetUser) {
            res.status(404).send({ statusCode: 404, message: "User not found" });
            return;
        }
        if (CTargetUser.IsAdmin() && !CUser.IsOwner()) {
            res.status(403).send({ statusCode: 403, message: "You can't ban an admin" });
            return;
        }
        let banLenght = 0;
        if (!CTargetUser.IsBan() && !body.lenght) {
            res.status(400).send({ statusCode: 400, message: "Bad request" });
            return;
        }
        else if (!CTargetUser.IsBan()) {
            banLenght = Math.min(Math.max(0, parseInt(body.lenght)), 60 * 24 * 7);
            if (isNaN(banLenght)) {
                res.status(400).send({ statusCode: 400, message: "Bad request" });
                return;
            }
        }
        channel.BanUser(CTargetUser, !CTargetUser.IsBan(), banLenght);
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
    async RemovePassword(id, res, req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        const channel = this.channelManager.GetChannel(id);
        if (!channel) {
            res.status(404).send({ statusCode: 404, message: "Channel not found" });
            return;
        }
        else if (channel.GetType() !== 3) {
            res.status(400).send({ statusCode: 400, message: "Bad request" });
            return;
        }
        const CUser = channel.GetUser(req.MUser.GetID());
        if (!CUser || !CUser.IsOwner()) {
            res.status(403).send({ statusCode: 403, message: "You are not the owner" });
            return;
        }
        await this.channelManager.UpdateChannel(channel.GetID(), "password", "");
        await this.channelManager.UpdateChannel(channel.GetID(), "type", 1);
        this.channelManager.Broadcast("UpdateChannel", { id: channel.GetID(), type: 1 });
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
    async SetPassword(id, body, res, req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        const channel = this.channelManager.GetChannel(id);
        if (!channel) {
            res.status(404).send({ statusCode: 404, message: "Channel not found" });
            return;
        }
        else if (channel.GetType() !== 1 && channel.GetType() !== 3) {
            res.status(400).send({ statusCode: 400, message: "Bad request" });
            return;
        }
        const CUser = channel.GetUser(req.MUser.GetID());
        if (!CUser || !CUser.IsOwner()) {
            res.status(403).send({ statusCode: 403, message: "You are not the owner" });
            return;
        }
        if (!body.password) {
            res.status(400).send({ statusCode: 400, message: "Bad request" });
            return;
        }
        await this.channelManager.UpdateChannel(channel.GetID(), "password", (0, app_channel_manager_1.encrypt)(body.password));
        await this.channelManager.UpdateChannel(channel.GetID(), "type", 3);
        this.channelManager.Broadcast("UpdateChannel", { id: channel.GetID(), type: 3 });
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
};
__decorate([
    (0, common_1.Get)(":id/users"),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "GetUsers", null);
__decorate([
    (0, common_1.Get)("user/:id"),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "GetChannelsUser", null);
__decorate([
    (0, common_1.Post)("creation"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Response)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "CreateChannel", null);
__decorate([
    (0, common_1.Delete)("delete/:id"),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Response)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "DeleteChannel", null);
__decorate([
    (0, common_1.Post)("leave/:id"),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Response)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "LeaveChannel", null);
__decorate([
    (0, common_1.Post)("join/:id"),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Response)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "JoinChannel", null);
__decorate([
    (0, common_1.Post)("/mute"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Response)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "MuteUser", null);
__decorate([
    (0, common_1.Post)("/kick"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Response)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "KickUser", null);
__decorate([
    (0, common_1.Post)("/promote"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Response)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "PromoteUser", null);
__decorate([
    (0, common_1.Post)("/ban"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Response)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "BanUser", null);
__decorate([
    (0, common_1.Post)("pwd/remove/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Response)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "RemovePassword", null);
__decorate([
    (0, common_1.Post)("pwd/set/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Response)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "SetPassword", null);
ChannelController = __decorate([
    (0, common_1.Controller)("channel"),
    __param(0, (0, common_1.Inject)(app_channel_manager_1.ChannelManager)),
    __param(1, (0, common_1.Inject)(app_nets_manager_1.NetsManager)),
    __metadata("design:paramtypes", [typeof (_a = typeof app_channel_manager_1.ChannelManager !== "undefined" && app_channel_manager_1.ChannelManager) === "function" ? _a : Object, typeof (_b = typeof app_nets_manager_1.NetsManager !== "undefined" && app_nets_manager_1.NetsManager) === "function" ? _b : Object])
], ChannelController);
exports.ChannelController = ChannelController;


/***/ }),
/* 26 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserController = void 0;
const common_1 = __webpack_require__(6);
const app_user_manager_1 = __webpack_require__(12);
const app_match_manager_1 = __webpack_require__(8);
const axios = __webpack_require__(27);
async function getUserInfo(token) {
    let res = await axios.get("https://api.intra.42.fr/v2/me", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return res.data;
}
const charList = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function generateRandomToken(userManager) {
    let token = "";
    for (let i = 0; i < 50; i++) {
        token += charList[Math.floor(Math.random() * charList.length)];
    }
    if (userManager.ValidToken(token)) {
        return generateRandomToken(userManager);
    }
    return token;
}
let UserController = class UserController {
    constructor(userManager) {
        this.userManager = userManager;
    }
    onApplicationBootstrap() {
    }
    async getConnected(code, response, request) {
        if (request.MUser.IsRegister()) {
            response.status(200).send({ statusCode: 200, message: "OK" });
            return;
        }
        if (!code) {
            response.status(401).send({ statusCode: 400, message: "Bad request" });
            return;
        }
        try {
            let res = await axios.post("https://api.intra.42.fr/oauth/token", {
                grant_type: "authorization_code",
                client_id: process.env.CLIENT_KEY,
                client_secret: process.env.SECRET_KEY,
                code: code,
                redirect_uri: process.env.IP + process.env.PORT_BACK + "/user/connected",
            });
            const user = await getUserInfo(res.data.access_token);
            const token = generateRandomToken(this.userManager);
            this.userManager.AddUser(token, user.id);
            response.cookie("session", token, { httpOnly: true });
            return;
        }
        catch (err) {
            return { statusCode: 401, message: "Unauthorized" };
        }
    }
    async getMe(req, res) {
        if (!req.MUser.IsRegister42()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        if (req.MUser.CanAction()) {
            res.status(200).send(await req.MUser.Parse());
        }
        else {
            console.log("User " + req.MUser.GetID() + " is not connected");
            return res.status(200).send({
                id: req.MUser.GetID(),
                isConnected: true
            });
        }
    }
    async getUser(id, res) {
        if (this.userManager.GetUser(id)) {
            res.status(200).send({ statusCode: 200, message: "OK", user: await this.userManager.ParseUser(id) });
            return;
        }
        res.status(404).send({ statusCode: 404, message: "User not found" });
    }
    async getStats(id, res) {
        const user = this.userManager.GetUser(id);
        if (user) {
            res.status(200).send({ statusCode: 200, message: "OK", history: await user.RetreiveHistory(), totalMatch: (0, app_match_manager_1.GetTotalMatch)() });
            return;
        }
        res.status(404).send({ statusCode: 404, message: "User not found" });
    }
    async registerUser(body, req, res) {
        if (!req.MUser.IsRegister42() || req.MUser.IsRegister()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        const nick = body.nick;
        if (!nick) {
            res.status(400).send({ statusCode: 400, message: "Invalid nick" });
            return;
        }
        else if (this.userManager.GetUserByNick(nick)) {
            res.status(400).send({ statusCode: 400, message: "Nick already taken" });
            return;
        }
        await this.userManager.RegisterUser(req.MConnected, nick);
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
    async UpdateUser(body, req, res) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        const nick = body.nick;
        if (!nick) {
            res.status(400).send({ statusCode: 400, message: "Invalid nick" });
            return;
        }
        else if (this.userManager.GetUserByNick(nick)) {
            res.status(400).send({ statusCode: 400, message: "Nick already taken" });
            return;
        }
        await req.MUser.UpdateNick(nick);
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
    async AddUser(body, res, req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        else if (!body.nick) {
            res.status(400).send({ statusCode: 400, message: "Invalid nick" });
            return;
        }
        const friend = this.userManager.GetUserByNick(body.nick);
        if (!friend || !friend.CanAction()) {
            res.status(404).send({ statusCode: 404, message: "User not found" });
            return;
        }
        else if (friend.GetID() == req.MUser.GetID()) {
            res.status(400).send({ statusCode: 400, message: "You can't add yourself" });
            return;
        }
        else if (req.MUser.HasFriend(friend)) {
            res.status(400).send({ statusCode: 400, message: "User already friend" });
            return;
        }
        await req.MUser.AddFriend(friend);
        this.userManager.Log("User " + req.MUser.GetNick() + " add " + friend.GetNick());
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
    async RemoveUser(body, res, req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        else if (!body.id) {
            res.status(400).send({ statusCode: 400, message: "Invalid id" });
            return;
        }
        const friend = this.userManager.GetUser(body.id);
        if (!friend || !friend.CanAction()) {
            res.status(404).send({ statusCode: 404, message: "User not found" });
            return;
        }
        else if (!req.MUser.HasFriend(friend)) {
            res.status(400).send({ statusCode: 400, message: "User not friend" });
            return;
        }
        await req.MUser.RemoveFriend(friend);
        this.userManager.Log("User " + req.MUser.GetNick() + " remove " + friend.GetNick());
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
    async AcceptUser(body, res, req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        else if (!body.id) {
            res.status(400).send({ statusCode: 400, message: "Invalid id" });
            return;
        }
        const friend = this.userManager.GetUser(body.id);
        if (!friend || !friend.CanAction()) {
            res.status(404).send({ statusCode: 404, message: "User not found" });
            return;
        }
        else if (!req.MUser.HasFriend(friend)) {
            res.status(400).send({ statusCode: 400, message: "User not friend" });
            return;
        }
        else if (!req.MUser.CanAcceptFriend(friend)) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        await req.MUser.AccepteFriend(friend);
        this.userManager.Log("User " + req.MUser.GetNick() + " accept " + friend.GetNick());
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
    async BlockUser(body, res, req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        else if (!body.id) {
            res.status(400).send({ statusCode: 400, message: "Invalid id" });
            return;
        }
        const friend = this.userManager.GetUser(body.id);
        if (!friend || !friend.CanAction()) {
            res.status(404).send({ statusCode: 404, message: "User not found" });
            return;
        }
        else if (!req.MUser.HasFriend(friend)) {
            res.status(400).send({ statusCode: 400, message: "User not friend" });
            return;
        }
        await req.MUser.BlockUser(friend, !req.MUser.IsBlocked(friend));
        this.userManager.Log("User " + req.MUser.GetNick() + " block " + friend.GetNick() + " : " + req.MUser.IsBlocked(friend));
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
};
__decorate([
    (0, common_1.Get)("connected"),
    (0, common_1.Redirect)(process.env.IP + process.env.PORT_FRONT, 302),
    __param(0, (0, common_1.Query)("code")),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getConnected", null);
__decorate([
    (0, common_1.Post)("me"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)("fetch/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUser", null);
__decorate([
    (0, common_1.Get)("stats/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)("register"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], UserController.prototype, "registerUser", null);
__decorate([
    (0, common_1.Post)("update"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "UpdateUser", null);
__decorate([
    (0, common_1.Post)("add"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "AddUser", null);
__decorate([
    (0, common_1.Post)("remove"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "RemoveUser", null);
__decorate([
    (0, common_1.Post)("accept"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "AcceptUser", null);
__decorate([
    (0, common_1.Post)("block"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "BlockUser", null);
UserController = __decorate([
    (0, common_1.Controller)("user"),
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(app_user_manager_1.UserManager)),
    __metadata("design:paramtypes", [typeof (_a = typeof app_user_manager_1.UserManager !== "undefined" && app_user_manager_1.UserManager) === "function" ? _a : Object])
], UserController);
exports.UserController = UserController;


/***/ }),
/* 27 */
/***/ ((module) => {

"use strict";
module.exports = require("axios");

/***/ }),
/* 28 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MessageController = void 0;
const common_1 = __webpack_require__(6);
const app_message_manager_1 = __webpack_require__(15);
const app_channel_manager_1 = __webpack_require__(13);
let MessageController = class MessageController {
    constructor(messageManager, channelManager) {
        this.messageManager = messageManager;
        this.channelManager = channelManager;
    }
    async FetchMessages(params, res, body, req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        this.messageManager.Log("Message fetch request by " + req.MUser.GetID());
        const channelID = params.id;
        const min = body.min;
        if (channelID === undefined || min === undefined) {
            res.status(400).send({ statusCode: 400, message: "Bad request" });
            return;
        }
        const channel = this.channelManager.GetChannel(channelID);
        if (channel === undefined) {
            res.status(404).send({ statusCode: 404, message: "Channel not found" });
            return;
        }
        else if (!channel.HasUser(req.MUser.GetID())) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        const messages = await this.messageManager.GetMessages(channel, min, min + 10);
        res.status(200).send({ statusCode: 200, message: "OK", messages: messages });
    }
};
__decorate([
    (0, common_1.Post)("fetch/:id"),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "FetchMessages", null);
MessageController = __decorate([
    (0, common_1.Controller)("message"),
    __param(0, (0, common_1.Inject)(app_message_manager_1.MessageManager)),
    __param(1, (0, common_1.Inject)(app_channel_manager_1.ChannelManager)),
    __metadata("design:paramtypes", [typeof (_a = typeof app_message_manager_1.MessageManager !== "undefined" && app_message_manager_1.MessageManager) === "function" ? _a : Object, typeof (_b = typeof app_channel_manager_1.ChannelManager !== "undefined" && app_channel_manager_1.ChannelManager) === "function" ? _b : Object])
], MessageController);
exports.MessageController = MessageController;


/***/ }),
/* 29 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const common_1 = __webpack_require__(6);
const app_user_manager_1 = __webpack_require__(12);
const authenticator = __webpack_require__(16);
let AuthController = class AuthController {
    constructor(userManager) {
        this.userManager = userManager;
    }
    async Auth(body, res, req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        if (req.MUser.GetAuth()) {
            await this.userManager.Disable2FA(req.MUser);
            res.status(200).send({ statusCode: 200, message: "OK" });
            return;
        }
        await this.userManager.Generate2FA(req.MUser);
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
    async AuthToken(body, res, req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        if (!req.MUser.GetAuth()) {
            res.status(400).send({ statusCode: 400, message: "You don't have 2FA enabled" });
            return;
        }
        const token = body.token;
        if (!token) {
            res.status(400).send({ statusCode: 400, message: "Please enter a code" });
            return;
        }
        if (!authenticator.verifyToken(req.MUser.GetAuth(), token)) {
            res.status(401).send({ statusCode: 401, message: "Wrong code" });
            return;
        }
        req.MUser.SetNeedAuth(false);
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
    async AuthConfirm(body, res, req) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        if (!req.MUser.GetTempAuth()) {
            res.status(400).send({ statusCode: 400, message: "You don't have pending 2FA" });
            return;
        }
        const token = body.token;
        if (!token) {
            res.status(400).send({ statusCode: 400, message: "Please enter code" });
            return;
        }
        if (!authenticator.verifyToken(req.MUser.GetTempAuth(), token)) {
            res.status(401).send({ statusCode: 401, message: "Wrong code" });
            return;
        }
        this.userManager.Enable2FA(req.MUser, req.MUser.GetTempAuth());
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
};
__decorate([
    (0, common_1.Post)(""),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "Auth", null);
__decorate([
    (0, common_1.Post)("token"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "AuthToken", null);
__decorate([
    (0, common_1.Post)("confirm"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "AuthConfirm", null);
AuthController = __decorate([
    (0, common_1.Controller)("auth"),
    __param(0, (0, common_1.Inject)(app_user_manager_1.UserManager)),
    __metadata("design:paramtypes", [typeof (_a = typeof app_user_manager_1.UserManager !== "undefined" && app_user_manager_1.UserManager) === "function" ? _a : Object])
], AuthController);
exports.AuthController = AuthController;


/***/ }),
/* 30 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GameController = void 0;
const common_1 = __webpack_require__(6);
const app_match_manager_1 = __webpack_require__(8);
const app_user_manager_1 = __webpack_require__(12);
let GameController = class GameController {
    constructor(matchManager, userManager) {
        this.matchManager = matchManager;
        this.userManager = userManager;
    }
    matchMaking(req, res, body) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        if (req.MUser.GetSpectate()) {
            req.MUser.GetSpectate().RemoveSpectator(req.MUser);
            res.status(200).send({ statusCode: 200, message: "OK", status: 0 });
        }
        else if (req.MUser.GetMatchMaking()) {
            if (req.MUser.GetMatch() && req.MUser.GetMatch().GetGameStarted()) {
                res.status(400).send({ statusCode: 400, message: "Bad Request" });
                return;
            }
            this.matchManager.matchMaking(req.MUser, true);
            res.status(200).send({ statusCode: 200, message: "OK", status: 0 });
        }
        else {
            if (body.type == null) {
                res.status(400).send({ statusCode: 400, message: "Bad Request" });
                return;
            }
            body.type = parseInt(body.type);
            if (body.type < 0 || body.type > 2) {
                res.status(400).send({ statusCode: 400, message: "Bad Request" });
                return;
            }
            const started = this.matchManager.matchMaking(req.MUser, false, body.type);
            res.status(200).send({ statusCode: 200, message: "OK", status: started && 4 || 1 });
        }
    }
    spectate(req, res, body) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        const userID = body.id;
        if (!userID) {
            res.status(400).send({ statusCode: 400, message: "Bad Request" });
            return;
        }
        if (req.MUser.GetMatchMaking() || req.MUser.GetSpectate() || req.MUser.GetMatch() || req.MUser.IsPlaying()) {
            res.status(400).send({ statusCode: 400, message: "You are already in/spectating a match" });
            return;
        }
        const user = this.userManager.GetUser(userID);
        if (!user) {
            res.status(404).send({ statusCode: 404, message: "The user was not found" });
            return;
        }
        const match = user.GetMatch();
        if (!match) {
            res.status(400).send({ statusCode: 400, message: "The user is not in a match" });
            return;
        }
        else if (req.MUser.GetMatchMaking() || req.MUser.GetSpectate()) {
            res.status(400).send({ statusCode: 400, message: "You are already in/spectating a match" });
            return;
        }
        match.AddSpectator(req.MUser);
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
    invite(req, res, body) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        else if (!req.MUser.CanInvite()) {
            res.status(400).send({ statusCode: 400, message: "You can't invite someone you are already in/spectating a match" });
            return;
        }
        const userID = body.id;
        if (!userID) {
            res.status(400).send({ statusCode: 400, message: "Bad Request" });
            return;
        }
        const user = this.userManager.GetUser(userID);
        if (!user) {
            res.status(404).send({ statusCode: 404, message: "Not Found" });
            return;
        }
        else if (!user.CanInvite()) {
            res.status(400).send({ statusCode: 400, message: "The user is already in/spectating a match" });
            return;
        }
        else if (user.GetInvite()) {
            res.status(400).send({ statusCode: 400, message: "The user is already invited" });
            return;
        }
        user.SetInvite(req.MUser);
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
    accept(req, res) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        const user = req.MUser.GetInvite();
        if (!user) {
            res.status(400).send({ statusCode: 400, message: "Bad Request" });
            return;
        }
        else if (!user.CanInvite() || !req.MUser.CanInvite()) {
            req.MUser.SetInvite(null);
            res.status(400).send({ statusCode: 400, message: "This invite is no longer valid" });
            return;
        }
        req.MUser.SetInvite(null);
        const match = this.matchManager.createMatch(user, 0, false);
        match.setOpponent(req.MUser);
        user.SetMatch(match);
        req.MUser.SetMatch(match);
        match.setGameStarted();
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
    decline(req, res) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({ statusCode: 401, message: "Unauthorized" });
            return;
        }
        const user = req.MUser.GetInvite();
        if (!user) {
            res.status(400).send({ statusCode: 400, message: "No invitation available" });
            return;
        }
        req.MUser.SetInvite(null);
        user.SetInvite(null);
        res.status(200).send({ statusCode: 200, message: "OK" });
    }
};
__decorate([
    (0, common_1.Post)("matchmaking"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "matchMaking", null);
__decorate([
    (0, common_1.Post)("spectate"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "spectate", null);
__decorate([
    (0, common_1.Post)("invite"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "invite", null);
__decorate([
    (0, common_1.Post)("accept"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "accept", null);
__decorate([
    (0, common_1.Post)("decline"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "decline", null);
GameController = __decorate([
    (0, common_1.Controller)("game"),
    __param(0, (0, common_1.Inject)(app_match_manager_1.MatchManager)),
    __param(1, (0, common_1.Inject)(app_user_manager_1.UserManager)),
    __metadata("design:paramtypes", [typeof (_a = typeof app_match_manager_1.MatchManager !== "undefined" && app_match_manager_1.MatchManager) === "function" ? _a : Object, typeof (_b = typeof app_user_manager_1.UserManager !== "undefined" && app_user_manager_1.UserManager) === "function" ? _b : Object])
], GameController);
exports.GameController = GameController;


/***/ }),
/* 31 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggingInterceptor = void 0;
const common_1 = __webpack_require__(6);
const app_user_manager_1 = __webpack_require__(12);
const app_user_manager_2 = __webpack_require__(12);
let LoggingInterceptor = class LoggingInterceptor {
    constructor(userManager) {
        this.userManager = userManager;
    }
    async intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        console.log(`Route: ${req.route.path}`);
        const sessions = req.cookies.session || "";
        const UserID = this.userManager.ValidToken(sessions);
        if (UserID) {
            req.MConnected = UserID;
            const MUser = this.userManager.GetUser(UserID);
            if (MUser) {
                req.MUser = MUser;
            }
            else {
                req.MUser = new app_user_manager_1.User(UserID, "", this.userManager, true, false);
            }
        }
        else {
            req.MUser = new app_user_manager_1.User(UserID, "", this.userManager, false, false);
        }
        if (req.MUser.NeedAuth() && req.route.path !== "/auth/token") {
            if (req.route.path == "/user/me") {
                res.send({ statusCode: 200, message: "Unauthorized", needAuth: true });
                return;
            }
            res.status(401).send({ statusCode: 401, message: "Unauthorized", needAuth: true });
            return;
        }
        return next.handle();
    }
};
LoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(app_user_manager_2.UserManager)),
    __metadata("design:paramtypes", [typeof (_a = typeof app_user_manager_2.UserManager !== "undefined" && app_user_manager_2.UserManager) === "function" ? _a : Object])
], LoggingInterceptor);
exports.LoggingInterceptor = LoggingInterceptor;


/***/ }),
/* 32 */
/***/ ((module) => {

"use strict";
module.exports = require("cookie-parser");

/***/ }),
/* 33 */
/***/ ((module) => {

"use strict";
module.exports = require("body-parser");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			if (cachedModule.error !== undefined) throw cachedModule.error;
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		try {
/******/ 			var execOptions = { id: moduleId, module: module, factory: __webpack_modules__[moduleId], require: __webpack_require__ };
/******/ 			__webpack_require__.i.forEach(function(handler) { handler(execOptions); });
/******/ 			module = execOptions.module;
/******/ 			execOptions.factory.call(module.exports, module, module.exports, execOptions.require);
/******/ 		} catch(e) {
/******/ 			module.error = e;
/******/ 			throw e;
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = __webpack_module_cache__;
/******/ 	
/******/ 	// expose the module execution interceptor
/******/ 	__webpack_require__.i = [];
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/get javascript update chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference all chunks
/******/ 		__webpack_require__.hu = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + "." + __webpack_require__.h() + ".hot-update.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get update manifest filename */
/******/ 	(() => {
/******/ 		__webpack_require__.hmrF = () => ("main." + __webpack_require__.h() + ".hot-update.json");
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/getFullHash */
/******/ 	(() => {
/******/ 		__webpack_require__.h = () => ("8af38e277547ee9ab989")
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hot module replacement */
/******/ 	(() => {
/******/ 		var currentModuleData = {};
/******/ 		var installedModules = __webpack_require__.c;
/******/ 		
/******/ 		// module and require creation
/******/ 		var currentChildModule;
/******/ 		var currentParents = [];
/******/ 		
/******/ 		// status
/******/ 		var registeredStatusHandlers = [];
/******/ 		var currentStatus = "idle";
/******/ 		
/******/ 		// while downloading
/******/ 		var blockingPromises = 0;
/******/ 		var blockingPromisesWaiting = [];
/******/ 		
/******/ 		// The update info
/******/ 		var currentUpdateApplyHandlers;
/******/ 		var queuedInvalidatedModules;
/******/ 		
/******/ 		// eslint-disable-next-line no-unused-vars
/******/ 		__webpack_require__.hmrD = currentModuleData;
/******/ 		
/******/ 		__webpack_require__.i.push(function (options) {
/******/ 			var module = options.module;
/******/ 			var require = createRequire(options.require, options.id);
/******/ 			module.hot = createModuleHotObject(options.id, module);
/******/ 			module.parents = currentParents;
/******/ 			module.children = [];
/******/ 			currentParents = [];
/******/ 			options.require = require;
/******/ 		});
/******/ 		
/******/ 		__webpack_require__.hmrC = {};
/******/ 		__webpack_require__.hmrI = {};
/******/ 		
/******/ 		function createRequire(require, moduleId) {
/******/ 			var me = installedModules[moduleId];
/******/ 			if (!me) return require;
/******/ 			var fn = function (request) {
/******/ 				if (me.hot.active) {
/******/ 					if (installedModules[request]) {
/******/ 						var parents = installedModules[request].parents;
/******/ 						if (parents.indexOf(moduleId) === -1) {
/******/ 							parents.push(moduleId);
/******/ 						}
/******/ 					} else {
/******/ 						currentParents = [moduleId];
/******/ 						currentChildModule = request;
/******/ 					}
/******/ 					if (me.children.indexOf(request) === -1) {
/******/ 						me.children.push(request);
/******/ 					}
/******/ 				} else {
/******/ 					console.warn(
/******/ 						"[HMR] unexpected require(" +
/******/ 							request +
/******/ 							") from disposed module " +
/******/ 							moduleId
/******/ 					);
/******/ 					currentParents = [];
/******/ 				}
/******/ 				return require(request);
/******/ 			};
/******/ 			var createPropertyDescriptor = function (name) {
/******/ 				return {
/******/ 					configurable: true,
/******/ 					enumerable: true,
/******/ 					get: function () {
/******/ 						return require[name];
/******/ 					},
/******/ 					set: function (value) {
/******/ 						require[name] = value;
/******/ 					}
/******/ 				};
/******/ 			};
/******/ 			for (var name in require) {
/******/ 				if (Object.prototype.hasOwnProperty.call(require, name) && name !== "e") {
/******/ 					Object.defineProperty(fn, name, createPropertyDescriptor(name));
/******/ 				}
/******/ 			}
/******/ 			fn.e = function (chunkId) {
/******/ 				return trackBlockingPromise(require.e(chunkId));
/******/ 			};
/******/ 			return fn;
/******/ 		}
/******/ 		
/******/ 		function createModuleHotObject(moduleId, me) {
/******/ 			var _main = currentChildModule !== moduleId;
/******/ 			var hot = {
/******/ 				// private stuff
/******/ 				_acceptedDependencies: {},
/******/ 				_acceptedErrorHandlers: {},
/******/ 				_declinedDependencies: {},
/******/ 				_selfAccepted: false,
/******/ 				_selfDeclined: false,
/******/ 				_selfInvalidated: false,
/******/ 				_disposeHandlers: [],
/******/ 				_main: _main,
/******/ 				_requireSelf: function () {
/******/ 					currentParents = me.parents.slice();
/******/ 					currentChildModule = _main ? undefined : moduleId;
/******/ 					__webpack_require__(moduleId);
/******/ 				},
/******/ 		
/******/ 				// Module API
/******/ 				active: true,
/******/ 				accept: function (dep, callback, errorHandler) {
/******/ 					if (dep === undefined) hot._selfAccepted = true;
/******/ 					else if (typeof dep === "function") hot._selfAccepted = dep;
/******/ 					else if (typeof dep === "object" && dep !== null) {
/******/ 						for (var i = 0; i < dep.length; i++) {
/******/ 							hot._acceptedDependencies[dep[i]] = callback || function () {};
/******/ 							hot._acceptedErrorHandlers[dep[i]] = errorHandler;
/******/ 						}
/******/ 					} else {
/******/ 						hot._acceptedDependencies[dep] = callback || function () {};
/******/ 						hot._acceptedErrorHandlers[dep] = errorHandler;
/******/ 					}
/******/ 				},
/******/ 				decline: function (dep) {
/******/ 					if (dep === undefined) hot._selfDeclined = true;
/******/ 					else if (typeof dep === "object" && dep !== null)
/******/ 						for (var i = 0; i < dep.length; i++)
/******/ 							hot._declinedDependencies[dep[i]] = true;
/******/ 					else hot._declinedDependencies[dep] = true;
/******/ 				},
/******/ 				dispose: function (callback) {
/******/ 					hot._disposeHandlers.push(callback);
/******/ 				},
/******/ 				addDisposeHandler: function (callback) {
/******/ 					hot._disposeHandlers.push(callback);
/******/ 				},
/******/ 				removeDisposeHandler: function (callback) {
/******/ 					var idx = hot._disposeHandlers.indexOf(callback);
/******/ 					if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 				},
/******/ 				invalidate: function () {
/******/ 					this._selfInvalidated = true;
/******/ 					switch (currentStatus) {
/******/ 						case "idle":
/******/ 							currentUpdateApplyHandlers = [];
/******/ 							Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 								__webpack_require__.hmrI[key](
/******/ 									moduleId,
/******/ 									currentUpdateApplyHandlers
/******/ 								);
/******/ 							});
/******/ 							setStatus("ready");
/******/ 							break;
/******/ 						case "ready":
/******/ 							Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 								__webpack_require__.hmrI[key](
/******/ 									moduleId,
/******/ 									currentUpdateApplyHandlers
/******/ 								);
/******/ 							});
/******/ 							break;
/******/ 						case "prepare":
/******/ 						case "check":
/******/ 						case "dispose":
/******/ 						case "apply":
/******/ 							(queuedInvalidatedModules = queuedInvalidatedModules || []).push(
/******/ 								moduleId
/******/ 							);
/******/ 							break;
/******/ 						default:
/******/ 							// ignore requests in error states
/******/ 							break;
/******/ 					}
/******/ 				},
/******/ 		
/******/ 				// Management API
/******/ 				check: hotCheck,
/******/ 				apply: hotApply,
/******/ 				status: function (l) {
/******/ 					if (!l) return currentStatus;
/******/ 					registeredStatusHandlers.push(l);
/******/ 				},
/******/ 				addStatusHandler: function (l) {
/******/ 					registeredStatusHandlers.push(l);
/******/ 				},
/******/ 				removeStatusHandler: function (l) {
/******/ 					var idx = registeredStatusHandlers.indexOf(l);
/******/ 					if (idx >= 0) registeredStatusHandlers.splice(idx, 1);
/******/ 				},
/******/ 		
/******/ 				//inherit from previous dispose call
/******/ 				data: currentModuleData[moduleId]
/******/ 			};
/******/ 			currentChildModule = undefined;
/******/ 			return hot;
/******/ 		}
/******/ 		
/******/ 		function setStatus(newStatus) {
/******/ 			currentStatus = newStatus;
/******/ 			var results = [];
/******/ 		
/******/ 			for (var i = 0; i < registeredStatusHandlers.length; i++)
/******/ 				results[i] = registeredStatusHandlers[i].call(null, newStatus);
/******/ 		
/******/ 			return Promise.all(results);
/******/ 		}
/******/ 		
/******/ 		function unblock() {
/******/ 			if (--blockingPromises === 0) {
/******/ 				setStatus("ready").then(function () {
/******/ 					if (blockingPromises === 0) {
/******/ 						var list = blockingPromisesWaiting;
/******/ 						blockingPromisesWaiting = [];
/******/ 						for (var i = 0; i < list.length; i++) {
/******/ 							list[i]();
/******/ 						}
/******/ 					}
/******/ 				});
/******/ 			}
/******/ 		}
/******/ 		
/******/ 		function trackBlockingPromise(promise) {
/******/ 			switch (currentStatus) {
/******/ 				case "ready":
/******/ 					setStatus("prepare");
/******/ 				/* fallthrough */
/******/ 				case "prepare":
/******/ 					blockingPromises++;
/******/ 					promise.then(unblock, unblock);
/******/ 					return promise;
/******/ 				default:
/******/ 					return promise;
/******/ 			}
/******/ 		}
/******/ 		
/******/ 		function waitForBlockingPromises(fn) {
/******/ 			if (blockingPromises === 0) return fn();
/******/ 			return new Promise(function (resolve) {
/******/ 				blockingPromisesWaiting.push(function () {
/******/ 					resolve(fn());
/******/ 				});
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		function hotCheck(applyOnUpdate) {
/******/ 			if (currentStatus !== "idle") {
/******/ 				throw new Error("check() is only allowed in idle status");
/******/ 			}
/******/ 			return setStatus("check")
/******/ 				.then(__webpack_require__.hmrM)
/******/ 				.then(function (update) {
/******/ 					if (!update) {
/******/ 						return setStatus(applyInvalidatedModules() ? "ready" : "idle").then(
/******/ 							function () {
/******/ 								return null;
/******/ 							}
/******/ 						);
/******/ 					}
/******/ 		
/******/ 					return setStatus("prepare").then(function () {
/******/ 						var updatedModules = [];
/******/ 						currentUpdateApplyHandlers = [];
/******/ 		
/******/ 						return Promise.all(
/******/ 							Object.keys(__webpack_require__.hmrC).reduce(function (
/******/ 								promises,
/******/ 								key
/******/ 							) {
/******/ 								__webpack_require__.hmrC[key](
/******/ 									update.c,
/******/ 									update.r,
/******/ 									update.m,
/******/ 									promises,
/******/ 									currentUpdateApplyHandlers,
/******/ 									updatedModules
/******/ 								);
/******/ 								return promises;
/******/ 							},
/******/ 							[])
/******/ 						).then(function () {
/******/ 							return waitForBlockingPromises(function () {
/******/ 								if (applyOnUpdate) {
/******/ 									return internalApply(applyOnUpdate);
/******/ 								} else {
/******/ 									return setStatus("ready").then(function () {
/******/ 										return updatedModules;
/******/ 									});
/******/ 								}
/******/ 							});
/******/ 						});
/******/ 					});
/******/ 				});
/******/ 		}
/******/ 		
/******/ 		function hotApply(options) {
/******/ 			if (currentStatus !== "ready") {
/******/ 				return Promise.resolve().then(function () {
/******/ 					throw new Error(
/******/ 						"apply() is only allowed in ready status (state: " +
/******/ 							currentStatus +
/******/ 							")"
/******/ 					);
/******/ 				});
/******/ 			}
/******/ 			return internalApply(options);
/******/ 		}
/******/ 		
/******/ 		function internalApply(options) {
/******/ 			options = options || {};
/******/ 		
/******/ 			applyInvalidatedModules();
/******/ 		
/******/ 			var results = currentUpdateApplyHandlers.map(function (handler) {
/******/ 				return handler(options);
/******/ 			});
/******/ 			currentUpdateApplyHandlers = undefined;
/******/ 		
/******/ 			var errors = results
/******/ 				.map(function (r) {
/******/ 					return r.error;
/******/ 				})
/******/ 				.filter(Boolean);
/******/ 		
/******/ 			if (errors.length > 0) {
/******/ 				return setStatus("abort").then(function () {
/******/ 					throw errors[0];
/******/ 				});
/******/ 			}
/******/ 		
/******/ 			// Now in "dispose" phase
/******/ 			var disposePromise = setStatus("dispose");
/******/ 		
/******/ 			results.forEach(function (result) {
/******/ 				if (result.dispose) result.dispose();
/******/ 			});
/******/ 		
/******/ 			// Now in "apply" phase
/******/ 			var applyPromise = setStatus("apply");
/******/ 		
/******/ 			var error;
/******/ 			var reportError = function (err) {
/******/ 				if (!error) error = err;
/******/ 			};
/******/ 		
/******/ 			var outdatedModules = [];
/******/ 			results.forEach(function (result) {
/******/ 				if (result.apply) {
/******/ 					var modules = result.apply(reportError);
/******/ 					if (modules) {
/******/ 						for (var i = 0; i < modules.length; i++) {
/******/ 							outdatedModules.push(modules[i]);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			});
/******/ 		
/******/ 			return Promise.all([disposePromise, applyPromise]).then(function () {
/******/ 				// handle errors in accept handlers and self accepted module load
/******/ 				if (error) {
/******/ 					return setStatus("fail").then(function () {
/******/ 						throw error;
/******/ 					});
/******/ 				}
/******/ 		
/******/ 				if (queuedInvalidatedModules) {
/******/ 					return internalApply(options).then(function (list) {
/******/ 						outdatedModules.forEach(function (moduleId) {
/******/ 							if (list.indexOf(moduleId) < 0) list.push(moduleId);
/******/ 						});
/******/ 						return list;
/******/ 					});
/******/ 				}
/******/ 		
/******/ 				return setStatus("idle").then(function () {
/******/ 					return outdatedModules;
/******/ 				});
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		function applyInvalidatedModules() {
/******/ 			if (queuedInvalidatedModules) {
/******/ 				if (!currentUpdateApplyHandlers) currentUpdateApplyHandlers = [];
/******/ 				Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 					queuedInvalidatedModules.forEach(function (moduleId) {
/******/ 						__webpack_require__.hmrI[key](
/******/ 							moduleId,
/******/ 							currentUpdateApplyHandlers
/******/ 						);
/******/ 					});
/******/ 				});
/******/ 				queuedInvalidatedModules = undefined;
/******/ 				return true;
/******/ 			}
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/require chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "loaded", otherwise not loaded yet
/******/ 		var installedChunks = __webpack_require__.hmrS_require = __webpack_require__.hmrS_require || {
/******/ 			0: 1
/******/ 		};
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no chunk install function needed
/******/ 		
/******/ 		// no chunk loading
/******/ 		
/******/ 		// no external install chunk
/******/ 		
/******/ 		function loadUpdateChunk(chunkId, updatedModulesList) {
/******/ 			var update = require("./" + __webpack_require__.hu(chunkId));
/******/ 			var updatedModules = update.modules;
/******/ 			var runtime = update.runtime;
/******/ 			for(var moduleId in updatedModules) {
/******/ 				if(__webpack_require__.o(updatedModules, moduleId)) {
/******/ 					currentUpdate[moduleId] = updatedModules[moduleId];
/******/ 					if(updatedModulesList) updatedModulesList.push(moduleId);
/******/ 				}
/******/ 			}
/******/ 			if(runtime) currentUpdateRuntime.push(runtime);
/******/ 		}
/******/ 		
/******/ 		var currentUpdateChunks;
/******/ 		var currentUpdate;
/******/ 		var currentUpdateRemovedChunks;
/******/ 		var currentUpdateRuntime;
/******/ 		function applyHandler(options) {
/******/ 			if (__webpack_require__.f) delete __webpack_require__.f.requireHmr;
/******/ 			currentUpdateChunks = undefined;
/******/ 			function getAffectedModuleEffects(updateModuleId) {
/******/ 				var outdatedModules = [updateModuleId];
/******/ 				var outdatedDependencies = {};
/******/ 		
/******/ 				var queue = outdatedModules.map(function (id) {
/******/ 					return {
/******/ 						chain: [id],
/******/ 						id: id
/******/ 					};
/******/ 				});
/******/ 				while (queue.length > 0) {
/******/ 					var queueItem = queue.pop();
/******/ 					var moduleId = queueItem.id;
/******/ 					var chain = queueItem.chain;
/******/ 					var module = __webpack_require__.c[moduleId];
/******/ 					if (
/******/ 						!module ||
/******/ 						(module.hot._selfAccepted && !module.hot._selfInvalidated)
/******/ 					)
/******/ 						continue;
/******/ 					if (module.hot._selfDeclined) {
/******/ 						return {
/******/ 							type: "self-declined",
/******/ 							chain: chain,
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					if (module.hot._main) {
/******/ 						return {
/******/ 							type: "unaccepted",
/******/ 							chain: chain,
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					for (var i = 0; i < module.parents.length; i++) {
/******/ 						var parentId = module.parents[i];
/******/ 						var parent = __webpack_require__.c[parentId];
/******/ 						if (!parent) continue;
/******/ 						if (parent.hot._declinedDependencies[moduleId]) {
/******/ 							return {
/******/ 								type: "declined",
/******/ 								chain: chain.concat([parentId]),
/******/ 								moduleId: moduleId,
/******/ 								parentId: parentId
/******/ 							};
/******/ 						}
/******/ 						if (outdatedModules.indexOf(parentId) !== -1) continue;
/******/ 						if (parent.hot._acceptedDependencies[moduleId]) {
/******/ 							if (!outdatedDependencies[parentId])
/******/ 								outdatedDependencies[parentId] = [];
/******/ 							addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 							continue;
/******/ 						}
/******/ 						delete outdatedDependencies[parentId];
/******/ 						outdatedModules.push(parentId);
/******/ 						queue.push({
/******/ 							chain: chain.concat([parentId]),
/******/ 							id: parentId
/******/ 						});
/******/ 					}
/******/ 				}
/******/ 		
/******/ 				return {
/******/ 					type: "accepted",
/******/ 					moduleId: updateModuleId,
/******/ 					outdatedModules: outdatedModules,
/******/ 					outdatedDependencies: outdatedDependencies
/******/ 				};
/******/ 			}
/******/ 		
/******/ 			function addAllToSet(a, b) {
/******/ 				for (var i = 0; i < b.length; i++) {
/******/ 					var item = b[i];
/******/ 					if (a.indexOf(item) === -1) a.push(item);
/******/ 				}
/******/ 			}
/******/ 		
/******/ 			// at begin all updates modules are outdated
/******/ 			// the "outdated" status can propagate to parents if they don't accept the children
/******/ 			var outdatedDependencies = {};
/******/ 			var outdatedModules = [];
/******/ 			var appliedUpdate = {};
/******/ 		
/******/ 			var warnUnexpectedRequire = function warnUnexpectedRequire(module) {
/******/ 				console.warn(
/******/ 					"[HMR] unexpected require(" + module.id + ") to disposed module"
/******/ 				);
/******/ 			};
/******/ 		
/******/ 			for (var moduleId in currentUpdate) {
/******/ 				if (__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 					var newModuleFactory = currentUpdate[moduleId];
/******/ 					/** @type {TODO} */
/******/ 					var result;
/******/ 					if (newModuleFactory) {
/******/ 						result = getAffectedModuleEffects(moduleId);
/******/ 					} else {
/******/ 						result = {
/******/ 							type: "disposed",
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					/** @type {Error|false} */
/******/ 					var abortError = false;
/******/ 					var doApply = false;
/******/ 					var doDispose = false;
/******/ 					var chainInfo = "";
/******/ 					if (result.chain) {
/******/ 						chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 					}
/******/ 					switch (result.type) {
/******/ 						case "self-declined":
/******/ 							if (options.onDeclined) options.onDeclined(result);
/******/ 							if (!options.ignoreDeclined)
/******/ 								abortError = new Error(
/******/ 									"Aborted because of self decline: " +
/******/ 										result.moduleId +
/******/ 										chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "declined":
/******/ 							if (options.onDeclined) options.onDeclined(result);
/******/ 							if (!options.ignoreDeclined)
/******/ 								abortError = new Error(
/******/ 									"Aborted because of declined dependency: " +
/******/ 										result.moduleId +
/******/ 										" in " +
/******/ 										result.parentId +
/******/ 										chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "unaccepted":
/******/ 							if (options.onUnaccepted) options.onUnaccepted(result);
/******/ 							if (!options.ignoreUnaccepted)
/******/ 								abortError = new Error(
/******/ 									"Aborted because " + moduleId + " is not accepted" + chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "accepted":
/******/ 							if (options.onAccepted) options.onAccepted(result);
/******/ 							doApply = true;
/******/ 							break;
/******/ 						case "disposed":
/******/ 							if (options.onDisposed) options.onDisposed(result);
/******/ 							doDispose = true;
/******/ 							break;
/******/ 						default:
/******/ 							throw new Error("Unexception type " + result.type);
/******/ 					}
/******/ 					if (abortError) {
/******/ 						return {
/******/ 							error: abortError
/******/ 						};
/******/ 					}
/******/ 					if (doApply) {
/******/ 						appliedUpdate[moduleId] = newModuleFactory;
/******/ 						addAllToSet(outdatedModules, result.outdatedModules);
/******/ 						for (moduleId in result.outdatedDependencies) {
/******/ 							if (__webpack_require__.o(result.outdatedDependencies, moduleId)) {
/******/ 								if (!outdatedDependencies[moduleId])
/******/ 									outdatedDependencies[moduleId] = [];
/******/ 								addAllToSet(
/******/ 									outdatedDependencies[moduleId],
/******/ 									result.outdatedDependencies[moduleId]
/******/ 								);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 					if (doDispose) {
/******/ 						addAllToSet(outdatedModules, [result.moduleId]);
/******/ 						appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 			currentUpdate = undefined;
/******/ 		
/******/ 			// Store self accepted outdated modules to require them later by the module system
/******/ 			var outdatedSelfAcceptedModules = [];
/******/ 			for (var j = 0; j < outdatedModules.length; j++) {
/******/ 				var outdatedModuleId = outdatedModules[j];
/******/ 				var module = __webpack_require__.c[outdatedModuleId];
/******/ 				if (
/******/ 					module &&
/******/ 					(module.hot._selfAccepted || module.hot._main) &&
/******/ 					// removed self-accepted modules should not be required
/******/ 					appliedUpdate[outdatedModuleId] !== warnUnexpectedRequire &&
/******/ 					// when called invalidate self-accepting is not possible
/******/ 					!module.hot._selfInvalidated
/******/ 				) {
/******/ 					outdatedSelfAcceptedModules.push({
/******/ 						module: outdatedModuleId,
/******/ 						require: module.hot._requireSelf,
/******/ 						errorHandler: module.hot._selfAccepted
/******/ 					});
/******/ 				}
/******/ 			}
/******/ 		
/******/ 			var moduleOutdatedDependencies;
/******/ 		
/******/ 			return {
/******/ 				dispose: function () {
/******/ 					currentUpdateRemovedChunks.forEach(function (chunkId) {
/******/ 						delete installedChunks[chunkId];
/******/ 					});
/******/ 					currentUpdateRemovedChunks = undefined;
/******/ 		
/******/ 					var idx;
/******/ 					var queue = outdatedModules.slice();
/******/ 					while (queue.length > 0) {
/******/ 						var moduleId = queue.pop();
/******/ 						var module = __webpack_require__.c[moduleId];
/******/ 						if (!module) continue;
/******/ 		
/******/ 						var data = {};
/******/ 		
/******/ 						// Call dispose handlers
/******/ 						var disposeHandlers = module.hot._disposeHandlers;
/******/ 						for (j = 0; j < disposeHandlers.length; j++) {
/******/ 							disposeHandlers[j].call(null, data);
/******/ 						}
/******/ 						__webpack_require__.hmrD[moduleId] = data;
/******/ 		
/******/ 						// disable module (this disables requires from this module)
/******/ 						module.hot.active = false;
/******/ 		
/******/ 						// remove module from cache
/******/ 						delete __webpack_require__.c[moduleId];
/******/ 		
/******/ 						// when disposing there is no need to call dispose handler
/******/ 						delete outdatedDependencies[moduleId];
/******/ 		
/******/ 						// remove "parents" references from all children
/******/ 						for (j = 0; j < module.children.length; j++) {
/******/ 							var child = __webpack_require__.c[module.children[j]];
/******/ 							if (!child) continue;
/******/ 							idx = child.parents.indexOf(moduleId);
/******/ 							if (idx >= 0) {
/******/ 								child.parents.splice(idx, 1);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// remove outdated dependency from module children
/******/ 					var dependency;
/******/ 					for (var outdatedModuleId in outdatedDependencies) {
/******/ 						if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 							module = __webpack_require__.c[outdatedModuleId];
/******/ 							if (module) {
/******/ 								moduleOutdatedDependencies =
/******/ 									outdatedDependencies[outdatedModuleId];
/******/ 								for (j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 									dependency = moduleOutdatedDependencies[j];
/******/ 									idx = module.children.indexOf(dependency);
/******/ 									if (idx >= 0) module.children.splice(idx, 1);
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				},
/******/ 				apply: function (reportError) {
/******/ 					// insert new code
/******/ 					for (var updateModuleId in appliedUpdate) {
/******/ 						if (__webpack_require__.o(appliedUpdate, updateModuleId)) {
/******/ 							__webpack_require__.m[updateModuleId] = appliedUpdate[updateModuleId];
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// run new runtime modules
/******/ 					for (var i = 0; i < currentUpdateRuntime.length; i++) {
/******/ 						currentUpdateRuntime[i](__webpack_require__);
/******/ 					}
/******/ 		
/******/ 					// call accept handlers
/******/ 					for (var outdatedModuleId in outdatedDependencies) {
/******/ 						if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 							var module = __webpack_require__.c[outdatedModuleId];
/******/ 							if (module) {
/******/ 								moduleOutdatedDependencies =
/******/ 									outdatedDependencies[outdatedModuleId];
/******/ 								var callbacks = [];
/******/ 								var errorHandlers = [];
/******/ 								var dependenciesForCallbacks = [];
/******/ 								for (var j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 									var dependency = moduleOutdatedDependencies[j];
/******/ 									var acceptCallback =
/******/ 										module.hot._acceptedDependencies[dependency];
/******/ 									var errorHandler =
/******/ 										module.hot._acceptedErrorHandlers[dependency];
/******/ 									if (acceptCallback) {
/******/ 										if (callbacks.indexOf(acceptCallback) !== -1) continue;
/******/ 										callbacks.push(acceptCallback);
/******/ 										errorHandlers.push(errorHandler);
/******/ 										dependenciesForCallbacks.push(dependency);
/******/ 									}
/******/ 								}
/******/ 								for (var k = 0; k < callbacks.length; k++) {
/******/ 									try {
/******/ 										callbacks[k].call(null, moduleOutdatedDependencies);
/******/ 									} catch (err) {
/******/ 										if (typeof errorHandlers[k] === "function") {
/******/ 											try {
/******/ 												errorHandlers[k](err, {
/******/ 													moduleId: outdatedModuleId,
/******/ 													dependencyId: dependenciesForCallbacks[k]
/******/ 												});
/******/ 											} catch (err2) {
/******/ 												if (options.onErrored) {
/******/ 													options.onErrored({
/******/ 														type: "accept-error-handler-errored",
/******/ 														moduleId: outdatedModuleId,
/******/ 														dependencyId: dependenciesForCallbacks[k],
/******/ 														error: err2,
/******/ 														originalError: err
/******/ 													});
/******/ 												}
/******/ 												if (!options.ignoreErrored) {
/******/ 													reportError(err2);
/******/ 													reportError(err);
/******/ 												}
/******/ 											}
/******/ 										} else {
/******/ 											if (options.onErrored) {
/******/ 												options.onErrored({
/******/ 													type: "accept-errored",
/******/ 													moduleId: outdatedModuleId,
/******/ 													dependencyId: dependenciesForCallbacks[k],
/******/ 													error: err
/******/ 												});
/******/ 											}
/******/ 											if (!options.ignoreErrored) {
/******/ 												reportError(err);
/******/ 											}
/******/ 										}
/******/ 									}
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// Load self accepted modules
/******/ 					for (var o = 0; o < outdatedSelfAcceptedModules.length; o++) {
/******/ 						var item = outdatedSelfAcceptedModules[o];
/******/ 						var moduleId = item.module;
/******/ 						try {
/******/ 							item.require(moduleId);
/******/ 						} catch (err) {
/******/ 							if (typeof item.errorHandler === "function") {
/******/ 								try {
/******/ 									item.errorHandler(err, {
/******/ 										moduleId: moduleId,
/******/ 										module: __webpack_require__.c[moduleId]
/******/ 									});
/******/ 								} catch (err2) {
/******/ 									if (options.onErrored) {
/******/ 										options.onErrored({
/******/ 											type: "self-accept-error-handler-errored",
/******/ 											moduleId: moduleId,
/******/ 											error: err2,
/******/ 											originalError: err
/******/ 										});
/******/ 									}
/******/ 									if (!options.ignoreErrored) {
/******/ 										reportError(err2);
/******/ 										reportError(err);
/******/ 									}
/******/ 								}
/******/ 							} else {
/******/ 								if (options.onErrored) {
/******/ 									options.onErrored({
/******/ 										type: "self-accept-errored",
/******/ 										moduleId: moduleId,
/******/ 										error: err
/******/ 									});
/******/ 								}
/******/ 								if (!options.ignoreErrored) {
/******/ 									reportError(err);
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					return outdatedModules;
/******/ 				}
/******/ 			};
/******/ 		}
/******/ 		__webpack_require__.hmrI.require = function (moduleId, applyHandlers) {
/******/ 			if (!currentUpdate) {
/******/ 				currentUpdate = {};
/******/ 				currentUpdateRuntime = [];
/******/ 				currentUpdateRemovedChunks = [];
/******/ 				applyHandlers.push(applyHandler);
/******/ 			}
/******/ 			if (!__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 				currentUpdate[moduleId] = __webpack_require__.m[moduleId];
/******/ 			}
/******/ 		};
/******/ 		__webpack_require__.hmrC.require = function (
/******/ 			chunkIds,
/******/ 			removedChunks,
/******/ 			removedModules,
/******/ 			promises,
/******/ 			applyHandlers,
/******/ 			updatedModulesList
/******/ 		) {
/******/ 			applyHandlers.push(applyHandler);
/******/ 			currentUpdateChunks = {};
/******/ 			currentUpdateRemovedChunks = removedChunks;
/******/ 			currentUpdate = removedModules.reduce(function (obj, key) {
/******/ 				obj[key] = false;
/******/ 				return obj;
/******/ 			}, {});
/******/ 			currentUpdateRuntime = [];
/******/ 			chunkIds.forEach(function (chunkId) {
/******/ 				if (
/******/ 					__webpack_require__.o(installedChunks, chunkId) &&
/******/ 					installedChunks[chunkId] !== undefined
/******/ 				) {
/******/ 					promises.push(loadUpdateChunk(chunkId, updatedModulesList));
/******/ 					currentUpdateChunks[chunkId] = true;
/******/ 				} else {
/******/ 					currentUpdateChunks[chunkId] = false;
/******/ 				}
/******/ 			});
/******/ 			if (__webpack_require__.f) {
/******/ 				__webpack_require__.f.requireHmr = function (chunkId, promises) {
/******/ 					if (
/******/ 						currentUpdateChunks &&
/******/ 						__webpack_require__.o(currentUpdateChunks, chunkId) &&
/******/ 						!currentUpdateChunks[chunkId]
/******/ 					) {
/******/ 						promises.push(loadUpdateChunk(chunkId));
/******/ 						currentUpdateChunks[chunkId] = true;
/******/ 					}
/******/ 				};
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.hmrM = function() {
/******/ 			return Promise.resolve().then(function() {
/******/ 				return require("./" + __webpack_require__.hmrF());
/******/ 			})['catch'](function(err) { if(err.code !== 'MODULE_NOT_FOUND') throw err; });
/******/ 		}
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// module cache are used so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	__webpack_require__(0);
/******/ 	var __webpack_exports__ = __webpack_require__(3);
/******/ 	
/******/ })()
;