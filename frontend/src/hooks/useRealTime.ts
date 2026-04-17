import { useEffect } from 'react';
import { socketService } from '@/lib/socket';

export const useRealTime = (onUpdate?: (data: any) => void) => {
  useEffect(() => {
    socketService.connect();
    const socket = socketService.getSocket();

    if (socket) {
      socket.on('segregationUpdated', (data) => {
        console.log('Real-time update received:', data);
        if (onUpdate) onUpdate(data);
      });
    }

    return () => {
      socketService.disconnect();
    };
  }, [onUpdate]);
};
