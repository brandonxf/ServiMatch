'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth.store';
import { Spinner } from '@/components/ui/Spinner';
import { AuthShell, FieldError, focusRing, inputClass, labelClass, submitClass } from '@/components/layout/AuthShell';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
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
      const isNetworkError = !err.response;
      toast.error(err.response?.data?.message ?? (isNetworkError ? 'No se pudo conectar al servidor. ¿Está corriendo el backend?' : 'Credenciales incorrectas'));
    }
  };

  return (
    <AuthShell
      title="Vuelve a lo importante."
      subtitle="Ingresar"
      points={['Tus solicitudes en un solo lugar', 'Chat directo con profesionales', 'Calificaciones reales']}
      footer={
        <>
          ¿No tienes cuenta?{' '}
          <Link href="/auth/register" className={`underline underline-offset-4 decoration-2 hover:bg-signal ${focusRing}`}>
            Regístrate gratis
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label htmlFor="email" className={labelClass}>Correo electrónico</label>
          <input
            id="email"
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={inputClass}
          />
          <FieldError id="email-error" message={errors.email?.message} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="font-mono text-xs font-bold uppercase tracking-[0.14em]">Contraseña</label>
            <Link href="#" className={`inline-flex min-h-6 items-center text-sm font-semibold underline underline-offset-4 hover:bg-signal ${focusRing}`}>
              ¿La olvidaste?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={`${inputClass} pr-14`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPassword}
              className={`absolute inset-y-0 right-0 flex w-12 items-center justify-center border-l-2 border-ink hover:bg-signal ${focusRing} focus-visible:-outline-offset-4`}
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
          <FieldError id="password-error" message={errors.password?.message} />
        </div>

        <button type="submit" disabled={isSubmitting} className={submitClass}>
          {isSubmitting ? <><Spinner size={18} /> Ingresando...</> : 'Ingresar'}
        </button>
      </form>
    </AuthShell>
  );
}
