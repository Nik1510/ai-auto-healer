import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Change something like this:
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-1fd-5000.ny1.zerops.app';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(API_URL);

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, isConnected };
};
