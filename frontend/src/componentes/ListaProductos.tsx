"use client";

import React, { useEffect, useState } from "react";
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

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stockDisponible: number;
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
  const [totalProductos, setTotalProductos] = useState(0);
  const [todasCategorias, setTodasCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);

  // paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);

  // búsqueda general
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState(0);
  const [orden, setOrden] = useState("");

  // búsqueda por ID (para evitar errores)
  const [searchedProduct, setSearchedProduct] = useState<Producto | null>(null);

  // =======================================================
  // CARGA DE PRODUCTOS
  // =======================================================
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
          const lista = prods || [];
          setProductos(lista);

          if (todasCategorias.length === 0) setTodasCategorias(cats || []);

          // --- CÁLCULO AUTOMÁTICO DEL TOTAL ---
          const cantidadActual = lista.length;
          const posibleTotal =
            (currentPage - 1) * LIMIT_POR_PAGINA + cantidadActual;

          setTotalProductos(posibleTotal);

          setIsLastPage(cantidadActual < LIMIT_POR_PAGINA);
        })
        .finally(() => setCargando(false));
    }
  }, [actualizar, currentPage, filtroTexto, filtroCategoria]);

  // =======================================================
  // ORDENAMIENTOS
  // =======================================================
  let listaParaMostrar = searchedProduct ? [searchedProduct] : [...productos];

  if (orden === "az") listaParaMostrar.sort((a, b) => a.nombre.localeCompare(b.nombre));
  if (orden === "za") listaParaMostrar.sort((a, b) => b.nombre.localeCompare(a.nombre));
  if (orden === "precio-asc") listaParaMostrar.sort((a, b) => a.precio - b.precio);
  if (orden === "precio-desc") listaParaMostrar.sort((a, b) => b.precio - a.precio);

  // =======================================================
  // COLORES DEL STOCK
  // =======================================================
  const getStockClass = (cantidad: number) => {
    if (cantidad <= 5) return "badge-stock rojo";
    if (cantidad <= 20) return "badge-stock amarillo";
    if (cantidad <= 100) return "badge-stock azul";
    return "badge-stock verde";
  };

  // =======================================================
  // ELIMINAR PRODUCTO
  // =======================================================
  const handleEliminar = async (id: number) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    await eliminarProducto(id);
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="lp-container">
      <h2 className="lp-title">Lista de Productos</h2>

      {/* ---------------- FILTROS ---------------- */}
      <div className="filtros-row">
        <input
          type="text"
          placeholder="Buscar por ID o nombre…"
          value={filtroTexto}
          onChange={(e) => {
            setSearchedProduct(null);
            setFiltroTexto(e.target.value);
          }}
        />

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

        <select value={orden} onChange={(e) => setOrden(e.target.value)}>
          <option value="">Ordenar por…</option>
          <option value="az">Nombre A → Z</option>
          <option value="za">Nombre Z → A</option>
          <option value="precio-asc">Precio menor → mayor</option>
          <option value="precio-desc">Precio mayor → menor</option>
        </select>
      </div>

{/* ================= TARJETAS SUPERIORES ================= */}
<div className="lp-cards-container">

  {/* --- Tarjeta: Productos Totales --- */}
  <div className="lp-card">
    <div className="lp-card-icon">📦</div>
    <div className="lp-card-title">Productos</div>
    <div className="lp-card-number">{totalProductos}</div>
  </div>

  {/* --- Tarjeta: Stock Valorizado --- */}
  <div className="lp-card">
    <div className="lp-card-icon">💲</div>
    <div className="lp-card-title">Stock Valorizado</div>
    <div className="lp-card-number">
      $
      {productos
        .reduce((acc, p) => acc + p.precio * p.stockDisponible, 0)
        .toLocaleString("es-AR")}
    </div>
  </div>

  {/* --- Tarjeta: Reservas --- */}
  <div className="lp-card">
    <div className="lp-card-icon">📅</div>
    <div className="lp-card-title">Reservas</div>
    <div className="lp-card-number">5</div>
  </div>

</div>











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
                    <a className="link-detalle" href={`/prueba/productos/${p.id}`}>
                      Detalle
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- MOSTRANDO RESULTADOS ---------- */}
      <div className="lp-result-info">
        Mostrando{" "}
        {searchedProduct
          ? 1
          : (currentPage - 1) * LIMIT_POR_PAGINA + 1}
        {" "}-{" "}
        {searchedProduct
          ? 1
          : (currentPage - 1) * LIMIT_POR_PAGINA + productos.length}{" "}
        de {searchedProduct ? 1 : totalProductos} resultados
      </div>

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
