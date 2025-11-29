// --- archivo: frontend/src/app/page.tsx ---
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Mail, Lock, ArrowRight, Eye, EyeOff, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import keycloak from '../lib/keycloak'
import { useAuth } from '../componentes/KeycloakProvider'

export default function Page() {
  const router = useRouter()
  const { authenticated, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Solo redirigir si ya terminó de cargar Y está autenticado
    if (!loading && authenticated) {
      router.push('/dashboard')
    }
  }, [authenticated, loading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    // Autenticación directa con Keycloak usando Direct Access Grants
    try {
      const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8081'
      const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'ds-2025-realm'
      const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'grupo-02'
      
      const tokenUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: clientId,
          username: email,
          password: password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error_description || 'Usuario o contraseña inválidos')
      }

      const data = await response.json()
      
      // Guardar tokens en Keycloak instance
      if (keycloak) {
        keycloak.token = data.access_token
        keycloak.refreshToken = data.refresh_token
        keycloak.idToken = data.id_token
        keycloak.authenticated = true
      }

      // Guardar también en localStorage para que sobrevivan a un refresh, eso es necesario para el refresh de la pagina, pa ra que no cierre sesion
      if (typeof window !== "undefined") {
        localStorage.setItem("kc_token", data.access_token || "");
        localStorage.setItem("kc_refresh", data.refresh_token || "");
        if (data.id_token) {
          localStorage.setItem("kc_id", data.id_token);
        }
      }
      
      // Redirigir al dashboard
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error)
      setError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.')
      setIsLoading(false)
    }
  }

  // Mostrar la pantalla de login inmediatamente, sin esperar a Keycloak
  return (
    <div className="min-h-screen flex">
      {/* Lado Izquierdo - Logo y Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#686DFF] via-[#351A7A] to-[#1A3F7A] items-center justify-center p-12 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <Image
            src="/testicat.png"
            alt="TESTI Logo"
            width={200}
            height={200}
            className="mx-auto mb-6 drop-shadow-2xl"
          />
          <h1 className="text-5xl font-bold text-white mb-3">TESTI</h1>
          {/*<p className="text-xl text-white/90 font-light">E-Commerce Shop</p>*/}
        </div>
      </div>

      {/* Lado Derecho - Formulario de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <Image
              src="/testicat.png"
              alt="TESTI Logo"
              width={120}
              height={120}
              className="mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-[#1A3F7A]">TESTI</h1>
          </div>

          {/* Link de crear cuenta */}
          <div className="text-right mb-6">
            <span className="text-sm text-gray-600">¿No sos usuario? </span>
            <a href="#" className="text-sm text-[#686DFF] hover:text-[#351A7A] font-medium">
              CREA UNA CUENTA
            </a>
          </div>

          {/* Card de Login */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Bienvenido de nuevo!</h2>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Ingrese sesión con Keycloak</p>
            </div>

            {/* Notificación de Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-shake">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">Error de autenticación</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username/Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario o Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="usuario o example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#686DFF] focus:border-transparent transition-all outline-none text-gray-700"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#686DFF] focus:border-transparent transition-all outline-none text-gray-700"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <span className="absolute right-16 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    mostrar
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1A1F7B] hover:bg-[#351A7A] text-white font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Iniciando...</span>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Link de problemas */}
            <div className="text-center mt-6">
              <a href="#" className="text-sm text-gray-500 hover:text-[#686DFF] transition-colors">
                ¿Problemas iniciando sesión?
              </a>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 space-y-4">
            {/* Redes Sociales */}
            <div className="flex justify-center gap-4">
              <span className="text-sm text-gray-600">Síguenos</span>
              <a href="#" className="text-gray-600 hover:text-[#686DFF] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-[#686DFF] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-[#686DFF] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-[#686DFF] transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>TallerIntegral 2025 - FRRe-UTN-FRSF todos los derechos reservados</p>
              <p>© 2025 Todos los Derechos Reservados</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}