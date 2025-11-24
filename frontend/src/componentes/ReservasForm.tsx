"use client";
import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { crearReserva, obtenerProductos } from '../servicios/api';

const USUARIO_ID_PRUEBA = 1;

interface Props {
    onReservaCreada: () => void;
    onCancelar: () => void;
}

// Interfaz para el carrito visual
interface ItemReserva {
    idProducto: number;
    nombre: string;
    precio: number;
    cantidad: number;
}

// Interfaz para el backend
interface ReservaInput {
    idCompra: string;
    usuarioId: number;
    productos: {
        idProducto: number;
        cantidad: number;
    }[];
}

export default function ReservaForm({ onReservaCreada, onCancelar }: Props) {
    // --- ESTADOS ---
    const [idCompra, setIdCompra] = useState('');
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<ItemReserva[]>([]);

    // Buscador
    const [busqueda, setBusqueda] = useState('');
    const [sugerencias, setSugerencias] = useState<any[]>([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
    const [cantidadInput, setCantidadInput] = useState(1);
    const [buscando, setBuscando] = useState(false);

    //  Generar ID automático
    useEffect(() => {
        const randomCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        setIdCompra(`RES-${randomCode}`);
    }, []);

    // Lógica del Buscador
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
        if (busqueda.length > 0 && !productoSeleccionado) {
            setBuscando(true);
            try {
            const resultados = await obtenerProductos({ q: busqueda, limit: 20 });
            const filtrados = resultados.filter((p: any) => 
                p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                p.id.toString().includes(busqueda)
            );
            setSugerencias(filtrados);
            } catch (error) {
            console.error("Error buscando:", error);
            } finally {
            setBuscando(false);
            }
        } else {
            setSugerencias([]);
        }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [busqueda, productoSeleccionado]);

    const handleSeleccionar = (prod: any) => {
        setProductoSeleccionado(prod);
        setBusqueda(`${prod.id} - ${prod.nombre}`);
        setSugerencias([]);
    };

    const agregarItem = () => {
        if (!productoSeleccionado) return;
        if (items.some(i => i.idProducto === productoSeleccionado.id)) {
        alert("Este producto ya está en la lista.");
        return;
        }
        setItems([...items, {
        idProducto: productoSeleccionado.id,
        nombre: productoSeleccionado.nombre,
        precio: productoSeleccionado.precio,
        cantidad: cantidadInput
        }]);
        setProductoSeleccionado(null);
        setBusqueda('');
        setCantidadInput(1);
    };

    const eliminarItem = (id: number) => {
        setItems(items.filter(i => i.idProducto !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) {
        alert("Agrega al menos un producto.");
        return;
        }
        setLoading(true);
        const nuevaReserva: ReservaInput = {
        idCompra: idCompra,
        usuarioId: USUARIO_ID_PRUEBA,
        productos: items.map(i => ({
            idProducto: i.idProducto,
            cantidad: i.cantidad
        }))
        };

        try {
        await crearReserva(nuevaReserva);
        alert('¡Reserva creada exitosamente!');
        onReservaCreada();
        } catch (error) {
        alert("Error al crear reserva: " + (error as Error).message);
        } finally {
        setLoading(false);
        }
    };

    const handleBtnCancelar = (e: React.MouseEvent) => {
        e.preventDefault(); 
        console.log("Cancelando formulario...");
        onCancelar();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Cabecera */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-1">Código de Reserva</label>
            <input 
            type="text" 
            value={idCompra} 
            readOnly 
            className="w-full bg-gray-100 border border-gray-300 text-gray-500 rounded p-2 font-mono cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Generado automáticamente.</p>
        </div>

        {/* Buscador */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-4">Agregar Productos</h4>
            <div className="flex flex-col md:flex-row gap-3 items-end">
            
            <div className="flex-1 relative w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Buscar (ID o Nombre)</label>
                <div className="relative">
                <input 
                    type="text" 
                    className="input-modern w-full border p-2 pl-12 rounded"
                    style={{ paddingLeft: '3rem' }} 
                    placeholder="Ej: 12 (busca 12, 120...)"
                    value={busqueda}
                    onChange={e => {
                    setBusqueda(e.target.value);
                    setProductoSeleccionado(null);
                    }}
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    <FaSearch />
                </div>
                </div>

                {/* Lista de sugerencias */}
                {sugerencias.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {sugerencias.map((prod: any) => (
                    <li 
                        key={prod.id} 
                        onClick={() => handleSeleccionar(prod)}
                        className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex justify-between"
                    >
                        <span className="font-medium text-blue-900">#{prod.id} - {prod.nombre}</span>
                        <span className="text-gray-500 text-sm">Stock: {prod.stockDisponible}</span>
                    </li>
                    ))}
                </ul>
                )}
                {buscando && <span className="absolute right-2 top-9 text-xs text-gray-400">Buscando...</span>}
            </div>

            <div className="w-24">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cant.</label>
                <input 
                type="number" 
                min="1" 
                className="input-modern w-full border p-2 rounded"
                value={cantidadInput}
                onChange={e => setCantidadInput(Number(e.target.value))}
                />
            </div>

            <button 
                type="button"
                onClick={agregarItem}
                disabled={!productoSeleccionado}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded h-[42px] flex items-center gap-2 shadow-sm hover:shadow transition-all"
            >
                <FaPlus /> Agregar
            </button>
            </div>
        </div>

        {/* Tabla de Items */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <h4 className="font-semibold text-gray-700">Items en la Reserva ({items.length})</h4>
            </div>
            
            {items.length === 0 ? (
            <p className="p-6 text-center text-gray-500 italic">No has agregado productos aún.</p>
            ) : (
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Producto</th>
                    <th className="px-4 py-2">Cant.</th>
                    <th className="px-4 py-2 text-right">Acción</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {items.map(item => (
                    <tr key={item.idProducto} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">#{item.idProducto}</td>
                    <td className="px-4 py-2">{item.nombre}</td>
                    <td className="px-4 py-2">{item.cantidad}</td>
                    <td className="px-4 py-2 text-right">
                        <button 
                        type="button" 
                        onClick={() => eliminarItem(item.idProducto)}
                        className="text-red-500 hover:text-red-700 p-1"
                        >
                        <FaTrash />
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            )}
        </div>

        {/* BOTONES FINALES */}
        <div className="flex justify-end pt-4 gap-4">
            
            {/* Botón de Cancelar */}
            <button
            type="button"
            onClick={handleBtnCancelar}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-bold px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95"
            >
            Cancelar
            </button>

            {/* Botón de Confirmar */}
            <button 
            type="submit"
            disabled={loading || items.length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-lg shadow hover:shadow-lg transition-all active:scale-95"
            >
            {loading ? 'Procesando...' : 'Confirmar Reserva'}
            </button>
        </div>

        </form>
    );
}