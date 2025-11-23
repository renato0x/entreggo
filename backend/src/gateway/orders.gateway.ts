import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class OrdersGateway {
    @WebSocketServer()
    server: Server;

    emitOrderAccepted(orderId: string, driverId: string) {
        this.server.emit('order-accepted', { orderId, driverId });
    }
}
