'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wrench, User, HardHat } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth.store';
import { Spinner } from '@/components/ui/Spinner';
import { useState, Suspense } from 'react';

const schema = z.object({
  fullName: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Correo inválido'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  role: z.enum(['CLIENT', 'WORKER']),
});

type Form = z.infer<typeof schema>;

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth } = useAuthStore();
  const defaultRole = (params.get('role') as 'CLIENT' | 'WORKER') ?? 'CLIENT';
  const [selectedRole, setSelectedRole] = useState<'CLIENT' | 'WORKER'>(defaultRole);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  });

  const onSubmit = async (data: Form) => {
    try {
      const res = await authApi.register({ ...data, role: selectedRole });
      setAuth(res.data.user, res.data.accessToken);
      toast.success('¡Cuenta creada con éxito!');
      router.push(selectedRole === 'WORKER' ? '/dashboard/worker/setup' : '/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Error al crear cuenta');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wrench size={22} color="white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Crear cuenta</h1>
          <p className="text-gray-500 mt-1 text-sm">Únete a ServiMatch hoy</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { role: 'CLIENT' as const, label: 'Soy cliente', icon: <User size={18} />, desc: 'Busco servicios' },
            { role: 'WORKER' as const, label: 'Soy trabajador', icon: <HardHat size={18} />, desc: 'Ofrezco servicios' },
          ].map(opt => (
            <button key={opt.role} type="button"
              onClick={() => { setSelectedRole(opt.role); setValue('role', opt.role); }}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                selectedRole === opt.role
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}>
              <div className="flex items-center gap-2 font-semibold text-sm mb-0.5">
                {opt.icon} {opt.label}
              </div>
              <p className="text-xs opacity-70">{opt.desc}</p>
            </button>
          ))}
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Nombre completo</label>
              <input {...register('fullName')} placeholder="Juan Pérez" className="input" />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="label">Correo electrónico</label>
              <input {...register('email')} type="email" placeholder="tu@email.com" className="input" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Teléfono <span className="text-gray-400 font-normal">(opcional)</span></label>
              <input {...register('phone')} type="tel" placeholder="+573001234567" className="input" />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input {...register('password')} type="password" placeholder="Mínimo 8 caracteres" className="input" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? <><Spinner size={16} /> Creando cuenta...</> : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">Ingresar</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
