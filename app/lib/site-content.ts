/**
 * Advait Solutions default site copy as typed structured data (never JSX).
 *
 * The CMS overrides these later; each consuming section is wrapped with a
 * `data-cms-section` marker. CMS-injection keys currently in use:
 *   header · hero · services · why · featured-work · ai-capabilities ·
 *   final-cta · footer · page-services · page-products · page-about · page-approach
 */
import type { IconName } from "~/components/Icon";

export interface CtaDef {
  label: string;
  href: string;
}
export interface FeatureCard {
  icon: IconName;
  title: string;
  blurb: string;
  href?: string;
}
export interface TrustItem {
  label: string;
}

export const siteContent = {
  brand: {
    name: "Advait Solutions",
    tagline: "Reliable Software. Intelligent AI. Real Business Value.",
    positioning:
      "20+ Years Building Reliable Software. Now Building Reliable AI Systems.",
    foundingYear: 2004,
    linkedin: "https://www.linkedin.com/company/advait-solutions",
    contactEmail: "hello@advaitsolutions.com",
    description:
      "A senior software partner for offshore delivery — 20+ years building reliable systems, now building production RAG and multi-agent AI with the same engineering discipline.",
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "AI Products", href: "/products" },
    { label: "Case Studies", href: "/works" },
    { label: "About", href: "/about" },
    { label: "Insights", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ] as { label: string; href: string }[],

  footerNav: [
    { label: "Services", href: "/services" },
    { label: "AI Products", href: "/products" },
    { label: "Case Studies", href: "/works" },
    { label: "About", href: "/about" },
    { label: "Insights", href: "/blog" },
    { label: "Our History", href: "/history" },
    { label: "Contact", href: "/contact" },
  ] as { label: string; href: string }[],

  home: {
    hero: {
      headline: "20+ Years Building Reliable Software. Now Building Reliable AI Systems.",
      subhead:
        "We deliver AI-accelerated custom software development and production RAG & multi-agent systems for clients across the US, Canada, UK, Europe and the Middle East — engineered by a senior team, delivered end to end.",
      primaryCta: { label: "AI-Accelerated Development", href: "/services" },
      secondaryCta: { label: "Explore AI Products & RAG", href: "/products" },
      trust: [
        { label: "Since 2004" },
        { label: "US & Canada Clients" },
        { label: "Team of 10+" },
        { label: "End-to-End Delivery" },
      ] as TrustItem[],
    },

    services: {
      eyebrow: "What we do",
      title: "Senior engineering, now AI-accelerated",
      lead: "Four ways we help teams ship reliable software and dependable AI.",
      cards: [
        {
          icon: "zap",
          title: "AI-Accelerated Custom Software Development",
          blurb:
            "Full-cycle product engineering with AI coding agents woven into our workflow — faster delivery without giving up review discipline or code quality.",
          href: "/services",
        },
        {
          icon: "brain",
          title: "Production RAG & Multi-Agent Systems",
          blurb:
            "Retrieval pipelines with guardrails, intent classification, tool calling and multi-agent orchestration — built to run in production, not just demos.",
          href: "/products",
        },
        {
          icon: "boxes",
          title: "End-to-End Web, IoT & Platform Engineering",
          blurb:
            "Web apps, connected devices and the platforms behind them — architecture, build, integration and release, owned by one accountable team.",
          href: "/services",
        },
        {
          icon: "lifebuoy",
          title: "Ongoing Management, Optimization & Support",
          blurb:
            "We stay on after launch — monitoring, cost and performance optimization, iterative improvement and dependable support.",
          href: "/services",
        },
      ] as FeatureCard[],
    },

    why: {
      eyebrow: "Why Advait",
      title: "Two decades of transformation experience, applied to AI",
      lead: "We were early to AI coding agents and to guarded RAG pipelines — and we bring the same reliability mindset we've used since 2004.",
      points: [
        {
          icon: "shield",
          title: "Reliability first",
          blurb:
            "20+ years shipping systems that have to keep working. AI doesn't change that standard — it raises it.",
        },
        {
          icon: "sparkles",
          title: "Early, deliberate AI adoption",
          blurb:
            "AI-accelerated development and guarded RAG in real client work — adopted early, used responsibly.",
        },
        {
          icon: "userCheck",
          title: "Senior team, end to end",
          blurb:
            "You work with experienced engineers who own delivery from discovery through support — no hand-offs to juniors.",
        },
        {
          icon: "network",
          title: "Offshore, without the friction",
          blurb:
            "Clear communication, overlapping hours and a track record with US, Canada, UK, Europe and Middle East clients.",
        },
      ] as FeatureCard[],
    },

    capabilities: {
      eyebrow: "AI capabilities",
      title: "What production-grade AI actually requires",
      lead: "The pieces we build into every AI system we ship.",
      items: [
        { icon: "shield", title: "RAG with Guardrails" },
        { icon: "workflow", title: "Intent Classification" },
        { icon: "database", title: "Tool Calling (SQL / API)" },
        { icon: "bot", title: "Multi-Agent Orchestration" },
        { icon: "scroll", title: "AI Audit Logging" },
        { icon: "userCheck", title: "Human-in-the-Loop Quality Gates" },
      ] as { icon: IconName; title: string }[],
    },

    featuredWork: {
      eyebrow: "Selected work",
      title: "Where reliability meets AI",
      lead: "A sample of high-impact and AI-related engagements.",
      fallback: [
        {
          title: "Guarded RAG assistant for a regulated knowledge base",
          client: "Enterprise services (anonymized)",
          summary:
            "A retrieval assistant with strict guardrails, citations and human-in-the-loop review for a compliance-sensitive document set.",
        },
        {
          title: "Multi-agent operations copilot",
          client: "Logistics platform (anonymized)",
          summary:
            "Agents that classify intent, call internal APIs and SQL, and escalate to a human when confidence drops — with full audit logging.",
        },
        {
          title: "AI-accelerated platform rebuild",
          client: "SaaS vendor (anonymized)",
          summary:
            "A legacy platform re-engineered in a fraction of the usual time using AI-assisted development, without compromising test coverage.",
        },
      ],
    },

    finalCta: {
      title: "Building something that has to be reliable?",
      body: "Talk to a senior engineer about AI-accelerated delivery or a production RAG / agent system. We work with teams across the US, Canada and beyond.",
      cta: { label: "Book a Discovery Call", href: "/contact" },
    },
  },

  pages: {
    services: {
      cmsSection: "page-services",
      hero: {
        eyebrow: "Services",
        title: "AI-accelerated engineering, delivered end to end",
        lead: "Senior software development and production AI, from one accountable team.",
      },
      blocks: [
        {
          icon: "zap",
          title: "AI-Accelerated Custom Software Development",
          body: "We build web, mobile and backend products full-cycle, with AI coding agents integrated into our workflow. You get faster delivery and the same review discipline, testing and architecture rigor we've applied since 2004.",
        },
        {
          icon: "brain",
          title: "Production RAG & Multi-Agent Systems",
          body: "Retrieval-augmented generation with guardrails, intent classification, tool calling (SQL/API), multi-agent orchestration, audit logging and human-in-the-loop gates — designed to survive real users and real data.",
        },
        {
          icon: "boxes",
          title: "End-to-End Web, IoT & Platform Engineering",
          body: "From connected devices to the cloud platforms behind them: architecture, implementation, third-party integration, CI/CD and release management.",
        },
        {
          icon: "lifebuoy",
          title: "Ongoing Management, Optimization & Support",
          body: "Post-launch monitoring, performance and cost optimization, iterative feature work and dependable support arrangements.",
        },
      ] as { icon: IconName; title: string; body: string }[],
    },

    products: {
      cmsSection: "page-products",
      hero: {
        eyebrow: "AI Products & RAG",
        title: "Production RAG and agent systems, engineered to be trusted",
        lead: "The building blocks we assemble into AI systems that hold up outside a demo.",
      },
      blocks: [
        {
          icon: "shield",
          title: "RAG with Guardrails",
          body: "Grounded answers with citations, retrieval filtering, prompt-injection defenses and refusal behavior tuned to your risk tolerance.",
        },
        {
          icon: "workflow",
          title: "Intent Classification",
          body: "Route each request to the right pipeline, tool or agent — and know when to ask a human.",
        },
        {
          icon: "database",
          title: "Tool Calling (SQL / API)",
          body: "Safe, permissioned access to your databases and services, with schema-aware query generation and validation.",
        },
        {
          icon: "bot",
          title: "Multi-Agent Orchestration",
          body: "Coordinated agents with clear responsibilities, shared context and deterministic fallbacks.",
        },
        {
          icon: "scroll",
          title: "AI Audit Logging",
          body: "Every prompt, retrieval, tool call and decision recorded for debugging, compliance and evaluation.",
        },
        {
          icon: "userCheck",
          title: "Human-in-the-Loop Quality Gates",
          body: "Confidence thresholds and review queues so people stay in control of the outcomes that matter.",
        },
      ] as { icon: IconName; title: string; body: string }[],
    },

    about: {
      cmsSection: "page-about",
      hero: {
        eyebrow: "About",
        title: "A senior software team, building for the AI era",
        lead: "Advait Solutions has delivered reliable software since 2004. We've spent the last few years bringing the same discipline to AI.",
      },
      stats: [
        { value: "2004", label: "Building software since" },
        { value: "20+", label: "Years of delivery experience" },
        { value: "10+", label: "Senior engineers" },
        { value: "3", label: "Continents of clients" },
      ],
      values: [
        {
          icon: "shield",
          title: "Reliability over hype",
          body: "We recommend AI where it genuinely helps and say so when it doesn't.",
        },
        {
          icon: "userCheck",
          title: "Accountability",
          body: "One team owns your engagement from discovery to support.",
        },
        {
          icon: "sparkles",
          title: "Deliberate adoption",
          body: "We adopt new tools early, but only after we understand their failure modes.",
        },
      ] as { icon: IconName; title: string; body: string }[],
    },

    approach: {
      cmsSection: "page-approach",
      hero: {
        eyebrow: "Our approach",
        title: "How we deliver AI systems you can rely on",
        lead: "A process shaped by 20+ years of engineering and refined for AI.",
      },
      steps: [
        {
          title: "Discovery & feasibility",
          body: "We map the problem, the data and the risk, and tell you honestly whether AI is the right tool.",
        },
        {
          title: "Guarded prototype",
          body: "A working slice with retrieval, guardrails and evaluation in place from day one — not a throwaway demo.",
        },
        {
          title: "AI-accelerated build",
          body: "Full delivery with AI coding agents in our workflow, human review on every change, and tests that mean something.",
        },
        {
          title: "Human-in-the-loop hardening",
          body: "Confidence thresholds, review queues, audit logging and load testing before anyone relies on it.",
        },
        {
          title: "Optimize & support",
          body: "Ongoing monitoring, cost and quality tuning, and dependable support once you're live.",
        },
      ],
    },
  },
} as const;

export type SiteContent = typeof siteContent;
