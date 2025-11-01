// ========================================================================
// CARRUSEL HERO CON AUTOPLAY
// ========================================================================

// Carrusel que muestra juegos populares con autoplay automático

import React, { useState, useEffect, useRef } from 'react';
import { Title, Button, Stack, Badge, Text, Group, ActionIcon } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconLogin } from '@tabler/icons-react';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth.jsx';
import * as gameService from '../../services/api.service';
import classes from './HeroCarousel.module.css';

export function HeroCarousel({ games = [] }) {
  console.log('HeroCarousel renderizado con', games.length, 'juegos');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savingGame, setSavingGame] = useState(false);
  const autoplayRef = useRef(null);
  const notification = useNotification();
  const { estaAutenticado } = useAuth();

  useEffect(() => {
    if (games.length === 0) return;

    autoplayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % games.length);
    }, 5000);

    return () => clearInterval(autoplayRef.current);
  }, [games.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + games.length) % games.length);
    clearInterval(autoplayRef.current);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % games.length);
    clearInterval(autoplayRef.current);
  };

  const handleMouseEnter = () => {
    clearInterval(autoplayRef.current);
  };

  const handleMouseLeave = () => {
    autoplayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % games.length);
    }, 5000);
  };

  const handleAddToLibrary = async () => {
    try {
      setSavingGame(true);
      const game = games[currentIndex];

      const gameData = {
        title: game.title || game.name,
        platform: 'PC',
        status: 'Pendiente',
      };

      // Add optional fields only if they have valid values
      const coverImage = game.coverImage || game.background_image;
      if (coverImage) {
        gameData.coverImage = coverImage;
      }

      if (typeof game.rating === 'number') {
        gameData.rating = game.rating;
      }

      const genres = game.genres ? game.genres.map(genre => typeof genre === 'string' ? genre : genre.name) : [];
      if (genres.length > 0) {
        gameData.genres = genres;
      }

      if (game.description) {
        gameData.description = game.description;
      }

      await gameService.createGame(gameData);
      notification.success('¡Guardado!', `${game.title || game.name} agregado a tu biblioteca`);
    } catch (err) {
      console.error('Error al agregar juego:', err);
      if (err.response?.status === 401) {
        notification.error('Error de autenticación', 'Debes iniciar sesión para agregar juegos a tu biblioteca');
      } else {
        notification.error('Error', 'No se pudo agregar el juego a tu biblioteca');
      }
    } finally {
      setSavingGame(false);
    }
  };

  if (games.length === 0) {
    console.warn('HeroCarousel: No hay juegos disponibles');
    return null;
  }

  const game = games[currentIndex];

  return (
    <div
      className={classes.carousel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ backgroundImage: `url(${game.coverImage})` }}
    >
      <div className={classes.overlay} />
      <div className={classes.contentWrapper}>
        <div className={classes.content}>
          <Group gap="xs" className={classes.badgeGroup}>
            <Badge variant="filled" color="violet" size="lg">Popular</Badge>
          </Group>
          <Title order={1} className={classes.title}>{game.title}</Title>
          <div className={classes.buttonContainer}>
            {estaAutenticado ? (
              <Button
                size="lg"
                color="violet"
                radius="xl"
                onClick={handleAddToLibrary}
                loading={savingGame}
              >
                Añadir a biblioteca
              </Button>
            ) : (
              <Button
                size="lg"
                color="violet"
                radius="xl"
                onClick={() => notification.info('Iniciar Sesión', 'Debes iniciar sesión para agregar juegos a tu biblioteca')}
              >
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Controles en la esquina inferior izquierda */}
      <div className={classes.bottomLeft}>
        <ActionIcon
          className={classes.navButton}
          onClick={handlePrev}
          size="lg"
          radius="xl"
          variant="filled"
        >
          <IconChevronLeft size={20} />
        </ActionIcon>
        <ActionIcon
          className={classes.navButton}
          onClick={handleNext}
          size="lg"
          radius="xl"
          variant="filled"
        >
          <IconChevronRight size={20} />
        </ActionIcon>
      </div>

      {/* Indicadores de puntos en el centro inferior */}
      <div className={classes.dotsContainer}>
        {games.map((_, index) => (
          <button
            key={index}
            className={`${classes.dot} ${index === currentIndex ? classes.dotActive : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Ir a página ${index + 1}`}
          />
        ))}
      </div>

      {/* Indicador circular y contador en la esquina inferior derecha */}
      <div className={classes.bottomRight}>
        <span className={classes.pageCounter}>
          {currentIndex + 1}/{games.length}
        </span>
        <div className={classes.circularProgress}>
          <svg className={classes.progressSvg} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" className={classes.progressBackground} />
            <circle
              cx="50"
              cy="50"
              r="45"
              className={classes.progressFill}
              style={{
                strokeDasharray: `${(currentIndex + 1) / games.length * 283} 283`
              }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
