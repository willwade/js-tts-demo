"use client"

import { useState } from "react"
import { TTSMode } from "@/lib/tts-client"
import { getModeInfo, TTSModeUtils } from "@/lib/tts-mode"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Cloud, 
  Monitor, 
  Zap, 
  Wifi, 
  WifiOff, 
  Server, 
  Globe,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TTSModeSelectorProps {
  currentMode: TTSMode
  onModeChange: (mode: TTSMode) => void
  availableEngines: string[]
  browserEngines: string[]
  serverEngines: string[]
  className?: string
}

export function TTSModeSelector({
  currentMode,
  onModeChange,
  availableEngines,
  browserEngines,
  serverEngines,
  className
}: TTSModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<TTSMode>(currentMode)

  const handleModeChange = (mode: TTSMode) => {
    setSelectedMode(mode)
    onModeChange(mode)
  }

  const getModeIcon = (mode: TTSMode) => {
    switch (mode) {
      case 'server':
        return <Server className="h-5 w-5" />
      case 'browser':
        return <Monitor className="h-5 w-5" />
      case 'hybrid':
        return <Globe className="h-5 w-5" />
      case 'auto':
        return <Zap className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getModeStatus = (mode: TTSMode) => {
    const isCompatible = TTSModeUtils.isModeCompatible(mode)
    const modeInfo = getModeInfo(mode)
    
    let engineCount = 0
    let statusColor: "default" | "secondary" | "destructive" | "outline" = "outline"
    let statusText = "Not Available"
    
    switch (mode) {
      case 'server':
        engineCount = serverEngines.length
        break
      case 'browser':
        engineCount = browserEngines.length
        break
      case 'hybrid':
      case 'auto':
        engineCount = availableEngines.length
        break
    }
    
    if (isCompatible && engineCount > 0) {
      statusColor = "default"
      statusText = `${engineCount} engines`
    } else if (isCompatible) {
      statusColor = "secondary"
      statusText = "No engines"
    } else {
      statusColor = "destructive"
      statusText = "Incompatible"
    }
    
    return { statusColor, statusText, engineCount, isCompatible }
  }

  const modes: TTSMode[] = ['auto', 'server', 'browser', 'hybrid']

  return (
    <div className={className}>
      <Tabs defaultValue="selector" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="selector">Mode Selector</TabsTrigger>
          <TabsTrigger value="details">Mode Details</TabsTrigger>
        </TabsList>

        <TabsContent value="selector" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">TTS Mode</h3>
              <Badge variant="outline" className="flex items-center gap-1">
                {getModeIcon(currentMode)}
                {currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}
              </Badge>
            </div>

            <RadioGroup
              value={selectedMode}
              onValueChange={(value) => handleModeChange(value as TTSMode)}
              className="space-y-3"
            >
              {modes.map((mode) => {
                const modeInfo = getModeInfo(mode)
                const status = getModeStatus(mode)
                
                return (
                  <div key={mode} className="flex items-center space-x-3">
                    <RadioGroupItem 
                      value={mode} 
                      id={mode}
                      disabled={!status.isCompatible || status.engineCount === 0}
                    />
                    <Label 
                      htmlFor={mode} 
                      className="flex-1 cursor-pointer"
                    >
                      <Card className={`transition-colors ${selectedMode === mode ? 'border-primary' : ''}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getModeIcon(mode)}
                              <CardTitle className="text-base">
                                {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
                              </CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={status.statusColor}>
                                {status.statusText}
                              </Badge>
                              {modeInfo.supportsOffline && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <WifiOff className="h-3 w-3" />
                                  Offline
                                </Badge>
                              )}
                            </div>
                          </div>
                          <CardDescription className="text-sm">
                            {modeInfo.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>

            {/* Current environment info */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Current Environment:</strong> {TTSModeUtils.detectEnvironment()} • 
                <strong> Available Engines:</strong> {availableEngines.length} total 
                ({serverEngines.length} server, {browserEngines.length} browser)
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {modes.map((mode) => {
              const modeInfo = getModeInfo(mode)
              const status = getModeStatus(mode)
              
              return (
                <Card key={mode} className={selectedMode === mode ? 'border-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getModeIcon(mode)}
                        <CardTitle className="text-base">
                          {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
                        </CardTitle>
                      </div>
                      <Badge variant={status.statusColor}>
                        {status.statusText}
                      </Badge>
                    </div>
                    <CardDescription>
                      {modeInfo.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Server className="h-3 w-3" />
                        <span>Server: {modeInfo.isServer ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Monitor className="h-3 w-3" />
                        <span>Browser: {modeInfo.isBrowser ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {modeInfo.supportsOffline ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
                        <span>Offline: {modeInfo.supportsOffline ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {status.isCompatible ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-red-500" />}
                        <span>Compatible: {status.isCompatible ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    
                    {selectedMode !== mode && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleModeChange(mode)}
                        disabled={!status.isCompatible || status.engineCount === 0}
                        className="w-full"
                      >
                        Select This Mode
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TTSModeSelector
