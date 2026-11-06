export type ToolType = "writer" | "chat" | "summarizer" | "ideas" | "rewriter";

export interface ToolDefinition {
  id: ToolType;
  title: string;
  category: string;
  description: string;
  systemPrompt: string;
  defaultPrompt: string;
  iconName: string;
  badge?: string;
  formFields: {
    name: string;
    label: string;
    type: "text" | "textarea" | "select" | "slider";
    placeholder?: string;
    options?: { label: string; value: string }[];
    defaultValue?: any;
  }[];
}

export const AI_TOOLS: Record<ToolType, ToolDefinition> = {
  writer: {
    id: "writer",
    title: "AI Writer & Blog Generator",
    category: "Writing",
    description: "Generate structured articles, essays, marketing copy, and long-form thought leadership.",
    systemPrompt: `You are an elite copywriter and content strategist. 
Write engaging, articulate, well-structured content based on the user's prompt. 
Use clear headings, punchy paragraphs, and professional typography conventions. 
Never sound robotic. Use active voice and concrete examples.`,
    defaultPrompt: "Write an in-depth guide on the future of autonomous AI agents in enterprise workflows.",
    iconName: "PenTool",
    formFields: [
      {
        name: "topic",
        label: "What would you like to write about?",
        type: "textarea",
        placeholder: "e.g., How modern SaaS startups scale using serverless infrastructure...",
      },
      {
        name: "tone",
        label: "Tone of Voice",
        type: "select",
        defaultValue: "professional",
        options: [
          { label: "Professional & Authoritative", value: "professional" },
          { label: "Conversational & Friendly", value: "conversational" },
          { label: "Persuasive & Sales-oriented", value: "persuasive" },
          { label: "Technical & Analytical", value: "technical" },
        ],
      },
      {
        name: "length",
        label: "Target Length",
        type: "select",
        defaultValue: "medium",
        options: [
          { label: "Short (~300 words)", value: "short" },
          { label: "Medium (~600 words)", value: "medium" },
          { label: "Long (~1200 words)", value: "long" },
        ],
      },
    ],
  },
  chat: {
    id: "chat",
    title: "Nexa Intelligence Chat",
    category: "Conversation",
    badge: "Pro",
    description: "Context-aware conversational intelligence for problem-solving, code debugging, and analysis.",
    systemPrompt: `You are NexaAI, an advanced reasoning assistant. 
Deliver concise, highly useful, analytical answers. 
Provide clear breakdowns, bullet points, and code snippets when requested.`,
    defaultPrompt: "What are the most critical architectural patterns for multi-tenant SaaS databases?",
    iconName: "MessageSquare",
    formFields: [
      {
        name: "prompt",
        label: "Your Question or Message",
        type: "textarea",
        placeholder: "Ask anything, brainstorm solutions, or ask for architectural reviews...",
      },
      {
        name: "creativity",
        label: "Reasoning Depth",
        type: "select",
        defaultValue: "balanced",
        options: [
          { label: "Precise & Deterministic", value: "precise" },
          { label: "Balanced & Insightful", value: "balanced" },
          { label: "Creative & Exploratory", value: "creative" },
        ],
      },
    ],
  },
  summarizer: {
    id: "summarizer",
    title: "Executive Text Summarizer",
    category: "Productivity",
    description: "Distill dense whitepapers, meeting notes, customer transcripts, and PDFs into actionable key points.",
    systemPrompt: `You are an executive summary specialist. 
Analyze the input text and generate:
1. Executive TL;DR (2-3 sentences)
2. Core Takeaways (bulleted list of high-impact points)
3. Actionable Next Steps (if applicable)
Remain objective, preserve accuracy, and eliminate fluff.`,
    defaultPrompt: "Paste long articles, meeting transcripts, or reports here to generate an executive brief.",
    iconName: "FileText",
    formFields: [
      {
        name: "text",
        label: "Source Text to Summarize",
        type: "textarea",
        placeholder: "Paste the article, report, or transcript text here...",
      },
      {
        name: "format",
        label: "Summary Format",
        type: "select",
        defaultValue: "bullets",
        options: [
          { label: "Key Bullet Points", value: "bullets" },
          { label: "Executive Narrative", value: "narrative" },
          { label: "TL;DR Single Paragraph", value: "tldr" },
        ],
      },
    ],
  },
  ideas: {
    id: "ideas",
    title: "Idea & Brainstorming Engine",
    category: "Creativity",
    description: "Break creative blocks with viral angles, startup concepts, product features, and marketing hooks.",
    systemPrompt: `You are a world-class growth strategist and ideation catalyst. 
Generate 5-10 distinct, innovative, non-obvious ideas for the specified request. 
For each idea provide:
- Concept Name
- The 'Why it works' angle
- Immediate execution step`,
    defaultPrompt: "Brainstorm 5 B2B SaaS micro-tools targeting Shopify store owners.",
    iconName: "Sparkles",
    formFields: [
      {
        name: "topic",
        label: "What do you need ideas for?",
        type: "textarea",
        placeholder: "e.g., Viral newsletter concepts for software engineers, high-retention onboarding flows...",
      },
      {
        name: "quantity",
        label: "Number of Ideas",
        type: "select",
        defaultValue: "5",
        options: [
          { label: "5 High-Impact Ideas", value: "5" },
          { label: "10 Diverse Concepts", value: "10" },
        ],
      },
    ],
  },
  rewriter: {
    id: "rewriter",
    title: "Content Tone & Clarity Rewriter",
    category: "Editing",
    badge: "Pro",
    description: "Polish rough drafts, eliminate passive voice, change reading level, or shift tone seamlessly.",
    systemPrompt: `You are a master editor. 
Rewrite the provided draft strictly adhering to the requested style and tone. 
Keep the original meaning intact while dramatically improving flow, rhythm, and clarity.`,
    defaultPrompt: "Rewrite this draft to sound persuasive, concise, and executive-ready.",
    iconName: "RefreshCw",
    formFields: [
      {
        name: "originalText",
        label: "Original Draft",
        type: "textarea",
        placeholder: "Paste the draft you want to rewrite and refine...",
      },
      {
        name: "targetTone",
        label: "Desired Tone",
        type: "select",
        defaultValue: "executive",
        options: [
          { label: "Executive & Crisp", value: "executive" },
          { label: "Engaging & Storytelling", value: "storytelling" },
          { label: "Direct & Minimalist", value: "minimalist" },
          { label: "Academic & Rigorous", value: "academic" },
        ],
      },
    ],
  },
};
