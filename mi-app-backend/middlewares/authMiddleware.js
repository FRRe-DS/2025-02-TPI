// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'

// Cliente para obtener las claves públicas de Keycloak
const client = jwksClient({
  jwksUri: 'http://localhost:8080/realms/ds-2025-realm/protocol/openid-connect/certs'
})

// Función para obtener la clave de firma
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err)
      return
    }
    const signingKey = key.getPublicKey()
    callback(null, signingKey)
  })
}

// Middleware para verificar JWT de Keycloak
export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' })
  }

  const token = authHeader.substring(7) // Remover "Bearer "

  // Verificar el token con la clave pública de Keycloak
  jwt.verify(token, getKey, {
    issuer: 'http://localhost:8080/realms/ds-2025-realm'
    // NO validar audience porque Keycloak usa 'azp' en lugar de 'aud'
  }, (err, decoded) => {
    if (err) {
      console.error('Error verificando token:', err.message)
      return res.status(403).json({ mensaje: 'Token inválido o expirado' })
    }

    // Token válido, guardar datos del usuario en req
    req.user = decoded
    next()
  })
}

export default verificarToken
