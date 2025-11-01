// ========================================================================
// MIDDLEWARE DE VALIDACIÓN DE DATOS
// ========================================================================

// Funciones que validan y sanitizan los datos de entrada usando Joi
// Evita que se procesen datos mal formateados o peligrosos

const Joi = require('joi');
const logger = require('../config/logger');

/**
 * Esquema de validación para crear un juego (todos los campos requeridos)
 */
const gameCreateSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': 'El título no puede estar vacío',
      'string.max': 'El título no puede exceder 200 caracteres',
      'any.required': 'El título es requerido',
    }),
  platform: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'La plataforma no puede estar vacía',
      'any.required': 'La plataforma es requerida',
    }),
  status: Joi.string()
    .valid('Pendiente', 'Jugando', 'Completado')
    .required()
    .messages({
      'any.only': 'El estado debe ser: Pendiente, Jugando o Completado',
      'any.required': 'El estado es requerido',
    }),
  coverImage: Joi.string()
    .optional()
    .messages({
      'string.uri': 'La URL de la imagen debe ser válida',
    }),
  rating: Joi.number()
    .min(0)
    .max(10)
    .optional()
    .allow(null)
    .messages({
      'number.min': 'La calificación debe ser mayor o igual a 0',
      'number.max': 'La calificación debe ser menor o igual a 10',
    }),
  genres: Joi.array()
    .items(Joi.string())
    .optional()
    .allow(null)
    .messages({
      'array.base': 'Los géneros deben ser un array',
    }),
  description: Joi.string()
    .max(2000)
    .optional()
    .allow(null)
    .messages({
      'string.max': 'La descripción no puede exceder 2000 caracteres',
    }),
  notes: Joi.string()
    .max(1000)
    .optional()
    .allow(null)
    .messages({
      'string.max': 'Las notas no pueden exceder 1000 caracteres',
    }),
});

/**
 * Esquema de validación para actualizar un juego (campos opcionales)
 */
const gameUpdateSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .optional()
    .messages({
      'string.empty': 'El título no puede estar vacío',
      'string.max': 'El título no puede exceder 200 caracteres',
    }),
  platform: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.empty': 'La plataforma no puede estar vacía',
    }),
  status: Joi.string()
    .valid('Pendiente', 'Jugando', 'Completado')
    .optional()
    .messages({
      'any.only': 'El estado debe ser: Pendiente, Jugando o Completado',
    }),
  coverImage: Joi.string()
    .optional()
    .messages({
      'string.uri': 'La URL de la imagen debe ser válida',
    }),
  rating: Joi.number()
    .min(0)
    .max(10)
    .optional()
    .allow(null)
    .messages({
      'number.min': 'La calificación debe ser mayor o igual a 0',
      'number.max': 'La calificación debe ser menor o igual a 10',
    }),
  genres: Joi.array()
    .items(Joi.string())
    .optional()
    .allow(null)
    .messages({
      'array.base': 'Los géneros deben ser un array',
    }),
  description: Joi.string()
    .max(2000)
    .optional()
    .allow(null)
    .messages({
      'string.max': 'La descripción no puede exceder 2000 caracteres',
    }),
  notes: Joi.string()
    .max(1000)
    .optional()
    .allow(null)
    .messages({
      'string.max': 'Las notas no pueden exceder 1000 caracteres',
    }),
});

/**
 * Middleware para validar datos de juego (crear)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const validateGameCreate = (req, res, next) => {
  const { error, value } = gameCreateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map(detail => detail.message);
    logger.warn('Validación fallida: ' + messages.join(', '));
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      errors: messages,
    });
  }

  // Reemplazar req.body con los datos validados
  req.body = value;
  next();
};

/**
 * Middleware para validar datos de juego (actualizar)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const validateGameUpdate = (req, res, next) => {
  const { error, value } = gameUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map(detail => detail.message);
    logger.warn('Validación fallida: ' + messages.join(', '));
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      errors: messages,
    });
  }

  // Reemplazar req.body con los datos validados
  req.body = value;
  next();
};

/**
 * Alias para compatibilidad hacia atrás
 */
const validateGame = validateGameCreate;

/**
 * Esquema de validación para búsqueda
 */
const searchSchema = Joi.object({
  query: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'La búsqueda no puede estar vacía',
      'any.required': 'Se requiere un término de búsqueda',
    }),
});

/**
 * Middleware para validar parámetros de búsqueda
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const validateSearch = (req, res, next) => {
  const { error } = searchSchema.validate({ query: req.params.query });

  if (error) {
    logger.warn('Búsqueda inválida: ' + error.message);
    return res.status(400).json({
      success: false,
      message: 'Término de búsqueda inválido',
      error: error.message,
    });
  }

  next();
};

/**
 * Esquema de validación para registro de usuario
 */
const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'El nombre de usuario solo puede contener letras y números',
      'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
      'string.max': 'El nombre de usuario no puede exceder 30 caracteres',
      'any.required': 'El nombre de usuario es requerido',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Por favor ingresa un email válido',
      'any.required': 'El email es requerido',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es requerida',
    }),
  passwordConfirm: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Las contraseñas no coinciden',
      'any.required': 'Debes confirmar la contraseña',
    }),
});

/**
 * Middleware para validar datos de registro
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const validateRegister = (req, res, next) => {
  const { error, value } = registerSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map(detail => detail.message);
    logger.warn('Validación de registro fallida: ' + messages.join(', '));
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      errors: messages,
    });
  }

  req.body = value;
  next();
};

/**
 * Esquema de validación para login
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .required()
    .messages({
      'any.required': 'El usuario o email es requerido',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'La contraseña es requerida',
    }),
}).unknown(true); // Permitir campos adicionales para compatibilidad

/**
 * Middleware para validar datos de login
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const validateLogin = (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map(detail => detail.message);
    logger.warn('Validación de login fallida: ' + messages.join(', '));
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos',
      errors: messages,
    });
  }

  req.body = value;
  next();
};



module.exports = {
  validateGame,
  validateGameCreate,
  validateGameUpdate,
  validateSearch,
  validateRegister,
  validateLogin,
};
