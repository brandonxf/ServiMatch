'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings, User, LogOut, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';
import api from '@/lib/api/client';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'sonner';

const schema = z.object({
  fullName: z.string().min(3, 'Mínimo 3 caracteres'),
  phone: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function SettingsPage() {
  const { user, fetchMe, logout } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) { router.push('/auth/login'); return; }
    if (user) reset({ fullName: user.fullName, phone: user.phone ?? '' });
  }, [user]);

  const onSubmit = async (data: Form) => {
    try {
      await api.patch('/users/me', data);
      await fetchMe();
      toast.success('Perfil actualizado');
    } catch {
      toast.error('Error al actualizar');
    }
  };

  if (!user) return <div className="flex justify-center py-32"><Spinner size={36} /></div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-ink/10 text-ink/70 rounded-xl flex items-center justify-center">
          <Settings size={20} />
        </div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink">Configuración</h1>
      </div>

      {/* Perfil */}
      <div className="card p-6 mb-4">
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-ink">
          <Avatar src={user.avatarUrl} name={user.fullName} size={56} />
          <div>
            <p className="font-bold text-ink">{user.fullName}</p>
            <p className="text-sm text-ink/70">{user.email}</p>
            <p className="text-xs text-blue-700 font-medium mt-0.5">
              {user.role === 'WORKER' ? 'Trabajador' : user.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
            </p>
          </div>
        </div>

        <h3 className="font-bold text-ink mb-4 flex items-center gap-2 text-sm">
          <User size={16} /> Editar información personal
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Nombre completo</label>
            <input {...register('fullName')} className="input" />
            {errors.fullName && <p className="text-red-700 text-xs mt-1">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input {...register('phone')} type="tel" placeholder="+573001234567" className="input" />
          </div>
          <div>
            <label className="label text-ink/60 font-normal">Correo electrónico</label>
            <input value={user.email} disabled className="input bg-paper text-ink/60 cursor-not-allowed" />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? <><Spinner size={16} /> Guardando...</> : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Zona peligrosa */}
      <div className="card p-5 border-ink">
        <h3 className="font-bold text-ink mb-3 flex items-center gap-2 text-sm">
          <AlertTriangle size={16} className="text-red-700" /> Zona peligrosa
        </h3>
        <div className="space-y-2">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
