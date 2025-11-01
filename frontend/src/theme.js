
import { createTheme } from '@mantine/core';

// Definimos el tema personalizado para la aplicación
export const theme = createTheme({
  // Esquema de color por defecto
  colorScheme: 'dark',
  
  // Color primario usado en toda la aplicación (botones, enlaces activos, etc.)
  primaryColor: 'pink',

  // Paleta de colores personalizada para el modo oscuro
  colors: {
    dark: [
      '#FFFFFF', // 0
      '#A6A7AB', // 1
      '#909296', // 2
      '#5C5F66', // 3
      '#373A40', // 4
      '#2C2E33', // 5
      '#25262B', // 6 -> default body background
      '#1A1B2E', // 7 -> Nuestro color de fondo principal
      '#141517', // 8
      '#101113', // 9
    ],
  },

  // Tipografía principal
  fontFamily: 'Poppins, sans-serif',

  // Radios de borde para un look más redondeado y moderno (estilo Netflix)
  radius: {
    sm: 8,
    md: 12,
    lg: 20,
  },

  // Estilos por defecto para componentes específicos
  components: {
    Button: {
      defaultProps: {
        radius: 'lg', // Todos los botones tendrán bordes grandes
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg', // Todas las tarjetas tendrán bordes grandes
      },
    },
  },
});
