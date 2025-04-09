"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { saveAudioAsWav, synthesizeSpeech, useTTSStore } from "@/lib/tts-client"
import { useToast } from "@/components/ui/use-toast"
import { Download, Loader2, Pause, Play, Volume2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

export function PlaybackTab() {
  const { selectedVoice, audioUrl, setAudioUrl, isPlaying, setIsPlaying } = useTTSStore()
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

  // Generate speech
  const handleGenerateSpeech = async () => {
    if (!selectedVoice) {
      toast({
        title: "No voice selected",
        description: "Please select a voice from the Voices tab first.",
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

      const url = await synthesizeSpeech(text, selectedVoice, options)
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
      await saveAudioAsWav(audioUrl, `tts-${selectedVoice?.engine}-${selectedVoice?.name}.wav`)
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
          {selectedVoice ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Selected Voice:</span>
              <Badge variant="secondary">{selectedVoice.name}</Badge>
              <Badge variant="outline">{selectedVoice.engine}</Badge>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No voice selected. Please select a voice from the Voices tab.
            </div>
          )}

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

            <Button onClick={handleGenerateSpeech} disabled={isGenerating || !selectedVoice}>
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
