'use client';

import { AuthService } from '@/app/services/auth.service';
import { useAuthStore } from '@/app/store/auth.store';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
    const router = useRouter();
    const loginStore = useAuthStore((state) => state.login);

    const [email, setEmail] = useState('admin@pizadaec.com');
    const [password, setPassword] = useState('123456');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError('');

            const response = await AuthService.login(email, password);

            loginStore(response.user, response.token);

            router.push('/tienda');
        } catch {
            setError('Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-6">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm"
            >
                <h1 className="text-3xl font-bold">Iniciar sesión</h1>
                <p className="mt-2 text-sm text-neutral-500">
                    Accede a tu cuenta de PizadaEc
                </p>

                {error && (
                    <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <div className="mt-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium">Correo</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                            placeholder="correo@ejemplo.com"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                            placeholder="********"
                        />
                    </div>
                </div>

                <button
                    disabled={loading}
                    className="mt-6 w-full rounded-xl bg-black px-6 py-3 font-semibold text-white disabled:opacity-60"
                >
                    {loading ? 'Ingresando...' : 'Entrar'}
                </button>
            </form>
        </main>
    );
}