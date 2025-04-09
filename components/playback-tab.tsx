"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { saveAudioAsWav, synthesizeSpeech, useTTSStore, type Voice } from "@/lib/tts-client"
import { useToast } from "@/components/ui/use-toast"
import { Download, Loader2, Pause, Play, Volume2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

export function PlaybackTab() {
  const { selectedVoice, selectedVoices, audioUrl, setAudioUrl, isPlaying, setIsPlaying, credentials } = useTTSStore()
  const [activeVoice, setActiveVoice] = useState<Voice | null>(selectedVoice)
  const { toast } = useToast()
  const [text, setText] = useState(
    "Hello, this is a test of the Text to Speech API. It sounds quite natural, doesn't it?",
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [volume, setVolume] = useState(80)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Create audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.onended = () => setIsPlaying(false)
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [setIsPlaying])

  // Update audio source when URL changes
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl
      audioRef.current.volume = volume / 100
    }
  }, [audioUrl, volume])

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error)
          setIsPlaying(false)
          toast({
            title: "Playback error",
            description: "Failed to play audio. Please try again.",
            variant: "destructive",
          })
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, setIsPlaying, toast])

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  // Update active voice when selectedVoice changes
  useEffect(() => {
    if (selectedVoice && credentials[selectedVoice.engine]?.enabled) {
      setActiveVoice(selectedVoice)
    } else if (selectedVoices.length > 0) {
      // Find the first voice from an enabled engine
      const enabledVoice = selectedVoices.find(voice => credentials[voice.engine]?.enabled)
      if (enabledVoice) {
        setActiveVoice(enabledVoice)
      }
    } else {
      setActiveVoice(null)
    }
  }, [selectedVoice, selectedVoices, credentials])

  // Generate speech
  const handleGenerateSpeech = async () => {
    if (!activeVoice) {
      toast({
        title: "No voice selected",
        description: "Please select a voice from the dropdown or from the Voices tab.",
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

    setIsGenerating(true)
    setIsPlaying(false)

    try {
      // Pass volume as an option
      const options = {
        volume: volume / 100, // Convert percentage to decimal
        format: "mp3",
      }

      const url = await synthesizeSpeech(text, activeVoice, options)
      setAudioUrl(url)

      toast({
        title: "Speech generated",
        description: "Text has been successfully converted to speech.",
      })

      // Auto-play
      setIsPlaying(true)
    } catch (error) {
      console.error("Error generating speech:", error)
      toast({
        title: "Generation error",
        description: error instanceof Error ? error.message : "Failed to generate speech. Please check your credentials and try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Save audio as WAV
  const handleSaveAudio = async () => {
    if (!audioUrl) {
      toast({
        title: "No audio available",
        description: "Please generate speech first.",
        variant: "destructive",
      })
      return
    }

    try {
      await saveAudioAsWav(audioUrl, `tts-${activeVoice?.engine}-${activeVoice?.name}.wav`)
      toast({
        title: "Audio saved",
        description: "Audio file has been saved to your device.",
      })
    } catch (error) {
      console.error("Error saving audio:", error)
      toast({
        title: "Save error",
        description: "Failed to save audio file. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Text to Speech</CardTitle>
          <CardDescription>Enter text to convert to speech using the selected voice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Voice selector dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Select Voice:</label>
              <select
                className="p-2 border rounded-md bg-background"
                value={activeVoice ? `${activeVoice.engine}-${activeVoice.id}` : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) return;

                  // Extract engine and ID from the value
                  // The ID might contain hyphens, so we need to be careful with the split
                  const firstHyphenIndex = value.indexOf('-');
                  if (firstHyphenIndex === -1) return;

                  const engine = value.substring(0, firstHyphenIndex);
                  const id = value.substring(firstHyphenIndex + 1);

                  console.log(`Selected voice: engine=${engine}, id=${id}`);

                  // Find the voice in the selected voices
                  const voice = [...selectedVoices, selectedVoice].filter(Boolean).find(
                    v => v && v.engine === engine && v.id === id
                  );

                  if (voice) {
                    console.log('Found voice:', voice);
                    setActiveVoice(voice);
                  } else {
                    console.error('Voice not found for:', engine, id);
                  }
                }}
              >
                <option value="">-- Select a voice --</option>
                {selectedVoice && credentials[selectedVoice.engine]?.enabled && (
                  <option value={`${selectedVoice.engine}-${selectedVoice.id}`}>
                    {selectedVoice.name} ({selectedVoice.engine}) - Primary
                  </option>
                )}
                {selectedVoices
                  .filter(v => credentials[v.engine]?.enabled) // Only show voices from enabled engines
                  .filter(v => !selectedVoice || v.id !== selectedVoice.id || v.engine !== selectedVoice.engine)
                  .map(voice => (
                    <option key={`${voice.engine}-${voice.id}`} value={`${voice.engine}-${voice.id}`}>
                      {voice.name} ({voice.engine})
                    </option>
                  ))
                }
              </select>
            </div>

            {/* Active voice display */}
            {activeVoice ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Active Voice:</span>
                <Badge variant="secondary">{activeVoice.name}</Badge>
                <Badge variant="outline">{activeVoice.engine}</Badge>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No voice selected. Please select a voice from the dropdown or from the Voices tab.
              </div>
            )}
          </div>

          <Textarea
            placeholder="Enter text to convert to speech..."
            className="min-h-[150px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="flex items-center gap-4">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[volume]}
              onValueChange={(values) => setVolume(values[0])}
              max={100}
              step={1}
              className="w-[120px]"
            />
            <span className="text-sm text-muted-foreground">{volume}%</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setIsPlaying(!isPlaying)} disabled={!audioUrl || isGenerating}>
            {isPlaying ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Play
              </>
            )}
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveAudio} disabled={!audioUrl || isGenerating}>
              <Download className="mr-2 h-4 w-4" />
              Save as WAV
            </Button>

            <Button onClick={handleGenerateSpeech} disabled={isGenerating || !activeVoice}>
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Volume2 className="mr-2 h-4 w-4" />}
              Generate Speech
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Options</CardTitle>
          <CardDescription>Configure additional TTS settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <p className="mb-2">The following features are available depending on the selected engine:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>SSML support (Azure, Google, Polly)</li>
              <li>Word boundary events for synchronized animations</li>
              <li>Voice cloning (ElevenLabs, PlayHT)</li>
              <li>Streaming synthesis for real-time audio</li>
              <li>Offline synthesis (SherpaOnnx)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
