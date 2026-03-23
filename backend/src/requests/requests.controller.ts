import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestStatus } from '../types/prisma.types';

@ApiTags('Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(private requests: RequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear solicitud de servicio' })
  create(@CurrentUser() user: any, @Body() dto: CreateRequestDto) {
    return this.requests.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Mis solicitudes (como cliente o trabajador)' })
  @ApiQuery({ name: 'status', enum: RequestStatus, required: false })
  findAll(@CurrentUser() user: any, @Query('status') status?: RequestStatus) {
    return this.requests.findAll(user.id, user.role, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de solicitud' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.requests.findById(id, user.id);
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Aceptar solicitud (trabajador)' })
  accept(@Param('id') id: string, @CurrentUser() user: any) {
    return this.requests.changeStatus(id, user.id, 'ACCEPTED');
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Rechazar solicitud (trabajador)' })
  reject(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { reason?: string },
  ) {
    return this.requests.changeStatus(id, user.id, 'REJECTED', body.reason);
  }

  @Patch(':id/start')
  @ApiOperation({ summary: 'Iniciar trabajo (trabajador)' })
  start(@Param('id') id: string, @CurrentUser() user: any) {
    return this.requests.changeStatus(id, user.id, 'IN_PROGRESS');
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Completar trabajo (trabajador)' })
  complete(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { notes?: string },
  ) {
    return this.requests.changeStatus(id, user.id, 'COMPLETED', body.notes);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar solicitud (cliente o trabajador)' })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { reason?: string },
  ) {
    return this.requests.changeStatus(id, user.id, 'CANCELLED', body.reason);
  }
}
