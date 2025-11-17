# 🌐 Guía de Integración del API Gateway

## 📖 ¿Qué es el API Gateway?

Un **API Gateway** (Nginx en este caso) actúa como **punto de entrada único** para todas las peticiones del sistema. Funciona como un **reverse proxy** que:

1. Recibe todas las peticiones en un solo puerto (80)
2. Las redirige al backend correspondiente según la ruta
3. Centraliza autenticación, logs, y CORS

---

## 🎯 Arquitectura Propuesta por el Profesor

```
┌────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                      │
│                         http://localhost:3000                   │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         │ Todas las peticiones van a:
                         │ http://localhost/api/v1/...
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Nginx)                          │
│                    http://localhost:80                          │
│                                                                  │
│  Enruta según prefijo:                                          │
│  • /compras/*    → Backend Compras (Grupo 1) :8081             │
│  • /stock/*      → Backend Stock (Grupo 2) :4000               │
│  • /logistica/*  → Backend Logística (Grupo 3) :8082           │
└────────────────────────┬──────────────┬───────────────┬─────────┘
                         │              │               │
         ┌───────────────┘              │               └──────────────┐
         ▼                              ▼                              ▼
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│ Backend Compras │          │  Backend Stock  │          │ Backend Logística│
│   (Grupo 1)     │          │   (Grupo 2)     │          │   (Grupo 3)      │
│   :8081         │          │   :4000         │          │   :8082          │
└─────────────────┘          └─────────────────┘          └─────────────────┘
```

---

## 🚀 Paso 1: Configurar el API Gateway con Docker

### 1.1. Revisar el archivo `nginx.conf`

El profesor ya proporcionó este archivo. Necesitas **actualizarlo** con las IPs/puertos reales:

**Ubicación:** `c:\repo\2025-TPI\api-gateway\nginx.conf`

```nginx
worker_processes auto;
events { worker_connections 1024; }

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    # ===== UPSTREAMS (Backends) =====
    # Aquí defines dónde están tus backends
    
    upstream compras_service {
        # Cambia esto a la IP/puerto real del Grupo 1
        server host.docker.internal:8081;
    }
    
    upstream stock_service {
        # Tu backend (puerto 4000)
        server host.docker.internal:4000;
    }
    
    upstream logistica_service {
        # Cambia esto a la IP/puerto real del Grupo 3
        server host.docker.internal:8082;
    }

    server {
        listen 80;
        server_name _;

        # ===== RUTA PARA COMPRAS =====
        location /compras/ {
            # Elimina /compras/ del path antes de enviar
            # /compras/productos → /productos
            proxy_pass http://compras_service/;
            
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Headers CORS (opcional, si lo manejas en Nginx)
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PATCH, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
            
            proxy_connect_timeout 5s;
            proxy_read_timeout 30s;
        }

        # ===== RUTA PARA STOCK (TU BACKEND) =====
        location /stock/ {
            # /stock/productos → /productos
            proxy_pass http://stock_service/;
            
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PATCH, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
            
            proxy_connect_timeout 5s;
            proxy_read_timeout 30s;
        }

        # ===== RUTA PARA LOGÍSTICA =====
        location /logistica/ {
            # /logistica/envios → /envios
            proxy_pass http://logistica_service/;
            
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PATCH, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
            
            proxy_connect_timeout 5s;
            proxy_read_timeout 30s;
        }

        # ===== PÁGINA DE BIENVENIDA (opcional) =====
        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ =404;
        }
    }
}
```

**🔑 Notas importantes:**
- `host.docker.internal` permite que el contenedor Docker acceda a `localhost` de tu máquina
- Si los backends están en otras máquinas, usa sus IPs directamente

---

### 1.2. Crear `docker-compose.yml` para el API Gateway

**Ubicación:** `c:\repo\2025-TPI\api-gateway\docker-compose.yml`

```yaml
version: '3.8'

services:
  api-gateway:
    build: .
    container_name: api-gateway
    ports:
      - "80:80"      # Puerto HTTP
      - "443:443"    # Puerto HTTPS (opcional)
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    restart: unless-stopped
    networks:
      - ds-network

networks:
  ds-network:
    driver: bridge
```

---

### 1.3. Levantar el API Gateway

```powershell
cd c:\repo\2025-TPI\api-gateway
docker-compose up -d
```

Verifica que esté corriendo:
```powershell
docker ps
```

Deberías ver:
```
CONTAINER ID   IMAGE              PORTS
abc123         api-gateway        0.0.0.0:80->80/tcp
```

---

## 🔧 Paso 2: Actualizar tu Backend para trabajar con el Gateway

### 2.1. Modificar rutas en `index.js`

**ANTES (sin Gateway):**
```javascript
app.use('/api/v1/productos', productosRouter);
app.use('/api/v1/categorias', categoriasRouter);
app.use('/api/v1/reservas', reservasRouter);
```

**DESPUÉS (con Gateway):**

El Gateway ya elimina el prefijo `/stock/`, así que tus rutas quedan igual. **NO necesitas cambiar nada en tu backend**.

---

### 2.2. Actualizar el Frontend para usar el Gateway

**Archivo:** `c:\repo\2025-02-TPI\frontend\.env.local`

**ANTES:**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

**DESPUÉS:**
```env
NEXT_PUBLIC_API_URL=http://localhost/stock
```

Ahora todas las llamadas del frontend irán a:
- `http://localhost/stock/productos` → Gateway → `http://localhost:4000/productos`
- `http://localhost/stock/categorias` → Gateway → `http://localhost:4000/categorias`

---

## 🧪 Paso 3: Probar la Integración

### 3.1. Verificar que todos los servicios estén corriendo

```powershell
# 1. API Gateway
docker ps | Select-String "api-gateway"

# 2. Tu backend Stock
# (debe estar corriendo en puerto 4000)

# 3. Frontend
# (debe estar corriendo en puerto 3000)
```

### 3.2. Probar las rutas

**Desde el navegador o Postman:**

```
http://localhost/stock/productos
http://localhost/stock/categorias
http://localhost/stock/reservas
```

Deberías recibir las mismas respuestas que antes con `http://localhost:4000/api/v1/...`

---

## 🔗 Paso 4: Coordinación con Otros Grupos

### 4.1. Comunicar tus endpoints

Tu API ahora es accesible vía Gateway en:

```
Base URL: http://localhost/stock
```

**Endpoints disponibles para Grupo 1 (Compras):**
- `GET /stock/productos` - Listar productos
- `GET /stock/productos/{id}` - Obtener producto por ID
- `POST /stock/reservas` - Crear reserva
- `GET /stock/reservas?usuarioId={id}` - Listar reservas de un usuario

**Endpoints disponibles para Grupo 3 (Logística):**
- `GET /stock/productos/{id}` - Detalle de producto (con ubicación)
- `POST /stock/reservas/{id}/reclamar` - Reclamar reserva
- `POST /stock/reservas/{id}/liberar` - Liberar reserva

### 4.2. Compartir el OpenAPI Spec

El profesor ya proporcionó el archivo:
```
c:\repo\2025-TPI\stock\openapi.yaml
```

Compártelo con los otros grupos para que sepan:
- Qué endpoints expones
- Qué parámetros requieren
- Qué respuestas esperan

---

## 🚨 Problemas Comunes

### Problema 1: "Connection refused" desde el Gateway

**Causa:** El Gateway no puede conectar a tu backend.

**Solución:**
```nginx
# En nginx.conf, cambiar:
upstream stock_service {
    server host.docker.internal:4000;  # Para Windows/Mac
    # O si estás en Linux:
    # server 172.17.0.1:4000;
}
```

### Problema 2: CORS errors

**Solución:** Ya están los headers CORS en el `nginx.conf` actualizado arriba.

### Problema 3: El Gateway no recarga cambios

**Solución:**
```powershell
cd c:\repo\2025-TPI\api-gateway
docker-compose restart
```

---

## 📝 Checklist de Integración

- [ ] API Gateway corriendo en puerto 80
- [ ] Backend Stock corriendo en puerto 4000
- [ ] Frontend actualizado con nueva URL (`http://localhost/stock`)
- [ ] Probadas las rutas principales desde el navegador
- [ ] OpenAPI spec compartido con otros grupos
- [ ] Documentación de endpoints actualizada

---

## 🎯 Próximos Pasos

1. **Coordinar con Grupo 1 (Compras):**
   - Definir contrato de endpoints para reservas
   - Acordar formato de respuestas

2. **Coordinar con Grupo 3 (Logística):**
   - Definir estructura de dirección de almacén
   - Acordar flujo de reclamación de reservas

3. **Producción:**
   - Configurar HTTPS en Nginx
   - Implementar rate limiting
   - Agregar logs centralizados

---

**¿Necesitas ayuda con alguno de estos pasos?**
