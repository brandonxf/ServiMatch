'use client';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props { rating: number; max?: number; size?: number; interactive?: boolean; onChange?: (r: number) => void; }

export function StarRating({ rating, max = 5, size = 16, interactive, onChange }: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i < Math.round(rating) ? 'text-ink fill-signal' : 'text-ink/30 fill-transparent',
            interactive && 'cursor-pointer hover:scale-110 transition-transform'
          )}
          onClick={() => interactive && onChange?.(i + 1)}
        />
      ))}
    </div>
  );
}
