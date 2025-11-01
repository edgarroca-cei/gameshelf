// ========================================================================
// PÁGINA PRINCIPAL - LISTADO DE JUEGOS DEL USUARIO
// ========================================================================

// Importamos las librerías necesarias de React y React Router
import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
// Componentes propios de la aplicación
import { HeroCarousel } from '../../components/HeroCarousel/HeroCarousel';
import { GameRow } from '../../components/GameRow/GameRow';
import { GameDetailModal } from '../../components/GameDetailModal/GameDetailModal';
import { UserInfoHub } from '../../components/UserInfoHub/UserInfoHub';
// Servicios para llamadas a la API
import * as gameService from '../../services/api.service';
// Componentes de UI de Mantine
import { Loader, Center, Text, Group, Button, Title } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
// Hook personalizado para mostrar notificaciones
import { useNotification } from '../../hooks/useNotification';
// Estilos de la página
import classes from './GameListPage.module.css';

// ========================================================================
// COMPONENTE PRINCIPAL DE LA PÁGINA
// ========================================================================

// Página principal que muestra la biblioteca del usuario con carrusel, stats y juegos organizados
function GameListPage() {
  // Hooks para navegación y notificaciones
  const navigate = useNavigate();
  const notification = useNotification();

  // Handler para cuando el usuario hace click en las estadísticas móviles
  const handleStatClick = (filter) => {
    navigate(`/my-library?filter=${filter}`);
  };

  // Obtiene el contexto del layout (juego seleccionado desde el header)
  const { selectedSearchGame, onGameProcessed } = useOutletContext() || {};

  // ========================================================================
  // ESTADOS DEL COMPONENTE
  // ========================================================================

  // Estado para los juegos del usuario
  const [myGames, setMyGames] = useState([]);
  // Estado para juegos populares del carrusel
  const [popularGames, setPopularGames] = useState([]);
  // Estado de carga inicial
  const [loading, setLoading] = useState(true);
  // Estado para errores
  const [error, setError] = useState(null);
  // Juego seleccionado para mostrar en el modal
  const [selectedGame, setSelectedGame] = useState(null);
  // Controla si el modal está abierto
  const [modalOpened, setModalOpened] = useState(false);
  // Indica si se está guardando un juego (para mostrar loading)
  const [savingGame, setSavingGame] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [myGamesResponse, popularGamesResponse] = await Promise.all([
          gameService.getMyGames(),
          gameService.getPopularGames(),
        ]);

        setMyGames(myGamesResponse.data || []);

        // Normaliza los datos de juegos populares para que coincidan con la estructura de la app
        const popularGamesData = Array.isArray(popularGamesResponse.data)
          ? popularGamesResponse.data
          : popularGamesResponse.data?.results || [];

        const normalizedPopularGames = popularGamesData.map(game => ({
          ...game, // Conserva todas las propiedades originales
          title: game.name, // Renombra 'name' a 'title'
          coverImage: game.background_image, // Renombra 'background_image' a 'coverImage'
        }));

        setPopularGames(normalizedPopularGames);
      } catch (err) {

        setError('No se pudieron cargar los datos. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Maneja cuando se selecciona un juego desde la búsqueda
  useEffect(() => {
    if (selectedSearchGame) {
      console.log('GameListPage: Juego seleccionado recibido:', selectedSearchGame);
      setSelectedGame(selectedSearchGame);
      setModalOpened(true);
      // Llama al callback para resetear el juego en el App
      if (onGameProcessed) {
        onGameProcessed();
      }
    }
  }, [selectedSearchGame, onGameProcessed]);

  if (loading) {
    return <Center style={{ height: '80vh' }}><Loader color="violet" /></Center>;
  }

  if (error) {
    return <Center style={{ height: '80vh' }}><Text color="red">{error}</Text></Center>;
  }

  // Manejadores de eventos del modal
  const handleGameClick = (game) => {
    setSelectedGame(game);
    setModalOpened(true);
  };

  // Manejador para cuando se selecciona un juego desde la búsqueda
  const handleSearchGameSelect = (game) => {
    handleGameClick(game);
  };

  const handleStatusChange = async (gameId, newStatus) => {
    try {
      console.log('Actualizando estado:', gameId, newStatus);
      const response = await gameService.updateGame(gameId, { status: newStatus });
      console.log('Respuesta de actualización:', response);
      setMyGames(myGames.map(g => g._id === gameId ? { ...g, status: newStatus } : g));
      setSelectedGame({ ...selectedGame, status: newStatus });
      notification.success('Éxito', 'Estado del juego actualizado');
      } catch (err) {
        setError('No se pudieron cargar los datos. Inténtalo de nuevo más tarde.');
      }
  };

  const handleDeleteGame = async (gameId) => {
    try {
      await gameService.deleteGame(gameId);
      setMyGames(myGames.filter(g => g._id !== gameId));
      setModalOpened(false);
      notification.success('Éxito', 'Juego eliminado de tu colección');
    } catch (err) {
      notification.error('Error', 'No se pudo eliminar el juego');
    }
  };

  const handleAddToLibrary = async (game, status) => {
    try {
      setSavingGame(true);

      // Filtrar campos nulos o indefinidos para evitar problemas de validación
      const gameData = {
        title: game.title || game.name,
        platform: 'PC',
        status: status,
        coverImage: game.coverImage || game.background_image,
        ...(game.rating !== null && game.rating !== undefined && { rating: game.rating }),
        ...(game.genres && game.genres.length > 0 && { genres: game.genres }),
        ...(game.description !== null && game.description !== undefined && { description: game.description }),
      };

      // Crea el juego en la biblioteca
      const response = await gameService.createGame(gameData);

      // Agrega el juego a la lista local
      setMyGames([...myGames, response.data]);

      // Cierra el modal
      setModalOpened(false);

      // Muestra notificación de éxito
      const statusLabel = status === 'Pendiente' ? 'Por Jugar' : status;
      notification.success('¡Guardado!', `${game.title || game.name} agregado como "${statusLabel}"`);
    } catch (err) {
      console.error('Error al agregar juego:', err);
      notification.error('Error', 'No se pudo agregar el juego a tu biblioteca');
    } finally {
      setSavingGame(false);
    }
  };

  // Filtra los juegos de la biblioteca del usuario
  const juegosEnCurso = myGames.filter(g => g.status === 'Jugando');
  const juegosPendientes = myGames.filter(g => g.status === 'Pendiente');
  const juegosCompletados = myGames.filter(g => g.status === 'Completado');

  // Estadísticas del usuario
  const stats = {
    total: myGames.length,
    jugando: juegosEnCurso.length,
    completados: juegosCompletados.length,
    pendientes: juegosPendientes.length,
  };

  return (
    <div className={classes.pageContainer}>
      {/* Layout de 3 cápsulas */}
      <div className={classes.mainLayout}>
        {/* Cápsula izquierda grande - Carrusel y Biblioteca */}
        <div className={classes.leftCapsule}>
          {/* Carrusel */}
          <div className={classes.carouselSection}>
            <HeroCarousel games={popularGames} />
          </div>

          {/* Estadísticas para móviles */}
          <div className={classes.mobileStatsGrid}>
            {/* Total */}
            <div
              className={classes.mobileStatsCard}
              style={{ '--card-color': '#3b82f6', cursor: 'pointer', transition: 'opacity 0.2s' }}
              onClick={() => handleStatClick('all')}
            >
              <div className={classes.mobileStatsCardInner}>
                <div className={classes.mobileCardGradient}></div>
                <div className={classes.mobileStatContent}>
                  <p className={classes.mobileStatLabel}>Total</p>
                  <p className={classes.mobileStatValue}>{stats.total}</p>
                </div>
              </div>
            </div>

            {/* Jugando */}
            <div
              className={classes.mobileStatsCard}
              style={{ '--card-color': '#f59e0b', cursor: 'pointer', transition: 'opacity 0.2s' }}
              onClick={() => handleStatClick('Jugando')}
            >
              <div className={classes.mobileStatsCardInner}>
                <div className={classes.mobileCardGradient}></div>
                <div className={classes.mobileStatContent}>
                  <p className={classes.mobileStatLabel}>Jugando</p>
                  <p className={classes.mobileStatValue}>{stats.jugando}</p>
                </div>
              </div>
            </div>

            {/* Completados */}
            <div
              className={classes.mobileStatsCard}
              style={{ '--card-color': '#10b981', cursor: 'pointer', transition: 'opacity 0.2s' }}
              onClick={() => handleStatClick('Completado')}
            >
              <div className={classes.mobileStatsCardInner}>
                <div className={classes.mobileCardGradient}></div>
                <div className={classes.mobileStatContent}>
                  <p className={classes.mobileStatLabel}>Completados</p>
                  <p className={classes.mobileStatValue}>{stats.completados}</p>
                </div>
              </div>
            </div>

            {/* Pendientes */}
            <div
              className={classes.mobileStatsCard}
              style={{ '--card-color': '#8b5cf6', cursor: 'pointer', transition: 'opacity 0.2s' }}
              onClick={() => handleStatClick('Pendiente')}
            >
              <div className={classes.mobileStatsCardInner}>
                <div className={classes.mobileCardGradient}></div>
                <div className={classes.mobileStatContent}>
                  <p className={classes.mobileStatLabel}>Pendientes</p>
                  <p className={classes.mobileStatValue}>{stats.pendientes}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección Mi Biblioteca y Filas */}
          <div className={classes.libraryRows}>
            <GameRow title="Mi biblioteca" games={myGames.slice(0, 10)} onGameClick={handleGameClick} showSeeAllButton />
            <GameRow title="En curso" games={juegosEnCurso} onGameClick={handleGameClick} />
            <GameRow title="Pendientes" games={juegosPendientes} onGameClick={handleGameClick} />
            <GameRow title="Completados" games={juegosCompletados} onGameClick={handleGameClick} />
          </div>
        </div>

        {/* Cápsula derecha - Hub de información */}
        <div className={classes.rightCapsule}>
          <UserInfoHub stats={stats} />
        </div>
      </div>

      {/* Modal de detalles del juego */}
      <GameDetailModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        game={selectedGame}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteGame}
        onAddToLibrary={handleAddToLibrary}
        savingGame={savingGame}
      />
    </div>
  );
}

export default GameListPage;
