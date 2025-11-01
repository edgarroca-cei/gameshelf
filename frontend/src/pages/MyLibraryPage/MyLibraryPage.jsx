// ========================================================================
// PÁGINA DE MI BIBLIOTECA
// ========================================================================

// Página principal que muestra todos los juegos guardados del usuario

import { useEffect, useState } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import {
  SimpleGrid,
  Button,
  Loader,
  Center,
  Alert,
  Group,
  Stack,
  Text,
  Select
} from '@mantine/core';
import { IconAlertCircle, IconPlus, IconFilter } from '@tabler/icons-react';
import { GameCard } from '../../components/GameCard/GameCard';
import { GameDetailModal } from '../../components/GameDetailModal/GameDetailModal';
import * as gameService from '../../services/api.service';
import { useNotification } from '../../hooks/useNotification';
import classes from './MyLibraryPage.module.css';

/**
 * Página MyLibraryPage
 * Muestra todos los juegos guardados por el usuario con filtros
 */
const MyLibraryPage = () => {
  const notification = useNotification();
  const [searchParams] = useSearchParams();

  // Obtener contexto para manejar juegos seleccionados desde búsqueda
  const { selectedSearchGame, onGameProcessed } = useOutletContext() || {};

  const [allGames, setAllGames] = useState([]); // Todos los juegos
  const [games, setGames] = useState([]); // Juegos filtrados para mostrar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros - leer del URL o usar 'all' por defecto
  const filterParam = searchParams.get('filter');
  const validFilters = ['all', 'Pendiente', 'Jugando', 'Completado'];
  const initialFilter = validFilters.includes(filterParam) ? filterParam : 'all';
  const [statusFilter, setStatusFilter] = useState(initialFilter);

  // Estado del modal
  const [selectedGame, setSelectedGame] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [savingGame, setSavingGame] = useState(false);

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Maneja cuando se selecciona un juego desde la búsqueda
  useEffect(() => {
    if (selectedSearchGame) {
      console.log('MyLibraryPage: Juego seleccionado recibido:', selectedSearchGame);
      setSelectedGame(selectedSearchGame);
      setModalOpened(true);
      // Llama al callback para resetear el juego en el App
      if (onGameProcessed) {
        onGameProcessed();
      }
    }
  }, [selectedSearchGame, onGameProcessed]);

  // Cargar juegos
  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);

      const response = await gameService.getMyGames();
      console.log('Juegos cargados:', response.data.length);

      const gamesData = response.data || [];
      setAllGames(gamesData);

      // Aplicar filtro inicial
      applyFilter(gamesData, statusFilter);
    } catch (err) {
      console.error('Error al cargar juegos:', err);
      setError('No se pudieron cargar tus juegos. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (gameList, filter) => {
    if (filter === 'all') {
      setGames(gameList);
    } else {
      const filteredGames = gameList.filter(game => game.status === filter);
      setGames(filteredGames);
    }
  };

  // Efecto para aplicar filtros cuando cambian
  useEffect(() => {
    applyFilter(allGames, statusFilter);
  }, [statusFilter, allGames]);

  const handleGameClick = (game) => {
    setSelectedGame(game);
    setModalOpened(true);
  };

  const handleAddToLibrary = async (game, status = 'Pendiente') => {
    // Esto no debería suceder normalmente en MyLibraryPage, pero incluido por compatibilidad
    if (!game) return;

    try {
      setSavingGame(true);

      const gameData = {
        title: game.title || game.name,
        platform: 'PC',
        status: status,
        coverImage: game.coverImage || game.background_image,
        ...(game.rating !== null && game.rating !== undefined && { rating: game.rating }),
        ...(game.genres && game.genres.length > 0 && { genres: game.genres }),
        ...(game.description !== null && game.description !== undefined && { description: game.description }),
      };

      console.log('Actualizando juego en biblioteca:', gameData);
      await gameService.updateGame(game._id, gameData);
      notification.success('¡Actualizado!', `${game.title || game.name} actualizado`);
      setModalOpened(false);
      // Reload games to reflect changes
      loadGames();
    } catch (err) {
      console.error('Error al actualizar juego:', err);
      notification.error('Error', 'No se pudo actualizar el juego');
    } finally {
      setSavingGame(false);
    }
  };

  const handleStatusChange = async (gameId, newStatus) => {
    try {
      console.log('Actualizando estado:', gameId, newStatus);
      const response = await gameService.updateGame(gameId, { status: newStatus });
      console.log('Respuesta de actualización:', response);

      // Actualizar ambos arrays allGames y games
      setAllGames(allGames.map(g => g._id === gameId ? { ...g, status: newStatus } : g));
      notification.success('Éxito', 'Estado del juego actualizado');
      setModalOpened(false); // Close modal to reflect changes
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      notification.error('Error', err.response?.data?.message || 'No se pudo actualizar el estado del juego');
    }
  };

  const handleDeleteGame = async (gameId) => {
    try {
      await gameService.deleteGame(gameId);
      setAllGames(allGames.filter(g => g._id !== gameId));
      setModalOpened(false);
      notification.success('Éxito', 'Juego eliminado de tu colección');
    } catch (err) {
      notification.error('Error', 'No se pudo eliminar el juego');
    }
  };

  // Obtener estadísticas basadas en TODOS los juegos (no filtrados)
  const stats = {
    total: allGames.length,
    jugando: allGames.filter(g => g.status === 'Jugando').length,
    completados: allGames.filter(g => g.status === 'Completado').length,
    pendientes: allGames.filter(g => g.status === 'Pendiente').length,
  };

  if (loading) {
    return (
      <Center style={{ height: '400px' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <div className={classes.pageContainer}>
      <div className={classes.mainLayout}>
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
        <div className={classes.leftCapsule}>
          {!isDesktop && (
            <div className={classes.filtersRow}>
              <div className={classes.selectWrapper}>
                <Select
                  placeholder="Filtrar por estado"
                  data={[
                    { value: 'all', label: `Todos (${stats.total})` },
                    { value: 'Pendiente', label: `Pendientes (${stats.pendientes})` },
                    { value: 'Jugando', label: `Jugando (${stats.jugando})` },
                    { value: 'Completado', label: `Completados (${stats.completados})` },
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  variant="unstyled"
                  styles={{
                    root: {
                      color: '#ffffff',
                    },
                    input: {
                      color: '#ffffff',
                      '::placeholder': { color: '#ffffff' },
                      borderRadius: '20px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                    },
                    dropdown: {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      borderRadius: '12px',
                    },
                    option: {
                      color: '#ffffff',
                      backgroundColor: 'transparent',
                      borderRadius: '8px',
                      '&[data-selected]': {
                        backgroundColor: 'rgba(138, 43, 226, 0.5)',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(0, 100, 255, 0.8) !important',
                        cursor: 'pointer',
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {games.length === 0 ? (
            <div className={classes.emptyState}>
              <Text c="dimmed" style={{ color: '#ffffff' }} align="center" size="lg">
                {statusFilter === 'all'
                  ? 'Aún no tienes juegos en tu biblioteca. ¡Busca juegos para guardar!'
                  : `No hay juegos marcados como "${statusFilter}"`
                }
              </Text>
            </div>
          ) : (
            <SimpleGrid cols={{ base: 2, sm: 3, md: 3, lg: 3 }} spacing="xl" className={classes.libraryGrid}>
              {games.map(game => (
                <div key={game._id} className={classes.gameItem}>
                  <GameCard game={game} onClick={handleGameClick} />
                </div>
              ))}
            </SimpleGrid>
          )}
        </div>

        {/* Capsula derecha - Filtros */}
        <div className={classes.rightCapsule}>
          <div>
            <Text fw={600} mb="md" color="#ffffff">Filtrar por estado</Text>
            <Stack gap="sm">
              <Button
                variant={statusFilter === 'all' ? 'filled' : 'outline'}
                color="violet"
                onClick={() => setStatusFilter('all')}
                size="sm"
                fullWidth
                radius="xl"
                styles={{
                  root: {
                    backgroundColor: statusFilter === 'all' ? 'rgba(138, 43, 226, 0.8)' : 'transparent',
                    border: '1px solid rgba(138, 43, 226, 0.5)',
                    color: '#ffffff',
                    transition: 'all 0.2s ease',
                  }
                }}
              >
                Todos ({stats.total})
              </Button>
              <Button
                variant={statusFilter === 'Pendiente' ? 'filled' : 'outline'}
                color="orange"
                onClick={() => setStatusFilter('Pendiente')}
                size="sm"
                fullWidth
                radius="xl"
                styles={{
                  root: {
                    backgroundColor: statusFilter === 'Pendiente' ? 'rgba(255, 140, 0, 0.8)' : 'transparent',
                    border: '1px solid rgba(255, 140, 0, 0.5)',
                    color: '#ffffff',
                    transition: 'all 0.2s ease',
                  }
                }}
              >
                Pendientes ({stats.pendientes})
              </Button>
              <Button
                variant={statusFilter === 'Jugando' ? 'filled' : 'outline'}
                color="blue"
                onClick={() => setStatusFilter('Jugando')}
                size="sm"
                fullWidth
                radius="xl"
                styles={{
                  root: {
                    backgroundColor: statusFilter === 'Jugando' ? 'rgba(65, 105, 225, 0.8)' : 'transparent',
                    border: '1px solid rgba(65, 105, 225, 0.5)',
                    color: '#ffffff',
                    transition: 'all 0.2s ease',
                  }
                }}
              >
                Jugando ({stats.jugando})
              </Button>
              <Button
                variant={statusFilter === 'Completado' ? 'filled' : 'outline'}
                color="green"
                onClick={() => setStatusFilter('Completado')}
                size="sm"
                fullWidth
                radius="xl"
                styles={{
                  root: {
                    backgroundColor: statusFilter === 'Completado' ? 'rgba(34, 139, 34, 0.8)' : 'transparent',
                    border: '1px solid rgba(34, 139, 34, 0.5)',
                    color: '#ffffff',
                    transition: 'all 0.2s ease',
                  }
                }}
              >
                Completados ({stats.completados})
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

export default MyLibraryPage;
