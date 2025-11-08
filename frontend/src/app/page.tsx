'use client'
import { useEffect } from 'react'
import keycloak from '../lib/keycloak' 
import { useRouter } from 'next/navigation'

// 1. Importamos el HOOK 'useAuth' que creamos
import { useAuth } from '../componentes/KeycloakProvider' 

export default function Page() {
  const router = useRouter()
  
  // 2. Obtenemos el estado de autenticación DESDE EL PROVIDER
  const { authenticated, loading } = useAuth()
  
  // 3. ¡ELIMINAMOS EL 'useEffect' QUE LLAMABA A 'keycloak.init()'!
  // Ya no es necesario, el provider lo hace por nosotros.
  
  // 4. Creamos un 'useEffect' que reaccione a los cambios del provider
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

  // 5. Mostramos un estado de carga mientras el provider se inicializa
  if (loading) {
    return <div>Autenticando, por favor espere...</div>
  }

  // 6. Si no está autenticado (y no está cargando), mostramos el botón.
  // (Si SÍ estaba autenticado, el 'useEffect' ya nos habría redirigido)
  return (
    <main style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
      <button
        onClick={handleLogin}
        style={{
          backgroundColor: '#4A148C',
          color: 'white',
          padding: '10px 16px',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        Ingresar con Keycloak
      </button>
    </main>
  )
}