# Redline Installers — Automations Architecture v2

**Status:** Implementation blueprint  
**Replaces:** redline-installers-automations.md  
**Date:** 2026-05-16

---

## 0. Architecture Overview

Three original options merged into one unified system. Single Cloudflare Worker, single D1 database, single notification pipeline. No duplicated logic.

```
                         ┌─────────────────────────────┐
                         │     Cloudflare Pages          │
                         │   (Astro 6 static build)      │
                         │                               │
                         │  /quote        Preact island  │
                         │  /tools/rack-inspection       │
                         │  /portal       Preact island  │
                         └────────────┬────────────────┘
                                      │ fetch POST
                         ┌────────────▼────────────────┐
                         │     Cloudflare Worker         │
                         │   redline-api.workers.dev     │
                         │                               │
                         │  POST /api/quote              │
                         │  POST /api/rack-inspection    │
                         │  POST /api/chat               │
                         │  POST /api/booking-webhook    │
                         │  POST /api/review             │
                         │  GET  /api/portal/:token      │
                         └──┬────┬────┬────┬────────────┘
                            │    │    │    │
               ┌────────────┘    │    │    └──────────────┐
               ▼                 ▼    ▼                   ▼
          Cloudflare D1     Cloudflare R2   Anthropic    Resend
          (SQLite)          (object store)  Claude API   (email)
               │                                          │
          Cloudflare KV                              Twilio SMS
          (sessions/rate)                         Cal.com API
```

---

## 1. D1 Database Schema

```sql
-- ─── LEADS ────────────────────────────────────────────────────────────────
CREATE TABLE leads (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),

  -- contact
  name          TEXT NOT NULL,
  company       TEXT,
  email         TEXT NOT NULL,
  phone         TEXT,
  role          TEXT,

  -- project
  service       TEXT NOT NULL,          -- enum: pallet-rack-installation | warehouse-relocation | rack-repair-modifications | mezzanine-installation | conveyor-systems | tear-down-reinstallation | material-handling-systems
  sq_ft         INTEGER,
  pallet_positions INTEGER,
  num_aisles    INTEGER,
  multi_level   INTEGER DEFAULT 0,      -- boolean
  project_address TEXT,
  state         TEXT,
  timeline      TEXT,                   -- asap | 2-6-weeks | 1-3-months | 3-months-plus
  active_warehouse INTEGER DEFAULT 0,
  rack_supplier TEXT,
  budget_range  TEXT,                   -- <10k | 10-50k | 50-150k | 150k-plus | open

  -- scoring
  score         TEXT NOT NULL DEFAULT 'cold', -- hot | warm | cold
  score_points  INTEGER NOT NULL DEFAULT 0,

  -- tracking
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  utm_term      TEXT,
  source        TEXT,                   -- quote-wizard | rack-inspection | chat | contact-form

  -- lifecycle
  status        TEXT NOT NULL DEFAULT 'new', -- new | contacted | site-visit-scheduled | quoted | won | lost
  project_id    TEXT REFERENCES projects(id),
  notes         TEXT,

  -- files (R2 keys, JSON array)
  attachments   TEXT DEFAULT '[]'
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_score ON leads(score);
CREATE INDEX idx_leads_created ON leads(created_at);
CREATE INDEX idx_leads_email ON leads(email);

-- ─── RACK ANALYSES ────────────────────────────────────────────────────────
CREATE TABLE rack_analyses (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),

  -- requester (optional — filled at PDF download step)
  lead_id       TEXT REFERENCES leads(id),
  requester_email TEXT,
  requester_name  TEXT,

  -- input context
  beam_load_lbs INTEGER,
  damage_occurred TEXT,
  rack_currently_loaded INTEGER DEFAULT 0,

  -- images (R2 keys + sha256 hash for liability)
  images        TEXT NOT NULL DEFAULT '[]', -- JSON: [{r2_key, sha256, size_bytes}]

  -- AI output (raw JSON from Claude)
  analysis_raw  TEXT NOT NULL,             -- full JSON response
  severity_overall TEXT NOT NULL,          -- critical | moderate | cosmetic | unclear
  critical_count  INTEGER DEFAULT 0,
  moderate_count  INTEGER DEFAULT 0,
  cosmetic_count  INTEGER DEFAULT 0,

  -- PDF
  pdf_r2_key    TEXT,
  pdf_downloaded INTEGER DEFAULT 0,

  -- model metadata (for audit)
  model_id      TEXT NOT NULL,             -- e.g. claude-sonnet-4-6
  prompt_version TEXT NOT NULL,

  -- rate limiting
  ip_hash       TEXT NOT NULL
);

CREATE INDEX idx_analyses_lead ON rack_analyses(lead_id);
CREATE INDEX idx_analyses_severity ON rack_analyses(severity_overall);
CREATE INDEX idx_analyses_created ON rack_analyses(created_at);

-- ─── BOOKINGS ─────────────────────────────────────────────────────────────
CREATE TABLE bookings (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),

  -- Cal.com event data (VERIFY_CALCOM_WEBHOOK for exact field names)
  calcom_booking_id TEXT UNIQUE,
  calcom_event_type TEXT,
  calcom_uid    TEXT,

  -- attendee
  lead_id       TEXT REFERENCES leads(id),
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  attendee_phone TEXT,

  -- event
  start_time    TEXT NOT NULL,
  end_time      TEXT NOT NULL,
  timezone      TEXT,
  location      TEXT,                   -- address or video link
  meeting_type  TEXT,                   -- site-visit | virtual | phone

  -- status
  status        TEXT NOT NULL DEFAULT 'confirmed', -- confirmed | cancelled | rescheduled | completed
  cancelled_at  TEXT,
  reschedule_reason TEXT,
  notes         TEXT
);

CREATE INDEX idx_bookings_lead ON bookings(lead_id);
CREATE INDEX idx_bookings_start ON bookings(start_time);
CREATE INDEX idx_bookings_status ON bookings(status);

-- ─── PROJECTS ─────────────────────────────────────────────────────────────
CREATE TABLE projects (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),

  lead_id       TEXT NOT NULL REFERENCES leads(id),
  name          TEXT NOT NULL,
  client_company TEXT,

  -- timeline
  start_date    TEXT,
  estimated_end TEXT,
  actual_end    TEXT,

  -- financials
  contract_value INTEGER,               -- cents
  invoice_status TEXT DEFAULT 'pending', -- pending | invoiced | paid

  -- status
  status        TEXT NOT NULL DEFAULT 'active', -- active | on-hold | completed | cancelled

  -- portal access
  portal_token  TEXT UNIQUE DEFAULT (lower(hex(randomblob(32)))),
  portal_token_expires TEXT,

  -- milestones (JSON array of {label, date, completed})
  milestones    TEXT DEFAULT '[]',

  -- photos uploaded by crew (R2 keys JSON array)
  site_photos   TEXT DEFAULT '[]',

  -- documents (R2 keys JSON array: {label, r2_key, uploaded_at})
  documents     TEXT DEFAULT '[]',

  notes         TEXT
);

CREATE INDEX idx_projects_lead ON projects(lead_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_portal_token ON projects(portal_token);

-- ─── REVIEWS ──────────────────────────────────────────────────────────────
CREATE TABLE reviews (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),

  project_id    TEXT NOT NULL REFERENCES projects(id),
  lead_id       TEXT REFERENCES leads(id),

  -- survey response
  survey_sent_at TEXT,
  survey_responded_at TEXT,
  satisfaction_score INTEGER,           -- 1-10
  feedback_text TEXT,
  would_recommend INTEGER,             -- boolean

  -- Google review request
  review_sms_sent_at TEXT,
  review_link_clicked INTEGER DEFAULT 0,
  google_review_confirmed INTEGER DEFAULT 0,  -- manually marked

  -- request flow
  request_attempts INTEGER DEFAULT 0,
  last_attempt_at TEXT,
  opted_out       INTEGER DEFAULT 0
);

CREATE INDEX idx_reviews_project ON reviews(project_id);
CREATE INDEX idx_reviews_score ON reviews(satisfaction_score);

-- ─── CHAT SESSIONS ────────────────────────────────────────────────────────
CREATE TABLE chat_sessions (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),

  channel       TEXT NOT NULL,          -- web | sms | whatsapp
  phone_number  TEXT,
  session_token TEXT UNIQUE,

  -- extracted lead data (populated as conversation progresses)
  lead_id       TEXT REFERENCES leads(id),
  extracted_service TEXT,
  extracted_sq_ft INTEGER,
  extracted_location TEXT,
  extracted_timeline TEXT,
  extracted_budget TEXT,

  -- messages (JSON array of {role, content, ts})
  messages      TEXT NOT NULL DEFAULT '[]',

  -- escalation
  escalated_to_john INTEGER DEFAULT 0,
  escalation_reason TEXT,

  status        TEXT NOT NULL DEFAULT 'active' -- active | converted | abandoned | escalated
);

CREATE INDEX idx_chat_phone ON chat_sessions(phone_number);
CREATE INDEX idx_chat_status ON chat_sessions(status);
CREATE INDEX idx_chat_lead ON chat_sessions(lead_id);
```

---

## 2. Cloudflare Worker Routing

Single Worker entry point. File: `workers/redline-api/src/index.ts`.

```typescript
// workers/redline-api/src/index.ts

import { handleQuote }          from './routes/quote';
import { handleRackInspection } from './routes/rack-inspection';
import { handleChat }           from './routes/chat';
import { handleBookingWebhook } from './routes/booking-webhook';
import { handleReview }         from './routes/review';
import { handlePortal }         from './routes/portal';
import { verifyTurnstile }      from './lib/turnstile';
import { cors, rateLimit }      from './lib/middleware';

export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  KV: KVNamespace;
  RESEND_API_KEY: string;
  CLOUDFLARE_TURNSTILE_SECRET: string;
  ANTHROPIC_API_KEY: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_FROM_NUMBER: string;
  JOHN_PHONE: string;
  CAL_API_KEY: string;
  CAL_WEBHOOK_SECRET: string;
  GOOGLE_REVIEW_URL: string;
}

const ROUTES: Record<string, (req: Request, env: Env, ctx: ExecutionContext) => Promise<Response>> = {
  'POST /api/quote':              handleQuote,
  'POST /api/rack-inspection':    handleRackInspection,
  'POST /api/chat':               handleChat,
  'POST /api/booking-webhook':    handleBookingWebhook,
  'POST /api/review':             handleReview,
  'GET /api/portal':              handlePortal,
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const key = `${request.method} ${url.pathname}`;

    // CORS preflight
    if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }));

    const handler = ROUTES[key] ?? (() => new Response('Not Found', { status: 404 }));

    // Rate limiting on all POST routes
    if (request.method === 'POST') {
      const limited = await rateLimit(request, env.KV);
      if (limited) return cors(new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 }));
    }

    try {
      const response = await handler(request, env, ctx);
      return cors(response);
    } catch (err) {
      console.error(err);
      return cors(new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 }));
    }
  },
};
```

### Route handler signatures

```typescript
// POST /api/quote
// Body: QuoteFormPayload (Zod validated)
// 1. Verify Turnstile
// 2. Score lead
// 3. Insert leads row
// 4. Upload attachments to R2 (if any)
// 5. Send notifications per matrix
// 6. Return { success, estimatedRange, estimatedTimeline, leadId }

// POST /api/rack-inspection
// Body: multipart/form-data (images + context fields)
// 1. Verify Turnstile
// 2. Rate limit per IP (5/hour max, KV counter)
// 3. Upload images to R2, compute sha256
// 4. Call Claude vision API with system prompt v2
// 5. Parse + validate JSON response with Zod
// 6. Insert rack_analyses row
// 7. Generate PDF → R2
// 8. If severity = critical: insert lead + send SMS to John immediately
// 9. Return { success, analysisId, severity, photoResults }

// POST /api/chat
// Body: { message, sessionToken, channel }
// 1. Load or create chat_sessions row
// 2. Load message history from D1
// 3. Build context-injected prompt
// 4. Call Claude with concierge system prompt
// 5. Extract structured data from response (service, location, etc.)
// 6. If escalation trigger: SMS John
// 7. If booking requested: return Cal.com booking link
// 8. Save updated session
// 9. Return { reply, sessionToken, suggestedActions }

// POST /api/booking-webhook
// Body: Cal.com webhook payload (VERIFY_CALCOM_WEBHOOK)
// 1. Verify webhook signature with CAL_WEBHOOK_SECRET
// 2. Insert or update bookings row
// 3. Link to lead via email match
// 4. Update lead status → site-visit-scheduled
// 5. Send notifications per matrix
// 6. Return 200 OK

// POST /api/review
// Body: { projectId, surveyScore, feedback, wouldRecommend }
// 1. Validate project portal token from header
// 2. Update reviews row with survey data
// 3. If score >= 8: send Google review SMS
// 4. Log review_sms_sent_at
// 5. Return { success }

// GET /api/portal
// Query: ?token=<portal_token>
// 1. Look up projects by portal_token
// 2. Verify token not expired
// 3. Return project data (milestones, photos signed URLs, documents)
```

### wrangler.toml

```toml
name = "redline-api"
main = "src/index.ts"
compatibility_date = "2025-01-01"

[[d1_databases]]
binding = "DB"
database_name = "redline-prod"
database_id = "PROCESS.ENV.D1_DATABASE_ID"

[[r2_buckets]]
binding = "R2"
bucket_name = "PROCESS.ENV.R2_BUCKET_NAME"

[[kv_namespaces]]
binding = "KV"
id = "PROCESS.ENV.KV_NAMESPACE_ID"

[vars]
# All secrets set via: wrangler secret put VAR_NAME

[[routes]]
pattern = "redlineinstallers.com/api/*"
zone_name = "redlineinstallers.com"
```

---

## 3. Lead Scoring Function

```typescript
// workers/redline-api/src/lib/scoring.ts

interface ScoreInput {
  budget_range: string;
  timeline: string;
  sq_ft: number;
  service: string;
  has_attachments: boolean;
  rack_inspection_source: boolean;
}

interface ScoreResult {
  score: 'hot' | 'warm' | 'cold';
  points: number;
  reasons: string[];
}

const BUDGET_POINTS: Record<string, number> = {
  '150k-plus':   50,
  '50-150k':     35,
  '10-50k':      20,
  '<10k':         5,
  'open':        25,
};

const TIMELINE_POINTS: Record<string, number> = {
  'asap':          30,
  '2-6-weeks':     20,
  '1-3-months':    10,
  '3-months-plus':  5,
};

const SERVICE_POINTS: Record<string, number> = {
  'mezzanine-installation':     15,
  'conveyor-systems':           15,
  'material-handling-systems':  15,
  'pallet-rack-installation':   10,
  'warehouse-relocation':       10,
  'rack-repair-modifications':   8,
  'tear-down-reinstallation':    8,
};

export function scoreLead(input: ScoreInput): ScoreResult {
  const reasons: string[] = [];
  let points = 0;

  const budgetPts = BUDGET_POINTS[input.budget_range] ?? 0;
  points += budgetPts;
  if (budgetPts >= 35) reasons.push(`High budget tier: ${input.budget_range}`);

  const timelinePts = TIMELINE_POINTS[input.timeline] ?? 0;
  points += timelinePts;
  if (timelinePts >= 20) reasons.push(`Urgent timeline: ${input.timeline}`);

  if (input.sq_ft >= 50000)      { points += 20; reasons.push('Large facility 50K+ sqft'); }
  else if (input.sq_ft >= 20000) { points += 10; }
  else if (input.sq_ft >= 5000)  { points +=  5; }

  points += SERVICE_POINTS[input.service] ?? 0;

  if (input.has_attachments)        { points += 10; reasons.push('Provided drawings/photos'); }
  if (input.rack_inspection_source) { points += 15; reasons.push('Came via rack inspection tool'); }

  const score = points >= 60 ? 'hot' : points >= 30 ? 'warm' : 'cold';

  return { score, points, reasons };
}
```

---

## 4. Notification Matrix

| Event | John SMS | John Email | Client Email | Client SMS |
|---|---|---|---|---|
| Hot lead submitted | Yes — immediate | Yes | Auto-reply (HTML) | No |
| Warm lead submitted | No | Yes | Auto-reply (HTML) | No |
| Cold lead submitted | No | Batched daily 8am | Auto-reply (HTML) | No |
| Critical rack inspection | Yes — immediate | Yes | Report PDF link | No |
| Moderate rack inspection | No | Yes | Report PDF link | No |
| Site visit booked | Yes — immediate | Yes | Confirmation HTML | Yes (Cal.com) |
| Site visit cancelled | Yes | Yes | Cancellation note | Yes (Cal.com) |
| Project activated | No | Yes | Portal access link | No |
| Project milestone complete | No | No | Milestone update | No |
| Survey score >= 8 | No | No | Thank you | Yes — review link |
| Survey score < 8 | Yes — immediate | Yes | Thank you | No |

### SMS templates (Twilio)

```typescript
// workers/redline-api/src/lib/templates.ts

export const SMS = {
  hotLead: (lead: Lead) =>
    `REDLINE HOT LEAD\n${lead.name} @ ${lead.company ?? 'unknown'}\nService: ${lead.service}\nBudget: ${lead.budget_range}\nPhone: ${lead.phone ?? 'none'}\nScore: ${lead.score_points}pts\nReply or call now.`,

  criticalInspection: (analysis: RackAnalysis) =>
    `REDLINE CRITICAL RACK\n${analysis.critical_count} critical issue(s) detected.\nRequester: ${analysis.requester_email ?? 'anonymous'}\nReview: https://redlineinstallers.com/admin/analysis/${analysis.id}`,

  bookingConfirmed: (booking: Booking) =>
    `REDLINE SITE VISIT BOOKED\n${booking.attendee_name} @ ${booking.attendee_email}\n${booking.start_time}\nLocation: ${booking.location ?? 'TBD'}\nLead: https://redlineinstallers.com/admin/lead/${booking.lead_id}`,

  reviewRequest: (project: Project, googleUrl: string) =>
    `Hi ${project.client_company ?? 'there'} — thank you for working with Redline Installers. If you have 60 seconds, a Google review helps us a lot: ${googleUrl}`,

  lowSurveyAlert: (review: Review, project: Project) =>
    `REDLINE SURVEY ALERT\nProject: ${project.name}\nScore: ${review.satisfaction_score}/10\nFeedback: ${review.feedback_text?.slice(0, 120) ?? 'none'}\nFollow up immediately.`,
};
```

### Email subjects

```typescript
export const EMAIL_SUBJECTS = {
  hotLead:       (lead: Lead) => `HOT Lead: ${lead.company ?? lead.name} — ${lead.service}`,
  warmLead:      (lead: Lead) => `New Lead: ${lead.company ?? lead.name} — ${lead.service}`,
  coldDigest:    (count: number, date: string) => `Cold Leads Digest — ${count} new (${date})`,
  rackCritical:  (email: string) => `Critical Rack Report: ${email}`,
  rackModerate:  (email: string) => `Rack Inspection Report: ${email}`,
  bookingNew:    (booking: Booking) => `Site Visit Confirmed — ${booking.attendee_name} ${booking.start_time}`,
  bookingCancel: (booking: Booking) => `Site Visit Cancelled — ${booking.attendee_name}`,
  portalAccess:  (project: Project) => `Your Redline Project Portal — ${project.name}`,
};
```

---

## 5. Lead Lifecycle

```
[ENTRY POINTS]
    │
    ├─ /quote wizard submit
    ├─ /tools/rack-inspection (critical → auto-lead)
    ├─ /api/chat (concierge extracts + creates lead)
    └─ /contact form (basic lead, cold default)
    │
    ▼
[SCORED] hot | warm | cold
    │
    │ Notification matrix fires
    ▼
[CONTACTED] John reaches out or booking auto-scheduled
    │
    ▼
[SITE-VISIT-SCHEDULED] Cal.com booking confirmed
    │  booking-webhook → update lead.status
    ▼
[QUOTED] John sends formal proposal (manual step, flagged in admin)
    │
    ├─ [WON] → create projects row → portal_token issued → client email sent
    │               │
    │               ▼
    │         [PROJECT ACTIVE]
    │               │ Crew uploads photos via portal
    │               │ Milestones updated
    │               ▼
    │         [PROJECT COMPLETED] → trigger review workflow
    │               │
    │               ▼
    │         [SURVEY SENT] → client fills /portal/survey
    │               │
    │         score >= 8: SMS Google review link
    │         score < 8:  SMS alert to John
    │               │
    │               ▼
    │         [REVIEW REQUESTED] → track click → mark confirmed manually
    │
    └─ [LOST] → status = lost, note reason
```

---

## 6. Automation 4 — Google Review Pipeline

Post-project survey triggers Google review request via SMS. No third-party review tool needed.

### Flow

1. John marks project `completed` in admin panel (or status set via `/api/portal` PATCH).
2. Worker creates `reviews` row, sets `survey_sent_at`, emails client portal survey link.
3. Client submits survey at `/portal/survey?token=<portal_token>`.
4. Worker evaluates score:
   - >= 8: send review request SMS via Twilio (max 2 attempts, 7-day gap).
   - < 8: SMS John immediately with feedback excerpt.
5. Google review link: `PROCESS.ENV.GOOGLE_REVIEW_URL` (set to the Place review URL from Google Business Profile).
6. Worker logs `review_link_clicked` via redirect through `/api/review/click?id=<review_id>` before forwarding to Google.

### Survey page

Hosted at `/portal/survey` as an Astro page with Preact island. Requires `?token=` in URL. Submits to `POST /api/review`.

Fields: satisfaction 1-10, what went well (text), what to improve (text), would recommend (yes/no).

### Opt-out

SMS includes: "Reply STOP to opt out of messages from Redline Installers." Worker checks `opted_out` flag before sending second attempt.

---

## 7. Claude Agent System Prompts

### 7.A AI Concierge

```
SYSTEM PROMPT — Redline Installers Sales Concierge
Version: 1.0
Model: claude-sonnet-4-6

You are the sales assistant for Redline Installers LLC, a warehouse and 
material handling installation specialist based in Chicago, IL.

IDENTITY
- You represent John Korabik, founder with 34+ years of field experience.
- You are professional, direct, and concise. No filler phrases.
- You do not use emojis. You do not use bullet points for simple answers.
- You speak American B2B English. Short sentences. No hedging.

YOUR ROLE
- Pre-qualify inbound leads by capturing: service type, facility size (sq ft), 
  location, timeline, and rough budget range.
- Answer technical questions about pallet rack installation, warehouse 
  relocation, mezzanine installation, conveyor systems, rack repair.
- Book site visits by directing prospects to the Cal.com scheduling link.
- Never provide exact pricing — only directional ranges when asked.
- Never make promises John cannot keep.

SERVICES YOU REPRESENT
- Pallet rack installation (new)
- Warehouse relocation
- Rack repair and modifications
- Mezzanine installation
- Conveyor systems
- Tear down and reinstallation
- Material handling systems

DIRECTIONAL PRICING (do not quote exact numbers)
- Small rack install (< 500 positions, Chicagoland): $15K–$40K range
- Mid-size install (500–2,000 positions): $40K–$120K range
- Large project (2,000+ positions or complex): $120K–$500K+
- These are rough starting points. Actual quote requires site visit.
- Always add: "John can give you an accurate number after a site walk."

ESCALATION TRIGGERS — say "Let me get John on this directly" and flag for SMS:
- Client mentions injury, OSHA citation, or compliance deadline
- Budget stated over $150K
- Timeline under 2 weeks
- Client is a national retailer or distribution center chain
- Client expresses frustration or urgency more than once

BOOKING
- Site visit link: https://redlineinstallers.com/book
- Always offer to book after capturing location and timeline.
- "John typically does site visits within 3–5 business days."

WHAT YOU DO NOT DO
- Do not discuss competitors.
- Do not offer discounts.
- Do not speculate on structural engineering decisions.
- Do not answer questions outside warehouse material handling.
- Do not continue a conversation after 15 exchanges without capturing an email.

CONTEXT INJECTION
The following knowledge base sections will be prepended to each conversation:
{FAQ_CONTENT}
{PRICING_CONFIG_SUMMARY}
{CURRENT_LEAD_COUNT_FOR_RATE_LIMITING}
```

### 7.B AI Rack Inspector

```
SYSTEM PROMPT — Redline Rack Safety Analyzer
Version: 1.0
Model: claude-sonnet-4-6
Capability required: vision

You are a rack damage analysis assistant for Redline Installers LLC. 
You analyze photos of pallet racking for structural damage following 
ANSI MH16.1 (Rack Manufacturers Institute standard) and OSHA 29 CFR 
1910.176 guidelines.

ROLE CONSTRAINTS
- You are NOT a licensed structural engineer.
- Your output is a preliminary assessment only, not an engineering report.
- When in doubt, escalate severity. Conservative bias is required.
- Do not assess damage from descriptions alone — photos required.
- If image quality is insufficient, return severity "unclear".

ANALYSIS FRAMEWORK
For each photo, analyze:

1. DAMAGE TYPE
   - column: vertical upright member
   - beam: horizontal load-bearing member
   - brace: diagonal or horizontal cross member
   - footplate: base plate and anchor
   - anchor: floor anchor bolt
   - connection: beam-to-column connector/pin
   - none: no visible damage

2. SEVERITY — follow ANSI MH16.1 damage thresholds:
   - critical: dents > 1/8" depth on column, bend > 1" in beam over 48" span,
     missing or sheared anchor, connection failure, visible buckling. 
     Action: unload immediately.
   - moderate: minor dents < 1/8", paint damage with minor deformation,
     loose (not missing) connections, partial anchor pull.
     Action: reduce load, schedule repair within 30 days.
   - cosmetic: paint damage only, surface rust without structural loss,
     label damage.
     Action: monitor, repair at next scheduled maintenance.
   - unclear: image quality insufficient, obstruction, wrong angle.

3. STANDARD REFERENCES
   Reference the most specific applicable section of ANSI MH16.1 or 
   OSHA 29 CFR 1910.176(b) when identifying the damage type.

OUTPUT FORMAT
Return a JSON array with one object per photo. Do not return prose outside 
the JSON block.

[
  {
    "photo_index": 0,
    "damage_type": "column" | "beam" | "brace" | "footplate" | "anchor" | "connection" | "none",
    "damage_description": "Concise technical description of observed damage",
    "severity": "critical" | "moderate" | "cosmetic" | "unclear" | "none",
    "likely_cause": "Forklift impact" | "Overloading" | "Improper installation" | "Corrosion" | "Unknown" | "N/A",
    "ansi_reference": "ANSI MH16.1 §X.X or OSHA 29 CFR 1910.176(b)",
    "recommendation": "Specific action required",
    "load_status_advice": "unload_immediately" | "reduce_load" | "monitor" | "safe" | "unclear"
  }
]

DISCLAIMER
Always include this at the end of the API response metadata, never inside the JSON:
"This is a preliminary AI-assisted assessment for informational purposes only. 
It is not a substitute for inspection by a qualified rack engineer. 
Redline Installers LLC accepts no liability for decisions made based solely 
on this assessment. ANSI MH16.1 requires periodic inspection by a qualified person."
```

### 7.C Context Injection Strategy

The Concierge prompt receives injected context at request time. Context is assembled in the Worker before calling the API.

```typescript
// workers/redline-api/src/lib/context-builder.ts

interface ContextPayload {
  faqContent: string;          // loaded from KV key: 'context:faq'
  pricingConfig: string;       // loaded from KV key: 'context:pricing'
  sessionHistory: Message[];   // loaded from D1 chat_sessions.messages
}

// KV keys are pre-populated from JSON/Markdown files at deploy time.
// Update via: wrangler kv:key put --namespace-id=<id> context:faq "$(cat src/data/faq.md)"

async function buildConciergeMessages(
  env: Env,
  session: ChatSession,
  newUserMessage: string
): Promise<Message[]> {
  const [faq, pricing] = await Promise.all([
    env.KV.get('context:faq'),
    env.KV.get('context:pricing'),
  ]);

  const systemPrompt = CONCIERGE_SYSTEM_PROMPT
    .replace('{FAQ_CONTENT}', faq ?? '')
    .replace('{PRICING_CONFIG_SUMMARY}', pricing ?? '')
    .replace('{CURRENT_LEAD_COUNT_FOR_RATE_LIMITING}', ''); // unused placeholder

  const history: Message[] = JSON.parse(session.messages ?? '[]');

  // Trim history to last 20 exchanges to stay within context limits
  const trimmedHistory = history.slice(-40);

  return [
    { role: 'user', content: systemPrompt },  // injected as first user turn for caching
    ...trimmedHistory,
    { role: 'user', content: newUserMessage },
  ];
}
```

Context files live in `src/data/`:
- `src/data/faq.md` — technical FAQ (clearances, codes, lead times, coverage area)
- `src/data/pricing-config.json` — pricing ranges, zones, multipliers (John's input required)
- `src/data/services.json` — service descriptions, typical timelines

Files are pushed to KV at deploy time via a `package.json` script. The Rack Inspector does not use KV injection — its system prompt is static and versioned in code with `prompt_version` logged per analysis for audit.

---

## 8. Environment Variables Map

| Variable | Service | Set In Cloudflare | Used By |
|---|---|---|---|
| `RESEND_API_KEY` | Resend | Worker secrets | All notification sends |
| `CLOUDFLARE_TURNSTILE_SECRET` | Cloudflare Turnstile | Worker secrets | Quote, rack-inspection, chat routes |
| `ANTHROPIC_API_KEY` | Anthropic | Worker secrets | Rack inspection, chat routes |
| `R2_BUCKET_NAME` | Cloudflare R2 | wrangler.toml var | File uploads, PDF storage |
| `D1_DATABASE_ID` | Cloudflare D1 | wrangler.toml binding | All DB operations |
| `KV_NAMESPACE_ID` | Cloudflare KV | wrangler.toml binding | Sessions, rate limiting, context cache |
| `CAL_API_KEY` | Cal.com | Worker secrets | Booking link generation |
| `CAL_WEBHOOK_SECRET` | Cal.com | Worker secrets | Webhook signature verification |
| `TWILIO_ACCOUNT_SID` | Twilio | Worker secrets | SMS sends |
| `TWILIO_AUTH_TOKEN` | Twilio | Worker secrets | SMS sends |
| `TWILIO_FROM_NUMBER` | Twilio | Worker secrets | SMS sends |
| `JOHN_PHONE` | Internal | Worker secrets | SMS notification target |
| `GOOGLE_REVIEW_URL` | Google Business | Worker secrets | Review request SMS |
| `PORTAL_JWT_SECRET` | Internal | Worker secrets | Portal token signing (optional upgrade) |

All secrets set via: `wrangler secret put VARIABLE_NAME` (never in wrangler.toml).

---

## 9. Cost Breakdown

Pricing as of 2026-05. All free tiers verified against vendor documentation.

### Fixed monthly costs

| Service | Free Tier | Paid Entry |
|---|---|---|
| Cloudflare Workers | 100K req/day | $5/mo (10M req/mo) |
| Cloudflare D1 | 5M row reads/day, 100K writes | $0.001/100K over |
| Cloudflare R2 | 10 GB storage, 10M Class B ops | $0.015/GB over |
| Cloudflare KV | 100K reads/day, 1K writes | $0.50/M reads over |
| Cloudflare Pages | Unlimited static | Free |
| Cloudflare Turnstile | Unlimited | Free |
| Resend | 3,000 emails/mo | $20/mo (50K) |
| Cal.com Cloud | 1 user, limited | $15/mo (team) |
| Twilio SMS | Pay-as-you-go | $0.0079/SMS (US) |
| Anthropic API (Sonnet 4.6) | None | $3/MTok input, $15/MTok output |

### Volume scenarios

#### 10 leads/month (early stage)

| Item | Cost |
|---|---|
| Cloudflare (all) | $0 — free tier covers it |
| Resend (10 auto-replies + 10 admin emails) | $0 |
| Cal.com (if needed) | $0 self-hosted or $15/mo cloud |
| Twilio SMS (hot leads ~3 SMS, 3 booking SMS) | ~$0.50 |
| Anthropic (10 rack inspections × 6 imgs × ~1500 tokens) | ~$0.30 |
| Anthropic (50 chat turns × 2000 tokens avg) | ~$0.60 |
| **Total** | **~$1–17/mo** (depends on Cal.com choice) |

#### 50 leads/month (growing)

| Item | Cost |
|---|---|
| Cloudflare Workers | $0 (well within 100K/day) |
| Cloudflare D1/R2/KV | $0–2 |
| Resend (50 auto-replies + 50 admin + 10 digests) | $0 |
| Cal.com | $15/mo |
| Twilio SMS (~20 hot/booking SMS × 2 per event) | ~$3 |
| Anthropic rack (30 inspections × ~$0.10) | ~$3 |
| Anthropic chat (300 turns × ~$0.02) | ~$6 |
| PDF generation (Cloudflare Worker CPU) | $0 |
| **Total** | **~$27–35/mo** |

#### 200 leads/month (established)

| Item | Cost |
|---|---|
| Cloudflare Workers | $5/mo (exceeds free tier) |
| Cloudflare D1/R2/KV | ~$5 |
| Resend 200 auto-replies + internal (800 emails) | $0 (under 3K) |
| Cal.com | $15/mo |
| Twilio SMS (~80 hot/booking SMS) | ~$6 |
| Anthropic rack (100 inspections × ~$0.10) | ~$10 |
| Anthropic chat (2000 turns × ~$0.02) | ~$40 |
| Anthropic PDF generation | $0 (Worker-side) |
| Google Places API (autocomplete, 200 sessions) | ~$3 |
| **Total** | **~$84–90/mo** |

Note: at 200 leads/month, Resend 3K free limit becomes tight if John sends follow-up campaigns. Upgrade to $20/mo plan at that point.

---

## 10. Risk Matrix

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Rack inspector gives wrong severity → liability | Medium | Critical | Mandatory disclaimer + checkbox accept + every analysis logged with image hash + legal review before launch |
| Pricing data from John is incomplete or wrong | High | High | Do not launch quote engine without 2-hour session with John. Use very wide ranges until validated. |
| Cal.com webhook payload changes | Low | Medium | All webhook parsing behind VERIFY_CALCOM_WEBHOOK guard. Log raw payload to D1 before parsing. |
| Anthropic API downtime during rack inspection | Low | Medium | Return 503 with "try again in a few minutes" — do not silently fail |
| Twilio SMS rejected (carrier filtering) | Low | Low | Log delivery status. Fall back to email for same notification. |
| Chat bot hallucinates a price or commitment | Medium | High | Concierge prompt explicitly forbids exact pricing. Add assertion in output validator: if message contains a dollar amount, inject disclaimer. |
| R2 upload fails mid-quote submission | Low | Medium | Upload files first, then insert lead row. On upload failure, accept lead without files and flag in admin. |
| Portal token leaked → unauthorized project access | Low | Medium | Tokens are 32-byte random hex. Add expiry (90 days). Rotate on suspicious access. |
| Google review SMS marked as spam | Low | Low | Use Twilio 10DLC registered number. Keep message < 160 chars. Opt-out mechanism required by law. |
| D1 write limits hit during traffic spike | Very Low | Low | Cloudflare D1 limit is 100K writes/day on free. At 200 leads/month that's 6-7 writes/day. Not a concern until 10K+ leads/month. |

---

## 11. Implementation Order

Dependencies are marked. Do not start a phase until its dependencies are complete.

### Phase 0 — Infrastructure (Day 1–2)

No dependencies.

- [ ] Create D1 database: `wrangler d1 create redline-prod`
- [ ] Run schema migrations (all CREATE TABLE statements in section 1)
- [ ] Create R2 bucket: `wrangler r2 bucket create redline-storage`
- [ ] Create KV namespace: `wrangler kv:namespace create redline-cache`
- [ ] Create Cloudflare Worker project, connect to Pages custom domain
- [ ] Set all secrets via `wrangler secret put`
- [ ] Deploy empty Worker with health check route GET /api/health

### Phase 1 — Quote Engine (Day 3–10)

Depends on: Phase 0, John's pricing session (external dependency).

- [ ] Pricing session with John → populate `src/data/pricing-config.json`
- [ ] Build `scoreLead()` function with unit tests
- [ ] Build `POST /api/quote` route handler
- [ ] Build `POST /api/quote` Zod schema
- [ ] Turnstile verification middleware
- [ ] Resend templates (client auto-reply + John notification)
- [ ] Twilio SMS send for hot leads
- [ ] Preact quote wizard (5 steps, nanostores state)
- [ ] R2 file upload (drawings, photos)
- [ ] Cal.com embed on step 5 success screen
- [ ] Basic admin view at `/admin/leads` (Astro page, password protected via Cloudflare Access)

### Phase 2 — Rack Inspection Tool (Day 11–17)

Depends on: Phase 0, Phase 1 notification infrastructure, legal disclaimer review.

- [ ] Legal disclaimer text approved (internal, John reviews)
- [ ] Build `POST /api/rack-inspection` route handler
- [ ] Claude vision API integration with system prompt v2
- [ ] Zod output schema for analysis JSON
- [ ] R2 image storage + sha256 logging
- [ ] PDF generation (Worker-side with pdf-lib or server-rendered HTML → Cloudflare Browser Rendering)
- [ ] Rate limiting via KV (5/hour per IP)
- [ ] Preact uploader island (drag-drop, max 6 images, 20MB each)
- [ ] Result display page
- [ ] Lead capture gate before PDF download
- [ ] Auto-lead creation for critical severity cases

### Phase 3 — Booking Webhook + Project Portal (Day 18–26)

Depends on: Phase 1 (lead rows must exist), Cal.com account active.

- [ ] Cal.com webhook configured (VERIFY_CALCOM_WEBHOOK payload structure)
- [ ] `POST /api/booking-webhook` route handler
- [ ] Bookings table integration
- [ ] Lead status auto-update on booking
- [ ] John SMS notification on confirmed booking
- [ ] Projects table CRUD (admin only)
- [ ] Portal token generation on project creation
- [ ] `GET /api/portal` route
- [ ] Astro portal page `/portal` with Preact island
- [ ] R2 signed URL generation for project photos
- [ ] Photo upload flow for crew (simple form or portal page)

### Phase 4 — Chat Concierge (Day 27–35)

Depends on: Phase 0 (KV for sessions), Phase 1 (lead creation), Phase 3 (Cal.com booking).

- [ ] Push FAQ and pricing data to KV
- [ ] Build `POST /api/chat` route handler
- [ ] Context builder function
- [ ] Escalation trigger detection
- [ ] Chat session persistence in D1
- [ ] Preact chat widget island
- [ ] SMS inbound via Twilio webhook (POST /api/chat with channel=sms)
- [ ] Handoff to Cal.com booking link in response

### Phase 5 — Review Pipeline (Day 36–40)

Depends on: Phase 3 (projects table), Twilio active, Google Business Profile URL confirmed.

- [ ] Survey page `/portal/survey`
- [ ] `POST /api/review` route handler
- [ ] Score evaluation logic
- [ ] Google review SMS (score >= 8)
- [ ] Low score SMS alert to John
- [ ] Review click tracking redirect `/api/review/click`
- [ ] Opt-out handling

### Phase 6 — Admin Dashboard (Day 41–45)

Depends on: all phases, data in D1.

- [ ] Leads list + filter by score/status
- [ ] Lead detail view
- [ ] Rack analysis list + individual report view
- [ ] Project management (create, update status, add milestones)
- [ ] Review pipeline view
- [ ] Protected via Cloudflare Access (Zero Trust, Google SSO for John)

---

## 12. Files Created / Modified

```
workers/
  redline-api/
    src/
      index.ts                    Worker entry point + routing
      routes/
        quote.ts
        rack-inspection.ts
        chat.ts
        booking-webhook.ts
        review.ts
        portal.ts
      lib/
        scoring.ts
        templates.ts
        turnstile.ts
        middleware.ts
        context-builder.ts
        sms.ts
        email.ts
        r2.ts
      prompts/
        concierge.ts              Concierge system prompt (versioned)
        rack-inspector.ts         Rack inspector system prompt (versioned)
    wrangler.toml
    package.json

src/
  data/
    faq.md                        Source of truth for KV context:faq
    pricing-config.json           John's pricing matrix (required before Phase 1)
    services.json

  emails/
    QuoteAutoReply.tsx            React Email template
    HotLeadNotification.tsx
    BookingConfirmation.tsx
    PortalAccess.tsx
    SurveyRequest.tsx

  pages/
    quote.astro
    tools/
      rack-inspection.astro
    portal/
      index.astro
      survey.astro
    admin/
      index.astro
      leads/
        index.astro
        [id].astro

  components/
    islands/
      QuoteWizard.tsx             Preact
      RackUploader.tsx            Preact
      ChatWidget.tsx              Preact
      PortalView.tsx              Preact

migrations/
  0001_initial_schema.sql         All CREATE TABLE statements from section 1
```
