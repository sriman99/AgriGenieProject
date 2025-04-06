import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/utils';

interface RealtimeData {
  type: string;
  data: any;
}

export function useRealtime() {
  const { user } = useAuth();
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const connectWebSocket = () => {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/realtime/ws/${user.id}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        // Subscribe to updates
        api.subscribeToUpdates(user.id);
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      ws.current.onerror = (error) => {
        setError('WebSocket connection error');
        console.error('WebSocket error:', error);
      };
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [user?.id]);

  const subscribeToMarketPrices = (cropName: string) => {
    if (!ws.current || !isConnected) return;

    ws.current.send(JSON.stringify({
      type: 'subscribe',
      channel: 'market_prices',
      crop_name: cropName
    }));
  };

  const subscribeToWeather = (location: string) => {
    if (!ws.current || !isConnected) return;

    ws.current.send(JSON.stringify({
      type: 'subscribe',
      channel: 'weather',
      location
    }));
  };

  const subscribeToOrders = () => {
    if (!ws.current || !isConnected) return;

    ws.current.send(JSON.stringify({
      type: 'subscribe',
      channel: 'orders'
    }));
  };

  const subscribeToCropListings = () => {
    if (!ws.current || !isConnected) return;

    ws.current.send(JSON.stringify({
      type: 'subscribe',
      channel: 'crop_listings'
    }));
  };

  return {
    isConnected,
    error,
    subscribeToMarketPrices,
    subscribeToWeather,
    subscribeToOrders,
    subscribeToCropListings
  };
} 