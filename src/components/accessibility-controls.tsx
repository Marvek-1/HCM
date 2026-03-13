"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Hand, Eye, Volume2, Type, Palette, Languages, Settings, Subtitles } from "lucide-react"

interface AccessibilityControlsProps {
  isSignLanguageEnabled: boolean
  setIsSignLanguageEnabled: (enabled: boolean) => void
  isHighContrast: boolean
  setIsHighContrast: (enabled: boolean) => void
  fontSize: string
  setFontSize: (size: string) => void
}

export function AccessibilityControls({
  isSignLanguageEnabled,
  setIsSignLanguageEnabled,
  isHighContrast,
  setIsHighContrast,
  fontSize,
  setFontSize,
}: AccessibilityControlsProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Accessibility Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Accessibility */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visual Accessibility
          </h3>

          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              High Contrast Mode
            </Label>
            <Switch id="high-contrast" checked={isHighContrast} onCheckedChange={setIsHighContrast} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Font Size
            </Label>
            <div className="flex gap-2">
              {["small", "medium", "large"].map((size) => (
                <Button
                  key={size}
                  size="sm"
                  variant={fontSize === size ? "default" : "outline"}
                  onClick={() => setFontSize(size)}
                  className="capitalize"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Hearing Accessibility */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Hearing Accessibility
          </h3>

          <div className="flex items-center justify-between">
            <Label htmlFor="sign-language" className="flex items-center gap-2">
              <Hand className="h-4 w-4" />
              Sign Language Interpretation
            </Label>
            <Switch id="sign-language" checked={isSignLanguageEnabled} onCheckedChange={setIsSignLanguageEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="subtitles" className="flex items-center gap-2">
              <Subtitles className="h-4 w-4" />
              Always Show Subtitles
            </Label>
            <Switch id="subtitles" defaultChecked={true} />
          </div>
        </div>

        {/* Language Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Language Settings
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {["English", "French", "Spanish", "Arabic"].map((language) => (
              <Button
                key={language}
                size="sm"
                variant={language === "English" ? "default" : "outline"}
                className="text-xs"
              >
                {language}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
