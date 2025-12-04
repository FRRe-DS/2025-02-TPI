"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/componentes/Bars/Breadcrumb';
import CategoriaForm from '@/componentes/CategoriaForm';

    export default function AgregarCategoriaPage() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push('/categorias');
    };

    const handleCancel = () => {
        router.push('/categorias');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
            
            {/* Navegación */}

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#232B65]">Crear Categoría</h1>
                <p className="text-gray-600 mt-1">
                Añade una nueva clasificación para tus productos.
                </p>
            </div>

            <CategoriaForm 
                onCategoriaCreada={handleSuccess} 
                onCancelar={handleCancel} 
            />
            
        </div>
        </div>
    );
    }