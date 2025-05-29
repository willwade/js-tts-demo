"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { type Voice, useHydratedTTSStore } from "@/lib/tts-client"
import { useTTS } from "@/hooks/use-tts"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, RefreshCw, Search, Settings, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import TTSModeSelector from "./tts-mode-selector"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function EnhancedVoicesTab() {
  const { selectedVoices, toggleSelectedVoice, setSelectedVoice } = useHydratedTTSStore()
  const { toast } = useToast()

  const {
    currentMode,
    effectiveMode,
    isLoading,
    availableEngines,
    browserEngines,
    serverEngines,
    getVoices,
    getAllVoices,
    setMode,
    canUseMode,
    getBestEngineForMode
  } = useTTS({
    preferredMode: 'auto',
    autoDetect: true,
    fallbackToServer: true,
    fallbackToBrowser: true
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [filteredVoices, setFilteredVoices] = useState<Voice[]>([])
  const [allVoices, setAllVoices] = useState<Voice[]>([])
  const [showModeSelector, setShowModeSelector] = useState(false)

  // Filter voices based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVoices(allVoices)
      return
    }

    const debounceTimeout = setTimeout(() => {
      const query = searchQuery.toLowerCase()
      const filtered = allVoices.filter(
        (voice) =>
          (voice.name?.toLowerCase() || '').includes(query) ||
          (voice.engine?.toLowerCase() || '').includes(query) ||
          voice.languageCodes?.some(
            (lang) => (lang.display?.toLowerCase() || '').includes(query) || (lang.code?.toLowerCase() || '').includes(query),
          ) || false,
      )
      setFilteredVoices(filtered)
    }, 300)

    return () => clearTimeout(debounceTimeout)
  }, [allVoices, searchQuery])

  // Load all voices for current mode
  const loadAllVoicesForMode = async () => {
    try {
      const voices = await getAllVoices(effectiveMode)
      setAllVoices(voices)

      toast({
        title: "Voices loaded",
        description: `Successfully loaded ${voices.length} voices in ${effectiveMode} mode.`,
      })
    } catch (error) {
      console.error('Error loading voices:', error)
      toast({
        title: "Error loading voices",
        description: error instanceof Error ? error.message : "Failed to load voices",
        variant: "destructive",
      })
    }
  }

  // Load voices on component mount and mode change
  useEffect(() => {
    if (availableEngines.length > 0) {
      loadAllVoicesForMode()
    }
  }, [effectiveMode, availableEngines]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle voice selection
  const handleSelectVoice = (voice: Voice) => {
    setSelectedVoice(voice)
    toast({
      title: "Voice selected",
      description: `Selected ${voice.name} from ${voice.engine} as primary voice.`,
    })
  }

  // Handle voice toggle for multi-selection
  const handleToggleVoice = (voice: Voice) => {
    toggleSelectedVoice(voice)
    const isSelected = selectedVoices.some(v => v.engine === voice.engine && v.id === voice.id)

    toast({
      title: isSelected ? "Voice removed" : "Voice added",
      description: isSelected
        ? `Removed ${voice.name} from selection.`
        : `Added ${voice.name} from ${voice.engine} to selection.`,
    })
  }

  // Group voices by engine
  const voicesByEngine = filteredVoices.reduce((acc, voice) => {
    if (!acc[voice.engine]) {
      acc[voice.engine] = []
    }
    acc[voice.engine].push(voice)
    return acc
  }, {} as Record<string, Voice[]>)

  // Get mode-specific stats
  const getModeStats = () => {
    const stats = {
      total: filteredVoices.length,
      byMode: {
        server: filteredVoices.filter(v => serverEngines.includes(v.engine)).length,
        browser: filteredVoices.filter(v => browserEngines.includes(v.engine)).length,
      }
    }
    return stats
  }

  const stats = getModeStats()

  return (
    <div className="space-y-6">
      {/* Header with mode selector */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Voice Library</h2>
            <p className="text-muted-foreground">
              Browse and select voices from different TTS engines
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
              Mode Settings
            </Button>
          </div>
        </div>

        {/* Mode Selector */}
        <Collapsible open={showModeSelector} onOpenChange={setShowModeSelector}>
          <CollapsibleContent className="space-y-4">
            <Separator />
            <TTSModeSelector
              currentMode={currentMode}
              onModeChange={setMode}
              availableEngines={availableEngines}
              browserEngines={browserEngines}
              serverEngines={serverEngines}
            />
            <Separator />
          </CollapsibleContent>
        </Collapsible>

        {/* Search and Actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search voices by name, language, or engine..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={loadAllVoicesForMode} disabled={isLoading} className="whitespace-nowrap">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Reload Voices
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total Voices</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.byMode.server}</div>
              <p className="text-xs text-muted-foreground">Server Voices</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.byMode.browser}</div>
              <p className="text-xs text-muted-foreground">Browser Voices</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{selectedVoices.length}</div>
              <p className="text-xs text-muted-foreground">Selected</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Voice Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all">All ({filteredVoices.length})</TabsTrigger>
          {Object.entries(voicesByEngine).map(
            ([engine, engineVoices]) =>
              engineVoices.length > 0 && (
                <TabsTrigger key={engine} value={engine}>
                  {engine.charAt(0).toUpperCase() + engine.slice(1)} ({engineVoices.length})
                </TabsTrigger>
              ),
          )}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <VoicesList
            voices={filteredVoices}
            onSelectVoice={handleSelectVoice}
            onToggleVoice={handleToggleVoice}
            selectedVoices={selectedVoices}
            currentMode={effectiveMode}
          />
        </TabsContent>

        {Object.entries(voicesByEngine).map(
          ([engine, engineVoices]) =>
            engineVoices.length > 0 && (
              <TabsContent key={engine} value={engine} className="mt-4">
                <VoicesList
                  voices={engineVoices}
                  onSelectVoice={handleSelectVoice}
                  onToggleVoice={handleToggleVoice}
                  selectedVoices={selectedVoices}
                  currentMode={effectiveMode}
                />
              </TabsContent>
            ),
        )}
      </Tabs>
    </div>
  )
}

function VoicesList({
  voices,
  onSelectVoice,
  onToggleVoice,
  selectedVoices,
  currentMode
}: {
  voices: Voice[];
  onSelectVoice: (voice: Voice) => void;
  onToggleVoice: (voice: Voice) => void;
  selectedVoices: Voice[];
  currentMode: string;
}) {
  if (voices.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No voices found. Try loading voices or adjusting your search.
      </div>
    )
  }

  const isVoiceSelected = (voice: Voice) => {
    return selectedVoices.some(v => v.engine === voice.engine && v.id === voice.id);
  };

  return (
    <ScrollArea className="h-[500px]">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {voices.map((voice) => {
          const selected = isVoiceSelected(voice);
          return (
            <Card
              key={`${voice.engine}-${voice.id}`}
              className={`cursor-pointer transition-colors ${selected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}`}
              onClick={() => onToggleVoice(voice)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{voice.name}</CardTitle>
                  <div className="flex gap-2">
                    {selected && <Badge variant="default">Selected</Badge>}
                    <Badge variant="outline">{voice.engine}</Badge>
                    {voice.mode && (
                      <Badge variant="secondary" className="text-xs">
                        {voice.mode}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {voice.gender && `${voice.gender} • `}
                  {voice.languageCodes.map((lang) => lang.display).join(", ")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">ID: {voice.id}</div>
                  <div className="flex gap-2">
                    <Button
                      variant={selected ? "destructive" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleVoice(voice)
                      }}
                    >
                      {selected ? "Remove" : "Add"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectVoice(voice)
                      }}
                    >
                      Set Primary
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  )
}

export default EnhancedVoicesTab
