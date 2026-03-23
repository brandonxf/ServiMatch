import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { AddServiceDto } from './dto/add-service.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Workers')
@Controller('workers')
export class WorkersController {
  constructor(private workers: WorkersService) {}

  @Post('profile')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear perfil de trabajador' })
  create(@CurrentUser() user: any, @Body() dto: CreateWorkerDto) {
    return this.workers.create(user.id, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Mi perfil de trabajador' })
  getMyProfile(@CurrentUser() user: any) {
    return this.workers.findMyProfile(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar mi perfil de trabajador' })
  update(@CurrentUser() user: any, @Body() dto: UpdateWorkerDto) {
    return this.workers.update(user.id, dto);
  }

  @Patch('me/location')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar ubicación en tiempo real' })
  updateLocation(
    @CurrentUser() user: any,
    @Body() body: { lat: number; lng: number },
  ) {
    return this.workers.updateLocation(user.id, body.lat, body.lng);
  }

  @Patch('me/availability')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar disponibilidad' })
  setAvailability(@CurrentUser() user: any, @Body() body: { isAvailable: boolean }) {
    return this.workers.setAvailability(user.id, body.isAvailable);
  }

  @Post('me/services')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Agregar servicio al perfil' })
  addService(@CurrentUser() user: any, @Body() dto: AddServiceDto) {
    return this.workers.addService(user.id, dto);
  }

  @Delete('me/services/:serviceId')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar servicio del perfil' })
  removeService(@CurrentUser() user: any, @Param('serviceId') serviceId: string) {
    return this.workers.removeService(user.id, serviceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Perfil público del trabajador' })
  findOne(@Param('id') id: string) {
    return this.workers.findById(id);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Reseñas del trabajador' })
  @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'limit', required: false })
  getReviews(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.workers.getReviews(id, page, limit);
  }
}
