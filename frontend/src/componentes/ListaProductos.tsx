// --- archivo: src/componentes/ListaProductos.tsx ---
"use client";
import React, { useEffect, useState } from 'react';
import { obtenerProductos, eliminarProducto, actualizarProducto } from '../servicios/api';

// --- INTERFACES (Ahora más completas) ---
export interface Dimensiones {
  largoCm: number;
  anchoCm: number;
  altoCm: number;
}

export interface Ubicacion {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Imagen {
  url: string;
  esPrincipal: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string; // La añadí, la teníamos en el backend
  precio: number;
  stockDisponible: number;
  pesoKg?: number;
  dimensiones?: Dimensiones;
  ubicacion?: Ubicacion;
  imagenes?: Imagen[];
  categorias?: any[];
}

// Interfaz para el formulario de edición (refleja los campos editables)
interface EditFormData {
  nombre: string;
  descripcion: string;
  precio: number;
  stockDisponible: number;
  pesoKg: number;
  dimensiones: Dimensiones;
  ubicacion: Ubicacion;
}

interface Props {
  actualizar?: boolean;
}

export default function ListaProductos({ actualizar }: Props) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  // Estado del formulario de edición, ahora mucho más grande
  const [editFormData, setEditFormData] = useState<EditFormData>({
    nombre: '',
    descripcion: '',
    precio: 0,
    stockDisponible: 0,
    pesoKg: 0,
    dimensiones: { largoCm: 0, anchoCm: 0, altoCm: 0 },
    ubicacion: { street: '', city: '', state: '', postal_code: '', country: '' }
  });

  // --- Carga de productos (no cambia) ---
  useEffect(() => {
    setCargando(true);
    obtenerProductos() 
      .then((res: Producto[]) => setProductos(res || []))
      .catch(error => {
        console.error("Error al cargar productos:", error);
        setProductos([]);
      })
      .finally(() => setCargando(false));
  }, [actualizar]); 

  // --- Función de eliminar (no cambia) ---
  const handleEliminar = async (id: number) => {
    // ... (tu código de handleEliminar)
  };

  // --- Funciones de EDICIÓN (Actualizadas) ---

  // 1. Carga el formulario con TODOS los datos del producto
  const handleEditarClick = (producto: Producto) => {
    setEditingProductId(producto.id);
    setEditFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      stockDisponible: producto.stockDisponible,
      pesoKg: producto.pesoKg || 0,
      // Usamos '||' para asegurar que no sean 'undefined' y rompan el input
      dimensiones: producto.dimensiones || { largoCm: 0, anchoCm: 0, altoCm: 0 },
      ubicacion: producto.ubicacion || { street: '', city: '', state: '', postal_code: '', country: '' }
    });
  };

  // 2. Cancela la edición
  const handleCancelarEdicion = () => {
    setEditingProductId(null); 
  };

  // 3. Manejador para inputs simples (nombre, precio, stock, peso)
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // 4. Manejador para inputs ANIDADOS (dimensiones y ubicacion)
  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement>, parent: 'dimensiones' | 'ubicacion') => {
    const { name, value } = e.target;
    setEditFormData(prevData => ({
      ...prevData,
      [parent]: {
        ...prevData[parent],
        [name]: value
      }
    }));
  };

  // 5. Guarda TODOS los campos
  const handleGuardarEdicion = async (id: number) => {
    try {
      // Prepara el objeto de datos completo
      const datosActualizados = {
        nombre: editFormData.nombre,
        descripcion: editFormData.descripcion,
        precio: Number(editFormData.precio),
        stockInicial: Number(editFormData.stockDisponible), // Mapeo de nombre
        pesoKg: Number(editFormData.pesoKg),
        dimensiones: {
          largoCm: Number(editFormData.dimensiones.largoCm),
          anchoCm: Number(editFormData.dimensiones.anchoCm),
          altoCm: Number(editFormData.dimensiones.altoCm)
        },
        ubicacion: editFormData.ubicacion
        // (Omitimos 'imagenes' porque no las estamos editando)
      };

      const productoActualizado = await actualizarProducto(id, datosActualizados);
      
      // Actualiza la lista
      setProductos(productosActuales =>
        productosActuales.map(p => 
          p.id === id ? productoActualizado : p
        )
      );
      
      handleCancelarEdicion(); // Sal del modo edición
      alert('¡Producto actualizado!');

    } catch (error) {
      alert((error as Error).message);
    }
  };

  if (cargando) return <div>Cargando productos...</div>;

  return (
    <div>
      <h2>Productos disponibles</h2>
      {productos.length > 0 ? (
        productos.map(p => (
          <div key={p.id} style={{ borderBottom: '1px solid #eee', padding: '10px' }}>
            
            {editingProductId === p.id ? (
              // --- VISTA DE EDICIÓN (Formulario Extendido) ---
              <div>
                <strong>Editando Producto ID: {p.id}</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                  {/* Columna 1 */}
                  <div>
                    <label>Nombre:</label><br />
                    <input type="text" name="nombre" value={editFormData.nombre} onChange={handleEditFormChange} />
                    <br /><label>Descripción:</label><br />
                    <input type="text" name="descripcion" value={editFormData.descripcion} onChange={handleEditFormChange} />
                    <br /><label>Precio:</label><br />
                    <input type="number" name="precio" value={editFormData.precio} onChange={handleEditFormChange} />
                    <br /><label>Stock:</label><br />
                    <input type="number" name="stockDisponible" value={editFormData.stockDisponible} onChange={handleEditFormChange} />
                    <br /><label>Peso (Kg):</label><br />
                    <input type="number" name="pesoKg" value={editFormData.pesoKg} onChange={handleEditFormChange} />
                  </div>
                  {/* Columna 2 */}
                  <div>
                    <strong>Dimensiones (cm):</strong><br />
                    <label>Largo:</label> <input type="number" name="largoCm" value={editFormData.dimensiones.largoCm} onChange={e => handleNestedChange(e, 'dimensiones')} /><br />
                    <label>Ancho:</label> <input type="number" name="anchoCm" value={editFormData.dimensiones.anchoCm} onChange={e => handleNestedChange(e, 'dimensiones')} /><br />
                    <label>Alto:</label>  <input type="number" name="altoCm" value={editFormData.dimensiones.altoCm} onChange={e => handleNestedChange(e, 'dimensiones')} /><br />
                    
                    <strong>Ubicación:</strong><br />
                    <label>Calle:</label>   <input type="text" name="street" value={editFormData.ubicacion.street} onChange={e => handleNestedChange(e, 'ubicacion')} /><br />
                    <label>Ciudad:</label>  <input type="text" name="city" value={editFormData.ubicacion.city} onChange={e => handleNestedChange(e, 'ubicacion')} /><br />
                    {/* (Puedes añadir inputs para state, postal_code, country...) */}
                  </div>
                </div>
                {/* Botones de acción */}
                <div style={{ marginTop: '10px' }}>
                  <button onClick={() => handleGuardarEdicion(p.id)} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px', marginRight: '5px' }}>Guardar</button>
                  <button onClick={handleCancelarEdicion} style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '5px' }}>Cancelar</button>
                </div>
              </div>
            ) : (
              // --- VISTA NORMAL (Display Extendido) ---
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{p.nombre} (ID: {p.id})</strong><br />
                  <p style={{ margin: 0, color: '#555' }}>{p.descripcion || '(Sin descripción)'}</p>
                  <span>Precio: ${p.precio} | </span>
                  <span>Stock: {p.stockDisponible} | </span>
                  <span>Peso: {p.pesoKg || 'N/A'} kg</span><br />
                  <small style={{ color: '#777' }}>
                    Dimensiones: {p.dimensiones ? `${p.dimensiones.largoCm}x${p.dimensiones.anchoCm}x${p.dimensiones.altoCm} cm` : 'N/A'}
                  </small><br />
                  <small style={{ color: '#777' }}>
                    Ubicación: {p.ubicacion ? `${p.ubicacion.street}, ${p.ubicacion.city}` : 'N/A'}
                  </small><br />
                  {/* Muestra la primera imagen */}
                  {p.imagenes && p.imagenes.length > 0 && (
                    <img src={p.imagenes[0].url} alt={p.nombre} style={{ width: '50px', height: '50px', objectFit: 'cover', marginTop: '5px' }} />
                  )}
                </div>
                <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                  <button onClick={() => handleEditarClick(p)} style={{ backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                  <button onClick={() => handleEliminar(p.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No se encontraron productos.</p>
      )}
    </div>
  );
}