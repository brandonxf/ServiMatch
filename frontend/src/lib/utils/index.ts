import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatPrice = (price?: number | null) => {
  if (!price) return 'A convenir';
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
};

export const formatDate = (date: string) =>
  format(new Date(date), "d 'de' MMMM, yyyy", { locale: es });

export const timeAgo = (date: string) =>
  formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });

export const priceUnitLabel = (unit: string) =>
  ({ HOUR: '/ hora', SERVICE: '/ servicio', DAY: '/ día' }[unit] ?? '');

export const statusLabel: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-signal text-ink' },
  ACCEPTED: { label: 'Aceptada', color: 'bg-blue-600 text-white' },
  REJECTED: { label: 'Rechazada', color: 'bg-red-600 text-white' },
  IN_PROGRESS: { label: 'En progreso', color: 'bg-purple-300 text-ink' },
  COMPLETED: { label: 'Completada', color: 'bg-green-300 text-ink' },
  CANCELLED: { label: 'Cancelada', color: 'bg-white text-ink' },
};

export const getInitials = (name: string) =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
