# 📋 Cambios Realizados en el Backend - Sistema de Stock

**Fecha:** 31 de Octubre de 2025  
**Módulo:** Stock de Bienes y Servicios - TPI 2025

---

## 🎯 ¿Qué se hizo?

Se separaron las rutas del backend en **3 APIs independientes** para que cada grupo pueda consumir solo lo que necesita.

---

## 📁 Estructura de Rutas

### **1. `/api/stock` - Para VENDEDORES**
**Gestión completa de productos y categorías**

```
GET    /api/stock/productos
POST   /api/stock/productos
GET    /api/stock/productos/:id
PATCH  /api/stock/productos/:id
DELETE /api/stock/productos/:id

GET    /api/stock/categorias
POST   /api/stock/categorias
GET    /api/stock/categorias/:id
PATCH  /api/stock/categorias/:id
DELETE /api/stock/categorias/:id
```

---

### **2. `/api/compras` - Para PORTAL DE COMPRAS (Grupo 1)**
**Catálogo público + reservas protegidas**

**RUTAS PÚBLICAS (sin token):**
```
GET /api/compras/productos
GET /api/compras/productos/:id
GET /api/compras/categorias
GET /api/compras/productos/:id/disponibilidad
```

**RUTAS PROTEGIDAS (requieren token JWT):**
```
POST   /api/compras/reservas
GET    /api/compras/reservas?usuarioId=1
GET    /api/compras/reservas/:id
PATCH  /api/compras/reservas/:id
DELETE /api/compras/reservas/:id
```

---

### **3. `/api/logistica` - Para LOGÍSTICA (Grupo 3)**
**Gestión de entregas**

```
GET   /api/logistica/reservas
GET   /api/logistica/reservas/expiradas
GET   /api/logistica/reservas/:id
GET   /api/logistica/reservas/:id/productos
PATCH /api/logistica/reservas/:id/reclamar
PATCH /api/logistica/reservas/:id/liberar

GET /api/logistica/productos/:id/ubicacion
GET /api/logistica/productos/:id/detalles
```

---

## 🔐 Autenticación

### **Sistema JWT con Keycloak**

**1. Obtener token:**
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tu_email@ejemplo.com","password":"tu_password"}'
```

**Respuesta:**
```json
{
  "message": "Login exitoso",
  "access_token": "eyJhbGci...",
  "expires_in": 300
}
```

**2. Usar el token:**
```bash
curl http://localhost:4000/api/compras/reservas?usuarioId=1 \
  -H "Authorization: Bearer eyJhbGci..."
```

### **¿Qué rutas requieren token?**
- ✅ Todas las rutas de `/api/compras/reservas`
- ❌ Las rutas de catálogo son públicas

---

## 🛠️ Archivos Nuevos Creados

```
mi-app-backend/
├── Rutas/
│   ├── authRoutes.js          ← Login con Keycloak
│   ├── stock.routes.js        ← API para vendedores
│   ├── compras.routes.js      ← API para Portal de Compras
│   └── logistica.routes.js    ← API para Logística
│
└── middlewares/
    └── authMiddleware.js      ← Validación de tokens JWT
```

---

## 🗑️ Archivos Eliminados

```
❌ Rutas/indexCompras.js
❌ Rutas/indexLogistica.js
❌ Rutas/indexStock.js
❌ Rutas/productosRoutes.js
❌ Rutas/categoriasRoutes.js
❌ Rutas/reservasRoutes.js
```

**Razón:** Se unificaron en los nuevos archivos por consumidor.

---

## � Cómo Ejecutar

### **1. Levantar Keycloak (Docker):**
```bash
cd c:\repo\2025-02-TPI\2025-TPI\keycloak
docker-compose up -d
```

### **2. Levantar Backend:**
```bash
cd c:\repo\2025-02-TPI\mi-app-backend
npm run dev
```

### **3. Verificar:**
```bash
curl http://localhost:4000/
curl http://localhost:4000/api/compras/productos
```

---

## � Ejemplos de Uso

### **Ejemplo 1: Cliente ve catálogo (SIN token)**
```bash
curl http://localhost:4000/api/compras/productos
```

### **Ejemplo 2: Cliente crea reserva (CON token)**
```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"123"}' \
  | jq -r '.access_token')

# 2. Crear reserva
curl -X POST http://localhost:4000/api/compras/reservas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "idCompra": "COMPRA-001",
    "usuarioId": 1,
    "productos": [
      {"productoId": 2, "cantidad": 1}
    ]
  }'
```

### **Ejemplo 3: Logística consulta reserva**
```bash
curl http://localhost:4000/api/logistica/reservas/123/productos
```

---

## 🔧 Cambios Técnicos Importantes

### **1. Frontend actualizado**
**Archivo:** `frontend/src/servicios/api.js`

**Antes:**
```javascript
fetch(`${API_URL}/productos`)           // ❌
```

**Ahora:**
```javascript
fetch(`${API_URL}/api/compras/productos`)  // ✅
fetch(`${API_URL}/api/stock/productos`)    // ✅ Para vendedores
```

### **2. Middleware de autenticación**
- **JWT personalizado** en lugar de keycloak-connect
- Valida tokens de Keycloak sin redirecciones
- Modo `bearer-only` para APIs REST

### **3. Transformación de datos para Supabase**
Los productos se transforman de camelCase a camelCase (manteniendo formato de la función RPC):
```javascript
productos.map(p => ({
  idProducto: p.productoId,  // ← Formato que espera Supabase
  cantidad: p.cantidad
}))
```

---

## 📞 Endpoints para Otros Grupos

### **Para Grupo 1 (Portal de Compras):**
**Base URL:** `http://localhost:4000/api/compras`

- Ver productos: `GET /productos`
- Ver categorías: `GET /categorias`
- Crear reserva: `POST /reservas` (requiere token)

### **Para Grupo 3 (Logística):**
**Base URL:** `http://localhost:4000/api/logistica`

- Ver reservas: `GET /reservas`
- Ver productos de reserva: `GET /reservas/:id/productos`
- Reclamar mercadería: `PATCH /reservas/:id/reclamar`

---

## ⚠️ Notas Importantes

1. **Keycloak debe estar corriendo** antes de iniciar el backend
2. **Los tokens expiran en 5 minutos** - renovar según sea necesario
3. **Las rutas antiguas fueron eliminadas** - no hay retrocompatibilidad
4. **El stock se descuenta automáticamente** al crear una reserva

---

**Fin del documento** 🚀
