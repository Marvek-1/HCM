"use client"

import type { ERHKit } from "@/lib/erh-kit-mapping"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"

interface ERHKitCardProps {
  kit: ERHKit
  compact?: boolean
}

export function ERHKitCard({ kit, compact = false }: ERHKitCardProps) {
  return (
    <Card className="h-full overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">{kit.name}</CardTitle>
          <Badge style={{ backgroundColor: kit.colorCode }} className="text-white">
            {kit.color}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="relative aspect-square w-full mb-3 bg-white">
          <Image
            src={kit.imagePath || "/placeholder.svg"}
            alt={`ERH Kit ${kit.name}`}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        {!compact && (
          <div className="mt-2">
            <p className="text-sm text-gray-700">{kit.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
