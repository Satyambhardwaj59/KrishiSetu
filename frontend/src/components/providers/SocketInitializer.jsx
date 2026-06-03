'use client';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { initSocket, getSocket } from '@/lib/socket';
import { addNotification } from '@/store/slices/notificationSlice';
import toast from 'react-hot-toast';

/**
 * SocketInitializer handles re-initializing the socket connection
 * on page reloads or status changes if an access token is present.
 * Also listens for real-time weather alerts and shows toast notifications.
 */
export default function SocketInitializer({ children }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('accessToken');
    let socket = getSocket();

    if (isAuthenticated && token && (!socket || !socket.connected)) {
      console.log('[SocketInitializer] Re-initializing socket...');
      socket = initSocket(token);
    }

    if (!socket) return;

    // ── Real-time notification handler ─────────────────────────────────────
    const handleNotification = (notif) => {
      // Add to Redux notification store
      dispatch(addNotification(notif));

      // Show toast for weather-specific notification types
      if (notif.type === 'weather_alert') {
        toast(
          (t) => (
            <div className="flex flex-col gap-1 max-w-xs">
              <span className="font-semibold text-sm">{notif.title}</span>
              <span className="text-xs text-slate-300 leading-snug line-clamp-2">{notif.body}</span>
            </div>
          ),
          {
            duration: 8000,
            icon   : '⚠️',
            style  : {
              background: '#1e293b',
              color     : '#f1f5f9',
              border    : '1px solid rgba(239,68,68,0.4)',
              borderRadius: '12px',
            },
          }
        );
      } else if (notif.type === 'crop_advisory') {
        toast(
          (t) => (
            <div className="flex flex-col gap-1 max-w-xs">
              <span className="font-semibold text-sm">{notif.title}</span>
              <span className="text-xs text-slate-300 leading-snug line-clamp-2">{notif.body}</span>
            </div>
          ),
          {
            duration: 6000,
            icon   : '🌿',
            style  : {
              background: '#1e293b',
              color     : '#f1f5f9',
              border    : '1px solid rgba(34,197,94,0.4)',
              borderRadius: '12px',
            },
          }
        );
      }
    };

    socket.on('notification', handleNotification);

    return () => {
      socket?.off('notification', handleNotification);
    };
  }, [isAuthenticated, dispatch]);

  return <>{children}</>;
}
