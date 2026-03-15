"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Textarea } from "../components/ui/textarea"
import { Brain, Send, Loader2, MessageCircle } from "lucide-react"
import { generateItemExplanation } from "@/lib/ai-explanations"

interface AIExplanationProps {
  item: any
  className?: string
}

export function AIExplanation({ item, className }: AIExplanationProps) {
  const [question, setQuestion] = useState("")
  const [explanation, setExplanation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const handleAskQuestion = async () => {
    if (!question.trim()) return

    setIsLoading(true)
    try {
      const response = await generateItemExplanation(item, question)
      setExplanation(response)
      setShowExplanation(true)
    } catch (error) {
      console.error("Error generating explanation:", error)
      setExplanation("Sorry, I couldn't generate an explanation at this time. Please try again later.")
      setShowExplanation(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickQuestion = async (quickQuestion: string) => {
    setQuestion(quickQuestion)
    setIsLoading(true)
    try {
      const response = await generateItemExplanation(item, quickQuestion)
      setExplanation(response)
      setShowExplanation(true)
    } catch (error) {
      console.error("Error generating explanation:", error)
      setExplanation("Sorry, I couldn't generate an explanation at this time. Please try again later.")
      setShowExplanation(true)
    } finally {
      setIsLoading(false)
    }
  }

  const quickQuestions = [
    "How is this item used in emergency response?",
    "What are the key specifications I should know?",
    "What maintenance does this equipment require?",
    "What are similar alternatives to this item?",
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#005A9C]">
          <Brain className="h-5 w-5" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Questions */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Quick Questions:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickQuestions.map((q, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickQuestion(q)}
                disabled={isLoading}
                className="text-left justify-start h-auto p-2 text-xs hover:bg-[#0093D5]/5 hover:border-[#0093D5]"
              >
                {q}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Question */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Ask a custom question:</p>
          <div className="flex gap-2">
            <Textarea
              placeholder={`Ask anything about ${item.name}...`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[80px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleAskQuestion}
              disabled={isLoading || !question.trim()}
              className="bg-[#0093D5] hover:bg-[#005A9C] self-end"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* AI Response */}
        {showExplanation && (
          <div className="mt-4 p-4 bg-[#0093D5]/5 rounded-lg border border-[#0093D5]/20">
            <div className="flex items-start gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-[#0093D5] mt-1 flex-shrink-0" />
              <p className="text-sm font-medium text-[#005A9C]">AI Explanation:</p>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{explanation}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
