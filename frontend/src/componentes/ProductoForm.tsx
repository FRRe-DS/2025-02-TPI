import { useState, ChangeEvent, FormEvent } from 'react';
import { agregarProducto } from '../servicios/api';

interface Producto {
  nombre: string;
  descripcion: string;
  precio: string;
  cantidad: string;
}

interface ProductoFormProps {
  onProductoAgregado: () => void;
}

export default function ProductoForm({ onProductoAgregado }: ProductoFormProps) {
  const [form, setForm] = useState<Producto>({
    nombre: '',
    descripcion: '',
    precio: '',
    cantidad: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Partial<Producto>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Producto> = {};
    
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!form.precio || parseFloat(form.precio) <= 0) newErrors.precio = 'El precio debe ser mayor a 0';
    if (!form.cantidad || parseInt(form.cantidad) < 0) newErrors.cantidad = 'La cantidad no puede ser negativa';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name as keyof Producto]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage(null);

    try {
      const resultado = await agregarProducto({
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: parseFloat(form.precio),
        cantidad: form.cantidad,
      });
      
      setMessage({ 
        type: 'success', 
        text: resultado.mensaje || 'Producto agregado correctamente' 
      });
      setForm({ nombre: '', descripcion: '', precio: '', cantidad: '' });
      onProductoAgregado();
      
      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Error al agregar el producto. Intenta de nuevo.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          <span className="flex items-center gap-2">
            📦 Nombre del Producto
            <span className="text-red-400">*</span>
          </span>
        </label>
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Ej: Laptop Dell XPS 13"
          required
          className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-slate-400 transition-all focus:outline-none ${
            errors.nombre 
              ? 'border-red-500/50 focus:border-red-400 focus:ring-2 focus:ring-red-400/20' 
              : 'border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20'
          }`}
        />
        {errors.nombre && <p className="text-red-400 text-xs font-medium">{errors.nombre}</p>}
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          <span className="flex items-center gap-2">
            📝 Descripción
          </span>
        </label>
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          placeholder="Detalles técnicos del producto..."
          rows={3}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 transition-all focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 resize-none"
        />
      </div>

      {/* Precio y Cantidad - Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Precio */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">
            <span className="flex items-center gap-2">
              💰 Precio
              <span className="text-red-400">*</span>
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-slate-300 font-semibold">$</span>
            <input
              name="precio"
              value={form.precio}
              onChange={handleChange}
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0"
              required
              className={`w-full pl-8 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-slate-400 transition-all focus:outline-none ${
                errors.precio 
                  ? 'border-red-500/50 focus:border-red-400 focus:ring-2 focus:ring-red-400/20' 
                  : 'border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20'
              }`}
            />
          </div>
          {errors.precio && <p className="text-red-400 text-xs font-medium">{errors.precio}</p>}
        </div>

        {/* Cantidad */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">
            <span className="flex items-center gap-2">
              📊 Cantidad
              <span className="text-red-400">*</span>
            </span>
          </label>
          <input
            name="cantidad"
            value={form.cantidad}
            onChange={handleChange}
            placeholder="0"
            type="number"
            min="0"
            required
            className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-slate-400 transition-all focus:outline-none ${
              errors.cantidad 
                ? 'border-red-500/50 focus:border-red-400 focus:ring-2 focus:ring-red-400/20' 
                : 'border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20'
            }`}
          />
          {errors.cantidad && <p className="text-red-400 text-xs font-medium">{errors.cantidad}</p>}
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${
          message.type === 'success' 
            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
            : 'bg-red-500/20 text-red-300 border border-red-500/30'
        }`}>
          {message.type === 'success' ? (
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Submit Button */}
      <button 
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 relative z-10" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="relative z-10">Agregando...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="relative z-10">Agregar Producto</span>
          </>
        )}
      </button>

      {/* Help Text */}
      <p className="text-xs text-slate-400 text-center py-2 border-t border-white/10">
        Los campos marcados con <span className="text-red-400">*</span> son obligatorios
      </p>
    </form>
  );
}
