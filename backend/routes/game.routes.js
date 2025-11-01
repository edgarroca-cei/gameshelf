// ========================================================================
// RUTAS PARA GESTIÓN DE VIDEOJUEGOS
// ========================================================================

// Archivo que define todos los endpoints para la gestión de juegos
// Incluye CRUD completo más funciones de búsqueda y exploración

const express = require('express');
const router = express.Router();

// Importa las funciones del controlador de juegos
const {
  createGame,
  getAllGames,
  getMyGames,
  getGameById,
  updateGameById,
  deleteGameById,
  searchGamesRAWG,
  getPopularGames,
  getExploreGames
} = require('../controllers/game.controller');

// Importa middleware de validación de datos
const { validateGameCreate, validateGameUpdate, validateSearch } = require('../middleware/validation');

// Importa middleware de autenticación requerido para operaciones privadas
const { verificarToken } = require('../middleware/auth');

// Define las rutas para el CRUD de videojuegos y las asocia con sus respectivos controladores

// Ruta para obtener los juegos populares
// GET /api/games/popular
router.get('/popular', getPopularGames);

// Ruta para explorar juegos con filtros
// GET /api/games/explore
router.get('/explore', getExploreGames);

// Ruta para buscar juegos en la API de RAWG
// GET /api/games/search/:query
router.get('/search/:query', validateSearch, searchGamesRAWG);

// Ruta para crear un nuevo juego
// POST /api/games
router.post('/', verificarToken, validateGameCreate, createGame);

// Ruta para obtener todos los juegos
// GET /api/games
router.get('/', verificarToken, getAllGames);

// Ruta para obtener los juegos del usuario autenticado
// GET /api/games/my
router.get('/my', verificarToken, getMyGames);

// Ruta para obtener un juego específico por su ID
// GET /api/games/:id
router.get('/:id', verificarToken, getGameById);

// Ruta para actualizar un juego específico por su ID
// PUT /api/games/:id
router.put('/:id', verificarToken, validateGameUpdate, updateGameById);

// Ruta para eliminar un juego específico por su ID
// DELETE /api/games/:id
router.delete('/:id', verificarToken, deleteGameById);

// Exporta el router para que pueda ser utilizado en el archivo principal del servidor
module.exports = router;
