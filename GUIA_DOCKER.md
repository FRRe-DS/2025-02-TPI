# 🐳 Guía de Dockerización del Sistema

## 📋 Pre-requisitos

- Docker Desktop instalado y corriendo
- Docker Compose v2.0+
- Puertos libres: 80, 443, 3000, 4000, 8080

---

## 🏗️ Estructura de Contenedores

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network: ds-network                │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Frontend   │  │   Backend    │  │   Keycloak   │      │
│  │   Next.js    │  │  Express.js  │  │   + DB       │      │
│  │   :3000      │  │   :4000      │  │   :8080      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                   │              │
│         └─────────────────┴───────────────────┘              │
│                           │                                  │
│                    ┌──────▼──────┐                          │
│                    │ API Gateway │                          │
│                    │   (Nginx)   │                          │
│                    │    :80      │                          │
│                    └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Paso 1: Configurar Variables de Entorno

### 1.1. Crear archivo `.env`

```powershell
cd c:\repo\2025-02-TPI
Copy-Item .env.example .env
```

### 1.2. Editar `.env` con tus credenciales

```env
# SUPABASE (obtén de https://supabase.com/dashboard/project/_/settings/api)
SUPABASE_URL=https://abcdefghijk.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# SESSION SECRET (genera uno nuevo)
SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Para generar un session secret seguro:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔧 Paso 2: Actualizar Configuración de Keycloak en Backend

### 2.1. Modificar `keycloak-config.js`

El backend necesita apuntar a Keycloak **dentro de la red Docker**:

**Archivo:** `mi-app-backend/keycloak-config.js`

```javascript
// Detectar si estamos en Docker o desarrollo local
const isDocker = process.env.NODE_ENV === 'production';

const keycloakConfig = {
  realm: process.env.KEYCLOAK_REALM || 'ds-2025-realm',
  'auth-server-url': isDocker 
    ? 'http://keycloak:8080'  // Desde Docker network
    : 'http://localhost:8080', // Desarrollo local
  'ssl-required': 'none',
  resource: process.env.KEYCLOAK_CLIENT_ID || 'grupo-02',
  'public-client': true,
  'confidential-port': 0
};
```

---

## 🐳 Paso 3: Construir y Levantar los Contenedores

### 3.1. Construir las imágenes

```powershell
cd c:\repo\2025-02-TPI

# Construir todo
docker-compose build
```

Esto tomará unos minutos la primera vez.

### 3.2. Levantar el sistema completo

```powershell
docker-compose up -d
```

El flag `-d` (detached) lo ejecuta en segundo plano.

### 3.3. Verificar que estén corriendo

```powershell
docker-compose ps
```

Deberías ver algo como:

```
NAME                IMAGE                        STATUS
api-gateway         api-gateway                  Up
backend-stock       2025-02-tpi-backend         Up (healthy)
frontend-stock      2025-02-tpi-frontend        Up
keycloak-ds         quay.io/keycloak/keycloak   Up (healthy)
keycloak-db         postgres:15-alpine          Up
```

---

## 🧪 Paso 4: Verificar que Todo Funcione

### 4.1. Verificar servicios individualmente

**Keycloak:**
```
http://localhost:8080
```
- Usuario: `admin`
- Password: `admin`

**Backend (a través del Gateway):**
```
http://localhost/stock/
```
Debería responder: `{"mensaje": "¡El servidor esta vivo! TESTI ES UN KPO"}`

**Frontend:**
```
http://localhost:3000
```
Debería cargar la aplicación Next.js

### 4.2. Ver logs de un contenedor

```powershell
# Backend
docker-compose logs -f backend

# Frontend
docker-compose logs -f frontend

# Keycloak
docker-compose logs -f keycloak

# Todos juntos
docker-compose logs -f
```

---

## 🔄 Paso 5: Configurar Keycloak (Primera Vez)

Como Keycloak ahora está en Docker, necesitas configurarlo:

### 5.1. Acceder al Admin Console

1. Ir a: `http://localhost:8080`
2. Login: `admin` / `admin`

### 5.2. Crear Realm y configurar

Sigue los pasos de `GUIA_KEYCLOAK_COMPANERO.md`:
- Crear realm `ds-2025-realm`
- Crear roles: `compras-be`, `logistica-be`, `stock-be`
- Crear cliente `grupo-02` con:
  - **Valid redirect URIs:** `http://localhost:3000/*`
  - **Valid post logout redirect URIs:** `http://localhost:3000/*`
  - **Web origins:** `http://localhost:3000`
- Crear usuarios de prueba

### 5.3. (Alternativa) Importar configuración existente

Si ya tienes un realm exportado:

```powershell
# Copiar el realm JSON al contenedor
docker cp ./2025-TPI/keycloak/realm-config/ds-2025-realm.json keycloak-ds:/tmp/

# Importar (requiere reiniciar Keycloak)
docker-compose down keycloak
docker-compose up -d keycloak
```

---

## 🛠️ Comandos Útiles

### Ver estado de contenedores
```powershell
docker-compose ps
```

### Ver logs en tiempo real
```powershell
docker-compose logs -f
```

### Reiniciar un servicio específico
```powershell
docker-compose restart backend
docker-compose restart frontend
```

### Detener todo
```powershell
docker-compose down
```

### Detener y eliminar volúmenes (⚠️ borra datos de Keycloak)
```powershell
docker-compose down -v
```

### Reconstruir un servicio
```powershell
# Si cambias código del backend
docker-compose up -d --build backend

# Si cambias código del frontend
docker-compose up -d --build frontend
```

### Acceder a un contenedor
```powershell
# Backend
docker exec -it backend-stock sh

# Frontend
docker exec -it frontend-stock sh

# Ver archivos dentro
ls -la
```

---

## 🔍 Troubleshooting

### Problema 1: "Port already in use"

**Síntoma:** Error al levantar, puerto ocupado

**Solución:**
```powershell
# Ver qué está usando el puerto
netstat -ano | findstr :8080
netstat -ano | findstr :4000
netstat -ano | findstr :3000

# Matar el proceso
taskkill /PID <numero-pid> /F
```

### Problema 2: Backend no conecta a Keycloak

**Síntoma:** Error 401/403 en todas las peticiones

**Solución:**
- Verificar que Keycloak esté `healthy`:
  ```powershell
  docker-compose ps
  ```
- Ver logs de Keycloak:
  ```powershell
  docker-compose logs keycloak
  ```
- Esperar a que Keycloak termine de iniciar (puede tomar 1-2 minutos)

### Problema 3: Frontend no carga

**Síntoma:** Página en blanco o error al cargar

**Solución:**
```powershell
# Ver logs del frontend
docker-compose logs frontend

# Reconstruir el frontend
docker-compose up -d --build frontend
```

### Problema 4: Cambios en código no se reflejan

**Síntoma:** Modificas código pero no ves cambios

**Solución:**
```powershell
# Reconstruir la imagen
docker-compose build backend
docker-compose up -d backend

# O todo junto
docker-compose up -d --build
```

### Problema 5: "Cannot find module"

**Síntoma:** Error al iniciar contenedor

**Solución:**
```powershell
# Limpiar y reconstruir
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📦 Desarrollo vs Producción

### Modo Desarrollo (con hot-reload)

Para desarrollo local, puedes usar volúmenes para que los cambios se reflejen sin reconstruir:

**Modificar `docker-compose.yml`:**

```yaml
  backend:
    # ... resto de config
    volumes:
      - ./mi-app-backend:/app
      - /app/node_modules
    command: npm run dev  # Si tienes nodemon configurado
```

### Modo Producción

El `docker-compose.yml` actual ya está configurado para producción.

---

## 🚢 Exportar Imágenes

Para compartir con tus compañeros:

```powershell
# Guardar imágenes
docker save -o backend-stock.tar 2025-02-tpi-backend
docker save -o frontend-stock.tar 2025-02-tpi-frontend

# Cargar en otra máquina
docker load -i backend-stock.tar
docker load -i frontend-stock.tar
```

---

## 📊 Monitoreo

### Ver recursos consumidos
```powershell
docker stats
```

### Ver volúmenes
```powershell
docker volume ls
```

### Limpiar recursos no usados
```powershell
# Limpiar imágenes viejas
docker image prune -a

# Limpiar todo (⚠️ cuidado)
docker system prune -a
```

---

## ✅ Checklist de Integración

- [ ] `.env` configurado con credenciales correctas
- [ ] `docker-compose build` ejecutado exitosamente
- [ ] `docker-compose up -d` levanta todos los contenedores
- [ ] `docker-compose ps` muestra todos como "Up" o "Up (healthy)"
- [ ] Keycloak accesible en `http://localhost:8080`
- [ ] Backend responde en `http://localhost/stock/`
- [ ] Frontend carga en `http://localhost:3000`
- [ ] Realm y usuarios creados en Keycloak
- [ ] Login funciona desde el frontend
- [ ] Endpoints protegidos requieren autenticación

---

## 🎯 Próximo Paso: Integración con Otros Grupos

Una vez que tus contenedores funcionen:

1. **Compartir URLs:**
   - Backend: `http://localhost/stock`
   - OpenAPI: `./stock/openapi.yaml`

2. **Coordinar con Grupo 1 (Compras):**
   - Que agreguen tu servicio a su Gateway
   - Probar endpoints de productos y reservas

3. **Coordinar con Grupo 3 (Logística):**
   - Que puedan consultar ubicación de productos
   - Probar flujo de reclamación de reservas

---

**¿Necesitas ayuda con algún paso específico?**
