import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from "./user/app.user.manager";
import { UserManager } from './user/app.user.manager';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	constructor(@Inject(UserManager) private userManager: UserManager) {}

	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
		const req = context.switchToHttp().getRequest();
		const res = context.switchToHttp().getResponse();

		/* get route name */
		console.log(`Route: ${req.route.path}`)

		const sessions = req.cookies.session || "";
		const UserID = this.userManager.ValidToken(sessions);
		if (UserID) {
			req.MConnected = UserID;
			const MUser = this.userManager.GetUser(UserID);
			if (MUser) {
				req.MUser = MUser;
				//this.userManager.Log(UserID + " is connected [" + MUser.GetNick() + "]");
			} else {
				req.MUser = new User(UserID, "", this.userManager, true, false)
				//this.userManager.Log(UserID + " is connected but not registered");
			}
		} else {
			req.MUser = new User(UserID, "", this.userManager, false, false)
			//this.userManager.Log("User is not connected");
		}
		if (req.MUser.NeedAuth() && req.route.path !== "/auth/token") {
			if (req.route.path == "/user/me") {
				res.send({statusCode: 200, message: "Unauthorized", needAuth: true});
				return;
			}
			res.status(401).send({statusCode: 401, message: "Unauthorized", needAuth: true});
			return;
		}

		return next.handle();
	}
}