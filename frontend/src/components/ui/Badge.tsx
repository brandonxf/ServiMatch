import { cn } from '@/lib/utils';
interface Props { children: React.ReactNode; variant?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'; className?: string; }
const variants = {
  blue: 'bg-blue-100 text-blue-800', green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800', red: 'bg-red-100 text-red-800',
  purple: 'bg-purple-100 text-purple-800', gray: 'bg-gray-100 text-gray-700',
};
export function Badge({ children, variant = 'blue', className }: Props) {
  return <span className={cn('badge', variants[variant], className)}>{children}</span>;
}
