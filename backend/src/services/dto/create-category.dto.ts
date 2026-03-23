import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Plomería' }) @IsString() @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'plomeria' }) @IsString() @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional() @IsOptional() @IsUrl()
  iconUrl?: string;
}
