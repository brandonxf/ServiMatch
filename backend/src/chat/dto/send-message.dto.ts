import { IsString, IsUUID, IsEnum, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '../../types/prisma.types';

export class SendMessageDto {
  @ApiProperty() @IsUUID()
  requestId: string;

  @ApiProperty() @IsString()
  content: string;

  @ApiPropertyOptional({ enum: MessageType, default: MessageType.TEXT })
  @IsOptional() @IsEnum(MessageType)
  type?: MessageType;

  @ApiPropertyOptional() @IsOptional() @IsUrl()
  mediaUrl?: string;
}
