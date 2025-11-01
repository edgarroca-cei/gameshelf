// ========================================================================
// COMPONENTE DE TARJETA DE JUEGO INDIVIDUAL
// ========================================================================

// Este componente muestra un juego en formato de tarjeta compacta
// Se usa en las grillas de juegos

import { Card, Image, Text, Badge, Group } from '@mantine/core';
import classes from './GameCard.module.css';

/**
 * Componente que muestra información básica de un juego en una tarjeta atractiva
 * Cuando se hace click, abre un modal con detalles completos del juego
 * Muestra imagen, título y estado/calificación del juego
 */
export function GameCard({ game, onClick }) {
  // Manejador de click que pasa el juego completo al componente padre
  const handleClick = () => {
    if (onClick) {
      onClick(game);
    }
  };

  // Función auxiliar que decide el color del badge según el estado del juego
  // Verde para completado, azul para jugando, amarillo para pendiente
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completado':
        return 'green';
      case 'jugando':
        return 'blue';
      case 'pendiente':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getBadgeInfo = () => {
    if (game.rating != null) {
      return { label: `⭐ ${game.rating}`, color: 'yellow' };
    } else if (game.status) {
      return { label: game.status, color: getStatusColor(game.status) };
    }
    return null;
  };

  const badgeInfo = getBadgeInfo();

  return (
    <div
      className={classes.card}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className={classes.imageWrapper}>
        <Image src={game.coverImage} alt={game.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div className={classes.overlay} />
      </div>
      <div className={classes.content}>
        <Text size="md" fw={600} className={classes.title} lineClamp={2}>{game.title}</Text>
        {badgeInfo && (
          <Group gap="xs" mt="xs">
            <Badge variant="light" color={badgeInfo.color} size="sm">{badgeInfo.label}</Badge>
          </Group>
        )}
      </div>
    </div>
  );
}
