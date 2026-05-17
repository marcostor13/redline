import { useState } from 'preact/hooks';

// ── Constants ────────────────────────────────────────────────

const SERVICES = [
  { id: 'Pallet Rack Installation',     desc: 'New rack systems — single bays to 200K sq ft builds' },
  { id: 'Warehouse Relocation',         desc: 'Full tear-down, transport & reinstallation' },
  { id: 'Rack Repair & Modifications',  desc: 'ANSI-compliant repairs, upgrades & reconfigs' },
  { id: 'Mezzanine Installation',       desc: 'Structural platforms to double your usable space' },
  { id: 'Conveyor Systems',             desc: 'Powered conveyor installation & integration' },
  { id: 'Tear-Down & Reinstallation',   desc: 'Safe disassembly and reinstall at new locations' },
  { id: 'Material Handling Systems',    desc: 'End-to-end material flow design & installation' },
];

const SIZES = [
  'Under 10,000 sq ft',
  '10,000 – 50,000 sq ft',
  '50,000 – 100,000 sq ft',
  '100,000 – 250,000 sq ft',
  '250,000+ sq ft',
  "I'm not sure",
];

const TIMELINES = [
  { label: 'Emergency',  sub: 'Need help ASAP' },
  { label: '1–4 Weeks',  sub: 'Very soon' },
  { label: '1–3 Months', sub: 'Planning stage' },
  { label: '3+ Months',  sub: 'Future project' },
  { label: 'Flexible',   sub: 'No hard deadline' },
];

const BUDGETS = [
  'Under $10,000',
  '$10,000 – $25,000',
  '$25,000 – $50,000',
  '$50,000 – $100,000',
  '$100,000 – $250,000',
  '$250,000+',
  'Prefer to discuss',
];

const STEP_LABELS = ['Service', 'Project', 'Budget', 'Contact'];

// ── Types ────────────────────────────────────────────────────

type Errors = Record<string, string>;

// ── Validation ───────────────────────────────────────────────

function validate(step: number, f: Record<string, string>): Errors {
  const e: Errors = {};
  if (step === 1 && !f.service)         e.service  = 'Please select a service.';
  if (step === 2) {
    if (!f.city.trim())                  e.city     = 'City is required.';
    if (!f.state.trim())                 e.state    = 'State is required.';
    if (!f.size)                         e.size     = 'Please select a facility size.';
    if (!f.timeline)                     e.timeline = 'Please select a timeline.';
  }
  if (step === 3 && !f.budget)          e.budget   = 'Please select a budget range.';
  if (step === 4) {
    if (!f.name.trim())                  e.name     = 'Name is required.';
    if (!f.email.trim())                 e.email    = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email address.';
    if (!f.phone.trim())                 e.phone    = 'Phone number is required.';
  }
  return e;
}

// ── Sub-components ────────────────────────────────────────────

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p class="qw-field-error">{msg}</p>;
}

function Step1({ f, setF, errors }: { f: Record<string, string>; setF: (k: string, v: string) => void; errors: Errors }) {
  return (
    <div class="qw-step">
      <div class="qw-step-header">
        <h2 class="qw-step-title">What service do you need?</h2>
        <p class="qw-step-sub">Select the type of work you're looking for. We handle everything in-house.</p>
      </div>
      <div class="qw-service-grid">
        {SERVICES.map(svc => (
          <button
            key={svc.id}
            type="button"
            class={`qw-service-card${f.service === svc.id ? ' selected' : ''}`}
            onClick={() => setF('service', svc.id)}
            aria-pressed={f.service === svc.id}
          >
            <span class="qw-svc-check" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span class="qw-svc-name">{svc.id}</span>
            <span class="qw-svc-desc">{svc.desc}</span>
          </button>
        ))}
      </div>
      <ErrorMsg msg={errors.service} />
    </div>
  );
}

function Step2({ f, setF, errors }: { f: Record<string, string>; setF: (k: string, v: string) => void; errors: Errors }) {
  return (
    <div class="qw-step">
      <div class="qw-step-header">
        <h2 class="qw-step-title">Tell us about your project</h2>
        <p class="qw-step-sub">Location, facility size, and how soon you need it done.</p>
      </div>

      <div class="qw-row-2">
        <div class="qw-field">
          <label class="field-label">City <span class="qw-req" aria-hidden="true">*</span></label>
          <input
            class={`field-input${errors.city ? ' qw-input-error' : ''}`}
            type="text"
            value={f.city}
            onInput={(e) => setF('city', (e.target as HTMLInputElement).value)}
            placeholder="Chicago"
            autocomplete="address-level2"
          />
          <ErrorMsg msg={errors.city} />
        </div>
        <div class="qw-field">
          <label class="field-label">State <span class="qw-req" aria-hidden="true">*</span></label>
          <input
            class={`field-input${errors.state ? ' qw-input-error' : ''}`}
            type="text"
            value={f.state}
            onInput={(e) => setF('state', (e.target as HTMLInputElement).value)}
            placeholder="IL"
            maxLength={2}
            autocomplete="address-level1"
          />
          <ErrorMsg msg={errors.state} />
        </div>
      </div>

      <div class="qw-field">
        <label class="field-label">Facility Size <span class="qw-req" aria-hidden="true">*</span></label>
        <div class="qw-chip-group">
          {SIZES.map(s => (
            <button
              key={s}
              type="button"
              class={`qw-chip${f.size === s ? ' selected' : ''}`}
              onClick={() => setF('size', s)}
              aria-pressed={f.size === s}
            >{s}</button>
          ))}
        </div>
        <ErrorMsg msg={errors.size} />
      </div>

      <div class="qw-field">
        <label class="field-label">Timeline <span class="qw-req" aria-hidden="true">*</span></label>
        <div class="qw-chip-group">
          {TIMELINES.map(t => (
            <button
              key={t.label}
              type="button"
              class={`qw-chip qw-chip-stacked${f.timeline === t.label ? ' selected' : ''}`}
              onClick={() => setF('timeline', t.label)}
              aria-pressed={f.timeline === t.label}
            >
              <span class="qw-chip-main">{t.label}</span>
              <span class="qw-chip-sub">{t.sub}</span>
            </button>
          ))}
        </div>
        <ErrorMsg msg={errors.timeline} />
      </div>
    </div>
  );
}

function Step3({ f, setF, errors }: { f: Record<string, string>; setF: (k: string, v: string) => void; errors: Errors }) {
  return (
    <div class="qw-step">
      <div class="qw-step-header">
        <h2 class="qw-step-title">What's your estimated budget?</h2>
        <p class="qw-step-sub">This helps us scope the right solution. No commitment required.</p>
      </div>
      <div class="qw-budget-grid">
        {BUDGETS.map(b => (
          <button
            key={b}
            type="button"
            class={`qw-budget-card${f.budget === b ? ' selected' : ''}`}
            onClick={() => setF('budget', b)}
            aria-pressed={f.budget === b}
          >
            <span class="qw-budget-check" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            {b}
          </button>
        ))}
      </div>
      <ErrorMsg msg={errors.budget} />
    </div>
  );
}

function Step4({ f, setF, errors }: { f: Record<string, string>; setF: (k: string, v: string) => void; errors: Errors }) {
  return (
    <div class="qw-step">
      <div class="qw-step-header">
        <h2 class="qw-step-title">Who should we contact?</h2>
        <p class="qw-step-sub">John will personally reach out within 4 business hours.</p>
      </div>

      <div class="qw-row-2">
        <div class="qw-field">
          <label class="field-label">Full Name <span class="qw-req" aria-hidden="true">*</span></label>
          <input
            class={`field-input${errors.name ? ' qw-input-error' : ''}`}
            type="text"
            value={f.name}
            onInput={(e) => setF('name', (e.target as HTMLInputElement).value)}
            placeholder="John Smith"
            autocomplete="name"
          />
          <ErrorMsg msg={errors.name} />
        </div>
        <div class="qw-field">
          <label class="field-label">Company <span class="qw-optional">(optional)</span></label>
          <input
            class="field-input"
            type="text"
            value={f.company}
            onInput={(e) => setF('company', (e.target as HTMLInputElement).value)}
            placeholder="Acme Warehousing Inc."
            autocomplete="organization"
          />
        </div>
      </div>

      <div class="qw-row-2">
        <div class="qw-field">
          <label class="field-label">Email <span class="qw-req" aria-hidden="true">*</span></label>
          <input
            class={`field-input${errors.email ? ' qw-input-error' : ''}`}
            type="email"
            value={f.email}
            onInput={(e) => setF('email', (e.target as HTMLInputElement).value)}
            placeholder="john@company.com"
            autocomplete="email"
          />
          <ErrorMsg msg={errors.email} />
        </div>
        <div class="qw-field">
          <label class="field-label">Phone <span class="qw-req" aria-hidden="true">*</span></label>
          <input
            class={`field-input${errors.phone ? ' qw-input-error' : ''}`}
            type="tel"
            value={f.phone}
            onInput={(e) => setF('phone', (e.target as HTMLInputElement).value)}
            placeholder="(630) 555-0100"
            autocomplete="tel"
          />
          <ErrorMsg msg={errors.phone} />
        </div>
      </div>

      <div class="qw-field">
        <label class="field-label">Additional Notes <span class="qw-optional">(optional)</span></label>
        <textarea
          class="field-input qw-textarea"
          rows={3}
          value={f.notes}
          onInput={(e) => setF('notes', (e.target as HTMLTextAreaElement).value)}
          placeholder="Tell us more — rack type, current layout, special requirements..."
        />
      </div>
    </div>
  );
}

function SuccessScreen({ name, service }: { name: string; service: string }) {
  return (
    <div class="qw-success">
      <div class="qw-success-icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 class="qw-success-title">Request Received!</h2>
      <p class="qw-success-body">
        Thank you, <strong>{name}</strong>. John will personally review your <strong>{service}</strong> request and contact you within 4 business hours.
      </p>
      <div class="qw-success-steps">
        {[
          { n: '1', t: 'Request reviewed', b: 'John personally reads every submission.' },
          { n: '2', t: 'John contacts you', b: 'Direct call or email to discuss scope.' },
          { n: '3', t: 'Free site assessment', b: 'Scheduled for qualifying projects.' },
        ].map(s => (
          <div key={s.n} class="qw-success-step">
            <span class="qw-success-step-n">{s.n}</span>
            <div>
              <p class="qw-success-step-title">{s.t}</p>
              <p class="qw-success-step-body">{s.b}</p>
            </div>
          </div>
        ))}
      </div>
      <div class="qw-success-actions">
        <a href="/" class="qw-btn-back">Back to Home</a>
        <a href="/services/" class="qw-btn-next">
          View Our Services
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────

export function QuoteWizard() {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState<'fwd' | 'bck'>('fwd');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [fields, setFieldsRaw] = useState<Record<string, string>>({
    service: '', city: '', state: '', size: '', timeline: '',
    budget: '', name: '', company: '', email: '', phone: '', notes: '',
  });

  const setF = (k: string, v: string) => {
    setFieldsRaw(prev => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors(prev => { const next = { ...prev }; delete next[k]; return next; });
  };

  const goNext = () => {
    const e = validate(step, fields);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setDir('fwd');
    setStep(s => Math.min(s + 1, 4) as 1 | 2 | 3 | 4);
  };

  const goBack = () => {
    setErrors({});
    setDir('bck');
    setStep(s => Math.max(s - 1, 1) as 1 | 2 | 3 | 4);
  };

  const submit = async () => {
    const e = validate(4, fields);
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    setSubmitError('');
    try {
      const apiBase = (import.meta as { env?: { PUBLIC_ADMIN_URL?: string } }).env?.PUBLIC_ADMIN_URL ?? '';
      const endpoint = `${apiBase}/api/leads`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service:  fields.service,
          city:     fields.city,
          state:    fields.state,
          size:     fields.size,
          timeline: fields.timeline,
          budget:   fields.budget,
          name:     fields.name,
          company:  fields.company,
          email:    fields.email,
          phone:    fields.phone,
          notes:    fields.notes,
        }),
      });
      if (res.status === 201) {
        setSubmitted(true);
      } else {
        setSubmitError('Submission failed. Please try again or call 630-363-7251.');
      }
    } catch {
      setSubmitError('Connection error. Please try again or call us directly at 630-363-7251.');
    }
    setSubmitting(false);
  };

  if (submitted) return <SuccessScreen name={fields.name} service={fields.service} />;

  const pct = ((step - 1) / (STEP_LABELS.length - 1)) * 100;

  return (
    <div class="qw-root">

      {/* Progress bar */}
      <div class="qw-progress-wrap">
        <div class="qw-progress-track">
          <div class="qw-progress-fill" style={`width: ${pct}%`} />
        </div>
        <div class="qw-progress-steps">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const done   = step > n;
            const active = step === n;
            return (
              <div key={label} class={`qw-prog-step${active ? ' active' : ''}${done ? ' done' : ''}`}>
                <div class="qw-prog-dot">
                  {done ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span>{n}</span>
                  )}
                </div>
                <span class="qw-prog-label">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content — key changes trigger remount + animation */}
      <div class={`qw-step-wrap qw-${dir}`} key={`step-${step}`}>
        {step === 1 && <Step1 f={fields} setF={setF} errors={errors} />}
        {step === 2 && <Step2 f={fields} setF={setF} errors={errors} />}
        {step === 3 && <Step3 f={fields} setF={setF} errors={errors} />}
        {step === 4 && <Step4 f={fields} setF={setF} errors={errors} />}
      </div>

      {/* Navigation */}
      <div class="qw-nav">
        <div class="qw-nav-left">
          {step > 1 && (
            <button class="qw-btn-back" type="button" onClick={goBack}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back
            </button>
          )}
        </div>
        <div class="qw-nav-right">
          <span class="qw-step-counter">{step} of {STEP_LABELS.length}</span>
          {step < 4 ? (
            <button class="qw-btn-next" type="button" onClick={goNext}>
              Continue
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button class="qw-btn-next" type="button" onClick={submit} disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Quote Request'}
              {!submitting && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
      {submitError && <p class="qw-submit-error" role="alert">{submitError}</p>}
    </div>
  );
}
