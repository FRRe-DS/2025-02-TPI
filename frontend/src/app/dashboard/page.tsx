'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../componentes/Navbar';
import ProductoForm from '../../componentes/ProductoForm';
import ListaProductos from '../../componentes/ListaProductos';
import Sidebar from '../../componentes/Sidebar';
import keycloak from '../../lib/keycloak';

function Dashboard() {
  const [actualizar, setActualizar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ productos: 0, reservas: 0, categorias: 0 });
  const router = useRouter();

  const refrescar = () => setActualizar(!actualizar);

  useEffect(() => {
    // Verificar que el usuario esté autenticado
    if (typeof window !== 'undefined') {
      try {
        if (!keycloak.authenticated) {
          router.push('/');
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.warn('Error verificando autenticación:', error);
        setLoading(false);
      }
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6 animate-pulse shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-white font-semibold text-lg">Cargando tu dashboard...</p>
          <p className="text-slate-400 text-sm mt-2">Preparando tu experiencia</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
  <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
            <div className="lg:flex lg:items-start lg:gap-8">
              <Sidebar />
              <div className="flex-1">
            {/* Header Section */}
            <div className="mb-16">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl shadow-2xl">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-4xl lg:text-5xl font-bold text-white">Gestión de Stock</h1>
                      <p className="text-slate-300 text-lg mt-2">Control inteligente de tu inventario</p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
                  {[
                    { label: 'Productos', value: '--', icon: '📦' },
                    { label: 'Reservas', value: '0', icon: '📋' },
                    { label: 'Activo', value: '✓', icon: '✅' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-4 text-center hover:bg-white/20 transition-all">
                      <div className="text-2xl mb-2">{stat.icon}</div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-slate-300 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Add Product Form */}
              <div className="lg:col-span-1">
                <div className="sticky top-32 space-y-6">
                  {/* Add Product Card */}
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:border-white/40 transition-all">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Nuevo Producto</h2>
                        <p className="text-sm text-slate-300">Agrega un artículo al inventario</p>
                      </div>
                    </div>
                    <ProductoForm onProductoAgregado={refrescar} />
                  </div>

                  {/* Info Card */}
                  <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur border border-blue-400/30 rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                      <span>💡</span> Consejos
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li>✓ Completa todos los campos requeridos</li>
                      <li>✓ Usa categorías consistentes</li>
                      <li>✓ Verifica el stock regularmente</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Column - Products List */}
              <div className="lg:col-span-2">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:border-white/40 transition-all">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Inventario</h2>
                        <p className="text-sm text-slate-300">Productos disponibles en el sistema</p>
                      </div>
                    </div>
                    <button
                      onClick={refrescar}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                      title="Actualizar lista"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  <ListaProductos actualizar={actualizar} />
                </div>
              </div>
            </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
      `}</style>
    </>
  );
}

export default Dashboard;
