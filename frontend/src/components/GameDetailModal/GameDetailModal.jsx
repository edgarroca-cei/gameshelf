
// ========================================================================
// MODAL DE DETALLE DE JUEGO
// ========================================================================

import { useState, useEffect } from 'react';
import { Modal, Stack, Group, Button, Text, Image, ActionIcon } from '@mantine/core';
import { IconTrash, IconX } from '@tabler/icons-react';
import classes from './GameDetailModal.module.css';

export function GameDetailModal({ opened, onClose, game, onStatusChange, onDelete, onAddToLibrary, savingGame = false }) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!game) return null;

  const translateGenre = (genre) => {
    const translations = {
      'Action': 'Acción', 'Adventure': 'Aventura', 'RPG': 'RPG',
      'Strategy': 'Estrategia', 'Shooter': 'Disparos', 'Puzzle': 'Puzzle',
      'Indie': 'Indie', 'Horror': 'Terror'
    };

    const genreName = typeof genre === 'object' ? genre.name : genre;
    return translations[genreName] || genreName;
  };

  // Determina si es un juego de la biblioteca (tiene _id) o uno buscado (tiene id de RAWG)
  const isLibraryGame = !!game._id;

  const handleStatusChange = (newStatus) => {
    if (onStatusChange) {
      onStatusChange(game._id, newStatus);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`¿Seguro que quieres eliminar "${game.title || game.name}" de tu biblioteca?`)) {
      if (onDelete) {
        onDelete(game._id);
        onClose();
      }
    }
  };

  const handleAddToLibrary = (status) => {
    if (onAddToLibrary) {
      onAddToLibrary(game, status);
      onClose();
    }
  };

  const handleStatusUpdate = (newStatus) => {
    if (onStatusChange) {
      onStatusChange(game._id, newStatus);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={null}
      withCloseButton={false}
      size="xl"
      centered
      classNames={{
        content: classes.modalContent,
        header: classes.modalHeader,
        body: classes.modalBody,
      }}
      overlayProps={{
        backgroundOpacity: 0.5,
        blur: 3,
        style: { backdropFilter: 'blur(3px)' }
      }}
      style={{
        zIndex: 2000,
        position: 'relative'
      }}
      withinPortal={true}
    >
      <div className={classes.container}>
        {/* Botón cerrar */}
        <ActionIcon
          className={classes.closeButton}
          variant="transparent"
          onClick={onClose}
          size="lg"
        >
          <IconX size={24} />
        </ActionIcon>

        {/* Información del juego agrupada en cápsulas */}
        <Stack gap="lg" className={classes.content}>
          {/* Primera cápsula: Imagen y datos principales */}
          <div className={classes.infoCapsule}>
            <Group gap="md" align="flex-start" className={classes.actionsRow}>
              {/* Mini imagen */}
              <Image
                src={game.coverImage || game.background_image}
                alt={game.title || game.name}
                width={120}
                height={200}
                radius="md"
                className={classes.miniCover}
              />

              {/* Datos */}
              <Stack gap="sm" style={{ flex: 1 }}>
                <Text size="xl" fw={700} className={classes.title}>
                  {game.title || game.name}
                </Text>

                <Group gap="md">
                  {game.rating && (
                    <Group gap={4}>
                      <Text size="lg" fw={700}>⭐ {game.rating.toFixed(1)}</Text>
                      <Text size="sm" c="dimmed">/5</Text>
                    </Group>
                  )}

                  {game.genres && game.genres.length > 0 && (
                    <Group gap={4}>
                      {game.genres.slice(0, 2).map((genre) => (
                        <Text key={typeof genre === 'object' ? genre.name : genre} fw={600} style={{
                          backgroundColor: 'rgba(255, 20, 147, 0.2)',
                          padding: '2px 8px',
                          borderRadius: '16px',
                          color: '#fff',
                          fontSize: '12px'
                        }}>
                          {translateGenre(genre)}
                        </Text>
                      ))}
                    </Group>
                  )}
                </Group>
              </Stack>
            </Group>
          </div>

          {/* Acciones principales */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch' }}>
            {/* Cápsula para guardar/actualizar estado */}
            <div className={classes.libraryCapsule} style={{ flex: 1 }}>
              <Stack gap="xs" align="center" justify="center" h="100%">
                <Text size="sm" fw={500} c="dimmed" ta="center">
                  {isLibraryGame ? 'ACTUALIZAR ESTADO' : 'GUARDAR EN BIBLIOTECA'}
                </Text>
                {(() => {
                  const currentStatus = game.status;
                  const buttonHandler = isLibraryGame ? handleStatusUpdate : handleAddToLibrary;

                  const buttons = [
                    {
                      status: 'Pendiente',
                      color: 'pink',
                      bg: 'rgba(255, 105, 180, 0.8)',
                      label: currentStatus === 'Pendiente' && isLibraryGame ? 'Por jugar' : (isLibraryGame ? 'Pendiente' : 'Por jugar')
                    },
                    {
                      status: 'Jugando',
                      color: 'blue',
                      bg: 'rgba(65, 105, 225, 0.8)',
                      label: currentStatus === 'Jugando' && isLibraryGame ? 'Jugando' : (isLibraryGame ? 'Jugando' : 'Jugando')
                    },
                    {
                      status: 'Completado',
                      color: 'green',
                      bg: 'rgba(34, 139, 34, 0.6)',
                      label: currentStatus === 'Completado' && isLibraryGame ? 'Completado' : (isLibraryGame ? 'Completado' : 'Completado')
                    }
                  ];

                  if (isDesktop) {
                    return (
                      <Group gap="xs" justify="center" wrap="nowrap">
                        {buttons.map(btn => (
                          <Button
                            key={btn.status}
                            variant={currentStatus === btn.status && isLibraryGame ? 'outline' : 'filled'}
                            color={btn.color}
                            onClick={() => buttonHandler(btn.status)}
                            radius="xl"
                            size="sm"
                            loading={savingGame}
                            disabled={savingGame || (isLibraryGame && currentStatus === btn.status)}
                            style={{ background: btn.bg }}
                          >
                            {btn.label}
                          </Button>
                        ))}
                      </Group>
                    );
                  } else {
                    return (
                      <Stack gap="sm" align="center">
                        {buttons.map(btn => (
                          <Button
                            key={btn.status}
                            variant={currentStatus === btn.status && isLibraryGame ? 'outline' : 'filled'}
                            color={btn.color}
                            onClick={() => buttonHandler(btn.status)}
                            radius="xl"
                            size="sm"
                            loading={savingGame}
                            disabled={savingGame || (isLibraryGame && currentStatus === btn.status)}
                            style={{ background: btn.bg }}
                          >
                            {btn.label}
                          </Button>
                        ))}
                      </Stack>
                    );
                  }
                })()}
              </Stack>
            </div>
          </div>

          {/* Segunda fila: Botón de eliminar centrado (solo juegos en biblioteca) */}
          {isLibraryGame && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
              <Button
                variant="light"
                color="red"
                radius="xl"
                size="md"
                onClick={handleDelete}
                style={{
                  background: 'rgba(220, 53, 69, 0.25)',
                  color: 'rgb(220, 53, 69)',
                  fontSize: '13px',
                  fontWeight: '500',
                  padding: '0.6rem 1.2rem',
                  border: '1px solid rgba(220, 53, 69, 0.4)'
                }}
              >
                <IconTrash size={18} style={{ marginRight: '0.4rem' }} />
                Eliminar
              </Button>
            </div>
          )}
        </Stack>
      </div>
    </Modal>
  );
}
