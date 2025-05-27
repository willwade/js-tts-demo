import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CredentialsTab } from "@/components/credentials-tab"
import { VoicesTab } from "@/components/voices-tab"
import { PlaybackTab } from "@/components/playback-tab"
import { ModeToggle } from "@/components/mode-toggle"

export default function Home() {
  return (
    <main className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">TTS Client Demo</h1>
          <p className="text-sm text-muted-foreground">Now with SherpaOnnx WebAssembly TTS for browser-based speech synthesis!</p>
        </div>
        <ModeToggle />
      </div>

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
          <VoicesTab />
        </TabsContent>
        <TabsContent value="playback">
          <PlaybackTab />
        </TabsContent>
      </Tabs>
    </main>
  )
}
