"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { type TTSEngine, type Voice, fetchVoices, useTTSStore } from "@/lib/tts-client"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, RefreshCw, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function VoicesTab() {
  const { credentials, voices, setVoices, setSelectedVoice, selectedVoices, toggleSelectedVoice } = useTTSStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState<Record<TTSEngine, boolean>>({
    azure: false,
    elevenlabs: false,
    google: false,
    openai: false,
    playht: false,
    polly: false,
    sherpaonnx: false,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredVoices, setFilteredVoices] = useState<Voice[]>([])

  // Filter voices based on search query - with debounce for performance
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVoices(voices)
      return
    }

    // Debounce search to improve performance
    const debounceTimeout = setTimeout(() => {
      const query = searchQuery.toLowerCase()
      const filtered = voices.filter(
        (voice) =>
          (voice.name?.toLowerCase() || '').includes(query) ||
          (voice.engine?.toLowerCase() || '').includes(query) ||
          voice.languageCodes?.some(
            (lang) => (lang.display?.toLowerCase() || '').includes(query) || (lang.code?.toLowerCase() || '').includes(query),
          ) || false,
      )
      setFilteredVoices(filtered)
    }, 300) // 300ms debounce delay

    return () => clearTimeout(debounceTimeout)
  }, [voices, searchQuery])

  // Load voices for a specific engine
  const loadVoices = async (engine: TTSEngine) => {
    if (!credentials[engine].enabled) {
      toast({
        title: "Engine disabled",
        description: `${engine.charAt(0).toUpperCase() + engine.slice(1)} is currently disabled. Enable it in the Credentials tab.`,
        variant: "destructive",
      })
      return
    }

    setIsLoading((prev) => ({ ...prev, [engine]: true }))

    try {
      const engineVoices = await fetchVoices(engine, credentials[engine])

      // Remove existing voices for this engine and add new ones
      const updatedVoices = [...voices.filter((v) => v.engine !== engine), ...engineVoices]

      setVoices(updatedVoices)

      toast({
        title: "Voices loaded",
        description: `Successfully loaded ${engineVoices.length} voices from ${engine.charAt(0).toUpperCase() + engine.slice(1)}.`,
      })
    } catch (error) {
      console.error(`Error loading ${engine} voices:`, error)
      toast({
        title: "Error loading voices",
        description: error instanceof Error
          ? `${error.message}`
          : `Failed to load voices from ${engine}. Check your credentials and try again.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [engine]: false }))
    }
  }

  // Load all enabled voices
  const loadAllVoices = async () => {
    const enabledEngines = Object.entries(credentials)
      .filter(([_, config]) => config.enabled)
      .map(([engine]) => engine as TTSEngine)

    if (enabledEngines.length === 0) {
      toast({
        title: "No engines enabled",
        description: "Enable at least one TTS engine in the Credentials tab.",
        variant: "destructive",
      })
      return
    }

    // Set all enabled engines to loading
    const loadingState = { ...isLoading }
    enabledEngines.forEach((engine) => {
      loadingState[engine] = true
    })
    setIsLoading(loadingState)

    // Load voices for each enabled engine
    const allVoicesPromises = enabledEngines.map(async (engine) => {
      try {
        return await fetchVoices(engine, credentials[engine])
      } catch (error) {
        console.error(`Error loading ${engine} voices:`, error)
        toast({
          title: `${engine} error`,
          description: `Failed to load voices from ${engine}.`,
          variant: "destructive",
        })
        return []
      } finally {
        setIsLoading((prev) => ({ ...prev, [engine]: false }))
      }
    })

    const allVoicesResults = await Promise.all(allVoicesPromises)
    const allVoices = allVoicesResults.flat()

    setVoices(allVoices)

    toast({
      title: "Voices loaded",
      description: `Successfully loaded ${allVoices.length} voices from ${enabledEngines.length} engines.`,
    })
  }

  // Select a voice for single selection mode
  const handleSelectVoice = (voice: Voice) => {
    setSelectedVoice(voice)
    toast({
      title: "Voice selected",
      description: `Selected ${voice.name} from ${voice.engine} as primary voice.`,
    })
  }

  // Toggle voice selection for multi-selection mode
  const handleToggleVoice = (voice: Voice) => {
    toggleSelectedVoice(voice)

    // Check if the voice is already selected
    const isSelected = selectedVoices.some(v => v.engine === voice.engine && v.id === voice.id)

    toast({
      title: isSelected ? "Voice removed" : "Voice added",
      description: isSelected
        ? `Removed ${voice.name} from selection.`
        : `Added ${voice.name} from ${voice.engine} to selection.`,
    })
  }

  // Load all voices on component mount
  useEffect(() => {
    // Only load voices if none are loaded yet
    if (voices.length === 0) {
      loadAllVoices()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Group voices by engine
  const voicesByEngine: Record<TTSEngine, Voice[]> = {
    azure: filteredVoices.filter((v) => v.engine === "azure"),
    elevenlabs: filteredVoices.filter((v) => v.engine === "elevenlabs"),
    google: filteredVoices.filter((v) => v.engine === "google"),
    openai: filteredVoices.filter((v) => v.engine === "openai"),
    playht: filteredVoices.filter((v) => v.engine === "playht"),
    polly: filteredVoices.filter((v) => v.engine === "polly"),
    sherpaonnx: filteredVoices.filter((v) => v.engine === "sherpaonnx"),
  }

  return (
    <div className="space-y-6">
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
        <Button onClick={loadAllVoices} className="whitespace-nowrap">
          {Object.values(isLoading).some(Boolean) ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Load All Voices
        </Button>
      </div>

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
          />
        </TabsContent>

        {Object.entries(voicesByEngine).map(
          ([engine, engineVoices]) =>
            engineVoices.length > 0 && (
              <TabsContent key={engine} value={engine} className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">{engine.charAt(0).toUpperCase() + engine.slice(1)} Voices</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadVoices(engine as TTSEngine)}
                    disabled={isLoading[engine as TTSEngine]}
                  >
                    {isLoading[engine as TTSEngine] ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Refresh
                  </Button>
                </div>
                <VoicesList
                  voices={engineVoices}
                  onSelectVoice={handleSelectVoice}
                  onToggleVoice={handleToggleVoice}
                  selectedVoices={selectedVoices}
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
  selectedVoices
}: {
  voices: Voice[];
  onSelectVoice: (voice: Voice) => void;
  onToggleVoice: (voice: Voice) => void;
  selectedVoices: Voice[];
}) {
  if (voices.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No voices found. Try loading voices or adjusting your search.
      </div>
    )
  }

  // Helper function to check if a voice is selected
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
