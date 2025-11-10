// authRoutes.js - Rutas de Autenticación
import express from 'express'
import axios from 'axios'

const router = express.Router()

/**
 * POST /auth/login
 * Login de usuario mediante Keycloak
 */
router.post('/login', async (req, res) => {
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
      message: 'Login exitoso',
      ...response.data
    })

  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message)
    
    if (error.response && error.response.status === 401) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }
    
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

/**
 * GET /auth/test
 * Ruta de prueba para verificar que el router funciona
 */
router.get('/test', (req, res) => {
  res.status(200).json({ 
    message: '✅ Rutas de autenticación funcionando',
    endpoints: {
      login: 'POST /auth/login'
    }
  })
})

export default router
