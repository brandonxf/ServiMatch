'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth.store';
import { Spinner } from '@/components/ui/Spinner';

const schema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    try {
      const res = await authApi.login(data);
      setAuth(res.data.user, res.data.accessToken);
      toast.success(`Bienvenido, ${res.data.user.fullName.split(' ')[0]}!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Credenciales incorrectas');
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
      <div className="relative w-full max-w-[440px] px-6 z-10 mt-12 sm:mt-0">
        <div className="bg-white/10 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.2)] border border-white/20">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-1 font-bold text-2xl tracking-tight mb-6">
              <span className="text-white">Servi</span><span className="text-blue-300">Match</span>
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">Bienvenido de nuevo</h1>
            <p className="text-white/80 mt-2 text-sm">Ingresa a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-1.5 drop-shadow-sm">Correo electrónico</label>
              <input 
                {...register('email')} 
                type="email" 
                placeholder="tu@email.com" 
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/10 transition-all shadow-sm backdrop-blur-sm"
              />
              {errors.email && <p className="text-red-300 text-xs mt-1.5 font-medium bg-red-900/40 w-fit px-2 py-0.5 rounded-md backdrop-blur-md">{errors.email.message}</p>}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-white/90 drop-shadow-sm">Contraseña</label>
                <Link href="#" className="text-xs text-blue-200 font-medium hover:text-white transition-colors drop-shadow-sm">¿La olvidaste?</Link>
              </div>
              <input 
                {...register('password')} 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/10 transition-all shadow-sm backdrop-blur-sm"
              />
              {errors.password && <p className="text-red-300 text-xs mt-1.5 font-medium bg-red-900/40 w-fit px-2 py-0.5 rounded-md backdrop-blur-md">{errors.password.message}</p>}
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-white hover:bg-white/90 disabled:bg-white/50 text-blue-900 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-white/10 mt-6 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><Spinner size={18} /> Ingresando...</>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-white/70 mt-8">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" className="text-white font-bold hover:text-blue-300 transition-colors drop-shadow-sm">Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
