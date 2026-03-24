import { IsNumber, IsOptional, IsString, IsBoolean, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchWorkersDto {
  @ApiPropertyOptional({ example: 'Bogotá' }) @IsOptional() @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'plomeria' }) @IsOptional() @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 4.0 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(5)
  minRating?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ default: true }) @IsOptional() @Transform(({ value }) => value === 'true' || value === true)
  available?: boolean = true;

  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(50)
  limit?: number = 20;
}
