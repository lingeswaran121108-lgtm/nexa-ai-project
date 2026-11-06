import React from "react";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export const metadata = {
  title: "Terms of Service — NexaAI",
};

export default function TermsPage() {
  return (
    <main>
      <Navbar />
      <div className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-xs font-bold mb-4">
              ⚠️ DRAFT — Not legally reviewed. Customize before launch.
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Terms of Service</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Last updated: October 21, 2026</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed space-y-6">
            <section>
              <h2>1. Acceptance of Terms</h2>
              <p>By accessing or using NexaAI, you agree to be bound by these Terms. If you do not agree, you may not use the service.</p>
            </section>
            <section>
              <h2>2. Use of the Service</h2>
              <p>You may not use NexaAI to generate harmful, deceptive, or illegal content. You are responsible for the prompts you provide and outputs you publish.</p>
            </section>
            <section>
              <h2>3. Subscription and Billing</h2>
              <p>Subscriptions are billed in advance per billing interval (monthly or annually). Refunds are subject to our refund policy. Payments are processed by Stripe.</p>
            </section>
            <section>
              <h2>4. Intellectual Property</h2>
              <p>You retain ownership of content you create using NexaAI, subject to the licenses of the underlying AI providers.</p>
            </section>
            <section>
              <h2>5. Termination</h2>
              <p>We may terminate or suspend your account for violations of these Terms at our sole discretion.</p>
            </section>
            <section>
              <h2>6. Limitation of Liability</h2>
              <p>NexaAI is provided "as is." We do not guarantee error-free operation or suitability for any specific purpose.</p>
            </section>
            <section>
              <h2>7. Contact</h2>
              <p>For legal inquiries, contact legal@nexaai.io.</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
