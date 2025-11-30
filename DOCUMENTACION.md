# 📚 Documentación Completa del Proyecto - Sistema de Gestión de Stock

## Índice
1. [Introducción](#1-introducción)
2. [Arquitectura General](#2-arquitectura-general)
3. [Frontend (Interfaz de Usuario)](#3-frontend-interfaz-de-usuario)
4. [Backend (Servidor)](#4-backend-servidor)
5. [Base de Datos](#5-base-de-datos)
6. [Autenticación](#6-autenticación)
7. [API Gateway](#7-api-gateway)
8. [Docker y Contenedores](#8-docker-y-contenedores)
9. [Flujo Completo de una Operación](#9-flujo-completo-de-una-operación)
10. [Glosario de Términos](#10-glosario-de-términos)

---

## 1. Introducción

### ¿Qué es este proyecto?
Este proyecto es un **sistema de gestión de inventario/stock** desarrollado como Trabajo Práctico Integrador (TPI) para la materia Desarrollo de Software. Permite a los usuarios:

- 📦 **Gestionar productos**: crear, editar, ver y eliminar productos
- 🏷️ **Organizar por categorías**: agrupar productos en diferentes categorías
- 📋 **Manejar reservas**: reservar productos con control de stock
- 🔐 **Control de acceso**: solo usuarios autenticados pueden modificar datos

### Tecnologías utilizadas

| Componente | Tecnología | ¿Para qué sirve? |
|------------|------------|------------------|
| Frontend | Next.js + React | La interfaz visual que ven los usuarios |
| Backend | Node.js + Express | El servidor que procesa las operaciones |
| Base de datos | Supabase (PostgreSQL) | Donde se guardan todos los datos |
| Autenticación | Keycloak | Maneja los usuarios y contraseñas |
| API Gateway | Nginx | Redirige las peticiones al lugar correcto |
| Contenedores | Docker | Empaqueta todo para que funcione igual en cualquier computadora |

---

## 2. Arquitectura General

### ¿Cómo funciona todo junto?

Imagina el sistema como un restaurante:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          🌐 INTERNET (Usuario)                           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    🚪 API GATEWAY (Nginx - Puerto 80)                    │
│         "El recepcionista que dirige a cada visitante"                   │
└───────┬───────────────────┬───────────────────┬─────────────────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────────┐
│  🖥️ FRONTEND   │   │  ⚙️ BACKEND   │   │  🔐 KEYCLOAK      │
│  (Next.js)    │   │  (Express)    │   │  (Autenticación)  │
│  Puerto 3000  │   │  Puerto 4000  │   │  Puerto 8081      │
└───────────────┘   └───────┬───────┘   └───────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  🗄️ SUPABASE   │
                    │  (Base datos) │
                    └───────────────┘
```

### Analogía con un restaurante

- **Frontend** = El menú y las mesas donde se sienta el cliente
- **API Gateway** = El recepcionista que te dirige a la mesa correcta
- **Backend** = La cocina donde se preparan los pedidos
- **Base de datos** = La despensa donde están todos los ingredientes
- **Keycloak** = El guardia que verifica tu reservación antes de dejarte entrar

---

## 3. Frontend (Interfaz de Usuario)

### ¿Qué es el Frontend?
Es todo lo que el usuario **ve y toca** en su navegador. Está construido con **Next.js**, que es un framework basado en **React**.

### Estructura de carpetas
```
frontend/
├── src/
│   ├── app/                    # Páginas de la aplicación
│   │   ├── page.tsx            # Página de login (inicio)
│   │   ├── dashboard/          # Panel principal después de login
│   │   ├── producto/           # Páginas de productos
│   │   ├── categorias/         # Páginas de categorías
│   │   └── reservas/           # Páginas de reservas
│   │
│   ├── componentes/            # Piezas reutilizables de la interfaz
│   │   ├── ListaProductos.tsx  # Tabla que muestra los productos
│   │   ├── ProductoForm.tsx    # Formulario para crear/editar productos
│   │   ├── GestionCategorias.tsx
│   │   ├── GestionReservas.tsx
│   │   ├── KeycloakProvider.tsx # Maneja la autenticación
│   │   └── SlidePanel.tsx      # Panel deslizante lateral
│   │
│   ├── servicios/
│   │   └── api.js              # Funciones para comunicarse con el backend
│   │
│   └── lib/
│       └── keycloak.js         # Configuración de autenticación
```

### Explicación de archivos clave

#### 📄 `page.tsx` (Página de Login)
```typescript
// Esta es la página principal de login
import { useState } from 'react'
import { useRouter } from 'next/navigation'  // Importar el hook de navegación

export default function Page() {
  // useRouter: hook de Next.js para navegar entre páginas
  const router = useRouter()
  
  // Estados: son como "variables especiales" que React recuerda
  const [email, setEmail] = useState('')        // Guarda el email que escribe el usuario
  const [password, setPassword] = useState('')  // Guarda la contraseña
  const [isLoading, setIsLoading] = useState(false) // ¿Está cargando?
  const [error, setError] = useState('')        // Mensaje de error si algo falla

  // Esta función se ejecuta cuando el usuario hace click en "Iniciar Sesión"
  const handleLogin = async (e) => {
    e.preventDefault()  // Evita que la página se recargue
    setIsLoading(true)  // Muestra indicador de carga
    
    // Intenta autenticar con Keycloak
    // ... código de autenticación ...
    
    router.push('/dashboard')  // Si todo va bien, navega al dashboard
  }

  // El "return" define qué se ve en pantalla (HTML con esteroides)
  return (
    <div>
      <form onSubmit={handleLogin}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  )
}
```

**Conceptos importantes:**
- `useState`: Es como una caja donde guardamos información que puede cambiar. Cuando cambia, React actualiza automáticamente lo que se ve en pantalla.
- `async/await`: Permite esperar a que algo termine (como una llamada al servidor) antes de continuar.
- `router.push()`: Navega a otra página sin recargar todo el navegador.

#### 📄 `ListaProductos.tsx` (Componente de lista)
```typescript
export default function ListaProductos() {
  // Estado para guardar la lista de productos
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  // useEffect: se ejecuta cuando el componente aparece en pantalla
  useEffect(() => {
    // Llamamos al backend para obtener los productos
    obtenerProductos()
      .then((datos) => {
        setProductos(datos)  // Guardamos los productos
      })
      .finally(() => {
        setCargando(false)   // Ya terminó de cargar
      })
  }, [])  // El [] significa "solo ejecutar una vez al inicio"

  // Si está cargando, mostramos un mensaje
  if (cargando) return <p>Cargando...</p>

  // Mostramos la tabla de productos
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Precio</th>
        </tr>
      </thead>
      <tbody>
        {/* .map() recorre cada producto y crea una fila */}
        {productos.map((producto) => (
          <tr key={producto.id}>
            <td>{producto.id}</td>
            <td>{producto.nombre}</td>
            <td>${producto.precio}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

**Conceptos importantes:**
- `useEffect`: Es como un "evento de inicio". Se ejecuta cuando el componente aparece o cuando algo cambia.
- `.map()`: Recorre un array y transforma cada elemento en algo visual.
- `key`: Identificador único que React necesita para saber qué elementos actualizar.

#### 📄 `api.js` (Comunicación con el servidor)
```javascript
// URL base del servidor
const API_URL = process.env.NEXT_PUBLIC_API_URL

// Función auxiliar que agrega autenticación a todas las llamadas
async function fetchConAuth(endpoint, options = {}) {
  // Obtener el token de autenticación
  const token = keycloak?.token

  // Preparar los headers (información adicional que va con la petición)
  const headers = new Headers(options.headers || {})
  
  // Si hay datos que enviar, indicamos que son JSON
  if (options.body) {
    headers.append('Content-Type', 'application/json')
  }
  
  // Agregamos el token de autenticación
  if (token) {
    headers.append('Authorization', `Bearer ${token}`)
  }

  // Hacer la petición al servidor
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: headers
  })

  // Si hubo error, lanzamos una excepción
  if (!response.ok) {
    throw new Error(`Error ${response.status}`)
  }

  // Devolvemos los datos en formato JSON
  return response.json()
}

// Funciones específicas para cada operación
export async function obtenerProductos() {
  return fetchConAuth('/productos')
}

export async function agregarProducto(datosProducto) {
  return fetchConAuth('/productos', {
    method: 'POST',         // POST = crear algo nuevo
    body: JSON.stringify(datosProducto)  // Convertir objeto a texto JSON
  })
}

export async function eliminarProducto(id) {
  return fetchConAuth(`/productos/${id}`, {
    method: 'DELETE'        // DELETE = borrar algo
  })
}
```

**Conceptos importantes:**
- `fetch`: Función del navegador para hacer peticiones HTTP al servidor.
- `JSON.stringify()`: Convierte un objeto JavaScript a texto JSON para enviarlo.
- **Métodos HTTP**: 
  - `GET` = obtener datos
  - `POST` = crear algo nuevo
  - `PATCH` = actualizar parcialmente
  - `DELETE` = eliminar

---

## 4. Backend (Servidor)

### ¿Qué es el Backend?
Es el programa que corre en el servidor y se encarga de:
- Recibir peticiones del frontend
- Procesar la lógica de negocio
- Guardar/obtener datos de la base de datos
- Verificar que el usuario tenga permiso

### Estructura de carpetas
```
mi-app-backend/
├── index.js                    # Archivo principal que inicia el servidor
├── dbConfig.js                 # Conexión a la base de datos
├── keycloak-config.js          # Configuración de autenticación
│
├── Rutas/                      # Define las URLs disponibles
│   ├── productosRoutes.js
│   ├── categoriasRoutes.js
│   └── reservasRoutes.js
│
├── Controladores/              # Maneja las peticiones
│   ├── productosController.js
│   ├── categoriasController.js
│   └── reservasController.js
│
└── Servicios/                  # Lógica de negocio y base de datos
    ├── productosService.js
    ├── categoriasService.js
    └── reservasService.js
```

### Patrón de arquitectura: Rutas → Controladores → Servicios

```
    PETICIÓN HTTP                 RUTAS                   CONTROLADOR                 SERVICIO
         │                          │                          │                          │
    GET /productos  ─────────►  "¿Qué ruta es?" ──────►  "Validar datos" ──────►  "Ir a la BD"
         │                          │                          │                          │
         │                    productosRoutes.js      productosController.js   productosService.js
         │                          │                          │                          │
         ◄──────────────────────────┴──────────────────────────┴──────────────────────────┘
                                                RESPUESTA JSON
```

### Explicación de archivos clave

#### 📄 `index.js` (Punto de entrada del servidor)
```javascript
// Importar las librerías necesarias
import express from 'express'    // Framework para crear servidores web
import cors from 'cors'          // Permite que el frontend se comunique con nosotros

// Crear la aplicación
const app = express()
const PORT = 4000

// MIDDLEWARES: funciones que se ejecutan en CADA petición
app.use(express.json())  // Permite leer datos JSON del body
app.use(cors())          // Permite peticiones desde otros dominios

// Configurar autenticación con Keycloak
app.use(keycloak.middleware())

// RUTAS: conectamos las URLs con sus manejadores
app.use('/api/v1/productos', productosRouter)    // /api/v1/productos/* → productosRouter
app.use('/api/v1/categorias', categoriasRouter)  // /api/v1/categorias/* → categoriasRouter
app.use('/api/v1/reservas', reservasRouter)      // /api/v1/reservas/* → reservasRouter

// Health check: ruta simple para verificar que el servidor está vivo
app.get('/', (req, res) => {
  res.json({ mensaje: '¡El servidor está vivo!' })
})

// INICIAR el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
```

**Conceptos importantes:**
- `express()`: Crea una aplicación web que puede recibir peticiones HTTP.
- `app.use()`: Agrega un "middleware" (función que se ejecuta antes de las rutas).
- `app.listen()`: Inicia el servidor y lo deja escuchando peticiones.

#### 📄 `productosRoutes.js` (Definición de URLs)
```javascript
import express from 'express'
import productosControlador from '../Controladores/productosController.js'
import { keycloak } from '../keycloak-config.js'

const router = express.Router()

// GET /productos - Obtener todos los productos (público)
router.get('/', productosControlador.listarProductos)

// GET /productos/:productoId - Obtener un producto específico (público)
router.get('/:productoId', productosControlador.obtenerProductoPorId)

// POST /productos - Crear producto (protegido - requiere login)
router.post('/', keycloak.protect(), productosControlador.crearProducto)

// PATCH /productos/:productoId - Actualizar producto (protegido)
router.patch('/:productoId', keycloak.protect(), productosControlador.actualizarProducto)

// DELETE /productos/:productoId - Eliminar producto (protegido)
router.delete('/:productoId', keycloak.protect(), productosControlador.eliminarProducto)

export default router
```

**Conceptos importantes:**
- `router.get()`, `.post()`, etc.: Definen qué función ejecutar para cada tipo de petición.
- `:productoId`: Es un parámetro dinámico. Si la URL es `/productos/5`, entonces `productoId = 5`.
- `keycloak.protect()`: Middleware que verifica que el usuario esté autenticado antes de continuar.

#### 📄 `productosController.js` (Controlador)
```javascript
import productosServicio from '../Servicios/productosService.js'

// Controlador para LISTAR productos
const listarProductos = async (req, res) => {
  try {
    // 1. Obtener parámetros de la URL (?page=1&limit=10)
    const { page, limit, q } = req.query
    
    // 2. Llamar al servicio
    const productos = await productosServicio.listarProductos({ page, limit, q })
    
    // 3. Responder con éxito (código 200)
    res.status(200).json(productos)
    
  } catch (error) {
    // Si algo falla, responder con error (código 500)
    console.error('Error:', error)
    res.status(500).json({ mensaje: 'Error interno del servidor' })
  }
}

// Controlador para CREAR producto
const crearProducto = async (req, res) => {
  try {
    // 1. Obtener datos del body (lo que envía el frontend)
    const datosProducto = req.body
    
    // 2. VALIDAR los datos
    const { nombre, precio, stockInicial } = datosProducto
    if (!nombre || precio === undefined || stockInicial === undefined) {
      // Si faltan datos, devolver error 400 (petición incorrecta)
      return res.status(400).json({ 
        mensaje: 'Faltan datos obligatorios' 
      })
    }
    
    // 3. Llamar al servicio para crear el producto
    const productoCreado = await productosServicio.crearProducto(datosProducto)
    
    // 4. Responder con éxito (código 201 = creado)
    res.status(201).json(productoCreado)
    
  } catch (error) {
    res.status(500).json({ mensaje: 'Error interno del servidor' })
  }
}

export default {
  listarProductos,
  crearProducto,
  // ... más funciones
}
```

**Conceptos importantes:**
- `req` (request): Contiene toda la información de la petición (URL, body, headers, etc.)
- `res` (response): Se usa para enviar la respuesta al cliente
- `async/await`: Permite esperar operaciones asíncronas (como consultas a BD)
- **Códigos HTTP**: 200=OK, 201=Creado, 400=Error del cliente, 404=No encontrado, 500=Error del servidor

#### 📄 `productosService.js` (Lógica de negocio)
```javascript
import supabase from '../dbConfig.js'

// Función auxiliar para transformar datos de la BD al formato de la API
const _mapProductoToOutput = (data) => {
  if (!data) return null
  
  return {
    id: data.id,
    nombre: data.nombre,
    descripcion: data.descripcion,
    precio: parseFloat(data.precio_unitario),  // La BD usa snake_case
    stockDisponible: data.stock_disponible,    // La API usa camelCase
    // ... más campos
  }
}

// Servicio para LISTAR productos
const listarProductos = async (filtros) => {
  const { page = 1, limit = 10, q } = filtros
  
  // 1. Construir la consulta a Supabase
  let query = supabase
    .from('productos')           // Tabla 'productos'
    .select('*')                 // Seleccionar todas las columnas
  
  // 2. Aplicar filtro de búsqueda si existe
  if (q) {
    // ilike: búsqueda case-insensitive (ignora mayúsculas/minúsculas)
    // El % es un comodín que significa "cualquier cosa antes o después"
    query = query.ilike('nombre', `%${q}%`)
  }
  
  // 3. Aplicar paginación
  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)
  
  // 4. Ejecutar la consulta
  const { data, error } = await query
  
  if (error) throw new Error(error.message)
  
  // 5. Transformar y devolver los datos
  return data.map(_mapProductoToOutput)
}

// Servicio para CREAR producto
const crearProducto = async (datosProducto) => {
  const { nombre, descripcion, precio, stockInicial } = datosProducto
  
  // 1. Insertar en la base de datos
  const { data, error } = await supabase
    .from('productos')
    .insert({
      nombre: nombre,
      descripcion: descripcion,
      precio_unitario: precio,      // Mapeo a nombre de columna en BD
      stock_disponible: stockInicial
    })
    .select('id')                   // Devolver el ID del nuevo registro
    .single()                       // Esperar un solo resultado
  
  if (error) throw new Error(error.message)
  
  // 2. Devolver respuesta de éxito
  return {
    id: data.id,
    mensaje: 'Producto creado exitosamente'
  }
}

export default {
  listarProductos,
  crearProducto,
  // ... más funciones
}
```

**Conceptos importantes:**
- `supabase.from('tabla')`: Selecciona la tabla con la que trabajar
- `.select()`: Define qué columnas obtener
- `.insert()`: Agrega nuevos registros
- `.update()`: Modifica registros existentes
- `.delete()`: Elimina registros
- `.eq('columna', valor)`: Filtra por igualdad
- `.single()`: Espera un único resultado

---

## 5. Base de Datos

### ¿Qué es Supabase?
Supabase es una plataforma que proporciona una base de datos PostgreSQL en la nube, junto con una API automática para acceder a los datos.

### Esquema de la base de datos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              PRODUCTOS                                   │
├────────────────┬──────────────┬──────────────────────────────────────────┤
│ id             │ INTEGER      │ Identificador único (PK)                 │
│ nombre         │ VARCHAR      │ Nombre del producto                      │
│ descripcion    │ TEXT         │ Descripción detallada                    │
│ precio_unitario│ DECIMAL      │ Precio del producto                      │
│ stock_disponible│ INTEGER     │ Cantidad en inventario                   │
│ dimensiones    │ JSONB        │ { largoCm, anchoCm, altoCm }             │
│ ubicacion      │ JSONB        │ { street, city, state, country }         │
│ imagenes       │ JSONB        │ Array de URLs de imágenes                │
│ peso_kg        │ DECIMAL      │ Peso en kilogramos                       │
└────────────────┴──────────────┴──────────────────────────────────────────┘
                                        │
                                        │ N:M
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRODUCTOS_CATEGORIAS                             │
├────────────────┬──────────────┬──────────────────────────────────────────┤
│ producto_id    │ INTEGER      │ FK → productos.id                        │
│ categoria_id   │ INTEGER      │ FK → categorias.id                       │
└────────────────┴──────────────┴──────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              CATEGORIAS                                  │
├────────────────┬──────────────┬──────────────────────────────────────────┤
│ id             │ INTEGER      │ Identificador único (PK)                 │
│ nombre         │ VARCHAR      │ Nombre de la categoría                   │
│ descripcion    │ TEXT         │ Descripción de la categoría              │
└────────────────┴──────────────┴──────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                               RESERVAS                                   │
├────────────────┬──────────────┬──────────────────────────────────────────┤
│ id             │ INTEGER      │ Identificador único (PK)                 │
│ id_compra      │ INTEGER      │ ID de la compra asociada                 │
│ usuario_id     │ INTEGER      │ ID del usuario que reservó               │
│ estado         │ VARCHAR      │ 'pendiente', 'confirmado', 'cancelado'   │
│ expires_at     │ TIMESTAMP    │ Fecha de expiración de la reserva        │
│ fecha_creacion │ TIMESTAMP    │ Cuándo se creó                           │
│ fecha_actualizacion│ TIMESTAMP│ Última modificación                      │
└────────────────┴──────────────┴──────────────────────────────────────────┘
                                        │
                                        │ 1:N
                                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          RESERVAS_PRODUCTOS                              │
├────────────────┬──────────────┬──────────────────────────────────────────┤
│ reserva_id     │ INTEGER      │ FK → reservas.id                         │
│ producto_id    │ INTEGER      │ FK → productos.id                        │
│ cantidad       │ INTEGER      │ Cantidad reservada de ese producto       │
└────────────────┴──────────────┴──────────────────────────────────────────┘
```

### Conexión a Supabase

```javascript
// dbConfig.js
import { createClient } from '@supabase/supabase-js'

// URL y clave de Supabase (vienen de variables de entorno)
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

// Crear el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
```

### Ejemplos de consultas

```javascript
// Obtener todos los productos
const { data, error } = await supabase
  .from('productos')
  .select('*')

// Obtener un producto con sus categorías (JOIN)
// Esta sintaxis especial de Supabase crea un JOIN automático
// Supabase detecta las Foreign Keys y hace el JOIN por nosotros
const { data, error } = await supabase
  .from('productos')
  .select(`
    id,
    nombre,
    precio_unitario,
    productos_categorias (
      categorias (
        id,
        nombre
      )
    )
  `)
  .eq('id', productoId)
  .single()

// ⚠️ IMPORTANTE: El resultado 'data' tendrá una estructura ANIDADA:
// {
//   id: 1,
//   nombre: "Laptop",
//   precio_unitario: 999.99,
//   productos_categorias: [          ← Array de relaciones
//     {
//       categorias: {                ← Objeto anidado de la tabla relacionada
//         id: 5, 
//         nombre: "Electrónica" 
//       }
//     }
//   ]
// }
// Por eso necesitamos "mapear" los datos para aplanarlos al formato de la API

// Insertar un nuevo producto
const { data, error } = await supabase
  .from('productos')
  .insert({
    nombre: 'Producto Nuevo',
    precio_unitario: 99.99,
    stock_disponible: 100
  })
  .select('id')
  .single()

// Actualizar un producto
const { data, error } = await supabase
  .from('productos')
  .update({ precio_unitario: 149.99 })
  .eq('id', productoId)

// Eliminar un producto
const { data, error } = await supabase
  .from('productos')
  .delete()
  .eq('id', productoId)
```

---

## 6. Autenticación

### ¿Qué es Keycloak?
Keycloak es un servidor de identidad y acceso. En términos simples, es el "guardia de seguridad" que verifica quién eres antes de dejarte hacer ciertas cosas.

### Flujo de autenticación

```
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│   USUARIO   │        │   FRONTEND  │        │   KEYCLOAK  │
└──────┬──────┘        └──────┬──────┘        └──────┬──────┘
       │                      │                      │
       │  1. Escribe email    │                      │
       │     y contraseña     │                      │
       │─────────────────────>│                      │
       │                      │                      │
       │                      │  2. Envía credenciales
       │                      │─────────────────────>│
       │                      │                      │
       │                      │  3. Si son correctas,│
       │                      │     devuelve TOKEN   │
       │                      │<─────────────────────│
       │                      │                      │
       │  4. Redirige al      │                      │
       │     dashboard        │                      │
       │<─────────────────────│                      │
       │                      │                      │
```

### ¿Qué es un Token?
Un **token** es como una "pulsera de acceso" digital. Contiene:
- Quién eres (tu ID de usuario)
- Qué permisos tienes
- Cuándo expira

Cada vez que haces una petición protegida, envías el token para que el servidor verifique que tienes permiso.

### Configuración en el Frontend

```javascript
// keycloak.js
import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
  url: 'http://localhost:8081',        // URL de Keycloak
  realm: 'ds-2025-realm',              // "Realm" = grupo de usuarios
  clientId: 'grupo-02'                 // ID de nuestra aplicación
})

export default keycloak
```

### Protección de rutas en el Backend

```javascript
// En productosRoutes.js
import { keycloak } from '../keycloak-config.js'

// Ruta PÚBLICA (cualquiera puede acceder)
router.get('/productos', productosController.listar)

// Ruta PROTEGIDA (solo usuarios autenticados)
router.post('/productos', keycloak.protect(), productosController.crear)
//                        ^^^^^^^^^^^^^^^^
//                        Este middleware verifica el token
```

---

## 7. API Gateway

### ¿Qué es el API Gateway?
Es un servidor Nginx que actúa como "recepcionista". Todas las peticiones llegan primero a él, y él las redirige al servicio correcto.

### ¿Por qué usarlo?

1. **Una sola URL**: El frontend solo necesita conocer `http://localhost` en lugar de múltiples puertos
2. **Seguridad**: Oculta los puertos internos de los servicios
3. **Balanceo**: Puede distribuir carga entre múltiples servidores

### Configuración de Nginx

```nginx
# nginx.conf

# Definir los servidores "upstream" (backends)
upstream stock-backend {
    server stock-backend:4000;    # Nuestro backend en puerto 4000
}

upstream compras-backend {
    server compras-backend:8000;  # Backend de otro grupo
}

server {
    listen 80;  # Escuchar en puerto 80 (HTTP estándar)

    # Rutas para nuestro backend (Grupo 2 - Stock)
    location /api/ {
        proxy_pass http://stock-backend;
        # Las peticiones a /api/* van al backend de stock
    }
    
    location /stock/ {
        proxy_pass http://stock-backend/;
        # Las peticiones a /stock/* también van al backend de stock
    }

    # Rutas para el grupo de Compras
    location /compras/ {
        proxy_pass http://compras-backend/;
    }

    # Por defecto, servir el frontend
    location / {
        proxy_pass http://frontend-server;
    }
}
```

### Flujo de una petición

```
Usuario escribe: http://localhost/api/v1/productos
                        │
                        ▼
                  ┌──────────┐
                  │  NGINX   │ ──► "La URL empieza con /api/, 
                  │ (Gateway)│      lo envío a stock-backend"
                  └────┬─────┘
                       │
                       ▼
              http://stock-backend:4000/api/v1/productos
                       │
                       ▼
                  ┌──────────┐
                  │ BACKEND  │ ──► Procesa la petición
                  │ (Express)│
                  └────┬─────┘
                       │
                       ▼
                  Respuesta JSON
```

---

## 8. Docker y Contenedores

### ¿Qué es Docker?
Docker es una herramienta que "empaqueta" aplicaciones con todo lo que necesitan para funcionar, creando **contenedores** aislados.

**Analogía**: Imagina que Docker es como las cajas de mudanza. Cada caja (contenedor) tiene todo lo necesario: los muebles (código), las herramientas (librerías) y las instrucciones de montaje (configuración).

### Docker Compose
Docker Compose permite definir y ejecutar múltiples contenedores a la vez. El archivo `docker-compose.yml` describe todos los servicios.

### Servicios definidos

```yaml
# docker-compose.yml

services:
  # === BASE DE DATOS DE KEYCLOAK ===
  keycloak-db:
    image: postgres:15           # Usar imagen de PostgreSQL 15
    environment:
      POSTGRES_DB: keycloak      # Nombre de la base de datos
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: keycloak

  # === KEYCLOAK (AUTENTICACIÓN) ===
  keycloak:
    image: quay.io/keycloak/keycloak:23.0.6
    ports:
      - "8081:8080"              # Puerto externo:interno
    depends_on:
      - keycloak-db              # Esperar a que la BD esté lista

  # === NUESTRO BACKEND ===
  backend:
    build:
      context: ./mi-app-backend  # Carpeta con el código
      dockerfile: Dockerfile     # Archivo con instrucciones de construcción
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - SUPABASE_URL=...         # Variables de entorno
      - SUPABASE_ANON_KEY=...

  # === NUESTRO FRONTEND ===
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - backend                  # Esperar a que el backend esté listo

  # === API GATEWAY ===
  api-gateway:
    build:
      context: ./api-gateway
    ports:
      - "80:80"                  # Puerto 80 (HTTP estándar)
    depends_on:
      - backend
      - frontend
```

### Dockerfile del Backend

```dockerfile
# mi-app-backend/Dockerfile

# 1. Usar imagen base de Node.js
# "alpine" es una versión más pequeña y segura de Linux
# Es ideal para contenedores porque ocupa menos espacio (~5MB vs ~100MB)
FROM node:20-alpine

# 2. Crear directorio de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiar archivos de dependencias
COPY package*.json ./

# 4. Instalar dependencias
RUN npm install

# 5. Copiar el resto del código
COPY . .

# 6. Exponer el puerto que usa la aplicación
EXPOSE 4000

# 7. Comando para iniciar la aplicación
CMD ["npm", "start"]
```

### Comandos útiles de Docker

```bash
# Construir e iniciar todos los servicios
docker-compose up --build

# Iniciar en segundo plano
docker-compose up -d

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Detener todos los servicios
docker-compose down

# Ver contenedores activos
docker ps
```

---

## 9. Flujo Completo de una Operación

### Ejemplo: Crear un nuevo producto

Veamos paso a paso qué sucede cuando un usuario crea un producto:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PASO 1: INTERFAZ DE USUARIO                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  El usuario llena el formulario:                                        │
│  ┌─────────────────────────────────────┐                                │
│  │ Nombre:     [Laptop Dell XPS     ]  │                                │
│  │ Precio:     [$1500               ]  │                                │
│  │ Stock:      [25                  ]  │                                │
│  │ Categoría:  [☑ Electrónica       ]  │                                │
│  │                                     │                                │
│  │         [  Agregar Producto  ]      │                                │
│  └─────────────────────────────────────┘                                │
│                                                                         │
│  Al hacer click, se ejecuta handleSubmit() en ProductoForm.tsx          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          PASO 2: LLAMADA A LA API                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  // En ProductoForm.tsx                                                 │
│  const handleSubmit = async () => {                                     │
│    await agregarProducto(formData)  // ← Esto llama a api.js            │
│  }                                                                      │
│                                                                         │
│  // En api.js                                                           │
│  export async function agregarProducto(datos) {                         │
│    return fetchConAuth('/productos', {                                  │
│      method: 'POST',                                                    │
│      body: JSON.stringify(datos)                                        │
│    })                                                                   │
│  }                                                                      │
│                                                                         │
│  Se envía: POST http://localhost/api/v1/productos                       │
│  Con body: { nombre: "Laptop Dell XPS", precio: 1500, ... }             │
│  Con header: Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cC...        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          PASO 3: API GATEWAY                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Nginx recibe: POST /api/v1/productos                                   │
│                                                                         │
│  La regla "location /api/" coincide                                     │
│  → Redirige a: http://stock-backend:4000/api/v1/productos              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          PASO 4: RUTAS (EXPRESS)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  // En index.js                                                         │
│  app.use('/api/v1/productos', productosRouter)                          │
│                                                                         │
│  // En productosRoutes.js                                               │
│  router.post('/', keycloak.protect(), productosControlador.crearProducto)│
│                    ↑                                                    │
│                    Primero verifica el token de autenticación           │
│                    Si es válido, continúa al controlador                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          PASO 5: CONTROLADOR                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  // En productosController.js                                           │
│  const crearProducto = async (req, res) => {                            │
│    // 1. Extraer datos del body                                         │
│    const { nombre, precio, stockInicial } = req.body                    │
│                                                                         │
│    // 2. Validar datos obligatorios                                     │
│    if (!nombre || precio === undefined) {                               │
│      return res.status(400).json({ error: 'Faltan datos' })             │
│    }                                                                    │
│                                                                         │
│    // 3. Llamar al servicio                                             │
│    const resultado = await productosServicio.crearProducto(req.body)    │
│                                                                         │
│    // 4. Responder                                                      │
│    res.status(201).json(resultado)                                      │
│  }                                                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          PASO 6: SERVICIO                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  // En productosService.js                                              │
│  const crearProducto = async (datos) => {                               │
│    // 1. Insertar en Supabase                                           │
│    const { data, error } = await supabase                               │
│      .from('productos')                                                 │
│      .insert({                                                          │
│        nombre: datos.nombre,                                            │
│        precio_unitario: datos.precio,                                   │
│        stock_disponible: datos.stockInicial                             │
│      })                                                                 │
│      .select('id')                                                      │
│      .single()                                                          │
│                                                                         │
│    // 2. Insertar categorías si existen                                 │
│    if (datos.categoriaIds) {                                            │
│      await supabase.from('productos_categorias').insert(...)            │
│    }                                                                    │
│                                                                         │
│    // 3. Devolver resultado                                             │
│    return { id: data.id, mensaje: 'Producto creado' }                   │
│  }                                                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          PASO 7: RESPUESTA                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  La respuesta viaja de vuelta:                                          │
│                                                                         │
│  Supabase → Servicio → Controlador → Express → Nginx → Frontend        │
│                                                                         │
│  El frontend recibe:                                                    │
│  {                                                                      │
│    "id": 42,                                                            │
│    "mensaje": "Producto creado exitosamente"                            │
│  }                                                                      │
│                                                                         │
│  El frontend muestra: "¡Producto agregado correctamente!"               │
│  Y actualiza la lista de productos.                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Glosario de Términos

### Términos Generales

| Término | Definición |
|---------|------------|
| **API** | Application Programming Interface. Conjunto de reglas que permite que diferentes programas se comuniquen entre sí. |
| **REST** | Representational State Transfer. Estilo de arquitectura para APIs web usando métodos HTTP (GET, POST, etc.). |
| **JSON** | JavaScript Object Notation. Formato de texto para intercambiar datos. Ej: `{"nombre": "Juan", "edad": 25}` |
| **HTTP** | Protocolo de comunicación web. Define cómo se envían y reciben datos en internet. |
| **Token** | Cadena de texto que identifica a un usuario autenticado. Es como una "llave digital". |

### Términos de Frontend

| Término | Definición |
|---------|------------|
| **React** | Librería de JavaScript para construir interfaces de usuario usando componentes. |
| **Next.js** | Framework de React que agrega funcionalidades como routing y server-side rendering. |
| **Componente** | Pieza reutilizable de interfaz. Ej: un botón, una tabla, un formulario. |
| **Estado (State)** | Datos que un componente recuerda y que pueden cambiar. Cuando cambian, la UI se actualiza. |
| **Props** | Datos que un componente padre pasa a un componente hijo. Son inmutables. |
| **Hook** | Funciones especiales de React (useEffect, useState) que agregan funcionalidad a los componentes. |

### Términos de Backend

| Término | Definición |
|---------|------------|
| **Express** | Framework de Node.js para crear servidores web y APIs. |
| **Middleware** | Función que se ejecuta entre la petición y la respuesta. Puede modificar ambas. |
| **Router** | Componente que dirige las peticiones a los controladores correctos según la URL. |
| **Controlador** | Función que recibe una petición, la procesa y devuelve una respuesta. |
| **Servicio** | Capa que contiene la lógica de negocio y se comunica con la base de datos. |

### Términos de Base de Datos

| Término | Definición |
|---------|------------|
| **PostgreSQL** | Sistema de base de datos relacional (usa tablas con filas y columnas). |
| **Supabase** | Plataforma que proporciona PostgreSQL en la nube con una API automática. |
| **Query** | Consulta a la base de datos. Ej: "Dame todos los productos con precio > 100". |
| **JOIN** | Operación que combina datos de múltiples tablas relacionadas. |
| **Foreign Key (FK)** | Columna que referencia a otra tabla. Ej: `producto_id` referencia a `productos.id`. |

### Términos de DevOps

| Término | Definición |
|---------|------------|
| **Docker** | Herramienta para empaquetar aplicaciones en contenedores aislados. |
| **Contenedor** | Entorno aislado que contiene todo lo necesario para ejecutar una aplicación. |
| **Imagen** | Plantilla de solo lectura para crear contenedores. Como un "molde". |
| **Docker Compose** | Herramienta para definir y ejecutar múltiples contenedores. |
| **Nginx** | Servidor web que puede actuar como proxy reverso y balanceador de carga. |

### Códigos de Estado HTTP

| Código | Significado | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | La petición fue exitosa |
| 201 | Created | Se creó un nuevo recurso exitosamente |
| 204 | No Content | Éxito pero sin contenido que devolver (ej: DELETE) |
| 400 | Bad Request | La petición tiene errores (faltan datos, formato incorrecto) |
| 401 | Unauthorized | No estás autenticado (falta token o es inválido) |
| 403 | Forbidden | Estás autenticado pero no tienes permiso |
| 404 | Not Found | El recurso solicitado no existe |
| 500 | Internal Server Error | Algo falló en el servidor |

---

## 📖 Recursos Adicionales

### Para aprender más:

- **JavaScript/React**: [React Documentation](https://react.dev/)
- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)
- **Node.js/Express**: [Express Documentation](https://expressjs.com/)
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)
- **Docker**: [Docker Getting Started](https://docs.docker.com/get-started/)

---

*Documentación creada para el TPI de Desarrollo de Software 2025 - FRRe UTN*
