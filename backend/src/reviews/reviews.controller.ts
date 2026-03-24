import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(
    private reviews: ReviewsService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear reseña (cliente, solo tras trabajo completado)' })
  create(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    return this.reviews.create(user.id, dto);
  }

  @Get('worker/:workerId')
  @ApiOperation({ summary: 'Reseñas de un trabajador (por workerProfile.id)' })
  findByWorker(
    @Param('workerId') workerId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.reviews.findByWorker(workerId, page, limit);
  }

  @Patch(':id/reply')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Responder reseña (trabajador)' })
  async reply(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { reply: string },
  ) {
    // Buscar el workerProfile.id a partir del userId
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) {
      throw new Error('No tienes perfil de trabajador');
    }
    return this.reviews.replyToReview(profile.id, id, body.reply);
  }
}
