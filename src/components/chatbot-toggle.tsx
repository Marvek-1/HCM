"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { FloatingChatbot } from "./floating-chatbot"

export function ChatbotToggle() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Toggle Button */}
      <div className="fixed bottom-4 right-4 z-40">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
            size="lg"
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </Button>
        )}
      </div>

      {/* Floating Chatbot */}
      <FloatingChatbot isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
    </>
  )
}
