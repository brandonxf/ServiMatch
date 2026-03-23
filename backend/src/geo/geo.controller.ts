import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GeoService } from './geo.service';
import { SearchWorkersDto } from './dto/search-workers.dto';

@ApiTags('Geo')
@Controller('geo')
export class GeoController {
  constructor(private geo: GeoService) {}

  @Get('workers')
  @ApiOperation({ summary: 'Buscar trabajadores por ubicación y categoría' })
  search(@Query() dto: SearchWorkersDto) {
    return this.geo.searchWorkers(dto);
  }
}
