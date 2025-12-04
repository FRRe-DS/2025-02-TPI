"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { obtenerProductoPorId } from "@/servicios/api"; 
import FormularioProducto from "@/componentes/ProductoForm";
import Breadcrumb from "@/componentes/Bars/Breadcrumb";

export default function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  // Desempaquetamos el ID de la URL
    const { id } = use(params);
    const router = useRouter();
    
    const [producto, setProducto] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
        obtenerProductoPorId(Number(id))
            .then((data) => setProducto(data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
        }
    }, [id]);

    const handleGuardar = () => {
        // Al guardar, volvemos a la página de detalle de ESTE producto
        router.push(`/productos/detalle/${id}`);
    };

    const handleCancelar = () => {
        router.push(`/productos/detalle/${id}`);
    };

    if (loading) return <div className="p-10 text-center">Cargando datos para editar...</div>;
    
    if (!producto) return <div className="p-10 text-center text-red-500">Error: Producto no encontrado</div>;

    return (
        
        <div className="min-h-screen bg-gray-100 py-10 px-4">
                
        <div className="max-w-5xl mx-auto">
            <Breadcrumb 
                    items={[
                        { label: 'Ver Productos', href: '/productos/lista' }, 
                        { label: producto.nombre || 'Detalle',href: `/productos/detalle/${id}` },
                        { label: 'Editar Producto' } 
                    ]}
            />
            <div className="mb-6 flex items-center justify-between">
                {/* Botón cancelar actualizado */}
                <button onClick={handleCancelar} className="text-gray-600 hover:text-blue-900 font-medium flex items-center">
                    <span className="mr-2">←</span> Cancelar edición
                </button>
            </div>

            <FormularioProducto 
                onProductoAgregado={handleGuardadoExitoso} 
                productoAEditar={producto} 
            />
            
        </div>
        </div>
    );
}