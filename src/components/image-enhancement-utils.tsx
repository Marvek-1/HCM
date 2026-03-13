"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ImageEnhancementTipsProps {
  className?: string
}

export function ImageEnhancementTips({ className }: ImageEnhancementTipsProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  const enhancementTools = [
    {
      name: "Remove.bg",
      type: "Background Removal",
      description: "AI-powered background removal with clean edges",
      url: "https://remove.bg",
      free: true,
    },
    {
      name: "Upscayl",
      type: "AI Upscaling",
      description: "Free AI image upscaler for HD enhancement",
      url: "https://upscayl.github.io",
      free: true,
    },
    {
      name: "Topaz Gigapixel AI",
      type: "Professional Upscaling",
      description: "Professional-grade AI upscaling up to 600%",
      url: "https://topazlabs.com/gigapixel-ai",
      free: false,
    },
    {
      name: "Adobe Photoshop",
      type: "Professional Editing",
      description: "Complete image editing with shadow removal",
      url: "https://adobe.com/photoshop",
      free: false,
    },
    {
      name: "GIMP",
      type: "Free Professional",
      description: "Free alternative to Photoshop with full editing",
      url: "https://gimp.org",
      free: true,
    },
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">✨ Image Enhancement Recommendations</CardTitle>
        <CardDescription>
          Tools to improve the WHO equipment images with shadow removal and HD enhancement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {enhancementTools.map((tool) => (
            <div
              key={tool.name}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedTool === tool.name ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedTool(selectedTool === tool.name ? null : tool.name)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{tool.name}</div>
                  <div className="text-sm text-gray-600">{tool.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={tool.free ? "default" : "secondary"}>{tool.free ? "Free" : "Paid"}</Badge>
                  <Badge variant="outline">{tool.type}</Badge>
                </div>
              </div>

              {selectedTool === tool.name && (
                <div className="mt-3 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(tool.url, "_blank")
                    }}
                  >
                    Visit {tool.name} →
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">💡 Enhancement Workflow</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Use Remove.bg for clean background removal</li>
            <li>2. Apply Upscayl or Topaz for HD upscaling</li>
            <li>3. Use Photoshop/GIMP for shadow correction</li>
            <li>4. Save in high resolution (300 DPI minimum)</li>
            <li>5. Export as PNG for transparency support</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
