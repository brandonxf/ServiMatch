'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, HardHat, ArrowLeft } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827] overflow-hidden">
      {/* Full Page Gradient Background */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#111827] via-blue-900 to-blue-700" />

      {/* Back Button (Glassmorphism) */}
      <Link 
        href="/" 
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl backdrop-blur-md text-white/90 hover:text-white transition-all shadow-lg hover:shadow-white/5 hover:-translate-y-0.5 active:scale-95"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-semibold tracking-wide hidden sm:block">Volver al inicio</span>
      </Link>

      {/* Form Container */}
      <div className="relative w-full max-w-[460px] px-4 py-8 max-h-screen overflow-y-auto no-scrollbar z-10 mt-12 sm:mt-0">
        <div className="bg-white/10 backdrop-blur-2xl p-6 sm:p-10 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.2)] border border-white/20">
          <div className="mb-6 text-center">
            <Link href="/" className="inline-flex items-center gap-1 font-bold text-2xl tracking-tight mb-4">
              <span className="text-white">Servi</span><span className="text-blue-300">Match</span>
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">Crear cuenta</h1>
            <p className="text-white/80 mt-1 text-sm">Únete a ServiMatch hoy mismo</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 mb-2">
              {[
                { role: 'CLIENT' as const, label: 'Cliente', icon: <User size={16} /> },
                { role: 'WORKER' as const, label: 'Profesional', icon: <HardHat size={16} /> },
              ].map(opt => (
                <button 
                  key={opt.role} 
                  type="button"
                  onClick={() => { setSelectedRole(opt.role); setValue('role', opt.role); }}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 backdrop-blur-sm ${
                    selectedRole === opt.role
                      ? 'border-white/50 bg-white/20 text-white shadow-sm'
                      : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-sm">
                    {opt.icon} {opt.label}
                  </div>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-1 drop-shadow-sm">Nombre completo</label>
              <input 
                {...register('fullName')} 
                placeholder="Juan Pérez" 
                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/10 transition-all shadow-sm backdrop-blur-sm"
              />
              {errors.fullName && <p className="text-red-300 text-xs mt-1.5 font-medium bg-red-900/40 w-fit px-2 py-0.5 rounded-md backdrop-blur-md">{errors.fullName.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-1 drop-shadow-sm">Correo electrónico</label>
              <input 
                {...register('email')} 
                type="email" 
                placeholder="tu@email.com" 
                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/10 transition-all shadow-sm backdrop-blur-sm"
              />
              {errors.email && <p className="text-red-300 text-xs mt-1.5 font-medium bg-red-900/40 w-fit px-2 py-0.5 rounded-md backdrop-blur-md">{errors.email.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-1 drop-shadow-sm">
                Teléfono <span className="text-white/50 font-normal">(opcional)</span>
              </label>
              <input 
                {...register('phone')} 
                type="tel" 
                placeholder="+573001234567" 
                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/10 transition-all shadow-sm backdrop-blur-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-1 drop-shadow-sm">Contraseña</label>
              <input 
                {...register('password')} 
                type="password" 
                placeholder="Mínimo 8 caracteres" 
                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/10 transition-all shadow-sm backdrop-blur-sm"
              />
              {errors.password && <p className="text-red-300 text-xs mt-1.5 font-medium bg-red-900/40 w-fit px-2 py-0.5 rounded-md backdrop-blur-md">{errors.password.message}</p>}
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-white hover:bg-white/90 disabled:bg-white/50 text-blue-900 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-white/10 mt-6 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><Spinner size={18} /> Creando...</>
              ) : (
                'Comenzar ahora'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-white/70 mt-6 pb-2">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-white font-bold hover:text-blue-300 transition-colors drop-shadow-sm">Ingresar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
