import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chat: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Mis conversaciones activas' })
  getConversations(@CurrentUser() user: any) {
    return this.chat.getConversations(user.id);
  }

  @Get(':requestId/messages')
  @ApiOperation({ summary: 'Mensajes de una conversación' })
  getMessages(
    @Param('requestId') requestId: string,
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.chat.getMessages(requestId, user.id, page);
  }

  @Post(':requestId/messages')
  @ApiOperation({ summary: 'Enviar mensaje (fallback REST)' })
  sendMessage(@CurrentUser() user: any, @Body() dto: SendMessageDto) {
    return this.chat.sendMessage(user.id, dto);
  }
}
