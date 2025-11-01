// ========================================================================
// COMPONENTE PRINCIPAL DE LA APLICACIÓN
// ========================================================================

// Importamos las librerías de React Router para el enrutamiento
import { Outlet, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
// Componentes de Mantine para la UI
import { Loader, Center } from '@mantine/core';
// Componentes propios de la aplicación
import { LeftSidebar } from './components/LeftSidebar/LeftSidebar';
import { TopHeader } from './components/TopHeader/TopHeader';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
// Hook personalizado para manejar la autenticación
import { useAuth } from './hooks/useAuth';
// Páginas de la aplicación
import { LoginPage } from './pages/LoginPage/LoginPage';
import { RegisterPage } from './pages/RegisterPage/RegisterPage';
import GameListPage from './pages/GameListPage/GameListPage';
import GameFormPage from './pages/GameFormPage/GameFormPage';
import MyLibraryPage from './pages/MyLibraryPage/MyLibraryPage';
import ExplorePage from './pages/ExplorePage/ExplorePage';
// Estilos del componente
import classes from './App.module.css';

// ========================================================================
// COMPONENTE DE LAYOUT PRINCIPAL
// ========================================================================

// Componente que define el layout principal con sidebar y header
// Maneja la comunicación entre el header (búsqueda) y las páginas internas
function AppLayout() {
  // Estado para el juego seleccionado desde la búsqueda
  const [selectedSearchGame, setSelectedSearchGame] = useState(null);

  // Manejador que se ejecuta cuando el usuario selecciona un juego desde el buscador
  const handleGameSelect = useCallback((game) => {
    console.log('App: Juego seleccionado desde búsqueda:', game);
    setSelectedSearchGame(game);
  }, []);

  // Función para resetear el juego seleccionado después de procesarlo
  const handleGameProcessed = useCallback(() => {
    console.log('App: Reseteando juego seleccionado');
    setSelectedSearchGame(null);
  }, []);

  return (
    <div className={classes.appContainer}>
      {/* Barra lateral con navegación */}
      <LeftSidebar />
      {/* Header superior con búsqueda y navegación */}
      <TopHeader onGameSelect={handleGameSelect} />
      {/* Área principal donde se renderizan las páginas */}
      <main className={classes.mainContent}>
        {/* Outlet de React Router que renderiza las rutas anidadas */}
        <Outlet context={{ selectedSearchGame, onGameProcessed: handleGameProcessed }} />
      </main>
    </div>
  );
}

// ========================================================================
// COMPONENTE APP - PUNTO DE ENTRADA PRINCIPAL
// ========================================================================

// Componente principal que configura todo el enrutamiento de la aplicación
// Decide qué mostrar basado en el estado de autenticación del usuario
function App() {
  // Obtiene el estado de autenticación desde el hook personalizado
  const { estaAutenticado, cargando } = useAuth();

  console.log('App render - cargando:', cargando, 'autenticado:', estaAutenticado);

  // Si aún se está verificando la autenticación, muestra un loader centrado
  if (cargando) {
    console.log('Mostrando loader...');
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  console.log('Renderizando rutas de la aplicación...');

  return (
    <Routes>
      {/* Rutas públicas - páginas de login y registro sin layout */}
      <Route path="/login" element={estaAutenticado ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={estaAutenticado ? <Navigate to="/" /> : <RegisterPage />} />

      {/* Rutas protegidas - requieren autenticación */}
      <Route
        path="/"
        element={estaAutenticado ? <AppLayout /> : <Navigate to="/login" />}
      >
        {/* Página principal - muestra la lista de juegos */}
        <Route index element={<GameListPage />} />
        {/* Editar un juego específico */}
        <Route path="edit-game/:id" element={
          <ProtectedRoute>
            <GameFormPage />
          </ProtectedRoute>
        } />
        {/* Biblioteca personal del usuario */}
        <Route path="my-library" element={
          <ProtectedRoute>
            <MyLibraryPage />
          </ProtectedRoute>
        } />
        {/* Página de exploración de juegos */}
        <Route path="explore" element={<ExplorePage />} />
      </Route>
    </Routes>
  );
}

export default App;
