import { Module, UseInterceptors } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppSocket } from './app.socket.manager'
import { NestjsFormDataModule } from 'nestjs-form-data';
import { AvatarController } from './app.avatar';
import { ChannelController } from './channel/app.channel.controller';
import { UserController } from './user/app.user.controller';
import { MatchManager } from './game/app.match.manager';
import { UserManager } from './user/app.user.manager';
import { ChannelManager } from './channel/app.channel.manager';
import { NetsManager } from './app.nets.manager';

import { MessageController } from './message/app.message.controller';
import { MessageManager } from './message/app.message.manager';

import { AuthController } from './auth/app.auth.controller';
import { GameController } from './game/app.match.controller';

@Module({
  imports: [
    NestjsFormDataModule,
  ],
  controllers: [AppController, AvatarController, ChannelController, UserController, MessageController, AuthController, GameController],
  providers: [ChannelManager, UserManager, MatchManager, NetsManager, MessageManager, AppSocket],
})

export class AppModule {}
