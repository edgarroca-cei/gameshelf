/**
 * Tests para el hook useNotification
 */

import { renderHook, act } from '@testing-library/react';
import { useNotification } from '../../hooks/useNotification';
import { notifications } from '@mantine/notifications';
import { vi } from 'vitest';

// Mock de Mantine notifications
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

describe('useNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show success notification', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.success('Success', 'Operation completed');
    });

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Success',
        message: 'Operation completed',
        color: 'green',
      })
    );
  });

  it('should show error notification', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.error('Error', 'Something went wrong');
    });

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Error',
        message: 'Something went wrong',
        color: 'red',
      })
    );
  });

  it('should show warning notification', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.warning('Warning', 'Be careful');
    });

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Warning',
        message: 'Be careful',
        color: 'yellow',
      })
    );
  });

  it('should show info notification', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.info('Info', 'Here is some information');
    });

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Info',
        message: 'Here is some information',
        color: 'blue',
      })
    );
  });
});

