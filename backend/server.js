// Configuración inicial del servidor
// Cargo las variables de entorno desde el archivo .env
require('dotenv').config();

// Importamos todas las librerías que necesitamos
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const gameRoutes = require('./routes/game.routes');
const authRoutes = require('./routes/auth.routes');
const logger = require('./config/logger');

// Creamos la aplicación Express
const app = express();

// ========================================================================
// CONFIGURACIÓN DE MIDDLEWARES
// ========================================================================

// Configuración de CORS - es importante porque el frontend está en un dominio diferente
// Esta configuración permite que el frontend se comunique con el backend
const corsOptions = {
  // Función que decide qué orígenes pueden acceder al API
  origin: function (origin, callback) {
    // Lista de URLs permitidas
    const allowedOrigins = [
      'http://localhost:5173', // Frontend local
      'https://gameshelf-lyart.vercel.app', // Frontend en Vercel
      'https://gameshelf-dusky.vercel.app', // Frontend adicional en Vercel
      process.env.RENDER_EXTERNAL_URL, // URL del propio backend en Render
      process.env.CORS_ORIGIN, // Origen personalizado desde variables de entorno
    ].filter(Boolean);

    // Permite peticiones sin origen (Postman, apps móviles) o si el origen está en la lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`Intento de acceso CORS rechazado desde: ${origin}`);
      callback(new Error('CORS no permite este origen'));
    }
  },
  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Headers que pueden enviarse
  allowedHeaders: ['Content-Type', 'Authorization'],
  // Permite enviar cookies y credenciales
  credentials: true,
};

// Aplicamos la configuración CORS
app.use(cors(corsOptions));

// Middleware para parsear JSON automáticamente en las requests
app.use(express.json());

// ========================================================================
// CONEXIÓN A BASE DE DATOS
// ========================================================================
// Sistema híbrido: intenta conectar a MongoDB, pero puede funcionar sin ella (modo demo)

// Obtiene la URI de conexión desde variables de entorno
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (MONGO_URI) {
  // Si tenemos URI de MongoDB, intentamos conectar
  mongoose.connect(MONGO_URI)
    .then(() => {
      logger.info('Conexión a MongoDB establecida correctamente');
    })
    .catch(err => {
      logger.warn('Falló la conexión a MongoDB: ' + err.message);
      logger.info('Aplicación funcionando en modo demo sin persistencia de datos');
    });
} else {
  // Si no hay URI configurada, funcionamos en modo demo únicamente
  logger.info('URI de MongoDB no configurada - modo demo activado');
}

// ========================================================================
// INICIALIZACIÓN DEL USUARIO ADMINISTRADOR
// ========================================================================
// Sistema híbrido: crea admin tanto en MongoDB como en memoria según disponibilidad
// Esto garantiza que siempre haya un usuario para probar la funcionalidad

(async () => {
  try {
    // Verificamos si MongoDB está disponible
    if (mongoose.connection.readyState === 1) {
      // Si MongoDB está conectado, creamos el admin en la base de datos
      const User = require('./models/user.model');
      const usuarioExistente = await User.findOne({ email: 'admin@gameshelf.com' });

      if (!usuarioExistente) {
        // Creamos el usuario admin con contraseña hasheada
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('Admin123!', salt);

        const usuarioAdmin = new User({
          username: 'admin',
          email: 'admin@gameshelf.com',
          password: password,
          isPublic: true // Necesario para que evaluadores puedan acceder
        });

        await usuarioAdmin.save();
        logger.info('Usuario administrador creado en MongoDB: admin@gameshelf.com / Admin123!');
      } else {
        logger.info('Usuario administrador ya existe en MongoDB');
      }
    } else {
      // Si no hay MongoDB, almacenamos en archivo JSON para modo demo
      const fs = require('fs');
      const tempUsersPath = path.join(__dirname, 'temp_users.json');

      // Intentamos cargar usuarios existentes desde el archivo
      let usersInMemory = [];
      try {
        if (fs.existsSync(tempUsersPath)) {
          usersInMemory = JSON.parse(fs.readFileSync(tempUsersPath, 'utf8'));
        }
      } catch (error) {
        logger.warn('Error leyendo usuarios temporales en memoria:', error.message);
      }

      // Verificamos si el admin ya existe
      const usuarioAdminExistente = usersInMemory.find(u => u.email === 'admin@gameshelf.com');

      if (!usuarioAdminExistente) {
        // Creamos el usuario admin en memoria
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('Admin123!', salt);

        const usuarioAdmin = {
          _id: `admin-${Date.now()}`, // ID único con timestamp
          username: 'admin',
          email: 'admin@gameshelf.com',
          password: password, // Contraseña hasheada igual que en BD
          avatar: null,
          bio: 'Usuario administrador creado automáticamente para modo demo.',
          isPublic: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        usersInMemory.push(usuarioAdmin);

        // Guardamos en el archivo para persistencia básica
        try {
          fs.writeFileSync(tempUsersPath, JSON.stringify(usersInMemory, null, 2));
          logger.info('Usuario administrador de modo demo creado: admin@gameshelf.com');
        } catch (error) {
          logger.error('Error guardando usuarios temporales en archivo:', error.message);
        }
      }
    }
  } catch (error) {
    logger.error('Error en inicialización del usuario administrador:', error.message);
  }
})();

// ========================================================================
// CONFIGURACIÓN DE RUTAS
// ========================================================================

// Rutas del API - montamos los diferentes endpoints bajo prefijos claros
// Todos los endpoints de autenticación van bajo /api/auth
app.use('/api/auth', authRoutes);

// Todos los endpoints de gestión de juegos van bajo /api/games
app.use('/api/games', gameRoutes);

// ========================================================================
// ENDPOINTS DE DIAGNÓSTICO
// ========================================================================

// Endpoint básico para verificar que el servidor está funcionando
// Útil para health checks y monitoreo del servicio
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Endpoint de pruebas para verificar configuración
// Devuelve información sobre variables de entorno importantes
app.get('/test', (req, res) => {
  res.json({
    message: 'Backend funcionando correctamente',
    // Verifica que la URL del API esté configurada
    apiUrl: process.env.VITE_API_URL,
    // Verifica que la API key de RAWG esté disponible
    rawgKey: process.env.RAWG_API_KEY ? 'Configurada' : 'No configurada',
    // Información sobre la base de datos
    database: mongoose.connection.readyState === 1 ? 'Conectada' : 'Sin conexión'
  });
});

// Middleware general para manejo de errores
// Captura cualquier error pasado a través de next(error)
app.use((err, req, res, next) => {
  logger.error('Error detectado: ' + err.message);

  // Si el error es de validación de Mongoose, devuelve un 400
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos.',
      error: err.message
    });
  }

  // Para cualquier otro tipo de error, devuelve un 500 (Error Interno del Servidor)
  res.status(500).json({
    success: false,
    message: 'Ocurrió un error en el servidor.'
  });
});

// --- Inicio del Servidor ---
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  logger.info(`Servidor corriendo en puerto ${PORT}`);
  logger.info(`Entorno: ${NODE_ENV}`);
  logger.info('CORS habilitado para: localhost, Vercel y orígenes configurados');
});
