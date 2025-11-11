// --- archivo: frontend/src/app/page.tsx ---
'use client'
import { useEffect } from 'react'
import keycloak from '../lib/keycloak' 
import { useRouter } from 'next/navigation'
import { useAuth } from '../componentes/KeycloakProvider' // Importamos el hook
import Image from 'next/image'

export default function Page() {
  const router = useRouter()

  // Obtenemos el estado de autenticación DESDE EL PROVIDER
  const { authenticated, loading } = useAuth()
  
  // Este useEffect reacciona a los cambios del provider
  useEffect(() => {
    // Si no está cargando y SÍ está autenticado, redirigimos
    if (!loading && authenticated) {
      router.push('/dashboard')
    }
    // Si no está cargando y NO está autenticado, no hacemos nada,
    // lo que permite que se muestre el botón de login.
  }, [authenticated, loading, router]) // Se ejecuta si estos valores cambian

  // Usamos 'keycloak?.' por si acaso
  const handleLogin = () => keycloak?.login()

  // Mostramos un estado de carga mientras el provider se inicializa
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Autenticando, por favor espere...</div>
  }

  // Si no está autenticado (y no está cargando), mostramos el botón.
  return (
    <main className="flex h-screen">
      {/* Panel izquierdo */}
      <section className="w-1/2 bg-gradient-to-b from-indigo-500 to-purple-700 flex items-center justify-center relative">
        <div className="text-center">
          <Image
            src="/logo.png" // reemplazalo por el nombre real de tu logo en /public
            alt="Logo"
            width={180}
            height={180}
            className="mx-auto"
          />
          <h1 className="text-white text-4xl font-bold mt-4 tracking-wide">TESTI</h1>
          <p className="text-gray-200 text-lg mt-2">E-Commerce Shop</p>
        </div>
      </section>

      {/* Panel derecho */}
      <section className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-sm p-8 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">¡Bienvenido de nuevo!</h2>

          <button
            onClick={handleLogin}
            className="w-full bg-indigo-700 text-white py-3 rounded-md hover:bg-indigo-800 transition-all"
          >
            Iniciar sesión con Keycloak
          </button>

          <p className="text-center text-sm text-gray-500 mt-4 hover:underline cursor-pointer">
            ¿Problemas iniciando sesión?
          </p>
        </div>
      </section>
    </main>
  )
}