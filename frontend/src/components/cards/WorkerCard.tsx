'use client';
import Link from 'next/link';
import { MapPin, Star, Briefcase, CheckCircle } from 'lucide-react';
import type { WorkerProfile } from '@/types';
import { Avatar } from '../ui/Avatar';
import { formatPrice, priceUnitLabel } from '@/lib/utils';

interface Props { worker: WorkerProfile; }

export function WorkerCard({ worker }: Props) {
  const name = worker.user?.fullName ?? 'Trabajador';
  const services = worker.workerServices?.map(s => s.category.name) ?? [];

  return (
    <Link href={`/workers/${worker.id}`}>
      <div className="card p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
        <div className="flex gap-3">
          <div className="relative">
            <Avatar src={worker.user?.avatarUrl} name={name} size={52} />
            {worker.isAvailable && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-900 leading-tight">{name}</h3>
                {worker.user?.isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                    <CheckCircle size={11} /> Verificado
                  </span>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900 text-sm">{formatPrice(worker.basePrice)}</p>
                <p className="text-xs text-gray-400">{priceUnitLabel(worker.priceUnit)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
              <span className="flex items-center gap-0.5">
                <Star size={11} className="text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-gray-700">{Number(worker.averageRating).toFixed(1)}</span>
                <span>({worker.reviewCount})</span>
              </span>
              <span className="flex items-center gap-1">
                <Briefcase size={11} />
                {worker.jobsCompleted} trabajos
              </span>
              {worker.distanceKm && (
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {worker.distanceKm} km
                </span>
              )}
            </div>

            {services.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {services.slice(0, 3).map(s => (
                  <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{s}</span>
                ))}
                {services.length > 3 && (
                  <span className="text-xs text-gray-400 px-1">+{services.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
