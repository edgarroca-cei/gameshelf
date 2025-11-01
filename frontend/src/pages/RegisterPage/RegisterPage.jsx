/**
 * Página de Registro
 * Permite a los usuarios crear una nueva cuenta
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import styles from './RegisterPage.module.css';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { registro, error, setError } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [cargando, setCargando] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState({});

  const validarFormulario = () => {
    const errores = {};

    if (!username) {
      errores.username = 'El nombre de usuario es requerido';
    } else if (username.length < 3) {
      errores.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errores.username = 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos';
    }

    if (!email) {
      errores.email = 'El email es requerido';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errores.email = 'Por favor ingresa un email válido';
    }

    if (!password) {
      errores.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      errores.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!passwordConfirm) {
      errores.passwordConfirm = 'Debes confirmar la contraseña';
    } else if (password !== passwordConfirm) {
      errores.passwordConfirm = 'Las contraseñas no coinciden';
    }

    setErroresValidacion(errores);
    return Object.keys(errores).length === 0;
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setCargando(true);
    setError(null);

    const resultado = await registro(username, email, password, passwordConfirm);

    if (resultado.success) {
      navigate('/');
    }

    setCargando(false);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.registerWrapper}>
        {/* Sección de imagen */}
        <div className={styles.imageSection}>
          <div className={styles.imagePlaceholder}>🎮</div>
        </div>

        {/* Sección de formulario */}
        <div className={styles.formSection}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>Crea tu Cuenta</h1>
            <p className={styles.subtitle}>Únete a la comunidad GameShelf</p>
          </div>

          {/* Formulario */}
          <form onSubmit={manejarSubmit}>
            {/* Error Alert */}
            {error && (
              <div className={styles.errorAlert}>
                <div className={styles.errorIcon}>
                  <IconAlertCircle size={20} />
                </div>
                <div>{error}</div>
              </div>
            )}

            {/* Username Input */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Usuario</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Elige un usuario"
                value={username}
                onChange={(e) => {
                  setUsername(e.currentTarget.value);
                  if (erroresValidacion.username) {
                    setErroresValidacion({ ...erroresValidacion, username: '' });
                  }
                }}
                disabled={cargando}
                required
              />
              {erroresValidacion.username && (
                <div style={{ color: '#fca5a5', fontSize: '0.85rem', marginTop: '4px' }}>
                  {erroresValidacion.username}
                </div>
              )}
            </div>

            {/* Email Input */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email</label>
              <input
                type="email"
                className={styles.formInput}
                placeholder="Ingresa tu email"
                value={email}
                onChange={(e) => {
                  setEmail(e.currentTarget.value);
                  if (erroresValidacion.email) {
                    setErroresValidacion({ ...erroresValidacion, email: '' });
                  }
                }}
                disabled={cargando}
                required
              />
              {erroresValidacion.email && (
                <div style={{ color: '#fca5a5', fontSize: '0.85rem', marginTop: '4px' }}>
                  {erroresValidacion.email}
                </div>
              )}
            </div>

            {/* Password Input */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Contraseña</label>
              <input
                type="password"
                className={styles.formInput}
                placeholder="Crea una contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.currentTarget.value);
                  if (erroresValidacion.password) {
                    setErroresValidacion({ ...erroresValidacion, password: '' });
                  }
                }}
                disabled={cargando}
                required
              />
              {erroresValidacion.password && (
                <div style={{ color: '#fca5a5', fontSize: '0.85rem', marginTop: '4px' }}>
                  {erroresValidacion.password}
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Confirmar Contraseña</label>
              <input
                type="password"
                className={styles.formInput}
                placeholder="Confirma tu contraseña"
                value={passwordConfirm}
                onChange={(e) => {
                  setPasswordConfirm(e.currentTarget.value);
                  if (erroresValidacion.passwordConfirm) {
                    setErroresValidacion({ ...erroresValidacion, passwordConfirm: '' });
                  }
                }}
                disabled={cargando}
                required
              />
              {erroresValidacion.passwordConfirm && (
                <div style={{ color: '#fca5a5', fontSize: '0.85rem', marginTop: '4px' }}>
                  {erroresValidacion.passwordConfirm}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={cargando}
              className={styles.submitButton}
            >
              {cargando ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Loader size={16} color="white" />
                  Creando cuenta...
                </span>
              ) : (
                'Registrarse'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className={styles.signupLink}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ textDecoration: 'none' }}>
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

