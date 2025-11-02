// ========================================================================
// COMPONENTE DE CABECERA SUPERIOR
// ========================================================================

// Header de la aplicación con navegación, búsqueda y menú de usuario
// Se adapta a móviles y desktop con comportamientos diferentes

import { useState, useEffect, useRef } from 'react';
import {
  Group,
  ActionIcon,
  Menu,
  Avatar,
  rem,
  Text,
  Burger,
  Drawer,
  TextInput,
  Paper,
  Loader,
  Center,
  ScrollArea,
  Stack,
} from '@mantine/core';
import { createPortal } from 'react-dom';
import { IconLogout, IconChevronDown, IconSearch, IconX } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { SearchDropdown } from '../SearchDropdown/SearchDropdown';
import { MobileSearch } from '../MobileSearch/MobileSearch';
import * as gameService from '../../services/api.service';
import classes from './TopHeader.module.css';

/**
 * Header principal con navegación, búsqueda y perfil de usuario
 * Se expande con búsqueda móvil y menú lateral responsive
 */
export function TopHeader({ onGameSelect }) {
  const [menuOpened, setMenuOpened] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();

  const manejarLogout = () => {
    logout();
    navigate('/login');
  };

  // Generar avatar con iniciales del usuario
  const getAvatarUrl = () => {
    if (usuario?.avatar) {
      return usuario.avatar;
    }
    // Usar DiceBear Thumbs para avatares divertidos
    return `https://api.dicebear.com/7.x/thumbs/svg?seed=${usuario?.username || 'user'}`;
  };

  const isActive = (path) => location.pathname === path;



  const navItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Biblioteca', path: '/my-library' },
    { label: 'Explorar', path: '/explore' },
  ];

  return (
    <header
      className={classes.header}
      style={{
        gridArea: 'header',
      }}
    >
        {/* Logo */}
      <div
        className={`${classes.logo}`}
        onClick={() => navigate('/')}>
        GameShelf
      </div>





      {/* Navigation Links */}
      <div className={classes.navLinks}>
        {navItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={`${classes.navLink} ${isActive(item.path) ? classes.active : ''}`}
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* Right Section - Search, Notifications, Avatar */}
      <div className={classes.rightSection}>
        {/* Search for desktop */}
        <SearchDropdown onGameSelect={onGameSelect} />
        {/* Mobile Search Icon */}
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          radius="md"
          className={classes.mobileSearchIcon}
          onClick={() => setMobileSearchOpen(true)}
        >
          <IconSearch size={20} />
        </ActionIcon>
        <Menu shadow="md" width={220} position="bottom-end">
          <Menu.Target>
            <Avatar
              src={getAvatarUrl()}
              alt={usuario?.username || 'Usuario'}
              radius="xl"
              size="lg"
              style={{ cursor: 'pointer', border: '2px solid #7950F2' }}
              className={classes.avatar}
              name={usuario?.username}
              color="blue"
            />
          </Menu.Target>
          <Menu.Dropdown style={{ borderRadius: '12px' }}>
            <Menu.Label>{usuario?.username || 'Usuario'}</Menu.Label>

            <Menu.Item color="red" leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />} onClick={manejarLogout}>
              Cerrar Sesión
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        {/* Mobile Menu Button - Right of Avatar */}
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          radius="md"
          className={classes.mobileMenuTrigger}
          onClick={() => setMenuOpened(true)}
        >
          <IconChevronDown size={20} />
        </ActionIcon>
      </div>

      {/* Mobile Search Drawer */}
      <Drawer
        opened={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
        title="Buscar juegos"
        position="bottom"
        size="100%"
        styles={{
          content: {
            background: 'rgba(15, 12, 41, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
          },
          header: {
            background: 'transparent',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          },
          title: {
            color: '#ffffff',
            fontWeight: 'bold',
          },
          close: {
            color: '#ffffff',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          },
        }}
      >
        <MobileSearch
          onGameSelect={(game) => {
            onGameSelect(game);
            setMobileSearchOpen(false);
          }}
        />
      </Drawer>

      {/* Mobile Navigation Drawer */}
      <Drawer
        opened={menuOpened}
        onClose={() => setMenuOpened(false)}
        title="Menú"
        position="right"
        size="250px"
        styles={{
          content: {
            background: 'rgba(15, 12, 41, 0.95)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
          },
          header: {
            background: 'transparent',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          },
          title: {
            color: '#ffffff',
            fontWeight: 'bold',
          },
          close: {
            color: '#ffffff',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          },
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {navItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
                setMenuOpened(false);
              }}
              style={{
                padding: '12px 16px',
                color: isActive(item.path) ? '#DDD6FE' : 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                borderRadius: '8px',
                backgroundColor: isActive(item.path) ? 'rgba(121, 80, 242, 0.15)' : 'transparent',
                fontWeight: isActive(item.path) ? '600' : '500',
                transition: 'all 0.2s ease',
                display: 'block',
                textShadow: isActive(item.path) ? '0 1px 2px rgba(0, 0, 0, 0.5)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                }
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </Drawer>


    </header>
  );
}
