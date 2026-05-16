# Redline Installers — CLAUDE.md

## Project
Warehouse & material handling specialist website for Redline Installers LLC (Chicago, IL).
Stack: Astro 6 + Tailwind CSS 4 + TypeScript strict + Preact islands.
Hosted: Cloudflare Pages. Domain: redlineinstallers.com.
Email: jk@redlineinstallers.com | Phone: 630-363-7251.

## Goals (in priority order)
1. SEO ranking for pallet rack / warehouse installation keywords (IL, Midwest, nationwide).
2. Lead generation via Request a Quote form + Quote Engine wizard.
3. Brand repositioning: Warehouse & Material Handling Specialists, NOT general contractor.

## Key business rules
- Address: 980 N Michigan Ave Ste 1090 PMB 357073, Chicago, IL 60611. Never use Bolingbrook.
- Founder: John Korabik, 34+ years installer.
- Services: pallet-rack-installation, warehouse-relocation, rack-repair-modifications, mezzanine-installation, conveyor-systems, tear-down-reinstallation, material-handling-systems.
- Industries: warehousing, distribution-centers, manufacturing, logistics, industrial-storage, food-distribution.
- CTA hierarchy: Request a Quote (primary) > Call Now (secondary). Mobile: sticky bottom bar with phone.

## Tech constraints
- Astro output: static (SSG). No SSR unless specifically added.
- Islands: Preact only, client:load or client:visible. Never React.
- Forms: Astro actions POST /api/quote. Validation: Zod. Spam: Cloudflare Turnstile.
- Email: Resend API. Storage: Cloudflare D1. Files: Cloudflare R2.
- Tailwind v4: config is CSS-only via @theme in global.css. No tailwind.config.ts.
- Content: Astro content collections in src/content/services/ and src/content/industries/.
- No WordPress, no React, no Next.js.

## Design system (Redline Industrial Precision v2)
Inspired by enerblock.net — minimal, whitespace-forward, typography-led industrial aesthetic.
- Fonts: Hanken Grotesk (display/headlines), Inter (body/UI).
- Primary: #ba0013 (Safety Red). ONLY on: logo, primary CTA, eyebrow labels, stat numbers, section-heading underline.
- Background: #ffffff (white dominant). Alt sections: #f7f8f9. Dark sections (hero/CTA/footer): #0a0e13.
- Steel scale: #0a0e13 (950) to #f7f8f9 (50). steel-200 (#dce0e5) for decorative section numbers.
- Borders: 1px solid #e5e7ea (--color-border). NO box-shadows ever.
- Hover: border-color -> primary red only (no width change, no shadow).
- Cards: white bg, 1px border, 32px padding, NO border-radius (sharp corners = industrial).
- Buttons: .btn-primary (red filled), .btn-outline-light (white border on dark), .btn-outline (dark border on light), .btn-text (link style with arrow).
- Section numbers: Hanken Grotesk weight 200, color steel-200, 42-72px — decorative.
- Sections: 100px padding-block major, 72px medium, 48px compact.
- Container: .container — 24px/48px/80px padding inline, 1280px max.
- CRITICAL: Never put --spacing-* in @theme block (breaks Tailwind v4 max-w-* utilities).
- Typography scale: .text-display (clamp 42-80px 800wt), .text-headline-lg (clamp 30-52px), .text-eyebrow (11px uppercase red).
- Seamless tile grids: parent border-top+left, child border-right+bottom.

## SEO rules
- Each page has <SEO /> with title, description, canonical, OG, Twitter.
- Each page has <JsonLd /> with appropriate schema (LocalBusiness / Service / FAQPage / BreadcrumbList).
- H1 contains primary keyword. One H1 per page.
- Image alt = descriptive keyword text, never "image" or empty.
- URLs: kebab-case, no query strings.

## Agents available (see .claude/agents/)
- astro-dev: Astro 6 component and page development.
- seo-optimizer: Schema.org, meta tags, keyword integration.
- design-system: Translating designs to Tailwind v4 + Astro components.
- quote-engine: Quote wizard Preact island + pricing engine.
- rack-inspector: AI rack inspection tool with Claude vision API.
- automation-architect: Cloudflare Workers, D1, R2, Resend, Cal.com integrations.
- ai-concierge: Web chat + WhatsApp/SMS AI agent, escalation logic, conversation design.

## Key docs (see docs/)
- IMPLEMENTATION.md: master implementation plan, phases, env vars checklist.
- redline-automations-v2.md: unified automation architecture (Quote Engine + Rack Inspector + Concierge + Reviews).
- DESIGN (1).md: Redline Industrial Grid design kit source (M3 color tokens, typography, layout).
- redline-installers-plan.md: original business plan and requirements.
- redline-installers-automations.md: original automations spec (v1).

---

## Output rules (drona23/claude-token-efficient coding profile)
- Return code first. Explanation after, only if non-obvious.
- No inline prose. Comments only where logic is unclear.
- No boilerplate unless explicitly requested.
- Simplest working solution. No over-engineering.
- No abstractions for single-use operations.
- No speculative features.
- Read file before modifying. Never edit blind.
- No error handling for impossible scenarios.
- Three similar lines > premature abstraction.
- No em dashes, smart quotes, or decorative Unicode.
- No sycophantic openers or closing fluff.
- Do not guess APIs, versions, or package names. Verify in code or docs.
