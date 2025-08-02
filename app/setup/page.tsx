"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SetupPage() {
  const [apiKey, setApiKey] = useState("")
  const [publicationId, setPublicationId] = useState("")
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const { toast } = useToast()

  const testConnection = async () => {
    if (!apiKey || !publicationId) {
      toast({
        title: "Missing Information",
        description: "Please enter both API Key and Publication ID",
        variant: "destructive",
      })
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus("idle")

    try {
      const response = await fetch("/api/test-beehiiv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          publicationId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setConnectionStatus("success")
        toast({
          title: "Connection Successful!",
          description: "Your Beehiiv integration is working correctly.",
        })
      } else {
        setConnectionStatus("error")
        setErrorMessage(data.error || "Failed to connect to Beehiiv")
        toast({
          title: "Connection Failed",
          description: data.error || "Failed to connect to Beehiiv",
          variant: "destructive",
        })
      }
    } catch (error) {
      setConnectionStatus("error")
      setErrorMessage("Network error occurred")
      toast({
        title: "Network Error",
        description: "Failed to test connection",
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">ArtHouse Setup</h1>
          <p className="text-gray-400">Configure your Beehiiv integration with Vercel</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Configuration Card */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Beehiiv Configuration</CardTitle>
              <CardDescription>Enter your Beehiiv API credentials to connect your newsletter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your Beehiiv API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publicationId">Publication ID</Label>
                <Input
                  id="publicationId"
                  placeholder="Enter your Publication ID"
                  value={publicationId}
                  onChange={(e) => setPublicationId(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <Button onClick={testConnection} disabled={isTestingConnection} className="w-full">
                {isTestingConnection ? "Testing Connection..." : "Test Connection"}
              </Button>

              {connectionStatus === "success" && (
                <Alert className="border-green-500 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-400">
                    Connection successful! Your Beehiiv integration is working.
                  </AlertDescription>
                </Alert>
              )}

              {connectionStatus === "error" && (
                <Alert className="border-red-500 bg-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-400">{errorMessage}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Setup Instructions</CardTitle>
              <CardDescription>Follow these steps to get your Beehiiv credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
                    1
                  </div>
                  <div>
                    <p className="text-sm text-white">Go to your Beehiiv dashboard</p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-blue-400 hover:text-blue-300"
                      onClick={() => window.open("https://app.beehiiv.com", "_blank")}
                    >
                      Open Beehiiv Dashboard <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
                    2
                  </div>
                  <p className="text-sm text-gray-300">Navigate to Settings → API</p>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
                    3
                  </div>
                  <p className="text-sm text-gray-300">Generate a new API key with read/write permissions</p>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
                    4
                  </div>
                  <p className="text-sm text-gray-300">Copy your Publication ID from the publication settings</p>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
                    5
                  </div>
                  <p className="text-sm text-gray-300">Add these as environment variables in Vercel</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables Card */}
          <Card className="bg-gray-900 border-gray-800 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Vercel Environment Variables</CardTitle>
              <CardDescription>Add these environment variables to your Vercel project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <code className="text-green-400">BEEHIIV_API_KEY</code>
                    <p className="text-xs text-gray-400 mt-1">Your Beehiiv API key</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("BEEHIIV_API_KEY", "Environment variable name")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <code className="text-green-400">BEEHIIV_PUBLICATION_ID</code>
                    <p className="text-xs text-gray-400 mt-1">Your publication ID</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("BEEHIIV_PUBLICATION_ID", "Environment variable name")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Alert className="border-blue-500 bg-blue-500/10">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-400">
                  After adding environment variables in Vercel, redeploy your application for changes to take effect.
                </AlertDescription>
              </Alert>

              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => window.open("https://vercel.com/dashboard", "_blank")}
              >
                Open Vercel Dashboard <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="link"
            onClick={() => (window.location.href = "/")}
            className="text-gray-400 hover:text-white"
          >
            ← Back to ArtHouse
          </Button>
        </div>
      </div>
    </div>
  )
}
