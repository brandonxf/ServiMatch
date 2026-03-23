import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { NotificationsService } from '../notifications/notifications.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private userSockets = new Map<string, string>(); // userId → socketId

  constructor(
    private chat: ChatService,
    private jwt: JwtService,
    private config: ConfigService,
    private notifications: NotificationsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) { client.disconnect(); return; }
      const payload = this.jwt.verify(token, { secret: this.config.get('JWT_SECRET') });
      client.data.userId = payload.sub;
      this.userSockets.set(payload.sub, client.id);
      client.join(`user:${payload.sub}`); // Room personal para notificaciones
      console.log(`Socket conectado: ${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.userSockets.delete(client.data.userId);
      console.log(`Socket desconectado: ${client.data.userId}`);
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { requestId: string }) {
    client.join(`request:${data.requestId}`);
    return { event: 'joined', data: { requestId: data.requestId } };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { requestId: string }) {
    client.leave(`request:${data.requestId}`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { requestId: string; content: string; type?: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;
    try {
      const message = await this.chat.sendMessage(userId, {
        requestId: data.requestId,
        content: data.content,
        type: (data.type as any) ?? 'TEXT',
      });
      // Emitir a todos en la sala del request
      this.server.to(`request:${data.requestId}`).emit('new_message', message);
      return message;
    } catch (err) {
      client.emit('error', { message: err.message });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { requestId: string }) {
    client.to(`request:${data.requestId}`).emit('user_typing', { userId: client.data.userId });
  }

  @SubscribeMessage('read_messages')
  handleRead(@ConnectedSocket() client: Socket, @MessageBody() data: { requestId: string }) {
    client.to(`request:${data.requestId}`).emit('messages_read', { userId: client.data.userId });
  }

  // Método para emitir notificaciones desde otros servicios
  emitNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }
}
