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
      <div className="card p-4 transition-[transform,box-shadow] duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none motion-reduce:transition-none cursor-pointer">
        <div className="flex gap-3">
          <div className="relative">
            <Avatar src={worker.user?.avatarUrl} name={name} size={52} />
            {worker.isAvailable && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-ink" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-ink leading-tight">{name}</h3>
                {worker.user?.isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs text-blue-700 font-medium">
                    <CheckCircle size={11} /> Verificado
                  </span>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-ink text-sm">{formatPrice(worker.basePrice)}</p>
                <p className="text-xs text-ink/60">{priceUnitLabel(worker.priceUnit)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-1.5 text-xs text-ink/70">
              <span className="flex items-center gap-0.5">
                <Star size={11} className="text-ink fill-signal text-ink" />
                <span className="font-semibold text-ink">{Number(worker.averageRating).toFixed(1)}</span>
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
                  <span key={s} className="text-xs bg-signal/40 text-blue-700 px-2 py-0.5  font-medium">{s}</span>
                ))}
                {services.length > 3 && (
                  <span className="text-xs text-ink/60 px-1">+{services.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
