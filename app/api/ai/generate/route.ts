import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth/permissions";
import { AI_TOOLS, type ToolType } from "@/lib/ai/prompts";
import { verifyUserQuota, recordGenerationAndUsage } from "@/lib/ai/quota";
import { executeAIGeneration, getAIProviderStatus } from "@/lib/ai/provider";

const GenerateSchema = z.object({
  toolType: z.enum(["writer", "chat", "summarizer", "ideas", "rewriter"]),
  prompt: z.string().min(3, "Prompt must be at least 3 characters").max(4000, "Prompt too long"),
  title: z.string().optional(),
  options: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to generate content." },
        { status: 401 }
      );
    }

    // 2. Validate request body
    const body = await req.json();
    const parseResult = GenerateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { toolType, prompt, title, options } = parseResult.data;
    const toolDef = AI_TOOLS[toolType as ToolType];
    if (!toolDef) {
      return NextResponse.json({ error: "Invalid AI tool requested" }, { status: 400 });
    }

    // 3. Server-side quota and plan authorization check
    const quota = await verifyUserQuota(session.id, toolType);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: quota.reason || "Quota limit reached",
          code: "QUOTA_EXCEEDED",
          currentUsage: quota.currentUsage,
          monthlyLimit: quota.monthlyLimit,
        },
        { status: 403 }
      );
    }

    // 4. Verify AI Provider Configuration State
    const providerStatus = getAIProviderStatus();
    if (!providerStatus.isConfigured) {
      return NextResponse.json(
        {
          error: "AI provider is not configured on the server.",
          details: providerStatus.missingKeyMessage,
          code: "PROVIDER_UNCONFIGURED",
        },
        { status: 503 }
      );
    }

    // 5. Build dynamic system & user prompt
    let formattedUserPrompt = prompt;
    if (options && Object.keys(options).length > 0) {
      const optionsText = Object.entries(options)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      formattedUserPrompt = `[Options: ${optionsText}]\n\n${prompt}`;
    }

    // 6. Execute server-side AI completion with timeout protection
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000); // 45s safety timeout

    let aiResult;
    try {
      aiResult = await executeAIGeneration({
        systemPrompt: toolDef.systemPrompt,
        userPrompt: formattedUserPrompt,
        temperature: options?.creativity === "creative" ? 0.9 : options?.creativity === "precise" ? 0.3 : 0.7,
      });
    } finally {
      clearTimeout(timeout);
    }

    // 7. Atomically save generation and record usage event
    const generationTitle = title || prompt.slice(0, 40) + "...";
    const generationId = await recordGenerationAndUsage({
      userId: session.id,
      toolType,
      title: generationTitle,
      prompt,
      output: aiResult.text,
      tokenUsage: aiResult.tokensUsed,
      metadata: {
        provider: aiResult.provider,
        model: aiResult.model,
        options,
      },
    });

    return NextResponse.json({
      success: true,
      id: generationId,
      output: aiResult.text,
      tokensUsed: aiResult.tokensUsed,
      provider: aiResult.provider,
      remainingQuota: Math.max(0, quota.remaining - 1),
    });
  } catch (error: any) {
    console.error("[API:ai/generate] Execution failed:", error);
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred during generation.",
      },
      { status: 500 }
    );
  }
}
