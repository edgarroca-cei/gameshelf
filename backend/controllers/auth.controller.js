// Importamos los módulos necesarios para manejar autenticación
// Modelo de usuario para interactuar con la base de datos
const User = require('../models/user.model');
// JWT para generar tokens de autenticación
const jwt = require('jsonwebtoken');
// Logger para registrar eventos del sistema
const logger = require('../config/logger');
// Mongoose para verificar estado de conexión a MongoDB
const mongoose = require('mongoose');
// bcryptjs para hashear y verificar contraseñas
const bcrypt = require('bcryptjs');

// ========================================================================
// FUNCIONES AUXILIARES PARA MODO DEMO
// ========================================================================

// Función para cargar usuarios desde archivo JSON cuando no hay MongoDB
// Esto permite que la aplicación funcione en modo demo sin base de datos
function loadUsersFromFile() {
  const fs = require('fs');
  const path = require('path');
  const tempUsersPath = path.join(__dirname, 'temp_users.json');

  try {
    if (fs.existsSync(tempUsersPath)) {
      const data = fs.readFileSync(tempUsersPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error leyendo usuarios desde archivo:', error.message);
  }
  return [];
}

// Función complementaria para guardar usuarios en archivo JSON
// Mantiene persistencia básica en modo demo
function saveUsersToFile(users) {
  const fs = require('fs');
  const path = require('path');
  const tempUsersPath = path.join(__dirname, 'temp_users.json');

  try {
    fs.writeFileSync(tempUsersPath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error guardando usuarios en archivo:', error.message);
  }
}

// Almacenamiento en memoria para cuando no hay conexión a base de datos
let usersInMemory = loadUsersFromFile();
// Contador para generar IDs únicos en modo memoria
let userIdCounter = Math.max(...usersInMemory.map(u => parseInt(u._id.split('-')[1] || '0')), 0) + 1;

// ========================================================================
// FUNCIÓN AUXILIAR PARA GESTIÓN DE TOKENS
// ========================================================================

// Función que crea un token JWT con la información del usuario
// Incluye ID y nombre de usuario, válido por 7 días
const generarToken = (userId, username) => {
  return jwt.sign(
    { _id: userId, username },
    process.env.JWT_SECRET || 'tu_secreto_jwt_super_seguro',
    { expiresIn: '7d' }
  );
};

// ========================================================================
// CONTROLADOR DE REGISTRO DE USUARIOS
// ========================================================================

// Función principal que maneja el registro de nuevos usuarios
// Soporta tanto registro con base de datos como en modo demo
const registro = async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;

  // Primero verificamos que las contraseñas sean idénticas
  if (password !== passwordConfirm) {
    logger.warn('Intento de registro con contraseñas que no coinciden');
    return res.status(400).json({
      success: false,
      message: 'Las contraseñas no coinciden.'
    });
  }

  // Intentamos usar la base de datos si está disponible
  if (mongoose.connection.readyState === 1) {
    try {
      const usuarioExistente = await User.findOne({ $or: [{ email }, { username }] });
      if (usuarioExistente) {
        logger.warn(`Intento de registro con email/username duplicado: ${email}`);
        return res.status(400).json({
          success: false,
          message: 'El email o nombre de usuario ya está registrado.'
        });
      }

      const nuevoUsuario = new User({ username, email, password });
      await nuevoUsuario.save();
      logger.info(`Nuevo usuario registrado en MongoDB: ${username}`);

      const token = generarToken(nuevoUsuario._id, nuevoUsuario.username);
      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente.',
        token,
        usuario: nuevoUsuario.obtenerDatosPublicos()
      });
    } catch (error) {
      logger.error(`Error en registro con MongoDB: ${error.message}`);
      return next(error);
    }
  }

  // --- Fallback a almacenamiento en memoria ---
  logger.info('Usando almacenamiento en memoria para registro');
  try {
    const usuarioExistente = usersInMemory.find(u => u.email === email || u.username === username);
    if (usuarioExistente) {
      logger.warn(`Intento de registro con email/username duplicado en memoria: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'El email o nombre de usuario ya está registrado.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHasheada = await bcrypt.hash(password, salt);

    const nuevoUsuario = {
      _id: `mem-${userIdCounter++}`,
      username,
      email,
      password: passwordHasheada,
      avatar: null,
      bio: '',
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    usersInMemory.push(nuevoUsuario);
    saveUsersToFile(usersInMemory); // Guardar en archivo
    logger.info(`Nuevo usuario registrado en memoria: ${username}`);

    const token = generarToken(nuevoUsuario._id, nuevoUsuario.username);
    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente (en memoria).',
      token,
      usuario: {
        _id: nuevoUsuario._id,
        username: nuevoUsuario.username,
        email: nuevoUsuario.email,
        avatar: nuevoUsuario.avatar,
        bio: nuevoUsuario.bio,
        isPublic: nuevoUsuario.isPublic,
        createdAt: nuevoUsuario.createdAt
      }
    });
  } catch (error) {
    logger.error(`Error en registro en memoria: ${error.message}`);
    return next(error);
  }
};

// ========================================================================
// CONTROLADOR DE LOGIN DE USUARIOS
// ========================================================================

// Función que maneja el proceso de autenticación de usuarios
// Permite login tanto con email como con nombre de usuario
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Verificamos que se hayan enviado las credenciales básicas
    if (!email || !password) {
      logger.warn('Intento de login sin proporcionar credenciales completas');
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona email o nombre de usuario y contraseña.'
      });
    }

    // Intentamos autenticar usando la base de datos si está disponible
    if (mongoose.connection.readyState === 1) {
      try {
        // Intentar encontrar usuario por email primero, si no por username
        let usuario = await User.findOne({ email }).select('+password');

        // Si no encontró por email, probar con username
        if (!usuario) {
          usuario = await User.findOne({ username: email }).select('+password');
        }

        if (!usuario) {
          logger.warn(`Intento de login con email/username no registrado: ${email}`);
          return res.status(401).json({
            success: false,
            message: 'Email, nombre de usuario o contraseña incorrectos.'
          });
        }

        const passwordValida = await usuario.compararPassword(password);
        if (!passwordValida) {
          logger.warn(`Intento de login con contraseña incorrecta para: ${email}`);
          return res.status(401).json({
            success: false,
            message: 'Email o contraseña incorrectos.'
          });
        }

        const token = generarToken(usuario._id, usuario.username);
        logger.info(`Usuario logueado en MongoDB: ${usuario.username}`);

        return res.status(200).json({
          success: true,
          message: 'Sesión iniciada exitosamente.',
          token,
          usuario: usuario.obtenerDatosPublicos()
        });
      } catch (error) {
        logger.error(`Error en login con MongoDB: ${error.message}`);
        return next(error);
      }
    }

    // --- Fallback a almacenamiento en memoria ---
    logger.info('Usando almacenamiento en memoria para login');
    try {
      // Intentar encontrar usuario por email primero, si no por username
      let usuario = usersInMemory.find(u => u.email === email);

      // Si no encontró por email, probar con username
      if (!usuario) {
        usuario = usersInMemory.find(u => u.username === email);
      }

      if (!usuario) {
        logger.warn(`Intento de login con email/username no registrado en memoria: ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Email, nombre de usuario o contraseña incorrectos.'
        });
      }

      const passwordValida = await bcrypt.compare(password, usuario.password);
      if (!passwordValida) {
        logger.warn(`Intento de login con contraseña incorrecta en memoria para: ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Email o contraseña incorrectos.'
        });
      }

      const token = generarToken(usuario._id, usuario.username);
      logger.info(`Usuario logueado en memoria: ${usuario.username}`);

      return res.status(200).json({
        success: true,
        message: 'Sesión iniciada exitosamente (en memoria).',
        token,
        usuario: {
          _id: usuario._id,
          username: usuario.username,
          email: usuario.email,
          avatar: usuario.avatar,
          bio: usuario.bio,
          isPublic: usuario.isPublic,
          createdAt: usuario.createdAt
        }
      });
    } catch (error) {
      logger.error(`Error en login en memoria: ${error.message}`);
      return next(error);
    }
  } catch (error) {
    logger.error(`Error general en login: ${error.message}`);
    console.error('Stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Ocurrió un error en el servidor.'
    });
  }
};

// ========================================================================
// CONTROLADOR PARA OBTENER PERFIL DE USUARIO AUTENTICADO
// ========================================================================

// Función que devuelve la información del perfil del usuario actualmente logueado
// Esta función requiere autenticación previa (middleware de auth)
const obtenerPerfil = async (req, res, next) => {

  // Verificamos si podemos acceder a la base de datos
  if (mongoose.connection.readyState === 1) {
    try {
      const usuario = await User.findById(req.usuario._id);
      if (!usuario) {
        logger.warn(`Usuario no encontrado en MongoDB: ${req.usuario._id}`);
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado.'
        });
      }
      return res.status(200).json({
        success: true,
        usuario: usuario.obtenerDatosPublicos()
      });
    } catch (error) {
      logger.error(`Error en obtenerPerfil con MongoDB: ${error.message}`);
      return next(error);
    }
  }

  // --- Fallback a almacenamiento en memoria ---
  logger.info('Usando almacenamiento en memoria para obtener perfil');
  try {
    const usuario = usersInMemory.find(u => u._id == req.usuario._id);
    if (!usuario) {
      logger.warn(`Usuario no encontrado en memoria: ${req.usuario._id}`);
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }
    return res.status(200).json({
      success: true,
      usuario: {
        _id: usuario._id,
        username: usuario.username,
        email: usuario.email,
        avatar: usuario.avatar,
        bio: usuario.bio,
        isPublic: usuario.isPublic,
        createdAt: usuario.createdAt
      }
    });
  } catch (error) {
    logger.error(`Error en obtenerPerfil en memoria: ${error.message}`);
    return next(error);
  }
};



module.exports = {
  registro,
  login,
  obtenerPerfil
};
