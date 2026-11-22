import { cn } from '@/lib/utils';
interface Props { children: React.ReactNode; variant?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'; className?: string; }
const variants = {
  blue: 'bg-blue-600 text-white', green: 'bg-green-300 text-ink',
  yellow: 'bg-signal text-ink', red: 'bg-red-600 text-white',
  purple: 'bg-purple-300 text-ink', gray: 'bg-white text-ink',
};
export function Badge({ children, variant = 'blue', className }: Props) {
  return <span className={cn('badge', variants[variant], className)}>{children}</span>;
}
