"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { type TTSEngine, useHydratedTTSStore } from "@/lib/tts-client"
import { useToast } from "@/components/ui/use-toast"
import { Save, Check } from "lucide-react"
// import CredentialsStatus from "./credentials-status"

export function CredentialsTab() {
  const { credentials, setCredentials, toggleEngine } = useHydratedTTSStore()
  const { toast } = useToast()
  const [localCredentials, setLocalCredentials] = useState(credentials)
  const [savedEngines, setSavedEngines] = useState<Record<TTSEngine, boolean>>({
    azure: false,
    elevenlabs: false,
    google: false,
    openai: false,
    playht: false,
    polly: false,
    sherpaonnx: false,
    'sherpaonnx-wasm': false,
    espeak: false,
    'espeak-wasm': false,
    watson: false,
    witai: false,
    mock: false
  })

  const handleInputChange = (engine: TTSEngine, field: string, value: string) => {
    setLocalCredentials({
      ...localCredentials,
      [engine]: {
        ...localCredentials[engine],
        [field]: value,
      },
    })
  }

  const handleSaveCredentials = (engine: TTSEngine) => {
    setCredentials(engine, localCredentials[engine])

    // Set the saved state for this engine
    setSavedEngines(prev => ({
      ...prev,
      [engine]: true
    }))

    // Reset the saved state after 2 seconds
    setTimeout(() => {
      setSavedEngines(prev => ({
        ...prev,
        [engine]: false
      }))
    }, 2000)

    toast({
      title: "Credentials saved",
      description: `${engine.charAt(0).toUpperCase() + engine.slice(1)} credentials have been saved.`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Environment Credentials Status */}
      {/* <CredentialsStatus /> */}

      {/* Manual Credential Configuration */}
      <div className="grid gap-6 md:grid-cols-2">
      {/* Azure */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Azure TTS</CardTitle>
            <CardDescription>Microsoft Azure Cognitive Services</CardDescription>
          </div>
          <Switch
            checked={localCredentials.azure.enabled}
            onCheckedChange={() => {
              toggleEngine("azure")
              setLocalCredentials({
                ...localCredentials,
                azure: {
                  ...localCredentials.azure,
                  enabled: !localCredentials.azure.enabled,
                },
              })
            }}
          />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="azure-key">Subscription Key</Label>
              <Input
                id="azure-key"
                type="password"
                value={localCredentials.azure.subscriptionKey}
                onChange={(e) => handleInputChange("azure", "subscriptionKey", e.target.value)}
                disabled={!localCredentials.azure.enabled}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="azure-region">Region</Label>
              <Input
                id="azure-region"
                value={localCredentials.azure.region}
                onChange={(e) => handleInputChange("azure", "region", e.target.value)}
                disabled={!localCredentials.azure.enabled}
              />
            </div>
            <Button
              onClick={() => handleSaveCredentials("azure")}
              disabled={!localCredentials.azure.enabled}
              variant={savedEngines.azure ? "outline" : "default"}
              className={`transition-all duration-200 ${savedEngines.azure ? "bg-green-100 hover:bg-green-200 text-green-700 border-green-500" : ""}`}

            >
              {savedEngines.azure ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {savedEngines.azure ? "Saved" : "Save Azure Credentials"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ElevenLabs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>ElevenLabs</CardTitle>
            <CardDescription>ElevenLabs TTS API</CardDescription>
          </div>
          <Switch
            checked={localCredentials.elevenlabs.enabled}
            onCheckedChange={() => {
              toggleEngine("elevenlabs")
              setLocalCredentials({
                ...localCredentials,
                elevenlabs: {
                  ...localCredentials.elevenlabs,
                  enabled: !localCredentials.elevenlabs.enabled,
                },
              })
            }}
          />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="elevenlabs-key">API Key</Label>
              <Input
                id="elevenlabs-key"
                type="password"
                value={localCredentials.elevenlabs.apiKey}
                onChange={(e) => handleInputChange("elevenlabs", "apiKey", e.target.value)}
                disabled={!localCredentials.elevenlabs.enabled}
              />
            </div>
            <Button
              onClick={() => handleSaveCredentials("elevenlabs")}
              disabled={!localCredentials.elevenlabs.enabled}
              variant={savedEngines.elevenlabs ? "outline" : "default"}
              className={`transition-all duration-200 ${savedEngines.elevenlabs ? "bg-green-100 hover:bg-green-200 text-green-700 border-green-500" : ""}`}

            >
              {savedEngines.elevenlabs ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {savedEngines.elevenlabs ? "Saved" : "Save ElevenLabs Credentials"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Google */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Google TTS</CardTitle>
            <CardDescription>Google Cloud Text-to-Speech</CardDescription>
          </div>
          <Switch
            checked={localCredentials.google.enabled}
            onCheckedChange={() => {
              toggleEngine("google")
              setLocalCredentials({
                ...localCredentials,
                google: {
                  ...localCredentials.google,
                  enabled: !localCredentials.google.enabled,
                },
              })
            }}
          />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="google-key">Google Service Account JSON</Label>
              <div className="flex gap-2">
                <Input
                  id="google-key"
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        try {
                          // Store the file path for display purposes
                          handleInputChange("google", "keyFilename", file.name);

                          // In a real implementation, you would handle the JSON content here
                          // For this demo, we're just storing the filename
                          toast({
                            title: "File loaded",
                            description: `${file.name} has been loaded successfully.`,
                          });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to parse JSON file. Please ensure it's a valid Google service account key.",
                            variant: "destructive",
                          });
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  disabled={!localCredentials.google.enabled}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Upload your Google service account JSON key file. For security, the file is processed locally and not sent to any server.
              </p>
              {localCredentials.google.keyFilename && (
                <p className="text-sm font-medium">Selected file: {localCredentials.google.keyFilename}</p>
              )}
            </div>
            <Button
              onClick={() => handleSaveCredentials("google")}
              disabled={!localCredentials.google.enabled}
              variant={savedEngines.google ? "outline" : "default"}
              className={`transition-all duration-200 ${savedEngines.google ? "bg-green-100 hover:bg-green-200 text-green-700 border-green-500" : ""}`}

            >
              {savedEngines.google ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {savedEngines.google ? "Saved" : "Save Google Credentials"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* OpenAI */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>OpenAI TTS</CardTitle>
            <CardDescription>OpenAI Text-to-Speech API</CardDescription>
          </div>
          <Switch
            checked={localCredentials.openai.enabled}
            onCheckedChange={() => {
              toggleEngine("openai")
              setLocalCredentials({
                ...localCredentials,
                openai: {
                  ...localCredentials.openai,
                  enabled: !localCredentials.openai.enabled,
                },
              })
            }}
          />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="openai-key">API Key</Label>
              <Input
                id="openai-key"
                type="password"
                value={localCredentials.openai.apiKey}
                onChange={(e) => handleInputChange("openai", "apiKey", e.target.value)}
                disabled={!localCredentials.openai.enabled}
              />
            </div>
            <Button
              onClick={() => handleSaveCredentials("openai")}
              disabled={!localCredentials.openai.enabled}
              variant={savedEngines.openai ? "outline" : "default"}
              className={`transition-all duration-200 ${savedEngines.openai ? "bg-green-100 hover:bg-green-200 text-green-700 border-green-500" : ""}`}

            >
              {savedEngines.openai ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {savedEngines.openai ? "Saved" : "Save OpenAI Credentials"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PlayHT */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>PlayHT</CardTitle>
            <CardDescription>PlayHT Text-to-Speech API</CardDescription>
          </div>
          <Switch
            checked={localCredentials.playht.enabled}
            onCheckedChange={() => {
              toggleEngine("playht")
              setLocalCredentials({
                ...localCredentials,
                playht: {
                  ...localCredentials.playht,
                  enabled: !localCredentials.playht.enabled,
                },
              })
            }}
          />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="playht-key">API Key</Label>
              <Input
                id="playht-key"
                type="password"
                value={localCredentials.playht.apiKey}
                onChange={(e) => handleInputChange("playht", "apiKey", e.target.value)}
                disabled={!localCredentials.playht.enabled}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="playht-userid">User ID</Label>
              <Input
                id="playht-userid"
                value={localCredentials.playht.userId}
                onChange={(e) => handleInputChange("playht", "userId", e.target.value)}
                disabled={!localCredentials.playht.enabled}
              />
            </div>
            <Button
              onClick={() => handleSaveCredentials("playht")}
              disabled={!localCredentials.playht.enabled}
              variant={savedEngines.playht ? "outline" : "default"}
              className={`transition-all duration-200 ${savedEngines.playht ? "bg-green-100 hover:bg-green-200 text-green-700 border-green-500" : ""}`}

            >
              {savedEngines.playht ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {savedEngines.playht ? "Saved" : "Save PlayHT Credentials"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Polly */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>AWS Polly</CardTitle>
            <CardDescription>Amazon Polly Text-to-Speech</CardDescription>
          </div>
          <Switch
            checked={localCredentials.polly.enabled}
            onCheckedChange={() => {
              toggleEngine("polly")
              setLocalCredentials({
                ...localCredentials,
                polly: {
                  ...localCredentials.polly,
                  enabled: !localCredentials.polly.enabled,
                },
              })
            }}
          />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="polly-key-id">Access Key ID</Label>
              <Input
                id="polly-key-id"
                value={localCredentials.polly.accessKeyId}
                onChange={(e) => handleInputChange("polly", "accessKeyId", e.target.value)}
                disabled={!localCredentials.polly.enabled}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="polly-secret">Secret Access Key</Label>
              <Input
                id="polly-secret"
                type="password"
                value={localCredentials.polly.secretAccessKey}
                onChange={(e) => handleInputChange("polly", "secretAccessKey", e.target.value)}
                disabled={!localCredentials.polly.enabled}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="polly-region">Region</Label>
              <Input
                id="polly-region"
                value={localCredentials.polly.region}
                onChange={(e) => handleInputChange("polly", "region", e.target.value)}
                disabled={!localCredentials.polly.enabled}
              />
            </div>
            <Button
              onClick={() => handleSaveCredentials("polly")}
              disabled={!localCredentials.polly.enabled}
              variant={savedEngines.polly ? "outline" : "default"}
              className={`transition-all duration-200 ${savedEngines.polly ? "bg-green-100 hover:bg-green-200 text-green-700 border-green-500" : ""}`}

            >
              {savedEngines.polly ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {savedEngines.polly ? "Saved" : "Save Polly Credentials"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SherpaOnnx */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>SherpaOnnx</CardTitle>
            <CardDescription>Offline TTS with ONNX Runtime</CardDescription>
          </div>
          <Switch
            checked={localCredentials.sherpaonnx.enabled}
            onCheckedChange={() => {
              toggleEngine("sherpaonnx")
              setLocalCredentials({
                ...localCredentials,
                sherpaonnx: {
                  ...localCredentials.sherpaonnx,
                  enabled: !localCredentials.sherpaonnx.enabled,
                },
              })
            }}
          />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              SherpaOnnx runs locally and doesn't require API credentials. Models will be downloaded automatically when
              first used.
            </p>
            <Button
              onClick={() => handleSaveCredentials("sherpaonnx")}
              disabled={!localCredentials.sherpaonnx.enabled}
              variant={savedEngines.sherpaonnx ? "outline" : "default"}
              className={`transition-all duration-200 ${savedEngines.sherpaonnx ? "bg-green-100 hover:bg-green-200 text-green-700 border-green-500" : ""}`}

            >
              {savedEngines.sherpaonnx ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {savedEngines.sherpaonnx ? "Saved" : "Save SherpaOnnx Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
