"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Send,
  Loader2,
  MessageCircle,
  Lightbulb,
  Target,
  Users,
  Volume2,
  VolumeX,
  Hand,
  RefreshCw,
} from "lucide-react"
import { generateItemExplanation, generateCategoryOverview } from "@/lib/ai-explanations"

interface AILearningAssistantProps {
  selectedItem?: any
  selectedCategory?: string
  accessibilitySettings?: {
    signLanguage: boolean
    highContrast: boolean
    fontSize: string
  }
}

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  hasAudio?: boolean
  hasSignLanguage?: boolean
}

export function AILearningAssistant({
  selectedItem,
  selectedCategory,
  accessibilitySettings,
}: AILearningAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedQuickPrompt, setSelectedQuickPrompt] = useState("")
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickPrompts = [
    {
      category: "Usage",
      prompts: [
        "How do I properly use this equipment?",
        "What are the safety precautions?",
        "When should this equipment be used?",
        "What are common mistakes to avoid?",
      ],
    },
    {
      category: "Maintenance",
      prompts: [
        "How do I maintain this equipment?",
        "What are the cleaning procedures?",
        "How often should maintenance be performed?",
        "What are signs of equipment failure?",
      ],
    },
    {
      category: "Emergency",
      prompts: [
        "How is this used in emergency situations?",
        "What are the emergency protocols?",
        "How do I troubleshoot quickly?",
        "What are alternative solutions?",
      ],
    },
    {
      category: "Training",
      prompts: [
        "How do I train others on this equipment?",
        "What are the key learning points?",
        "How do I assess competency?",
        "What are common training challenges?",
      ],
    },
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initialize with a welcome message
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: selectedItem
          ? `Hello! I'm your AI learning assistant. I'm here to help you understand everything about ${selectedItem.name}. Let me demonstrate with some common questions about WHO emergency equipment usage and protocols.`
          : `Hello! I'm your AI learning assistant for WHO emergency response equipment. Let me show you how I can help with equipment usage and emergency protocols. Try asking me about specific equipment or use the quick prompts on the left!`,
        timestamp: new Date(),
        hasAudio: true,
        hasSignLanguage: accessibilitySettings?.signLanguage,
      }
      setMessages([welcomeMessage])
    }
  }, [selectedItem, accessibilitySettings?.signLanguage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (message: string = inputMessage) => {
    if (!message.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      let response: string
      if (selectedItem) {
        response = await generateItemExplanation(selectedItem, message)
      } else if (selectedCategory) {
        response = await generateCategoryOverview(selectedCategory, [])
      } else {
        response = `I'd be happy to help you learn about WHO emergency response equipment. Could you please specify which equipment or category you'd like to learn about?`
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
        timestamp: new Date(),
        hasAudio: true,
        hasSignLanguage: accessibilitySettings?.signLanguage,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Text-to-speech for accessibility
      if (isAudioEnabled && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(response)
        utterance.rate = 0.8
        utterance.pitch = 1
        speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error("Error generating response:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "I apologize, but I'm having trouble generating a response right now. Please try again or rephrase your question.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setSelectedQuickPrompt(prompt)
    handleSendMessage(prompt)
  }

  const clearConversation = () => {
    setMessages([])
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: "assistant",
      content: "Conversation cleared. How can I help you learn today?",
      timestamp: new Date(),
      hasAudio: true,
      hasSignLanguage: accessibilitySettings?.signLanguage,
    }
    setMessages([welcomeMessage])
  }

  const speakMessage = (content: string) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel() // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(content)
      utterance.rate = 0.8
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Learning Assistant
              {selectedItem && ` - ${selectedItem.name}`}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className="bg-white/20 text-white hover:bg-white/30"
              >
                {isAudioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              {accessibilitySettings?.signLanguage && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <Hand className="h-3 w-3 mr-1" />
                  ASL
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 h-[600px]">
            {/* Quick Prompts Sidebar */}
            <div className="lg:col-span-1 bg-gray-50 p-4 border-r overflow-y-auto">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Quick Questions
              </h3>

              <div className="space-y-4">
                {quickPrompts.map((category) => (
                  <div key={category.category}>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      {category.category === "Usage" && <Target className="h-3 w-3" />}
                      {category.category === "Maintenance" && <RefreshCw className="h-3 w-3" />}
                      {category.category === "Emergency" && <MessageCircle className="h-3 w-3" />}
                      {category.category === "Training" && <Users className="h-3 w-3" />}
                      {category.category}
                    </h4>
                    <div className="space-y-1">
                      {category.prompts.map((prompt, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuickPrompt(prompt)}
                          className="w-full text-left justify-start h-auto p-2 text-xs hover:bg-purple-50 hover:text-purple-700"
                          disabled={isLoading}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <Button size="sm" variant="outline" onClick={clearConversation} className="w-full">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Clear Chat
                </Button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.type === "user" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.type === "assistant" && (
                          <Brain className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-600" />
                        )}
                        <div className="flex-1">
                          <p
                            className={`text-sm ${accessibilitySettings?.fontSize === "large" ? "text-base" : accessibilitySettings?.fontSize === "small" ? "text-xs" : ""}`}
                          >
                            {message.content}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</span>
                            {message.type === "assistant" && (
                              <div className="flex gap-1">
                                {message.hasAudio && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => speakMessage(message.content)}
                                    className="h-6 w-6 p-0 hover:bg-white/20"
                                  >
                                    <Volume2 className="h-3 w-3" />
                                  </Button>
                                )}
                                {message.hasSignLanguage && (
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-white/20">
                                    <Hand className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask me anything about this equipment..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="min-h-[60px] resize-none"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !inputMessage.trim()}
                    className="bg-purple-600 hover:bg-purple-700 self-end"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
