// --- archivo: src/componentes/GestionReservas.tsx ---
"use client";
import React, { useState, useEffect } from 'react';
// Importamos las funciones de la API
import { 
  obtenerReservas, 
  crearReserva, 
  cancelarReserva,
  actualizarReserva
} from '../servicios/api';

// --- INTERFACES (basadas en tu openapi.yaml) ---

export interface ReservaProductoInput {
  idProducto: number;
  cantidad: number;
}

export interface ReservaInput {
  idCompra: string;
  usuarioId: number;
  productos: ReservaProductoInput[];
}

export interface ReservaCompleta {
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
// --- Fin de Interfaces ---

// --- Constantes de Configuración ---

// Hardcodeamos un ID de usuario para probar
// (En el mundo real, vendría de la autenticación)
const USUARIO_ID_PRUEBA = 1;
const LIMIT_RESERVAS_POR_PAGINA = 5; // Límite para la paginación

export default function GestionReservas() {
  const [reservas, setReservas] = useState<ReservaCompleta[]>([]);
  const [cargando, setCargando] = useState(true);

  // --- Estados para el formulario de NUEVA RESERVA ---
  const [idCompra, setIdCompra] = useState('');
  const [prodId, setProdId] = useState(''); // ID del producto a reservar
  const [prodCant, setProdCant] = useState(1); // Cantidad a reservar

  // --- ESTADOS DE FILTRO Y PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState(''); // '' = Todas

  // 2. Función para cargar las reservas
  const cargarReservas = () => {
    setCargando(true);
    
    // Prepara el objeto de filtros para la API
    const filtrosParaApi = {
      usuarioId: USUARIO_ID_PRUEBA,
      estado: filtroEstado,
      page: currentPage,
      limit: LIMIT_RESERVAS_POR_PAGINA
    };

    obtenerReservas(filtrosParaApi) // Pasa el objeto de filtros
      .then((res: ReservaCompleta[]) => {
        setReservas(res || []);
        // Verifica si es la última página
        setIsLastPage((res || []).length < LIMIT_RESERVAS_POR_PAGINA);
      })
      .catch(error => {
        console.error("Error al cargar reservas:", error);
        setReservas([]);
      })
      .finally(() => {
        setCargando(false);
      });
  };

  // 3. Carga inicial y recarga
  // Se ejecuta si 'currentPage' o 'filtroEstado' cambian
  useEffect(() => {
    cargarReservas();
  }, [currentPage, filtroEstado]);

  // 4. Manejador para crear una reserva
  const handleCrearReserva = async (e: React.FormEvent) => {
    e.preventDefault();

    const nuevaReserva: ReservaInput = {
      idCompra: idCompra,
      usuarioId: USUARIO_ID_PRUEBA,
      productos: [
        {
          idProducto: Number(prodId),
          cantidad: Number(prodCant)
        }
      ]
    };

    try {
      await crearReserva(nuevaReserva);
      alert('¡Reserva creada! (El stock ha sido descontado)');
      // Limpiamos el formulario
      setIdCompra('');
      setProdId('');
      setProdCant(1);
      
      // Vuelve a la página 1 y recarga
      setCurrentPage(1); 
      // Si ya estábamos en la página 1, el useEffect no se dispara,
      // así que forzamos la recarga (solo si ya estábamos en la pág 1)
      if (currentPage === 1) {
         cargarReservas();
      }
    } catch (error) {
      alert((error as Error).message); // (Mostrará "Stock insuficiente" si falla)
    }
  };
  
  // 5. Manejador para cancelar una reserva
  const handleCancelarReserva = async (reservaId: number) => {
    const motivo = window.prompt("Por favor, ingresa el motivo de la cancelación:");
    
    // Si el usuario cancela el prompt o no escribe nada
    if (!motivo) {
      alert("La cancelación fue abortada.");
      return;
    }

    try {
      await cancelarReserva(reservaId, motivo);
      alert('¡Reserva cancelada! (El stock ha sido liberado)');
      
      // Recarga la lista actual para reflejar el cambio
      cargarReservas();
      
    } catch (error) {
      alert((error as Error).message);
    }
  };

  // 6. Manejador para confirmar una reserva
  const handleConfirmarReserva = async (reservaId: number) => {
    if (!window.confirm("¿Seguro que quieres confirmar esta reserva?")) {
      return;
    }
    try {
      // Llamamos a la API con el ID del usuario (para la verificación) y el nuevo estado
      const reservaActualizada = await actualizarReserva(
        reservaId, 
        USUARIO_ID_PRUEBA, // El 'usuarioId' es requerido por el backend
        'confirmado'       // El nuevo estado
      );
      
      alert('¡Reserva confirmada!');
      
      // Actualizamos la lista local con la reserva actualizada
      setReservas(reservasActuales => 
        reservasActuales.map(res => 
          res.idReserva === reservaId ? reservaActualizada : res
        )
      );
      
    } catch (error) {
      alert((error as Error).message);
    }
  };

  // 7. Manejadores de Filtro y Paginación
  const handleFiltroEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltroEstado(e.target.value);
    setCurrentPage(1); // Resetea a la página 1
  };
  
  const handlePaginaSiguiente = () => {
    if (!isLastPage) {
      setCurrentPage(p => p + 1);
    }
  };
  
  const handlePaginaAnterior = () => {
    setCurrentPage(p => Math.max(1, p - 1));
  };


  return (
    <div>
      {/* --- Formulario para crear reserva --- */}
      <h3 className="text-lg font-bold text-gray-800 mb-4">Crear Nueva Reserva</h3>
      <form onSubmit={handleCrearReserva} className="mb-6 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="ID de Compra (ej. COMPRA-001)"
          value={idCompra}
          onChange={e => setIdCompra(e.target.value)}
          required
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="number"
          placeholder="ID Producto"
          value={prodId}
          onChange={e => setProdId(e.target.value)}
          required
          className="w-full sm:w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="number"
          placeholder="Cantidad"
          value={prodCant}
          onChange={e => setProdCant(Number(e.target.value))}
          required
          min="1"
          className="w-full sm:w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button 
          type="submit" 
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200"
        >
          Crear Reserva
        </button>
      </form>

      {/* --- Filtro por Estado --- */}
      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="filtro-estado" className="font-bold text-gray-700">
          Filtrar por estado:
        </label>
        <select 
          id="filtro-estado" 
          value={filtroEstado} 
          onChange={handleFiltroEstadoChange} 
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todas</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmado">Confirmado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* --- Lista de reservas existentes --- */}
      <h3 className="text-lg font-bold text-gray-800 mb-4 mt-6">Reservas Existentes</h3>
      {cargando ? <p className="text-gray-600">Cargando reservas...</p> : (
        reservas.length > 0 ? (
          reservas.map(res => (
            <div key={res.idReserva} className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <p className="font-bold text-gray-800 mb-1">
                    Reserva ID: {res.idReserva} <span className="font-normal text-gray-600">(Compra: {res.idCompra})</span>
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Estado:</span>{' '}
                    <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                      res.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                      res.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {res.estado}
                    </span>
                  </p>
                  <p className="font-semibold mb-1">Productos:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                     {res.productos && res.productos.length > 0 ? (
                      res.productos.map(p => (
                        <li key={`${res.idReserva}-${p.idProducto}`}>
                          {p.cantidad} x (ID: {p.idProducto}) {p.nombre || ''}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">(Sin productos detallados)</li>
                    )}
                  </ul>
                </div>
                
                {/* --- Grupo de Botones de Acción --- */}
                <div className="flex flex-row sm:flex-col gap-2 items-start flex-shrink-0">
                  
                  {/* Botón de Confirmar (solo si está pendiente) */}
                  {res.estado && res.estado.trim() === 'pendiente' && (
                    <button
                      onClick={() => handleConfirmarReserva(res.idReserva)}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 w-full sm:w-28"
                    >
                      Confirmar
                    </button>
                  )}

                  {/* Botón de Cancelar (solo si no está cancelada) */}
                  {res.estado && res.estado.trim() !== 'cancelado' && (
                    <button
                      onClick={() => handleCancelarReserva(res.idReserva)}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 w-full sm:w-28"
                    >
                      Cancelar
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center py-8">No se encontraron reservas para este filtro.</p>
        )
      )}
      
      {/* --- Paginación --- */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
        <button 
          onClick={handlePaginaAnterior} 
          disabled={currentPage === 1 || cargando}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Anterior
        </button>
        <span className="font-medium text-gray-700">Página: {currentPage}</span>
        <button 
          onClick={handlePaginaSiguiente} 
          disabled={isLastPage || cargando}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Siguiente
        </button>
      </div>

    </div>
  );
}