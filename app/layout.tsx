import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexaAI — Premium Generative AI Workspace & Tools",
  description: "Accelerate your writing, summarization, brainstorming, and daily workflows with intelligent, context-aware AI tools.",
  keywords: ["AI SaaS", "AI Writer", "AI Assistant", "Text Summarizer", "Brainstorming AI", "Productivity"],
  authors: [{ name: "NexaAI Team" }],
  openGraph: {
    title: "NexaAI — Intelligent AI Productivity Platform",
    description: "Generate world-class content, summarize long-form documents, and brainstorm high-impact ideas with enterprise AI.",
    url: "https://nexaai.io",
    siteName: "NexaAI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
