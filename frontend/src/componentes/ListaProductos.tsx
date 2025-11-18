
"use client";

import React, { useEffect, useState } from "react";
import {
  obtenerProductos,
  eliminarProducto,
  actualizarProducto,
  obtenerCategorias,
  obtenerProductoPorId,
} from "../servicios/api";

import "./ListaProductos.css"; // CSS PURO

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

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

export default function ListaProductos({ actualizar }: Props) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [todasCategorias, setTodasCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);

  // paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);

  // búsqueda
  const [searchId, setSearchId] = useState("");
  const [searchedProduct, setSearchedProduct] = useState<Producto | null>(null);
  const [searchError, setSearchError] = useState("");

  // filtros
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState(0);
  const [orden, setOrden] = useState("");


  // Carga de datos
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
        .finally(() => setCargando(false));
    }
  }, [actualizar, currentPage, filtroTexto, filtroCategoria]);

  // buscar por ID
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
    await eliminarProducto(id);
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  // LISTA A MOSTRAR (búsqueda o lista general)
  let listaParaMostrar = searchedProduct ? [searchedProduct] : [...productos];

// ----- ORDENAMIENTO -----
if (orden === "az") {
  listaParaMostrar.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

if (orden === "za") {
  listaParaMostrar.sort((a, b) => b.nombre.localeCompare(a.nombre));
}

if (orden === "precio-asc") {
  listaParaMostrar.sort((a, b) => a.precio - b.precio);
}

if (orden === "precio-desc") {
  listaParaMostrar.sort((a, b) => b.precio - a.precio);
}


  // ---------- FUNCIÓN PARA COLORES DEL STOCK ----------
  const getStockClass = (cantidad: number) => {
   if (cantidad <= 5) return "badge-stock rojo";         // crítico
  if (cantidad <= 20) return "badge-stock amarillo";    // bajo
  if (cantidad <= 100) return "badge-stock azul";       // medio
  return "badge-stock verde";                           // alto
  };

  return (
    <div className="lp-container">
      <h2 className="lp-title">Lista de Productos</h2>

      {/* ---------------- FILTROS ---------------- */}
      <div className="filtros-row">

<div className="filtros-row">

  {/* 🔍 BUSCADOR GENERAL */}
  <input
    type="text"
    placeholder="Buscar por ID o nombre..."
    value={filtroTexto}
    onChange={(e) => {
      setSearchedProduct(null);
      setFiltroTexto(e.target.value);
    }}
  />

  {/* 🔽 CATEGORÍAS */}
  <select
    value={filtroCategoria}
    onChange={(e) => setFiltroCategoria(Number(e.target.value))}
  >
    <option value={0}>Todas las categorías</option>
    {todasCategorias.map((cat) => (
      <option key={cat.id} value={cat.id}>
        {cat.nombre}
      </option>
    ))}
  </select>

  {/* ↕️ ORDENAMIENTO */}
  <select
    value={orden}
    onChange={(e) => setOrden(e.target.value)}
  >
    <option value="">Ordenar por…</option>
    <option value="az">Nombre A → Z</option>
    <option value="za">Nombre Z → A</option>
    <option value="precio-asc">Precio menor → mayor</option>
    <option value="precio-desc">Precio mayor → menor</option>
  </select>
</div>

      </div>

      {searchError && <p className="lp-error">{searchError}</p>}

      {/* ---------------- TABLA ---------------- */}
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
                <th></th>
              </tr>
            </thead>

            <tbody>
              {listaParaMostrar.map((p) => (
                <tr key={p.id}>
                  <td className="col-id">{p.id}</td>
                  <td className="col-nombre">{p.nombre}</td>

                  <td>
                    {p.categorias?.map((c) => c.nombre).join(", ") || "N/A"}
                  </td>

                  <td className="col-precio">${p.precio}</td>

                  <td>
                    <span className={getStockClass(p.stockDisponible)}>
                      {p.stockDisponible}
                    </span>
                  </td>

                  <td className="acciones-col">
                    <a
                      className="link-detalle"
                      href={`/prueba/productos/${p.id}`}
                    >
                      Detalle
                    </a>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

      {/* ---------------- PAGINACIÓN ---------------- */}
      {!searchedProduct && (
        <div className="lp-pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>

          <span>Página: {currentPage}</span>

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={isLastPage}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
