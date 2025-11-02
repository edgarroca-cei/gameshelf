// ========================================================================
// COMPONENTE DE BÚSQUEDA MÓVIL
// ========================================================================

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  TextInput,
  Paper,
  Loader,
  Center,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import * as gameService from '../../services/api.service';
import classes from './MobileSearch.module.css';

export function MobileSearch({ onGameSelect, onOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      onOpen?.();
    } else {
      onClose?.();
    }
  }, [isOpen]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await gameService.searchRAWGGames(searchQuery);
        const games = Array.isArray(response.data) ? response.data : response.data?.results || [];

        const normalizedGames = games.slice(0, 8).map(game => ({
          ...game,
          title: game.name,
          coverImage: game.background_image,
        }));

        setSearchResults(normalizedGames);
      } catch (error) {
        console.error('Error en búsqueda móvil:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleGameClick = (game) => {
    if (onGameSelect) {
      onGameSelect(game);
    }
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
  };

  return (
    <>
      <TextInput
        placeholder="Buscar juegos..."
        variant="filled"
        radius="xl"
        leftSection={<IconSearch size={16} />}
        className={classes.search}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        styles={{
          input: {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff !important',
            '&::placeholder': {
              color: '#fff',
            },
            '&:focus': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
          },
        }}
      />

      {isOpen && (
        <Paper
          className={classes.dropdown}
          shadow="lg"
          p="xs"
        >
          {loading ? (
            <Center py="xl">
              <Loader size="sm" color="pink" />
            </Center>
          ) : searchResults.length > 0 ? (
            <ScrollArea
              style={{
                height: 'auto',
                maxHeight: 'calc(100vh - 140px)',
                overflow: 'auto'
              }}
              scrollbarSize={6}
            >
              <Stack gap="8px" p="8px">
                {searchResults.map((game) => (
                  <div
                    key={game.id}
                    className={classes.resultItem}
                    onClick={() => handleGameClick(game)}
                  >
                    {game.coverImage && (
                      <img
                        src={game.coverImage}
                        alt={game.title}
                        className={classes.resultImage}
                      />
                    )}
                    <div className={classes.resultContent}>
                      <div className={classes.resultTitle}>
                        {game.title}
                      </div>
                      {game.rating && (
                        <div className={classes.resultRating}>
                          ⭐ {game.rating.toFixed(1)}/5
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </Stack>
            </ScrollArea>
          ) : (
            <Center py="xl">
              <Text size="sm" c="dimmed">
                No se encontraron juegos
              </Text>
            </Center>
          )}
        </Paper>
      )}
    </>
  );
}