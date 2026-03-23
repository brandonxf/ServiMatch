import { IsOptional, IsString, IsNumber, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PriceUnit } from '../../types/prisma.types';
import { Type } from 'class-transformer';

export class CreateWorkerDto {
  @ApiPropertyOptional() @IsOptional() @IsString()
  bio?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber()
  basePrice?: number;

  @ApiPropertyOptional({ enum: PriceUnit }) @IsOptional() @IsEnum(PriceUnit)
  priceUnit?: PriceUnit;

  @ApiPropertyOptional({ default: 10 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(100)
  coverageRadiusKm?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber()
  latitude?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber()
  longitude?: number;

  @ApiPropertyOptional() @IsOptional() @IsString()
  city?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  address?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(60)
  yearsExperience?: number;
}
