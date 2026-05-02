'use client';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { initSocket, getSocket } from '@/lib/socket';

/**
 * SocketInitializer handles re-initializing the socket connection 
 * on page reloads or status changes if an access token is present.
 */
export default function SocketInitializer({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only attempt initialization on client-side
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('accessToken');
    const socket = getSocket();

    if (isAuthenticated && token && (!socket || !socket.connected)) {
      console.log('[SocketInitializer] Re-initializing socket...');
      initSocket(token);
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}
