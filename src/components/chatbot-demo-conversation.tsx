"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Mic, Volume2, AlertTriangle, Shield, Users, Clock, MapPin, FileText, Zap, Play } from "lucide-react"

interface DemoMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  hasAudio?: boolean
  isVoice?: boolean
  category?: string
}

export function ChatbotDemoConversation() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const demoConversation: DemoMessage[] = [
    {
      id: "1",
      type: "user",
      content: "🎤 What are the key WHO emergency response procedures for disease outbreaks?",
      timestamp: new Date(),
      isVoice: true,
    },
    {
      id: "2",
      type: "assistant",
      content: `**WHO Emergency Response Procedures for Disease Outbreaks:**

🚨 **Immediate Response (0-24 hours):**
• **Verification & Assessment** - Confirm outbreak reports through epidemiological investigation
• **Risk Assessment** - Evaluate public health risk using WHO risk assessment framework
• **Notification** - Report to WHO within 24 hours per International Health Regulations (IHR 2005)
• **Activate Emergency Operations** - Deploy Incident Management System (IMS)

⚡ **Rapid Response (24-72 hours):**
• **Deploy GOARN Teams** - Global Outbreak Alert and Response Network activation
• **Establish Coordination** - Set up Emergency Operations Center (EOC)
• **Resource Mobilization** - Deploy emergency health kits (IEHK, TESK, cholera kits)
• **Communication** - Activate risk communication protocols

🛡️ **Sustained Response (72+ hours):**
• **Field Operations** - Deploy technical experts and equipment
• **Supply Chain** - Ensure continuous medical supply delivery
• **Surveillance** - Implement enhanced disease surveillance systems
• **Community Engagement** - Local capacity building and training

📋 **Key Protocols:**
• IHR (2005) compliance for international coordination
• WHO Health Emergency Response Framework
• Emergency Medical Team (EMT) deployment standards`,
      timestamp: new Date(),
      hasAudio: true,
      category: "Emergency Protocols",
    },
    {
      id: "3",
      type: "user",
      content: "What equipment is typically deployed in the first 48 hours of an emergency?",
      timestamp: new Date(),
    },
    {
      id: "4",
      type: "assistant",
      content: `**Critical Equipment for First 48 Hours Emergency Deployment:**

🏥 **Immediate Medical Response:**
• **IEHK (Interagency Emergency Health Kit)** - Basic & Supplementary modules
• **TESK (Trauma Emergency Surgery Kit)** - For surgical interventions
• **Patient Monitors** - Vital signs monitoring (Edan IM60 series)
• **Oxygen Systems** - Concentrators, cylinders, and delivery equipment

🧪 **Diagnostic & Laboratory:**
• **Rapid Diagnostic Tests (RDTs)** - Disease-specific testing kits
• **Sample Collection Kits** - For laboratory confirmation
• **Cold Chain Equipment** - Vaccine storage and transport
• **Point-of-Care Testing** - Chemistry analyzers (Piccolo Xpress)

🦺 **Personal Protection:**
• **PPE Kits** - Coveralls, masks, gloves, goggles
• **Decontamination Supplies** - Chlorine, sprayers, safety equipment
• **Isolation Equipment** - Patient transport units, barriers

⛺ **Field Infrastructure:**
• **Emergency Tents** - Medical treatment facilities (XPERT series)
• **Communication Equipment** - Satellite phones, radios
• **Power Systems** - Generators, solar panels, batteries
• **Water & Sanitation** - Purification tablets, testing kits

📦 **Logistics Priority:**
1. **Life-saving medical supplies** (0-6 hours)
2. **Diagnostic capabilities** (6-24 hours)  
3. **Field infrastructure** (24-48 hours)
4. **Sustained operations equipment** (48+ hours)`,
      timestamp: new Date(),
      hasAudio: true,
      category: "Equipment Deployment",
    },
    {
      id: "5",
      type: "user",
      content: "🎤 How does WHO coordinate with local health authorities during emergencies?",
      timestamp: new Date(),
      isVoice: true,
    },
    {
      id: "6",
      type: "assistant",
      content: `**WHO Coordination with Local Health Authorities:**

🤝 **Partnership Framework:**
• **Country Office Integration** - WHO country representatives work directly with Ministry of Health
• **Joint Operations Centers** - Shared command and control structures
• **Technical Working Groups** - Subject matter expert collaboration
• **Resource Sharing Agreements** - Equipment and personnel deployment protocols

📋 **Coordination Mechanisms:**
• **Daily Situation Reports** - Shared intelligence and status updates
• **Joint Needs Assessments** - Collaborative resource requirement analysis
• **Unified Response Plans** - Integrated emergency response strategies
• **Communication Protocols** - Standardized reporting and information sharing

🎯 **Local Capacity Building:**
• **Training Programs** - Emergency response skill development
• **Equipment Handover** - Technology transfer and maintenance training
• **Protocol Standardization** - Align local procedures with WHO guidelines
• **Surveillance Integration** - Connect local systems to global networks

⚡ **Emergency Activation Process:**
1. **Initial Contact** - WHO country office notifies headquarters
2. **Joint Assessment** - Combined WHO-local authority evaluation
3. **Resource Mobilization** - Coordinate international and local resources
4. **Unified Command** - Establish joint incident management structure
5. **Continuous Coordination** - Regular review and adjustment meetings

🌍 **Regional Support:**
• **WHO Regional Offices** - Provide technical and logistical support
• **Cross-border Coordination** - Multi-country response management
• **Resource Pooling** - Shared emergency stockpiles and expertise`,
      timestamp: new Date(),
      hasAudio: true,
      category: "Coordination",
    },
  ]

  const playDemo = () => {
    setIsPlaying(true)
    setCurrentStep(0)

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= demoConversation.length - 1) {
          clearInterval(interval)
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 3000)
  }

  const resetDemo = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              WHO AI Assistant Demo - Emergency Response Protocols
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Zap className="h-3 w-3 mr-1" />
                Groq Powered
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={playDemo}
                disabled={isPlaying}
                className="bg-white/20 text-white hover:bg-white/30"
              >
                <Play className="h-4 w-4 mr-1" />
                {isPlaying ? "Playing..." : "Play Demo"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={resetDemo}
                className="bg-white/20 text-white hover:bg-white/30"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="h-[600px] overflow-y-auto p-4 space-y-4">
            {demoConversation.slice(0, currentStep + 1).map((message, index) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg p-4 ${
                    message.type === "user"
                      ? message.isVoice
                        ? "bg-green-600 text-white"
                        : "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  } ${index === currentStep ? "animate-pulse" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {message.type === "assistant" && <Brain className="h-4 w-4 mt-1 flex-shrink-0 text-purple-600" />}
                    {message.type === "user" && message.isVoice && <Mic className="h-4 w-4 mt-1 flex-shrink-0" />}
                    <div className="flex-1">
                      <div className="prose prose-sm max-w-none">
                        {message.content.split("\n").map((line, i) => (
                          <div key={i} className="mb-1">
                            {line.startsWith("**") && line.endsWith(":**") ? (
                              <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                                {line.includes("Immediate") && <AlertTriangle className="h-4 w-4" />}
                                {line.includes("Protection") && <Shield className="h-4 w-4" />}
                                {line.includes("Coordination") && <Users className="h-4 w-4" />}
                                {line.includes("Emergency") && <Clock className="h-4 w-4" />}
                                {line.includes("Field") && <MapPin className="h-4 w-4" />}
                                {line.includes("Protocol") && <FileText className="h-4 w-4" />}
                                {line.replace(/\*\*/g, "")}
                              </h4>
                            ) : line.startsWith("•") ? (
                              <div className="ml-4 text-sm">{line}</div>
                            ) : line.match(/^\d+\./) ? (
                              <div className="ml-4 text-sm font-medium">{line}</div>
                            ) : (
                              <div className="text-sm">{line}</div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</span>
                        {message.category && (
                          <Badge variant="outline" className="text-xs">
                            {message.category}
                          </Badge>
                        )}
                        {message.hasAudio && (
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-white/20">
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Emergency Protocols
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div>• IHR (2005) Compliance</div>
            <div>• 24-hour Notification</div>
            <div>• Risk Assessment Framework</div>
            <div>• GOARN Activation</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              Equipment Deployment
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div>• IEHK & TESK Kits</div>
            <div>• PPE & Safety Equipment</div>
            <div>• Diagnostic Tools</div>
            <div>• Field Infrastructure</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              Coordination
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div>• Local Authority Partnership</div>
            <div>• Joint Operations Centers</div>
            <div>• Capacity Building</div>
            <div>• Resource Sharing</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
