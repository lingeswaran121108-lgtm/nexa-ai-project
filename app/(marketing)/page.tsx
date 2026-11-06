import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { Benefits } from "@/components/marketing/benefits";
import { ToolsShowcase } from "@/components/marketing/tools-showcase";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FAQ } from "@/components/marketing/faq";
import { Footer } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "NexaAI — Intelligent AI Writing, Summarization & Brainstorming Platform",
};

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Benefits />
      <ToolsShowcase />
      <HowItWorks />
      <PricingSection />
      <FAQ />

      {/* Final CTA Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 to-purple-700 overflow-hidden py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.08]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to write, ideate, and scale 10x faster?
          </h2>
          <p className="mt-5 text-lg text-indigo-100 max-w-xl mx-auto">
            Join thousands of content creators and teams already using NexaAI to produce high-quality, intelligent output in seconds.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 px-7 shadow-xl">
                Start Free — No Card Required
              </Button>
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-indigo-100 flex items-center gap-1.5 hover:text-white transition-colors">
              <span>View Pricing Plans</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
