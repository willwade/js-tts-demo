import React, { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ApiVoicesLoaderProps {
  engine: string;
  enabled: boolean;
  onVoicesLoaded: (voices: any[]) => void;
}

export function ApiVoicesLoader({ engine, enabled, onVoicesLoaded }: ApiVoicesLoaderProps) {
  const { toast } = useToast();

  useEffect(() => {
    console.log(`ApiVoicesLoader - engine: ${engine}, enabled: ${enabled}`);

    if (!enabled) {
      // If the engine is disabled, return an empty array
      console.log(`ApiVoicesLoader - engine ${engine} is disabled, returning empty array`);
      onVoicesLoaded([]);
      return;
    }

    console.log(`ApiVoicesLoader - engine ${engine} is enabled, fetching voices`);

    const fetchVoices = async () => {
      try {
        // Fetch voices from the API
        const url = `/api/voices?engine=${engine}&enabled=${enabled}`;
        console.log(`ApiVoicesLoader - fetching voices from ${url}`);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch ${engine} voices: ${response.statusText}`);
        }

        const voices = await response.json();
        console.log(`API returned ${voices.length} ${engine} voices:`, voices);

        onVoicesLoaded(voices);
      } catch (error) {
        console.error(`Error fetching ${engine} voices:`, error);
        toast({
          title: `Error fetching ${engine} voices`,
          description: error instanceof Error ? error.message : String(error),
          variant: 'destructive',
        });
        onVoicesLoaded([]);
      }
    };

    fetchVoices();
  }, [engine, enabled, onVoicesLoaded, toast]);

  return null;
}
