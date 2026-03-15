"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Progress } from "../components/ui/progress"
import { Hand, CheckCircle, XCircle, RotateCcw, Play, Pause, Lightbulb, Target, Award, Timer } from "lucide-react"

interface InteractiveSimulationProps {
  selectedItem?: any
  accessibilitySettings?: {
    signLanguage: boolean
    highContrast: boolean
    fontSize: string
  }
}

export function InteractiveSimulation({ selectedItem, accessibilitySettings }: InteractiveSimulationProps) {
  const [currentTask, setCurrentTask] = useState(0)
  const [completedTasks, setCompletedTasks] = useState<number[]>([])
  const [isSimulationActive, setIsSimulationActive] = useState(false)
  const [score, setScore] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  })

  const simulationTasks = [
    {
      id: 1,
      title: "Equipment Identification",
      description: "Drag and drop the correct equipment to their designated areas",
      type: "drag-drop",
      items: [
        { id: "stethoscope", name: "Stethoscope", category: "diagnostic", correctZone: "zone-1" },
        { id: "thermometer", name: "Thermometer", category: "diagnostic", correctZone: "zone-1" },
        { id: "bandage", name: "Bandage", category: "treatment", correctZone: "zone-2" },
        { id: "syringe", name: "Syringe", category: "treatment", correctZone: "zone-2" },
      ],
      zones: [
        { id: "zone-1", label: "Diagnostic Equipment", items: [] },
        { id: "zone-2", label: "Treatment Supplies", items: [] },
      ],
      hint: "Group items by their primary function - diagnostic tools go in one area, treatment supplies in another.",
      successMessage: "Excellent! You've correctly categorized all equipment.",
      points: 25,
    },
    {
      id: 2,
      title: "Setup Sequence",
      description: "Click the steps in the correct order to set up the equipment",
      type: "sequence",
      steps: [
        { id: "step-1", label: "Connect Power", order: 1, completed: false },
        { id: "step-2", label: "Initialize System", order: 2, completed: false },
        { id: "step-3", label: "Calibrate Settings", order: 3, completed: false },
        { id: "step-4", label: "Run Diagnostics", order: 4, completed: false },
        { id: "step-5", label: "Begin Operation", order: 5, completed: false },
      ],
      hint: "Always start with power connection, then follow the logical sequence of system initialization.",
      successMessage: "Perfect sequence! The equipment is now ready for operation.",
      points: 30,
    },
    {
      id: 3,
      title: "Emergency Response",
      description: "Select the appropriate actions for this emergency scenario",
      type: "multiple-choice",
      scenario: "A patient arrives with severe bleeding from a leg wound.",
      options: [
        { id: "option-1", text: "Apply direct pressure to the wound", correct: true },
        { id: "option-2", text: "Elevate the injured limb", correct: true },
        { id: "option-3", text: "Apply a tourniquet immediately", correct: false },
        { id: "option-4", text: "Clean the wound with alcohol", correct: false },
        { id: "option-5", text: "Monitor vital signs", correct: true },
      ],
      hint: "Focus on immediate life-saving actions first, then supportive care.",
      successMessage: "Excellent emergency response! You've prioritized the most critical actions.",
      points: 35,
    },
  ]

  const currentTaskData = simulationTasks[currentTask]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSimulationActive) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isSimulationActive])

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault()
    if (!draggedItem) return

    const item = currentTaskData.items?.find((item) => item.id === draggedItem)
    if (item && item.correctZone === zoneId) {
      setScore((prev) => prev + 5)
      setFeedback({ type: "success", message: `Correct! ${item.name} belongs in ${zoneId.replace("-", " ")}` })
      // Add logic to move item to correct zone
    } else {
      setFeedback({ type: "error", message: "Try again! That item belongs in a different zone." })
    }

    setDraggedItem(null)
    setTimeout(() => setFeedback({ type: null, message: "" }), 3000)
  }

  const handleTaskComplete = () => {
    setCompletedTasks((prev) => [...prev, currentTask])
    setScore((prev) => prev + currentTaskData.points)

    if (currentTask < simulationTasks.length - 1) {
      setCurrentTask((prev) => prev + 1)
    } else {
      setIsSimulationActive(false)
      // Show completion modal or summary
    }
  }

  const resetSimulation = () => {
    setCurrentTask(0)
    setCompletedTasks([])
    setScore(0)
    setTimeElapsed(0)
    setIsSimulationActive(false)
    setFeedback({ type: null, message: "" })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Hand className="h-5 w-5" />
              Interactive Simulation
              {selectedItem && ` - ${selectedItem.name}`}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Timer className="h-3 w-3 mr-1" />
                {formatTime(timeElapsed)}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Award className="h-3 w-3 mr-1" />
                {score} pts
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Simulation Area */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">{currentTaskData.title}</h3>
                  <p className="text-gray-600">{currentTaskData.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowHint(!showHint)}>
                    <Lightbulb className="h-4 w-4 mr-1" />
                    Hint
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsSimulationActive(!isSimulationActive)}
                    className={isSimulationActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                  >
                    {isSimulationActive ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                    {isSimulationActive ? "Pause" : "Start"}
                  </Button>
                </div>
              </div>

              {/* Hint Display */}
              {showHint && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <p className="text-yellow-800">{currentTaskData.hint}</p>
                  </div>
                </div>
              )}

              {/* Feedback Display */}
              {feedback.type && (
                <div
                  className={`border rounded-lg p-4 ${
                    feedback.type === "success"
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {feedback.type === "success" ? (
                      <CheckCircle className="h-5 w-5 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 mt-0.5" />
                    )}
                    <p>{feedback.message}</p>
                  </div>
                </div>
              )}

              {/* Task-Specific Content */}
              {currentTaskData.type === "drag-drop" && (
                <div className="space-y-6">
                  {/* Draggable Items */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-3">Available Equipment:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {currentTaskData.items?.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          className="bg-white p-3 rounded-lg border-2 border-dashed border-gray-300 cursor-move hover:border-blue-400 transition-colors text-center"
                        >
                          <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                          <p className="text-sm font-medium">{item.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Drop Zones */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentTaskData.zones?.map((zone) => (
                      <div
                        key={zone.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, zone.id)}
                        className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-center"
                      >
                        <Target className="h-8 w-8 text-blue-400 mb-2" />
                        <h4 className="font-medium text-blue-800">{zone.label}</h4>
                        <p className="text-sm text-blue-600 text-center mt-2">Drop appropriate items here</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentTaskData.type === "sequence" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {currentTaskData.steps?.map((step, index) => (
                      <Button
                        key={step.id}
                        variant={step.completed ? "default" : "outline"}
                        className={`h-auto p-4 flex flex-col items-center gap-2 ${
                          step.completed ? "bg-green-600 hover:bg-green-700" : ""
                        }`}
                        onClick={() => {
                          // Handle step selection logic
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{step.order}</span>
                          {step.completed && <CheckCircle className="h-4 w-4" />}
                        </div>
                        <span className="text-sm">{step.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {currentTaskData.type === "multiple-choice" && (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Scenario:</h4>
                    <p className="text-blue-800">{currentTaskData.scenario}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Select all appropriate actions:</h4>
                    {currentTaskData.options?.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="mt-1"
                          onChange={() => {
                            // Handle option selection
                          }}
                        />
                        <span>{option.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Progress Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{Math.round((completedTasks.length / simulationTasks.length) * 100)}%</span>
                    </div>
                    <Progress value={(completedTasks.length / simulationTasks.length) * 100} />
                  </div>

                  <div className="space-y-2">
                    {simulationTasks.map((task, index) => (
                      <div key={task.id} className="flex items-center gap-2 text-sm">
                        {completedTasks.includes(index) ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : index === currentTask ? (
                          <div className="h-4 w-4 border-2 border-blue-600 rounded-full animate-pulse" />
                        ) : (
                          <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                        )}
                        <span className={index === currentTask ? "font-medium" : ""}>{task.title}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <Button size="sm" variant="outline" onClick={resetSimulation} className="w-full">
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Score:</span>
                    <span className="font-bold text-green-600">{score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Time:</span>
                    <span className="font-mono">{formatTime(timeElapsed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Completed:</span>
                    <span>
                      {completedTasks.length}/{simulationTasks.length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
