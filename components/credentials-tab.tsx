"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { type TTSEngine, useTTSStore } from "@/lib/tts-client"
import { useToast } from "@/components/ui/use-toast"
import { Save } from "lucide-react"

export function CredentialsTab() {
  const { credentials, setCredentials, toggleEngine } = useTTSStore()
  const { toast } = useToast()
  const [localCredentials, setLocalCredentials] = useState(credentials)

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
    toast({
      title: "Credentials saved",
      description: `${engine.charAt(0).toUpperCase() + engine.slice(1)} credentials have been saved.`,
    })
  }

  return (
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
            <Button onClick={() => handleSaveCredentials("azure")} disabled={!localCredentials.azure.enabled}>
              <Save className="mr-2 h-4 w-4" />
              Save Azure Credentials
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
            <Button onClick={() => handleSaveCredentials("elevenlabs")} disabled={!localCredentials.elevenlabs.enabled}>
              <Save className="mr-2 h-4 w-4" />
              Save ElevenLabs Credentials
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
              <Label htmlFor="google-key">Service Account Path</Label>
              <Input
                id="google-key"
                value={localCredentials.google.keyFilename}
                onChange={(e) => handleInputChange("google", "keyFilename", e.target.value)}
                disabled={!localCredentials.google.enabled}
              />
              <p className="text-sm text-muted-foreground">
                Note: For web use, you'll need to provide the JSON content instead of a file path
              </p>
            </div>
            <Button onClick={() => handleSaveCredentials("google")} disabled={!localCredentials.google.enabled}>
              <Save className="mr-2 h-4 w-4" />
              Save Google Credentials
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
            <Button onClick={() => handleSaveCredentials("openai")} disabled={!localCredentials.openai.enabled}>
              <Save className="mr-2 h-4 w-4" />
              Save OpenAI Credentials
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
            <Button onClick={() => handleSaveCredentials("playht")} disabled={!localCredentials.playht.enabled}>
              <Save className="mr-2 h-4 w-4" />
              Save PlayHT Credentials
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
            <Button onClick={() => handleSaveCredentials("polly")} disabled={!localCredentials.polly.enabled}>
              <Save className="mr-2 h-4 w-4" />
              Save Polly Credentials
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
            <Button onClick={() => handleSaveCredentials("sherpaonnx")} disabled={!localCredentials.sherpaonnx.enabled}>
              <Save className="mr-2 h-4 w-4" />
              Save SherpaOnnx Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
