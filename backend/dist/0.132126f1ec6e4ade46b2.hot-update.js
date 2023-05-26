"use strict";
exports.id = 0;
exports.ids = null;
exports.modules = {

/***/ 7:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
        request.MUser.SetStatus();
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


/***/ })

};
exports.runtime =
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("5f1b37f142810ec1813e")
/******/ })();
/******/ 
/******/ }
;