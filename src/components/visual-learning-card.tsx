"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Hand, Subtitles, Volume2, VolumeX, Eye, Download } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface VisualLearningCardProps {
  selectedItem?: any
  isSignLanguageEnabled?: boolean
  fontSize?: string
}

export function VisualLearningCard({ selectedItem, isSignLanguageEnabled, fontSize }: VisualLearningCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [showSubtitles, setShowSubtitles] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [showSignLanguage, setShowSignLanguage] = useState(isSignLanguageEnabled)

  const learningSteps = [
    {
      id: 1,
      title: "Equipment Overview",
      description: "Visual identification of key components",
      image: "/placeholder.svg?height=400&width=600",
      annotations: [
        { x: 20, y: 30, label: "Primary Control Panel", description: "Main operational interface" },
        { x: 60, y: 45, label: "Safety Features", description: "Emergency stop and safety locks" },
        { x: 40, y: 70, label: "Connection Points", description: "Input/output connections" },
      ],
      subtitles: "This is the main control panel where all primary operations are managed...",
      signLanguageVideo: "/sign-language/step1.mp4",
    },
    {
      id: 2,
      title: "Setup Procedure",
      description: "Step-by-step visual setup guide",
      image: "/placeholder.svg?height=400&width=600",
      annotations: [
        { x: 15, y: 25, label: "Step 1", description: "Connect power supply" },
        { x: 45, y: 40, label: "Step 2", description: "Initialize system" },
        { x: 75, y: 60, label: "Step 3", description: "Verify connections" },
      ],
      subtitles: "Begin by connecting the power supply to the designated port...",
      signLanguageVideo: "/sign-language/step2.mp4",
    },
    {
      id: 3,
      title: "Operation Guide",
      description: "Proper usage and best practices",
      image: "/placeholder.svg?height=400&width=600",
      annotations: [
        { x: 30, y: 20, label: "Monitor", description: "Status indicators" },
        { x: 50, y: 50, label: "Controls", description: "Operational controls" },
        { x: 70, y: 80, label: "Output", description: "Results display" },
      ],
      subtitles: "Monitor the status indicators to ensure proper operation...",
      signLanguageVideo: "/sign-language/step3.mp4",
    },
  ]

  const currentStepData = learningSteps[currentStep]

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleNextStep = () => {
    if (currentStep < learningSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0])
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Visual Learning Guide
              {selectedItem && ` - ${selectedItem.name}`}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white">
                Step {currentStep + 1} of {learningSteps.length}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[500px]">
            {/* Main Visual Area */}
            <div className="lg:col-span-2 relative bg-gray-100">
              <div
                className="relative w-full h-full overflow-hidden"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center" }}
              >
                <img
                  src={currentStepData.image || "/placeholder.svg"}
                  alt={currentStepData.title}
                  className="w-full h-full object-contain"
                />

                {/* Interactive Annotations */}
                {currentStepData.annotations.map((annotation, index) => (
                  <div
                    key={index}
                    className="absolute group cursor-pointer"
                    style={{
                      left: `${annotation.x}%`,
                      top: `${annotation.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse">
                      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        <div className="font-semibold">{annotation.label}</div>
                        <div>{annotation.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sign Language Video Overlay */}
              {showSignLanguage && (
                <div className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-white shadow-lg">
                  <video
                    className="w-full h-full object-cover"
                    src={currentStepData.signLanguageVideo}
                    autoPlay={isPlaying}
                    muted={false}
                    loop
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-blue-600 text-white text-xs">
                      <Hand className="h-3 w-3 mr-1" />
                      ASL
                    </Badge>
                  </div>
                </div>
              )}

              {/* Subtitles */}
              {showSubtitles && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white p-3 rounded-lg">
                  <p
                    className={`text-sm ${fontSize === "large" ? "text-base" : fontSize === "small" ? "text-xs" : ""}`}
                  >
                    {currentStepData.subtitles}
                  </p>
                </div>
              )}

              {/* Controls Overlay */}
              <div className="absolute top-4 left-4 flex gap-2">
                <Button size="sm" variant="secondary" onClick={handlePlayPause}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setShowSubtitles(!showSubtitles)}>
                  <Subtitles className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setShowSignLanguage(!showSignLanguage)}>
                  <Hand className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Control Panel */}
            <div className="p-6 bg-white border-l">
              <div className="space-y-6">
                <div>
                  <h3
                    className={`font-bold text-gray-900 mb-2 ${fontSize === "large" ? "text-xl" : fontSize === "small" ? "text-sm" : "text-lg"}`}
                  >
                    {currentStepData.title}
                  </h3>
                  <p
                    className={`text-gray-600 ${fontSize === "large" ? "text-base" : fontSize === "small" ? "text-xs" : "text-sm"}`}
                  >
                    {currentStepData.description}
                  </p>
                </div>

                {/* Navigation Controls */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePrevStep}
                      disabled={currentStep === 0}
                      className="flex-1"
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleNextStep}
                      disabled={currentStep === learningSteps.length - 1}
                      className="flex-1"
                    >
                      Next
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setCurrentStep(0)}>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Restart
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>

                {/* Zoom Controls */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Zoom Level: {zoom}%</label>
                  <Slider
                    value={[zoom]}
                    onValueChange={handleZoomChange}
                    min={50}
                    max={200}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setZoom(Math.max(50, zoom - 25))}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(((currentStep + 1) / learningSteps.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / learningSteps.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Key Points */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Key Points:</h4>
                  <ul className="space-y-1">
                    {currentStepData.annotations.map((annotation, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <span>
                          {annotation.label}: {annotation.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
