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
        <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center">
          <Settings size={20} />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Configuración</h1>
      </div>

      {/* Perfil */}
      <div className="card p-6 mb-4">
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
          <Avatar src={user.avatarUrl} name={user.fullName} size={56} />
          <div>
            <p className="font-bold text-gray-900">{user.fullName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs text-blue-600 font-medium mt-0.5">
              {user.role === 'WORKER' ? 'Trabajador' : user.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
            </p>
          </div>
        </div>

        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
          <User size={16} /> Editar información personal
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Nombre completo</label>
            <input {...register('fullName')} className="input" />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input {...register('phone')} type="tel" placeholder="+573001234567" className="input" />
          </div>
          <div>
            <label className="label text-gray-400 font-normal">Correo electrónico</label>
            <input value={user.email} disabled className="input bg-gray-50 text-gray-400 cursor-not-allowed" />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? <><Spinner size={16} /> Guardando...</> : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Zona peligrosa */}
      <div className="card p-5 border-red-100">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
          <AlertTriangle size={16} className="text-red-500" /> Zona peligrosa
        </h3>
        <div className="space-y-2">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
