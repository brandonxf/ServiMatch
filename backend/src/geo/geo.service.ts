import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchWorkersDto } from './dto/search-workers.dto';

@Injectable()
export class GeoService {
  constructor(private prisma: PrismaService) {}

  async searchWorkers(dto: SearchWorkersDto) {
    const {
      lat, lng, radius = 10, category,
      minRating, maxPrice, available = true,
      page = 1, limit = 20,
    } = dto;

    const radiusMeters = radius * 1000;
    const skip = (page - 1) * limit;

    // Usar Prisma $queryRaw para aprovechar PostGIS
    // Si no hay PostGIS, usamos cálculo Haversine aproximado con SQL
    const workers = await (this.prisma as any).$queryRaw<any[]>`
      SELECT
        wp.id,
        wp.bio,
        wp.base_price,
        wp.price_unit,
        wp.average_rating,
        wp.review_count,
        wp.jobs_completed,
        wp.is_available,
        wp.city,
        wp.years_experience,
        wp.latitude,
        wp.longitude,
        u.id as user_id,
        u.full_name,
        u.avatar_url,
        u.phone,
        (
          6371 * acos(
            cos(radians(${lat})) * cos(radians(wp.latitude)) *
            cos(radians(wp.longitude) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(wp.latitude))
          )
        ) AS distance_km,
        (
          SELECT json_agg(json_build_object(
            'id', sc.id, 'name', sc.name, 'slug', sc.slug
          ))
          FROM worker_services ws2
          JOIN service_categories sc ON sc.id = ws2.category_id
          WHERE ws2.worker_id = wp.id
        ) as services
      FROM worker_profiles wp
      JOIN users u ON u.id = wp.user_id
      WHERE
        wp.status = 'ACTIVE'
        AND wp.latitude IS NOT NULL
        AND wp.longitude IS NOT NULL
        AND u.is_active = true
        AND (${available} = false OR wp.is_available = true)
        AND (${minRating ?? null}::float IS NULL OR wp.average_rating >= ${minRating ?? 0})
        AND (${maxPrice ?? null}::float IS NULL OR wp.base_price <= ${maxPrice ?? 999999})
        AND (
          6371 * acos(
            cos(radians(${lat})) * cos(radians(wp.latitude)) *
            cos(radians(wp.longitude) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(wp.latitude))
          )
        ) <= ${radius}
        AND (
          ${category ?? null}::text IS NULL
          OR EXISTS (
            SELECT 1 FROM worker_services ws
            JOIN service_categories sc ON sc.id = ws.category_id
            WHERE ws.worker_id = wp.id AND sc.slug = ${category ?? ''}
          )
        )
      ORDER BY wp.is_available DESC, distance_km ASC, wp.average_rating DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const totalResult = await (this.prisma as any).$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM worker_profiles wp
      JOIN users u ON u.id = wp.user_id
      WHERE
        wp.status = 'ACTIVE'
        AND wp.latitude IS NOT NULL
        AND wp.longitude IS NOT NULL
        AND u.is_active = true
        AND (${available} = false OR wp.is_available = true)
        AND (
          6371 * acos(
            cos(radians(${lat})) * cos(radians(wp.latitude)) *
            cos(radians(wp.longitude) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(wp.latitude))
          )
        ) <= ${radius}
    `;

    const total = Number(totalResult[0]?.count ?? 0);

    return {
      data: workers.map(w => ({
        ...w,
        basePrice: w.base_price ? Number(w.base_price) : null,
        averageRating: Number(w.average_rating),
        distanceKm: Number(w.distance_km).toFixed(1),
        services: w.services ?? [],
      })),
      meta: { total, page, limit, radius, lat, lng },
    };
  }
}
