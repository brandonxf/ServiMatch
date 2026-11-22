import Image from 'next/image';
import { getInitials, cn } from '@/lib/utils';

interface Props { src?: string | null; name: string; size?: number; className?: string; }

export function Avatar({ src, name, size = 40, className }: Props) {
  if (src) {
    return (
      <div className={cn('overflow-hidden flex-shrink-0 border-2 border-ink', className)} style={{ width: size, height: size }}>
        <Image src={src} alt={name} width={size} height={size} className="object-cover w-full h-full" />
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      className={cn('flex items-center justify-center bg-signal text-ink font-display font-bold flex-shrink-0 border-2 border-ink', className)}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36) }}
    >
      {getInitials(name)}
    </div>
  );
}
