"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHydratedTTSStore } from "@/lib/tts-client"
import { useTTS } from "@/hooks/use-tts"
import { useToast } from "@/components/ui/use-toast"
import {
  Play,
  Pause,
  Square,
  Download,
  Loader2,
  Volume2,
  Gauge,
  Music,
  Server,
  Monitor,
  Globe,
  Zap
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function EnhancedPlaybackTab() {
  const { selectedVoice, selectedVoices, isPlaying, setIsPlaying, audioUrl, setAudioUrl } = useHydratedTTSStore()
  const { toast } = useToast()

  const {
    currentMode,
    effectiveMode,
    isLoading,
    synthesizeSpeech,
    canUseMode,
    getBestEngineForMode
  } = useTTS()

  const [text, setText] = useState("Hello, this is a test of the text-to-speech system. How does it sound?")
  const [rate, setRate] = useState([1])
  const [pitch, setPitch] = useState([1])
  const [volume, setVolume] = useState([1])
  const [format, setFormat] = useState("mp3")
  const [selectedVoiceForPlayback, setSelectedVoiceForPlayback] = useState(selectedVoice)
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)

  // Update selected voice when store changes
  useEffect(() => {
    if (selectedVoice && !selectedVoiceForPlayback) {
      setSelectedVoiceForPlayback(selectedVoice)
    }
  }, [selectedVoice, selectedVoiceForPlayback])

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [setIsPlaying])

  // Synthesize speech
  const handleSynthesize = async () => {
    if (!selectedVoiceForPlayback) {
      toast({
        title: "No voice selected",
        description: "Please select a voice first.",
        variant: "destructive",
      })
      return
    }

    if (!text.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter some text to synthesize.",
        variant: "destructive",
      })
      return
    }

    try {
      const options = {
        rate: rate[0],
        pitch: pitch[0],
        volume: volume[0],
        format: format
      }

      const audioUrl = await synthesizeSpeech(text, selectedVoiceForPlayback, options, effectiveMode)

      // Clean up previous audio URL
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl)
      }

      setCurrentAudioUrl(audioUrl)
      setAudioUrl(audioUrl)

      // Load the audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.load()
      }

      toast({
        title: "Speech synthesized",
        description: `Successfully generated audio using ${selectedVoiceForPlayback.engine} in ${effectiveMode} mode.`,
      })
    } catch (error) {
      console.error('Error synthesizing speech:', error)
      toast({
        title: "Synthesis failed",
        description: error instanceof Error ? error.message : "Failed to synthesize speech",
        variant: "destructive",
      })
    }
  }

  // Play/pause audio
  const handlePlayPause = () => {
    if (!audioRef.current || !currentAudioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  // Stop audio
  const handleStop = () => {
    if (!audioRef.current) return

    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setIsPlaying(false)
  }

  // Download audio
  const handleDownload = () => {
    if (!currentAudioUrl || !selectedVoiceForPlayback) return

    const link = document.createElement('a')
    link.href = currentAudioUrl
    link.download = `tts-${selectedVoiceForPlayback.engine}-${selectedVoiceForPlayback.id}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download started",
      description: `Downloading audio file as ${format.toUpperCase()}.`,
    })
  }

  // Get mode icon
  const getModeIcon = () => {
    switch (effectiveMode) {
      case 'server':
        return <Server className="h-4 w-4" />
      case 'browser':
        return <Monitor className="h-4 w-4" />
      case 'hybrid':
        return <Globe className="h-4 w-4" />
      case 'auto':
        return <Zap className="h-4 w-4" />
      default:
        return <Music className="h-4 w-4" />
    }
  }

  // Available voices for selection
  const availableVoices = selectedVoices.length > 0 ? selectedVoices : (selectedVoice ? [selectedVoice] : [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Speech Synthesis</h2>
          <p className="text-muted-foreground">
            Generate speech from text using selected voices
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          {getModeIcon()}
          {effectiveMode.charAt(0).toUpperCase() + effectiveMode.slice(1)} Mode
        </Badge>
      </div>

      {/* Voice Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Selection</CardTitle>
          <CardDescription>
            Choose a voice for speech synthesis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableVoices.length === 0 ? (
            <Alert>
              <AlertDescription>
                No voices selected. Please go to the Voices tab and select at least one voice.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="voice-select">Selected Voice</Label>
              <Select
                value={selectedVoiceForPlayback?.id || ""}
                onValueChange={(value) => {
                  const voice = availableVoices.find(v => v.id === value)
                  if (voice) setSelectedVoiceForPlayback(voice)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map((voice) => (
                    <SelectItem key={`${voice.engine}-${voice.id}`} value={voice.id}>
                      <div className="flex items-center gap-2">
                        <span>{voice.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {voice.engine}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedVoiceForPlayback && (
                <div className="text-sm text-muted-foreground">
                  Engine: {selectedVoiceForPlayback.engine} •
                  Languages: {selectedVoiceForPlayback.languageCodes.map(l => l.display).join(", ")}
                  {selectedVoiceForPlayback.gender && ` • Gender: ${selectedVoiceForPlayback.gender}`}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Text Input */}
      <Card>
        <CardHeader>
          <CardTitle>Text Input</CardTitle>
          <CardDescription>
            Enter the text you want to convert to speech
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <div className="mt-2 text-sm text-muted-foreground">
            Characters: {text.length}
          </div>
        </CardContent>
      </Card>

      {/* Audio Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Audio Controls
          </CardTitle>
          <CardDescription>
            Adjust voice parameters and audio settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rate Control */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              <Label>Speech Rate: {rate[0].toFixed(1)}x</Label>
            </div>
            <Slider
              value={rate}
              onValueChange={setRate}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Pitch Control */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <Label>Pitch: {pitch[0].toFixed(1)}x</Label>
            </div>
            <Slider
              value={pitch}
              onValueChange={setPitch}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <Label>Volume: {Math.round(volume[0] * 100)}%</Label>
            </div>
            <Slider
              value={volume}
              onValueChange={setVolume}
              min={0.1}
              max={1.0}
              step={0.1}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Format Selection */}
          <div className="space-y-2">
            <Label htmlFor="format-select">Audio Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp3">MP3</SelectItem>
                <SelectItem value="wav">WAV</SelectItem>
                <SelectItem value="ogg">OGG</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Playback Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Playback</CardTitle>
          <CardDescription>
            Generate and play your speech
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleSynthesize}
              disabled={isLoading || !selectedVoiceForPlayback || !text.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Generate Speech
            </Button>
          </div>

          {currentAudioUrl && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePlayPause}
                disabled={!currentAudioUrl}
              >
                {isPlaying ? (
                  <Pause className="mr-2 h-4 w-4" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {isPlaying ? "Pause" : "Play"}
              </Button>

              <Button
                variant="outline"
                onClick={handleStop}
                disabled={!currentAudioUrl}
              >
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>

              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={!currentAudioUrl}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          )}

          {/* Hidden audio element */}
          <audio ref={audioRef} preload="none" />
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedPlaybackTab
