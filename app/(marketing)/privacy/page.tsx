import React from "react";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export const metadata = {
  title: "Privacy Policy — NexaAI",
};

export default function PrivacyPage() {
  return (
    <main>
      <Navbar />
      <div className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-xs font-bold mb-4">
              ⚠️ DRAFT — Not legally reviewed. Customize before launch.
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Last updated: October 21, 2026</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed space-y-6">
            <section>
              <h2>1. Information We Collect</h2>
              <p>We collect information you provide when creating an account (name, email), content you generate through our AI tools (prompts and outputs), subscription and billing information (processed via Stripe), and usage data.</p>
            </section>
            <section>
              <h2>2. How We Use Your Information</h2>
              <p>We use your data to provide, improve, and personalize the NexaAI platform; process subscription payments; respond to support inquiries; and enforce our Terms of Service.</p>
            </section>
            <section>
              <h2>3. Data Isolation</h2>
              <p>User account data, AI generations, and usage records are protected by PostgreSQL Row Level Security. No user can read or modify another user's records.</p>
            </section>
            <section>
              <h2>4. Data Retention</h2>
              <p>We retain account data while your account is active. You may request deletion at any time via Account Settings or by contacting support.</p>
            </section>
            <section>
              <h2>5. Third-Party Services</h2>
              <p>We use Supabase for database and authentication, Stripe for payments, and OpenAI or Anthropic for AI generation. Each has its own privacy policy.</p>
            </section>
            <section>
              <h2>6. Contact</h2>
              <p>For privacy questions, email privacy@nexaai.io.</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
