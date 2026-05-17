'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ILead, LeadStatus } from '@/types';

const STATUSES: LeadStatus[] = ['new', 'contacted', 'quoted', 'won', 'lost'];

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<ILead | null>(null);
  const [status, setStatus] = useState<LeadStatus>('new');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/admin/api/leads/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setLead(data);
        setStatus(data.status);
        setAdminNotes(data.adminNotes ?? '');
      });
  }, [id]);

  async function save() {
    setSaving(true);
    await fetch(`/admin/api/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes }),
    });
    setSaving(false);
  }

  async function deleteLead() {
    if (!confirm('Delete this lead? This cannot be undone.')) return;
    setDeleting(true);
    await fetch(`/admin/api/leads/${id}`, { method: 'DELETE' });
    router.push('/leads');
    router.refresh();
  }

  if (!lead) return <div className="p-8 text-[#9ca3af]">Loading...</div>;

  const fields = [
    ['Service', lead.service],
    ['Location', `${lead.city}, ${lead.state}`],
    ['Facility Size', lead.size || '—'],
    ['Timeline', lead.timeline || '—'],
    ['Budget', lead.budget || '—'],
    ['Company', lead.company || '—'],
    ['Email', lead.email],
    ['Phone', lead.phone || '—'],
  ];

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/leads" className="text-xs text-[#9ca3af] hover:text-[#ba0013]">← Leads</Link>
        <span className="text-[#e5e7ea]">/</span>
        <h1 className="text-2xl font-bold font-display text-[#0a0e13]">{lead.name}</h1>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Lead info */}
        <div className="bg-white border border-[#e5e7ea] p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#6b7280] mb-4">Lead Info</h2>
          <dl className="space-y-3">
            {fields.map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <dt className="text-[#6b7280]">{label}</dt>
                <dd className="font-medium text-[#0a0e13] text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Admin controls */}
        <div className="bg-white border border-[#e5e7ea] p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#6b7280] mb-4">Admin</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#374151] mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              className="w-full border border-[#e5e7ea] px-3 py-2 text-sm focus:outline-none focus:border-[#ba0013]"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#374151] mb-1">Admin Notes</label>
            <textarea
              rows={4}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full border border-[#e5e7ea] px-3 py-2 text-sm focus:outline-none focus:border-[#ba0013] resize-none"
              placeholder="Internal notes..."
            />
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-[#ba0013] text-white py-2 text-sm font-semibold hover:bg-[#93000d] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {lead.notes && (
        <div className="bg-white border border-[#e5e7ea] p-6 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#6b7280] mb-3">Client Notes</h2>
          <p className="text-sm text-[#374151] whitespace-pre-wrap">{lead.notes}</p>
        </div>
      )}

      <button
        onClick={deleteLead}
        disabled={deleting}
        className="text-xs text-[#9ca3af] hover:text-[#ba0013] transition-colors"
      >
        {deleting ? 'Deleting...' : 'Delete this lead'}
      </button>
    </div>
  );
}
