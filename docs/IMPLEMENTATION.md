# Redline Installers — Master Implementation Plan

**Project:** redlineinstallers.com — Warehouse & Material Handling Specialists  
**Stack:** Astro 6 + Tailwind CSS 4 + TypeScript strict + Preact islands  
**Hosting:** Cloudflare Pages (SSG, static output)  
**Date:** 2026-05-16  

---

## Table of Contents

1. [Current State Assessment](#1-current-state-assessment)
2. [Repository Structure (Target)](#2-repository-structure-target)
3. [Content Collections Schema](#3-content-collections-schema)
4. [Pages to Build](#4-pages-to-build)
5. [SEO Implementation Per Page](#5-seo-implementation-per-page)
6. [Quote Engine Wizard](#6-quote-engine-wizard)
7. [AI Rack Inspection Tool](#7-ai-rack-inspection-tool)
8. [Cloudflare Infrastructure](#8-cloudflare-infrastructure)
9. [Email Flows (Resend)](#9-email-flows-resend)
10. [Booking Integration (Cal.com)](#10-booking-integration-calcom)
11. [SMS Notifications (Twilio)](#11-sms-notifications-twilio)
12. [Analytics (GA4 + Search Console)](#12-analytics-ga4--search-console)
13. [Phased Roadmap](#13-phased-roadmap)
14. [Environment Variables Checklist](#14-environment-variables-checklist)
15. [Launch Checklist](#15-launch-checklist)

---

## 1. Current State Assessment

### Implemented

| Item | Status | File |
|---|---|---|
| Astro 6 project scaffold | Done | `package.json`, `astro.config.mjs` |
| Tailwind v4 design tokens | Done | `src/styles/global.css` |
| BaseLayout | Done | `src/layouts/BaseLayout.astro` |
| SEO component | Done | `src/components/SEO.astro` |
| JsonLd component | Done | `src/components/JsonLd.astro` |
| Header (desktop + mobile menu) | Done | `src/components/Header.astro` |
| Footer (4-column, dark) | Done | `src/components/Footer.astro` |
| Hero (full + compact variants) | Done | `src/components/Hero.astro` |
| TrustBar | Done | `src/components/TrustBar.astro` |
| ServiceCard | Done | `src/components/ServiceCard.astro` |
| IndustryCard | Done | `src/components/IndustryCard.astro` |
| CTASection | Done | `src/components/CTASection.astro` |
| WhyChooseUs | Done | `src/components/WhyChooseUs.astro` |
| MobileCTABar | Done | `src/components/MobileCTABar.astro` |
| Content collection config | Done | `src/content/config.ts` |
| 1 service MDX | Done | `src/content/services/pallet-rack-installation.mdx` |
| Homepage | **Placeholder only** | `src/pages/index.astro` — empty Astro default |
| 6 agents | Done | `.claude/agents/*.md` |

### Not Implemented (Gaps)

- Homepage `index.astro` uses default Astro scaffold — needs full page build
- No service pages (`[slug].astro` template)
- No services hub (`/services/index.astro`)
- No industry pages or hub
- 6 service MDX files missing (only `pallet-rack-installation.mdx` exists)
- 6 industry MDX files missing (0 of 6)
- No `about.astro`, `service-area.astro`, `contact.astro`, `quote.astro`, `thank-you.astro`, `privacy.astro`, `terms.astro`
- No Quote Engine wizard (Preact island)
- No AI Rack Inspection tool
- No Cloudflare D1/R2/KV setup
- No Resend email integration
- No Cal.com booking
- No Twilio SMS
- No GA4 implementation
- No `og-default.jpg`, no `favicon.svg`, no `robots.txt`
- No `tsconfig.json` (TypeScript strict mode)
- No Cloudflare Turnstile
- No pricing engine or lead scorer

### Dependencies Not Yet Installed

```json
// These packages need to be added to package.json via npm install:
"@anthropic-ai/sdk": "latest",
"@cloudflare/d1": "via wrangler binding",
"resend": "latest",
"@react-pdf/renderer": "latest"
```

> Do not install packages without verifying version compatibility with Node >=22.12.0.  
> Run `npm install <package>` and verify `package.json` after each addition.

---

## 2. Repository Structure (Target)

```
redline-installers/
├── public/
│   ├── favicon.svg
│   ├── og-default.jpg          # 1200x630, steel-950 bg + logo
│   └── robots.txt
├── src/
│   ├── assets/
│   │   └── images/             # Source images for astro:assets <Image />
│   ├── components/
│   │   ├── Header.astro        # DONE
│   │   ├── Footer.astro        # DONE
│   │   ├── Hero.astro          # DONE
│   │   ├── SEO.astro           # DONE
│   │   ├── JsonLd.astro        # DONE
│   │   ├── TrustBar.astro      # DONE
│   │   ├── ServiceCard.astro   # DONE
│   │   ├── IndustryCard.astro  # DONE
│   │   ├── CTASection.astro    # DONE
│   │   ├── WhyChooseUs.astro   # DONE
│   │   ├── MobileCTABar.astro  # DONE
│   │   ├── Breadcrumbs.astro   # TODO
│   │   ├── FAQAccordion.astro  # TODO
│   │   ├── ServiceAreaMap.astro # TODO
│   │   └── ContactForm.tsx     # TODO (Preact island)
│   ├── content/
│   │   ├── config.ts           # DONE — may need industry schema expansion
│   │   ├── services/
│   │   │   ├── pallet-rack-installation.mdx   # DONE
│   │   │   ├── warehouse-relocation.mdx        # TODO
│   │   │   ├── rack-repair-modifications.mdx   # TODO
│   │   │   ├── mezzanine-installation.mdx      # TODO
│   │   │   ├── conveyor-systems.mdx            # TODO
│   │   │   ├── tear-down-reinstallation.mdx    # TODO
│   │   │   └── material-handling-systems.mdx   # TODO
│   │   └── industries/
│   │       ├── warehousing.mdx                 # TODO
│   │       ├── distribution-centers.mdx        # TODO
│   │       ├── manufacturing.mdx               # TODO
│   │       ├── logistics.mdx                   # TODO
│   │       ├── industrial-storage.mdx          # TODO
│   │       └── food-distribution.mdx           # TODO
│   ├── data/
│   │   └── pricing-rules.json  # TODO — quote engine pricing table
│   ├── db/
│   │   └── schema.sql          # TODO — D1 table definitions
│   ├── emails/
│   │   ├── InternalNotification.tsx  # TODO — Resend React Email template
│   │   └── ClientAutoReply.tsx       # TODO — Resend React Email template
│   ├── islands/
│   │   ├── QuoteWizard.tsx     # TODO — 5-step quote wizard Preact island
│   │   └── RackInspector.tsx   # TODO — rack inspection upload Preact island
│   ├── layouts/
│   │   └── BaseLayout.astro    # DONE
│   ├── lib/
│   │   ├── pricing-engine.ts   # TODO — pure function, no side effects
│   │   ├── lead-scorer.ts      # TODO — pure function
│   │   └── turnstile.ts        # TODO — Cloudflare Turnstile server-side verify
│   ├── pages/
│   │   ├── index.astro         # TODO — full homepage (currently empty scaffold)
│   │   ├── about.astro         # TODO
│   │   ├── contact.astro       # TODO
│   │   ├── service-area.astro  # TODO
│   │   ├── thank-you.astro     # TODO
│   │   ├── privacy.astro       # TODO
│   │   ├── terms.astro         # TODO
│   │   ├── quote.astro         # TODO — wraps QuoteWizard island
│   │   ├── services/
│   │   │   ├── index.astro     # TODO — services hub
│   │   │   └── [slug].astro    # TODO — dynamic service template
│   │   ├── industries/
│   │   │   ├── index.astro     # TODO — industries hub
│   │   │   └── [slug].astro    # TODO — dynamic industry template
│   │   ├── tools/
│   │   │   └── rack-inspection/
│   │   │       └── index.astro # TODO — AI rack inspection tool
│   │   └── api/
│   │       ├── quote.ts        # TODO — Astro server endpoint, POST handler
│   │       └── rack-analysis.ts # TODO — Astro server endpoint, Claude vision
│   ├── prompts/
│   │   └── rack-inspector-system.txt  # TODO — Claude system prompt
│   ├── schemas/
│   │   ├── quote.ts            # TODO — Zod schema, shared client + server
│   │   └── rack-analysis.ts    # TODO — Zod schema for Claude output
│   └── styles/
│       └── global.css          # DONE
├── .claude/
│   └── agents/                 # DONE (6 agents)
├── astro.config.mjs            # DONE — needs server endpoints config check
├── tsconfig.json               # TODO
├── wrangler.toml               # TODO — Cloudflare bindings
└── package.json                # DONE
```

---

## 3. Content Collections Schema

Current `src/content/config.ts` is correct. Extended version needed for industries:

```typescript
// src/content/config.ts — target state
import { defineCollection, z } from 'astro:content';

const services = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    shortDesc: z.string(),
    icon: z.string(),
    keywords: z.array(z.string()),
    order: z.number(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    ogImage: z.string().optional(),
    heroImage: z.string().optional(),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).default([]),
    relatedServices: z.array(z.string()).default([]),
    relatedIndustries: z.array(z.string()).default([]),
  }),
});

const industries = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    shortDesc: z.string(),
    icon: z.string(),
    order: z.number(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    keywords: z.array(z.string()).default([]),
    relatedServices: z.array(z.string()).default([]),
  }),
});

export const collections = { services, industries };
```

### Service MDX Frontmatter Template

```yaml
---
title: "Warehouse Relocation"
description: "Full-service warehouse relocation..."
shortDesc: "Complete warehouse moves without losing a day of productivity."
icon: "🚛"
keywords: ["warehouse relocation services", "warehouse moving company illinois"]
order: 2
metaTitle: "Warehouse Relocation Services Illinois | Redline Installers LLC"
metaDescription: "Professional warehouse relocation in Illinois & Midwest. 34+ years experience. Full disassembly, transport coordination, reinstallation. Free site assessment."
faq:
  - question: "..."
    answer: "..."
relatedServices: ["pallet-rack-installation", "tear-down-reinstallation"]
relatedIndustries: ["warehousing", "distribution-centers"]
---
```

### All Services (7 slugs)

| Slug | Title | Order |
|---|---|---|
| `pallet-rack-installation` | Pallet Rack Installation | 1 |
| `warehouse-relocation` | Warehouse Relocation | 2 |
| `rack-repair-modifications` | Rack Repair & Modifications | 3 |
| `mezzanine-installation` | Mezzanine Installation | 4 |
| `conveyor-systems` | Conveyor Systems | 5 |
| `tear-down-reinstallation` | Tear Down & Reinstallation | 6 |
| `material-handling-systems` | Material Handling Systems | 7 |

### All Industries (6 slugs)

| Slug | Title | Order |
|---|---|---|
| `warehousing` | Warehousing | 1 |
| `distribution-centers` | Distribution Centers | 2 |
| `manufacturing` | Manufacturing | 3 |
| `logistics` | Logistics | 4 |
| `industrial-storage` | Industrial Storage | 5 |
| `food-distribution` | Food Distribution | 6 |

---

## 4. Pages to Build

### 4.1 Homepage (`/`) — Priority: Critical

**Current state:** empty Astro default scaffold.

Section stack (top to bottom):
1. `<TrustBar />` — above the fold, below header
2. `<Hero />` — H1 with primary keyword, 2 CTAs
3. Services preview grid — 7 `<ServiceCard />` components
4. `<WhyChooseUs />` — 6 stats (already built)
5. Industries grid — 6 `<IndustryCard />` components
6. Service area callout — text block, no map dependency
7. `<CTASection />` — dark bg, quote CTA
8. `<MobileCTABar />` — injected via BaseLayout

**H1:** "Professional Warehouse & Pallet Rack Installation Specialists"  
**Schema:** LocalBusiness (already in BaseLayout) + WebSite + BreadcrumbList (home)

### 4.2 Services Hub (`/services/`)

Grid of all 7 service cards. No content collection query needed — static list is fine.  
Schema: BreadcrumbList.

### 4.3 Service Pages (`/services/[slug]/`) — 7 pages

Template: `src/pages/services/[slug].astro`  
Uses `getStaticPaths()` + `getCollection('services')`.

Section stack per service page:
1. `<Hero compact />` — H1 = service title + primary keyword
2. Long-form content from MDX body (300–500 words, keywords integrated)
3. "What We Do" bullet list (from MDX)
4. Related industries cross-link grid
5. "Why Redline for [Service]" — 3 reasons
6. `<CTASection />`
7. FAQ accordion — from frontmatter `faq` array
8. `<MobileCTABar />`

Schema: Service + FAQPage + BreadcrumbList

### 4.4 Industries Hub (`/industries/`)

Grid of all 6 `<IndustryCard />` components.

### 4.5 Industry Pages (`/industries/[slug]/`) — 6 pages

Template: `src/pages/industries/[slug].astro`

Section stack:
1. Hero compact
2. Industry description (MDX body)
3. Services used in this industry (cross-link to service pages)
4. `<CTASection />`
5. `<MobileCTABar />`

Schema: Service (with industryServed) + BreadcrumbList

### 4.6 About (`/about/`)

Sections:
1. Hero compact — H1: "34+ Years Building America's Warehouses"
2. Founder bio: John Korabik, 34+ years, installer background
3. Company section: Redline Installers LLC, Chicago IL
4. Safety & OSHA commitment
5. Crew coverage (nationwide, nights/weekends)
6. `<CTASection />`

Schema: LocalBusiness (full) + Person (John Korabik) + BreadcrumbList

### 4.7 Service Area (`/service-area/`) — SEO Critical

H1: "Pallet Rack Installation & Warehouse Solutions — Illinois, Midwest & Nationwide"

Sections:
1. Hero compact
2. Primary market: Illinois (Chicago, Chicagoland suburbs)
3. Midwest states grid: IL, IN, WI, MI, OH, IA, MO — with service blurb per state
4. Nationwide callout: "Travel projects welcome — all 50 states"
5. `<CTASection />`

Schema: Service with areaServed (array of State entities) + BreadcrumbList

### 4.8 Contact (`/contact/`)

Sections:
1. Hero compact — H1: "Contact Redline Installers"
2. Contact info block: phone (clickable), email, address
3. `<ContactForm />` Preact island (client:load)
4. Business hours

**Address (always):** 980 N Michigan Ave Ste 1090 PMB 357073, Chicago, IL 60611-4521  
**Never use Bolingbrook.**

Schema: LocalBusiness (full with geo, hours) + BreadcrumbList

### 4.9 Quote (`/quote/`)

Wraps `<QuoteWizard />` Preact island with `client:load`.  
No static content other than page frame (title, meta, layout).

Schema: Service + BreadcrumbList

### 4.10 Thank You (`/thank-you/`)

Post-submission confirmation. `noindex: true`.  
Content: confirmation message, what happens next, phone number.  
GA4 conversion event fires on this page load via `<script>` tag.

### 4.11 Tools — AI Rack Inspection (`/tools/rack-inspection/`)

Wraps `<RackInspector />` Preact island with `client:load`.  
Disclaimer checkbox must be accepted before upload is enabled.

Schema: WebApplication + BreadcrumbList

### 4.12 Privacy (`/privacy/`) and Terms (`/terms/`)

Static legal pages. `noindex: false` (Google should index these).  
Minimal layout — no hero. Standard legal copy.

---

## 5. SEO Implementation Per Page

### Meta Tag Rules

- `title`: max 60 chars — "[Page] | Redline Installers LLC"
- `description`: 140–155 chars, action-oriented, keyword-rich
- `canonical`: always absolute URL (handled by `SEO.astro`)
- OG image: `/og-default.jpg` (1200x630) unless page-specific image provided

### Keyword Targets Per Page

| Page | Primary Keyword | Secondary Keywords |
|---|---|---|
| `/` | warehouse installation company | pallet rack installation illinois, material handling specialists |
| `/services/pallet-rack-installation/` | pallet rack installation illinois | pallet rack installers chicago, rack installation midwest |
| `/services/warehouse-relocation/` | warehouse relocation services | warehouse moving company illinois |
| `/services/rack-repair-modifications/` | pallet rack repair illinois | rack repair specialists chicago |
| `/services/mezzanine-installation/` | mezzanine installation illinois | warehouse mezzanine installers |
| `/services/conveyor-systems/` | conveyor system installation illinois | material handling conveyor install |
| `/services/tear-down-reinstallation/` | pallet rack tear down reinstallation | rack disassembly reinstall illinois |
| `/services/material-handling-systems/` | material handling installation | warehouse material handling systems illinois |
| `/service-area/` | pallet rack installation midwest | warehouse installation nationwide |
| `/about/` | warehouse installation specialists chicago | 34 years pallet rack installer |
| `/contact/` | warehouse installer contact chicago | pallet rack installation quote |
| `/quote/` | warehouse installation quote | pallet rack installation estimate illinois |
| `/tools/rack-inspection/` | rack inspection tool | pallet rack damage assessment free |

### JSON-LD Schema Per Page

```
/ (homepage)        → LocalBusiness + WebSite + BreadcrumbList
/services/          → BreadcrumbList
/services/[slug]/   → Service + FAQPage + BreadcrumbList
/industries/        → BreadcrumbList
/industries/[slug]/ → Service (industryServed) + BreadcrumbList
/about/             → LocalBusiness (full) + Person + BreadcrumbList
/service-area/      → Service (areaServed: US states) + BreadcrumbList
/contact/           → LocalBusiness (full, with geo + hours) + BreadcrumbList
/quote/             → Service + BreadcrumbList
/tools/rack-inspection/ → WebApplication + BreadcrumbList
/thank-you/         → none (noindex)
/privacy/           → BreadcrumbList
/terms/             → BreadcrumbList
```

### Breadcrumbs Component

```typescript
// src/components/Breadcrumbs.astro
interface Props {
  items: { label: string; href: string }[];
}
// Renders <nav aria-label="Breadcrumb"> + injects BreadcrumbList JSON-LD
```

### FAQPage Schema Shape (per service)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer text"
      }
    }
  ]
}
```

### Service Schema Shape

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Pallet Rack Installation",
  "provider": {
    "@type": "LocalBusiness",
    "@id": "https://redlineinstallers.com/#business"
  },
  "serviceType": "Pallet Rack Installation",
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "url": "https://redlineinstallers.com/services/pallet-rack-installation/"
}
```

### LocalBusiness Schema (full, for /about/ and /contact/)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://redlineinstallers.com/#business",
  "name": "Redline Installers LLC",
  "url": "https://redlineinstallers.com",
  "telephone": "+1-630-363-7251",
  "email": "jk@redlineinstallers.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "980 N Michigan Ave Ste 1090 PMB 357073",
    "addressLocality": "Chicago",
    "addressRegion": "IL",
    "postalCode": "60611-4521",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 41.8981,
    "longitude": -87.6237
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "07:00",
      "closes": "18:00"
    }
  ],
  "areaServed": { "@type": "Country", "name": "United States" },
  "priceRange": "$$",
  "founder": {
    "@type": "Person",
    "name": "John Korabik"
  }
}
```

---

## 6. Quote Engine Wizard

### Architecture

- **Island file:** `src/islands/QuoteWizard.tsx` (Preact)
- **Page:** `src/pages/quote.astro` — `<QuoteWizard client:load />`
- **State:** nanostores atom (`src/stores/quoteStore.ts`)
- **Schema:** `src/schemas/quote.ts` (Zod, shared client + server)
- **Pricing:** `src/lib/pricing-engine.ts` (pure function)
- **Lead scoring:** `src/lib/lead-scorer.ts` (pure function)
- **API endpoint:** `src/pages/api/quote.ts`

### Zod Schema

```typescript
// src/schemas/quote.ts
import { z } from 'zod';

export const quoteSchema = z.object({
  // Step 1
  service: z.enum([
    'pallet-rack-installation',
    'warehouse-relocation',
    'rack-repair-modifications',
    'mezzanine-installation',
    'conveyor-systems',
    'tear-down-reinstallation',
    'material-handling-systems',
    'not-sure',
  ]),
  // Step 2
  sqFt: z.number().min(0).max(2000000),
  positions: z.number().min(0).optional(),
  aisles: z.number().min(0).optional(),
  multiLevel: z.boolean().default(false),
  // Step 3
  projectCity: z.string().min(1),
  projectState: z.string().length(2),
  timeline: z.enum(['asap', '2-6-weeks', '1-3-months', 'planning']),
  activeWarehouse: z.boolean().default(false),
  // Step 4
  budgetRange: z.enum(['under-10k', '10-50k', '50-150k', '150k-plus', 'open']),
  rackSupplierChosen: z.boolean().default(false),
  rackSupplier: z.string().optional(),
  // Step 5
  name: z.string().min(2),
  company: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  role: z.string().optional(),
  wantsBooking: z.boolean().default(false),
  // Anti-spam
  turnstileToken: z.string().min(1),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;
```

### Pricing Engine

```typescript
// src/lib/pricing-engine.ts
import pricingRules from '../data/pricing-rules.json';

type TravelZone = 'chicagoland' | 'midwest' | 'nationwide';
type Urgency = 'asap' | '2-6-weeks' | '1-3-months' | 'planning';

interface PricingInput {
  service: string;
  sqFt: number;
  positions: number;
  timeline: Urgency;
  travelZone: TravelZone;
}

interface PricingOutput {
  minPrice: number;
  maxPrice: number;
  estimatedWeeks: string;
}

const TRAVEL_MULTIPLIERS: Record<TravelZone, number> = {
  chicagoland: 1.0,
  midwest: 1.15,
  nationwide: 1.3,
};

const URGENCY_MULTIPLIERS: Record<Urgency, number> = {
  asap: 1.3,
  '2-6-weeks': 1.1,
  '1-3-months': 1.0,
  planning: 0.95,
};

export function calculateEstimate(input: PricingInput): PricingOutput {
  const rule = pricingRules.services[input.service];
  if (!rule) throw new Error(`No pricing rule for service: ${input.service}`);

  const sizeKey = getSizeKey(input.sqFt);
  const base = rule.sizeRanges[sizeKey];

  const travelMult = TRAVEL_MULTIPLIERS[input.travelZone];
  const urgencyMult = URGENCY_MULTIPLIERS[input.timeline];

  return {
    minPrice: Math.round(base.min * travelMult * urgencyMult / 1000) * 1000,
    maxPrice: Math.round(base.max * travelMult * urgencyMult / 1000) * 1000,
    estimatedWeeks: rule.sizeRanges[sizeKey].weeks,
  };
}

function getSizeKey(sqFt: number): string {
  if (sqFt < 5000) return 'small';
  if (sqFt < 25000) return 'medium';
  if (sqFt < 100000) return 'large';
  return 'xlarge';
}
```

### Pricing Rules JSON Structure

```json
// src/data/pricing-rules.json — POPULATE WITH JOHN'S ACTUAL DATA
{
  "services": {
    "pallet-rack-installation": {
      "sizeRanges": {
        "small":  { "min": 5000,  "max": 15000,  "weeks": "1–2 weeks" },
        "medium": { "min": 15000, "max": 50000,  "weeks": "2–4 weeks" },
        "large":  { "min": 50000, "max": 150000, "weeks": "4–8 weeks" },
        "xlarge": { "min": 100000,"max": 500000, "weeks": "8–16 weeks" }
      }
    }
  }
}
```

> **All pricing values are placeholders. Populate via 2-hour session with John Korabik before going live.**

### Lead Scorer

```typescript
// src/lib/lead-scorer.ts
import type { QuoteFormData } from '../schemas/quote';

type LeadScore = 'hot' | 'warm' | 'cold';

const BUDGET_VALUES: Record<string, number> = {
  'under-10k': 5000,
  '10-50k': 30000,
  '50-150k': 100000,
  '150k-plus': 200000,
  'open': 75000,
};

const TIMELINE_WEEKS: Record<string, number> = {
  'asap': 1,
  '2-6-weeks': 4,
  '1-3-months': 8,
  'planning': 20,
};

export function scoreLead(data: QuoteFormData): LeadScore {
  const budget = BUDGET_VALUES[data.budgetRange] ?? 0;
  const weeks = TIMELINE_WEEKS[data.timeline] ?? 20;

  if (budget >= 50000 && weeks <= 6) return 'hot';
  if (budget >= 10000 || weeks <= 12) return 'warm';
  return 'cold';
}
```

### Wizard Steps (5)

```
Step 1: What do you need?
  - Service selector (radio cards, 8 options including "Not sure")

Step 2: Project size
  - sqFt slider (1,000–500,000+)
  - positions input (optional)
  - multiLevel toggle

Step 3: Location & timing
  - City, State inputs
  - Timeline radio (4 options)
  - Active warehouse toggle

Step 4: Budget & specs
  - Budget range (5 tiers)
  - Rack supplier status
  - File uploads for layout drawings (R2, max 20MB)

Step 5: Contact details
  - Name, Company, Email, Phone, Role
  - Booking toggle (shows Cal.com embed if true)
  - Cloudflare Turnstile widget
  - Submit
```

### API Endpoint Pattern

```typescript
// src/pages/api/quote.ts
import type { APIRoute } from 'astro';
import { quoteSchema } from '../../schemas/quote';
import { scoreLead } from '../../lib/lead-scorer';
import { verifyTurnstile } from '../../lib/turnstile';

export const POST: APIRoute = async ({ request, locals }) => {
  const body = await request.json();

  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid data' }), { status: 400 });
  }

  const data = parsed.data;

  // 1. Verify Turnstile
  const turnstileOk = await verifyTurnstile(data.turnstileToken, request.headers.get('CF-Connecting-IP') ?? '');
  if (!turnstileOk) {
    return new Response(JSON.stringify({ success: false, error: 'Spam check failed' }), { status: 403 });
  }

  // 2. Score lead
  const score = scoreLeadead(data);

  // 3. Save to D1
  // await locals.runtime.env.DB.prepare(INSERT_SQL).bind(...).run();

  // 4. Send emails via Resend
  // await sendInternalNotification(data, score);
  // await sendClientAutoReply(data);

  // 5. SMS John if hot lead
  // if (score === 'hot') await sendSmsToJohn(data);

  return new Response(JSON.stringify({ success: true, score }), { status: 200 });
};
```

> The API endpoint requires Cloudflare Pages Functions or Astro server mode for dynamic endpoints.  
> SSG (`output: 'static'`) cannot handle POST routes. This will require changing `output` to `'hybrid'` in `astro.config.mjs` for the `/api/*` routes only.

### Required Config Change

```javascript
// astro.config.mjs — add hybrid output for API routes
export default defineConfig({
  site: 'https://redlineinstallers.com',
  output: 'hybrid',  // changed from 'static'
  adapter: cloudflare(),  // npm install @astrojs/cloudflare
  integrations: [
    preact({ compat: false }),
    sitemap(),
    icon({ iconDir: 'src/icons' }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

> Install `@astrojs/cloudflare` before making this change. Verify version against Astro 6 compatibility.

---

## 7. AI Rack Inspection Tool

### Architecture

- **Page:** `src/pages/tools/rack-inspection/index.astro`
- **Island:** `src/islands/RackInspector.tsx` (Preact, `client:load`)
- **API endpoint:** `src/pages/api/rack-analysis.ts`
- **System prompt:** `src/prompts/rack-inspector-system.txt`
- **Schema:** `src/schemas/rack-analysis.ts`
- **Model:** `claude-sonnet-4-6` via `@anthropic-ai/sdk`

### Rack Analysis Zod Schema

```typescript
// src/schemas/rack-analysis.ts
import { z } from 'zod';

export const rackDamageSchema = z.object({
  damage_type: z.enum(['column', 'beam', 'brace', 'footplate', 'anchor', 'none']),
  damage_description: z.string(),
  severity: z.enum(['critical', 'moderate', 'cosmetic', 'none', 'unclear']),
  likely_cause: z.string(),
  ansi_reference: z.string(),
  recommendation: z.string(),
  load_status_advice: z.enum(['unload_immediately', 'reduce_load', 'monitor', 'safe']),
});

export const rackAnalysisResponseSchema = z.object({
  analyses: z.array(rackDamageSchema),
  overall_severity: z.enum(['critical', 'moderate', 'cosmetic', 'none']),
  critical_count: z.number(),
  moderate_count: z.number(),
  summary: z.string(),
});

export type RackDamage = z.infer<typeof rackDamageSchema>;
export type RackAnalysisResponse = z.infer<typeof rackAnalysisResponseSchema>;
```

### System Prompt (`src/prompts/rack-inspector-system.txt`)

```
You are a certified pallet rack inspector with expertise in ANSI MH16.1 and RMI (Rack Manufacturers Institute) guidelines. You analyze photos of warehouse pallet rack systems for structural damage and safety issues.

RULES:
- Be conservative. When in doubt, escalate severity to the next level.
- If an image is blurry, dark, or lacks sufficient detail to assess, return severity "unclear" and describe what would be needed.
- Never guess at severity. "unclear" is always valid when image quality is insufficient.
- Always cite a specific ANSI MH16.1 section number (e.g., "ANSI MH16.1 §6.2.3").
- Output ONLY valid JSON. No prose before or after the JSON.

OUTPUT FORMAT (JSON only):
{
  "analyses": [
    {
      "damage_type": "column" | "beam" | "brace" | "footplate" | "anchor" | "none",
      "damage_description": "specific description of damage observed",
      "severity": "critical" | "moderate" | "cosmetic" | "none" | "unclear",
      "likely_cause": "probable cause of damage",
      "ansi_reference": "ANSI MH16.1 §X.X.X",
      "recommendation": "specific action required",
      "load_status_advice": "unload_immediately" | "reduce_load" | "monitor" | "safe"
    }
  ],
  "overall_severity": "critical" | "moderate" | "cosmetic" | "none",
  "critical_count": <number>,
  "moderate_count": <number>,
  "summary": "2-3 sentence summary of overall rack condition"
}

SEVERITY DEFINITIONS:
- critical: Immediate risk of collapse or failure. Unload rack immediately.
- moderate: Significant damage affecting load capacity. Reduce load and schedule repair within 30 days.
- cosmetic: Surface damage only. No impact on structural integrity. Monitor and repair at next scheduled maintenance.
- none: No damage detected in this image.
- unclear: Image quality insufficient to make assessment.
```

### Claude API Call Pattern

```typescript
// src/pages/api/rack-analysis.ts (excerpt)
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: import.meta.env.ANTHROPIC_API_KEY });

const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 4096,
  system: systemPromptText,
  messages: [
    {
      role: 'user',
      content: [
        ...imageBase64Array.map((base64, i) => ({
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: 'image/jpeg' as const,
            data: base64,
          },
        })),
        {
          type: 'text',
          content: `Analyze the ${imageBase64Array.length} rack photos provided above.`,
        },
      ],
    },
  ],
});
```

### Image Handling Rules

| Rule | Value |
|---|---|
| Max images per analysis | 6 |
| Max file size | 20MB per image |
| Accepted types | JPEG, PNG, WebP |
| Storage | Cloudflare R2, signed URLs, 30-day expiry |
| Processing | Convert to base64 server-side before Claude call |
| Rate limiting | Max 5 analyses/hour per IP via Turnstile |

### Legal Requirements (Non-Negotiable)

1. Disclaimer checkbox must be accepted before upload is enabled
2. Disclaimer text: "This is a preliminary AI assessment, not a certified engineering inspection. Always consult a licensed professional engineer before making structural decisions."
3. Results page must display the disclaimer prominently
4. Every analysis logged to D1: `rack_analyses` table with image hash + timestamp + result
5. PDF report must include full disclaimer on page 1

### PDF Report (Cloudflare Worker)

- Library: `@react-pdf/renderer` (server-side in Cloudflare Worker)
- Template: red header bar + Redline logo + disclaimer footer
- Gated: lead capture form (name + email + phone + project location) required before PDF download
- PDF stored in R2 with signed URL, 7-day expiry

---

## 8. Cloudflare Infrastructure

### Services Used

| Service | Purpose | Tier |
|---|---|---|
| Cloudflare Pages | Static hosting + Functions | Free |
| Cloudflare D1 | SQLite serverless database | Free (5GB) |
| Cloudflare R2 | Object storage (uploads, PDFs) | Free (10GB) |
| Cloudflare KV | Rate limiting counters, session cache | Free (100K reads/day) |
| Cloudflare Turnstile | Invisible CAPTCHA | Free |
| Cloudflare Workers | PDF generation Worker | Free (100K req/day) |

### D1 Schema

```sql
-- src/db/schema.sql

CREATE TABLE IF NOT EXISTS leads (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  name        TEXT NOT NULL,
  company     TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL,
  service     TEXT NOT NULL,
  sq_ft       INTEGER,
  budget      TEXT,
  timeline    TEXT,
  project_city  TEXT,
  project_state TEXT,
  score       TEXT NOT NULL CHECK (score IN ('hot', 'warm', 'cold')),
  source_url  TEXT,
  source_keyword TEXT,
  cal_booked  INTEGER NOT NULL DEFAULT 0,
  raw_data    TEXT NOT NULL  -- JSON blob of full form data
);

CREATE TABLE IF NOT EXISTS rack_analyses (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  ip_hash     TEXT NOT NULL,
  image_hashes TEXT NOT NULL,  -- JSON array of SHA-256 hashes
  result      TEXT NOT NULL,   -- JSON blob of RackAnalysisResponse
  pdf_r2_key  TEXT,
  lead_name   TEXT,
  lead_email  TEXT,
  lead_phone  TEXT
);

CREATE TABLE IF NOT EXISTS bookings (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  cal_event_id TEXT NOT NULL,
  lead_id      TEXT REFERENCES leads(id),
  attendee_name  TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  start_time   TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'scheduled'
);

CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_ip ON rack_analyses(ip_hash);
```

### wrangler.toml

```toml
# wrangler.toml
name = "redline-installers"
compatibility_date = "2025-01-01"

[[d1_databases]]
binding = "DB"
database_name = "redline-leads"
database_id = "REPLACE_WITH_ACTUAL_D1_ID"

[[r2_buckets]]
binding = "UPLOADS"
bucket_name = "REPLACE_WITH_R2_BUCKET_NAME"

[[kv_namespaces]]
binding = "CACHE"
id = "REPLACE_WITH_KV_NAMESPACE_ID"
```

### Turnstile Verification

```typescript
// src/lib/turnstile.ts
export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = import.meta.env.CLOUDFLARE_TURNSTILE_SECRET;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  });
  const data = await res.json() as { success: boolean };
  return data.success;
}
```

---

## 9. Email Flows (Resend)

### Configuration

- From address: `leads@redlineinstallers.com`
- Reply-to: `jk@redlineinstallers.com`
- Domain: `redlineinstallers.com` (must be verified in Resend dashboard)
- Package: `resend` (install via npm, verify version)

### Flow 1: Quote Form Submission

```
User submits /quote/
  → API validates + scores
  → Resend sends:
      1. Internal notification → jk@redlineinstallers.com
         Subject: "New [HOT/WARM/COLD] Lead: [Company] - [Service]"
         Body: all form fields + calculated estimate + score
      2. Client auto-reply → user's email
         Subject: "We received your quote request — Redline Installers"
         Body: confirmation + what to expect + John's phone
```

### Internal Notification Email Fields

```
Subject: New HOT Lead: Acme Logistics - Pallet Rack Installation

Name: John Smith
Company: Acme Logistics
Email: john@acme.com
Phone: 312-555-0100
Service: Pallet Rack Installation
Size: 45,000 sq ft
Budget: $50K–$150K
Timeline: 2–6 weeks
Location: Aurora, IL (midwest zone)
Active warehouse: Yes

ESTIMATED RANGE: $85,000 – $125,000
LEAD SCORE: HOT

Source URL: /services/pallet-rack-installation/
Source Keyword: pallet rack installation illinois

→ Book site visit: [Cal.com link]
```

### Flow 2: Rack Analysis Lead Capture

```
User submits lead form after viewing rack analysis
  → Resend sends:
      1. Internal: "New Rack Inspection Lead: [Company]" + analysis summary
      2. Client: PDF download link (signed R2 URL, 7 days)
```

### Flow 3: Cal.com Booking Webhook

```
Cal.com booking.created event
  → Cloudflare Worker webhook handler
  → Update bookings table in D1
  → Resend: booking confirmation to attendee
  → Twilio SMS to John with event details
```

### Email Templates Location

- `src/emails/InternalNotification.tsx` — plain text + structured data table
- `src/emails/ClientAutoReply.tsx` — branded HTML (Hanken Grotesk, red header, dark footer)
- `src/emails/RackReportDelivery.tsx` — PDF download link email

---

## 10. Booking Integration (Cal.com)

### Setup

- Platform: Cal.com Cloud (or self-hosted)
- Event type: "Free Site Assessment — Redline Installers"
- Duration: 60 minutes
- Location: Phone call (default) or On-site (client chooses)
- Cal.com embed type: inline embed (not popup) in QuoteWizard Step 5

### Cal.com Embed in QuoteWizard (Step 5)

```tsx
// Conditional Cal.com inline embed when user checks "Schedule site visit"
{wantsBooking && (
  <div class="mt-6">
    <iframe
      src="https://cal.com/redlineinstallers/site-assessment?embed=true"
      width="100%"
      height="600"
      frameBorder="0"
    />
  </div>
)}
```

> Do not invent Cal.com API endpoints. Verify embed URL format against Cal.com docs before implementing.  
> Mark any Cal.com webhook payload fields as VERIFY_CALCOM_WEBHOOK until confirmed.

### Webhook Handler

```typescript
// src/pages/api/cal-webhook.ts
// Cal.com sends booking.created, booking.rescheduled, booking.cancelled
// Save to D1 bookings table
// Send SMS to John via Twilio
// Send confirmation email via Resend
```

---

## 11. SMS Notifications (Twilio)

### Purpose

Notify John Korabik immediately for hot leads and new bookings.

### Triggers

| Event | Action |
|---|---|
| Hot lead submitted | SMS immediately |
| Site visit booked via Cal.com | SMS + email |
| Warm lead submitted | Email only (no SMS) |
| Cold lead submitted | Email, batched daily |

### SMS Message Templates

```
HOT LEAD — Redline:
{name} @ {company}
Service: {service}
Size: {sqFt} sq ft
Budget: {budget}
Timeline: {timeline}
Phone: {phone}

Booking visit booked by: {name} ({email})
Date: {startTime}
Location: {projectCity}, {projectState}
```

### Twilio Pattern

```typescript
// src/lib/twilio.ts
export async function sendSmsToJohn(message: string): Promise<void> {
  const accountSid = import.meta.env.TWILIO_ACCOUNT_SID;
  const authToken = import.meta.env.TWILIO_AUTH_TOKEN;
  const from = import.meta.env.TWILIO_FROM_NUMBER;
  const to = import.meta.env.JOHN_PHONE;

  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from, Body: message }).toString(),
  });
}
```

---

## 12. Analytics (GA4 + Search Console)

### GA4 Setup

1. Create GA4 property at analytics.google.com
2. Get Measurement ID (`G-XXXXXXXXXX`)
3. Add gtag.js to BaseLayout in `<head>`:

```html
<!-- src/layouts/BaseLayout.astro — in <head> -->
<script async src={`https://www.googletagmanager.com/gtag/js?id=${import.meta.env.PUBLIC_GA4_ID}`}></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Conversion Events

| Event | Trigger |
|---|---|
| `quote_started` | User opens /quote/ |
| `quote_step_completed` | Each wizard step completion |
| `quote_submitted` | Successful API POST /api/quote |
| `site_visit_booked` | Cal.com booking completed |
| `rack_inspection_started` | User uploads photos |
| `rack_inspection_completed` | Analysis results returned |
| `phone_click` | Any `tel:` link click |
| `email_click` | Any `mailto:` link click |

### thank-you.astro GA4 Conversion

```html
<!-- src/pages/thank-you.astro — fires on page load -->
<script>
  gtag('event', 'quote_submitted', {
    event_category: 'lead',
    event_label: 'quote_form',
    value: 1
  });
</script>
```

### Search Console Setup

1. Add property at search.google.com/search-console
2. Verify via DNS TXT record (Cloudflare DNS panel)
3. Submit sitemap: `https://redlineinstallers.com/sitemap-index.xml`
4. Monitor: Core Web Vitals, Coverage, Rich Results (FAQPage, LocalBusiness)

### tsconfig.json

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@lib/*": ["src/lib/*"],
      "@schemas/*": ["src/schemas/*"],
      "@islands/*": ["src/islands/*"]
    }
  }
}
```

---

## 13. Phased Roadmap

### Phase 1 — Core Site (Est. 5–7 days)

**Goal:** Full indexable site live. All pages built. Replaces empty homepage scaffold.

| Task | File(s) | Priority |
|---|---|---|
| Build homepage (`index.astro`) | `src/pages/index.astro` | Critical |
| Service page template | `src/pages/services/[slug].astro` | Critical |
| Remaining 6 service MDX files | `src/content/services/*.mdx` | Critical |
| Industry page template | `src/pages/industries/[slug].astro` | Critical |
| 6 industry MDX files | `src/content/industries/*.mdx` | Critical |
| Services hub | `src/pages/services/index.astro` | High |
| Industries hub | `src/pages/industries/index.astro` | High |
| About page | `src/pages/about.astro` | High |
| Service Area page | `src/pages/service-area.astro` | High |
| Contact page + ContactForm island | `src/pages/contact.astro`, `src/components/ContactForm.tsx` | High |
| Privacy + Terms | `src/pages/privacy.astro`, `src/pages/terms.astro` | Medium |
| Breadcrumbs component | `src/components/Breadcrumbs.astro` | Medium |
| FAQAccordion component | `src/components/FAQAccordion.astro` | Medium |
| `tsconfig.json` | root | High |
| `public/robots.txt` | root | High |
| `public/og-default.jpg` | root | High |
| `public/favicon.svg` | root | High |
| Extend industries schema | `src/content/config.ts` | High |

**Deliverable:** Full site navigable at Cloudflare Pages preview URL. All 20+ pages indexed. Schema validated via Google Rich Results Test.

---

### Phase 2 — Quote Engine (Est. 6–8 days)

**Goal:** Working lead generation wizard. Quote submissions saved to D1. Emails sent via Resend.

| Task | File(s) | Priority |
|---|---|---|
| Install `@astrojs/cloudflare` + change to hybrid output | `astro.config.mjs` | Critical |
| `wrangler.toml` setup | root | Critical |
| D1 database creation + schema | `src/db/schema.sql` | Critical |
| Zod quote schema | `src/schemas/quote.ts` | Critical |
| Pricing engine | `src/lib/pricing-engine.ts` | Critical |
| `pricing-rules.json` (with John's data) | `src/data/pricing-rules.json` | Critical |
| Lead scorer | `src/lib/lead-scorer.ts` | Critical |
| Turnstile verify lib | `src/lib/turnstile.ts` | Critical |
| QuoteWizard Preact island (5 steps) | `src/islands/QuoteWizard.tsx` | Critical |
| Quote store (nanostores) | `src/stores/quoteStore.ts` | Critical |
| Quote page | `src/pages/quote.astro` | Critical |
| Quote API endpoint | `src/pages/api/quote.ts` | Critical |
| Resend email lib | `src/lib/resend.ts` | Critical |
| Internal notification email template | `src/emails/InternalNotification.tsx` | High |
| Client auto-reply email template | `src/emails/ClientAutoReply.tsx` | High |
| Thank You page | `src/pages/thank-you.astro` | High |
| GA4 conversion events | `src/layouts/BaseLayout.astro` + islands | High |

**Deliverable:** End-to-end quote flow tested. John receives email on submission. Client receives auto-reply. Lead saved to D1.

---

### Phase 3 — AI Rack Inspection (Est. 5–7 days)

**Goal:** Working rack inspection tool live at `/tools/rack-inspection/`.

| Task | File(s) | Priority |
|---|---|---|
| Install `@anthropic-ai/sdk` | `package.json` | Critical |
| Rack analysis Zod schema | `src/schemas/rack-analysis.ts` | Critical |
| System prompt file | `src/prompts/rack-inspector-system.txt` | Critical |
| RackInspector Preact island | `src/islands/RackInspector.tsx` | Critical |
| Rack analysis API endpoint | `src/pages/api/rack-analysis.ts` | Critical |
| Rack inspection page | `src/pages/tools/rack-inspection/index.astro` | Critical |
| R2 upload handling | `src/lib/r2-upload.ts` | Critical |
| PDF generation Worker | Cloudflare Worker (separate) | High |
| Rack report email template | `src/emails/RackReportDelivery.tsx` | High |
| D1 `rack_analyses` table logging | migration SQL | Critical |
| Rate limiting via KV | `src/lib/rate-limiter.ts` | High |

**Deliverable:** Tool live and tested with 20+ real rack photos. Disclaimer accepted. Analyses logged. PDF report generated and emailed.

---

### Phase 4 — Booking + SMS (Est. 2–3 days)

**Goal:** Cal.com inline booking in QuoteWizard. John gets SMS for hot leads.

| Task | File(s) | Priority |
|---|---|---|
| Cal.com account + event type setup | Cal.com dashboard | Critical |
| Cal.com embed in QuoteWizard Step 5 | `src/islands/QuoteWizard.tsx` | Critical |
| Cal.com webhook handler | `src/pages/api/cal-webhook.ts` | High |
| Twilio SMS lib | `src/lib/twilio.ts` | High |
| SMS trigger in quote API | `src/pages/api/quote.ts` | High |
| D1 `bookings` table | migration SQL | Medium |

**Deliverable:** Booking flow works end-to-end. John receives SMS for hot leads. Booking saved to D1.

---

### Phase 5 — QA & Launch (Est. 3 days)

| Task | Notes |
|---|---|
| Lighthouse audit (all pages) | Target: 95+ Performance, SEO, Accessibility, Best Practices |
| Google Rich Results Test | FAQPage, LocalBusiness, Service schemas |
| Cross-browser test | Chrome, Safari, Firefox, Edge |
| Cross-device test | iPhone 14, Android (360px), tablet (768px), desktop |
| Form end-to-end test | Quote submit → D1 insert → email sent → thank-you redirect |
| Rack inspection end-to-end | Upload → analysis → PDF → email |
| Search Console submit | sitemap-index.xml |
| GA4 conversion verification | Tag Assistant, Realtime view |
| 301 redirects (if applicable) | From old Weebly URLs |
| robots.txt verification | `User-agent: * / Allow: /` + Sitemap declaration |
| Custom domain live | `redlineinstallers.com` → Cloudflare Pages |
| HTTPS force / HSTS | Cloudflare SSL settings |
| Security headers | Cloudflare Transform Rules |

**Deliverable:** Site live at `redlineinstallers.com`. All flows working in production.

---

### Phase 6 — Post-Launch SEO (Ongoing, first 90 days)

| Task | Owner | Timeline |
|---|---|---|
| Google Business Profile claim/create | John + dev | Week 1 |
| Bing Places for Business | John + dev | Week 1 |
| Submit sitemap to Search Console | Dev | Day 1 |
| Submit sitemap to Bing Webmaster | Dev | Week 1 |
| Citation building: ThomasNet, MHEDA, BBB, Material Handling Network | Dev/Client | Weeks 2–4 |
| Request Google reviews from existing clients | John | Weeks 1–4 |
| Monthly SEO report: positions, traffic, conversions | Dev | Monthly |
| Blog/case studies section (Phase 7, optional) | TBD | Month 2–3 |

---

## 14. Environment Variables Checklist

### Required — Core

| Variable | Used In | Where to Get |
|---|---|---|
| `PUBLIC_GA4_ID` | `BaseLayout.astro` | Google Analytics 4 dashboard |
| `CLOUDFLARE_TURNSTILE_SECRET` | `src/lib/turnstile.ts` | Cloudflare Turnstile dashboard |
| `PUBLIC_TURNSTILE_SITE_KEY` | Preact islands (client-side) | Cloudflare Turnstile dashboard |

### Required — Email

| Variable | Used In | Where to Get |
|---|---|---|
| `RESEND_API_KEY` | `src/lib/resend.ts` | resend.com dashboard |

### Required — Database

| Variable | Used In | Where to Get |
|---|---|---|
| `DB` (D1 binding) | API endpoints via `locals.runtime.env.DB` | `wrangler.toml` binding |
| `UPLOADS` (R2 binding) | Rack analysis upload handler | `wrangler.toml` binding |
| `CACHE` (KV binding) | Rate limiter | `wrangler.toml` binding |

### Required — AI Rack Inspection

| Variable | Used In | Where to Get |
|---|---|---|
| `ANTHROPIC_API_KEY` | `src/pages/api/rack-analysis.ts` | console.anthropic.com |

### Required — SMS

| Variable | Used In | Where to Get |
|---|---|---|
| `TWILIO_ACCOUNT_SID` | `src/lib/twilio.ts` | twilio.com console |
| `TWILIO_AUTH_TOKEN` | `src/lib/twilio.ts` | twilio.com console |
| `TWILIO_FROM_NUMBER` | `src/lib/twilio.ts` | Twilio phone number |
| `JOHN_PHONE` | `src/lib/twilio.ts` | Provided by John |

### Optional — Booking

| Variable | Used In | Where to Get |
|---|---|---|
| `CAL_API_KEY` | Cal.com webhook verification | cal.com settings |

### Cloudflare Pages Configuration

All secrets set in: Cloudflare Pages dashboard > Settings > Environment Variables.  
Set in both **Production** and **Preview** environments.  
`PUBLIC_*` variables are safe to expose to the browser. All others are server-only.

---

## 15. Launch Checklist

### Pre-Launch Technical

- [ ] `tsconfig.json` created with `"extends": "astro/tsconfigs/strict"`
- [ ] `npm run build` completes without TypeScript errors
- [ ] `npm run build` completes without Astro errors
- [ ] All 20+ pages render without console errors
- [ ] `public/robots.txt` present and correct
- [ ] `public/og-default.jpg` present (1200x630)
- [ ] `public/favicon.svg` present
- [ ] Sitemap generated at `/sitemap-index.xml`
- [ ] All internal links resolve (no 404s)
- [ ] All images use `<Image />` from `astro:assets` with descriptive `alt`
- [ ] One H1 per page, contains primary keyword
- [ ] No Bolingbrook in any page, schema, or metadata

### SEO

- [ ] Google Rich Results Test passes for FAQPage (service pages)
- [ ] Google Rich Results Test passes for LocalBusiness (homepage, contact)
- [ ] Lighthouse SEO score >= 95 on homepage
- [ ] Lighthouse SEO score >= 95 on at least 3 service pages
- [ ] `canonical` URL correct on every page
- [ ] `og:image` resolves to valid 1200x630 image on every page
- [ ] `metaDescription` 140–155 chars on every page

### Forms & Lead Gen

- [ ] Quote form submits successfully in production
- [ ] Turnstile widget renders and verifies server-side
- [ ] D1 lead record created on quote submission
- [ ] Internal notification email received by jk@redlineinstallers.com
- [ ] Client auto-reply email received by test address
- [ ] Thank-you page loads after successful submission
- [ ] GA4 `quote_submitted` event fires on thank-you page (verified in Realtime)
- [ ] Hot lead triggers SMS to John's phone

### AI Rack Inspection

- [ ] Disclaimer checkbox required before upload enabled
- [ ] Upload accepts JPEG/PNG/WebP, rejects other types
- [ ] Upload rejects files > 20MB
- [ ] Analysis runs without error for 3–6 test images
- [ ] Results page displays severity correctly (critical/moderate/cosmetic)
- [ ] PDF download requires lead capture form
- [ ] Each analysis saved to D1 `rack_analyses` table with image hashes
- [ ] Rate limiting: 6th request in 1 hour blocked

### Infrastructure

- [ ] Custom domain `redlineinstallers.com` connected to Cloudflare Pages
- [ ] HTTPS enforced (Cloudflare SSL/TLS: Full Strict)
- [ ] `www` redirects to apex (or vice versa — pick one)
- [ ] All environment variables set in Cloudflare Pages Production environment
- [ ] D1 database `redline-leads` created and schema migrated
- [ ] R2 bucket created with CORS policy allowing `redlineinstallers.com`
- [ ] KV namespace created and bound
- [ ] Resend domain `redlineinstallers.com` verified (DNS TXT + MX records)
- [ ] Twilio phone number active and SMS sending verified

### Analytics

- [ ] GA4 property connected and receiving hits
- [ ] Google Search Console property verified
- [ ] Sitemap submitted to Search Console
- [ ] Sitemap submitted to Bing Webmaster Tools
- [ ] Phone click events tracked in GA4

### Business

- [ ] Contact info correct on all pages: 630-363-7251, jk@redlineinstallers.com
- [ ] Address correct on all pages: 980 N Michigan Ave Ste 1090 PMB 357073, Chicago, IL 60611-4521
- [ ] No Bolingbrook address anywhere (search codebase: `grep -r "Bolingbrook" src/`)
- [ ] Pricing rules JSON populated with John's actual pricing data
- [ ] John's phone number verified in `JOHN_PHONE` env var
- [ ] Cal.com event type created and calendar connected
- [ ] Test booking created end-to-end (select time → confirmation → D1 entry → SMS)

### Post-Launch (Day 1)

- [ ] Google Business Profile created as Service Area Business (not physical location — PMB address)
- [ ] GBP categories: "Warehouse Equipment Supplier", "Equipment Installer"
- [ ] GBP services listed (all 7)
- [ ] Monitor Cloudflare Pages build logs for errors
- [ ] Monitor D1 for incoming leads
- [ ] Verify GA4 Realtime shows page views

---

## Notes & Constraints

**Pricing data dependency:** The Quote Engine pricing ranges are non-functional placeholders until John provides actual project pricing data. Schedule a 2-hour session before Phase 2 completes.

**output: 'hybrid' requirement:** The `/api/*` endpoints require Astro hybrid or server output mode and the `@astrojs/cloudflare` adapter. This is a breaking change from the current `output: 'static'` config. All static pages continue to work in hybrid mode — they are pre-rendered by default. Only API route files need `export const prerender = false`.

**R2 CORS:** Cloudflare R2 requires explicit CORS configuration to allow uploads from the browser origin. Set allowed origins to `https://redlineinstallers.com` in R2 bucket settings.

**Cal.com embed:** The Cal.com inline iframe embed URL format must be verified against current Cal.com documentation before implementation. Do not use a guessed URL format.

**Rack inspection liability:** Before launching the AI Rack Inspection tool, John should confirm the disclaimer language with his insurance broker. The tool must never claim to replace a certified professional inspection.

**No Bolingbrook:** The address 980 N Michigan Ave Ste 1090 PMB 357073, Chicago, IL 60611-4521 is the only address used anywhere in the codebase, schemas, emails, or metadata. The previous Bolingbrook address must be searched and removed from any existing content.
