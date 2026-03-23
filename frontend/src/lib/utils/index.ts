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
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  ACCEPTED: { label: 'Aceptada', color: 'bg-blue-100 text-blue-800' },
  REJECTED: { label: 'Rechazada', color: 'bg-red-100 text-red-800' },
  IN_PROGRESS: { label: 'En progreso', color: 'bg-purple-100 text-purple-800' },
  COMPLETED: { label: 'Completada', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelada', color: 'bg-gray-100 text-gray-800' },
};

export const getInitials = (name: string) =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
