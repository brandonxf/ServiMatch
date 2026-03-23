import { IsNumber, IsOptional, IsString, IsBoolean, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchWorkersDto {
  @ApiProperty({ example: 4.710989 }) @Type(() => Number) @IsNumber()
  lat: number;

  @ApiProperty({ example: -74.072092 }) @Type(() => Number) @IsNumber()
  lng: number;

  @ApiPropertyOptional({ default: 10 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(100)
  radius?: number = 10;

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
