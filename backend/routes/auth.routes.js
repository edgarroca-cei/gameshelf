// ========================================================================
// RUTAS DE AUTENTICACIÓN Y PERFILES
// ========================================================================

// Archivo que define todos los endpoints relacionados con usuarios
// Registro, login y gestión de perfiles

const express = require('express');
const router = express.Router();
const {
  registro,
  login,
  obtenerPerfil
} = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

/**
 * POST /auth/register
 * Registra un nuevo usuario
 * Body: { username, email, password, passwordConfirm }
 */
router.post('/register', validateRegister, registro);

/**
 * POST /auth/login
 * Inicia sesión de un usuario
 * Body: { email, password }
 */
router.post('/login', validateLogin, login);

/**
 * GET /auth/me
 * Obtiene el perfil del usuario autenticado
 * Headers: Authorization: Bearer <token>
 */
router.get('/me', verificarToken, obtenerPerfil);



module.exports = router;
