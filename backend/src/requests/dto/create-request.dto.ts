import { IsUUID, IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateRequestDto {
  @ApiProperty() @IsUUID()
  workerId: string;

  @ApiProperty() @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'Reparación tubería cocina' }) @IsString()
  title: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber()
  latitude?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber()
  longitude?: number;

  @ApiPropertyOptional() @IsOptional() @IsString()
  address?: string;

  @ApiPropertyOptional() @IsOptional() @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber()
  budget?: number;

  @ApiPropertyOptional() @IsOptional() @IsString()
  clientNotes?: string;
}
