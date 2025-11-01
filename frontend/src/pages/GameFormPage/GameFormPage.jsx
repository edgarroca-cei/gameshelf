import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, Container, Title, Loader, SimpleGrid, Card, Image, Text, Group, ActionIcon, rem } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch, IconPlus } from '@tabler/icons-react';
import * as gameService from '../../services/api.service';
import { useNotification } from '../../hooks/useNotification';

function GameFormPage() {
  const navigate = useNavigate();
  const notification = useNotification();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery] = useDebouncedValue(query, 300);

  // Efecto para buscar juegos cuando el término de búsqueda (debounced) cambia
  useEffect(() => {
    if (debouncedQuery) {
      setLoading(true);
      gameService.searchRAWGGames(debouncedQuery)
        .then(response => {
          setSearchResults(response.data);
        })
        .catch(error => {
          notification.error('Error', 'No se pudieron buscar los juegos');
        })
        .finally(() => setLoading(false));
    } else {
      setSearchResults([]);
    }
  }, [debouncedQuery]);

  // Maneja el clic en un resultado de búsqueda para añadirlo a la colección
  const handleAddGame = async (game) => {
    const newGame = {
      title: game.name,
      platform: game.platforms,
      coverImage: game.background_image,
      status: 'Pendiente', // Por defecto se añade como pendiente
    };

    try {
      await gameService.createGame(newGame);
      notification.success('Éxito', 'Juego añadido a tu colección');
      navigate('/'); // Vuelve a la página principal
    } catch (error) {
      // Aquí se podría comprobar si el error es por título duplicado
      if (error.response && error.response.data.message.includes('duplicate key')) {
        notification.warning('Juego duplicado', 'Este juego ya está en tu colección.');
      } else {
        notification.error('Error', 'No se pudo añadir el juego.');
      }
    }
  };

  return (
    <Container my="lg">
      <Title order={1} ta="center" mb="lg">Añadir desde RAWG</Title>
      <TextInput
        placeholder="Buscar un juego (ej: Cyberpunk 2077)..."
        size="lg"
        value={query}
        onChange={(event) => setQuery(event.currentTarget.value)}
        leftSection={<IconSearch style={{ width: rem(18), height: rem(18) }} stroke={1.5} />}
        rightSection={loading ? <Loader size="xs" /> : null}
        mb="xl"
      />

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
        {searchResults.map((game) => (
          <Card key={game.id} shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              <Image
                src={game.background_image}
                height={160}
                alt={game.name}
                fallbackSrc="https://via.placeholder.com/400x200.png?text=No+Image"
              />
            </Card.Section>

            <Group justify="space-between" mt="md" mb="xs">
              <Text fw={500} truncate="end">{game.name}</Text>
            </Group>

            <Text size="sm" c="dimmed" lineClamp={2}>
              Plataformas: {game.platforms}
            </Text>

            <ActionIcon 
              variant="filled" 
              color="blue" 
              size="lg" 
              radius="xl" 
              style={{ position: 'absolute', top: 10, right: 10 }}
              onClick={() => handleAddGame(game)}
            >
              <IconPlus style={{ width: rem(20), height: rem(20) }} />
            </ActionIcon>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}

export default GameFormPage;