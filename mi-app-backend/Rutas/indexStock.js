// indexStock.js - Rutas de Stock y Productos
import express from 'express'
import { supabase } from '../dbConfig.js'

const router = express.Router()

/**
 * FILTROS DISPONIBLES PARA /productos:
 * - search: búsqueda por nombre o descripción (ej: ?search=laptop)
 * - categoriaId: filtrar por categoría (ej: ?categoriaId=1)
 * - precioMin: precio mínimo (ej: ?precioMin=100)
 * - precioMax: precio máximo (ej: ?precioMax=1000)
 * - stockMin: stock mínimo (ej: ?stockMin=5)
 * - enStock: solo productos disponibles (ej: ?enStock=true)
 * - orderBy: ordenar por campo (nombre|precio|stock|created_at)
 * - order: dirección del orden (asc|desc)
 * - limit: cantidad de resultados (ej: ?limit=10)
 * - offset: desplazamiento para paginación (ej: ?offset=20)
 * 
 * Ejemplo completo: 
 * GET /api/productos?search=laptop&precioMax=2000&enStock=true&orderBy=precio&order=asc&limit=10
 */

// ============= RUTAS DE PRODUCTOS =============

// Listar productos con filtros
router.get('/productos', async (req, res) => {
  try {
    // Extraer parámetros de query
    const { 
      search,           // Búsqueda por nombre o descripción
      categoriaId,      // Filtro por categoría
      precioMin,        // Precio mínimo
      precioMax,        // Precio máximo
      stockMin,         // Stock mínimo
      enStock,          // Solo productos con stock > 0
      orderBy,          // Campo para ordenar (nombre, precio, stock)
      order,            // Dirección del orden (asc, desc)
      limit,            // Límite de resultados
      offset            // Desplazamiento para paginación
    } = req.query

    // Construir query base
    let query = supabase.from('productos').select('*')

    // Aplicar filtro de búsqueda (nombre o descripción)
    if (search) {
      query = query.or(`nombre.ilike.%${search}%,descripcion.ilike.%${search}%`)
    }

    // Filtro por categoría
    if (categoriaId) {
      query = query.eq('categoriaId', categoriaId)
    }

    // Filtro por precio mínimo
    if (precioMin) {
      query = query.gte('precio', parseFloat(precioMin))
    }

    // Filtro por precio máximo
    if (precioMax) {
      query = query.lte('precio', parseFloat(precioMax))
    }

    // Filtro por stock mínimo
    if (stockMin) {
      query = query.gte('stock', parseInt(stockMin))
    }

    // Filtro solo productos en stock
    if (enStock === 'true') {
      query = query.gt('stock', 0)
    }

    // Ordenamiento
    const validOrderFields = ['nombre', 'precio', 'stock', 'created_at']
    const orderField = validOrderFields.includes(orderBy) ? orderBy : 'created_at'
    const orderDirection = order === 'asc' ? { ascending: true } : { ascending: false }
    query = query.order(orderField, orderDirection)

    // Paginación
    if (limit) {
      query = query.limit(parseInt(limit))
    }
    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit || 10) - 1)
    }

    const { data, error, count } = await query
    
    if (error) {
      return res.status(500).json({ error: error.message })
    }

    // Respuesta con metadata de paginación
    res.status(200).json({
      data,
      metadata: {
        total: data.length,
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : null
      }
    })
  } catch (error) {
    console.error('Error al listar productos:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Crear producto
router.post('/productos', async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock } = req.body

    if (!nombre || !precio) {
      return res.status(400).json({ error: 'Nombre y precio son requeridos' })
    }

    const { data, error } = await supabase
      .from('productos')
      .insert([{ nombre, descripcion, precio, stock }])
      .select()
      .single() 

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json(data)
  } catch (error) {
    console.error('Error al crear producto:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Obtener un producto por ID
router.get('/productos/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    if (!data) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    res.status(200).json(data)
  } catch (error) {
    console.error('Error al obtener producto:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Actualizar producto
router.put('/productos/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, descripcion, precio, stock } = req.body

    // Validar que al menos venga un campo para actualizar
    const camposParaActualizar = {}
    if (nombre !== undefined) camposParaActualizar.nombre = nombre
    if (descripcion !== undefined) camposParaActualizar.descripcion = descripcion
    if (precio !== undefined) camposParaActualizar.precio = precio
    if (stock !== undefined) camposParaActualizar.stock = stock
    
    if (Object.keys(camposParaActualizar).length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un campo para actualizar' })
    }

    const { data, error } = await supabase
      .from('productos')
      .update(camposParaActualizar)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    if (!data) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    res.status(200).json(data)
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Eliminar producto
router.delete('/productos/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)
      .select() 
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    if (!data) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    res.status(200).json({ message: 'Producto eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// ============= RUTAS DE CATEGORÍAS =============

/**
 * FILTROS DISPONIBLES PARA /categorias:
 * - search: búsqueda por nombre (ej: ?search=electrónica)
 * - orderBy: ordenar por campo (nombre|created_at)
 * - order: dirección del orden (asc|desc)
 * - limit: cantidad de resultados (ej: ?limit=10)
 * - offset: desplazamiento para paginación (ej: ?offset=5)
 */

// Listar categorías con filtros
router.get('/categorias', async (req, res) => {
  try {
    const { 
      search,     // Búsqueda por nombre
      limit,      // Límite de resultados
      offset,     // Desplazamiento
      orderBy,    // Campo para ordenar
      order       // Dirección (asc, desc)
    } = req.query

    let query = supabase.from('categorias').select('*')

    // Filtro de búsqueda por nombre
    if (search) {
      query = query.ilike('nombre', `%${search}%`)
    }

    // Ordenamiento
    const validOrderFields = ['nombre', 'created_at']
    const orderField = validOrderFields.includes(orderBy) ? orderBy : 'nombre'
    const orderDirection = order === 'asc' ? { ascending: true } : { ascending: false }
    query = query.order(orderField, orderDirection)

    // Paginación
    if (limit) {
      query = query.limit(parseInt(limit))
    }
    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit || 10) - 1)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    res.status(200).json({
      data,
      metadata: {
        total: data.length,
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : null
      }
    })
  } catch (error) {
    console.error('Error al listar categorías:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Crear una nueva categoría
router.post('/categorias', async (req, res) => {
  try {
    const { nombre, descripcion } = req.body
    
    if (!nombre) {
      return res.status(400).json({ error: 'El campo "nombre" es requerido' })
    }
    
    const { data, error } = await supabase
      .from('categorias')
      .insert([{ nombre, descripcion }])
      .select()
      .single()

    if (error) throw error
    
    res.status(201).json(data)
  } catch (error) {
    console.error('Error al crear categoría:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Obtener una categoría por ID
router.get('/categorias/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    
    if (!data) {
      return res.status(404).json({ error: 'Categoría no encontrada' })
    }

    res.status(200).json(data)
  } catch (error) {
    console.error('Error al obtener categoría:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Actualizar una categoría
router.patch('/categorias/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, descripcion } = req.body

    const camposActualizados = {}
    if (nombre) camposActualizados.nombre = nombre
    if (descripcion) camposActualizados.descripcion = descripcion
    
    if (Object.keys(camposActualizados).length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un campo para actualizar' })
    }

    const { data, error } = await supabase
      .from('categorias')
      .update(camposActualizados)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    
    if (!data) {
      return res.status(404).json({ error: 'Categoría no encontrada' })
    }
    
    res.status(200).json(data)
  } catch (error) {
    console.error('Error al actualizar categoría:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Eliminar una categoría
router.delete('/categorias/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const { data, error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    
    if (!data) {
      return res.status(404).json({ error: 'Categoría no encontrada' })
    }

    res.status(204).send()
  } catch (error) {
    console.error('Error al eliminar categoría:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router
