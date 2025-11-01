// ========================================================================
// COMPONENTE DE BÚSQUEDA DROPDOWN
// ========================================================================

// Componente que maneja la búsqueda de juegos con dropdown
// Muestra resultados en tiempo real conforme el usuario escribe

import React, { useState, useEffect, useRef } from 'react';
import {
  TextInput,
  Paper,
  Loader,
  Center,
  ScrollArea,
  Stack,
  Text,
  Badge,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import * as gameService from '../../services/api.service';
import classes from './SearchDropdown.module.css';

export function SearchDropdown({ onGameSelect, className }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const searchRef = useRef(null);
  const timeoutRef = useRef(null);

  // Busca juegos conforme el usuario escribe
  useEffect(() => {
    // Limpia el timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Si no hay query, cierra el dropdown
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    // Espera 300ms antes de hacer la búsqueda (debounce)
    setLoading(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await gameService.searchRAWGGames(searchQuery);
        const games = Array.isArray(response.data) ? response.data : response.data?.results || [];
        
        // Normaliza los datos
        const normalizedGames = games.slice(0, 8).map(game => ({
          ...game,
          title: game.name,
          coverImage: game.background_image,
        }));
        
        setSearchResults(normalizedGames);
        setIsOpen(true);
      } catch (error) {
        console.error('Error en búsqueda:', error);
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

  // Calcula la posición del dropdown cuando se abre
  useEffect(() => {
    if (isOpen && searchRef.current) {
      const header = document.querySelector('header');
      const searchContainer = searchRef.current;

      if (header && searchContainer) {
        const headerRect = header.getBoundingClientRect();
        const searchRect = searchContainer.getBoundingClientRect();

        // Position the dropdown at the bottom of the header, aligned with the search input
        setDropdownPosition({
          top: headerRect.bottom - searchRect.top,
          left: 0,
        });
      }
    }
  }, [isOpen]);

  // Cierra el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verifica si el clic fue fuera del contenedor de búsqueda y del dropdown
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        // Verifica si el clic fue en el dropdown (que está en el body)
        const dropdown = document.querySelector(`.${classes.dropdown}`);
        if (dropdown && !dropdown.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };

    // Usa 'click' en lugar de 'mousedown' para que se dispare después del onClick
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [classes.dropdown]);

  const handleGameClick = (game) => {
    console.log('Resultado seleccionado:', game);
    if (onGameSelect) {
      onGameSelect(game);
    }
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
  };

  return (
    <div className={classes.container} ref={searchRef}>
      <TextInput
        placeholder="Buscar juegos..."
        variant="filled"
        radius="xl"
        leftSection={<IconSearch size={16} />}
        className={classes.search}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        onFocus={() => searchQuery.trim() && setIsOpen(true)}
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
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: searchRef.current?.offsetWidth || 400,
            borderRadius: '0 0 20px 20px !important',
            overflow: 'hidden !important',
          }}
        >
          {loading ? (
            <Center py="xl">
              <Loader size="sm" color="pink" />
            </Center>
          ) : searchResults.length > 0 ? (
            <ScrollArea
              style={{
                height: 'auto',
                maxHeight: 400,
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
    </div>
  );
}
