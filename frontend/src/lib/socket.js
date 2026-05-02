import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => socket;

export const initSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth             : { token },
    transports       : ['websocket', 'polling'],
    reconnection     : true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });

  socket.on('connect', () => {
    console.log('[socket] Connected:', socket.id);
    // Join personal notification room immediately
    socket.emit('joinNotificationRoom');
  });

  socket.on('connect_error', (err) => {
    console.warn('[socket] Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[socket] Disconnected:', reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinRoom = (roomId) => {
  socket?.emit('join', { roomId });
};

export const joinOrderRoom = (orderId) => {
  socket?.emit('joinOrderRoom', { orderId });
};
