"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CredentialsTab } from "@/components/credentials-tab"
import { EnhancedVoicesTab } from "@/components/enhanced-voices-tab"
import { EnhancedPlaybackTab } from "@/components/enhanced-playback-tab"
import { ModeToggle } from "@/components/mode-toggle"
import TTSModeSelector from "@/components/tts-mode-selector"
import { useHydratedTTSStore } from "@/lib/tts-client"
import { useTTS } from "@/hooks/use-tts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Settings, Zap } from "lucide-react"
import { useState } from "react"

export default function Home() {
  const { currentMode, setCurrentMode } = useHydratedTTSStore()
  const {
    effectiveMode,
    availableEngines,
    browserEngines,
    serverEngines
  } = useTTS()

  const [showModeSelector, setShowModeSelector] = useState(false)

  return (
    <main className="container mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">TTS Client Demo</h1>
          <p className="text-sm text-muted-foreground">
            Advanced Text-to-Speech with server and browser engines
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {effectiveMode.charAt(0).toUpperCase() + effectiveMode.slice(1)} Mode
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowModeSelector(!showModeSelector)}
          >
            <Settings className="mr-2 h-4 w-4" />
            TTS Mode
          </Button>
          <ModeToggle />
        </div>
      </div>

      {/* TTS Mode Selector */}
      <Collapsible open={showModeSelector} onOpenChange={setShowModeSelector}>
        <CollapsibleContent>
          <Card>
            <CardHeader>
              <CardTitle>TTS Mode Configuration</CardTitle>
              <CardDescription>
                Choose how text-to-speech engines are used in your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TTSModeSelector
                currentMode={currentMode}
                onModeChange={setCurrentMode}
                availableEngines={availableEngines}
                browserEngines={browserEngines}
                serverEngines={serverEngines}
              />
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Main Tabs */}
      <Tabs defaultValue="credentials" className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="voices">Voices</TabsTrigger>
          <TabsTrigger value="playback">Playback</TabsTrigger>
        </TabsList>
        <TabsContent value="credentials">
          <CredentialsTab />
        </TabsContent>
        <TabsContent value="voices">
          <EnhancedVoicesTab />
        </TabsContent>
        <TabsContent value="playback">
          <EnhancedPlaybackTab />
        </TabsContent>
      </Tabs>
    </main>
  )
}
