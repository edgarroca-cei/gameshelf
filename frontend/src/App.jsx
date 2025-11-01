// ========================================================================
// COMPONENTE PRINCIPAL DE LA APLICACIÓN GAMESHELF
// ========================================================================

// Importamos las librerías necesarias de React y React Router
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Importamos MantineProvider para los componentes de UI
import { MantineProvider } from '@mantine/core';
import { theme } from './theme'; // Importar el tema personalizado

// Importamos componentes de la aplicación
import { TopHeader } from './components/TopHeader/TopHeader';
import { LeftSidebar } from './components/LeftSidebar/LeftSidebar';

// Importamos páginas de la aplicación
import { LoginPage } from './pages/LoginPage/LoginPage';
import { RegisterPage } from './pages/RegisterPage/RegisterPage';
import GameListPage from './pages/GameListPage/GameListPage';
import MyLibraryPage from './pages/MyLibraryPage/MyLibraryPage';
import ExplorePage from './pages/ExplorePage/ExplorePage';
import GameFormPage from './pages/GameFormPage/GameFormPage';

// Importamos componentes de autenticación
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';

// Importamos estilos de la aplicación
import classes from './App.module.css';

// ========================================================================
// COMPONENTE LAYOUT PRINCIPAL
// ========================================================================

// Layout que envuelve todas las páginas protegidas con header y sidebar
function MainLayout() {
  // Estado para manejar el juego seleccionado desde la búsqueda
  const [selectedSearchGame, setSelectedSearchGame] = useState(null);

  // Función para manejar cuando se selecciona un juego desde la búsqueda
  const handleGameSelect = (game) => {
    setSelectedSearchGame(game);
  };

  // Función para procesar el juego seleccionado (resetear después de mostrar)
  const handleGameProcessed = () => {
    setSelectedSearchGame(null);
  };

  // Contexto que se pasa a las páginas hijas
  const contextValue = {
    selectedSearchGame,
    onGameProcessed: handleGameProcessed,
  };

  return (
    <div className={classes.appContainer}>
      {/* Header superior con navegación y búsqueda */}
      <TopHeader onGameSelect={handleGameSelect} />

      {/* Contenido principal */}
      <main className={classes.mainContent}>
        {/* Outlet para renderizar las páginas hijas con contexto */}
        <Outlet context={contextValue} />
      </main>
    </div>
  );
}

// ========================================================================
// COMPONENTE APP - PUNTO DE ENTRADA PRINCIPAL
// ========================================================================

// Componente principal que configura el enrutamiento y la autenticación
function App() {
  return (
    // MantineProvider envuelve toda la aplicación para proporcionar estilos y componentes
    <MantineProvider theme={theme} defaultColorScheme="dark">
      {/* Proveedor de autenticación que envuelve toda la aplicación */}
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Rutas protegidas envueltas en MainLayout */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              {/* Página principal */}
              <Route index element={<GameListPage />} />

              {/* Otras páginas de la aplicación */}
              <Route path="my-library" element={<MyLibraryPage />} />
              <Route path="explore" element={<ExplorePage />} />
              <Route path="games/new" element={<GameFormPage />} />
              <Route path="games/:id/edit" element={<GameFormPage />} />
            </Route>

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
