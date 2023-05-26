import { Req, Post, Body, Res, Controller, Inject } from "@nestjs/common";
import { User, UserManager } from "src/user/app.user.manager";
const authenticator = require("authenticator");

@Controller("auth")
export class AuthController {
    constructor(@Inject(UserManager) private userManager: UserManager) {}
    @Post("")
    async Auth(@Body() body, @Res() res, @Req() req: {MUser: User}) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }

        if (req.MUser.GetAuth()) {
            await this.userManager.Disable2FA(req.MUser);
            res.status(200).send({statusCode: 200, message: "OK"});
            return
        }

        await this.userManager.Generate2FA(req.MUser);
        res.status(200).send({statusCode: 200, message: "OK"});
    }

    @Post("token")
    async AuthToken(@Body() body, @Res() res, @Req() req: {MUser: User}) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }

        if (!req.MUser.GetAuth()) {
            res.status(400).send({statusCode: 400, message: "You don't have 2FA enabled"});
            return
        }

        const token = body.token;
        if (!token) {
            res.status(400).send({statusCode: 400, message: "Please enter a code"});
            return
        }

        if (!authenticator.verifyToken(req.MUser.GetAuth(), token)) {
            res.status(401).send({statusCode: 401, message: "Wrong code"});
            return
        }
        req.MUser.SetNeedAuth(false);
        res.status(200).send({statusCode: 200, message: "OK"});
    }

    @Post("confirm")
    async AuthConfirm(@Body() body, @Res() res, @Req() req: {MUser: User}) {
        if (!req.MUser.CanAction()) {
            res.status(401).send({statusCode: 401, message: "Unauthorized"});
            return
        }

        if (!req.MUser.GetTempAuth()) {
            res.status(400).send({statusCode: 400, message: "You don't have pending 2FA"});
            return
        }

        const token = body.token;
        if (!token) {
            res.status(400).send({statusCode: 400, message: "Please enter code"});
            return
        }

        if (!authenticator.verifyToken(req.MUser.GetTempAuth(), token)) {
            res.status(401).send({statusCode: 401, message: "Wrong code"});
            return
        }

        this.userManager.Enable2FA(req.MUser, req.MUser.GetTempAuth())
        res.status(200).send({statusCode: 200, message: "OK"});
    }
}