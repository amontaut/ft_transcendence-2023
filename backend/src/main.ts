import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './app.service';
import { retreiveDataBase } from "./app.database";
import { UserManager } from './user/app.user.manager';
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

declare const module: any;

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		rawBody: true
	});
	app.useGlobalInterceptors(new LoggingInterceptor(app.get(UserManager)));
	app.use(cookieParser());
	app.use(bodyParser.json());
	await retreiveDataBase();
	app.enableCors({
		origin: process.env.IP + process.env.PORT_FRONT,
		credentials: true
	});
	if (module.hot) {
		module.hot.accept();
		module.hot.dispose(() => app.close());
	}
	await app.listen(8080);
	console.log("Server is running", process.env.IP);
}
bootstrap();
