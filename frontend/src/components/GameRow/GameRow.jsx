// ========================================================================
// COMPONENTE DE FILA DESLIZABLE DE JUEGOS
// ========================================================================

// Componente que muestra una fila horizontal de tarjetas de juegos
// Permite navegar con flechas, click y también arrastre del mouse/touch

import { Title, Group, ActionIcon, ScrollArea, Button } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconArrowRight } from '@tabler/icons-react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameCard } from '../GameCard/GameCard';
import classes from './GameRow.module.css';

/**
 * Componente que renderiza una fila deslizable de tarjetas de juegos
 * Incluye navegación con flechas y soporte para arrastre (drag & drop)
 */
export function GameRow({ title, games = [], onGameClick, showSeeAllButton = false }) {
  // Referencia al contenedor scrollable
  const scrollRef = useRef(null);
  // Hook para navegación
  const navigate = useNavigate();
  // Estado para manejar el arrastre del mouse
  const dragInfo = useRef({ isDragging: false, startX: 0, scrollLeft: 0, moved: false });

  const scroll = (direction) => {
    if (scrollRef.current) {
      const slideWidth = 240; // matching CSS flex: 0 0 240px
      const gap = 16; // 1rem gap in px
      const scrollAmount = slideWidth + gap;
      if (direction === 'left') {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const handleMouseDown = (e) => {
    if (scrollRef.current) {
      dragInfo.current.isDragging = true;
      dragInfo.current.moved = false;
      dragInfo.current.startX = e.pageX - scrollRef.current.offsetLeft;
      dragInfo.current.scrollLeft = scrollRef.current.scrollLeft;
      scrollRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e) => {
    if (!dragInfo.current.isDragging) return;
    e.preventDefault();
    dragInfo.current.moved = true;
    if (scrollRef.current) {
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - dragInfo.current.startX) * 1.5; // Multiplier for faster scroll
      scrollRef.current.scrollLeft = dragInfo.current.scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    if (scrollRef.current) {
      dragInfo.current.isDragging = false;
      scrollRef.current.style.cursor = 'grab';
    }
  };

  const handleGameClick = (game) => {
    if (!dragInfo.current.moved) {
      onGameClick(game);
    }
  };

  if (games.length === 0) {
    return null;
  }

  return (
    <div className={classes.container}>
      {title && (
        <Group justify="space-between" align="center" mb="md">
          <Title order={3} mb={0}>{title}</Title>
          <Group gap="xs">
            {showSeeAllButton && (
              <Button
                variant="outline"
                color="violet"
                rightSection={<IconArrowRight size={16} />}
                radius="xl"
                onClick={() => navigate('/my-library')}
                styles={{ root: { color: 'white' } }}
              >
                Ver todos
              </Button>
            )}
            <ActionIcon
              variant="outline"
              color="violet"
              size="lg"
              radius="xl"
              onClick={() => scroll('left')}
              styles={{ root: { color: 'white' } }}
            >
              <IconChevronLeft size={18} />
            </ActionIcon>
            <ActionIcon
              variant="outline"
              color="violet"
              size="lg"
              radius="xl"
              onClick={() => scroll('right')}
              styles={{ root: { color: 'white' } }}
            >
              <IconChevronRight size={18} />
            </ActionIcon>
          </Group>
        </Group>
      )}
      <ScrollArea
        viewportRef={scrollRef}
        className={classes.scrollArea}
        styles={{
          viewport: { overflowY: 'visible' },
          scrollbar: { display: 'none' }
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className={classes.gamesContainer}>
          {games.map((game) => (
            <div key={game._id} className={classes.gameSlide}>
              <GameCard game={game} onClick={() => handleGameClick(game)} />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
