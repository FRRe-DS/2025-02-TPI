"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa'; 
import FormularioProducto from '@/componentes/ProductoForm';
import Breadcrumb from '@/componentes/Bars/Breadcrumb';

export default function AgregarProductoPage() {
    const router = useRouter();

    const handleProductoAgregado = () => {
        router.push('/producto/lista');
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Breadcrumb 
                    items={[
                        { label: 'Productos', href: '/producto/lista' },
                        { label: 'Agregar Producto'},
                    ]}
                />        
            {/* Botón Volver */}
            <div className="mb-6">
                <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-[#232B65] transition-colors font-medium">
                    <FaArrowLeft className="mr-2" />
                    Cancelar y Volver
                </button>
            </div>
            {/* Contenedor del Formulario */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-[#232B65] px-6 py-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-white">Nuevo Ítem de Inventario</h1>
                    <p className="text-blue-200 text-sm">Completa los detalles para registrar el producto</p>
                </div>
                
                <div className="p-6 sm:p-8">
                    {/* 4. Pasamos la función de redirección al componente */}
                    <FormularioProducto onProductoAgregado={handleProductoAgregado} />
                </div>
            </div>
            
            </div>
        </div>
    );
}