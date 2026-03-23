import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../../types/prisma.types';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private services: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorías de servicios activas' })
  findAll() { return this.services.findAll(); }

  @Get(':slug')
  @ApiOperation({ summary: 'Detalle de categoría por slug' })
  findOne(@Param('slug') slug: string) { return this.services.findBySlug(slug); }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear categoría (solo admin)' })
  create(@Body() dto: CreateCategoryDto) { return this.services.create(dto); }

  @Post('seed')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'Cargar categorías iniciales (solo admin)' })
  seed() { return this.services.seed(); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar categoría (solo admin)' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateCategoryDto>) {
    return this.services.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) @ApiBearerAuth()
  @ApiOperation({ summary: 'Desactivar categoría (solo admin)' })
  remove(@Param('id') id: string) { return this.services.remove(id); }
}
