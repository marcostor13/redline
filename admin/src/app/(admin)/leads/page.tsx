import { connectDB } from '@/lib/mongodb';
import { Lead } from '@/lib/models/Lead';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  new:       'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  quoted:    'bg-purple-50 text-purple-700 border-purple-200',
  won:       'bg-green-50 text-green-700 border-green-200',
  lost:      'bg-[#fff5f5] text-[#ba0013] border-[#fecaca]',
};

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  await connectDB();
  const filter = status ? { status } : {};
  const leads = await Lead.find(filter).sort({ createdAt: -1 }).lean();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold font-display text-[#0a0e13]">Leads</h1>
        <p className="text-sm text-[#6b7280]">{leads.length} total</p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6">
        {['', 'new', 'contacted', 'quoted', 'won', 'lost'].map((s) => (
          <Link
            key={s || 'all'}
            href={s ? `/leads?status=${s}` : '/leads'}
            className={`px-3 py-1 text-xs font-medium border transition-colors capitalize ${
              status === s || (!status && s === '')
                ? 'bg-[#0a0e13] text-white border-[#0a0e13]'
                : 'bg-white text-[#374151] border-[#e5e7ea] hover:border-[#ba0013]'
            }`}
          >
            {s || 'All'}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-[#e5e7ea]">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f8f9] text-[#6b7280] text-xs uppercase tracking-wide">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Lead</th>
              <th className="px-6 py-3 text-left font-medium">Service</th>
              <th className="px-6 py-3 text-left font-medium">Location</th>
              <th className="px-6 py-3 text-left font-medium">Budget</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
              <th className="px-6 py-3 text-left font-medium">Date</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7ea]">
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[#9ca3af]">No leads found.</td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={String(lead._id)} className="hover:bg-[#f7f8f9]">
                <td className="px-6 py-4">
                  <p className="font-medium text-[#0a0e13]">{lead.name}</p>
                  <p className="text-xs text-[#9ca3af]">{lead.email}</p>
                </td>
                <td className="px-6 py-4 text-[#374151]">{lead.service}</td>
                <td className="px-6 py-4 text-[#374151]">{lead.city}, {lead.state}</td>
                <td className="px-6 py-4 text-[#374151]">{lead.budget || '—'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block border px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[lead.status] ?? ''}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-[#9ca3af] text-xs">
                  {new Date(lead.createdAt as unknown as string).toLocaleDateString('en-US')}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/leads/${lead._id}`} className="text-xs text-[#ba0013] hover:underline font-medium">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
