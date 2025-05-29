"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Info,
  ChevronDown,
  Key,
  Server,
  Monitor
} from "lucide-react"
import { getCredentialStatus, getEnginesWithCredentials, ENV_VAR_MAPPING } from "@/lib/env-credentials"
import { getEngineConfig } from "@/lib/tts-config"
import { useHydratedTTSStore } from "@/lib/tts-client"
import { TTSEngine } from "@/lib/tts-client"

export function CredentialsStatus() {
  const { refreshCredentialsFromEnv } = useHydratedTTSStore()
  const [credentialStatus, setCredentialStatus] = useState<any>({})
  const [enginesWithCreds, setEnginesWithCreds] = useState<TTSEngine[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load credential status
  useEffect(() => {
    const status = getCredentialStatus()
    const engines = getEnginesWithCredentials()
    setCredentialStatus(status)
    setEnginesWithCreds(engines)
  }, [])

  // Refresh credentials from environment
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      refreshCredentialsFromEnv()

      // Reload status
      const status = getCredentialStatus()
      const engines = getEnginesWithCredentials()
      setCredentialStatus(status)
      setEnginesWithCreds(engines)

      // Show success feedback
      setTimeout(() => setIsRefreshing(false), 500)
    } catch (error) {
      console.error('Error refreshing credentials:', error)
      setIsRefreshing(false)
    }
  }

  // Get engine icon
  const getEngineIcon = (engine: TTSEngine) => {
    const config = getEngineConfig(engine)
    if (config.type === 'browser') return <Monitor className="h-4 w-4" />
    if (config.type === 'server') return <Server className="h-4 w-4" />
    return <Key className="h-4 w-4" />
  }

  // Count engines by status
  const engineCounts = {
    withCredentials: enginesWithCreds.length,
    total: Object.keys(credentialStatus).length,
    needingCredentials: Object.values(credentialStatus).filter((status: any) =>
      status.missingVars.length > 0 && !status.hasCredentials
    ).length
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Environment Credentials
            </CardTitle>
            <CardDescription>
              Automatically loaded from environment variables
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {engineCounts.withCredentials}/{engineCounts.total} Ready
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {engineCounts.withCredentials}
            </div>
            <div className="text-sm text-muted-foreground">Ready</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {engineCounts.needingCredentials}
            </div>
            <div className="text-sm text-muted-foreground">Need Setup</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {engineCounts.total - engineCounts.withCredentials - engineCounts.needingCredentials}
            </div>
            <div className="text-sm text-muted-foreground">No Creds Needed</div>
          </div>
        </div>

        {/* Quick Status */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {engineCounts.withCredentials > 0 ? (
              <>
                <strong>{engineCounts.withCredentials} engines</strong> are ready with environment credentials.
                {engineCounts.needingCredentials > 0 && (
                  <> <strong>{engineCounts.needingCredentials} engines</strong> need additional setup.</>
                )}
              </>
            ) : (
              <>
                No environment credentials detected. You can add them to your <code>.env.local</code> file
                or configure them manually in the Credentials tab.
              </>
            )}
          </AlertDescription>
        </Alert>

        {/* Detailed Status */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span>Detailed Status</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-4">
            {Object.entries(credentialStatus).map(([engine, status]: [string, any]) => {
              const engineConfig = getEngineConfig(engine as TTSEngine)
              const envMapping = ENV_VAR_MAPPING[engine as TTSEngine]

              return (
                <div key={engine} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getEngineIcon(engine as TTSEngine)}
                    <div>
                      <div className="font-medium">{engineConfig.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {Object.keys(envMapping).length === 0 ? (
                          'No credentials required'
                        ) : status.hasCredentials ? (
                          `${status.availableVars.length}/${Object.keys(envMapping).length} variables loaded`
                        ) : (
                          `Missing: ${status.missingVars.join(', ')}`
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {Object.keys(envMapping).length === 0 ? (
                      <Badge variant="secondary">No Creds Needed</Badge>
                    ) : status.hasCredentials ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Badge variant="default">Ready</Badge>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <Badge variant="destructive">Missing</Badge>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Environment Variable Guide */}
        {engineCounts.needingCredentials > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>To add environment credentials:</strong>
              <br />
              1. Create or edit your <code>.env.local</code> file
              <br />
              2. Add the missing environment variables (see detailed status above)
              <br />
              3. Restart your development server
              <br />
              4. Click the "Refresh" button above
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default CredentialsStatus
