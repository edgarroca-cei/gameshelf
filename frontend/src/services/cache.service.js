// ========================================================================
// SISTEMA DE CACHE PARA OPTIMIZAR LLAMADAS A LA API
// ========================================================================

// Servicio que guarda temporalmente datos de la API para reducir requests
// Mejora rendimiento y reduce carga en el servidor

/**
 * Duraciones de expiración del caché según el tipo de dato
 * Datos más frecuentemente usados duran más tiempo en memoria
 */
const CACHE_DURATIONS = {
  default: 1000 * 60 * 60,        // 1 hora estándar
  popularGames: 1000 * 60 * 60 * 4, // 4 horas (juegos populares cambian menos)
  search: 1000 * 60 * 30,         // 30 minutos (búsquedas pueden variar más)
  allGames: 1000 * 60 * 60 * 2,   // 2 horas (biblioteca completa)
};

// Almacenamiento en memoria usando Map (clave-valor eficiente)
const cache = new Map();

/**
 * Obtiene datos del caché si existen y no han expirado
 */
export const getCachedData = (key) => {
  const cached = cache.get(key);

  if (!cached) {
    return null;
  }

  // Determina la duración del caché según el tipo de clave
  let duration = CACHE_DURATIONS.default;
  if (key === 'popularGames') {
    duration = CACHE_DURATIONS.popularGames;
  } else if (key === 'allGames') {
    duration = CACHE_DURATIONS.allGames;
  } else if (key.startsWith('search_')) {
    duration = CACHE_DURATIONS.search;
  }

  const now = Date.now();
  const isExpired = now - cached.timestamp > duration;

  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return cached.data;
};

/**
 * Guarda datos en el caché con timestamp
 */
export const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

/**
 * Limpia el caché completamente
 */
export const clearCache = () => {
  cache.clear();
};

/**
 * Limpia una entrada específica del caché
 */
export const clearCacheEntry = (key) => {
  cache.delete(key);
};

/**
 * Obtiene el estado del caché (para debugging)
 */
export const getCacheStatus = () => {
  const entries = Array.from(cache.entries()).map(([key, value]) => ({
    key,
    age: Date.now() - value.timestamp,
    size: JSON.stringify(value.data).length,
  }));
  return entries;
};
