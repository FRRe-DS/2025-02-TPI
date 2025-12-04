"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  obtenerProductos,
  eliminarProducto,
  obtenerCategorias,
  obtenerProductoPorId,
} from "../servicios/api";

import "./ListaProductos.css";

// ---------- INTERFACES ----------
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

interface Props {
  actualizar?: boolean;
}

const LIMIT_POR_PAGINA = 5;

export default function ListaProductos({ actualizar }: Props) {
  const router = useRouter();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [todasCategorias, setTodasCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);

  const [searchId, setSearchId] = useState("");
  const [searchedProduct, setSearchedProduct] = useState<Producto | null>(null);
  const [searchError, setSearchError] = useState("");

  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState(0);
  const [orden, setOrden] = useState("");

  useEffect(() => {
    if (!searchedProduct) {
      setCargando(true);
      const filtrosParaApi = {
        page: currentPage,
        limit: LIMIT_POR_PAGINA,
        q: filtroTexto,
        categoriaId: filtroCategoria,
      };

      Promise.all([
        obtenerProductos(filtrosParaApi),
        todasCategorias.length === 0
          ? obtenerCategorias()
          : Promise.resolve(todasCategorias),
      ])
        .then(([prods, cats]) => {
          setProductos(prods || []);
          if (todasCategorias.length === 0) setTodasCategorias(cats || []);
          setIsLastPage((prods || []).length < LIMIT_POR_PAGINA);
        })
        .catch((err) => console.error("Error cargando productos:", err))
        .finally(() => setCargando(false));
    }
  }, [actualizar, currentPage, filtroTexto, filtroCategoria, searchedProduct]);

  const handleSearchById = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    if (!searchId.trim()) {
      setSearchError("Ingrese un ID válido.");
      return;
    }
    try {
      setCargando(true);
      const prod = await obtenerProductoPorId(parseInt(searchId));
      setSearchedProduct(prod);
    } catch {
      setSearchError("Producto no encontrado.");
      setSearchedProduct(null);
    } finally {
      setCargando(false);
    }
  };

  const handleClearSearch = () => {
    setSearchId("");
    setSearchError("");
    setSearchedProduct(null);
    setFiltroTexto("");
    setFiltroCategoria(0);
    setCurrentPage(1);
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await eliminarProducto(id);
      if (searchedProduct?.id === id) {
        handleClearSearch();
      } else {
        setProductos((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  let listaParaMostrar = searchedProduct ? [searchedProduct] : [...productos];

  if (!searchedProduct) {
    if (orden === "az") listaParaMostrar.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (orden === "za") listaParaMostrar.sort((a, b) => b.nombre.localeCompare(a.nombre));
    if (orden === "precio-asc") listaParaMostrar.sort((a, b) => a.precio - b.precio);
    if (orden === "precio-desc") listaParaMostrar.sort((a, b) => b.precio - a.precio);
  }

  const getStockClass = (cantidad: number) => {
    if (cantidad <= 5) return "badge-stock rojo";
    if (cantidad <= 20) return "badge-stock amarillo";
    if (cantidad <= 100) return "badge-stock azul";
    return "badge-stock verde";
  };

  return (
    <div className="lp-container">
      <h2 className="lp-title">Lista de Productos</h2>

      {/* ---------------- FILTROS (DISEÑO RECTANGULAR + SVG) ---------------- */}
      <div className="filtros-row">
        
        {/* 1. Formulario ID */}
        <form onSubmit={handleSearchById} className="form-id">
          <input
            type="number"
            placeholder="ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="input-rectangulo input-id" 
          />
          
          {/* LUPA SVG */}
          <button type="submit" className="btn-icon search-btn" title="Buscar por ID">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          {/* X SVG (Solo aparece si hay búsqueda) */}
          {searchedProduct && (
            <button type="button" onClick={handleClearSearch} className="btn-icon clear-btn" title="Limpiar búsqueda">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </form>

        {/* 2. Filtros Generales (Inputs rectangulares) */}
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={filtroTexto}
          onChange={(e) => {
            setFiltroTexto(e.target.value);
            setCurrentPage(1);
          }}
          disabled={!!searchedProduct}
          className="input-rectangulo"
        />

        <select
          value={filtroCategoria}
          onChange={(e) => {
            setFiltroCategoria(Number(e.target.value));
            setCurrentPage(1);
          }}
          disabled={!!searchedProduct}
          className="input-rectangulo"
        >
          <option value={0}>Todas las categorías</option>
          {todasCategorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>

        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          disabled={!!searchedProduct}
          className="input-rectangulo"
        >
          <option value="">Ordenar por…</option>
          <option value="az">Nombre A → Z</option>
          <option value="za">Nombre Z → A</option>
          <option value="precio-asc">Precio menor → mayor</option>
          <option value="precio-desc">Precio mayor → menor</option>
        </select>
      </div>

      {searchError && <p className="lp-error">{searchError}</p>}

      {/* ---------------- TABLA (ESTILO ORIGINAL) ---------------- */}
      {cargando ? (
        <p className="lp-loading">Cargando…</p>
      ) : (
        <div className="tabla-container">
          <table className="tabla-dashboard">
            <thead>
              <tr>
                <th className="col-id">ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaParaMostrar.length > 0 ? (
                listaParaMostrar.map((p) => (
                  <tr key={p.id}>
                    <td className="col-id">{p.id}</td>
                    <td className="col-nombre">{p.nombre}</td>
                    <td>{p.categorias?.map((c) => c.nombre).join(", ") || "N/A"}</td>
                    <td className="col-precio">${p.precio}</td>
                    <td><span className={getStockClass(p.stockDisponible)}>{p.stockDisponible}</span></td>
                    <td className="acciones-col">
                      <button className="link-detalle" onClick={() => router.push(`/productos/detalle/${p.id}`)}>
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINACIÓN (ESTILO ORIGINAL) */}
      {!searchedProduct && !cargando && (
        <div className="lp-pagination">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</button>
          <span>Página: {currentPage}</span>
          <button onClick={() => setCurrentPage((p) => p + 1)} disabled={isLastPage}>Siguiente</button>
        </div>
      )}
    </div>
  );
}