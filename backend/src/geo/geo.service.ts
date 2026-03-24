import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchWorkersDto } from './dto/search-workers.dto';

@Injectable()
export class GeoService {
  constructor(private prisma: PrismaService) {}

  async searchWorkers(dto: SearchWorkersDto) {
    const { lat, lng, radius = 10, category, minRating, maxPrice, available = true, page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    const workers: any[] = await this.prisma.$queryRaw`
      SELECT
        wp.id, wp.bio, wp.base_price, wp.price_unit, wp.average_rating,
        wp.review_count, wp.jobs_completed, wp.is_available, wp.city,
        wp.years_experience, wp.latitude, wp.longitude,
        u.id as user_id, u.full_name, u.avatar_url, u.phone,
        (
          6371 * acos(GREATEST(-1, LEAST(1,
            cos(radians(${lat})) * cos(radians(wp.latitude)) *
            cos(radians(wp.longitude) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(wp.latitude))
          )))
        ) AS distance_km,
        (
          SELECT json_agg(json_build_object('id', sc.id, 'name', sc.name, 'slug', sc.slug))
          FROM worker_services ws2
          JOIN service_categories sc ON sc.id = ws2.category_id
          WHERE ws2.worker_id = wp.id
        ) as services
      FROM worker_profiles wp
      JOIN users u ON u.id = wp.user_id
      WHERE
        wp.status = 'ACTIVE' AND wp.latitude IS NOT NULL AND wp.longitude IS NOT NULL
        AND u.is_active = true
        AND (${available}::boolean = false OR wp.is_available = true)
        AND (${minRating ?? 0}::float = 0 OR wp.average_rating >= ${minRating ?? 0}::float)
        AND (${maxPrice ?? 0}::float = 0 OR wp.base_price <= ${maxPrice ?? 0}::float)
        AND (6371 * acos(GREATEST(-1, LEAST(1,
            cos(radians(${lat})) * cos(radians(wp.latitude)) *
            cos(radians(wp.longitude) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(wp.latitude))
          )))) <= ${radius}
        AND (${category ?? ''}::text = '' OR EXISTS (
          SELECT 1 FROM worker_services ws
          JOIN service_categories sc ON sc.id = ws.category_id
          WHERE ws.worker_id = wp.id AND sc.slug = ${category ?? ''}
        ))
      ORDER BY wp.is_available DESC, distance_km ASC, wp.average_rating DESC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const countResult: any[] = await this.prisma.$queryRaw`
      SELECT COUNT(*)::int as count
      FROM worker_profiles wp JOIN users u ON u.id = wp.user_id
      WHERE wp.status = 'ACTIVE' AND wp.latitude IS NOT NULL AND wp.longitude IS NOT NULL
        AND u.is_active = true
        AND (${available}::boolean = false OR wp.is_available = true)
        AND (6371 * acos(GREATEST(-1, LEAST(1,
            cos(radians(${lat})) * cos(radians(wp.latitude)) *
            cos(radians(wp.longitude) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(wp.latitude))
          )))) <= ${radius}
    `;

    return {
      data: workers.map(w => ({
        id: w.id, bio: w.bio,
        basePrice: w.base_price ? Number(w.base_price) : null,
        priceUnit: w.price_unit,
        averageRating: Number(w.average_rating),
        reviewCount: w.review_count, jobsCompleted: w.jobs_completed,
        isAvailable: w.is_available, city: w.city,
        yearsExperience: w.years_experience,
        latitude: w.latitude, longitude: w.longitude,
        distanceKm: Number(w.distance_km).toFixed(1),
        services: w.services ?? [],
        user: { id: w.user_id, fullName: w.full_name, avatarUrl: w.avatar_url, phone: w.phone },
      })),
      meta: { total: Number(countResult[0]?.count ?? 0), page, limit, radius, lat, lng },
    };
  }
}
