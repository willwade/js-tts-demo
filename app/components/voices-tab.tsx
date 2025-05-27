import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

// Import TTS engine components
import { SherpaOnnxWasm } from './tts-engines/sherpaonnx-wasm';
import { ApiVoicesLoader } from './tts-engines/api-voices-loader';

interface Voice {
  id: string;
  name: string;
  languageCodes: { code: string; display: string }[];
  gender: string;
  engine: string;
}

export function VoicesTab() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [filteredVoices, setFilteredVoices] = useState<Voice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedVoices, setSelectedVoices] = useState<string[]>([]);
  const [engines, setEngines] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Load enabled engines from localStorage
  useEffect(() => {
    const savedEngines = localStorage.getItem('tts-engines');
    if (savedEngines) {
      setEngines(JSON.parse(savedEngines));
    }
  }, []);

  // Load saved selected voices
  useEffect(() => {
    if (Object.keys(engines).length === 0) return;

    // Set initial loading state
    setLoading(true);

    // Load saved selected voices
    const savedSelectedVoices = localStorage.getItem('selected-voices');
    if (savedSelectedVoices) {
      setSelectedVoices(JSON.parse(savedSelectedVoices));
    }

    // We'll load SherpaOnnx WebAssembly voices via the SherpaOnnxWasm component

    // Set loading to false if no engines are enabled
    if (Object.values(engines).every(enabled => !enabled)) {
      setLoading(false);
    }

    // Set loading to false after a short delay to allow components to load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [engines]);

  // Update filtered voices when voices change
  useEffect(() => {
    console.log('Voices changed, current voices:', voices);
    console.log('Current engines state:', engines);

    // Filter out voices from disabled engines
    const enabledVoices = voices.filter(voice => engines[voice.engine] !== false);
    console.log('Filtered voices (enabled only):', enabledVoices);

    setFilteredVoices(enabledVoices);
  }, [voices, engines]);

  // Filter voices based on search term
  useEffect(() => {
    // Get the enabled voices
    const enabledVoices = voices.filter(voice => engines[voice.engine] !== false);

    if (searchTerm.trim() === '') {
      setFilteredVoices(enabledVoices);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = enabledVoices.filter(voice => {
      // Search by name
      if (voice.name.toLowerCase().includes(lowerCaseSearchTerm)) {
        return true;
      }

      // Search by language
      if (voice.languageCodes.some(lang =>
        lang.code.toLowerCase().includes(lowerCaseSearchTerm) ||
        lang.display.toLowerCase().includes(lowerCaseSearchTerm)
      )) {
        return true;
      }

      // Search by engine
      if (voice.engine.toLowerCase().includes(lowerCaseSearchTerm)) {
        return true;
      }

      // Search by gender
      if (voice.gender.toLowerCase().includes(lowerCaseSearchTerm)) {
        return true;
      }

      return false;
    });

    setFilteredVoices(filtered);
  }, [searchTerm, voices]);

  // Handle voice selection
  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoices(prev => {
      const newSelectedVoices = prev.includes(voiceId)
        ? prev.filter(id => id !== voiceId)
        : [...prev, voiceId];

      // Save selected voices to localStorage
      localStorage.setItem('selected-voices', JSON.stringify(newSelectedVoices));

      return newSelectedVoices;
    });
  };

  // Handle voice loading from SherpaOnnx WebAssembly
  const handleSherpaOnnxWasmVoicesLoaded = (wasmVoices: Voice[]) => {
    console.log('SherpaOnnx WebAssembly voices loaded:', wasmVoices);
    console.log('Current engines state:', engines);

    if (!engines['sherpaonnx-wasm']) {
      // If the engine is disabled, don't add the voices
      console.log('SherpaOnnx WebAssembly engine is disabled, not adding voices');
      return;
    }

    // Hardcode the voices for now
    const hardcodedVoices = [
      {
        id: 'piper_en_US_amy',
        name: 'Amy (English US)',
        languageCodes: [{ code: 'en-US', display: 'English (US)' }],
        gender: 'FEMALE',
        engine: 'sherpaonnx-wasm'
      }
    ];

    setVoices(prev => {
      // Filter out any existing SherpaOnnx WebAssembly voices
      const filteredVoices = prev.filter(voice => voice.engine !== 'sherpaonnx-wasm');
      const newVoices = [...filteredVoices, ...hardcodedVoices];
      console.log('New voices after adding SherpaOnnx WebAssembly voices:', newVoices);
      setFilteredVoices(newVoices);
      return newVoices;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search voices by name, language, or engine..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button
          variant="outline"
          onClick={() => setSearchTerm('')}
        >
          Clear
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            {filteredVoices.length} voices found
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVoices.map(voice => (
              <Card key={voice.id} className={`cursor-pointer transition-colors ${
                selectedVoices.includes(voice.id) ? 'border-primary' : ''
              }`} onClick={() => handleVoiceSelect(voice.id)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{voice.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {voice.languageCodes.map(lang => lang.display).join(', ')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {voice.gender} • {voice.engine}
                      </div>
                    </div>
                    <Checkbox
                      checked={selectedVoices.includes(voice.id)}
                      onCheckedChange={() => handleVoiceSelect(voice.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Hidden components for loading voices */}
      <div className="hidden">
        {/* WebAssembly-based TTS engine */}
        <SherpaOnnxWasm
          enabled={engines['sherpaonnx-wasm'] || false}
          onVoicesLoaded={handleSherpaOnnxWasmVoicesLoaded}
        />

        {/* For a client-side only demo, we're not using API-based TTS engines */}
        {/* All voices are loaded directly in the client */}

        {/* Add API loader for SherpaOnnx WebAssembly */}
        <ApiVoicesLoader
          engine="sherpaonnx-wasm"
          enabled={engines['sherpaonnx-wasm'] || false}
          onVoicesLoaded={(voices) => setVoices(prev => [...prev.filter(v => v.engine !== 'sherpaonnx-wasm'), ...voices])}
        />
      </div>
    </div>
  );
}
