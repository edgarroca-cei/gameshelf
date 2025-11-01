// ========================================================================
// PÁGINA DE EXPLORACIÓN
// ========================================================================

// Página para explorar, filtrar y descubrir juegos con carga paginada

import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  SimpleGrid,
  Card,
  Text,
  Button,
  Loader,
  Center,
  Alert,
  Group,
  Stack
} from '@mantine/core';
import { IconAlertCircle, IconPlus, IconFilter } from '@tabler/icons-react';
import { GameCard } from '../../components/GameCard/GameCard';
import { GameDetailModal } from '../../components/GameDetailModal/GameDetailModal';
import * as gameService from '../../services/api.service';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth.jsx';
import styles from './ExplorePage.module.css';
import { clearCache } from '../../services/cache.service';

/**
 * Componente ExplorePage
 */
const ExplorePage = () => {
  const notification = useNotification();
  const { estaAutenticado } = useAuth();

  // Obtener contexto para manejar juegos seleccionados desde búsqueda
  const { selectedSearchGame, onGameProcessed } = useOutletContext() || {};

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filtros
  const [ordering, setOrdering] = useState('-relevance'); // -relevance, -metacritic
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

  // Estado del modal (para agregar juegos desde aquí si es necesario)
  const [selectedGame, setSelectedGame] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [savingGame, setSavingGame] = useState(false);

  // Cargar juegos iniciales cuando cambia el ordering
  useEffect(() => {
    clearCache(); // Limpia el caché al cambiar el filtro
    loadGames(true); // Reset a primera página
  }, [ordering]);

  // Maneja cuando se selecciona un juego desde la búsqueda
  useEffect(() => {
    if (selectedSearchGame) {
      console.log('ExplorePage: Juego seleccionado recibido:', selectedSearchGame);
      setSelectedGame(selectedSearchGame);
      setModalOpened(true);
      // Llama al callback para resetear el juego en el App
      if (onGameProcessed) {
        onGameProcessed();
      }
    }
  }, [selectedSearchGame, onGameProcessed]);

  const loadGames = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setGames([]);
        setCurrentPage(1);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const pageToLoad = reset ? 1 : currentPage + 1;

      console.log('Cargando juegos con orden:', ordering, 'página:', pageToLoad);
      const response = await gameService.getExploreGames(ordering, pageSize, pageToLoad);

      // Normalizar los datos de juegos
      const normalizedGames = response.data.map(game => ({
        ...game,
        title: game.name,
        coverImage: game.background_image,
        // Conserva description, rating, genres
      }));

      console.log('Juegos cargados:', normalizedGames.length);

      if (reset) {
        setGames(normalizedGames);
        setCurrentPage(1);
      } else {
        setGames(prev => [...prev, ...normalizedGames]);
        setCurrentPage(pageToLoad);
      }

      // Si recibió menos juegos que pageSize, no hay más
      setHasMore(normalizedGames.length === pageSize);
    } catch (err) {
      console.error('Error al cargar juegos:', err);
      setError('No se pudieron cargar los juegos. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleGameClick = (game) => {
    setSelectedGame(game);
    setModalOpened(true);
  };

  const handleAddToLibrary = async (game, status = 'Pendiente') => {
    if (!estaAutenticado) {
      notification.error('Error', 'Debes iniciar sesión para agregar juegos');
      return;
    }

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

      console.log('Agregando a biblioteca:', gameData);
      await gameService.createGame(gameData);
      notification.success('¡Guardado!', `${game.title || game.name} agregado a tu biblioteca`);
      setModalOpened(false);
    } catch (err) {
      console.error('Error al agregar juego:', err);
      notification.error('Error', 'No se pudo agregar el juego a tu biblioteca');
    } finally {
      setSavingGame(false);
    }
  };

  const handleStatusChange = async (gameId, newStatus) => {
    // Para explorar, los juegos pueden no estar en la biblioteca del usuario, por lo que esto puede no aplicarse
    // Pero lo mantenemos por compatibilidad
    try {
      console.log('Actualizando estado en explorar:', gameId, newStatus);
      await gameService.updateGame(gameId, { status: newStatus });
      notification.success('Éxito', 'Estado del juego actualizado');
      // Actualizar juego local si es un juego del usuario, pero explorar provienen de la API
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      notification.error('Error', err.response?.data?.message || 'No se pudo actualizar el estado del juego');
    }
  };

  const handleDeleteGame = async (gameId) => {
    // Similar note
    try {
      await gameService.deleteGame(gameId);
      notification.success('Éxito', 'Juego eliminado de tu colección');
      setModalOpened(false);
    } catch (err) {
      notification.error('Error', 'No se pudo eliminar el juego');
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadGames(false);
    }
  };

  if (loading) {
    return (
      <Center style={{ height: '400px' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.mainLayout}>
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            mb="lg"
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Capsula izquierda - Contenido */}
        <div className={styles.leftCapsule}>
          {games.length === 0 ? (
            <Card withBorder={false} p="lg" radius="md" className={styles.filtersCard}>
              <Text c="dimmed" style={{ color: '#ffffff' }} align="center">
                No se encontraron juegos
              </Text>
            </Card>
          ) : (
            <>
              <SimpleGrid cols={{ base: 2, sm: 3, md: 3, lg: 3 }} spacing="xl">
                {games.map(game => (
                  <div key={`${game.id}-${ordering}`} className={styles.gameItem}>
                    <GameCard game={game} onClick={handleGameClick} />
                  </div>
                ))}
              </SimpleGrid>

              {/* Botón Cargar Más */}
              <Center mt="xl">
                <Button
                  size="lg"
                  className={styles.loadMoreButton}
                  onClick={loadMore}
                  loading={loadingMore}
                  disabled={!hasMore}
                  leftSection={<IconPlus size={16} />}
                >
                  {hasMore ? 'Cargar más' : 'No hay más juegos'}
                </Button>
              </Center>
            </>
          )}
        </div>

        {/* Capsula derecha - Filtros */}
        <div className={styles.rightCapsule}>
          <div>
            <Text fw={600} mb="md" color="#ffffff">Filtrar juegos</Text>
            <Stack gap="sm">
              <Button
                variant={ordering === '-relevance' ? 'filled' : 'outline'}
                color="violet"
                onClick={() => setOrdering('-relevance')}
                size="sm"
                fullWidth
                radius="xl"
                styles={{
                  root: {
                    backgroundColor: ordering === '-relevance' ? 'rgba(138, 43, 226, 0.8)' : 'transparent',
                    border: '1px solid rgba(138, 43, 226, 0.5)',
                    color: '#ffffff',
                    transition: 'all 0.2s ease',
                  }
                }}
              >
                Más populares
              </Button>
              <Button
                variant={ordering === '-metacritic' ? 'filled' : 'outline'}
                color="violet"
                onClick={() => setOrdering('-metacritic')}
                size="sm"
                fullWidth
                radius="xl"
                styles={{
                  root: {
                    backgroundColor: ordering === '-metacritic' ? 'rgba(138, 43, 226, 0.8)' : 'transparent',
                    border: '1px solid rgba(138, 43, 226, 0.5)',
                    color: '#ffffff',
                    transition: 'all 0.2s ease',
                  }
                }}
              >
                Mejor evaluados
              </Button>

            </Stack>
          </div>
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
};

export default ExplorePage;
