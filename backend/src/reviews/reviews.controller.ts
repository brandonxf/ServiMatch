import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear reseña (cliente, solo tras trabajo completado)' })
  create(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    return this.reviews.create(user.id, dto);
  }

  @Get('worker/:workerId')
  @ApiOperation({ summary: 'Reseñas de un trabajador' })
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
    const profile = await user.workerProfile;
    return this.reviews.replyToReview(user.id, id, body.reply);
  }
}
