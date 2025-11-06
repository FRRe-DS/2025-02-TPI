// --- archivo: src/componentes/GestionReservas.tsx ---
"use client";
import React, { useState, useEffect } from 'react';
// Importamos las funciones de la API
import { obtenerReservas, crearReserva, cancelarReserva } from '../servicios/api';

// 1. Definimos las interfaces (basadas en tu openapi.yaml)
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
  // (Asegúrate de que la interfaz de producto coincida)
  productos: {
    idProducto: number;
    nombre: string;
    cantidad: number;
  }[];
}

// Hardcodeamos un ID de usuario para probar
// (En el mundo real, vendría de la autenticación)
const USUARIO_ID_PRUEBA = 1; // (Recuerda que creamos reservas para el usuario 1)

export default function GestionReservas() {
  const [reservas, setReservas] = useState<ReservaCompleta[]>([]);
  const [cargando, setCargando] = useState(true);

  // --- Estados para el formulario de NUEVA RESERVA ---
  const [idCompra, setIdCompra] = useState('');
  const [prodId, setProdId] = useState(''); // ID del producto a reservar
  const [prodCant, setProdCant] = useState(1); // Cantidad a reservar

  // 2. Función para cargar las reservas
  const cargarReservas = () => {
    setCargando(true);
    obtenerReservas(USUARIO_ID_PRUEBA)
      .then((res: ReservaCompleta[]) => {
        setReservas(res || []);
      })
      .catch(error => {
        console.error("Error al cargar reservas:", error);
        setReservas([]);
      })
      .finally(() => {
        setCargando(false);
      });
  };

  // 3. Carga inicial de reservas
  useEffect(() => {
    cargarReservas();
  }, []);

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
      // Recargamos la lista de reservas
      cargarReservas();
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
      
      // Actualizamos la lista en el frontend para reflejar el cambio
      setReservas(reservasActuales => 
        reservasActuales.map(res => 
          res.idReserva === reservaId ? { ...res, estado: 'cancelado' } : res
        )
      );
      
    } catch (error) {
      alert((error as Error).message);
    }
  };

  if (cargando) {
    return <div>Cargando reservas...</div>;
  }

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

      {/* --- Lista de reservas existentes --- */}
      <h3>Reservas Existentes</h3>
      {reservas.length > 0 ? (
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
                      <li key={p.idProducto}>
                        {p.cantidad} x (ID: {p.idProducto}) {p.nombre || ''}
                      </li>
                    ))
                  ) : (
                    <li>(Sin productos detallados)</li>
                  )}
                </ul>
              </div>
              
              {/* --- LÓGICA DEL BOTÓN CORREGIDA --- */}
              {/* Comprueba si el estado existe, quita espacios y compara */}
              {res.estado && res.estado.trim() !== 'cancelado' && (
                <button
                  onClick={() => handleCancelarReserva(res.idReserva)}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                    height: 'fit-content'
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <p>No se encontraron reservas para este usuario.</p>
      )}
    </div>
  );
}