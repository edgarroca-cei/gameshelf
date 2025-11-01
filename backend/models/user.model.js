// ========================================================================
// MODELO DE USUARIO PARA GAMESHELF
// ========================================================================

// Librerías necesarias para el modelo
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ========================================================================
// DEFINICIÓN DEL SCHEMA DEL USUARIO
// ========================================================================

// Schema que define la estructura de un usuario en la base de datos
const userSchema = new mongoose.Schema({
  // Nombre de usuario único (lo que usan para identificarse)
  username: {
    type: String,
    required: [true, 'El nombre de usuario es obligatorio'],
    unique: [true, 'Ese nombre de usuario ya está registrado'],
    trim: true, // Elimina espacios al inicio y final
    minlength: [3, 'Mínimo 3 caracteres para el nombre de usuario'],
    maxlength: [30, 'Máximo 30 caracteres para el nombre de usuario'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Solo letras, números, guiones y guiones bajos']
  },

  // Email único y validado
  email: {
    type: String,
    required: [true, 'El email es obligatorio para registrarse'],
    unique: [true, 'Este email ya está registrado en el sistema'],
    lowercase: true, // Convierte a minúsculas automáticamente
    trim: true, // Elimina espacios
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Formato de email inválido']
  },

  // Contraseña hasheada (nunca se guarda en texto plano)
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No incluye la contraseña en queries normales por seguridad
  },

  // URL de la imagen de perfil (opcional)
  avatar: {
    type: String,
    default: null
  },

  // Biografía del usuario (opcional)
  bio: {
    type: String,
    maxlength: [500, 'La biografía no puede ser más larga de 500 caracteres'],
    default: ''
  },

  // Si el perfil es público o privado
  isPublic: {
    type: Boolean,
    default: true // Por defecto los perfiles son públicos
  }
}, {
  // Agrega automáticamente campos createdAt y updatedAt
  timestamps: true
});

// ========================================================================
// MIDDLEWARE PARA HASHEAR CONTRASEÑAS
// ========================================================================

// Middleware que se ejecuta antes de guardar un usuario
// Automáticamente hashea la contraseña si ha sido modificada
userSchema.pre('save', async function(next) {
  // Si la contraseña no cambió, continuar normalmente
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generar salt y hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ========================================================================
// MÉTODOS DE INSTANCIA DEL USUARIO
// ========================================================================

// Método para verificar si una contraseña ingresa coincide con la guardada
userSchema.methods.compararPassword = async function(passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

// Método que devuelve solo los datos públicos del usuario
// Útil para no exponer información sensible como la contraseña
userSchema.methods.obtenerDatosPublicos = function() {
  return {
    _id: this._id,
    username: this.username,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    isPublic: this.isPublic,
    createdAt: this.createdAt
  };
};

// ========================================================================
// CREACIÓN Y EXPORTACIÓN DEL MODELO
// ========================================================================

// Crear el modelo User basado en el schema definido
const User = mongoose.model('User', userSchema);
// Exportar el modelo para usarlo en otras partes de la aplicación
module.exports = User;
