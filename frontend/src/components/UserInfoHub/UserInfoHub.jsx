// ========================================================================
// COMPONENTE PANEL DE ESTADÍSTICAS DEL USUARIO
// ========================================================================

// Muestra estadísticas del usuario en tarjetas atractivas

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Text } from '@mantine/core';
import { IconBooks, IconDeviceGamepad2, IconTarget, IconStar } from '@tabler/icons-react';
import classes from './UserInfoHub.module.css';

/**
 * Panel lateral que muestra estadísticas del usuario
 * @param {Object} stats - Estadísticas a mostrar (total, jugando, completados, etc.)
 */
export function UserInfoHub({ stats }) {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const handleStatClick = (filter) => {
    navigate(`/my-library?filter=${filter}`);
  };

  return (
    <div className={classes.hubContainer}>
      {/* Stats Grid */}
      <div className={classes.statsGrid}>
        {/* Estadísticas para juegos */}
        <div
          className={classes.statCard}
          style={{ '--card-color': '#3b82f6', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onClick={() => handleStatClick('all')}
        >
          <div className={classes.statCardInner}>
            <div className={classes.statIcon}>
              <IconBooks size={20} />
            </div>
            <div className={classes.statContent}>
              <p className={classes.statLabel}>Total</p>
              <p className={classes.statValue}>{stats.total}</p>
            </div>
          </div>
          <div className={classes.cardGradient}></div>
        </div>

        {/* Jugando */}
        <div
          className={classes.statCard}
          style={{ '--card-color': '#f59e0b', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onClick={() => handleStatClick('Jugando')}
        >
          <div className={classes.statCardInner}>
            <div className={classes.statIcon}>
              <IconDeviceGamepad2 size={20} />
            </div>
            <div className={classes.statContent}>
              <p className={classes.statLabel}>Jugando</p>
              <p className={classes.statValue}>{stats.jugando}</p>
            </div>
          </div>
          <div className={classes.cardGradient}></div>
        </div>

        {/* Completados */}
        <div
          className={classes.statCard}
          style={{ '--card-color': '#10b981', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onClick={() => handleStatClick('Completado')}
        >
          <div className={classes.statCardInner}>
            <div className={classes.statIcon}>
              <IconTarget size={20} />
            </div>
            <div className={classes.statContent}>
              <p className={classes.statLabel}>Completados</p>
              <p className={classes.statValue}>{stats.completados}</p>
            </div>
          </div>
          <div className={classes.cardGradient}></div>
        </div>

        {/* Por Jugar */}
        <div
          className={classes.statCard}
          style={{ '--card-color': '#8b5cf6', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onClick={() => handleStatClick('Pendiente')}
        >
          <div className={classes.statCardInner}>
            <div className={classes.statIcon}>
              <IconStar size={20} />
            </div>
            <div className={classes.statContent}>
              <p className={classes.statLabel}>Por Jugar</p>
              <p className={classes.statValue}>{stats.pendientes}</p>
            </div>
          </div>
          <div className={classes.cardGradient}></div>
        </div>
      </div>
    </div>
  );
}
