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
    <div style={{ marginTop: '2rem' }}>
      <hr />
      <h2>Gestión de Reservas (Usuario ID: {USUARIO_ID_PRUEBA})</h2>
      
      {/* --- Formulario para crear reserva --- */}
      <h3>Crear Nueva Reserva</h3>
      <form onSubmit={handleCrearReserva} style={{ marginBottom: '1.5rem', display: 'flex', gap: '5px' }}>
        <input
          type="text"
          placeholder="ID de Compra (ej. COMPRA-001)"
          value={idCompra}
          onChange={e => setIdCompra(e.target.value)}
          required
          style={{ padding: '5px' }}
        />
        <input
          type="number"
          placeholder="ID Producto"
          value={prodId}
          onChange={e => setProdId(e.target.value)}
          required
          style={{ padding: '5px', width: '100px' }}
        />
        <input
          type="number"
          placeholder="Cantidad"
          value={prodCant}
          onChange={e => setProdCant(Number(e.target.value))}
          required
          min="1"
          style={{ padding: '5px', width: '80px' }}
        />
        <button type="submit" style={{ padding: '5px' }}>Crear Reserva</button>
      </form>

      {/* --- Filtro por Estado --- */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="filtro-estado" style={{ marginRight: '10px', fontWeight: 'bold' }}>
          Filtrar por estado:
        </label>
        <select id="filtro-estado" value={filtroEstado} onChange={handleFiltroEstadoChange} style={{ padding: '5px' }}>
          <option value="">Todas</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmado">Confirmado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* --- Lista de reservas existentes --- */}
      <h3>Reservas Existentes</h3>
      {cargando ? <p>Cargando reservas...</p> : (
        reservas.length > 0 ? (
          reservas.map(res => (
            <div key={res.idReserva} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>Reserva ID: {res.idReserva}</strong> (Compra: {res.idCompra})<br />
                  <strong>Estado:</strong> {res.estado}<br />
                  <strong>Productos:</strong>
                  <ul>
                     {res.productos && res.productos.length > 0 ? (
                      res.productos.map(p => (
                        <li key={`${res.idReserva}-${p.idProducto}`}>
                          {p.cantidad} x (ID: {p.idProducto}) {p.nombre || ''}
                        </li>
                      ))
                    ) : (
                      <li>(Sin productos detallados)</li>
                    )}
                  </ul>
                </div>
                
                {/* --- Grupo de Botones de Acción --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-start', flexShrink: 0 }}>
                  
                  {/* Botón de Confirmar (solo si está pendiente) */}
                  {res.estado && res.estado.trim() === 'pendiente' && (
                    <button
                      onClick={() => handleConfirmarReserva(res.idReserva)}
                      style={{
                        backgroundColor: '#28a745', // Verde
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        width: '100px' // Ancho fijo
                      }}
                    >
                      Confirmar
                    </button>
                  )}

                  {/* Botón de Cancelar (solo si no está cancelada) */}
                  {res.estado && res.estado.trim() !== 'cancelado' && (
                    <button
                      onClick={() => handleCancelarReserva(res.idReserva)}
                      style={{
                        backgroundColor: '#dc3545', // Rojo
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        width: '100px' // Ancho fijo
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))
        ) : (
          <p>No se encontraron reservas para este filtro.</p>
        )
      )}
      
      {/* --- Paginación --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
        <button 
          onClick={handlePaginaAnterior} 
          disabled={currentPage === 1 || cargando}
          style={{ padding: '8px 12px' }}
        >
          Anterior
        </button>
        <span>Página: {currentPage}</span>
        <button 
          onClick={handlePaginaSiguiente} 
          disabled={isLastPage || cargando}
          style={{ padding: '8px 12px' }}
        >
          Siguiente
        </button>
      </div>

    </div>
  );
}