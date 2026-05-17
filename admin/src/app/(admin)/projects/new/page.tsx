'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Metric { label: string; value: string; }

const SERVICES = [
  'Pallet Rack Installation',
  'Warehouse Relocation',
  'Rack Repair & Modifications',
  'Mezzanine Installation',
  'Conveyor Systems',
  'Tear-Down & Reinstallation',
  'Material Handling Systems',
];

const SERVICE_SLUGS: Record<string, string> = {
  'Pallet Rack Installation': 'pallet-rack-installation',
  'Warehouse Relocation': 'warehouse-relocation',
  'Rack Repair & Modifications': 'rack-repair-modifications',
  'Mezzanine Installation': 'mezzanine-installation',
  'Conveyor Systems': 'conveyor-systems',
  'Tear-Down & Reinstallation': 'tear-down-reinstallation',
  'Material Handling Systems': 'material-handling-systems',
};

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<Metric[]>([{ label: '', value: '' }]);
  const [tags, setTags] = useState('');
  const [fields, setFields] = useState({
    slug: '', title: '', service: SERVICES[0], location: '', state: '',
    year: new Date().getFullYear(), scope: '', img: '', imgAlt: '',
    challenge: '', solution: '', results: '', published: false,
  });

  function setF(key: string, value: unknown) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function addMetric() { setMetrics((m) => [...m, { label: '', value: '' }]); }
  function removeMetric(i: number) { setMetrics((m) => m.filter((_, idx) => idx !== i)); }
  function setMetric(i: number, key: 'label' | 'value', val: string) {
    setMetrics((m) => m.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  }

  function slugify(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      ...fields,
      serviceSlug: SERVICE_SLUGS[fields.service] ?? slugify(fields.service),
      year: Number(fields.year),
      metrics: metrics.filter((m) => m.label || m.value),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      router.push('/projects');
      router.refresh();
    } else {
      const data = await res.json();
      setError(JSON.stringify(data.error));
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/projects" className="text-xs text-[#9ca3af] hover:text-[#ba0013]">← Projects</Link>
        <span className="text-[#e5e7ea]">/</span>
        <h1 className="text-2xl font-bold font-display text-[#0a0e13]">New Project</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-[#e5e7ea] p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#6b7280]">Basic Info</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Title" required>
              <input required value={fields.title} onChange={(e) => { setF('title', e.target.value); setF('slug', slugify(e.target.value)); }} className={input} />
            </Field>
            <Field label="Slug" required>
              <input required value={fields.slug} onChange={(e) => setF('slug', e.target.value)} className={input} />
            </Field>
          </div>

          <Field label="Service">
            <select value={fields.service} onChange={(e) => setF('service', e.target.value)} className={input}>
              {SERVICES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Field label="Location (city)"><input value={fields.location} onChange={(e) => setF('location', e.target.value)} className={input} /></Field>
            </div>
            <Field label="State (abbr)"><input value={fields.state} maxLength={2} onChange={(e) => setF('state', e.target.value.toUpperCase())} className={input} /></Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Year"><input type="number" value={fields.year} onChange={(e) => setF('year', e.target.value)} className={input} /></Field>
            <Field label="Scope (short summary)"><input value={fields.scope} onChange={(e) => setF('scope', e.target.value)} className={input} /></Field>
          </div>
        </div>

        <div className="bg-white border border-[#e5e7ea] p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#6b7280]">Image</h2>
          <Field label="Image URL" required>
            <input required type="url" value={fields.img} onChange={(e) => setF('img', e.target.value)} className={input} placeholder="https://..." />
          </Field>
          <Field label="Image Alt Text">
            <input value={fields.imgAlt} onChange={(e) => setF('imgAlt', e.target.value)} className={input} />
          </Field>
        </div>

        <div className="bg-white border border-[#e5e7ea] p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#6b7280]">Metrics</h2>
          {metrics.map((m, i) => (
            <div key={i} className="flex gap-2 items-end">
              <Field label="Label" className="flex-1">
                <input value={m.label} onChange={(e) => setMetric(i, 'label', e.target.value)} className={input} placeholder="Pallets installed" />
              </Field>
              <Field label="Value" className="flex-1">
                <input value={m.value} onChange={(e) => setMetric(i, 'value', e.target.value)} className={input} placeholder="1,200" />
              </Field>
              {metrics.length > 1 && (
                <button type="button" onClick={() => removeMetric(i)} className="mb-0.5 text-xs text-[#9ca3af] hover:text-[#ba0013] pb-2">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addMetric} className="text-xs text-[#ba0013] hover:underline">+ Add metric</button>
        </div>

        <div className="bg-white border border-[#e5e7ea] p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#6b7280]">Story</h2>
          <Field label="Challenge"><textarea rows={3} value={fields.challenge} onChange={(e) => setF('challenge', e.target.value)} className={`${input} resize-none`} /></Field>
          <Field label="Solution"><textarea rows={3} value={fields.solution} onChange={(e) => setF('solution', e.target.value)} className={`${input} resize-none`} /></Field>
          <Field label="Results"><textarea rows={3} value={fields.results} onChange={(e) => setF('results', e.target.value)} className={`${input} resize-none`} /></Field>
        </div>

        <div className="bg-white border border-[#e5e7ea] p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#6b7280]">Publishing</h2>
          <Field label="Tags (comma-separated)">
            <input value={tags} onChange={(e) => setTags(e.target.value)} className={input} placeholder="chicago, pallet-rack, freezer" />
          </Field>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={fields.published} onChange={(e) => setF('published', e.target.checked)} />
            Published
          </label>
        </div>

        {error && <p className="text-sm text-[#ba0013] bg-[#fff5f5] border border-[#fecaca] p-3">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-[#ba0013] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#93000d] transition-colors disabled:opacity-50">
            {saving ? 'Creating...' : 'Create Project'}
          </button>
          <Link href="/projects" className="px-6 py-2.5 text-sm border border-[#e5e7ea] text-[#374151] hover:border-[#ba0013] transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

const input = 'w-full border border-[#e5e7ea] px-3 py-2 text-sm focus:outline-none focus:border-[#ba0013] transition-colors';

function Field({ label, required, children, className }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-[#374151] mb-1">
        {label}{required && <span className="text-[#ba0013] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
