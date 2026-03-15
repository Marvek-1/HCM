"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
  BookOpen,
  FileText,
  Users,
  Brain,
  Play,
  Volume2,
  Subtitles,
  Eye,
  Hand,
  Languages,
  Share2,
  Bookmark,
  Search,
} from "lucide-react"
import { Input } from "../components/ui/input"
import { VisualLearningCard } from "../components/visual-learning-card"
import { InteractiveSimulation } from "../components/interactive-simulation"
import { AILearningAssistant } from "../components/ai-learning-assistant"
import { AccessibilityControls } from "../components/accessibility-controls"

interface KnowledgeHubProps {
  selectedCategory?: string
  selectedItem?: any
}

export function KnowledgeHub({ selectedCategory, selectedItem }: KnowledgeHubProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [isSignLanguageEnabled, setIsSignLanguageEnabled] = useState(false)
  const [isHighContrast, setIsHighContrast] = useState(false)
  const [fontSize, setFontSize] = useState("medium")

  const learningModules = [
    {
      id: "emergency-response-basics",
      title: "Emergency Response Fundamentals",
      category: "Foundation",
      duration: "15 min",
      difficulty: "Beginner",
      type: "interactive",
      hasSignLanguage: true,
      hasSubtitles: true,
      description: "Learn the core principles of emergency response and WHO protocols",
      visualElements: ["infographics", "animations", "diagrams"],
      accessibilityFeatures: ["sign-language", "subtitles", "audio-description", "high-contrast"],
    },
    {
      id: "equipment-identification",
      title: "Equipment Identification & Usage",
      category: "Equipment",
      duration: "20 min",
      difficulty: "Intermediate",
      type: "visual",
      hasSignLanguage: true,
      hasSubtitles: true,
      description: "Visual guide to identifying and properly using emergency equipment",
      visualElements: ["3d-models", "step-by-step", "comparisons"],
      accessibilityFeatures: ["sign-language", "subtitles", "tactile-feedback", "voice-navigation"],
    },
    {
      id: "maintenance-protocols",
      title: "Equipment Maintenance Protocols",
      category: "Maintenance",
      duration: "25 min",
      difficulty: "Advanced",
      type: "simulation",
      hasSignLanguage: true,
      hasSubtitles: true,
      description: "Hands-on simulation of equipment maintenance procedures",
      visualElements: ["simulations", "checklists", "progress-tracking"],
      accessibilityFeatures: ["sign-language", "subtitles", "haptic-feedback", "screen-reader"],
    },
  ]

  const filteredModules = learningModules.filter((module) => {
    const matchesSearch =
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === "all" || module.category.toLowerCase() === selectedFilter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 ${isHighContrast ? "high-contrast" : ""}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with Accessibility Controls */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h1
                className={`text-3xl font-bold text-gray-900 mb-2 ${fontSize === "large" ? "text-4xl" : fontSize === "small" ? "text-2xl" : ""}`}
              >
                Knowledge Hub
              </h1>
              <p className="text-gray-600">Interactive learning for emergency response excellence</p>
            </div>

            <AccessibilityControls
              isSignLanguageEnabled={isSignLanguageEnabled}
              setIsSignLanguageEnabled={setIsSignLanguageEnabled}
              isHighContrast={isHighContrast}
              setIsHighContrast={setIsHighContrast}
              fontSize={fontSize}
              setFontSize={setFontSize}
            />
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search learning modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["all", "foundation", "equipment", "maintenance"].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                  className="capitalize"
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="visual" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Visual</span>
            </TabsTrigger>
            <TabsTrigger value="interactive" className="flex items-center gap-2">
              <Hand className="h-4 w-4" />
              <span className="hidden sm:inline">Interactive</span>
            </TabsTrigger>
            <TabsTrigger value="ai-tutor" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI Tutor</span>
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">Access</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.map((module) => (
                <Card
                  key={module.id}
                  className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="mb-2">
                        {module.category}
                      </Badge>
                      <div className="flex gap-1">
                        {module.hasSignLanguage && (
                          <Badge variant="outline" className="text-xs">
                            <Hand className="h-3 w-3 mr-1" />
                            ASL
                          </Badge>
                        )}
                        {module.hasSubtitles && (
                          <Badge variant="outline" className="text-xs">
                            <Subtitles className="h-3 w-3 mr-1" />
                            CC
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {module.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 text-sm">{module.description}</p>

                    <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                      <span>{module.duration}</span>
                      <span className="capitalize">{module.difficulty}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {module.visualElements.map((element) => (
                        <Badge key={element} variant="outline" className="text-xs">
                          {element}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                      <Button size="sm" variant="outline">
                        <Bookmark className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="visual" className="space-y-6">
            <VisualLearningCard
              selectedItem={selectedItem}
              isSignLanguageEnabled={isSignLanguageEnabled}
              fontSize={fontSize}
            />
          </TabsContent>

          <TabsContent value="interactive" className="space-y-6">
            <InteractiveSimulation
              selectedItem={selectedItem}
              accessibilitySettings={{
                signLanguage: isSignLanguageEnabled,
                highContrast: isHighContrast,
                fontSize: fontSize,
              }}
            />
          </TabsContent>

          <TabsContent value="ai-tutor" className="space-y-6">
            <AILearningAssistant
              selectedItem={selectedItem}
              selectedCategory={selectedCategory}
              accessibilitySettings={{
                signLanguage: isSignLanguageEnabled,
                highContrast: isHighContrast,
                fontSize: fontSize,
              }}
            />
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Accessibility Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-blue-600">Visual Accessibility</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-green-500" />
                        High contrast mode
                      </li>
                      <li className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-green-500" />
                        Adjustable font sizes
                      </li>
                      <li className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-green-500" />
                        Color-blind friendly palettes
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-blue-600">Hearing Accessibility</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Hand className="h-4 w-4 text-green-500" />
                        Sign language interpretation
                      </li>
                      <li className="flex items-center gap-2">
                        <Subtitles className="h-4 w-4 text-green-500" />
                        Closed captions
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-500" />
                        Visual transcripts
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-blue-600">Interactive Features</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Hand className="h-4 w-4 text-green-500" />
                        Haptic feedback
                      </li>
                      <li className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-green-500" />
                        Voice navigation
                      </li>
                      <li className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-green-500" />
                        AI-powered assistance
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Learning Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {learningModules.map((module) => (
                      <div key={module.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{module.title}</h4>
                          <p className="text-sm text-gray-600">{module.category}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.random() * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{Math.floor(Math.random() * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">🏆</div>
                      <div>
                        <p className="font-medium text-sm">Quick Learner</p>
                        <p className="text-xs text-gray-600">Completed 3 modules</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">🎯</div>
                      <div>
                        <p className="font-medium text-sm">Focused</p>
                        <p className="text-xs text-gray-600">100% completion rate</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
