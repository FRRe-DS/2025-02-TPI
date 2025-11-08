'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../componentes/KeycloakProvider';
import { useUserRole } from '../../hooks/useUserRole';

export default function DashboardPage() {
  const router = useRouter();
  const { authenticated, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  useEffect(() => {
    // Esperar a que termine de cargar
    if (authLoading || roleLoading) return;

    // Si no está autenticado, redirigir al login
    if (!authenticated) {
      router.push('/');
      return;
    }

    // Redirigir según el rol del usuario
    if (role === 'compras-be') {
      router.push('/compras');
    } else if (role === 'logistica-be') {
      router.push('/logistica');
    } else if (role === 'stock-be') {
      router.push('/admin');
    } else {
      // Si no tiene un rol conocido, mostrar error
      console.error('Usuario sin rol asignado:', role);
    }
  }, [authenticated, authLoading, role, roleLoading, router]);

  // Mostrar loading mientras redirige
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Cargando...</h2>
        <p>Redirigiendo a tu portal...</p>
      </div>
    </div>
  );
}