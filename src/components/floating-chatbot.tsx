"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Send,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Minimize2,
  Maximize2,
  FileText,
  Languages,
  Zap,
} from "lucide-react"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  hasAudio?: boolean
  audioUrl?: string
  isTranscribed?: boolean
}

interface FloatingChatbotProps {
  isOpen: boolean
  onToggle: () => void
}

export function FloatingChatbot({ isOpen, onToggle }: FloatingChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content:
          "Hello! I'm your WHO Emergency Response AI Assistant. I can help you with equipment information, emergency protocols, and answer questions about WHO inventory. You can type, speak, or upload audio files to interact with me!",
        timestamp: new Date(),
        hasAudio: true,
      }
      setMessages([welcomeMessage])
      if (isAudioEnabled) {
        speakMessage(welcomeMessage.content)
      }
    }
  }, [isOpen, isAudioEnabled])

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
      const { text } = await generateText({
        model: groq("llama-3.1-8b-instant"),
        system: `You are a WHO emergency response equipment expert and AI assistant. You have comprehensive knowledge of:
        - WHO emergency health kits and their contents
        - Medical equipment specifications and usage
        - Emergency response protocols and procedures
        - Field deployment strategies
        - Equipment maintenance and safety procedures
        - International health regulations and standards

        Provide accurate, practical, and actionable information. Always prioritize safety and WHO guidelines in your responses.`,
        prompt: message,
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: text,
        timestamp: new Date(),
        hasAudio: true,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Generate speech for the response
      if (isAudioEnabled) {
        await generateSpeech(text)
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/wav" })
        await transcribeAudio(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      setAudioChunks(chunks)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append("file", audioBlob, "audio.wav")
      formData.append("model", "whisper-large-v3-turbo")
      formData.append("response_format", "json")

      const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: formData,
      })

      const result = await response.json()
      if (result.text) {
        const transcribedMessage: Message = {
          id: Date.now().toString(),
          type: "user",
          content: `🎤 ${result.text}`,
          timestamp: new Date(),
          isTranscribed: true,
        }
        setMessages((prev) => [...prev, transcribedMessage])
        await handleSendMessage(result.text)
      }
    } catch (error) {
      console.error("Error transcribing audio:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateSpeech = async (text: string) => {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "playai-tts",
          input: text,
          voice: "Fritz-PlayAI",
          response_format: "mp3",
          speed: 1.0,
        }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audio.play()
      }
    } catch (error) {
      console.error("Error generating speech:", error)
      // Fallback to browser TTS
      speakMessage(text)
    }
  }

  const speakMessage = (content: string) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(content)
      utterance.rate = 0.8
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      await transcribeAudio(file)
    }
  }

  const translateAudio = async (audioBlob: Blob) => {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append("file", audioBlob, "audio.wav")
      formData.append("model", "whisper-large-v3")
      formData.append("response_format", "json")

      const response = await fetch("https://api.groq.com/openai/v1/audio/translations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: formData,
      })

      const result = await response.json()
      if (result.text) {
        const translatedMessage: Message = {
          id: Date.now().toString(),
          type: "user",
          content: `🌐 ${result.text}`,
          timestamp: new Date(),
          isTranscribed: true,
        }
        setMessages((prev) => [...prev, translatedMessage])
        await handleSendMessage(result.text)
      }
    } catch (error) {
      console.error("Error translating audio:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card
        className={`w-96 shadow-2xl border-2 border-purple-200 ${isMinimized ? "h-16" : "h-[600px]"} transition-all duration-300`}
      >
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4" />
              WHO AI Assistant
              <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Groq Powered
              </Badge>
            </CardTitle>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                {isAudioEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={onToggle} className="h-6 w-6 p-0 text-white hover:bg-white/20">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(600px-64px)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.type === "user"
                        ? message.isTranscribed
                          ? "bg-green-600 text-white"
                          : "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.type === "assistant" && (
                        <Brain className="h-3 w-3 mt-0.5 flex-shrink-0 text-purple-600" />
                      )}
                      <div className="flex-1">
                        <p className="text-xs leading-relaxed">{message.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</span>
                          {message.type === "assistant" && message.hasAudio && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => speakMessage(message.content)}
                              className="h-4 w-4 p-0 hover:bg-white/20"
                            >
                              <Volume2 className="h-2 w-2" />
                            </Button>
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
                    <Brain className="h-3 w-3 text-purple-600" />
                    <Loader2 className="h-3 w-3 animate-spin text-purple-600" />
                    <span className="text-xs text-gray-600">Processing...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-3 space-y-2">
              {/* Audio Controls */}
              <div className="flex gap-2 justify-center">
                <Button
                  size="sm"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isRecording ? <MicOff className="h-3 w-3 mr-1" /> : <Mic className="h-3 w-3 mr-1" />}
                  {isRecording ? "Stop" : "Voice"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Upload
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Implement translation mode
                  }}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Languages className="h-3 w-3 mr-1" />
                  Translate
                </Button>
              </div>

              {/* Text Input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask about WHO equipment, protocols, or emergency procedures..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="min-h-[40px] text-xs resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-purple-600 hover:bg-purple-700 self-end"
                  size="sm"
                >
                  {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
          </CardContent>
        )}
      </Card>
    </div>
  )
}
