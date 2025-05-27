import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { ClientSideWasmTTSClient } from '@/lib/client-side-wasm-tts-client';

interface SherpaOnnxWasmProps {
  enabled: boolean;
  onVoicesLoaded: (voices: any[]) => void;
}

export function SherpaOnnxWasm({ enabled, onVoicesLoaded }: SherpaOnnxWasmProps) {
  const [loading, setLoading] = useState(true);
  const [wasmSupported, setWasmSupported] = useState(true);
  const [wasmClient, setWasmClient] = useState<ClientSideWasmTTSClient | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log('SherpaOnnxWasm component - enabled:', enabled);

    if (!enabled) {
      // If the engine is disabled, return an empty array
      console.log('SherpaOnnxWasm component - disabled, returning empty array');
      onVoicesLoaded([]);
      return;
    }

    console.log('SherpaOnnxWasm component - enabled, loading voices');

    // Check if WebAssembly is supported
    if (typeof WebAssembly === 'undefined') {
      setWasmSupported(false);
      setLoading(false);
      toast({
        title: 'WebAssembly not supported',
        description: 'Your browser does not support WebAssembly, which is required for SherpaOnnx WebAssembly TTS.',
        variant: 'destructive',
      });
      return;
    }

    const initWasm = async () => {
      try {
        setLoading(true);

        // Create a client-side SherpaOnnx WebAssembly TTS client
        const tts = new ClientSideWasmTTSClient();
        setWasmClient(tts);

        // Get available voices from the client
        const voices = await tts.getVoices();
        console.log(`Found ${voices.length} SherpaOnnx WebAssembly voices:`, voices);

        // Call the callback with the voices
        onVoicesLoaded(voices);
        setLoading(false);
      } catch (error) {
        console.error('Error initializing SherpaOnnx WebAssembly TTS:', error);
        toast({
          title: 'Error initializing SherpaOnnx WebAssembly TTS',
          description: error instanceof Error ? error.message : String(error),
          variant: 'destructive',
        });
        setLoading(false);
        onVoicesLoaded([]);
      }
    };

    initWasm();
  }, [enabled, onVoicesLoaded, toast]);

  if (!enabled) {
    return null;
  }

  if (!wasmSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SherpaOnnx WebAssembly TTS</CardTitle>
          <CardDescription>Browser-based Text-to-Speech using WebAssembly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-red-500">
              Your browser does not support WebAssembly, which is required for SherpaOnnx WebAssembly TTS.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SherpaOnnx WebAssembly TTS</CardTitle>
        <CardDescription>Browser-based Text-to-Speech using WebAssembly</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="space-y-1">
            <Label>Status</Label>
            {loading ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <div className="text-sm text-green-500">
                SherpaOnnx WebAssembly TTS is ready to use
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            window.open('https://github.com/k2-fsa/sherpa-onnx', '_blank');
          }}
        >
          Learn More
        </Button>
      </CardFooter>
    </Card>
  );
}
