import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function generateItemExplanation(item: any, question: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      system: `You are a WHO emergency response equipment expert with extensive knowledge of medical equipment, emergency kits, and field operations. Provide detailed, accurate, and practical information about WHO emergency response equipment.

Key guidelines:
- Focus on practical usage, safety, and emergency response contexts
- Include specific technical details when relevant
- Mention WHO standards and protocols when applicable
- Consider field conditions and resource constraints
- Provide actionable advice for emergency responders`,
      prompt: `Equipment: ${item.name}
Category: ${item.category}
Description: ${item.description || "No description available"}
Specifications: ${item.specifications ? JSON.stringify(item.specifications) : "No specifications available"}

Question: ${question}

Please provide a comprehensive answer about this WHO emergency response equipment. Include practical usage information, safety considerations, and any relevant WHO protocols or standards.`,
    })

    return text
  } catch (error) {
    console.error("Error generating item explanation:", error)
    throw new Error("Failed to generate explanation")
  }
}

export async function generateCategoryOverview(category: string, items: any[]): Promise<string> {
  try {
    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      system: `You are a WHO emergency response equipment expert. Provide overview information about equipment categories and their role in emergency response.`,
      prompt: `Category: ${category}
Number of items: ${items.length}
Sample items: ${items
        .slice(0, 5)
        .map((item) => item.name)
        .join(", ")}

Please provide a comprehensive overview of this equipment category and its importance in WHO emergency response operations. Include:
- Purpose and role in emergency response
- Key characteristics of equipment in this category
- When and where this equipment is typically deployed
- Critical considerations for field use
- How this category supports WHO emergency response objectives

Keep it informative and practical for emergency response personnel.`,
    })

    return text
  } catch (error) {
    console.error("Error generating category overview:", error)
    throw new Error("Failed to generate category overview")
  }
}
