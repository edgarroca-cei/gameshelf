// ========================================================================
// CONTROLLER PARA GESTIÓN DE VIDEOJUEGOS
// ========================================================================

// Importamos las librerías que necesitamos para manejar los juegos
const Game = require('../models/game.model'); // Modelo de la base de datos
const axios = require('axios'); // Para llamadas a APIs externas
const logger = require('../config/logger'); // Para registrar eventos

// Almacenamiento temporal cuando no hay conexión a base de datos
let gamesInMemory = [];
let gameIdCounter = 1;

/**
 * Agrega un nuevo juego a la colección del usuario
 * Función principal para el "Create" del CRUD de juegos
 */
const createGame = async (req, res, next) => {
  try {
    // Le agregamos el ID del usuario que está creando el juego
    const gameData = { ...req.body, owner: req.usuario._id };

    // Primero intentamos usar la base de datos real
    try {
      const newGame = await Game.create(gameData);
      res.status(201).json(newGame);
    } catch (mongoError) {
      // Si MongoDB falla, usamos el almacenamiento temporal
      const newGame = {
        _id: gameIdCounter++,
        ...gameData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      gamesInMemory.push(newGame);
      logger.info('Juego guardado temporalmente: ' + newGame.title);
      res.status(201).json(newGame);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene todos los juegos del usuario actual
 * Función para listar la colección completa (Read del CRUD)
 */
const getAllGames = async (req, res, next) => {
  try {
    logger.info('Obteniendo todos los juegos del usuario...');

    // Intenta usar MongoDB con un timeout para no esperar indefinidamente
    try {
      const allGames = await Promise.race([
        Game.find({ owner: req.usuario._id }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('MongoDB timeout')), 5000)
        )
      ]);
      logger.info('Juegos obtenidos de BD: ' + allGames.length);
      res.status(200).json(allGames);
    } catch (mongoError) {
      // Si falla la BD, buscamos en el array en memoria
      const allGames = gamesInMemory.filter(g => g.owner === req.usuario._id);
      logger.info('Usando almacenamiento temporal. Juegos: ' + allGames.length);
      res.status(200).json(allGames);
    }
  } catch (error) {
    logger.error('Error al obtener juegos:', error.message);
    next(error);
  }
};

/**
 * Obtiene los juegos personales del usuario autenticado
 * Versión optimizada de getAllGames específicamente para la biblioteca
 */
const getMyGames = async (req, res, next) => {
  try {
    logger.info('Cargando biblioteca personal del usuario...');

    // Intentamos obtener de la base de datos real
    try {
      const myGames = await Promise.race([
        Game.find({ owner: req.usuario._id }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('MongoDB timeout')), 5000)
        )
      ]);
      logger.info('Biblioteca cargada de BD: ' + myGames.length + ' juegos');
      res.status(200).json(myGames);
    } catch (mongoError) {
      // Fallback a memoria si no hay BD
      const myGames = gamesInMemory.filter(g => g.owner === req.usuario._id);
      logger.info('Usando datos temporales. Biblioteca: ' + myGames.length + ' juegos');
      res.status(200).json(myGames);
    }
  } catch (error) {
    logger.error('Error al cargar biblioteca:', error.message);
    next(error);
  }
};

/**
 * Obtiene un juego específico por su ID
 * Verifica que el usuario tenga permisos para acceder al juego
 */
const getGameById = async (req, res, next) => {
  try {
    logger.info('Buscando juego con ID: ' + req.params.id);

    try {
      const game = await Promise.race([
        Game.findById(req.params.id),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('MongoDB timeout')), 5000)
        )
      ]);
      if (!game) {
        return res.status(404).json({ message: 'Juego no encontrado' });
      }
      // Verificar que el usuario sea el propietario
      if (game.owner.toString() !== req.usuario._id) {
        return res.status(403).json({ message: 'No tienes permiso para ver este juego' });
      }
      res.status(200).json(game);
    } catch (mongoError) {
      // Búsqueda en memoria si falla la BD
      const game = gamesInMemory.find(g => g._id == req.params.id);
      if (!game) {
        return res.status(404).json({ message: 'Juego no encontrado' });
      }
      if (game.owner !== req.usuario._id) {
        return res.status(403).json({ message: 'No tienes permiso para ver este juego' });
      }
      res.status(200).json(game);
    }
  } catch (error) {
    logger.error('Error al buscar juego específico:', error.message);
    next(error);
  }
};

/**
 * Actualiza la información de un juego existente
 * Función "Update" del CRUD - permite cambiar estado, rating, etc.
 */
const updateGameById = async (req, res, next) => {
  try {
    logger.info('Actualizando juego ID: ' + req.params.id);

    try {
      const game = await Promise.race([
        Game.findById(req.params.id),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('MongoDB timeout')), 5000)
        )
      ]);
      if (!game) {
        return res.status(404).json({ message: 'Juego no encontrado' });
      }
      // Solo el propietario puede modificar
      if (game.owner.toString() !== req.usuario._id) {
        return res.status(403).json({ message: 'No tienes permiso para actualizar este juego' });
      }
      const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // Devuelve el documento actualizado
        runValidators: true, // Corre validaciones del schema
      });
      res.status(200).json(updatedGame);
    } catch (mongoError) {
      // Actualización en memoria si no hay BD
      const gameIndex = gamesInMemory.findIndex(g => g._id == req.params.id);
      if (gameIndex === -1) {
        return res.status(404).json({ message: 'Juego no encontrado' });
      }
      const game = gamesInMemory[gameIndex];
      if (game.owner !== req.usuario._id) {
        return res.status(403).json({ message: 'No tienes permiso para actualizar este juego' });
      }
      gamesInMemory[gameIndex] = { ...game, ...req.body, updatedAt: new Date() };
      res.status(200).json(gamesInMemory[gameIndex]);
    }
  } catch (error) {
    logger.error('Error al actualizar juego:', error.message);
    next(error);
  }
};

/**
 * Elimina un juego de la colección del usuario
 * Función "Delete" del CRUD - remueve permanentemente el juego
 */
const deleteGameById = async (req, res, next) => {
  try {
    logger.info('deleteGameById - ID: ' + req.params.id);

    try {
      const game = await Promise.race([
        Game.findById(req.params.id),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('MongoDB timeout')), 5000)
        )
      ]);
      if (!game) {
        return res.status(404).json({ message: 'Juego no encontrado' });
      }
      // Verificar que el usuario sea el propietario
      if (game.owner.toString() !== req.usuario._id) {
        return res.status(403).json({ message: 'No tienes permiso para eliminar este juego' });
      }
      await Game.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Juego eliminado exitosamente' });
    } catch (mongoError) {
      // Si MongoDB no está disponible, usa almacenamiento en memoria
      const gameIndex = gamesInMemory.findIndex(g => g._id == req.params.id);
      if (gameIndex === -1) {
        return res.status(404).json({ message: 'Juego no encontrado' });
      }
      const game = gamesInMemory[gameIndex];
      if (game.owner !== req.usuario._id) {
        return res.status(403).json({ message: 'No tienes permiso para eliminar este juego' });
      }
      gamesInMemory.splice(gameIndex, 1);
      res.status(200).json({ message: 'Juego eliminado exitosamente' });
    }
  } catch (error) {
    logger.error('Error en deleteGameById: ' + error.message);
    next(error);
  }
};

/**
 * Busca juegos en la API externa de RAWG.
 */
const searchGamesRAWG = async (req, res, next) => {
  try {
    const { query } = req.params;
    const apiKey = process.env.RAWG_API_KEY;
    const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${query}`;

    const response = await axios.get(url);

    const simplifiedGames = response.data.results.map(game => ({
      id: game.id,
      name: game.name,
      background_image: game.background_image,
      platforms: game.platforms ? game.platforms.map(p => p.platform.name).join(', ') : 'N/A',
    }));

    res.status(200).json(simplifiedGames);
  } catch (error) {
    logger.error('Error al buscar en la API de RAWG: ' + error.message);
    next(error);
  }
};

/**
 * Obtiene juegos para explorar con configuración personalizable.
 */
const getExploreGames = async (req, res, next) => {
  try {
    const { ordering = '-relevance', pageSize = 20, page = 1 } = req.query;

    const apiKey = process.env.RAWG_API_KEY;
    logger.info(`getExploreGames - Ordering: ${ordering}, PageSize: ${pageSize}, Page: ${page}, API Key: ${apiKey ? 'Presente' : 'No definida'}`);

    // Valida que pageSize no sea demasiado grande para evitar abuso de API
    const maxPageSize = 50;
    const validPageSize = Math.min(parseInt(pageSize) || 20, maxPageSize);
    const validPage = parseInt(page) || 1;

    // Construye la URL con los parámetros
    const url = `https://api.rawg.io/api/games?key=${apiKey}&ordering=${ordering}&page_size=${validPageSize}&page=${validPage}`;

    logger.info('Llamando a RAWG API: ' + url);
    const response = await axios.get(url, {
      timeout: 10000,
      validateStatus: status => status === 200
    });

    logger.info('Respuesta de RAWG recibida. Juegos: ' + response.data.results.length);

    // Filtra juegos para asegurar imagenes válidas y evitar rompediseño
    let filteredResults = response.data.results;
    if (ordering === '-rating') {
      // Filtros estrictos para juegos mejor valorados
      filteredResults = response.data.results.filter(game =>
        (game.rating || 0) >= 3.5 &&
        game.background_image &&
        game.background_image !== '' &&
        game.background_image.startsWith('http') &&
        game.name &&
        game.name.trim() !== '' &&
        (game.metacritic || 0) >= 50
      );
    } else if (ordering === '-released' || ordering === '-metacritic' || ordering === '-relevance') {
      // Filtros mas relajados para juegos recientes (pueden no tener calificaciones altas aún)
      filteredResults = response.data.results.filter(game =>
        game.background_image &&
        game.background_image !== '' &&
        game.background_image.startsWith('http') &&
        game.name &&
        game.name.trim() !== ''
      );

      // Para metacritic asegurarse de que están ordenados por nota descendente
      if (ordering === '-metacritic') {
        filteredResults.sort((a, b) => (b.metacritic || 0) - (a.metacritic || 0));
      }
    }

    logger.info('Juegos filtrados para explorar: ' + filteredResults.length);

    // Procesa la respuesta para simplificar los datos
    const exploreGames = filteredResults.slice(0, validPageSize).map(game => ({
      id: game.id,
      name: game.name,
      background_image: game.background_image || 'https://via.placeholder.com/400x500.png?text=No+Image',
      description: game.description || null,
      rating: game.rating || null,
      genres: game.genres ? game.genres.map(g => g.name) : [],
    }));

    logger.info('Juegos para explorar procesados: ' + exploreGames.length);
    res.status(200).json(exploreGames);
  } catch (error) {
    logger.error('Error al obtener juegos para explorar de RAWG: ' + error.message);
    logger.error('Stack: ' + error.stack);

    // Si falla la API, devuelve datos mock
    const mockGames = [
      {
        id: 3498,
        name: 'Grand Theft Auto V',
        background_image: 'https://media.rawg.io/media/games/20a/20aa03ad8601e7f42a6050e3f51d3f6f.jpg',
        description: 'Grand Theft Auto V is an action-adventure game set in the fictional state of San Andreas.',
        rating: 4.5,
        genres: ['Action', 'Adventure'],
      },
      // ... puedes agregar más juegos mock si es necesario
    ];
    res.status(200).json(mockGames);
  }
};

/**
 * Obtiene los 10 juegos más populares de la semana desde RAWG.
 */
const getPopularGames = async (req, res, next) => {
  try {
    const apiKey = process.env.RAWG_API_KEY;
    logger.info('getPopularGames - API Key: ' + (apiKey ? 'Presente' : 'No definida'));

    // Obtiene juegos populares de la semana, ordenados por relevancia, con un límite de 10.
    // Usa ordering=-relevance para obtener los más jugados/populares, y filtra por alta calidad
    const url = `https://api.rawg.io/api/games?key=${apiKey}&ordering=-relevance&page_size=15`;

    logger.info('Llamando a RAWG API: ' + url);
    const response = await axios.get(url, { timeout: 10000, validateStatus: status => status === 200 });

    logger.info('Respuesta de RAWG recibida. Juegos: ' + response.data.results.length);

    // Filtra juegos con alta calificación y criticismo para asegurar calidad
    const filteredGames = response.data.results.filter(game =>
      (game.rating || 0) >= 4.0 && (game.metacritic || 0) >= 60
    );

    // Procesa la respuesta para simplificar los datos
    const popularGames = filteredGames.slice(0, 10).map(game => ({
      id: game.id,
      name: game.name,
      background_image: game.background_image,
      description: game.description || null,
      rating: game.rating || null,
      genres: game.genres ? game.genres.map(g => g.name) : [],
    }));

    logger.info('Juegos populares procesados: ' + popularGames.length);
    res.status(200).json(popularGames);
  } catch (error) {
    logger.error('Error al obtener juegos populares de RAWG: ' + error.message);
    logger.error('Stack: ' + error.stack);

    // Si falla la API, devuelve datos mock
    const mockGames = [
      {
        id: 3498,
        name: 'Grand Theft Auto V',
        background_image: 'https://media.rawg.io/media/games/20a/20aa03ad8601e7f42a6050e3f51d3f6f.jpg',
        description: 'Grand Theft Auto V is an action-adventure game set in the fictional state of San Andreas.',
        rating: 4.5,
        genres: ['Action', 'Adventure'],
      },
      {
        id: 3328,
        name: 'The Witcher 3: Wild Hunt',
        background_image: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg',
        description: 'As geralt of rivia, a professional monster hunter, you are tasked with tracking down the child of prophecy.',
        rating: 4.6,
        genres: ['RPG', 'Adventure'],
      },
      {
        id: 5286,
        name: 'Tomb Raider',
        background_image: 'https://media.rawg.io/media/games/021/021c4e21a1824d2526f925e2bfe2524a.jpg',
        description: 'Tomb Raider explores the intense and gritty origin story of Lara Croft.',
        rating: 4.3,
        genres: ['Action', 'Adventure'],
      },
      {
        id: 3439,
        name: 'Elden Ring',
        background_image: 'https://media.rawg.io/media/games/511/5118aff5091cb3efb5b85eba00eecf08.jpg',
        description: 'Elden Ring is a collaboration between FromSoftware and George R. R. Martin.',
        rating: 4.5,
        genres: ['RPG', 'Action'],
      },
      {
        id: 5679,
        name: 'Cyberpunk 2077',
        background_image: 'https://media.rawg.io/media/games/b7d/b7d8788585189f11df1f6fa7ae905833.jpg',
        description: 'Cyberpunk 2077 is an action role-playing game set in the dystopian Night City.',
        rating: 4.1,
        genres: ['RPG', 'Action'],
      },
      {
        id: 4291,
        name: 'Counter-Strike: Global Offensive',
        background_image: 'https://media.rawg.io/media/games/b72/b7233d5d5b1e75e86bb860ccc7aeca85.jpg',
        description: 'Counter-Strike: Global Offensive is a competitive first-person shooter.',
        rating: 4.4,
        genres: ['Shooter', 'Action'],
      },
      {
        id: 3612,
        name: 'Hitman 3',
        background_image: 'https://media.rawg.io/media/games/562/562553814bb54e0ad7e1f2f6717f5ba9.jpg',
        description: 'Hitman 3 is a stealth game where you play as Agent 47.',
        rating: 4.2,
        genres: ['Action', 'Adventure'],
      },
      {
        id: 5679,
        name: 'Fortnite',
        background_image: 'https://media.rawg.io/media/games/b72/b7233d5d5b1e75e86bb860ccc7aeca85.jpg',
        description: 'Fortnite is a battle royale game.',
        rating: 4.0,
        genres: ['Shooter', 'Action'],
      },
      {
        id: 3328,
        name: 'League of Legends',
        background_image: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg',
        description: 'League of Legends is a multiplayer online battle arena game.',
        rating: 4.3,
        genres: ['Strategy', 'Action'],
      },
      {
        id: 5286,
        name: 'Valorant',
        background_image: 'https://media.rawg.io/media/games/021/021c4e21a1824d2526f925e2bfe2524a.jpg',
        description: 'Valorant is a tactical first-person shooter.',
        rating: 4.2,
        genres: ['Shooter', 'Action'],
      },
    ];
    res.status(200).json(mockGames);
  }
};

// Exporta todas las funciones del controlador para ser usadas en las rutas
module.exports = {
  createGame,
  getAllGames,
  getMyGames,
  getGameById,
  updateGameById,
  deleteGameById,
  searchGamesRAWG,
  getPopularGames,
  getExploreGames,
  gamesInMemory, // Exportar para pruebas
  gameIdCounter, // Exportar para pruebas
};
