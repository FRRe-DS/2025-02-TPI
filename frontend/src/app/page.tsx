'use client'
import { useEffect, useState } from 'react'
import keycloak from '../lib/keycloak'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',
      })
      .then((authenticated) => {
        if (authenticated) {
          console.log('Usuario autenticado:', keycloak.tokenParsed?.preferred_username)
          router.push('/dashboard')
        }
      })
      .catch((err) => {
        console.warn('Keycloak init warning:', err)
      })
    } catch (error) {
      console.warn('Error inicializando Keycloak:', error)
    }
  }, [router])

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await keycloak.login({
        redirectUri: window.location.origin + '/dashboard'
      })
    } catch (error) {
      console.error('Error en login:', error)
      setError('Error al iniciar sesión. Intenta de nuevo.')
      setIsLoading(false)
    }
  }

  return (
  <main className="relative min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-600 to-purple-400 rounded-full blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

        {/* Mesh Grid Background */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-400"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col lg:grid lg:grid-cols-2 items-center justify-center px-4 py-12 lg:py-0">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:flex flex-col justify-center items-start space-y-12 max-w-lg">
          {/* Logo & Title */}
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/20">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white leading-tight">
                Stock <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Manager</span>
              </h1>
              <p className="text-lg text-slate-300 mt-3">Gestión inteligente de inventario con seguridad empresarial</p>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-4 w-full">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Características principales</h3>
            {[
              { icon: '📦', title: 'Gestión de Productos', desc: 'Control completo de tu inventario' },
              { icon: '📋', title: 'Sistema de Reservas', desc: 'Reservas confiables y organizadas' },
              { icon: '📊', title: 'Reportes Avanzados', desc: 'Análisis detallado de tu stock' },
              { icon: '🔐', title: 'Seguridad SSO', desc: 'Autenticación empresarial con Keycloak' }
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl group-hover:bg-white/10 transition-colors">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-white group-hover:text-blue-300 transition-colors">{feature.title}</h4>
                  <p className="text-sm text-slate-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 w-full pt-4 border-t border-white/10">
            {[
              { number: '10K+', label: 'Productos' },
              { number: '1K+', label: 'Usuarios' },
              { number: '99.9%', label: 'Uptime' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text">{stat.number}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div className="w-full max-w-md lg:flex lg:justify-center">
          <div className="w-full bg-white/8 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl shadow-xl mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">Stock Manager</h2>
              <p className="text-slate-300 mt-2">Inicia sesión para continuar</p>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Bienvenido</h2>
              <p className="text-slate-300 text-sm">Accede con tu cuenta corporativa</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <div className="space-y-6">
              {/* Primary Login Button */}
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition duration-300 transform hover:scale-[1.02] active:scale-95 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 group-hover:translate-x-full transition-transform duration-700"></div>
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="relative">{isLoading ? 'Cargando...' : 'Ingresar con Keycloak'}</span>
              </button>

              {/* Info Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-white">¿Primera vez?</p>
                    <p className="text-xs text-slate-300">Contacta al administrador para crear tu cuenta</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: '🔒', text: 'Encriptado' },
                    { icon: '⚡', text: 'Rápido' },
                    { icon: '✅', text: 'Confiable' }
                  ].map((badge, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <span className="text-xl">{badge.icon}</span>
                      <p className="text-xs text-slate-300 text-center">{badge.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-2">
              <p className="text-sm text-slate-400">Plataforma de Gestión de Stock</p>
              <p className="text-xs text-slate-500">© 2025 FRRe - Facultad Regional Resistencia</p>
              <p className="text-xs text-slate-600 mt-3">v1.0 • Powered by Next.js & Keycloak</p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  )
}
