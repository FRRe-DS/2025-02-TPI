# 📋 Cambios en el Frontend

## 🔄 Servicios API Separados por Portal

### Archivos Nuevos:

- **`src/servicios/apiCompras.js`**
  - API para Portal de Compras (rol: `compras-be`)
  - Endpoints: productos (lectura), categorías (lectura), reservas (CRUD)
  - URL base: `/api/v1/compras`

- **`src/servicios/apiLogistica.js`**
  - API para Portal de Logística (rol: `logistica-be`)
  - Endpoints: productos detallados, reservas (gestión entregas)
  - URL base: `/api/v1/logistica`

- **`src/servicios/apiAdmin.js`**
  - API para Portal de Admin (rol: `stock-be`)
  - Endpoints: productos (CRUD), categorías (CRUD)
  - URL base: `/api/v1/admin`

### Archivos Modificados:

- **`src/componentes/ProductoForm.tsx`**
  - Cambiado: `import { ... } from '../servicios/api'`
  - Por: `import { ... } from '../servicios/apiAdmin'`

- **`src/componentes/ListaProductos.tsx`**
  - Cambiado: `import { ... } from '../servicios/api'`
  - Por: `import { ... } from '../servicios/apiAdmin'`

- **`src/componentes/GestionCategorias.tsx`**
  - Cambiado: `import { ... } from '../servicios/api'`
  - Por: `import { ... } from '../servicios/apiAdmin'`

---

## 🎯 Hook para Detectar Rol del Usuario

### Archivo Nuevo:

- **`src/hooks/useUserRole.ts`**
  - Extrae el rol del token de Keycloak
  - Retorna: `{ role, isCompras, isLogistica, isAdmin, loading }`
  - Roles soportados: `compras-be`, `logistica-be`, `stock-be`

---

## 🚪 Redirección Automática por Rol

### Archivo Modificado:

- **`src/app/dashboard/page.tsx`**
  - Ahora redirige según el rol del usuario:
    - `compras-be` → `/compras`
    - `logistica-be` → `/logistica`
    - `stock-be` → `/admin`

---

## 🏪 Portal de Administración

### Archivo Nuevo:

- **`src/app/admin/page.tsx`**
  - Portal para usuarios con rol `stock-be`
  - Incluye: gestión de productos, categorías
  - Usa servicios de `apiAdmin.js`

---

## 📊 Resumen de Cambios

| Antes | Después |
|-------|---------|
| 1 servicio API genérico | 3 servicios específicos por portal |
| Sin detección de roles | Hook `useUserRole` |
| Dashboard único | Redirección automática por rol |
| Sin separación por portal | Portal de Admin creado |

---

## ⚠️ Pendiente

- Crear página `/app/compras/page.tsx`
- Crear página `/app/logistica/page.tsx`
