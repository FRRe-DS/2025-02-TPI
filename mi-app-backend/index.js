// index.js
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { supabase } from './dbConfig.js' 
import session from 'express-session'
import Keycloak from 'keycloak-connect'
import axios from 'axios'
import stockRoutes from './Rutas/indexStock.js'

const app = express()
const PORT = process.env.PORT 

const memoryStore = new session.MemoryStore()
app.use(session( {
  secret: 'Salmon/Secreto', 
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}))

const keycloak = new Keycloak({store: memoryStore})
app.use(keycloak.middleware({
  logout:'/auth/logout'
}))


// Middleware
app.use(cors())
app.use(express.json());

// ============= RUTAS MODULARES =============
// Usar el router de Stock (protegido por Keycloak)
app.use('/api', keycloak.protect(), stockRoutes)

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('✅ Servidor de Stock funcionando correctamente!')
})

// ============= RUTAS DE AUTENTICACIÓN =============

// Login de usuario
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' })
    }

    const tokenUrl = 'http://localhost:8080/realms/ds-2025-realm/protocol/openid-connect/token'
    const params = new URLSearchParams()
    params.append('client_id', 'grupo-02')
    params.append('grant_type', 'password')
    params.append('username', email)
    params.append('password', password)
    params.append('scope', 'openid')

    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    res.status(200).json({
      message:'Login exitoso',
      ...response.data
    })

  } catch (error) {
    // ... dentro del catch (error) ...
    console.error('Error en login:', error)
// ...
    if (error.response && error.response.status === 401){
      return res.status(401).json({error:'Credenciales invalidas'})
    }
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Obtener perfil del usuario autenticado
app.get('/auth/perfil', keycloak.protect(), async (req, res) => {
  try {
  
    const userInfo = req.kauth.grant.access_token.content 

    res.status(200).json({
      user: {
        id: userInfo.sub,
        email: userInfo.email,
        nombreUsuario: userInfo.preferred_username,
        nombre: userInfo.given_name, // Corregido: 'given_name'
        apellido: userInfo.family_name,
        roles: userInfo.realm_access?.roles || []
      }
    })

  } catch (error) {
    console.error('Error al obtener perfil:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// ============= RUTAS DE RESERVAS (Protegidas) =============
// Estas son las rutas clave para Logística

// Listar reservas (con filtros del openapi)
app.get('/reservas',keycloak.protect(), async (req, res) => {
  try {
    const { usuarioId, estado } = req.query
    
    
    if (!usuarioId) {
        return res.status(400).json({ code: "INVALID_DATA", message: "El campo 'usuarioId' es requerido." });
    }

    let query = supabase
      .from('reservas')
      .select('*')
      .eq('usuarioId', usuarioId) // Filtro requerido

    if (estado) {
      query = query.eq('estado', estado) // Filtro opcional
    }

    const { data, error } = await query

    if (error) throw error;
    res.status(200).json(data)

  } catch (error) {
    console.error('Error al listar reservas:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Crear una reserva
app.post('/reservas', keycloak.protect(), async (req, res) => {
  try {
    // Campos según el schema ReservaInput
    const { idCompra, usuarioId, productos } = req.body

    if (!idCompra || !usuarioId || !productos) {
      return res.status(400).json({ code: "INVALID_DATA", message: "Faltan campos requeridos." });
    }
    
    // Aquí iría la lógica de transacción para verificar stock y crear la reserva.
    // Por simplicidad, solo insertamos la reserva:
    const { data, error } = await supabase
      .from('reservas')
      .insert([{ 
        idCompra, 
        usuarioId, 
        productos, 
        estado: 'confirmado' // Estado por defecto
      }])
      .select()
      .single()

    if (error) throw error;
    res.status(201).json(data)

  } catch (error) {
    console.error('Error al crear reserva:', error)
    
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Consultar una reserva por ID
app.get('/reservas/:id', keycloak.protect(), async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.query; // El spec dice que es requerido

    if (!usuarioId) {
        return res.status(400).json({ code: "INVALID_DATA", message: "El campo 'usuarioId' es requerido." });
    }
    
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('id', id)
      .eq('usuarioId', usuarioId) // Asegura que solo el usuario vea su reserva
      .single()
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Reserva no encontrada' });

    res.status(200).json(data)

  } catch (error) {
    console.error('Error al obtener reserva:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})


app.patch('/reservas/:id', keycloak.protect(), async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId, estado } = req.body; 

    if (!usuarioId || !estado) {
      return res.status(400).json({ code: "INVALID_DATA", message: "Faltan campos 'usuarioId' o 'estado'." });
    }

    const { data, error } = await supabase
      .from('reservas')
      .update({ estado })
      .eq('id', id)
      .eq('usuarioId', usuarioId) 
      .select()
      .single()

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Reserva no encontrada' });
    
    res.status(200).json(data)

  } catch (error) {
    console.error('Error al actualizar reserva:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Cancelar una reserva
app.delete('/reservas/:id', keycloak.protect(), async (req, res) => {
  try {
    const { id } = req.params;
    

    const { data, error } = await supabase
      .from('reservas')
      .delete()
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Reserva no encontrada' });
    

    res.status(204).send()

  } catch (error) {
    console.error('Error al cancelar reserva:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})
