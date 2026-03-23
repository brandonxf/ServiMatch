import { IsUUID, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddServiceDto {
  @ApiProperty() @IsUUID()
  categoryId: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber()
  customPrice?: number;

  @ApiPropertyOptional() @IsOptional() @IsString()
  description?: string;
}
