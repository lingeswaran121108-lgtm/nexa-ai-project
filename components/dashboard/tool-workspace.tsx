"use client";

import React, { useState } from "react";
import { Copy, Check, RefreshCw, Sparkles, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AI_TOOLS, type ToolType } from "@/lib/ai/prompts";

interface ToolWorkspaceProps {
  toolType: ToolType;
}

export function ToolWorkspace({ toolType }: ToolWorkspaceProps) {
  const toolDef = AI_TOOLS[toolType];
  const [formValues, setFormValues] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    toolDef.formFields.forEach((field) => {
      if (field.defaultValue) defaults[field.name] = String(field.defaultValue);
    });
    return defaults;
  });

  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<{ used: number; remaining: number } | null>(null);

  const mainField = toolDef.formFields[0];
  const prompt = formValues[mainField.name] || "";

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.trim().length < 3) {
      setError("Please enter a prompt of at least 3 characters to generate.");
      return;
    }
    setGenerating(true);
    setError(null);
    setOutput(null);
    setSaved(false);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolType,
          prompt,
          options: { ...formValues },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "PROVIDER_UNCONFIGURED") {
          setError(
            `🔧 AI Provider Not Configured: ${data.details}\n\nTo activate real AI generation:\n1. Copy .env.example to .env.local\n2. Add your OPENAI_API_KEY or ANTHROPIC_API_KEY\n3. Restart the development server`
          );
        } else if (data.code === "QUOTA_EXCEEDED") {
          setError(`📊 Monthly quota reached (${data.currentUsage}/${data.monthlyLimit}). Upgrade to Pro for up to 500 monthly generations.`);
        } else {
          setError(data.error || "Generation failed. Please try again.");
        }
      } else {
        setOutput(data.output);
        setSaved(true); // auto-saved by API
        setTokenInfo({ used: data.tokensUsed || 0, remaining: data.remainingQuota || 0 });
      }
    } catch (fetchErr: any) {
      setError("Network error: Could not connect to the server.");
    }

    setGenerating(false);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard?.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[600px] divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
      {/* Left Panel: Prompt & Options */}
      <div className="w-full lg:w-[40%] xl:w-[36%] p-6 flex flex-col gap-5 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white text-sm">{toolDef.title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{toolDef.category}</p>
          </div>
        </div>

        {toolDef.formFields.map((field) => (
          <div key={field.name}>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <Textarea
                value={formValues[field.name] || ""}
                onChange={(e) => setFormValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                placeholder={field.placeholder}
                className="min-h-[140px] text-sm"
              />
            ) : field.type === "select" ? (
              <select
                value={formValues[field.name] || field.defaultValue || ""}
                onChange={(e) => setFormValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formValues[field.name] || ""}
                onChange={(e) => setFormValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                placeholder={field.placeholder}
                className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>
        ))}

        <div className="text-right text-xs text-slate-400 dark:text-slate-600">
          {prompt.length} / 4000 characters
        </div>

        <Button
          onClick={handleGenerate}
          isLoading={generating}
          size="lg"
          className="w-full gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {generating ? "Generating..." : "Generate Now"}
        </Button>

        {tokenInfo && (
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{tokenInfo.used} tokens consumed</span>
            <span>{tokenInfo.remaining} quota remaining</span>
          </div>
        )}
      </div>

      {/* Right Panel: Output */}
      <div className="flex-1 p-6 flex flex-col bg-white dark:bg-slate-900">
        {/* Output Toolbar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Generated Output</span>
            {saved && output && (
              <Badge variant="emerald" className="text-[10px] gap-1 py-0.5">
                <Save className="w-2.5 h-2.5" /> Auto-saved
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {output && (
              <>
                <button
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                >
                  {copied ? (
                    <><Check className="w-3.5 h-3.5 text-emerald-500" /><span className="text-emerald-500">Copied!</span></>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Output Content */}
        {generating ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-200 dark:border-indigo-900" />
              <div className="absolute inset-0 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Generating your content...</p>
              <p className="text-xs text-slate-400 mt-1">Processing through {toolDef.title}</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-5">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-200 mb-2">Notice</p>
              <p className="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-line leading-relaxed">{error}</p>
            </div>
          </div>
        ) : output ? (
          <div className="flex-1">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {output}
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center mb-2">
              <Sparkles className="w-7 h-7 text-indigo-400 dark:text-indigo-500" />
            </div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-100">Your AI output appears here</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm">
              Enter a prompt in the panel on the left and press <strong>Generate Now</strong> to produce your first result with {toolDef.title}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
