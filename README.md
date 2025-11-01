# GameShelf

Aplicación MERN para gestionar tu biblioteca de videojuegos.

## Inicio Rápido

### Opción 1: Script Automático
```bash
.\start.bat
```

### Opción 2: Manual
**Terminal 1:**
```bash
cd backend
npm start
```

**Terminal 2:**
```bash
cd frontend
npm run dev
```

## Acceso

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8080

## Credenciales de Acceso (para Evaluación)

Para el proceso de evaluación, se ha creado un usuario administrador por defecto con las siguientes credenciales:

- **Email:** admin@gameshelf.com
- **Contraseña:** Admin123!

Este usuario se crea automáticamente al iniciar el servidor por primera vez cuando hay conexión a MongoDB.

## Características

✅ Ver juegos populares
✅ Agregar juegos a tu biblioteca
✅ Cambiar estado de juegos (Pendiente, Jugando, Completado)
✅ Eliminar juegos
✅ Búsqueda de juegos
✅ Interfaz responsiva

## 🚀 Despliegue en Producción

### 1. MongoDB Atlas (Base de Datos)

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crea cuenta gratuita
3. Crea un cluster M0 (gratuito)
4. Ve a "Database Access" → "Add New Database User"
5. Ve a "Network Access" → "Add IP Address" → "Allow Access from Anywhere (0.0.0.0/0)"
6. Ve a "Clusters" → "Connect" → "Connect your application"
7. Copia el connection string

### 2. API Key de RAWG

1. Ve a [RAWG API](https://rawg.io/apikey)
2. Crea cuenta gratuita
3. Genera tu API key

### 3. Backend - Render

1. Ve a [Render](https://render.com/)
2. "New" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Name**: `gameshelf-api`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
5. Variables de entorno:
   ```
   MONGODB_URI=tu_connection_string_de_mongodb
   JWT_SECRET=secreto_seguro_para_jwt
   NODE_ENV=production
   PORT=10000
   RAWG_API_KEY=tu_api_key_de_rawg
   CORS_ORIGIN=https://tu-dominio.vercel.app
   ```

### 4. Frontend - Vercel

1. Ve a [Vercel](https://vercel.com/)
2. "Import Project" → conecta tu repo de GitHub
3. Configura variable de entorno:
   ```
   VITE_API_URL=https://tu-backend-en-render.onrender.com
   ```

### 5. Configuración Final

1. Una vez desplegado todo, actualiza en Render:
   - `CORS_ORIGIN` con la URL real de Vercel

2. Actualiza en Vercel:
   - `VITE_API_URL` con la URL real de Render

## 📋 Credenciales de Prueba

- **Email**: `admin@gameshelf.com`
- **Password**: `Admin123!`

## 🛠️ Desarrollo Local

### Prerrequisitos
- Node.js 18+
- MongoDB Atlas (opcional, funciona en memoria)

### Instalación
```bash
# Instalar dependencias
npm run install:all

# Copiar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus valores

# Iniciar desarrollo
.\start.bat
```

### Variables de Entorno (.env)
```bash
# Copiar el archivo de ejemplo
cp backend/.env.example backend/.env

# Configurar con tus valores:
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/gameshelf
JWT_SECRET=tu_secreto_jwt_seguro
RAWG_API_KEY=tu_api_key_de_rawg
CORS_ORIGIN=http://localhost:5173
```

## 📚 Tecnologías Utilizadas

- **Frontend**: React 18, Vite, Mantine UI
- **Backend**: Node.js, Express.js, MongoDB
- **Autenticación**: JWT, bcrypt
- **API Externa**: RAWG Video Games Database
- **Despliegue**: Vercel (Frontend), Render (Backend), MongoDB Atlas

## 📋 Características

✅ Sistema completo de autenticación (Login/Registro)
✅ CRUD completo de juegos
✅ Estados de juegos (Pendiente, Jugando, Completado)
✅ Búsqueda y exploración de juegos
✅ Interfaz responsiva y moderna
✅ API REST documentada
✅ Modo demo sin base de datos
✅ Logging y manejo de errores
