Create a modern, production-ready Home Page that will serve as the **base/layout template** for a CMS we are building. This page must be fully reusable as the foundation for all other pages (Services, Products, Case Studies, About, Blog, Contact).

### Brand & Company Context
- Company: Advait Solutions (https://www.advaitsolutions.com)
- Tagline: Reliable Software. Intelligent AI. Real Business Value. 
- Positioning: “20+ Years Building Reliable Software. Now Building Reliable AI Systems.”
- Existing logo (use exactly this URL, high-res, transparent background preferred):
  https://www.advaitsolutions.com/wp-content/uploads/2022/08/cropped-aslogo_embosed.jpg
- Brand colors derived from logo:
  - Primary Orange: #F97316 (or closest Tailwind orange-500/600)
  - Dark Gray / Charcoal: #1F2937 / #111827
  - Accent: soft white, light gray, very subtle blue-gray for backgrounds
- Target audience: Europe, UK, UAE, Oman, Middle East, US & Canada offshore clients looking for senior, experienced IT partner who has adopted AI (RAG, agents, AI-accelerated development).
- Tone: Professional, trustworthy, modern, senior-expert (not startup hype).

### Technical Requirements (strict)
- Mobile-first responsive design
- Tailwind CSS (latest stable)
- Progressive Web App (PWA) ready:
  - Include a complete web manifest (name, short_name, icons, theme_color, background_color, display: standalone)
  - Service worker registration stub (basic offline caching of static assets)
  - Apple touch icons + meta tags for iOS
- React Router 8 preferred, or clean React + Vite if Next is not specified. Use TypeScript.
- Semantic HTML5, excellent accessibility (ARIA where needed, proper heading hierarchy, keyboard navigation)
- Performance: lazy-load images, modern image formats (WebP/AVIF with fallbacks), critical CSS inlined if possible
- Dark mode support (system preference + manual toggle) using Tailwind dark: variants
- SEO-ready: proper <title>, meta description, Open Graph, Twitter cards
- The page must be structured so a CMS can later inject content into clearly marked sections (use data attributes or clear component props like `data-cms-section="hero"` etc.)

### Page Structure (Home Page sections – in this exact order)

1. **Sticky Header / Navigation**
   - Logo (left) linking to home
   - Desktop nav: Home | Services | AI Products | Case Studies | About | Insights | Contact
   - Mobile: hamburger that opens a smooth full-screen or slide-over menu
   - CTA button on the right: “Start a Project” (orange)
   - Subtle shadow on scroll

2. **Hero Section**
   - Large headline: “20+ Years Building Reliable Software. Now Building Reliable AI Systems.”
   - Subheadline explaining AI-accelerated custom development + production RAG/Agent systems for US/Canada clients
   - Two primary CTAs:
     - “AI-Accelerated Development” (primary orange)
     - “Explore AI Products & RAG” (secondary outline)
   - Background: subtle abstract tech/AI visual (see image recommendations below) with soft gradient overlay so text remains highly readable
   - Trust indicators row below CTAs: “Since 2004”, “US & Canada Clients”, “Team of 10+”, “End-to-End Delivery”

3. **Services Snapshot** (3–4 cards)
   - AI-Accelerated Custom Software Development
   - Production RAG & Multi-Agent Systems
   - End-to-End Web, IoT & Platform Engineering
   - Ongoing Management, Optimization & Support
   - Each card has icon + short description + “Learn more” link

4. **Why Advait / Value Proposition**
   - Short section highlighting 20+ years of transformation experience + early adoption of AI coding agents and guarded RAG pipelines
   - Key differentiators in a clean grid or horizontal scroll on mobile

5. **Featured Work / Case Study Teaser**
   - 2–3 anonymized or real project cards (placeholder content is fine)
   - Focus on AI-related or high-impact work

6. **AI Capabilities Strip**
   - Visual strip or small cards showing: RAG with Guardrails, Intent Classification, Tool Calling (SQL/API), Multi-Agent Orchestration, AI Audit Logging, Human-in-the-Loop Quality Gates

7. **Final CTA Banner**
   - Strong call-to-action for US/Canada clients
   - Button: “Book a Discovery Call” or “Start a Project”

8. **Footer**
   - Logo + short description
   - Quick links
   - Contact info (placeholder)
   - Social links (LinkedIn primary)
   - Copyright + “Built for the AI era”

### Design Guidelines
- Clean, generous whitespace, modern sans-serif (Inter or system-ui)
- Rounded corners (lg/xl), soft shadows, subtle borders
- Orange used sparingly for CTAs and accents only
- High contrast text
- Smooth scroll and subtle hover/transition effects
- All interactive elements must have clear focus states

### Images & Graphics (use these exact free Unsplash sources or very similar high-quality alternatives)

Download and optimize these (or generate similar with the agent’s image capability if available):

Hero / background:
- https://unsplash.com/photos/a-network-of-intelligent-nodes-representing-autonomous-ai-agents-processing-and-writing-programming-code-illustrates-concepts-like-ai-assisted-development-machine-learning-models-and-generative-ai-tools-3MVk4jafxBU
- Alternative abstract: https://unsplash.com/photos/futuristic-programming-code-and-big-data-connections-and-network-patterns-3d-illustration-uFG8vkT0Iq8

Team / collaboration / professional:
- https://unsplash.com/photos/programmer-and-ux-ui-designer-working-in-a-software-development-and-coding-technologies-mobile-and-website-design-and-programing-development-technology-IO4Jssj-TQY

Code / development:
- https://unsplash.com/photos/web-development-code-with-chat-bubbles-5CSBzX37w18

Additional supporting images (icons can be Heroicons or Lucide):
- Clean abstract neural / data flow visuals
- Modern laptop + code editor scenes
- Professional remote/collaboration settings

Use next/image (or equivalent) with proper width/height, priority on hero, lazy elsewhere. Provide meaningful alt text.

### Deliverables expected from you (the coding agent)
1. Complete, runnable Home page component(s) + layout
2. Tailwind config with brand colors extended
3. PWA files: manifest.webmanifest + basic service-worker.js + necessary meta tags in <head>
4. All images downloaded/optimized and placed in public/ or assets/
5. Clear comments marking CMS-injectable sections
6. Responsive behavior verified (mobile → desktop)
7. Dark mode working
8. Basic accessibility audit passed

Make the page feel premium, trustworthy, and ready to be the foundation of the entire CMS-powered site. Prioritize performance, mobile experience, and clean component architecture so other pages can easily extend this layout.