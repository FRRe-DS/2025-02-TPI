"use client";

import { use, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { obtenerProductoPorId, eliminarProducto } from "@/servicios/api";
import "./detalleproducto.css";
import Link from "next/link";
import Breadcrumb from "@/componentes/Bars/Breadcrumb";

export default function DetalleProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [producto, setProducto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    obtenerProductoPorId(Number(id))
      .then((data) => {
        console.log("DATA FINAL:", data);
        setProducto(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // --- NORMALIZADOR DE IMÁGENES ---
  const listaImagenes = useMemo(() => {
    if (!producto || !producto.imagenes) return [];
    const raw = producto.imagenes;
    let lista: string[] = [];

    if (Array.isArray(raw)) {
      raw.forEach((item) => {
        if (typeof item === "string") lista.push(item);
        else if (typeof item === "object" && item?.url) lista.push(item.url);
      });
    } else if (typeof raw === "object" && raw.url) {
      lista.push(raw.url);
    } else if (typeof raw === "string") {
      lista.push(raw);
    }
    return lista;
  }, [producto]);

  // Seleccionar primera imagen por defecto
  useEffect(() => {
    if (listaImagenes.length > 0 && !imagenSeleccionada) {
      setImagenSeleccionada(listaImagenes[0]);
    }
  }, [listaImagenes, imagenSeleccionada]);

  // --- LÓGICA DE FLECHAS (CARRUSEL) ---
  const cambiarImagen = (direccion: "next" | "prev") => {
    if (listaImagenes.length <= 1) return;

    const currentIndex = listaImagenes.indexOf(imagenSeleccionada || "") !== -1 
        ? listaImagenes.indexOf(imagenSeleccionada || "")
        : 0;

    let newIndex;
    if (direccion === "next") {
        newIndex = (currentIndex + 1) % listaImagenes.length;
    } else {
        newIndex = (currentIndex - 1 + listaImagenes.length) % listaImagenes.length;
    }

    setImagenSeleccionada(listaImagenes[newIndex]);
  };

  const handleEliminar = async () => {
    if (!producto) return;
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await eliminarProducto(producto.id);
        alert("Producto eliminado");
        router.push("/producto/lista");
      } catch (error) {
        alert("Error al eliminar");
      }
    }
  };

  if (loading) return <p className="cargando">Cargando...</p>;
  if (!producto)
    return (
      <div className="detalle-container error">
        <p>Producto no encontrado.</p>
        <Link href="/producto/lista">
          <button className="btn-volver">Volver</button>
        </Link>
      </div>
    );

  const getStockBadge = (stock: number) => {
    if (stock <= 5) return "stock-rojo";
    if (stock <= 20) return "stock-amarillo";
    if (stock <= 100) return "stock-azul";
    return "stock-verde";
  };

  const imagenPrincipal = imagenSeleccionada || "/placeholder.png";

  return (
    <div className="detalle-container">
      
      {/* 2. AQUÍ INCRUSTAMOS EL BREADCRUMB (Antes del título) */}
      <Breadcrumb 
        items={[
            { label: 'Productos', href: '/producto/lista' }, 
            { label: producto.nombre || 'Detalle' } 
        ]}
      />

      <h1 className="titulo">{producto.nombre}</h1>

      <div className="detalle-grid">
        
        {/* === COLUMNA IZQUIERDA: FOTO + GALERÍA === */}
        <div className="columna-galeria">
          
          {/* FOTO GRANDE CON FLECHAS */}
          <div className="imagen-principal-container">
            {listaImagenes.length > 1 && (
                <button className="flecha-carrusel prev" onClick={() => cambiarImagen("prev")}>
                    &#10094;
                </button>
            )}

            <img
              src={imagenPrincipal}
              alt={producto.nombre}
              className="imagen-principal"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/placeholder.png";
              }}
            />

            {listaImagenes.length > 1 && (
                <button className="flecha-carrusel next" onClick={() => cambiarImagen("next")}>
                    &#10095;
                </button>
            )}
          </div>

          {/* MINIATURAS */}
          {listaImagenes.length > 1 && (
            <div className="galeria-thumbnails">
              {listaImagenes.map((url, index) => (
                <div
                  key={index}
                  className={`thumbnail ${url === imagenSeleccionada ? "activa" : ""}`}
                  onClick={() => setImagenSeleccionada(url)}
                >
                  <img src={url} alt={`miniatura-${index}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === COLUMNA DERECHA: DESCRIPCIÓN === */}
        <div className="detalle-descripcion">
          <h2>Descripción</h2>
          <ul className="lista-descripcion">
            {producto.descripcion ? (
              <li>{producto.descripcion}</li>
            ) : (
              <li className="texto-vacio">Sin descripción disponible.</li>
            )}
          </ul>
          
          {/* Agregamos las dimensiones aquí también si quieres verlas */}
          {producto.dimensiones && (
            <div style={{marginTop: '20px'}}>
                <h3>Dimensiones</h3>
                <ul className="lista-descripcion">
                    <li>Largo: {producto.dimensiones.largoCm} cm</li>
                    <li>Alto: {producto.dimensiones.altoCm} cm</li>
                    <li>Ancho: {producto.dimensiones.anchoCm} cm</li>
                </ul>
            </div>
          )}
        </div>
      </div>

      {/* INFO EXTRA */}
      <div className="detalle-info-extra">
        <div className="info-bloque">
          <h3>Precio</h3>
          <p className="precio">
            {producto.precio ? `$${producto.precio}` : "No informado"}
          </p>
        </div>

        <div className="info-bloque">
          <h3>Disponibilidad</h3>
          <span
            className={`badge-stock ${getStockBadge(
              producto.stockDisponible ?? 0
            )}`}
          >
            {producto.stockDisponible ?? 0}
          </span>
        </div>

        <div className="info-bloque">
          <h3>Ubicación</h3>
          {producto.ubicacion ? (
            <>
              <p>{producto.ubicacion.street || "Calle no informada"}</p>
              <p>{producto.ubicacion.city || "Ciudad no informada"}</p>
              <p>{producto.ubicacion.country || "País no informado"}</p>
            </>
          ) : (
            <p>Ubicación no informada</p>
          )}
        </div>
      </div>

      {/* BOTONES */}
      <div className="detalle-botones">
        <button className="btn-editar" onClick={() => router.push(`/producto/editar/${producto.id}`)}>
          EDITAR PRODUCTO
        </button>
        <button className="btn-eliminar" onClick={handleEliminar}>
          ELIMINAR PRODUCTO
        </button>
      </div>

      {/* El botón volver de abajo ya es opcional porque tienes el breadcrumb arriba */}
      <div className="volver-container">
        <Link href="/producto/lista">
          <button className="btn-volver">Volver al listado</button>
        </Link>
      </div>
    </div>
  );
}