'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wrench, User, HardHat, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 py-12">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />
      
      {/* Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600 opacity-[0.05] blur-[150px] rounded-full" />

      <div className="relative w-full max-w-md">
        {/* Back to home */}
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} />
          <span className="text-sm">Volver al inicio</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wrench size={24} color="white" />
            </div>
            <h1 className="text-2xl font-bold text-[#0f172a]">Crear cuenta</h1>
            <p className="text-gray-500 mt-1 text-sm">Únete a ServiMatch hoy</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { role: 'CLIENT' as const, label: 'Soy cliente', icon: <User size={18} />, desc: 'Busco servicios' },
              { role: 'WORKER' as const, label: 'Soy trabajador', icon: <HardHat size={18} />, desc: 'Ofrezco servicios' },
            ].map(opt => (
              <button 
                key={opt.role} 
                type="button"
                onClick={() => { setSelectedRole(opt.role); setValue('role', opt.role); }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedRole === opt.role
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                  {opt.icon} {opt.label}
                </div>
                <p className="text-xs opacity-70">{opt.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
              <input 
                {...register('fullName')} 
                placeholder="Juan Pérez" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1.5">{errors.fullName.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
              <input 
                {...register('email')} 
                type="email" 
                placeholder="tu@email.com" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Teléfono <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input 
                {...register('phone')} 
                type="tel" 
                placeholder="+573001234567" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
              <input 
                {...register('password')} 
                type="password" 
                placeholder="Mínimo 8 caracteres" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><Spinner size={18} /> Creando cuenta...</>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">Ingresar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
