# 📋 Cambios en el Backend

## 🔄 Arquitectura Portal-Based

### Cambio Principal:
- **De:** Rutas por recurso (`/api/v1/productos`, `/api/v1/reservas`)
- **A:** Rutas por portal (`/api/v1/compras`, `/api/v1/logistica`, `/api/v1/admin`)

---

## 📁 Archivos Nuevos

### Rutas por Portal:

- **`Rutas/compras.routes.js`**
  - Endpoints para Portal de Compras (Grupo 1)
  - Rol requerido: `compras-be`
  - Productos (lectura), Categorías (lectura), Reservas (CRUD)

- **`Rutas/logistica.routes.js`**
  - Endpoints para Portal de Logística (Grupo 3)
  - Rol requerido: `logistica-be`
  - Productos detallados, Reclamar/Liberar reservas, Reservas expiradas

- **`Rutas/admin.routes.js`**
  - Endpoints para Administración interna (Grupo 2)
  - Rol requerido: `stock-be`
  - Productos (CRUD), Categorías (CRUD)

### Servicios:

- **`Servicios/reservasService.js`** - Agregados:
  - `reclamarReserva()` - Marca reserva como `en_entrega`
  - `buscarReservasExpiradas()` - Lista reservas expiradas
  - `crearNuevaReserva()` - Versión sin RPC (transaccional)

### Documentación:

- **`README_estructura_portales.md`** - Guía completa de la arquitectura
- **`GUIA_INTEGRACION.md`** - Guía para otros grupos que integren
- **`SQL_MEJORAS.sql`** - Scripts SQL para Supabase (estados, columnas, funciones RPC)

---

## 🔧 Archivos Modificados

### Servidor Principal:

- **`index.js`**
  - Rutas montadas con protección por rol:
    - `/api/v1/compras` → `keycloak.protect('realm:compras-be')`
    - `/api/v1/logistica` → `keycloak.protect('realm:logistica-be')`
    - `/api/v1/admin` → `keycloak.protect('realm:stock-be')`

### Controladores:

- **`Controladores/reservasController.js`** - Agregados:
  - `reclamarReserva()` - Para Logística
  - `liberarReserva()` - Para Logística
  - `listarReservasExpiradas()` - Para Logística
  - Estados válidos actualizados: `['confirmado', 'pendiente', 'cancelado', 'en_entrega', 'entregado']`

---

## 🗑️ Archivos Eliminados

- `Rutas/categoriasRoutes.js` (obsoleto)
- `Rutas/productosRoutes.js` (obsoleto)
- `Rutas/reservasRoutes.js` (obsoleto)
- `Rutas/indexCompras.js` (obsoleto)
- `Rutas/indexLogistica.js` (obsoleto)
- `Rutas/indexStock.js` (obsoleto)
- `README_31-10.md` (documentación vieja)
- `Controladores/a testi le gana la consola.txt` (basura)

---

## 🔐 Roles de Keycloak

### Roles Creados:
- `compras-be` - Para Portal de Compras
- `logistica-be` - Para Portal de Logística
- `stock-be` - Para Portal de Administración

### Usuarios de Prueba:
- `pesuti` (password) → rol `compras-be`
- `test-user` (password) → rol `logistica-be`
- `kraken` (password) → rol `stock-be`

---

## 📊 Resumen

| Aspecto | Antes | Después |
|---------|-------|---------|
| Arquitectura | Por recurso | Por portal |
| Roles | Sin roles | 3 roles específicos |
| Endpoints | 15 endpoints sin separación | 3 portales segregados |
| Documentación | Básica | Completa + Guía de integración |
| Seguridad | Sin validación | Keycloak por rol |
