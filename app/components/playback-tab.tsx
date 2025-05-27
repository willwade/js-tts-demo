import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ClientSideWasmTTSClient } from '@/lib/client-side-wasm-tts-client';

interface Voice {
  id: string;
  name: string;
  languageCodes: { code: string; display: string }[];
  gender: string;
  engine: string;
}

export function PlaybackTab() {
  const [text, setText] = useState('Hello, world! This is a test of text-to-speech synthesis.');
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wasmClientRef = useRef<ClientSideWasmTTSClient | null>(null);
  const { toast } = useToast();

  // Load selected voices from localStorage
  useEffect(() => {
    const savedSelectedVoices = localStorage.getItem('selected-voices');
    const savedVoices = localStorage.getItem('voices');

    if (savedSelectedVoices && savedVoices) {
      const selectedVoiceIds = JSON.parse(savedSelectedVoices) as string[];
      const allVoices = JSON.parse(savedVoices) as Voice[];

      // Filter voices to only include selected ones
      const filteredVoices = allVoices.filter(voice => selectedVoiceIds.includes(voice.id));
      setVoices(filteredVoices);

      // Set the first voice as the default if available
      if (filteredVoices.length > 0 && !selectedVoiceId) {
        setSelectedVoiceId(filteredVoices[0].id);
      }
    }
  }, [selectedVoiceId]);

  // Initialize WebAssembly client
  useEffect(() => {
    const initWasmClient = async () => {
      try {
        const client = new ClientSideWasmTTSClient();
        wasmClientRef.current = client;
      } catch (error) {
        console.error('Error initializing WebAssembly client:', error);
      }
    };

    initWasmClient();
  }, []);

  // Handle text-to-speech synthesis
  const handleSpeak = async () => {
    if (!selectedVoiceId || !text.trim()) {
      toast({
        title: 'Error',
        description: 'Please select a voice and enter some text.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setIsPlaying(false);

    try {
      const selectedVoice = voices.find(voice => voice.id === selectedVoiceId);

      if (!selectedVoice) {
        throw new Error('Selected voice not found');
      }

      let audioBlob: Blob;

      // Handle different TTS engines
      if (selectedVoice.engine === 'sherpaonnx-wasm') {
        if (!wasmClientRef.current) {
          throw new Error('WebAssembly client not initialized');
        }

        // Initialize WebAssembly module if needed
        if (!wasmClientRef.current.isInitialized()) {
          // For client-side only demo, we'll use a mock implementation
          // In a real application, you would load the actual WebAssembly module
          console.log(`Initializing mock WebAssembly module for voice: ${selectedVoiceId}`);

          try {
            // Initialize the WebAssembly module
            await wasmClientRef.current.initializeWasm();
            console.log('WebAssembly module initialized successfully');
          } catch (error) {
            console.error('Error initializing WebAssembly module:', error);
            throw new Error(`Failed to initialize WebAssembly module: ${error instanceof Error ? error.message : String(error)}`);
          }
        }

        // Set voice and synthesize speech
        await wasmClientRef.current.setVoice(selectedVoiceId);
        const audioBytes = await wasmClientRef.current.synthToBytes(text, {
          rate,
          pitch,
          volume,
          format: 'wav',
        });

        audioBlob = new Blob([audioBytes], { type: 'audio/wav' });
      } else {
        // For a client-side only demo, we're only using the WebAssembly engine
        // In a real application, you would use the API for other engines
        throw new Error('Only the SherpaOnnx WebAssembly engine is supported in this client-side demo');
      }

      // Play the audio
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to synthesize speech',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle stop playback
  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="voice-select">Voice</Label>
        <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
          <SelectTrigger id="voice-select">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            {voices.length === 0 ? (
              <SelectItem value="no-voices" disabled>
                No voices selected. Please select voices in the Voices tab.
              </SelectItem>
            ) : (
              voices.map(voice => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name} ({voice.engine})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="text-input">Text</Label>
        <Textarea
          id="text-input"
          placeholder="Enter text to synthesize..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Rate</Label>
          <div className="flex items-center space-x-2">
            <Slider
              value={[rate]}
              min={0.5}
              max={2}
              step={0.1}
              onValueChange={(value) => setRate(value[0])}
            />
            <span className="w-12 text-center">{rate.toFixed(1)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Pitch</Label>
          <div className="flex items-center space-x-2">
            <Slider
              value={[pitch]}
              min={0.5}
              max={2}
              step={0.1}
              onValueChange={(value) => setPitch(value[0])}
            />
            <span className="w-12 text-center">{pitch.toFixed(1)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Volume</Label>
          <div className="flex items-center space-x-2">
            <Slider
              value={[volume]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={(value) => setVolume(value[0])}
            />
            <span className="w-12 text-center">{volume.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={handleSpeak}
          disabled={isLoading || !selectedVoiceId || !text.trim()}
        >
          {isLoading ? 'Synthesizing...' : isPlaying ? 'Playing...' : 'Speak'}
        </Button>
        {isPlaying && (
          <Button variant="outline" onClick={handleStop}>
            Stop
          </Button>
        )}
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
