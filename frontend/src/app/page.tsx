// --- archivo: frontend/src/app/page.tsx ---
'use client'
import { useEffect } from 'react'
import keycloak from '../lib/keycloak' 
import { useRouter } from 'next/navigation'
import { useAuth } from '../componentes/KeycloakProvider' // Importamos el hook
import Image from 'next/image'
import { FaArrowRight } from 'react-icons/fa'
import 'flowbite';

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
    return <div>Autenticando, por favor espere...</div>
  }
  
  return (
  <main className="flex flex-col items-center justify-start h-screen bg-login-gradient pt-20">
    
    <Image
      src="/testicat.png"
      alt="Logo"
      width={250}
      height={350}
      className="mb-6"
    />

    <button 
  onClick={handleLogin}
  type="button"
  className="
    inline-flex items-center gap-2
    text-white
    bg-[#24243E] 
    hover:bg-[#1d1d34]
    shadow-lg shadow-black/30
    font-medium 
    rounded-lg
    text-sm
    px-16 py-6
    text-center
    cursor-pointer

  "
>
  <span>Iniciar Sesión con Keycloack</span>
  <FaArrowRight className="opacity-90 transition-transform duration-300 group-hover:translate-x-1" />
</button>


  </main>
)

}