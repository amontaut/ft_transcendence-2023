import { ConnectedSocket, WebSocketGateway, SubscribeMessage, MessageBody,OnGatewayConnection,OnGatewayDisconnect,WebSocketServer } from "@nestjs/websockets";
import { Logger, Inject } from "@nestjs/common";
import { Socket } from "socket.io";
import { NetsManager } from "./app.nets.manager";
import { UserManager } from "./user/app.user.manager";

@WebSocketGateway(3001, {
    cors: {
        origin: process.env.IP + process.env.PORT_FRONT,
        methods: ["GET", "POST"],
        credentials: true
    }
})

export class AppSocket implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(@Inject(NetsManager) private nets: NetsManager) {}
    private readonly logger = new Logger(AppSocket.name);
    users: number = 0;

    afterInit() {
        this.logger.log("Initialize");
    }

    handleConnection(@ConnectedSocket() Client: Socket) {
        this.nets.netIncoming(Client, "connected");
    }

    handleDisconnect(@ConnectedSocket() Client: Socket) {
        this.nets.netIncoming(Client, "disconnected");
    }

    @SubscribeMessage("nets")
    handleEvent(@MessageBody() data: any = {}, @ConnectedSocket() Client: Socket) {
        if (!data.net) { return; }
        this.nets.netIncoming(Client, data.net, data.args || {});
    }
}