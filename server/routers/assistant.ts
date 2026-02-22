import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/openai";
import { searchResources, getProfileByUserId } from "../db";

export const assistantRouter = router({
  /**
   * AI-powered resource matching chat.
   * Accepts a plain-language message from the user, optionally enriched with
   * their saved profile, and returns a structured response with matched
   * resources and a conversational explanation.
   */
  chat: publicProcedure
    .input(
      z.object({
        message: z.string().min(1).max(2000),
        conversationHistory: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            })
          )
          .max(20)
          .default([]),
        state: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Optionally load the user's profile for richer context
      let profileContext = "";
      if (ctx.user) {
        try {
          const profile = await getProfileByUserId(ctx.user.id);
          if (profile) {
            profileContext = `
User Profile Context:
- Military Status: ${profile.militaryStatus || "not specified"}
- State: ${profile.state || "not specified"}
- Disability Rating Band: ${profile.disabilityRatingBand || "not specified"}
- VA Eligible: ${profile.vaEligible || "not specified"}
- Dependents: ${profile.dependentsCount || 0}
`;
          }
        } catch {
          // Profile load failure is non-fatal
        }
      }

      // Run a broad keyword search to ground the LLM in real data
      const keywords = extractKeywords(input.message);
      let resourceContext = "";
      try {
        const searchResults = await searchResources({
          search: keywords,
          state: input.state,
          limit: 8,
          offset: 0,
        });
        if (searchResults.items.length > 0) {
          resourceContext = "\n\nAvailable matching resources from our database:\n";
          for (const r of searchResults.items) {
            resourceContext += `- [${r.name}] (${r.state || "National"}) — ${r.description} | Phone: ${r.phone || "N/A"} | URL: ${r.url || "N/A"}\n`;
          }
        }
      } catch {
        // Search failure is non-fatal
      }

      const systemPrompt = `You are a compassionate, knowledgeable resource navigator for ServiceSource Connect — a platform that helps U.S. military service members, veterans, and their families find support resources.

Your role:
1. Listen carefully to what the user needs
2. Recommend specific resources from our database when available
3. Provide clear, actionable guidance
4. Use warm, supportive, respectful language appropriate for the military community
5. Always include crisis resources (Veterans Crisis Line: 988, press 1) if the user expresses any distress, hopelessness, or mentions self-harm
6. Never provide medical, legal, or financial advice — always recommend consulting a professional
7. Use language like "may qualify," "you might be eligible," and "verify with the provider" — never make guarantees
8. Keep responses concise and easy to read — use short paragraphs or brief lists

IMPORTANT GUARDRAILS:
- Do NOT collect SSN, detailed medical history, or trauma details
- Do NOT make promises about eligibility or benefit amounts
- Always recommend verifying information directly with the provider
- If the user seems to be in crisis, immediately provide the Veterans Crisis Line number and encourage them to call
${profileContext}
${resourceContext}`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...input.conversationHistory.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: input.message },
      ];

      const response = await invokeLLM({ messages });
      const assistantMessage =
        response.choices?.[0]?.message?.content || "I'm sorry, I wasn't able to generate a response. Please try again.";

      // Detect crisis indicators in the user message
      const crisisKeywords = [
        "suicide", "kill myself", "end my life", "don't want to live",
        "hopeless", "no reason to live", "hurt myself", "self-harm",
        "can't go on", "give up on life",
      ];
      const hasCrisisIndicator = crisisKeywords.some((kw) =>
        input.message.toLowerCase().includes(kw)
      );

      return {
        message: assistantMessage,
        hasCrisisIndicator,
        crisisResources: hasCrisisIndicator
          ? [
              {
                name: "Veterans Crisis Line",
                phone: "988 (press 1)",
                text: "838255",
                chat: "https://www.veteranscrisisline.net/get-help-now/chat/",
              },
            ]
          : [],
      };
    }),
});

/**
 * Extract meaningful keywords from a natural language query for database search.
 */
function extractKeywords(message: string): string {
  // Remove common stop words and return the cleaned message for full-text search
  const stopWords = new Set([
    "i", "me", "my", "myself", "we", "our", "you", "your", "he", "she", "it",
    "they", "what", "which", "who", "whom", "this", "that", "am", "is", "are",
    "was", "were", "be", "been", "being", "have", "has", "had", "do", "does",
    "did", "will", "would", "could", "should", "may", "might", "shall", "can",
    "a", "an", "the", "and", "but", "or", "nor", "for", "so", "yet",
    "at", "by", "for", "in", "of", "on", "to", "up", "as", "into",
    "need", "needs", "looking", "find", "help", "please", "want", "get",
  ]);

  return message
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))
    .slice(0, 8)
    .join(" ");
}
