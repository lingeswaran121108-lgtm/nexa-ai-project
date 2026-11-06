export interface AIGenerationRequest {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIGenerationResult {
  text: string;
  tokensUsed: number;
  provider: string;
  model: string;
}

export interface ProviderStatus {
  isConfigured: boolean;
  activeProvider: string;
  model: string;
  missingKeyMessage?: string;
}

/**
 * Checks if a real server-side AI provider is configured.
 */
export function getAIProviderStatus(): ProviderStatus {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();

  if (provider === "openai") {
    const key = process.env.OPENAI_API_KEY;
    const isConfigured = Boolean(key && !key.includes("your-openai-key") && !key.includes("placeholder"));
    return {
      isConfigured,
      activeProvider: "OpenAI",
      model: process.env.AI_MODEL_NAME || "gpt-4o-mini",
      missingKeyMessage: isConfigured ? undefined : "OPENAI_API_KEY is not configured in server environment variables (.env.local).",
    };
  }

  if (provider === "anthropic") {
    const key = process.env.ANTHROPIC_API_KEY;
    const isConfigured = Boolean(key && !key.includes("your-anthropic-key"));
    return {
      isConfigured,
      activeProvider: "Anthropic Claude",
      model: process.env.AI_MODEL_NAME || "claude-3-5-sonnet-20241022",
      missingKeyMessage: isConfigured ? undefined : "ANTHROPIC_API_KEY is not configured in server environment variables (.env.local).",
    };
  }

  if (provider === "gemini") {
    const key = process.env.GEMINI_API_KEY;
    const isConfigured = Boolean(key && !key.includes("your-gemini-key"));
    return {
      isConfigured,
      activeProvider: "Google Gemini",
      model: process.env.AI_MODEL_NAME || "gemini-1.5-flash",
      missingKeyMessage: isConfigured ? undefined : "GEMINI_API_KEY is not configured in server environment variables (.env.local).",
    };
  }

  return {
    isConfigured: false,
    activeProvider: provider,
    model: "none",
    missingKeyMessage: `Unknown AI_PROVIDER "${provider}". Please choose 'openai', 'anthropic', or 'gemini'.`,
  };
}

/**
 * Unified server-side AI execution layer with provider abstraction.
 */
export async function executeAIGeneration(req: AIGenerationRequest): Promise<AIGenerationResult> {
  const status = getAIProviderStatus();

  if (!status.isConfigured) {
    throw new Error(
      `AI Provider Not Configured: ${status.missingKeyMessage} Please set the appropriate API key in your server environment.`
    );
  }

  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();

  if (provider === "openai") {
    return callOpenAI(req);
  } else if (provider === "anthropic") {
    return callAnthropic(req);
  } else if (provider === "gemini") {
    return callGemini(req);
  } else {
    throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * OpenAI Provider implementation using native fetch (no bulky extra dependencies needed).
 */
async function callOpenAI(req: AIGenerationRequest): Promise<AIGenerationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.AI_MODEL_NAME || "gpt-4o-mini";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: req.systemPrompt },
        { role: "user", content: req.userPrompt },
      ],
      max_tokens: req.maxTokens || 1200,
      temperature: req.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API error [${response.status}]: ${errorBody}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  const tokensUsed = data.usage?.total_tokens || Math.ceil(text.length / 4);

  return {
    text,
    tokensUsed,
    provider: "OpenAI",
    model,
  };
}

/**
 * Anthropic Provider implementation.
 */
async function callAnthropic(req: AIGenerationRequest): Promise<AIGenerationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.AI_MODEL_NAME || "claude-3-5-sonnet-20241022";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model,
      system: req.systemPrompt,
      messages: [{ role: "user", content: req.userPrompt }],
      max_tokens: req.maxTokens || 1200,
      temperature: req.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API error [${response.status}]: ${errorBody}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || "";
  const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

  return {
    text,
    tokensUsed,
    provider: "Anthropic",
    model,
  };
}

/**
 * Google Gemini Provider implementation.
 */
async function callGemini(req: AIGenerationRequest): Promise<AIGenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.AI_MODEL_NAME || "gemini-1.5-flash";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: `${req.systemPrompt}\n\nUser Request: ${req.userPrompt}` }
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: req.maxTokens || 1200,
        temperature: req.temperature ?? 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error [${response.status}]: ${errorBody}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const tokensUsed = data.usageMetadata?.totalTokenCount || Math.ceil(text.length / 4);

  return {
    text,
    tokensUsed,
    provider: "Google Gemini",
    model,
  };
}
