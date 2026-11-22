'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, HardHat, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/auth.store';
import { Spinner } from '@/components/ui/Spinner';
import { AuthShell, FieldError, focusRing, inputClass, labelClass, submitClass } from '@/components/layout/AuthShell';
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
  const [showPassword, setShowPassword] = useState(false);

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
    <AuthShell
      title="Empieza hoy. Sin costo."
      subtitle="Crear cuenta"
      points={['Perfiles con identidad verificada', 'Sin costo de publicación', 'Pagos protegidos']}
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className={`underline underline-offset-4 decoration-2 hover:bg-signal ${focusRing}`}>
            Ingresar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <fieldset>
          <legend className={labelClass}>Quiero usar ServiMatch como</legend>
          <div className="grid grid-cols-2 gap-3">
            {[
              { role: 'CLIENT' as const, label: 'Cliente', hint: 'Contratar', icon: <User size={20} aria-hidden="true" /> },
              { role: 'WORKER' as const, label: 'Profesional', hint: 'Ofrecer servicios', icon: <HardHat size={20} aria-hidden="true" /> },
            ].map(opt => (
              <button
                key={opt.role}
                type="button"
                aria-pressed={selectedRole === opt.role}
                onClick={() => { setSelectedRole(opt.role); setValue('role', opt.role); }}
                className={`flex min-h-20 flex-col items-start gap-1 border-2 border-ink p-3 text-left transition-colors motion-reduce:transition-none ${focusRing} ${
                  selectedRole === opt.role
                    ? 'bg-signal shadow-brutal-sm'
                    : 'bg-white hover:bg-signal/40'
                }`}
              >
                <span className="flex items-center gap-2 font-display text-base font-bold uppercase">{opt.icon} {opt.label}</span>
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink/70">{opt.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="fullName" className={labelClass}>Nombre completo</label>
          <input
            id="fullName"
            {...register('fullName')}
            autoComplete="name"
            placeholder="Juan Pérez"
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            className={inputClass}
          />
          <FieldError id="fullName-error" message={errors.fullName?.message} />
        </div>

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
          <label htmlFor="phone" className={labelClass}>
            Teléfono <span className="text-ink/60">(opcional)</span>
          </label>
          <input
            id="phone"
            {...register('phone')}
            type="tel"
            autoComplete="tel"
            placeholder="+573001234567"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>Contraseña</label>
          <div className="relative">
            <input
              id="password"
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
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
          {isSubmitting ? <><Spinner size={18} /> Creando...</> : 'Comenzar ahora'}
        </button>
      </form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
