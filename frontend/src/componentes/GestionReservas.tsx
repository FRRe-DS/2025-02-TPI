"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { FaPlus, FaCheckCircle, FaTimesCircle, FaClock, FaBoxOpen, FaSearch } from 'react-icons/fa'; 
import { 
  obtenerReservas, 
  cancelarReserva, 
  actualizarReserva 
} from '../servicios/api';

const USUARIO_ID_PRUEBA = 1;
const LIMIT_RESERVAS_POR_PAGINA = 4; 

interface ReservaCompleta {
  idReserva: number;
  idCompra: string;
  usuarioId: number;
  estado: string;
  productos: {
    idProducto: number;
    nombre: string;
    cantidad: number;
  }[];
}

export default function GestionReservas() {
  const router = useRouter(); 
  const [reservas, setReservas] = useState<ReservaCompleta[]>([]);
  const [cargando, setCargando] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState(''); 
  
  // 1. NUEVO ESTADO: Texto de búsqueda
  const [filtroTexto, setFiltroTexto] = useState('');

  const cargarReservas = () => {
    setCargando(true);
    const filtrosParaApi = {
      usuarioId: USUARIO_ID_PRUEBA,
      estado: filtroEstado,
      page: currentPage,
      limit: LIMIT_RESERVAS_POR_PAGINA
    };

    obtenerReservas(filtrosParaApi)
      .then((res: any) => {
        setReservas((res as ReservaCompleta[]) || []);
        setIsLastPage((res || []).length < LIMIT_RESERVAS_POR_PAGINA);
      })
      .catch((error: any) => {
        console.error("Error:", error);
        setReservas([]);
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarReservas();
  }, [currentPage, filtroEstado]);

  const handleCancelarReserva = async (reservaId: number) => {
    const motivo = window.prompt("Motivo de la cancelación:");
    if (!motivo) return;
    try {
      await cancelarReserva(reservaId, motivo);
      alert('¡Reserva cancelada!');
      cargarReservas();
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleConfirmarReserva = async (reservaId: number) => {
    if (!window.confirm("¿Confirmar reserva?")) return;
    try {
      await actualizarReserva(reservaId, USUARIO_ID_PRUEBA, 'confirmado');
      alert('¡Reserva confirmada!');
      cargarReservas();
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'confirmado':
        return <span className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm"><FaCheckCircle /> Confirmado</span>;
      case 'cancelado':
        return <span className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm"><FaTimesCircle /> Cancelado</span>;
      default:
        return <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm"><FaClock /> Pendiente</span>;
    }
  };

  // 2. FILTRADO LOCAL DE LA LISTA
  // Filtramos 'reservas' basándonos en lo que escribió el usuario
  const reservasFiltradas = reservas.filter(res => {
    const texto = filtroTexto.toLowerCase();
    return (
      res.idReserva.toString().includes(texto) ||           // Por ID numérico (ej: 13)
      res.idCompra.toLowerCase().includes(texto) ||         // Por Código (ej: RES-882)
      res.productos.some(p => p.nombre.toLowerCase().includes(texto)) // Por nombre de producto
    );
  });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      
      {/* CABECERA */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
        <div>
            <h2 className="text-2xl font-bold text-[#232B65]">Mis Reservas</h2>
            <p className="text-sm text-gray-500">Historial y gestión de solicitudes de stock</p>
        </div>
        
        <button
          onClick={() => router.push('/reservas/Agregar')}
          className="flex items-center gap-2 bg-[#232B65] hover:bg-[#1A2150] text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <FaPlus className="text-sm" />
          Nueva Reserva
        </button>
      </div>

      {/* BARRA DE HERRAMIENTAS (Filtros + Buscador) */}
      <div className="px-6 pt-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row justify-between items-end gap-4">
        
        {/* Pestañas de Estado */}
        <div className="flex gap-2 w-full md:w-auto">
          {['', 'pendiente', 'confirmado', 'cancelado'].map((estado) => (
            <button
              key={estado}
              onClick={() => { setFiltroEstado(estado); setCurrentPage(1); }}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
                filtroEstado === estado 
                  ? 'bg-white text-[#232B65] border-[#232B65] shadow-sm transform translate-y-[1px]' 
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {estado === '' ? 'Todas' : estado.charAt(0).toUpperCase() + estado.slice(1) + 's'}
            </button>
          ))}
        </div>

        {/* 3. CAMPO DE BÚSQUEDA */}
        <div className="relative w-full md:w-64 mb-2">
          <input 
            type="text" 
            placeholder="Buscar ID o Producto..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#232B65] focus:border-transparent outline-none"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <FaSearch />
          </div>
        </div>

      </div>

      {/* LISTA (Usamos reservasFiltradas en lugar de reservas) */}
      <div className="p-6 bg-gray-50">
        {cargando ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#232B65] mb-3"></div>
            <p>Cargando reservas...</p>
          </div>
        ) : reservasFiltradas.length > 0 ? (
          <div className="grid gap-4">
            {reservasFiltradas.map(res => (
              <div key={res.idReserva} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow duration-200">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#232B65] text-xl shadow-inner">
                      <FaBoxOpen />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-gray-900">Reserva #{res.idReserva}</h4>
                        {getEstadoBadge(res.estado)}
                      </div>
                      <p className="text-xs text-gray-500 font-mono mt-1">Cód. Referencia: {res.idCompra}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {res.estado === 'pendiente' && (
                        <button 
                          onClick={() => handleConfirmarReserva(res.idReserva)} 
                          className="text-xs bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-3 py-1.5 rounded-lg font-bold transition-colors uppercase tracking-wide"
                        >
                            Confirmar
                        </button>
                    )}
                    {res.estado !== 'cancelado' && (
                        <button 
                          onClick={() => handleCancelarReserva(res.idReserva)} 
                          className="text-xs bg-white text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg font-bold transition-colors uppercase tracking-wide"
                        >
                            Cancelar
                        </button>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Productos Solicitados</p>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <ul className="space-y-2">
                      {res.productos?.map((p, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex justify-between items-center border-b border-gray-200 last:border-0 pb-1 last:pb-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#232B65] bg-white px-2 py-0.5 rounded border border-gray-200 text-xs">{p.cantidad}x</span>
                            <span className="font-medium">{p.nombre}</span>
                          </div>
                          <span className="text-gray-400 text-xs font-mono">ID: {p.idProducto}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <FaSearch className="text-5xl mb-4 opacity-20" />
            <p className="text-lg font-medium text-gray-500">No se encontraron reservas</p>
            <p className="text-sm text-gray-400">Intenta con otro término de búsqueda o estado.</p>
          </div>
        )}
      </div>

      {/* PAGINACIÓN */}
      <div className="p-6 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
            <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || cargando}
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors bg-white"
            >
            Anterior
            </button>
            
            <span className="text-sm text-gray-700 font-medium px-2">
            Página: {currentPage}
            </span>
            
            <button
            onClick={() => !isLastPage && setCurrentPage(p => p + 1)}
            disabled={isLastPage || cargando}
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors bg-white"
            >
            Siguiente
            </button>
        </div>
      </div>
    </div>
  );
}