// ========================================================================
// CONFIGURACIÓN DE LOGGING CON WINSTON
// ========================================================================

// Configuración centralizada para logs de la aplicación
// Permite registrar eventos, errores y debugging en archivos y consola

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// ========================================================================
// CONFIGURACIÓN INICIAL
// ========================================================================

// Crear directorio de logs si no existe (evita errores de escritura)
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ========================================================================
// FORMATO PERSONALIZADO PARA LOGS
// ========================================================================

// Definir cómo se van a formatear los mensajes de log
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Crear logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'gameshelf-api' },
  transports: [
    // Archivo para todos los logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Archivo solo para errores
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Agregar console en desarrollo
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    })
  );
}

module.exports = logger;
