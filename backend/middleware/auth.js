// ========================================================================
// MIDDLEWARE DE AUTENTICACIÓN JWT
// ========================================================================

// Funciones middleware que protegen las rutas verificando tokens JWT
// Se usan para garantizar que solo usuarios autenticados accedan a recursos privados

const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

// ========================================================================
// FUNCIONES middleware
// ========================================================================

/**
 * Middleware obligatorio para verificar el token JWT
 * Todas las rutas protegidas deben pasar por aquí antes de ejecutar el controller
 * Si no hay token o es inválido, bloquea el acceso completamente
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @param {Function} next - Función para continuar al siguiente middleware
 */
const verificarToken = (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      logger.warn('Intento de acceso sin token');
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado. Por favor inicia sesión.'
      });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt_super_seguro');

    // Agregar la información del usuario al request
    req.usuario = decoded;
    logger.info(`Usuario autenticado: ${decoded.username}`);
    next();
  } catch (error) {
    logger.warn(`Error de autenticación: ${error.message}`);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'El token ha expirado. Por favor inicia sesión nuevamente.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Error de autenticación.'
    });
  }
};

/**
 * Middleware para verificar el token JWT de forma opcional
 * Similar a verificarToken pero si no hay token o es inválido,
 * continúa sin usuario autenticado (req.usuario será undefined)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const verificarTokenOpcional = (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      // Si hay token, intentar verificar
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt_super_seguro');
        req.usuario = decoded;
        logger.info(`Usuario autenticado opcionalmente: ${decoded.username}`);
      } catch (error) {
        logger.warn(`Error de autenticación opcional: ${error.message}`);
        // Para middleware opcional, continuar sin usuario si el token es inválido
        req.usuario = null;
      }
    } else {
      // No hay token, continuar sin usuario
      logger.info('Acceso sin token (middleware opcional)');
      req.usuario = null;
    }

    next();
  } catch (error) {
    logger.error(`Error en verificarTokenOpcional: ${error.message}`);
    req.usuario = null;
    next();
  }
};

/**
 * Middleware para verificar que el usuario es propietario del recurso
 * Se usa después de verificarToken
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const verificarPropietario = (req, res, next) => {
  try {
    // Comparar el ID del usuario en el token con el ID del recurso
    if (req.usuario._id !== req.params.userId) {
      logger.warn(`Intento de acceso no autorizado por usuario ${req.usuario._id}`);
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para acceder a este recurso.'
      });
    }
    next();
  } catch (error) {
    logger.error(`Error en verificarPropietario: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error al verificar permisos.'
    });
  }
};

module.exports = {
  verificarToken,
  verificarTokenOpcional,
  verificarPropietario
};
