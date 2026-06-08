'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  Mail,
  Lock,
  Github,
  Chrome,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import Header from '@/components/Header';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithGoogle, signInWithGitHub, signInWithEmail, signUp, user } =
    useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // Mostrar errores de la URL
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'auth_error':
          setError('Error en la autenticación. Inténtalo de nuevo.');
          break;
        case 'no_session':
          setError('No se pudo establecer la sesión. Inténtalo de nuevo.');
          break;
        case 'unexpected':
          setError('Error inesperado. Inténtalo de nuevo.');
          break;
        default:
          setError('Error desconocido. Inténtalo de nuevo.');
      }
    }
  }, [searchParams]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isLogin) {
      // Iniciar sesión
      const { error } = await signInWithEmail(email, password);
      if (error) {
        setError(error.message || 'Error al iniciar sesión');
      } else {
        router.push('/');
      }
    } else {
      // Registrarse
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }

      const { error } = await signUp(email, password, {
        full_name: fullName,
        username: username || email.split('@')[0],
        role: 'student',
      });

      if (error) {
        setError(error.message || 'Error al registrarse');
      } else {
        setError('');
        alert('Revisa tu email para confirmar la cuenta');
      }
    }

    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');

    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message || 'Error al iniciar sesión con Google');
      setLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    setLoading(true);
    setError('');

    const { error } = await signInWithGitHub();
    if (error) {
      setError(error.message || 'Error al iniciar sesión con GitHub');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-background">
      <Header />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md">
          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-theme-text mb-2">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h1>
            <p className="text-theme-secondary">
              {isLogin
                ? 'Accede a tu cuenta del Tech Lab'
                : 'Únete a la comunidad del Tech Lab'}
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-theme-card border border-theme-border rounded-lg p-6">
            {/* Botones OAuth */}
            <div className="space-y-3 mb-6">
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-theme-border rounded-lg text-theme-text hover:bg-theme-accent/10 transition-colors disabled:opacity-50"
              >
                <Chrome className="w-5 h-5" />
                Continuar con Google
              </button>

              <button
                onClick={handleGitHubAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-theme-border rounded-lg text-theme-text hover:bg-theme-accent/10 transition-colors disabled:opacity-50"
              >
                <Github className="w-5 h-5" />
                Continuar con GitHub
              </button>
            </div>

            {/* Divisor */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-theme-border"></div>
              <span className="px-4 text-sm text-theme-secondary">o</span>
              <div className="flex-1 border-t border-theme-border"></div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Formulario Email */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      required={!isLogin}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Nombre de Usuario
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                      placeholder="Opcional - se generará automáticamente"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-secondary w-4 h-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-secondary w-4 h-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-secondary hover:text-theme-text"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-secondary w-4 h-4" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required={!isLogin}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-secondary hover:text-theme-text"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-neon-pink to-bright-blue text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </button>
            </form>

            {/* Toggle */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setFullName('');
                  setUsername('');
                }}
                className="text-theme-accent hover:text-theme-accent/80 transition-colors"
              >
                {isLogin
                  ? '¿No tienes cuenta? Regístrate'
                  : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
