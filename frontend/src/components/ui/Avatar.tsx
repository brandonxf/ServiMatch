import Image from 'next/image';
import { getInitials, cn } from '@/lib/utils';

interface Props { src?: string | null; name: string; size?: number; className?: string; }

export function Avatar({ src, name, size = 40, className }: Props) {
  if (src) {
    return (
      <div className={cn('rounded-full overflow-hidden flex-shrink-0', className)} style={{ width: size, height: size }}>
        <Image src={src} alt={name} width={size} height={size} className="object-cover w-full h-full" />
      </div>
    );
  }
  return (
    <div
      className={cn('rounded-full flex items-center justify-center bg-blue-100 text-blue-700 font-bold flex-shrink-0', className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {getInitials(name)}
    </div>
  );
}
