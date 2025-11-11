// --- archivo: src/componentes/ListaProductos.tsx ---
"use client";
import React, { useEffect, useState } from 'react';
// Importamos todas las funciones de API necesarias
import { 
  obtenerProductos, 
  eliminarProducto, 
  actualizarProducto, 
  obtenerCategorias,
  obtenerProductoPorId // Para la búsqueda
} from '../servicios/api';

// --- INTERFACES ---

export interface Categoria {
  id: number;
  nombre: string;
}

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
  descripcion: string;
  precio: number;
  stockDisponible: number;
  pesoKg?: number;
  dimensiones?: Dimensiones;
  ubicacion?: Ubicacion;
  imagenes?: Imagen[];
  categorias?: Categoria[];
}

interface EditFormData {
  nombre: string;
  descripcion: string;
  precio: number;
  stockDisponible: number;
  pesoKg: number;
  dimensiones: Dimensiones;
  ubicacion: Ubicacion;
  categoriaIds: number[];
}
// --- Fin de Interfaces ---

interface Props {
  actualizar?: boolean; // Para el trigger del formulario de creación
}

// Constante para el límite de productos por página
const LIMIT_POR_PAGINA = 5;

export default function ListaProductos({ actualizar }: Props) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [todasCategorias, setTodasCategorias] = useState<Categoria[]>([]);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    nombre: '', 
    descripcion: '', 
    precio: 0, 
    stockDisponible: 0, 
    pesoKg: 0,
    dimensiones: { largoCm: 0, anchoCm: 0, altoCm: 0 },
    ubicacion: { street: '', city: '', state: '', postal_code: '', country: '' },
    categoriaIds: []
  });

  // --- ESTADOS DE BÚSQUEDA Y FILTROS ---
  const [searchId, setSearchId] = useState('');
  const [searchedProduct, setSearchedProduct] = useState<Producto | null>(null);
  const [searchError, setSearchError] = useState('');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState(0); // 0 = "Todas"

  // --- ESTADOS DE PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);

  // --- Carga de datos (Actualizado con Paginación y Filtros) ---
  useEffect(() => {
    // Solo cargamos la lista si NO estamos en modo búsqueda por ID
    if (!searchedProduct) {
      setCargando(true);
      
      const filtrosParaApi = {
        page: currentPage,
        limit: LIMIT_POR_PAGINA,
        q: filtroTexto,
        categoriaId: filtroCategoria
      };

      Promise.all([
        obtenerProductos(filtrosParaApi),
        // Solo cargamos categorías si no las tenemos ya
        todasCategorias.length === 0 ? obtenerCategorias() : Promise.resolve(todasCategorias)
      ])
      .then(([prods, cats]) => {
        setProductos(prods || []);
        if (todasCategorias.length === 0) setTodasCategorias(cats || []);
        setIsLastPage((prods || []).length < LIMIT_POR_PAGINA);
      })
      .catch(error => {
        console.error("Error al cargar datos:", error);
        setProductos([]);
      })
      .finally(() => setCargando(false));
    }
  // Se re-ejecuta si cambia CUALQUIERA de estos valores
  }, [actualizar, currentPage, searchedProduct, filtroTexto, filtroCategoria]);

  // --- Funciones CRUD (Actualizadas para manejar el estado de búsqueda) ---

  const handleEliminar = async (id: number) => {
    if (!window.confirm(`¿Seguro que quieres eliminar el producto ${id}?`)) return;
    try {
      await eliminarProducto(id);
      // Quita el producto de AMBAS listas
      setProductos(prev => prev.filter(p => p.id !== id));
      if (searchedProduct && searchedProduct.id === id) {
        setSearchedProduct(null); // Limpia la búsqueda si se borró
      }
      alert('Producto eliminado.');
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleGuardarEdicion = async (id: number) => {
    try {
      const datosActualizados = {
        ...editFormData,
        stockInicial: Number(editFormData.stockDisponible), 
        precio: Number(editFormData.precio),
        pesoKg: Number(editFormData.pesoKg),
        dimensiones: {
          largoCm: Number(editFormData.dimensiones.largoCm),
          anchoCm: Number(editFormData.dimensiones.anchoCm),
          altoCm: Number(editFormData.dimensiones.altoCm)
        }
      };
  const payload = { ...datosActualizados };
  Reflect.deleteProperty(payload, 'stockDisponible');

  const productoActualizado = await actualizarProducto(id, payload);
      
      // Actualiza AMBAS listas
      setProductos(prev => prev.map(p => (p.id === id ? productoActualizado : p)));
      if (searchedProduct && searchedProduct.id === id) {
        setSearchedProduct(productoActualizado); // Actualiza el producto buscado
      }
      
      setEditingProductId(null); // Sal del modo edición
      alert('¡Producto actualizado!');

    } catch (error) {
      alert((error as Error).message);
    }
  };

  // 1. Clic en "Editar"
  const handleEditarClick = (producto: Producto) => {
    setEditingProductId(producto.id);
    setEditFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      stockDisponible: producto.stockDisponible,
      pesoKg: producto.pesoKg || 0,
      dimensiones: producto.dimensiones || { largoCm: 0, anchoCm: 0, altoCm: 0 },
      ubicacion: producto.ubicacion || { street: '', city: '', state: '', postal_code: '', country: '' },
      categoriaIds: producto.categorias ? producto.categorias.map(c => c.id) : []
    });
  };

  // 2. Clic en "Cancelar"
  const handleCancelarEdicion = () => {
    setEditingProductId(null);
  };

  // 3. Cambio en inputs simples
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const valorProcesado = type === 'number' ? (name === 'stockDisponible' ? parseInt(value) : parseFloat(value)) : value;
    setEditFormData(prevData => ({ ...prevData, [name]: valorProcesado }));
  };

  // 4. Cambio en inputs anidados
  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement>, parent: 'dimensiones' | 'ubicacion') => {
    const { name, value, type } = e.target;
    const valorProcesado = type === 'number' ? parseFloat(value) : value;
    setEditFormData(prevData => ({ ...prevData, [parent]: { ...prevData[parent], [name]: valorProcesado } }));
  };

  // 5. Cambio en checkboxes de categoría
  const handleEditCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const catId = Number(e.target.value);
    const isChecked = e.target.checked;
    setEditFormData(prev => {
      const currentCatIds = prev.categoriaIds || [];
      let newCatIds: number[];
      if (isChecked) { newCatIds = [...currentCatIds, catId]; }
      else { newCatIds = currentCatIds.filter(id => id !== catId); }
      return { ...prev, categoriaIds: newCatIds };
    });
  };

  // --- MANEJADORES DE BÚSQUEDA Y FILTROS ---
  const handleSearchById = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setSearchedProduct(null);
    if (!searchId) {
      setSearchError('Por favor, ingrese un ID.');
      return;
    }
    try {
      setCargando(true);
      const producto = await obtenerProductoPorId(parseInt(searchId));
      setSearchedProduct(producto); 
      setSearchId(''); 
    } catch (error) {
      setSearchError((error as Error).message); 
    } finally {
      setCargando(false);
    }
  };

  const handleClearSearch = () => {
    setSearchId('');
    setSearchedProduct(null);
    setSearchError('');
    // Resetea filtros y paginación
    setFiltroTexto('');
    setFiltroCategoria(0);
    setCurrentPage(1); 
  };
  
  // Resetea la página a 1 CADA VEZ que cambiamos un filtro
  const handleFiltroTextoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroTexto(e.target.value);
    setCurrentPage(1); 
  };
  
  const handleFiltroCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltroCategoria(Number(e.target.value));
    setCurrentPage(1); 
  };

  // --- MANEJADORES DE PAGINACIÓN ---
  const handlePaginaSiguiente = () => {
    if (!isLastPage) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };
  
  const handlePaginaAnterior = () => {
    setCurrentPage(prevPage => Math.max(1, prevPage - 1));
  };

  // --- LÓGICA DE RENDERIZADO ---
  const listaParaMostrar = searchedProduct ? [searchedProduct] : productos;

  return (
    <div>
      {/* --- SECCIÓN DE BÚSQUEDA Y FILTROS --- */}
      <div style={{ padding: '10px', backgroundColor: '#f4f4f4', borderRadius: '5px', marginBottom: '20px' }}>
        
        {/* Búsqueda por ID */}
        <h3>Buscar Producto por ID</h3>
        <form onSubmit={handleSearchById} style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
          <input 
            type="number"
            placeholder="Ingresar ID del producto"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            style={{ padding: '8px' }}
          />
          <button type="submit" style={{ padding: '8px 12px' }}>Buscar</button>
        </form>
        {searchError && <p style={{ color: 'red' }}>{searchError}</p>}

        {/* Filtros de Lista */}
        <h3>Filtrar Lista de Productos</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={filtroTexto}
            onChange={handleFiltroTextoChange}
            style={{ padding: '8px' }}
            disabled={!!searchedProduct} // Deshabilitado si hay búsqueda por ID
          />
          <select
            value={filtroCategoria}
            onChange={handleFiltroCategoriaChange}
            style={{ padding: '8px' }}
            disabled={!!searchedProduct}
          >
            <option value={0}>Todas las categorías</option>
            {todasCategorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </div>
        
        {/* Botón de Limpiar */}
        {(searchedProduct || searchError || filtroTexto || filtroCategoria > 0) && (
            <button type="button" onClick={handleClearSearch} style={{ padding: '8px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none' }}>
              Limpiar Búsqueda y Filtros
            </button>
        )}
      </div>

      {/* --- LISTA DE PRODUCTOS (DINÁMICA) --- */}
      <h2>Productos disponibles</h2>
      {cargando ? <p>Cargando...</p> : (
        listaParaMostrar.length > 0 ? (
          listaParaMostrar.map(p => (
            <div key={p.id} style={{ borderBottom: '1px solid #eee', padding: '10px' }}>
              
              {editingProductId === p.id ? (
                // --- VISTA DE EDICIÓN (Formulario Extendido) ---
                <div>
                  <strong>Editando Producto ID: {p.id}</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px', marginTop: '10px' }}>
                    {/* Columna 1: Info Básica */}
                    <div>
                      <label>Nombre:</label><br />
                      <input type="text" name="nombre" value={editFormData.nombre} onChange={handleEditFormChange} />
                      <br /><label>Descripción:</label><br />
                      <input type="text" name="descripcion" value={editFormData.descripcion} onChange={handleEditFormChange} />
                      <br /><label>Precio:</label><br />
                      <input type="number" name="precio" value={editFormData.precio} onChange={handleEditFormChange} step="0.01" />
                      <br /><label>Stock:</label><br />
                      <input type="number" name="stockDisponible" value={editFormData.stockDisponible} onChange={handleEditFormChange} step="1" />
                      <br /><label>Peso (Kg):</label><br />
                      <input type="number" name="pesoKg" value={editFormData.pesoKg} onChange={handleEditFormChange} step="0.1" />
                    </div>
                    
                    {/* Columna 2: Dimensiones y Ubicación */}
                    <div>
                      <strong>Dimensiones (cm):</strong><br />
                      <label>Largo:</label> <input type="number" name="largoCm" value={editFormData.dimensiones.largoCm} onChange={e => handleNestedChange(e, 'dimensiones')} step="0.1" /><br />
                      <label>Ancho:</label> <input type="number" name="anchoCm" value={editFormData.dimensiones.anchoCm} onChange={e => handleNestedChange(e, 'dimensiones')} step="0.1" /><br />
                      <label>Alto:</label>  <input type="number" name="altoCm" value={editFormData.dimensiones.altoCm} onChange={e => handleNestedChange(e, 'dimensiones')} step="0.1" /><br />
                      
                      <strong>Ubicación:</strong><br />
                      <label>Calle:</label>   <input type="text" name="street" value={editFormData.ubicacion.street} onChange={e => handleNestedChange(e, 'ubicacion')} /><br />
                      <label>Ciudad:</label>  <input type="text" name="city" value={editFormData.ubicacion.city} onChange={e => handleNestedChange(e, 'ubicacion')} /><br />
                      <label>País:</label>    <input type="text" name="country" value={editFormData.ubicacion.country} onChange={e => handleNestedChange(e, 'ubicacion')} />
                    </div>

                    {/* Columna 3: Categorías */}
                    <div>
                      <strong>Categorías:</strong>
                      <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '5px', backgroundColor: 'white' }}>
                        {todasCategorias.map(cat => (
                          <div key={cat.id}>
                            <input
                              type="checkbox"
                              id={`cat-edit-${p.id}-${cat.id}`}
                              value={cat.id}
                              onChange={handleEditCategoryChange}
                              checked={editFormData.categoriaIds.includes(cat.id)}
                            />
                            <label htmlFor={`cat-edit-${p.id}-${cat.id}`} style={{ marginLeft: '5px' }}>{cat.nombre}</label>
                          </div>
                        ))}
                      </div>
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
                    <small style={{ color: '#777' }}>
                      Categorías: {p.categorias && p.categorias.length > 0 ? p.categorias.map(c => c.nombre).join(', ') : 'N/A'}
                    </small><br />
                    {p.imagenes && p.imagenes.length > 0 && (
                      <img src={p.imagenes[0].url} alt={p.nombre} style={{ width: '50px', height: '50px', objectFit: 'cover', marginTop: '5px' }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '5px', flexShrink: 0, alignSelf: 'flex-start' }}>
                    <button onClick={() => handleEditarClick(p)} style={{ backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                    <button onClick={() => handleEliminar(p.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No se encontraron productos. (O limpia la búsqueda para ver la lista completa).</p>
        ))}
      

      {/* --- SECCIÓN DE PAGINACIÓN --- */}
      {/* Solo se muestra si NO estamos en modo búsqueda por ID */}
      {!searchedProduct && (
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
      )}
    </div>
  );
}