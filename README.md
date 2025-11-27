Proyecto TPI DS2025

Integrantes:

Albornoz, María Leonor

Domínguez, Gonzalo Nahuel

Leguizamón, Sofía Violeta

Maldonado, Leandro Arian

Sanchez, Gisela Mariel

Suárez, Gonzalo Nicolás

Tomás, Damián Uriel

Viola Saucedo, Ariel Antonio

-------------------------------------------------------------------------------
📦 Stock Management – TPI DS2025

Sistema web de gestión de stock para la materia Desarrollo de Software (DS2025).
Permite administrar productos, categorías, reservas y usuarios mediante una arquitectura moderna basada en Next.js, Node.js, Supabase, Keycloak y Docker.

🚀 Características principales

Gestión completa de productos (alta, baja, modificación y listado)
Administración de categorías
Sistema de reservas
Autenticación y autorización con Keycloak
API REST centralizada para comunicación con el frontend
Persistencia de datos con Supabase
Arquitectura monorepo con workspaces
Contenedores dockerizados para despliegue rápido

🏗️ Arquitectura General del Proyecto
El proyecto se organiza en un monorepo que contiene:
Frontend (Next.js 15 + TypeScript)
 UI reactiva, manejo de sesiones con Keycloak, estilos con TailwindCSS.

Backend (Node.js + Express)
 Exposición de endpoints REST, middleware de Keycloak, conexión a Supabase.

Keycloak
 Servicio de Identity & Access Management para autenticación.

Supabase
 Base de datos principal (PostgreSQL administrado).

API Gateway (NGINX)
 (Opcional según versión) Para enrutar tráfico entre frontend y backend.


🔧 Diagrama conceptual (texto)

                 ┌──────────────────┐
                 │     Frontend     │
                 │ Next.js + TS     │
                 └───────┬──────────┘
                         │
                         ▼
                ┌──────────────────┐
                │     Backend      │
                │ Node.js + Express│
                └───────┬──────────┘
                        │
                        ▼
                ┌──────────────────┐
                │   Supabase DB    │
                └──────────────────┘

                ┌──────────────────┐
                │    Keycloak      │
                │ Auth + Tokens    │
                └──────────────────┘

               

---------------------------------------------------------------------------------
📂 Estructura del Proyecto
TPI-DS2025/

├── frontend/            → Aplicación web (Next.js + TypeScript)

├── mi-app-backend/      → API REST (Express + Supabase)

├── keycloak/            → Configuración del IAM + docker-compose

├── package.json         → Configuración raíz del monorepo

├── package-lock.json    → Lockfile único

├── node_modules/        → Dependencias compartidas

└── .gitignore           → Ignora builds, .env, node_modules, etc.

----------------------------------------------------------------------------
🧰 Tecnologías utilizadas

🟦 Frontend:
Next.js 15, 
React 19, 
TypeScript, 
TailwindCSS,
CSS Modules, 
Flowbite, 
React Icons, 
Lucide React, 
Keycloak-js

🟩 Backend:
Node.js, 
Express 5, 
Supabase-js, 
Keycloak-connect, 
dotenv, 
axios, 
cors

🔐 Autenticación: 
Keycloak 24

🐳 Infraestructura:
Docker Compose, 
NGINX (según versión del gateway)


----------------------------------------------------------------------
🛠️ Instalación y ejecución del proyecto
IMPORTANTE: Tener Docker Desktop instalado y encendido.

1️⃣ Clonar el repositorio y actualizar dependencias
En la raíz del proyecto:
git pull
npm install

2️⃣ Inicializar el submódulo (carpeta de la materia)
```
git clone --recurse-submodules <URL-del-repo>
```

3️⃣ Levantar Keycloak
Ir a la carpeta keycloak/ y ejecutar:
```
docker compose up -d
```
Acceder a la consola:
👉 http://localhost:8080
Usuario: admin
Contraseña: ds2025
Realm: ds-2025-realm

4️⃣ Configurar variables del frontend
Crear archivo (dentro de la carpeta frontend):
📄 frontend/.env.local
Contenido:
``` bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080

NEXT_PUBLIC_KEYCLOAK_REALM=ds-2025-realm

NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=grupo-02
```


5️⃣ Levantar el proyecto completo (frontend + backend)
En la raíz del proyecto:
```bash
npm run dev:all
```
Esto inicia:
Frontend en: http://localhost:3000
Backend en: http://localhost:4000
Keycloak en: http://localhost:8080
----------------------------------------------------------------------------
📦 Dependencias principales

🟦 Raíz del monorepo
all ^0.0.0
dotenv ^17.2.3
flowbite ^4.0.1
react-icons ^5.5.0
npm-run-all ^4.1.5
tailwindcss ^4.1.17
postcss ^8.5.6
autoprefixer ^10.4.22

🟪 Frontend
(Next.js, React, TypeScript y estilos)
react 19.1.0
react-dom 19.1.0
next 15.5.4
keycloak-js 26.2.1
flowbite 2.5.2
lucide-react 0.554.0
react-icons 5.4.0

🟩 Backend
(Node + Express + Supabase + Keycloak)
express 5.1.0
supabase-js 2.75.0
cors 2.8.5
axios 1.12.2
keycloak-connect 26.1.1
dotenv 17.2.3
--------------------------------------------------------------------------------
👥 Equipo y prácticas ágiles
Metodología: Ágil / Scrum - Kanban
Herramientas utilizadas:
📝 Gestión y tableros
Trello / Google Docs
 Tablero Kanban del equipo:
 https://docs.google.com/document/d/1f1oeuP4RXywkhwPlYSKjNfVSU4Ly2chn2OwBtA23cw0/edit?usp=sharing
🎨 Prototipado y diseño
Figma – Diseño UI del frontend
 https://www.figma.com/design/VgBFt9bSCxjyVA94YMb8OP/Stock-Management?node-id=0-1&t=tHYfkeY7nC4FMSbH-1
 
🧑‍💻 Distribución del trabajo
Tareas divididas por componentes del front/back
Integración continua manual mediante reuniones semanales
Control de versiones con Git, utilizando el submódulo general de las API. 
