import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

// Import TTS engine components
import { SherpaOnnxWasm } from './tts-engines/sherpaonnx-wasm';

export function CredentialsTab() {
  const [engines, setEngines] = useState({
    azure: false,
    elevenlabs: false,
    google: false,
    openai: false,
    playht: false,
    polly: false,
    sherpaonnx: false,
    'sherpaonnx-wasm': true, // Enable WebAssembly by default
    espeak: true, // Enable eSpeak by default (no credentials needed)
    'espeak-wasm': true, // Enable eSpeak WASM by default
    watson: false,
    witai: false,
    mock: true, // Enable mock by default for testing
  });

  // Make sure sherpaonnx-wasm is enabled by default
  useEffect(() => {
    console.log('Setting sherpaonnx-wasm to enabled by default');
    setEngines(prev => ({ ...prev, 'sherpaonnx-wasm': true }));
    localStorage.setItem('tts-engines', JSON.stringify({ ...engines, 'sherpaonnx-wasm': true }));
  }, []);

  const [credentials, setCredentials] = useState({
    azure: {
      subscriptionKey: '',
      region: '',
    },
    elevenlabs: {
      apiKey: '',
    },
    google: {
      keyFilename: '',
    },
    openai: {
      apiKey: '',
    },
    playht: {
      apiKey: '',
      userId: '',
    },
    polly: {
      region: '',
      accessKeyId: '',
      secretAccessKey: '',
    },
    watson: {
      apiKey: '',
      url: '',
      region: 'us-south',
      instanceId: '',
    },
    witai: {
      token: '',
    },
  });

  const { toast } = useToast();

  // Load saved credentials and engine states from localStorage
  useEffect(() => {
    const savedEngines = localStorage.getItem('tts-engines');
    const savedCredentials = localStorage.getItem('tts-credentials');

    if (savedEngines) {
      setEngines(JSON.parse(savedEngines));
    }

    if (savedCredentials) {
      setCredentials(JSON.parse(savedCredentials));
    }
  }, []);

  // Save credentials and engine states to localStorage
  const saveSettings = () => {
    try {
      // Save engines state
      localStorage.setItem('tts-engines', JSON.stringify(engines));

      // Save credentials
      localStorage.setItem('tts-credentials', JSON.stringify(credentials));

      // Show success toast
      toast({
        title: 'Settings saved',
        description: 'Your TTS engine settings have been saved.',
        variant: 'default',
      });

      // Reload the page to apply the new settings
      // This ensures that the voices are reloaded with the new engine settings
      window.location.reload();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error saving settings',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  // Handle engine toggle
  const handleEngineToggle = (engine: string, enabled: boolean) => {
    setEngines(prev => ({
      ...prev,
      [engine]: enabled,
    }));
  };

  // Handle credential change
  const handleCredentialChange = (engine: string, field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [engine]: {
        ...prev[engine as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  // Handle file upload for Google credentials
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        // Just store the file path for now
        handleCredentialChange('google', 'keyFilename', file.name);
      } catch (error) {
        console.error('Error parsing Google credentials file:', error);
        toast({
          title: 'Invalid credentials file',
          description: 'The selected file is not a valid Google credentials file.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* SherpaOnnx WebAssembly */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>SherpaOnnx WebAssembly</CardTitle>
              <Switch
                checked={engines['sherpaonnx-wasm']}
                onCheckedChange={(checked) => handleEngineToggle('sherpaonnx-wasm', checked)}
              />
            </div>
            <CardDescription>Browser-based Text-to-Speech using WebAssembly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                No credentials required. This engine runs entirely in your browser using WebAssembly.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Azure */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Azure</CardTitle>
              <Switch
                checked={engines.azure}
                onCheckedChange={(checked) => handleEngineToggle('azure', checked)}
              />
            </div>
            <CardDescription>Microsoft Azure Cognitive Services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="azure-key">Subscription Key</Label>
                <Input
                  id="azure-key"
                  type="password"
                  placeholder="Enter your Azure subscription key"
                  value={credentials.azure.subscriptionKey}
                  onChange={(e) => handleCredentialChange('azure', 'subscriptionKey', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="azure-region">Region</Label>
                <Input
                  id="azure-region"
                  placeholder="e.g., eastus"
                  value={credentials.azure.region}
                  onChange={(e) => handleCredentialChange('azure', 'region', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ElevenLabs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ElevenLabs</CardTitle>
              <Switch
                checked={engines.elevenlabs}
                onCheckedChange={(checked) => handleEngineToggle('elevenlabs', checked)}
              />
            </div>
            <CardDescription>ElevenLabs Text-to-Speech</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="elevenlabs-key">API Key</Label>
                <Input
                  id="elevenlabs-key"
                  type="password"
                  placeholder="Enter your ElevenLabs API key"
                  value={credentials.elevenlabs.apiKey}
                  onChange={(e) => handleCredentialChange('elevenlabs', 'apiKey', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Google */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Google</CardTitle>
              <Switch
                checked={engines.google}
                onCheckedChange={(checked) => handleEngineToggle('google', checked)}
              />
            </div>
            <CardDescription>Google Cloud Text-to-Speech</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="google-key">Service Account Key File</Label>
                <Input
                  id="google-key"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                />
                {credentials.google.keyFilename && (
                  <div className="text-sm text-green-500">
                    File selected: {credentials.google.keyFilename}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OpenAI */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>OpenAI</CardTitle>
              <Switch
                checked={engines.openai}
                onCheckedChange={(checked) => handleEngineToggle('openai', checked)}
              />
            </div>
            <CardDescription>OpenAI Text-to-Speech</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="openai-key">API Key</Label>
                <Input
                  id="openai-key"
                  type="password"
                  placeholder="Enter your OpenAI API key"
                  value={credentials.openai.apiKey}
                  onChange={(e) => handleCredentialChange('openai', 'apiKey', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PlayHT */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>PlayHT</CardTitle>
              <Switch
                checked={engines.playht}
                onCheckedChange={(checked) => handleEngineToggle('playht', checked)}
              />
            </div>
            <CardDescription>PlayHT Text-to-Speech</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="playht-key">API Key</Label>
                <Input
                  id="playht-key"
                  type="password"
                  placeholder="Enter your PlayHT API key"
                  value={credentials.playht.apiKey}
                  onChange={(e) => handleCredentialChange('playht', 'apiKey', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="playht-userid">User ID</Label>
                <Input
                  id="playht-userid"
                  placeholder="Enter your PlayHT User ID"
                  value={credentials.playht.userId}
                  onChange={(e) => handleCredentialChange('playht', 'userId', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Polly */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Polly</CardTitle>
              <Switch
                checked={engines.polly}
                onCheckedChange={(checked) => handleEngineToggle('polly', checked)}
              />
            </div>
            <CardDescription>Amazon Polly Text-to-Speech</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="polly-region">Region</Label>
                <Input
                  id="polly-region"
                  placeholder="e.g., us-east-1"
                  value={credentials.polly.region}
                  onChange={(e) => handleCredentialChange('polly', 'region', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="polly-key">Access Key ID</Label>
                <Input
                  id="polly-key"
                  type="password"
                  placeholder="Enter your AWS Access Key ID"
                  value={credentials.polly.accessKeyId}
                  onChange={(e) => handleCredentialChange('polly', 'accessKeyId', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="polly-secret">Secret Access Key</Label>
                <Input
                  id="polly-secret"
                  type="password"
                  placeholder="Enter your AWS Secret Access Key"
                  value={credentials.polly.secretAccessKey}
                  onChange={(e) => handleCredentialChange('polly', 'secretAccessKey', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SherpaOnnx */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>SherpaOnnx</CardTitle>
              <Switch
                checked={engines.sherpaonnx}
                onCheckedChange={(checked) => handleEngineToggle('sherpaonnx', checked)}
              />
            </div>
            <CardDescription>SherpaOnnx Server-side TTS</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                No credentials required. Requires SherpaOnnx models to be installed on the server.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* eSpeak */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>eSpeak</CardTitle>
              <Switch
                checked={engines.espeak}
                onCheckedChange={(checked) => handleEngineToggle('espeak', checked)}
              />
            </div>
            <CardDescription>eSpeak Text-to-Speech (Server)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                No credentials required. Open-source speech synthesizer.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* eSpeak WASM */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>eSpeak WASM</CardTitle>
              <Switch
                checked={engines['espeak-wasm']}
                onCheckedChange={(checked) => handleEngineToggle('espeak-wasm', checked)}
              />
            </div>
            <CardDescription>eSpeak Text-to-Speech (Browser)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                No credentials required. eSpeak running in WebAssembly for browser compatibility.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Watson */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Watson</CardTitle>
              <Switch
                checked={engines.watson}
                onCheckedChange={(checked) => handleEngineToggle('watson', checked)}
              />
            </div>
            <CardDescription>IBM Watson Text-to-Speech</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="watson-key">API Key</Label>
                <Input
                  id="watson-key"
                  type="password"
                  placeholder="Enter your Watson API key"
                  value={credentials.watson.apiKey}
                  onChange={(e) => handleCredentialChange('watson', 'apiKey', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="watson-url">Service URL</Label>
                <Input
                  id="watson-url"
                  placeholder="Enter your Watson service URL"
                  value={credentials.watson.url}
                  onChange={(e) => handleCredentialChange('watson', 'url', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="watson-region">Region</Label>
                <Input
                  id="watson-region"
                  placeholder="Enter your Watson region (e.g., us-south)"
                  value={credentials.watson.region}
                  onChange={(e) => handleCredentialChange('watson', 'region', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="watson-instance-id">Instance ID</Label>
                <Input
                  id="watson-instance-id"
                  placeholder="Enter your Watson instance ID"
                  value={credentials.watson.instanceId}
                  onChange={(e) => handleCredentialChange('watson', 'instanceId', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wit.ai */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Wit.ai</CardTitle>
              <Switch
                checked={engines.witai}
                onCheckedChange={(checked) => handleEngineToggle('witai', checked)}
              />
            </div>
            <CardDescription>Wit.ai Text-to-Speech</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="witai-token">API Token</Label>
                <Input
                  id="witai-token"
                  type="password"
                  placeholder="Enter your Wit.ai API token"
                  value={credentials.witai.token}
                  onChange={(e) => handleCredentialChange('witai', 'token', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mock TTS */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mock TTS</CardTitle>
              <Switch
                checked={engines.mock}
                onCheckedChange={(checked) => handleEngineToggle('mock', checked)}
              />
            </div>
            <CardDescription>Mock TTS Engine (for testing)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                No credentials required. Generates test audio for development and testing.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={saveSettings}>Save Settings</Button>
      </div>

      {/* Hidden components for loading voices */}
      <div className="hidden">
        <SherpaOnnxWasm
          enabled={engines['sherpaonnx-wasm']}
          onVoicesLoaded={() => {}}
        />
      </div>
    </div>
  );
}
