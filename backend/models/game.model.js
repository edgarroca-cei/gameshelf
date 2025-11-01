// ========================================================================
// MODELO DE JUEGO PARA GAMESHELF
// ========================================================================

// Importamos Mongoose para definir el schema de la base de datos
const mongoose = require('mongoose');

// ========================================================================
// DEFINICIÓN DEL SCHEMA DEL JUEGO
// ========================================================================

// Schema que define cómo se almacena un juego en la base de datos
const gameSchema = new mongoose.Schema({
  // ID del usuario propietario del juego (relación con User)
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referencia al modelo User
    required: [true, 'Necesitamos saber quién es el propietario del juego']
  },

  // Título del juego (único en todo el sistema)
  title: {
    type: String,
    required: [true, 'El título del juego es obligatorio'],
    unique: [true, 'Ya existe un juego con este título']
  },

  // Plataforma donde se juega (PC, PS5, Xbox, etc.)
  platform: {
    type: String,
    required: [true, 'La plataforma es obligatoria']
  },

  // Estado actual del juego en la biblioteca (Pendiente, Jugando, Completado)
  status: {
    type: String,
    required: [true, 'El estado del juego es obligatorio'],
    enum: ['Pendiente', 'Jugando', 'Completado'] // Solo estos valores permitidos
  },

  // URL de la imagen de portada del juego
  coverImage: {
    type: String,
    trim: true // Elimina espacios innecesarios
  },

  // Puntuación personal del usuario (0-10)
  rating: {
    type: Number,
    min: 0, // Mínimo 0
    max: 10 // Máximo 10
  },

  // Lista de géneros del juego (acción, RPG, aventura, etc.)
  genres: {
    type: [String], // Array de strings
    default: [] // Si no se especifican, queda vacío
  },

  // Descripción adicional del juego
  description: {
    type: String,
    trim: true // Elimina espacios al inicio y final
  }
}, {
  // Agrega automáticamente campos createdAt y updatedAt
  timestamps: true
});

// ========================================================================
// CREACIÓN Y EXPORTACIÓN DEL MODELO
// ========================================================================

// Crear el modelo Game basado en el schema definido
const Game = mongoose.model('Game', gameSchema);
// Exportar para usar en controllers y otros archivos
module.exports = Game;
