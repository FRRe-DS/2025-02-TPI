# 🚨 PROBLEMA ENCONTRADO - GRUPO COMPRAS

## Resumen del Problema

El backend de **Compras** está intentando consumir la API de **Stock** usando rutas incorrectas, lo que causa errores 404.

---

## 📊 Análisis de Logs

### Lo que está pasando AHORA (INCORRECTO):

```log
172.18.0.9 - - [02/Dec/2025:15:18:58 +0000] "GET /stock/api/product/?page=1&limit=5000 HTTP/1.1" 404 151 "-" "python-requests/2.32.5"
```

El backend de compras está llamando a:
```
http://api-gateway/stock/api/product/
```

### Logs del Backend de Compras:

```python
2025-12-02 15:18:58,327 ERROR apps.modulos.inicio.views Error obteniendo productos desde Stock API para path=/compras/ user=AnonymousUser: HTTP 404 calling http://api-gateway/stock/api/product/

File "/app/apps/apis/productoApi/client.py", line 104, in listar_productos
    return self.get("/api/product/", params=params or None, expected_status=200)

utils.apiCliente.base.APIError: HTTP 404 calling http://api-gateway/stock/api/product/
```

---

## ✅ Solución: Rutas Correctas de la API de Stock

El backend de **Stock (Grupo 02)** expone las siguientes rutas:

### 📦 Productos

| Método | Ruta Correcta | Descripción |
|--------|---------------|-------------|
| GET | `/api/v1/productos` | Listar todos los productos (con paginación) |
| GET | `/api/v1/productos/:productoId` | Obtener un producto específico |
| POST | `/api/v1/productos` | Crear un nuevo producto |
| PATCH | `/api/v1/productos/:productoId` | Actualizar un producto |
| DELETE | `/api/v1/productos/:productoId` | Eliminar un producto |

### 🏷️ Categorías

| Método | Ruta Correcta | Descripción |
|--------|---------------|-------------|
| GET | `/api/v1/categorias` | Listar todas las categorías |
| GET | `/api/v1/categorias/:categoriaId` | Obtener una categoría específica |
| POST | `/api/v1/categorias` | Crear una nueva categoría |
| PATCH | `/api/v1/categorias/:categoriaId` | Actualizar una categoría |
| DELETE | `/api/v1/categorias/:categoriaId` | Eliminar una categoría |

### 📋 Reservas

| Método | Ruta Correcta | Descripción |
|--------|---------------|-------------|
| GET | `/api/v1/reservas` | Listar todas las reservas |
| GET | `/api/v1/reservas/:reservaId` | Obtener una reserva específica |
| POST | `/api/v1/reservas` | Crear una nueva reserva |
| PATCH | `/api/v1/reservas/:reservaId` | Actualizar una reserva |
| DELETE | `/api/v1/reservas/:reservaId` | Eliminar una reserva |

---

## 🔧 Qué debe corregir el Grupo de Compras

### 1. Actualizar `base.py` o el cliente API base

En su archivo `utils/apiCliente/base.py`, deben cambiar la URL base:

**ANTES (INCORRECTO):**
```python
base_url = "http://api-gateway/stock"
```

**DESPUÉS (CORRECTO):**
```python
base_url = "http://api-gateway"
```

### 2. Actualizar `productoApi/client.py`

En su archivo `apps/apis/productoApi/client.py`, línea 104:

**ANTES (INCORRECTO):**
```python
return self.get("/api/product/", params=params or None, expected_status=200)
```

**DESPUÉS (CORRECTO):**
```python
return self.get("/api/v1/productos", params=params or None, expected_status=200)
```

### 3. Verificar Query Parameters

La API de Stock espera estos parámetros:

```javascript
{
  page: number,        // Página actual (default: 1)
  limit: number,       // Elementos por página (default: 10)
  q: string,           // Búsqueda por nombre (opcional)
  categoriaId: number  // Filtrar por categoría (opcional)
}
```

**Ejemplo de llamada correcta:**
```
GET /api/v1/productos?page=1&limit=10&q=laptop&categoriaId=3
```

---

## 📝 Respuesta de Ejemplo

### GET /api/v1/productos (Listar)

```json
{
  "productos": [
    {
      "productoId": 1,
      "nombre": "Laptop HP",
      "descripcion": "Laptop de alta gama",
      "precio": 1200.00,
      "stockDisponible": 50,
      "categoriaId": 3,
      "categoria": {
        "categoriaId": 3,
        "nombre": "Electrónica"
      }
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### GET /api/v1/productos/:productoId (Obtener uno)

```json
{
  "productoId": 1,
  "nombre": "Laptop HP",
  "descripcion": "Laptop de alta gama",
  "precio": 1200.00,
  "stockDisponible": 50,
  "categoriaId": 3,
  "categoria": {
    "categoriaId": 3,
    "nombre": "Electrónica"
  }
}
```

---

## 🧪 Testing

Para probar las rutas correctas, pueden usar:

```bash
# Listar productos
curl http://localhost/api/v1/productos?page=1&limit=10

# Obtener un producto específico
curl http://localhost/api/v1/productos/1

# Listar categorías
curl http://localhost/api/v1/categorias
```

---

## 📦 Estado Actual del API Gateway

El API Gateway YA está configurado correctamente y routea las peticiones:

```nginx
# Compras (puerto 5000 interno, 8000 externo)
location /compras/ {
    proxy_pass http://compras-backend:5000/;
}

# Stock (puerto 4000)
location /api/ {
    proxy_pass http://stock-backend:4000;
}

location /stock/ {
    proxy_pass http://stock-backend:4000/;
}
```

---

## ⚠️ IMPORTANTE

**El problema NO es del grupo de Stock.** Sus rutas están correctas y funcionando. El error está en cómo Compras está consumiendo la API.

**Confirmado con logs:**
- ✅ Stock backend responde correctamente en `/api/v1/productos`
- ✅ API Gateway routea correctamente
- ❌ Compras llama a rutas inexistentes `/stock/api/product/`

---

## 📞 Contacto

Si tienen dudas, pueden revisar:
- Los logs del api-gateway: `docker logs api-gateway`
- Los logs de stock-backend: `docker logs stock-backend`
- Probar las rutas manualmente con curl o Postman

**Grupo Stock (Grupo 02)**
